import { Hono } from 'npm:hono@4'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper middleware for routes (passed from main server)
export function setupOrgRelationshipRoutes(app: Hono, requireAuth: any, requireAdmin: any) {

// ============================================================================
// ORGANIZATION-TO-ORGANIZATION RELATIONSHIPS
// ============================================================================

// Get all org-org relationships for an organization
app.get('/make-server-053bcd80/organizations/:id/org-relationships', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const userId = c.get('userId')
    
    console.log('🔗 Fetching org-org relationships for:', organizationId)
    
    // Verify user has access to this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    const isOwner = company.owner_id === userId
    
    let isMember = false
    if (!isOwner) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', organizationId)
        .eq('user_id', userId)
        .single()
      
      isMember = !!membership
    }
    
    if (!isOwner && !isMember) {
      return c.json({ error: 'Unauthorized - must be a member' }, 403)
    }
    
    // Fetch relationships where this org is the source
    const { data: outgoingRels, error: outError } = await supabase
      .from('organization_relationships')
      .select(`
        *,
        related_organization:companies!organization_relationships_related_organization_id_fkey (
          id,
          name,
          description,
          logo_url,
          website,
          location,
          country
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (outError) {
      console.error('❌ Error fetching outgoing relationships:', outError)
      return c.json({ error: 'Failed to fetch relationships', details: outError.message }, 500)
    }
    
    // Fetch relationships where this org is the target
    const { data: incomingRels, error: inError } = await supabase
      .from('organization_relationships')
      .select(`
        *,
        organization:companies!organization_relationships_organization_id_fkey (
          id,
          name,
          description,
          logo_url,
          website,
          location,
          country
        )
      `)
      .eq('related_organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (inError) {
      console.error('❌ Error fetching incoming relationships:', inError)
      return c.json({ error: 'Failed to fetch relationships', details: inError.message }, 500)
    }
    
    console.log(`✅ Fetched ${outgoingRels?.length || 0} outgoing + ${incomingRels?.length || 0} incoming relationships`)
    return c.json({ 
      outgoing: outgoingRels || [],
      incoming: incomingRels || []
    })
  } catch (error: any) {
    console.error('❌ Error in get org relationships route:', error)
    return c.json({ error: 'Failed to fetch relationships', details: error.message }, 500)
  }
})

// Search organizations for creating relationships
app.get('/make-server-053bcd80/organizations/:id/search-orgs', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const query = c.req.query('q') || ''
    
    console.log('🔍 Searching organizations:', query)
    
    let searchQuery = supabase
      .from('companies')
      .select('id, name, description, logo_url, location, country, is_published')
      .eq('is_published', true)
      .neq('id', organizationId) // Exclude self
      .order('name')
      .limit(20)
    
    if (query && query.trim()) {
      searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }
    
    const { data: organizations, error } = await searchQuery
    
    if (error) {
      console.error('❌ Error searching organizations:', error)
      return c.json({ error: 'Failed to search organizations', details: error.message }, 500)
    }
    
    console.log(`✅ Found ${organizations?.length || 0} organizations`)
    return c.json({ organizations: organizations || [] })
  } catch (error: any) {
    console.error('❌ Error in search organizations route:', error)
    return c.json({ error: 'Failed to search organizations', details: error.message }, 500)
  }
})

// Create an org-org relationship
app.post('/make-server-053bcd80/organizations/:id/org-relationships', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('🔗 Creating org-org relationship:', organizationId, '→', body.related_organization_id)
    
    // Verify user is owner OR admin member of source organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    const isOwner = company.owner_id === userId
    
    let isAdmin = false
    if (!isOwner) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', organizationId)
        .eq('user_id', userId)
        .single()
      
      isAdmin = membership && ['owner', 'admin'].includes(membership.role)
    }
    
    if (!isOwner && !isAdmin) {
      return c.json({ error: 'Unauthorized - must be admin or owner' }, 403)
    }
    
    // Validation
    if (!body.related_organization_id) {
      return c.json({ error: 'Related organization ID is required' }, 400)
    }
    if (!body.relationship_type) {
      return c.json({ error: 'Relationship type is required' }, 400)
    }
    
    // Verify target organization exists
    const { data: targetOrg, error: targetError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', body.related_organization_id)
      .single()
    
    if (targetError || !targetOrg) {
      return c.json({ error: 'Target organization not found' }, 404)
    }
    
    // Check for duplicate relationship
    const { data: existing } = await supabase
      .from('organization_relationships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('related_organization_id', body.related_organization_id)
      .eq('relationship_type', body.relationship_type)
      .single()
    
    if (existing) {
      return c.json({ error: 'This relationship already exists' }, 400)
    }
    
    // Create relationship
    const { data: relationship, error } = await supabase
      .from('organization_relationships')
      .insert({
        organization_id: organizationId,
        related_organization_id: body.related_organization_id,
        relationship_type: body.relationship_type,
        status: 'pending',
        notes: body.notes || null
      })
      .select(`
        *,
        related_organization:companies!organization_relationships_related_organization_id_fkey (
          id,
          name,
          description,
          logo_url,
          location,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error creating org relationship:', error)
      return c.json({ error: 'Failed to create relationship', details: error.message }, 500)
    }
    
    console.log('✅ Org relationship created:', relationship.id)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in create org relationship route:', error)
    return c.json({ error: 'Failed to create relationship', details: error.message }, 500)
  }
})

// Update an org-org relationship
app.put('/make-server-053bcd80/organizations/:id/org-relationships/:relationshipId', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const relationshipId = c.req.param('relationshipId')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('✏️ Updating org relationship:', relationshipId)
    
    // Verify user is owner OR admin member of this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    const isOwner = company.owner_id === userId
    
    let isAdmin = false
    if (!isOwner) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', organizationId)
        .eq('user_id', userId)
        .single()
      
      isAdmin = membership && ['owner', 'admin'].includes(membership.role)
    }
    
    if (!isOwner && !isAdmin) {
      return c.json({ error: 'Unauthorized - must be admin or owner' }, 403)
    }
    
    // Update relationship
    const updateData: any = {}
    if (body.relationship_type) updateData.relationship_type = body.relationship_type
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status) updateData.status = body.status
    
    const { data: relationship, error } = await supabase
      .from('organization_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .eq('organization_id', organizationId)
      .select(`
        *,
        related_organization:companies!organization_relationships_related_organization_id_fkey (
          id,
          name,
          logo_url,
          location,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error updating org relationship:', error)
      return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
    }
    
    console.log('✅ Org relationship updated:', relationshipId)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in update org relationship route:', error)
    return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
  }
})

// Delete an org-org relationship
app.delete('/make-server-053bcd80/organizations/:id/org-relationships/:relationshipId', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const relationshipId = c.req.param('relationshipId')
    const userId = c.get('userId')
    
    console.log('🗑️ Deleting org relationship:', relationshipId)
    
    // Verify user is owner OR admin member of this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    const isOwner = company.owner_id === userId
    
    let isAdmin = false
    if (!isOwner) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', organizationId)
        .eq('user_id', userId)
        .single()
      
      isAdmin = membership && ['owner', 'admin'].includes(membership.role)
    }
    
    if (!isOwner && !isAdmin) {
      return c.json({ error: 'Unauthorized - must be admin or owner' }, 403)
    }
    
    // Delete relationship
    const { error } = await supabase
      .from('organization_relationships')
      .delete()
      .eq('id', relationshipId)
      .eq('organization_id', organizationId)
    
    if (error) {
      console.error('❌ Error deleting org relationship:', error)
      return c.json({ error: 'Failed to delete relationship', details: error.message }, 500)
    }
    
    console.log('✅ Org relationship deleted:', relationshipId)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete org relationship route:', error)
    return c.json({ error: 'Failed to delete relationship', details: error.message }, 500)
  }
})

// Admin: Get ALL org-org relationships
app.get('/make-server-053bcd80/admin/org-relationships', requireAuth, requireAdmin, async (c) => {
  try {
    const status = c.req.query('status') // 'pending', 'verified', 'rejected', or 'all'
    
    console.log('🔗 [ADMIN] Fetching all org-org relationships...', { status })
    
    let query = supabase
      .from('organization_relationships')
      .select(`
        *,
        organization:companies!organization_relationships_organization_id_fkey (
          id,
          name,
          logo_url,
          location,
          country
        ),
        related_organization:companies!organization_relationships_related_organization_id_fkey (
          id,
          name,
          logo_url,
          location,
          country
        )
      `)
      .order('created_at', { ascending: false })
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data: relationships, error } = await query
    
    if (error) {
      console.error('❌ Error fetching org relationships:', error)
      return c.json({ error: 'Failed to fetch relationships', details: error.message }, 500)
    }
    
    console.log(`✅ [ADMIN] Fetched ${relationships?.length || 0} org-org relationships`)
    return c.json({ relationships: relationships || [] })
  } catch (error: any) {
    console.error('❌ Error in admin org relationships route:', error)
    return c.json({ error: 'Failed to fetch relationships', details: error.message }, 500)
  }
})

// Admin: Update org-org relationship status (verify/reject)
app.put('/make-server-053bcd80/admin/org-relationships/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const relationshipId = c.req.param('id')
    const body = await c.req.json()
    
    console.log('🔗 [ADMIN] Updating org relationship status:', relationshipId, body.status)
    
    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.relationship_type) updateData.relationship_type = body.relationship_type
    
    const { data: relationship, error } = await supabase
      .from('organization_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .select(`
        *,
        organization:companies!organization_relationships_organization_id_fkey (
          id,
          name,
          logo_url,
          location,
          country
        ),
        related_organization:companies!organization_relationships_related_organization_id_fkey (
          id,
          name,
          logo_url,
          location,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error updating org relationship:', error)
      return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Org relationship updated:', relationshipId)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in admin update org relationship route:', error)
    return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
  }
})

// End of org relationship routes
}
