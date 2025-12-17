// ============================================================================
// SWAP ROUTES - C2C Barter Marketplace (Updated for New Schema)
// ============================================================================
// Consumer-to-consumer item swapping/barter system
// Now uses relational tables instead of KV store
// ============================================================================

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in swap_routes.tsx');
}

// Create clients
const supabaseAuth = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
const supabaseService = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper to get Supabase client (with auth or service)
function getSupabaseClient(authHeader?: string) {
  if (authHeader && supabaseAuth) {
    return supabaseAuth;
  }
  if (!supabaseService) {
    throw new Error('Supabase service client not initialized');
  }
  return supabaseService;
}

// Helper to get user from auth token
async function getUserFromAuth(authHeader?: string) {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }
  
  const accessToken = authHeader.split(' ')[1];
  if (!supabaseAuth) {
    throw new Error('Supabase auth client not initialized');
  }
  
  const { data: { user }, error } = await supabaseAuth.auth.getUser(accessToken);
  
  if (error || !user) {
    throw new Error('Unauthorized: Invalid token');
  }
  
  return user;
}

// Helper to calculate power level based on item completeness
function calculatePowerLevel(item: any): number {
  let score = 1; // Base level
  
  if (item.description && item.description.length > 20) score++;
  if (item.images && item.images.length >= 1) score++;
  if (item.images && item.images.length >= 3) score++;
  if (item.story && item.story.length > 20) score++;
  if (item.country) score++;
  if (item.city) score++;
  if (item.hemp_inside) score++;
  if (item.years_in_use !== null) score++;
  if (item.willing_to_ship) score++;
  
  return Math.min(score, 10); // Cap at 10
}

// Create Hono app for SWAP routes
const swap = new Hono();

// ================================================
// GET /swap/items - List all available swap items
// ================================================
swap.get('/make-server-053bcd80/swap/items', async (c) => {
  try {
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    // Query parameters
    const userId = c.req.query('user_id');
    const category = c.req.query('category');
    const condition = c.req.query('condition');
    const country = c.req.query('country');
    const search = c.req.query('search');
    const status = c.req.query('status') || 'available';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    
    let query = supabase
      .from('swap_items')
      .select('*', { count: 'exact' })
      .is('deleted_at', null) // Exclude soft-deleted items
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Filter by user_id if provided (for "My Inventory")
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (condition) {
      query = query.eq('condition', condition);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Get user profiles for display names
    const userIds = [...new Set(data.map((item: any) => item.user_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url, country')
      .in('user_id', userIds);
    
    // Merge profile data
    const itemsWithProfiles = data.map((item: any) => {
      const profile = profiles?.find((p: any) => p.user_id === item.user_id);
      return {
        ...item,
        user_profile: profile || null,
      };
    });
    
    return c.json({ 
      items: itemsWithProfiles,
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    });
  } catch (error: any) {
    console.error('❌ Error fetching swap items:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/items/:id - Get swap item detail
// ================================================
swap.get('/make-server-053bcd80/swap/items/:id', async (c) => {
  try {
    const itemId = c.req.param('id');
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    // Fetch item with owner profile
    const { data: item, error } = await supabase
      .from('swap_items')
      .select('*')
      .eq('id', itemId)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url, country, bio')
      .eq('user_id', item.user_id)
      .single();
    
    // Increment views_count
    await supabase
      .from('swap_items')
      .update({ views_count: (item.views_count || 0) + 1 })
      .eq('id', itemId);
    
    // Track analytics event
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      try {
        const user = await getUserFromAuth(authHeader);
        await supabase
          .from('swap_analytics')
          .insert({
            user_id: user.id,
            item_id: itemId,
            event_type: 'view'
          });
      } catch {
        // Ignore auth errors for analytics
      }
    }
    
    return c.json({
      ...item,
      user_profile: profile || null,
    });
  } catch (error: any) {
    console.error('❌ Error fetching swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/items - Create new swap item
// ================================================
swap.post('/make-server-053bcd80/swap/items', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    // Use service client for INSERT to bypass RLS
    const supabase = supabaseService;
    if (!supabase) {
      throw new Error('Supabase service client not initialized');
    }
    
    const body = await c.req.json();
    const {
      title,
      description,
      category,
      condition,
      hemp_inside,
      hemp_percentage,
      images,
      country,
      city,
      latitude,
      longitude,
      willing_to_ship,
      story,
      years_in_use,
      original_product_id,
    } = body;
    
    // Validation
    if (!title || !category || !condition) {
      return c.json({ 
        error: 'Missing required fields: title, category, condition' 
      }, 400);
    }
    
    // Build item object
    const itemData: any = {
      user_id: user.id,
      title,
      description: description || '',
      category,
      condition,
      hemp_inside: hemp_inside ?? false,
      hemp_percentage: hemp_percentage || null,
      images: images || [],
      country: country || null,
      city: city || null,
      latitude: latitude || null,
      longitude: longitude || null,
      willing_to_ship: willing_to_ship ?? false,
      story: story || null,
      years_in_use: years_in_use || null,
      original_product_id: original_product_id || null,
      status: 'available',
    };
    
    // Calculate power level
    itemData.power_level = calculatePowerLevel(itemData);
    
    // Insert item
    const { data: item, error } = await supabase
      .from('swap_items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ item }, 201);
  } catch (error: any) {
    console.error('❌ Error creating swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// PUT /swap/items/:id - Update swap item
// ================================================
swap.put('/make-server-053bcd80/swap/items/:id', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    // Use service client for UPDATE to bypass RLS
    const supabase = supabaseService;
    if (!supabase) {
      throw new Error('Supabase service client not initialized');
    }
    const itemId = c.req.param('id');
    
    // Check ownership
    const { data: existingItem } = await supabase
      .from('swap_items')
      .select('*')
      .eq('id', itemId)
      .is('deleted_at', null)
      .single();
    
    if (!existingItem) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    if (existingItem.user_id !== user.id) {
      return c.json({ error: 'Unauthorized: Not item owner' }, 403);
    }
    
    const body = await c.req.json();
    
    // Recalculate power level with updated data
    const updatedData = { ...existingItem, ...body };
    updatedData.power_level = calculatePowerLevel(updatedData);
    
    // Update item
    const { data: item, error } = await supabase
      .from('swap_items')
      .update({ ...body, power_level: updatedData.power_level })
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ item });
  } catch (error: any) {
    console.error('❌ Error updating swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// DELETE /swap/items/:id - Soft delete swap item
// ================================================
swap.delete('/make-server-053bcd80/swap/items/:id', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const itemId = c.req.param('id');
    
    // Check ownership
    const { data: existingItem } = await supabase
      .from('swap_items')
      .select('user_id')
      .eq('id', itemId)
      .is('deleted_at', null)
      .single();
    
    if (!existingItem) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    if (existingItem.user_id !== user.id) {
      return c.json({ error: 'Unauthorized: Not item owner' }, 403);
    }
    
    // Soft delete (set deleted_at timestamp)
    const { error } = await supabase
      .from('swap_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);
    
    if (error) throw error;
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/likes - Get user's liked items
// ================================================
swap.get('/make-server-053bcd80/swap/likes', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    // Get likes with item details
    const { data: likes, error } = await supabase
      .from('swap_likes')
      .select(`
        *,
        item:swap_items!inner(
          *,
          user_profile:user_profiles!swap_items_user_id_fkey(
            user_id,
            display_name,
            avatar_url,
            country
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter out expired likes (cleanup happens via trigger, but double-check)
    const now = new Date();
    const validLikes = likes.filter((like: any) => 
      new Date(like.expires_at) > now && !like.item.deleted_at
    );
    
    return c.json({ likes: validLikes });
  } catch (error: any) {
    console.error('❌ Error fetching swap likes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/likes - Like an item
// ================================================
swap.post('/make-server-053bcd80/swap/likes', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    const { item_id } = await c.req.json();
    
    if (!item_id) {
      return c.json({ error: 'Missing item_id' }, 400);
    }
    
    // Check if item exists and is available
    const { data: item, error: itemError } = await supabase
      .from('swap_items')
      .select('user_id, status')
      .eq('id', item_id)
      .is('deleted_at', null)
      .single();
    
    if (itemError || !item) {
      return c.json({ error: 'Item not found' }, 404);
    }
    
    // Can't like your own item
    if (item.user_id === user.id) {
      return c.json({ error: 'Cannot like your own item' }, 400);
    }
    
    // Insert like (UNIQUE constraint prevents duplicates)
    const { data: like, error } = await supabase
      .from('swap_likes')
      .insert({ user_id: user.id, item_id })
      .select()
      .single();
    
    if (error) {
      // Check if already liked
      if (error.code === '23505') {
        return c.json({ message: 'Already liked', already_liked: true });
      }
      throw error;
    }
    
    // Track analytics
    await supabase
      .from('swap_analytics')
      .insert({
        user_id: user.id,
        item_id,
        event_type: 'like'
      });
    
    return c.json({ 
      success: true,
      like,
      expires_at: like.expires_at
    }, 201);
  } catch (error: any) {
    console.error('❌ Error liking swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// DELETE /swap/likes/:item_id - Unlike an item
// ================================================
swap.delete('/make-server-053bcd80/swap/likes/:item_id', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const itemId = c.req.param('item_id');
    
    // Delete like
    const { error } = await supabase
      .from('swap_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);
    
    if (error) throw error;
    
    // Track analytics
    await supabase
      .from('swap_analytics')
      .insert({
        user_id: user.id,
        item_id: itemId,
        event_type: 'unlike'
      });
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error unliking swap item:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/proposals - Get user's proposals
// ================================================
swap.get('/make-server-053bcd80/swap/proposals', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    const type = c.req.query('type'); // 'incoming' or 'outgoing'
    
    let query = supabase
      .from('swap_proposals')
      .select(`
        *,
        swap_item:swap_items!swap_proposals_swap_item_id_fkey(*),
        proposer_item:swap_items!swap_proposals_proposer_item_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    // Filter by incoming or outgoing
    if (type === 'incoming') {
      // Proposals where user owns the item being requested
      // First, get the user's item IDs
      const { data: userItems } = await supabase
        .from('swap_items')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null);
      
      const userItemIds = userItems?.map(item => item.id) || [];
      
      if (userItemIds.length > 0) {
        query = query.in('swap_item_id', userItemIds);
      } else {
        // No items, return empty
        return c.json({ proposals: [] });
      }
    } else if (type === 'outgoing') {
      // Proposals user created
      query = query.eq('proposer_user_id', user.id);
    } else {
      // All proposals involving user (both incoming and outgoing)
      // First, get the user's item IDs
      const { data: userItems } = await supabase
        .from('swap_items')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null);
      
      const userItemIds = userItems?.map(item => item.id) || [];
      
      // Query for proposals where user is either proposer OR owns the item
      if (userItemIds.length > 0) {
        query = query.or(`proposer_user_id.eq.${user.id},swap_item_id.in.(${userItemIds.join(',')})`);
      } else {
        // No items, only show proposals user created
        query = query.eq('proposer_user_id', user.id);
      }
    }
    
    const { data: proposals, error } = await query;
    
    if (error) throw error;
    
    // Now fetch user profiles separately
    const userIds = new Set<string>();
    proposals.forEach((p: any) => {
      if (p.swap_item?.user_id) userIds.add(p.swap_item.user_id);
      if (p.proposer_user_id) userIds.add(p.proposer_user_id);
    });
    
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url, country')
      .in('user_id', Array.from(userIds));
    
    // Merge profiles into proposals
    const enrichedProposals = proposals.map((p: any) => ({
      ...p,
      swap_item: {
        ...p.swap_item,
        user_profile: profiles?.find((prof: any) => prof.user_id === p.swap_item?.user_id) || null
      },
      proposer_profile: profiles?.find((prof: any) => prof.user_id === p.proposer_user_id) || null
    }));
    
    return c.json({ proposals: enrichedProposals });
  } catch (error: any) {
    console.error('❌ Error fetching swap proposals:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/proposals - Create swap proposal
// ================================================
swap.post('/make-server-053bcd80/swap/proposals', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    // Use service client for INSERT to bypass RLS
    const supabase = supabaseService;
    if (!supabase) {
      throw new Error('Supabase service client not initialized');
    }
    
    const body = await c.req.json();
    const {
      swap_item_id,
      proposer_item_id,
      proposal_type,
      offer_title,
      offer_description,
      offer_category,
      offer_condition,
      offer_images,
      message
    } = body;
    
    // Validation
    if (!swap_item_id) {
      return c.json({ error: 'Missing swap_item_id' }, 400);
    }
    
    // Check if target item exists and is available
    const { data: targetItem, error: itemError } = await supabase
      .from('swap_items')
      .select('user_id, status')
      .eq('id', swap_item_id)
      .is('deleted_at', null)
      .single();
    
    if (itemError || !targetItem) {
      return c.json({ error: 'Target item not found' }, 404);
    }
    
    if (targetItem.status !== 'available') {
      return c.json({ error: 'Item is no longer available' }, 400);
    }
    
    // Can't propose to your own item
    if (targetItem.user_id === user.id) {
      return c.json({ error: 'Cannot propose to your own item' }, 400);
    }
    
    // Validate proposal type
    const type = proposal_type || (proposer_item_id ? 'item' : 'service');
    
    if (type === 'item') {
      // Item-to-item: must have proposer_item_id
      if (!proposer_item_id) {
        return c.json({ error: 'Missing proposer_item_id for item-to-item swap' }, 400);
      }
      
      // Verify ownership of proposer's item
      const { data: proposerItem } = await supabase
        .from('swap_items')
        .select('user_id, status')
        .eq('id', proposer_item_id)
        .is('deleted_at', null)
        .single();
      
      if (!proposerItem || proposerItem.user_id !== user.id) {
        return c.json({ error: 'Invalid proposer_item_id or you do not own this item' }, 403);
      }
      
      if (proposerItem.status !== 'available') {
        return c.json({ error: 'Your item is no longer available' }, 400);
      }
    } else {
      // Service proposal: must have offer_description
      if (!offer_description || !offer_title) {
        return c.json({ error: 'Missing offer_title and offer_description for service proposal' }, 400);
      }
    }
    
    // Create conversation_id for messaging
    const conversation_id = crypto.randomUUID();
    
    // Insert proposal
    const { data: proposal, error } = await supabase
      .from('swap_proposals')
      .insert({
        swap_item_id,
        proposer_user_id: user.id,
        proposer_item_id: proposer_item_id || null,
        proposal_type: type,
        offer_title: offer_title || null,
        offer_description: offer_description || null,
        offer_category: offer_category || null,
        offer_condition: offer_condition || null,
        offer_images: offer_images || [],
        message: message || null,
        conversation_id,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update like to mark proposal_sent if user liked this item
    await supabase
      .from('swap_likes')
      .update({ 
        proposal_sent: true, 
        proposal_id: proposal.id 
      })
      .eq('user_id', user.id)
      .eq('item_id', swap_item_id);
    
    // Track analytics
    await supabase
      .from('swap_analytics')
      .insert({
        user_id: user.id,
        item_id: swap_item_id,
        event_type: 'propose',
        metadata: { proposal_id: proposal.id, proposal_type: type }
      });
    
    // TODO: Create initial message in messages table
    // This will be handled by frontend or separate messaging route
    
    return c.json({ 
      success: true,
      proposal,
      conversation_id
    }, 201);
  } catch (error: any) {
    console.error('❌ Error creating swap proposal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/proposals/:id/accept - Accept SWAP proposal
// ================================================
swap.post('/make-server-053bcd80/swap/proposals/:id/accept', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    // Use service client for creating conversations to bypass RLS
    const supabase = supabaseService;
    if (!supabase) {
      throw new Error('Supabase service client not initialized');
    }
    
    const proposalId = c.req.param('id');
    
    console.log('✅ Accepting SWAP proposal:', proposalId, 'by user:', user.id);
    
    // Get proposal with full details
    const { data: proposal, error: propError } = await supabase
      .from('swap_proposals')
      .select(`
        *,
        swap_item:swap_items!swap_proposals_swap_item_id_fkey(
          id,
          user_id,
          title,
          category,
          description,
          condition,
          images
        ),
        proposer_profile:user_profiles!swap_proposals_proposer_user_id_fkey(
          user_id,
          display_name,
          avatar_url,
          country
        )
      `)
      .eq('id', proposalId)
      .single();
    
    if (propError || !proposal) {
      console.error('❌ Proposal not found:', propError);
      return c.json({ error: 'Proposal not found' }, 404);
    }
    
    // Check authorization - only item owner can accept
    if (proposal.swap_item.user_id !== user.id) {
      console.error('❌ Unauthorized: User', user.id, 'is not owner of item', proposal.swap_item.user_id);
      return c.json({ error: 'Only item owner can accept proposals' }, 403);
    }
    
    // Check if already accepted
    if (proposal.status === 'accepted') {
      console.log('⚠️ Proposal already accepted');
      return c.json({ 
        error: 'Proposal already accepted',
        conversation_id: proposal.conversation_id 
      }, 400);
    }
    
    // Check if already declined/cancelled
    if (proposal.status !== 'pending') {
      console.error('❌ Proposal is not pending, status:', proposal.status);
      return c.json({ error: 'Proposal is not pending' }, 400);
    }
    
    console.log('✅ Creating conversation for SWAP proposal...');
    
    // Create conversation in conversations table
    const conversationId = proposal.conversation_id || crypto.randomUUID();
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        context_type: 'swap',
        context_id: proposalId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (convError) {
      console.error('❌ Error creating conversation:', convError);
      throw convError;
    }
    
    console.log('✅ Conversation created:', conversationId);
    
    // Add both participants to conversation
    const participants = [
      {
        conversation_id: conversationId,
        user_id: proposal.swap_item.user_id, // Item owner
        joined_at: new Date().toISOString()
      },
      {
        conversation_id: conversationId,
        user_id: proposal.proposer_user_id, // Proposer
        joined_at: new Date().toISOString()
      }
    ];
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);
    
    if (participantsError) {
      console.error('❌ Error adding participants:', participantsError);
      throw participantsError;
    }
    
    console.log('✅ Participants added to conversation');
    
    // Create initial system message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: '🎉 SWAP proposal accepted! Identities are now revealed. You can discuss the trade details here.',
        message_type: 'system',
        created_at: new Date().toISOString()
      });
    
    if (messageError) {
      console.error('⚠️ Error creating system message:', messageError);
      // Don't fail the whole operation if message fails
    }
    
    // Update proposal status to accepted
    const { data: updatedProposal, error: updateError } = await supabase
      .from('swap_proposals')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        conversation_id: conversationId
      })
      .eq('id', proposalId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating proposal:', updateError);
      throw updateError;
    }
    
    console.log('✅ Proposal updated to accepted');
    
    // Create swap_deal if not exists
    const { data: existingDeal } = await supabase
      .from('swap_deals')
      .select('id')
      .eq('proposal_id', proposalId)
      .single();
    
    if (!existingDeal) {
      const { data: deal, error: dealError } = await supabase
        .from('swap_deals')
        .insert({
          proposal_id: proposalId,
          user1_id: proposal.swap_item.user_id,
          user2_id: proposal.proposer_user_id,
          item1_id: proposal.swap_item_id,
          item2_id: proposal.proposer_item_id,
          conversation_id: conversationId,
          status: 'negotiating'
        })
        .select()
        .single();
      
      if (dealError) {
        console.error('⚠️ Error creating swap_deal:', dealError);
        // Don't fail the whole operation
      } else {
        console.log('✅ Swap deal created:', deal.id);
      }
    }
    
    // Track analytics
    await supabase
      .from('swap_analytics')
      .insert({
        user_id: user.id,
        item_id: proposal.swap_item_id,
        event_type: 'accept',
        metadata: { proposal_id: proposalId }
      });
    
    console.log('✅ SWAP proposal accepted successfully');
    
    return c.json({ 
      success: true,
      conversation_id: conversationId,
      proposal: updatedProposal
    });
  } catch (error: any) {
    console.error('❌ Error accepting SWAP proposal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/proposals/:id/decline - Decline SWAP proposal
// ================================================
swap.post('/make-server-053bcd80/swap/proposals/:id/decline', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = supabaseService;
    if (!supabase) {
      throw new Error('Supabase service client not initialized');
    }
    
    const proposalId = c.req.param('id');
    
    console.log('❌ Declining SWAP proposal:', proposalId, 'by user:', user.id);
    
    // Get proposal
    const { data: proposal, error: propError } = await supabase
      .from('swap_proposals')
      .select(`
        *,
        swap_item:swap_items!swap_proposals_swap_item_id_fkey(user_id)
      `)
      .eq('id', proposalId)
      .single();
    
    if (propError || !proposal) {
      console.error('❌ Proposal not found:', propError);
      return c.json({ error: 'Proposal not found' }, 404);
    }
    
    // Check authorization - only item owner can decline
    if (proposal.swap_item.user_id !== user.id) {
      console.error('❌ Unauthorized: User', user.id, 'is not owner');
      return c.json({ error: 'Only item owner can decline proposals' }, 403);
    }
    
    // Check if already declined
    if (proposal.status === 'rejected') {
      console.log('⚠️ Proposal already declined');
      return c.json({ error: 'Proposal already declined' }, 400);
    }
    
    // Check if already accepted
    if (proposal.status === 'accepted') {
      console.error('❌ Cannot decline accepted proposal');
      return c.json({ error: 'Cannot decline an accepted proposal' }, 400);
    }
    
    // Update proposal status to rejected
    const { data: updatedProposal, error: updateError } = await supabase
      .from('swap_proposals')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating proposal:', updateError);
      throw updateError;
    }
    
    console.log('✅ Proposal declined successfully');
    
    // Track analytics
    await supabase
      .from('swap_analytics')
      .insert({
        user_id: user.id,
        item_id: proposal.swap_item_id,
        event_type: 'decline',
        metadata: { proposal_id: proposalId }
      });
    
    // Do NOT create conversation - proposal was declined
    
    return c.json({ 
      success: true,
      proposal: updatedProposal
    });
  } catch (error: any) {
    console.error('❌ Error declining SWAP proposal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/deals - Get user's active deals
// ================================================
swap.get('/make-server-053bcd80/swap/deals', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    
    const status = c.req.query('status'); // Filter by status
    
    let query = supabase
      .from('swap_deals')
      .select(`
        *,
        item1:swap_items!swap_deals_item1_id_fkey(*),
        item2:swap_items!swap_deals_item2_id_fkey(*),
        user1:user_profiles!swap_deals_user1_id_fkey(user_id, display_name, avatar_url, country),
        user2:user_profiles!swap_deals_user2_id_fkey(user_id, display_name, avatar_url, country),
        proposal:swap_proposals!inner(*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: deals, error } = await query;
    
    if (error) throw error;
    
    // Add helper fields for frontend
    const enrichedDeals = deals.map((deal: any) => ({
      ...deal,
      is_user1: deal.user1_id === user.id,
      other_user: deal.user1_id === user.id ? deal.user2 : deal.user1,
      my_item: deal.user1_id === user.id ? deal.item1 : deal.item2,
      their_item: deal.user1_id === user.id ? deal.item2 : deal.item1,
      unread_count: deal.user1_id === user.id ? deal.unread_count_user1 : deal.unread_count_user2
    }));
    
    return c.json({ deals: enrichedDeals });
  } catch (error: any) {
    console.error('❌ Error fetching swap deals:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/deals/:id - Get deal details
// ================================================
swap.get('/make-server-053bcd80/swap/deals/:id', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const dealId = c.req.param('id');
    
    const { data: deal, error } = await supabase
      .from('swap_deals')
      .select(`
        *,
        item1:swap_items!swap_deals_item1_id_fkey(*),
        item2:swap_items!swap_deals_item2_id_fkey(*),
        user1:user_profiles!swap_deals_user1_id_fkey(user_id, display_name, avatar_url, country),
        user2:user_profiles!swap_deals_user2_id_fkey(user_id, display_name, avatar_url, country),
        proposal:swap_proposals!inner(*)
      `)
      .eq('id', dealId)
      .single();
    
    if (error || !deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }
    
    // Check authorization
    if (deal.user1_id !== user.id && deal.user2_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Add helper fields
    const enrichedDeal = {
      ...deal,
      is_user1: deal.user1_id === user.id,
      other_user: deal.user1_id === user.id ? deal.user2 : deal.user1,
      my_item: deal.user1_id === user.id ? deal.item1 : deal.item2,
      their_item: deal.user1_id === user.id ? deal.item2 : deal.item1,
      unread_count: deal.user1_id === user.id ? deal.unread_count_user1 : deal.unread_count_user2
    };
    
    return c.json({ deal: enrichedDeal });
  } catch (error: any) {
    console.error('❌ Error fetching deal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// PUT /swap/deals/:id - Update deal status
// ================================================
swap.put('/make-server-053bcd80/swap/deals/:id', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const dealId = c.req.param('id');
    
    const body = await c.req.json();
    const { status, user1_shipped, user2_shipped, user1_confirmed, user2_confirmed } = body;
    
    // Get deal
    const { data: deal, error: dealError } = await supabase
      .from('swap_deals')
      .select('*')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      return c.json({ error: 'Deal not found' }, 404);
    }
    
    // Check authorization
    if (deal.user1_id !== user.id && deal.user2_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const isUser1 = deal.user1_id === user.id;
    const updateData: any = {};
    
    // Update fields based on user role
    if (status) updateData.status = status;
    if (user1_shipped !== undefined && isUser1) updateData.user1_shipped = user1_shipped;
    if (user2_shipped !== undefined && !isUser1) updateData.user2_shipped = user2_shipped;
    if (user1_confirmed !== undefined && isUser1) updateData.user1_confirmed = user1_confirmed;
    if (user2_confirmed !== undefined && !isUser1) updateData.user2_confirmed = user2_confirmed;
    
    // Update deal
    const { data: updatedDeal, error } = await supabase
      .from('swap_deals')
      .update(updateData)
      .eq('id', dealId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create system message for status changes
    let systemMessage = null;
    if (user1_shipped && isUser1) systemMessage = '📦 Item marked as shipped';
    if (user2_shipped && !isUser1) systemMessage = '📦 Item marked as shipped';
    if (user1_confirmed && isUser1) systemMessage = '✅ Confirmed receipt of item';
    if (user2_confirmed && !isUser1) systemMessage = '✅ Confirmed receipt of item';
    
    if (systemMessage) {
      await supabase
        .from('swap_deal_messages')
        .insert({
          deal_id: dealId,
          sender_id: user.id,
          message: systemMessage,
          message_type: 'system'
        });
    }
    
    // If both confirmed, mark as completed
    if (updatedDeal.user1_confirmed && updatedDeal.user2_confirmed) {
      await supabase
        .from('swap_deals')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', dealId);
      
      // Create swap_completions entry for ratings
      await supabase
        .from('swap_completions')
        .insert({
          proposal_id: deal.proposal_id,
          swap_item_id: deal.item1_id,
          giver_user_id: deal.user1_id,
          receiver_user_id: deal.user2_id
        });
      
      // Track analytics
      await supabase
        .from('swap_analytics')
        .insert([
          {
            user_id: deal.user1_id,
            item_id: deal.item1_id,
            event_type: 'complete',
            metadata: { deal_id: dealId }
          },
          {
            user_id: deal.user2_id,
            item_id: deal.item2_id,
            event_type: 'complete',
            metadata: { deal_id: dealId }
          }
        ]);
    }
    
    return c.json({ success: true, deal: updatedDeal });
  } catch (error: any) {
    console.error('❌ Error updating deal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// GET /swap/deals/:id/messages - Get deal messages
// ================================================
swap.get('/make-server-053bcd80/swap/deals/:id/messages', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const dealId = c.req.param('id');
    
    // Verify user is part of deal
    const { data: deal } = await supabase
      .from('swap_deals')
      .select('user1_id, user2_id')
      .eq('id', dealId)
      .single();
    
    if (!deal || (deal.user1_id !== user.id && deal.user2_id !== user.id)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Get messages
    const { data: messages, error } = await supabase
      .from('swap_deal_messages')
      .select(`
        *,
        sender:user_profiles!swap_deal_messages_sender_id_fkey(
          user_id,
          display_name,
          avatar_url
        )
      `)
      .eq('deal_id', dealId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Mark messages as read
    await supabase
      .from('swap_deal_messages')
      .update({ read_by_other: true, read_at: new Date().toISOString() })
      .eq('deal_id', dealId)
      .neq('sender_id', user.id)
      .is('read_by_other', false);
    
    // Reset unread count
    const isUser1 = deal.user1_id === user.id;
    await supabase
      .from('swap_deals')
      .update(isUser1 ? { unread_count_user1: 0 } : { unread_count_user2: 0 })
      .eq('id', dealId);
    
    return c.json({ messages });
  } catch (error: any) {
    console.error('❌ Error fetching deal messages:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ================================================
// POST /swap/deals/:id/messages - Send deal message
// ================================================
swap.post('/make-server-053bcd80/swap/deals/:id/messages', async (c) => {
  try {
    const user = await getUserFromAuth(c.req.header('Authorization'));
    const supabase = getSupabaseClient(c.req.header('Authorization'));
    const dealId = c.req.param('id');
    
    const { message, message_type, images } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Missing message' }, 400);
    }
    
    // Verify user is part of deal
    const { data: deal } = await supabase
      .from('swap_deals')
      .select('user1_id, user2_id')
      .eq('id', dealId)
      .single();
    
    if (!deal || (deal.user1_id !== user.id && deal.user2_id !== user.id)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Insert message
    const { data: newMessage, error } = await supabase
      .from('swap_deal_messages')
      .insert({
        deal_id: dealId,
        sender_id: user.id,
        message,
        message_type: message_type || 'text',
        images: images || []
      })
      .select(`
        *,
        sender:user_profiles!swap_deal_messages_sender_id_fkey(
          user_id,
          display_name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Update deal last_message_at and unread count
    const isUser1 = deal.user1_id === user.id;
    await supabase
      .from('swap_deals')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count_user1: isUser1 ? 0 : supabase.sql`unread_count_user1 + 1`,
        unread_count_user2: isUser1 ? supabase.sql`unread_count_user2 + 1` : 0
      })
      .eq('id', dealId);
    
    return c.json({ success: true, message: newMessage }, 201);
  } catch (error: any) {
    console.error('❌ Error sending deal message:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Export the swap router as default
export default swap;