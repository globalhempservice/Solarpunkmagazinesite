// ============================================================================
// ADMIN DISCOVERY MATCH ROUTES - Phase 1 Sprint 1.2
// ============================================================================
// Admin routes for manually managing discovery requests and creating matches
// ============================================================================

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

// Helper middleware for routes (passed from main server)
export function setupAdminDiscoveryRoutes(app: any, requireAdmin: any) {

// ============================================================================
// ROUTE: GET /admin/discovery/stats
// ============================================================================
// Get comprehensive statistics for discovery requests (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/stats', requireAdmin, async (c: any) => {
  try {
    console.log('📊 Admin fetching discovery statistics');

    // Validate Supabase client
    if (!supabaseService) {
      console.error('❌ Supabase service client not initialized');
      return c.json({ error: 'Database connection not available' }, 500);
    }

    // Get all requests
    const { data: allRequests, error: requestsError } = await supabaseService
      .from('discovery_requests')
      .select(`
        id,
        request_text,
        category,
        location_preference,
        match_preference,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching requests for stats:', requestsError);
      return c.json({ error: 'Failed to fetch statistics', details: requestsError.message }, 500);
    }

    const requests = allRequests || [];
    console.log(`📊 Found ${requests.length} discovery requests`);

    // Get user profiles separately to avoid join issues
    const userIds = [...new Set(requests.map((r: any) => r.user_id))];
    const { data: userProfiles } = await supabaseService
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const userMap = new Map(
      (userProfiles || []).map((u: any) => [u.user_id, u])
    );

    // Calculate status breakdown
    const statusCounts = {
      pending_admin_review: 0,
      searching: 0,
      matched: 0,
      no_matches: 0,
      cancelled: 0,
    };

    requests.forEach((req: any) => {
      if (statusCounts.hasOwnProperty(req.status)) {
        statusCounts[req.status as keyof typeof statusCounts]++;
      }
    });

    // Category breakdown
    const categoryMap = new Map<string, number>();
    requests.forEach((req: any) => {
      const count = categoryMap.get(req.category) || 0;
      categoryMap.set(req.category, count + 1);
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Location breakdown
    const locationMap = new Map<string, number>();
    requests.forEach((req: any) => {
      const count = locationMap.get(req.location_preference) || 0;
      locationMap.set(req.location_preference, count + 1);
    });
    const locationBreakdown = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Match preference breakdown
    const matchPrefMap = new Map<string, number>();
    requests.forEach((req: any) => {
      const count = matchPrefMap.get(req.match_preference) || 0;
      matchPrefMap.set(req.match_preference, count + 1);
    });
    const matchPreferenceBreakdown = Array.from(matchPrefMap.entries())
      .map(([preference, count]) => ({ preference, count }))
      .sort((a, b) => b.count - a.count);

    // Requests over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateMap = new Map<string, number>();
    requests
      .filter((req: any) => new Date(req.created_at) >= thirtyDaysAgo)
      .forEach((req: any) => {
        const date = new Date(req.created_at).toISOString().split('T')[0];
        const count = dateMap.get(date) || 0;
        dateMap.set(date, count + 1);
      });

    const requestsOverTime = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent requests (last 10)
    const recentRequests = requests.slice(0, 10).map((req: any) => ({
      id: req.id,
      request_text: req.request_text,
      category: req.category,
      status: req.status,
      created_at: req.created_at,
      user: {
        display_name: userMap.get(req.user_id)?.display_name || 'Unknown User',
        avatar_url: userMap.get(req.user_id)?.avatar_url || null,
      },
    }));

    const stats = {
      totalRequests: requests.length,
      pendingRequests: statusCounts.pending_admin_review,
      searchingRequests: statusCounts.searching,
      matchedRequests: statusCounts.matched,
      noMatchesRequests: statusCounts.no_matches,
      cancelledRequests: statusCounts.cancelled,
      categoryBreakdown,
      locationBreakdown,
      matchPreferenceBreakdown,
      recentRequests,
      requestsOverTime,
    };

    console.log('✅ Discovery statistics compiled:', {
      totalRequests: stats.totalRequests,
      categories: categoryBreakdown.length,
      timeSeriesPoints: requestsOverTime.length,
    });

    return c.json({ stats });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/stats:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/requests
// ============================================================================
// Get all discovery requests with user details (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/requests', requireAdmin, async (c: any) => {
  try {
    const status = c.req.query('status'); // Optional filter by status

    console.log('📋 Admin fetching discovery requests, status filter:', status || 'all');

    let query = supabaseService
      .from('discovery_requests')
      .select(`
        *,
        user:user_profiles!user_id (
          user_id,
          display_name,
          avatar_url,
          city,
          country,
          user_interests (
            interest
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching discovery requests:', error);
      return c.json({ error: 'Failed to fetch requests', details: error.message }, 500);
    }

    // For each request, get match count
    const requestsWithCounts = await Promise.all(
      (requests || []).map(async (request: any) => {
        const { count } = await supabaseService
          .from('discovery_match_results')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', request.id);

        return {
          ...request,
          matchCount: count || 0,
        };
      })
    );

    console.log(`✅ Fetched ${requestsWithCounts.length} discovery requests`);

    return c.json({ requests: requestsWithCounts });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/requests:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/request/:requestId/details
// ============================================================================
// Get single discovery request with full details (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/request/:requestId/details', requireAdmin, async (c: any) => {
  try {
    const requestId = c.req.param('requestId');

    console.log('📋 Admin fetching discovery request details:', requestId);

    const { data: request, error } = await supabaseService
      .from('discovery_requests')
      .select(`
        *
      `)
      .eq('id', requestId)
      .single();

    if (error || !request) {
      console.error('Error fetching discovery request:', error);
      return c.json({ error: 'Request not found', details: error?.message }, 404);
    }

    // Get user profile
    const { data: userProfile } = await supabaseService
      .from('user_profiles')
      .select(`
        user_id,
        display_name,
        avatar_url,
        bio,
        city,
        country
      `)
      .eq('user_id', request.user_id)
      .single();

    // Get user interests
    const { data: interests } = await supabaseService
      .from('user_interests')
      .select('interest')
      .eq('user_id', request.user_id);

    request.user = {
      ...userProfile,
      user_interests: interests || [],
    };

    // Get recommendations for this request
    const { data: recommendations, error: recError } = await supabaseService
      .from('discovery_recommendations')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (recError) {
      console.error('Error fetching recommendations:', recError);
    }

    // Fetch entity details for each recommendation
    const recommendationsWithEntities = await Promise.all(
      (recommendations || []).map(async (rec: any) => {
        let entity = null;

        if (rec.type === 'user' && rec.user_id) {
          const { data } = await supabaseService
            .from('user_profiles')
            .select('user_id, display_name, avatar_url, city, country')
            .eq('user_id', rec.user_id)
            .single();
          entity = data;
        } else if (rec.type === 'company' && rec.company_id) {
          const { data } = await supabaseService
            .from('companies')
            .select('id, name, description, category_name, logo_url, location, country')
            .eq('id', rec.company_id)
            .single();
          entity = data;
        } else if (rec.type === 'place' && rec.place_id) {
          const { data } = await supabaseService
            .from('places')
            .select('*')
            .eq('id', rec.place_id)
            .single();
          entity = data;
        } else if (rec.type === 'article' && rec.article_id) {
          const { data } = await supabaseService
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
          entity,
        };
      })
    );

    console.log(`✅ Fetched discovery request with ${recommendationsWithEntities.length} recommendations`);

    return c.json({ 
      request,
      recommendations: recommendationsWithEntities,
    });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/request/:requestId/details:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: POST /admin/discovery/request/:requestId/match
// ============================================================================
// Admin manually creates a match for a discovery request
// ============================================================================

app.post('/make-server-053bcd80/admin/discovery/request/:requestId/match', requireAdmin, async (c: any) => {
  try {
    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    const { matchType, matchedUserId, matchedOrganizationId, matchReason } = body;

    console.log('🎯 Admin creating manual match:', { requestId, matchType, matchedUserId, matchedOrganizationId });

    // Validate inputs
    if (!matchType || (matchType !== 'user' && matchType !== 'organization')) {
      return c.json({ error: 'Invalid matchType. Must be "user" or "organization"' }, 400);
    }

    if (matchType === 'user' && !matchedUserId) {
      return c.json({ error: 'matchedUserId is required when matchType is "user"' }, 400);
    }

    if (matchType === 'organization' && !matchedOrganizationId) {
      return c.json({ error: 'matchedOrganizationId is required when matchType is "organization"' }, 400);
    }

    // Verify request exists
    const { data: request, error: requestError } = await supabaseService
      .from('discovery_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return c.json({ error: 'Discovery request not found' }, 404);
    }

    // Get current match count to determine rank
    const { count } = await supabaseService
      .from('discovery_match_results')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId);

    const nextRank = (count || 0) + 1;

    // Create the match
    const { data: match, error: matchError } = await supabaseService
      .from('discovery_match_results')
      .insert({
        request_id: requestId,
        match_type: matchType,
        matched_user_id: matchType === 'user' ? matchedUserId : null,
        matched_organization_id: matchType === 'organization' ? matchedOrganizationId : null,
        match_score: 100, // Admin matches are always 100% (manual curation)
        match_rank: nextRank,
        match_reason: matchReason || 'Manually matched by admin',
        score_breakdown: {
          categoryMatch: 25,
          locationMatch: 25,
          interestMatch: 25,
          trustScore: 15,
          activityLevel: 10,
        },
      })
      .select()
      .single();

    if (matchError) {
      console.error('Error creating match:', matchError);
      return c.json({ error: 'Failed to create match', details: matchError.message }, 500);
    }

    // Update request status to 'matched' if it was pending
    if (request.status === 'pending_admin_review') {
      await supabaseService
        .from('discovery_requests')
        .update({
          status: 'matched',
          matched_at: new Date().toISOString(),
        })
        .eq('id', requestId);
    }

    console.log('✅ Admin match created:', match.id);

    return c.json({ 
      success: true,
      match,
    });
  } catch (error: any) {
    console.error('Error in POST /admin/discovery/request/:requestId/match:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: DELETE /admin/discovery/match/:matchId
// ============================================================================
// Admin deletes a match
// ============================================================================

app.delete('/make-server-053bcd80/admin/discovery/match/:matchId', requireAdmin, async (c: any) => {
  try {
    const matchId = c.req.param('matchId');

    console.log('🗑️ Admin deleting match:', matchId);

    const { error } = await supabaseService
      .from('discovery_match_results')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error('Error deleting match:', error);
      return c.json({ error: 'Failed to delete match', details: error.message }, 500);
    }

    console.log('✅ Match deleted:', matchId);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /admin/discovery/match/:matchId:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: PUT /admin/discovery/request/:requestId/status
// ============================================================================
// Admin updates request status
// ============================================================================

app.put('/make-server-053bcd80/admin/discovery/request/:requestId/status', requireAdmin, async (c: any) => {
  try {
    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    const { status } = body;

    console.log('🔄 Admin updating request status:', requestId, status);

    const validStatuses = ['pending_admin_review', 'searching', 'matched', 'no_matches', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') }, 400);
    }

    const updateData: any = { status };
    if (status === 'matched') {
      updateData.matched_at = new Date().toISOString();
    }

    const { error } = await supabaseService
      .from('discovery_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating request status:', error);
      return c.json({ error: 'Failed to update status', details: error.message }, 500);
    }

    console.log('✅ Request status updated:', requestId, status);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /admin/discovery/request/:requestId/status:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/search/users
// ============================================================================
// Search for users to match (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/search/users', requireAdmin, async (c: any) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log('🔍 Admin searching users:', { query, limit });

    let dbQuery = supabaseService
      .from('user_profiles')
      .select(`
        user_id,
        display_name,
        bio,
        avatar_url,
        city,
        country,
        user_interests (
          interest
        )
      `)
      .limit(limit);

    // Apply search filter if provided
    if (query && query.length > 0) {
      dbQuery = dbQuery.or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`);
    }

    const { data: users, error } = await dbQuery;

    if (error) {
      console.error('❌ Error searching users - Full details:', {
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        query,
      });
      return c.json({ error: 'Failed to search users', details: error.message, code: error.code }, 500);
    }

    console.log(`✅ Found ${users?.length || 0} users`);

    return c.json({ users: users || [] });
  } catch (error: any) {
    console.error('❌ Exception in GET /admin/discovery/search/users:', {
      message: error.message,
      stack: error.stack,
    });
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/search/companies
// ============================================================================
// Search for companies to match (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/search/companies', requireAdmin, async (c: any) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log('🔍 Admin searching companies:', query);

    let dbQuery = supabaseService
      .from('companies')
      .select(`
        id,
        name,
        description,
        category_name,
        logo_url,
        location,
        country,
        website
      `)
      .eq('is_published', true)
      .limit(limit);

    // Apply search filter if provided
    if (query && query.length > 0) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,category_name.ilike.%${query}%`);
    }

    const { data: companies, error } = await dbQuery;

    if (error) {
      console.error('Error searching companies:', error);
      return c.json({ error: 'Failed to search companies', details: error.message }, 500);
    }

    console.log(`✅ Found ${companies?.length || 0} companies`);

    return c.json({ companies: companies || [] });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/search/companies:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/search/places
// ============================================================================
// Search for places to match (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/search/places', requireAdmin, async (c: any) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log('🔍 Admin searching places:', query);

    let dbQuery = supabaseService
      .from('places')
      .select('*')
      .limit(limit);

    // Apply search filter if provided
    if (query && query.length > 0) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%,category.ilike.%${query}%`);
    }

    const { data: places, error } = await dbQuery;

    if (error) {
      console.error('Error searching places:', error);
      return c.json({ error: 'Failed to search places', details: error.message }, 500);
    }

    console.log(`✅ Found ${places?.length || 0} places`);

    return c.json({ places: places || [] });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/search/places:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: GET /admin/discovery/search/articles
// ============================================================================
// Search for articles to match (admin only)
// ============================================================================

app.get('/make-server-053bcd80/admin/discovery/search/articles', requireAdmin, async (c: any) => {
  try {
    const query = c.req.query('q');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log('🔍 Admin searching articles:', query);

    let dbQuery = supabaseService
      .from('articles')
      .select('id, title, subtitle, image, category')
      .eq('hidden', false)
      .limit(limit)
      .order('published_at', { ascending: false });

    // Apply search filter if provided
    if (query && query.length > 0) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,category.ilike.%${query}%`);
    }

    const { data: articles, error } = await dbQuery;

    if (error) {
      console.error('Error searching articles:', error);
      return c.json({ error: 'Failed to search articles', details: error.message }, 500);
    }

    console.log(`✅ Found ${articles?.length || 0} articles`);

    return c.json({ articles: articles || [] });
  } catch (error: any) {
    console.error('Error in GET /admin/discovery/search/articles:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: POST /admin/discovery/request/:requestId/recommendation
// ============================================================================
// Admin adds a recommendation to a discovery request
// ============================================================================

app.post('/make-server-053bcd80/admin/discovery/request/:requestId/recommendation', requireAdmin, async (c: any) => {
  try {
    const requestId = c.req.param('requestId');
    const body = await c.req.json();
    const { type, entityId, note } = body;

    console.log('➕ Admin adding recommendation:', { requestId, type, entityId });

    // Validate inputs
    const validTypes = ['user', 'company', 'place', 'article'];
    if (!type || !validTypes.includes(type)) {
      return c.json({ error: 'Invalid type. Must be one of: ' + validTypes.join(', ') }, 400);
    }

    if (!entityId) {
      return c.json({ error: 'entityId is required' }, 400);
    }

    // Create recommendation record
    const recommendationData: any = {
      request_id: requestId,
      type,
      note,
      created_at: new Date().toISOString(),
    };

    // Set the appropriate ID field based on type
    if (type === 'user') {
      recommendationData.user_id = entityId;
    } else if (type === 'company') {
      recommendationData.company_id = entityId;
    } else if (type === 'place') {
      recommendationData.place_id = entityId;
    } else if (type === 'article') {
      recommendationData.article_id = entityId;
    }

    const { data: recommendation, error } = await supabaseService
      .from('discovery_recommendations')
      .insert(recommendationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating recommendation:', error);
      return c.json({ error: 'Failed to create recommendation', details: error.message }, 500);
    }

    console.log('✅ Recommendation created:', recommendation.id);

    return c.json({ success: true, recommendation });
  } catch (error: any) {
    console.error('Error in POST /admin/discovery/request/:requestId/recommendation:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: DELETE /admin/discovery/recommendation/:recommendationId
// ============================================================================
// Admin deletes a recommendation
// ============================================================================

app.delete('/make-server-053bcd80/admin/discovery/recommendation/:recommendationId', requireAdmin, async (c: any) => {
  try {
    const recommendationId = c.req.param('recommendationId');

    console.log('🗑️ Admin deleting recommendation:', recommendationId);

    const { error } = await supabaseService
      .from('discovery_recommendations')
      .delete()
      .eq('id', recommendationId);

    if (error) {
      console.error('Error deleting recommendation:', error);
      return c.json({ error: 'Failed to delete recommendation', details: error.message }, 500);
    }

    console.log('✅ Recommendation deleted:', recommendationId);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /admin/discovery/recommendation/:recommendationId:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ============================================================================
// ROUTE: POST /admin/discovery/request/:requestId/send
// ============================================================================
// Admin sends recommendations to the user (marks request as matched)
// ============================================================================

app.post('/make-server-053bcd80/admin/discovery/request/:requestId/send', requireAdmin, async (c: any) => {
  try {
    const requestId = c.req.param('requestId');

    console.log('📤 Admin sending recommendations for request:', requestId);

    // Check if there are recommendations
    const { data: recommendations, error: recError } = await supabaseService
      .from('discovery_recommendations')
      .select('id')
      .eq('request_id', requestId);

    if (recError) {
      console.error('Error fetching recommendations:', recError);
      return c.json({ error: 'Failed to fetch recommendations', details: recError.message }, 500);
    }

    if (!recommendations || recommendations.length === 0) {
      return c.json({ error: 'No recommendations to send' }, 400);
    }

    // Update request status to 'matched'
    const { error: updateError } = await supabaseService
      .from('discovery_requests')
      .update({
        status: 'matched',
        matched_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request status:', updateError);
      return c.json({ error: 'Failed to update request status', details: updateError.message }, 500);
    }

    // Mark all recommendations as sent
    const { error: markError } = await supabaseService
      .from('discovery_recommendations')
      .update({ sent_at: new Date().toISOString() })
      .eq('request_id', requestId)
      .is('sent_at', null);

    if (markError) {
      console.error('Error marking recommendations as sent:', markError);
    }

    console.log(`✅ Sent ${recommendations.length} recommendations for request:`, requestId);

    return c.json({ success: true, count: recommendations.length });
  } catch (error: any) {
    console.error('Error in POST /admin/discovery/request/:requestId/send:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

}