// ============================================================================
// DISCOVERY MATCH ROUTES - Phase 1 Sprint 1.1
// ============================================================================
// User-centric discovery matching system
// Matches users with BOTH other users AND organizations
// ============================================================================

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in discovery_routes.tsx');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
}

// Create clients immediately
const supabaseAuth = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
const supabaseService = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Service client for privileged operations
function createServiceClient() {
  if (!supabaseService) {
    throw new Error('Supabase service client not initialized');
  }
  return supabaseService;
}

// Create Hono app for discovery routes
const discovery = new Hono();

// ============================================================================
// MATCHING ALGORITHM V1
// ============================================================================
// Matches users with BOTH other users AND organizations
// Simple keyword + category + location matching
// Future: ML-based matching in Phase 1.5
// ============================================================================

interface MatchCriteria {
  requestText: string;
  category: string;
  locationPreference: string;
  userInterests: string[];
  userLocation?: { city?: string; country?: string };
  matchPreference?: 'individuals' | 'companies' | 'both';
  requestingUserId: string; // Don't match user with themselves
}

interface MatchResult {
  matchType: 'user' | 'organization';
  matchedUserId?: string;
  matchedOrganizationId?: string;
  matchScore: number;
  matchRank: number;
  scoreBreakdown: {
    categoryMatch: number;
    locationMatch: number;
    interestMatch: number;
    trustScore: number;
    activityLevel: number;
  };
  matchReason: string;
}

async function generateMatches(
  criteria: MatchCriteria,
  supabase: any
): Promise<MatchResult[]> {
  const allMatches: MatchResult[] = [];
  const matchPreference = criteria.matchPreference || 'both';

  // ============================================================================
  // MATCH WITH ORGANIZATIONS (if preference allows)
  // ============================================================================
  if (matchPreference === 'companies' || matchPreference === 'both') {
    const { data: orgs, error: orgError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        category_name,
        location,
        country,
        created_at
      `)
      .eq('is_published', true)
      .limit(50);

    if (orgError) {
      console.error('Error fetching companies for matching:', orgError);
    } else if (orgs && orgs.length > 0) {
      const orgMatches = orgs.map((org: any) => {
        let categoryScore = 0;
        let locationScore = 0;
        let interestScore = 0;
        let trustScorePoints = 5;
        let activityScore = 0;

        // 1. Category match (40 points max)
        if (org.category_name && criteria.category) {
          if (org.category_name.toLowerCase() === criteria.category.toLowerCase()) {
            categoryScore = 40;
          } else if (org.category_name.toLowerCase().includes(criteria.category.toLowerCase())) {
            categoryScore = 20;
          }
        }

        // 2. Location match (25 points max)
        if (criteria.locationPreference === 'local' || criteria.locationPreference === 'regional') {
          if (org.country && criteria.userLocation?.country) {
            if (org.country.toLowerCase() === criteria.userLocation.country.toLowerCase()) {
              locationScore = 25;
            }
          }
        } else if (criteria.locationPreference === 'national') {
          if (org.country && criteria.userLocation?.country) {
            if (org.country.toLowerCase() === criteria.userLocation.country.toLowerCase()) {
              locationScore = 20;
            } else {
              locationScore = 10;
            }
          }
        } else {
          locationScore = 15;
        }

        // 3. Interest/keyword match (20 points max)
        const orgText = `${org.name} ${org.description || ''}`.toLowerCase();
        const requestText = criteria.requestText.toLowerCase();
        
        const keywords = requestText.split(/\s+/).filter((w: string) => w.length > 3);
        const matchingKeywords = keywords.filter((kw: string) => orgText.includes(kw));
        interestScore = Math.min(20, matchingKeywords.length * 5);

        if (criteria.userInterests && criteria.userInterests.length > 0) {
          const hasMatchingInterest = criteria.userInterests.some((interest: string) =>
            orgText.includes(interest.toLowerCase())
          );
          if (hasMatchingInterest) {
            interestScore += 10;
          }
        }
        interestScore = Math.min(20, interestScore);

        // 4. Activity level (5 points max)
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(org.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation < 90) {
          activityScore = 5;
        } else if (daysSinceCreation < 365) {
          activityScore = 3;
        } else {
          activityScore = 2;
        }

        const totalScore = categoryScore + locationScore + interestScore + trustScorePoints + activityScore;

        const reasons: string[] = [];
        if (categoryScore > 20) reasons.push('matches your category');
        if (locationScore > 15) reasons.push('located in your region');
        if (interestScore > 10) reasons.push('aligns with your interests');
        
        const matchReason = reasons.length > 0
          ? `This organization ${reasons.join(', ')}.`
          : 'This organization may be relevant to your request.';

        return {
          matchType: 'organization' as const,
          matchedOrganizationId: org.id,
          matchScore: Math.round(totalScore * 100) / 100,
          scoreBreakdown: {
            categoryMatch: categoryScore,
            locationMatch: locationScore,
            interestMatch: interestScore,
            trustScore: trustScorePoints,
            activityLevel: activityScore,
          },
          matchReason,
          _orgName: org.name, // For debugging
        };
      });

      allMatches.push(...orgMatches);
    }
  }

  // ============================================================================
  // MATCH WITH USERS (if preference allows)
  // ============================================================================
  if (matchPreference === 'individuals' || matchPreference === 'both') {
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        display_name,
        bio,
        city,
        country,
        created_at,
        user_interests (
          interest
        )
      `)
      .neq('user_id', criteria.requestingUserId) // Don't match with self
      .limit(50);

    if (userError) {
      console.error('Error fetching users for matching:', userError);
    } else if (users && users.length > 0) {
      const userMatches = users.map((user: any) => {
        let categoryScore = 0;
        let locationScore = 0;
        let interestScore = 0;
        let trustScorePoints = 5;
        let activityScore = 0;

        // 1. Category match (40 points max) - based on interests
        const userInterests = user.user_interests?.map((i: any) => i.interest) || [];
        if (criteria.category && userInterests.length > 0) {
          const categoryMatch = userInterests.some((interest: string) =>
            interest.toLowerCase().includes(criteria.category.toLowerCase())
          );
          if (categoryMatch) {
            categoryScore = 30;
          }
        }

        // 2. Location match (25 points max)
        if (criteria.locationPreference === 'local' || criteria.locationPreference === 'regional') {
          if (user.country && criteria.userLocation?.country) {
            if (user.country.toLowerCase() === criteria.userLocation.country.toLowerCase()) {
              locationScore = 25;
              // Bonus for same city
              if (user.city && criteria.userLocation?.city) {
                if (user.city.toLowerCase() === criteria.userLocation.city.toLowerCase()) {
                  locationScore = 30;
                }
              }
            }
          }
        } else if (criteria.locationPreference === 'national') {
          if (user.country && criteria.userLocation?.country) {
            if (user.country.toLowerCase() === criteria.userLocation.country.toLowerCase()) {
              locationScore = 20;
            } else {
              locationScore = 10;
            }
          }
        } else {
          locationScore = 15;
        }

        // 3. Interest/keyword match (20 points max)
        const userText = `${user.display_name || ''} ${user.bio || ''} ${userInterests.join(' ')}`.toLowerCase();
        const requestText = criteria.requestText.toLowerCase();
        
        const keywords = requestText.split(/\s+/).filter((w: string) => w.length > 3);
        const matchingKeywords = keywords.filter((kw: string) => userText.includes(kw));
        interestScore = Math.min(20, matchingKeywords.length * 5);

        // Shared interests bonus
        if (criteria.userInterests && criteria.userInterests.length > 0) {
          const sharedInterests = userInterests.filter((interest: string) =>
            criteria.userInterests.some((ui: string) => ui.toLowerCase() === interest.toLowerCase())
          );
          if (sharedInterests.length > 0) {
            interestScore += sharedInterests.length * 5;
          }
        }
        interestScore = Math.min(25, interestScore);

        // 4. Activity level (5 points max)
        const daysSinceJoined = Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceJoined < 90) {
          activityScore = 5;
        } else if (daysSinceJoined < 365) {
          activityScore = 3;
        } else {
          activityScore = 2;
        }

        const totalScore = categoryScore + locationScore + interestScore + trustScorePoints + activityScore;

        const reasons: string[] = [];
        if (interestScore > 10) reasons.push('shares similar interests');
        if (locationScore > 20) reasons.push('located nearby');
        if (categoryScore > 20) reasons.push('matches your needs');
        
        const matchReason = reasons.length > 0
          ? `This person ${reasons.join(', ')}.`
          : 'This person may be relevant to your request.';

        return {
          matchType: 'user' as const,
          matchedUserId: user.user_id,
          matchScore: Math.round(totalScore * 100) / 100,
          scoreBreakdown: {
            categoryMatch: categoryScore,
            locationMatch: locationScore,
            interestMatch: interestScore,
            trustScore: trustScorePoints,
            activityLevel: activityScore,
          },
          matchReason,
          _userName: user.display_name, // For debugging
        };
      });

      allMatches.push(...userMatches);
    }
  }

  // ============================================================================
  // SORT AND RETURN TOP MATCHES
  // ============================================================================
  
  // Sort all matches by score descending
  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  // Take top 5 matches with score > 20
  const topMatches = allMatches
    .filter((match) => match.matchScore > 20)
    .slice(0, 5)
    .map((match, index) => ({
      ...match,
      matchRank: index + 1,
    }));

  return topMatches;
}

// ============================================================================
// ROUTE: POST /discovery/request
// ============================================================================
// Create a new discovery request (NO auto-matching - admin will match manually)
// ============================================================================

discovery.post('/request', async (c) => {
  try {
    // Check if supabaseAuth is initialized
    if (!supabaseAuth) {
      console.error('❌ supabaseAuth is not initialized');
      return c.json({ error: 'Server configuration error', details: 'Authentication client not initialized' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const body = await c.req.json();
    const { requestText, category, locationPreference, matchPreference } = body;

    console.log('🎯 Discovery request received:', { requestText, category, locationPreference, matchPreference });

    // Validate request
    if (!requestText || !category || !locationPreference) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      return c.json({ error: 'Unauthorized', details: userError?.message }, 401);
    }

    // Create service client for database operations
    const serviceSupabase = createServiceClient();

    // Create discovery request record with status 'pending_admin_review'
    const { data: request, error: requestError } = await serviceSupabase
      .from('discovery_requests')
      .insert({
        user_id: user.id,
        request_text: requestText,
        category,
        location_preference: locationPreference,
        match_preference: matchPreference || 'both',
        status: 'pending_admin_review', // Admin will manually match
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating discovery request:', requestError);
      return c.json({ error: 'Failed to create request', details: requestError.message }, 500);
    }

    console.log('✅ Discovery request created (pending admin review):', request.id);

    return c.json({
      success: true,
      requestId: request.id,
      status: 'pending_admin_review',
      message: 'Your discovery request has been submitted and is pending admin review.',
    });
  } catch (error: any) {
    console.error('Error in POST /discovery/request:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /discovery/matches/:requestId
// ============================================================================
// Get matched users AND organizations for a discovery request
// ============================================================================

discovery.get('/matches/:requestId', async (c) => {
  try {
    if (!supabaseAuth) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const requestId = c.req.param('requestId');

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client for queries
    const serviceSupabase = createServiceClient();

    // Verify user owns this request
    const { data: request, error: requestError } = await serviceSupabase
      .from('discovery_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request || request.user_id !== user.id) {
      return c.json({ error: 'Request not found or unauthorized' }, 404);
    }

    // Fetch match results with BOTH user and org details
    const { data: matchResults, error: matchError } = await serviceSupabase
      .from('discovery_match_results')
      .select(`
        *,
        matched_company:companies!matched_organization_id(
          id,
          name,
          description,
          category_name,
          logo_url,
          location,
          country,
          website
        ),
        matched_user:user_profiles!matched_user_id(
          user_id,
          display_name,
          bio,
          avatar_url,
          city,
          country
        )
      `)
      .eq('request_id', requestId)
      .order('match_rank', { ascending: true });

    if (matchError) {
      console.error('Error fetching matches:', matchError);
      return c.json({ error: 'Failed to fetch matches' }, 500);
    }

    // Transform the results to include the correct match data based on type
    const matches = matchResults?.map((match: any) => ({
      id: match.id,
      matchType: match.match_type,
      matchScore: match.match_score,
      matchRank: match.match_rank,
      matchReason: match.match_reason,
      scoreBreakdown: match.score_breakdown,
      viewedAt: match.viewed_at,
      selectedAt: match.selected_at,
      // Include the matched entity (either user or organization)
      matchedEntity: match.match_type === 'user' ? match.matched_user : match.matched_company,
    })) || [];

    return c.json({ matches });
  } catch (error) {
    console.error('Error in GET /discovery/matches/:requestId:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: POST /discovery/matches/:requestId/mark-viewed
// ============================================================================
// Mark all matches for a request as viewed (removes notification)
// ============================================================================

discovery.post('/matches/:requestId/mark-viewed', async (c) => {
  try {
    if (!supabaseAuth) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const requestId = c.req.param('requestId');

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client
    const serviceSupabase = createServiceClient();

    // Verify user owns this request
    const { data: request, error: requestError } = await serviceSupabase
      .from('discovery_requests')
      .select('user_id, has_new_matches')
      .eq('id', requestId)
      .single();

    if (requestError || !request || request.user_id !== user.id) {
      return c.json({ error: 'Request not found or unauthorized' }, 404);
    }

    // Mark request as viewed (remove notification)
    const { error: updateError } = await serviceSupabase
      .from('discovery_requests')
      .update({ has_new_matches: false })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error marking matches as viewed:', updateError);
      return c.json({ error: 'Failed to mark matches as viewed' }, 500);
    }

    // Update viewed_at timestamp for all recommendations
    const { error: viewedError } = await serviceSupabase
      .from('discovery_recommendations')
      .update({ viewed_at: new Date().toISOString() })
      .eq('request_id', requestId)
      .is('viewed_at', null);

    if (viewedError) {
      console.error('Error updating viewed_at:', viewedError);
    }

    console.log('✅ Matches marked as viewed for request:', requestId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in POST /discovery/matches/:requestId/mark-viewed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: POST /discovery/recommendation/:recommendationId/action
// ============================================================================
// Perform action on a recommendation (save, archive, delete)
// ============================================================================

discovery.post('/recommendation/:recommendationId/action', async (c) => {
  try {
    if (!supabaseAuth) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const recommendationId = c.req.param('recommendationId');
    const body = await c.req.json();
    const { action } = body; // 'save', 'archive', 'delete'

    if (!action || !['save', 'archive', 'delete'].includes(action)) {
      return c.json({ error: 'Invalid action. Must be save, archive, or delete' }, 400);
    }

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client
    const serviceSupabase = createServiceClient();

    // Verify user owns the request associated with this recommendation
    const { data: recommendation, error: recError } = await serviceSupabase
      .from('discovery_recommendations')
      .select('request_id, discovery_requests!inner(user_id)')
      .eq('id', recommendationId)
      .single();

    if (recError || !recommendation || (recommendation as any).discovery_requests.user_id !== user.id) {
      return c.json({ error: 'Recommendation not found or unauthorized' }, 404);
    }

    // Perform the action
    if (action === 'delete') {
      const { error: deleteError } = await serviceSupabase
        .from('discovery_recommendations')
        .delete()
        .eq('id', recommendationId);

      if (deleteError) {
        console.error('Error deleting recommendation:', deleteError);
        return c.json({ error: 'Failed to delete recommendation' }, 500);
      }
    } else {
      const updates: any = {};
      if (action === 'save') {
        updates.saved = true;
      } else if (action === 'archive') {
        updates.archived = true;
      }

      const { error: updateError } = await serviceSupabase
        .from('discovery_recommendations')
        .update(updates)
        .eq('id', recommendationId);

      if (updateError) {
        console.error('Error updating recommendation:', updateError);
        return c.json({ error: `Failed to ${action} recommendation` }, 500);
      }
    }

    console.log(`✅ Recommendation ${action}d:`, recommendationId);
    return c.json({ success: true, action });
  } catch (error) {
    console.error('Error in POST /discovery/recommendation/:recommendationId/action:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET /discovery/request/:requestId/recommendations
// ============================================================================
// Get admin-curated recommendations for a discovery request
// ============================================================================

discovery.get('/request/:requestId/recommendations', async (c) => {
  try {
    if (!supabaseAuth) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const requestId = c.req.param('requestId');

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client for queries
    const serviceSupabase = createServiceClient();

    // Verify user owns this request
    const { data: request, error: requestError } = await serviceSupabase
      .from('discovery_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single();

    if (requestError || !request || request.user_id !== user.id) {
      return c.json({ error: 'Request not found or unauthorized' }, 404);
    }

    // Fetch recommendations
    const { data: recommendations, error: recError } = await serviceSupabase
      .from('discovery_recommendations')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (recError) {
      console.error('Error fetching recommendations:', recError);
      return c.json({ error: 'Failed to fetch recommendations' }, 500);
    }

    // Fetch entity details for each recommendation
    const recommendationsWithEntities = await Promise.all(
      (recommendations || []).map(async (rec: any) => {
        let entity = null;

        if (rec.type === 'user' && rec.user_id) {
          const { data } = await serviceSupabase
            .from('user_profiles')
            .select('user_id, display_name, avatar_url, bio, city, country')
            .eq('user_id', rec.user_id)
            .single();
          entity = data;
        } else if (rec.type === 'company' && rec.company_id) {
          const { data } = await serviceSupabase
            .from('companies')
            .select('id, name, description, category_name, logo_url, location, country, website')
            .eq('id', rec.company_id)
            .single();
          entity = data;
        } else if (rec.type === 'place' && rec.place_id) {
          const { data } = await serviceSupabase
            .from('places')
            .select('*')
            .eq('id', rec.place_id)
            .single();
          entity = data;
        } else if (rec.type === 'article' && rec.article_id) {
          const { data } = await serviceSupabase
            .from('articles')
            .select('id, title, subtitle, image, category')
            .eq('id', rec.article_id)
            .single();
          entity = data;
        }

        return {
          id: rec.id,
          type: rec.type,
          entity_id: rec.user_id || rec.company_id || rec.place_id || rec.article_id,
          note: rec.note,
          created_at: rec.created_at,
          sent_at: rec.sent_at,
          entity,
        };
      })
    );

    return c.json({ 
      recommendations: recommendationsWithEntities,
      request_status: request.status,
    });
  } catch (error) {
    console.error('Error in GET /discovery/request/:requestId/recommendations:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET /discovery/my-requests
// ============================================================================
// Get all discovery requests for the authenticated user
// ============================================================================

discovery.get('/my-requests', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client for queries
    const serviceSupabase = createServiceClient();

    // Fetch user's requests
    const { data: requests, error: requestsError} = await serviceSupabase
      .from('discovery_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching discovery requests:', requestsError);
      return c.json({ error: 'Failed to fetch requests' }, 500);
    }

    // For each request, count the recommendations and check if any are new/unseen
    const requestsWithCounts = await Promise.all(
      (requests || []).map(async (request: any) => {
        // Count recommendations (admin-curated matches)
        const { data: recommendations } = await serviceSupabase
          .from('discovery_recommendations')
          .select('id, sent_at')
          .eq('request_id', request.id);

        const recommendationCount = recommendations?.length || 0;
        
        // Check if there are new recommendations (sent but not viewed)
        // We'll consider a recommendation "new" if it was sent after the last time user viewed
        const hasNewRecommendations = request.status === 'matched' && recommendationCount > 0;

        return {
          ...request,
          recommendationCount,
          hasNewRecommendations,
        };
      })
    );

    return c.json({ requests: requestsWithCounts });
  } catch (error) {
    console.error('Error in GET /discovery/my-requests:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: POST /discovery/match/:matchId/view
// ============================================================================
// Mark a match as viewed
// ============================================================================

discovery.post('/match/:matchId/view', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const matchId = c.req.param('matchId');

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client
    const serviceSupabase = createServiceClient();

    // Verify user owns the request for this match
    const { data: match, error: matchError } = await serviceSupabase
      .from('discovery_match_results')
      .select('request_id, discovery_requests!inner(user_id)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return c.json({ error: 'Match not found' }, 404);
    }

    // Update viewed_at timestamp
    const { error: updateError } = await serviceSupabase
      .from('discovery_match_results')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match view:', updateError);
      return c.json({ error: 'Failed to update match' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in POST /discovery/match/:matchId/view:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: POST /discovery/match/:matchId/select
// ============================================================================
// Mark a match as selected (user wants to connect)
// ============================================================================

discovery.post('/match/:matchId/select', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized', details: 'No access token provided' }, 401);
    }

    const matchId = c.req.param('matchId');

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Create service client
    const serviceSupabase = createServiceClient();

    // Verify user owns the request for this match
    const { data: match, error: matchError } = await serviceSupabase
      .from('discovery_match_results')
      .select('request_id, discovery_requests!inner(user_id)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return c.json({ error: 'Match not found' }, 404);
    }

    // Update selected_at timestamp
    const { error: updateError } = await serviceSupabase
      .from('discovery_match_results')
      .update({ selected_at: new Date().toISOString() })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match selection:', updateError);
      return c.json({ error: 'Failed to update match' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in POST /discovery/match/:matchId/select:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export the discovery router as default
export default discovery;