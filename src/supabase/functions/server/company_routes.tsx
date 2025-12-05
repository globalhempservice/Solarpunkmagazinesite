import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { parseGoogleMapsUrl, isGoogleMapsUrl } from './google_maps_parser.tsx'

// Initialize Supabase client with SERVICE_ROLE_KEY for server operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper middleware for routes (passed from main server)
export function setupCompanyRoutes(app: Hono, requireAuth: any, requireAdmin: any) {

// ============================================================================
// COMPANY CATEGORIES - Public & Admin Routes
// ============================================================================

// Get all active categories (public)
app.get('/make-server-053bcd80/companies/categories', async (c) => {
  try {
    console.log('📂 Fetching company categories...')
    
    const { data: categories, error } = await supabase
      .from('company_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching categories:', error)
      return c.json({ error: 'Failed to fetch categories', details: error.message }, 500)
    }
    
    console.log(`✅ Fetched ${categories.length} categories`)
    return c.json(categories)
  } catch (error: any) {
    console.error('❌ Error in companies/categories route:', error)
    return c.json({ error: 'Failed to fetch categories', details: error.message }, 500)
  }
})

// Admin: Get all categories (including inactive)
app.get('/make-server-053bcd80/admin/categories', requireAuth, requireAdmin, async (c) => {
  try {
    console.log('📂 [ADMIN] Fetching all categories...')
    
    const { data: categories, error } = await supabase
      .from('company_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching categories:', error)
      return c.json({ error: 'Failed to fetch categories', details: error.message }, 500)
    }
    
    console.log(`✅ [ADMIN] Fetched ${categories.length} categories`)
    return c.json(categories)
  } catch (error: any) {
    console.error('❌ Error in admin/categories route:', error)
    return c.json({ error: 'Failed to fetch categories', details: error.message }, 500)
  }
})

// Admin: Create category
app.post('/make-server-053bcd80/admin/categories', requireAuth, requireAdmin, async (c) => {
  try {
    const { name, description, icon } = await c.req.json()
    
    if (!name || !name.trim()) {
      return c.json({ error: 'Category name is required' }, 400)
    }
    
    console.log('📂 [ADMIN] Creating category:', name)
    
    const { data: category, error } = await supabase
      .from('company_categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || 'Building2',
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return c.json({ error: 'Category with this name already exists' }, 400)
      }
      console.error('❌ Error creating category:', error)
      return c.json({ error: 'Failed to create category', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Category created:', category.id)
    return c.json(category)
  } catch (error: any) {
    console.error('❌ Error in create category route:', error)
    return c.json({ error: 'Failed to create category', details: error.message }, 500)
  }
})

// Admin: Update category
app.put('/make-server-053bcd80/admin/categories/:categoryId', requireAuth, requireAdmin, async (c) => {
  try {
    const categoryId = c.req.param('categoryId')
    const { name, description, icon, is_active } = await c.req.json()
    
    if (!name || !name.trim()) {
      return c.json({ error: 'Category name is required' }, 400)
    }
    
    console.log('📂 [ADMIN] Updating category:', categoryId)
    
    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || null
    }
    
    if (icon) updateData.icon = icon
    if (typeof is_active === 'boolean') updateData.is_active = is_active
    
    const { data: category, error } = await supabase
      .from('company_categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Category not found' }, 404)
      }
      console.error('❌ Error updating category:', error)
      return c.json({ error: 'Failed to update category', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Category updated:', category.id)
    return c.json(category)
  } catch (error: any) {
    console.error('❌ Error in update category route:', error)
    return c.json({ error: 'Failed to update category', details: error.message }, 500)
  }
})

// Admin: Delete category
app.delete('/make-server-053bcd80/admin/categories/:categoryId', requireAuth, requireAdmin, async (c) => {
  try {
    const categoryId = c.req.param('categoryId')
    
    console.log('📂 [ADMIN] Deleting category:', categoryId)
    
    // Check if any companies use this category
    const { count, error: countError } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)
    
    if (countError) {
      console.error('❌ Error checking category usage:', countError)
      return c.json({ error: 'Failed to check category usage', details: countError.message }, 500)
    }
    
    if (count && count > 0) {
      return c.json({ 
        error: `Cannot delete category: ${count} companies are using it` 
      }, 400)
    }
    
    const { error } = await supabase
      .from('company_categories')
      .delete()
      .eq('id', categoryId)
    
    if (error) {
      console.error('❌ Error deleting category:', error)
      return c.json({ error: 'Failed to delete category', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Category deleted:', categoryId)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete category route:', error)
    return c.json({ error: 'Failed to delete category', details: error.message }, 500)
  }
})

// ============================================================================
// COMPANIES - CRUD Operations
// ============================================================================

// Get all published companies (public)
app.get('/make-server-053bcd80/companies', async (c) => {
  try {
    console.log('🏢 Fetching published companies...')
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching companies:', error)
      return c.json({ error: 'Failed to fetch companies', details: error.message }, 500)
    }
    
    // Fetch category and badges for each company
    const companiesWithDetails = await Promise.all(
      companies.map(async (company) => {
        // Get category
        let category = null
        if (company.category_id) {
          const { data: categoryData } = await supabase
            .from('company_categories')
            .select('id, name, icon')
            .eq('id', company.category_id)
            .single()
          category = categoryData
        }
        
        // Get badges
        const { data: badges } = await supabase
          .from('company_badges')
          .select('*')
          .eq('company_id', company.id)
          .eq('verified', true)
        
        return {
          ...company,
          category,
          badges: badges || []
        }
      })
    )
    
    console.log(`✅ Fetched ${companies.length} published companies`)
    return c.json(companiesWithDetails)
  } catch (error: any) {
    console.error('❌ Error in companies route:', error)
    return c.json({ error: 'Failed to fetch companies', details: error.message }, 500)
  }
})

// Get user's companies (auth required)
app.get('/make-server-053bcd80/companies/my', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    console.log('🏢 Fetching companies for user:', userId)
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching user companies:', error)
      return c.json({ error: 'Failed to fetch companies', details: error.message }, 500)
    }
    
    // Fetch category and badges for each company
    const companiesWithDetails = await Promise.all(
      companies.map(async (company) => {
        // Get category
        let category = null
        if (company.category_id) {
          const { data: categoryData } = await supabase
            .from('company_categories')
            .select('id, name, icon')
            .eq('id', company.category_id)
            .single()
          category = categoryData
        }
        
        // Get badges
        const { data: badges } = await supabase
          .from('company_badges')
          .select('*')
          .eq('company_id', company.id)
        
        return {
          ...company,
          category,
          badges: badges || []
        }
      })
    )
    
    console.log(`✅ Fetched ${companies.length} companies for user`)
    return c.json(companiesWithDetails)
  } catch (error: any) {
    console.error('❌ Error in my companies route:', error)
    return c.json({ error: 'Failed to fetch companies', details: error.message }, 500)
  }
})

// Get single company by ID (public if published)
app.get('/make-server-053bcd80/companies/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log('🏢 Fetching company:', companyId)
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Company not found' }, 404)
      }
      console.error('❌ Error fetching company:', error)
      return c.json({ error: 'Failed to fetch company', details: error.message }, 500)
    }
    
    // Get category
    let category = null
    if (company.category_id) {
      const { data: categoryData } = await supabase
        .from('company_categories')
        .select('id, name, icon')
        .eq('id', company.category_id)
        .single()
      category = categoryData
    }
    
    // Get badges
    const { data: badges } = await supabase
      .from('company_badges')
      .select('*')
      .eq('company_id', company.id)
      .eq('verified', true)
    
    // Increment view count
    await supabase
      .from('companies')
      .update({ 
        view_count: (company.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', companyId)
    
    console.log('✅ Fetched company:', company.name)
    return c.json({
      ...company,
      category,
      badges: badges || []
    })
  } catch (error: any) {
    console.error('❌ Error in company detail route:', error)
    return c.json({ error: 'Failed to fetch company', details: error.message }, 500)
  }
})

// Create company (auth required)
app.post('/make-server-053bcd80/companies', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    const {
      name,
      description,
      website,
      logo_url,
      category,
      location,
      country,
      founded_year,
      company_size,
      contact_email,
      contact_phone,
      linkedin_url,
      twitter_url,
      instagram_url,
      facebook_url,
      is_association,
      is_published
    } = body
    
    // Sanitize company_size: convert legacy '1-10' to '2-10'
    let sanitizedCompanySize = company_size
    if (sanitizedCompanySize === '1-10') {
      sanitizedCompanySize = '2-10'
      console.log('⚠️ Converted legacy company_size from "1-10" to "2-10"')
    }
    
    // Validate required fields
    if (!name || !name.trim()) {
      return c.json({ error: 'Company name is required' }, 400)
    }
    if (!description || !description.trim()) {
      return c.json({ error: 'Company description is required' }, 400)
    }
    if (!category) {
      return c.json({ error: 'Company category is required' }, 400)
    }
    
    console.log('🏢 Creating company:', name)
    
    // Find category by name
    const { data: categoryData, error: categoryError } = await supabase
      .from('company_categories')
      .select('id, name')
      .eq('name', category)
      .single()
    
    if (categoryError || !categoryData) {
      return c.json({ error: 'Invalid category' }, 400)
    }
    
    // Create company
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: name.trim(),
        description: description.trim(),
        website: website?.trim() || null,
        logo_url: logo_url || null,
        category_id: categoryData.id,
        location: location?.trim() || null,
        country: country?.trim() || null,
        founded_year: founded_year || null,
        company_size: sanitizedCompanySize || null,
        contact_email: contact_email?.trim() || null,
        contact_phone: contact_phone?.trim() || null,
        linkedin_url: linkedin_url?.trim() || null,
        twitter_url: twitter_url?.trim() || null,
        instagram_url: instagram_url?.trim() || null,
        facebook_url: facebook_url?.trim() || null,
        is_association: is_association || false,
        is_published: is_published || false,
        owner_id: userId
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating company:', error)
      return c.json({ error: 'Failed to create company', details: error.message }, 500)
    }
    
    console.log('✅ Company created:', company.id)
    return c.json({
      ...company,
      category: categoryData,
      badges: []
    })
  } catch (error: any) {
    console.error('❌ Error in create company route:', error)
    return c.json({ error: 'Failed to create company', details: error.message }, 500)
  }
})

// Update company (auth required, owner only)
app.put('/make-server-053bcd80/companies/:companyId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const companyId = c.req.param('companyId')
    const body = await c.req.json()
    
    console.log('🏢 Updating company:', companyId)
    
    // Check ownership
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (fetchError || !existingCompany) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    if (existingCompany.owner_id !== userId) {
      return c.json({ error: 'Unauthorized: You can only edit your own companies' }, 403)
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name.trim()
    if (body.description) updateData.description = body.description.trim()
    if (body.website !== undefined) updateData.website = body.website?.trim() || null
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null
    if (body.location !== undefined) updateData.location = body.location?.trim() || null
    if (body.country !== undefined) updateData.country = body.country?.trim() || null
    if (body.founded_year !== undefined) updateData.founded_year = body.founded_year || null
    if (body.company_size !== undefined) {
      // Sanitize company_size: convert legacy '1-10' to '2-10'
      let sanitizedSize = body.company_size
      if (sanitizedSize === '1-10') {
        sanitizedSize = '2-10'
        console.log('⚠️ Converted legacy company_size from "1-10" to "2-10" in update')
      }
      updateData.company_size = sanitizedSize || null
    }
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email?.trim() || null
    if (body.contact_phone !== undefined) updateData.contact_phone = body.contact_phone?.trim() || null
    if (body.linkedin_url !== undefined) updateData.linkedin_url = body.linkedin_url?.trim() || null
    if (body.twitter_url !== undefined) updateData.twitter_url = body.twitter_url?.trim() || null
    if (body.instagram_url !== undefined) updateData.instagram_url = body.instagram_url?.trim() || null
    if (body.facebook_url !== undefined) updateData.facebook_url = body.facebook_url?.trim() || null
    if (typeof body.is_association === 'boolean') updateData.is_association = body.is_association
    if (typeof body.is_published === 'boolean') updateData.is_published = body.is_published
    
    // Handle category update
    if (body.category_id) {
      // Direct UUID provided
      updateData.category_id = body.category_id
    } else if (body.category) {
      // Legacy: category name provided (convert to UUID)
      const { data: categoryData, error: categoryError } = await supabase
        .from('company_categories')
        .select('id')
        .eq('name', body.category)
        .single()
      
      if (!categoryError && categoryData) {
        updateData.category_id = categoryData.id
      }
    }
    
    // Update company
    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating company:', error)
      return c.json({ error: 'Failed to update company', details: error.message }, 500)
    }
    
    // Get category
    let category = null
    if (company.category_id) {
      const { data: categoryData } = await supabase
        .from('company_categories')
        .select('id, name, icon')
        .eq('id', company.category_id)
        .single()
      category = categoryData
    }
    
    // Get badges
    const { data: badges } = await supabase
      .from('company_badges')
      .select('*')
      .eq('company_id', company.id)
    
    console.log('✅ Company updated:', company.id)
    return c.json({
      ...company,
      category,
      badges: badges || []
    })
  } catch (error: any) {
    console.error('❌ Error in update company route:', error)
    return c.json({ error: 'Failed to update company', details: error.message }, 500)
  }
})

// Delete company (auth required, owner only)
app.delete('/make-server-053bcd80/companies/:companyId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const companyId = c.req.param('companyId')
    
    console.log('🏢 Deleting company:', companyId)
    
    // Check ownership
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (fetchError || !existingCompany) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    if (existingCompany.owner_id !== userId) {
      return c.json({ error: 'Unauthorized: You can only delete your own companies' }, 403)
    }
    
    // Delete company (cascades to badges and requests)
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) {
      console.error('❌ Error deleting company:', error)
      return c.json({ error: 'Failed to delete company', details: error.message }, 500)
    }
    
    console.log('✅ Company deleted:', companyId)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete company route:', error)
    return c.json({ error: 'Failed to delete company', details: error.message }, 500)
  }
})

// ============================================================================
// BADGE REQUESTS - Request & Management System
// ============================================================================

// Get badge requests for user's companies
app.get('/make-server-053bcd80/badge-requests/my', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    console.log('🎖️ Fetching badge requests for user:', userId)
    
    // Get user's companies
    const { data: userCompanies } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
    
    if (!userCompanies || userCompanies.length === 0) {
      return c.json([])
    }
    
    const companyIds = userCompanies.map(c => c.id)
    
    // Get badge requests
    const { data: requests, error } = await supabase
      .from('badge_requests')
      .select('*')
      .in('company_id', companyIds)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching badge requests:', error)
      return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
    }
    
    // Fetch company and association details for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', request.company_id)
          .single()
        
        const { data: association } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', request.association_id)
          .single()
        
        return {
          ...request,
          company,
          association
        }
      })
    )
    
    console.log(`✅ Fetched ${requests.length} badge requests`)
    return c.json(requestsWithDetails)
  } catch (error: any) {
    console.error('❌ Error in my badge requests route:', error)
    return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
  }
})

// Get badge requests to user's associations
app.get('/make-server-053bcd80/badge-requests/to-my-associations', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    console.log('🎖️ Fetching badge requests to user associations:', userId)
    
    // Get user's associations
    const { data: associations } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_association', true)
    
    if (!associations || associations.length === 0) {
      return c.json([])
    }
    
    const associationIds = associations.map(a => a.id)
    
    // Get badge requests
    const { data: requests, error } = await supabase
      .from('badge_requests')
      .select('*')
      .in('association_id', associationIds)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching badge requests:', error)
      return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
    }
    
    // Fetch company and association details for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, description, website')
          .eq('id', request.company_id)
          .single()
        
        const { data: association } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', request.association_id)
          .single()
        
        return {
          ...request,
          company,
          association
        }
      })
    )
    
    console.log(`✅ Fetched ${requests.length} badge requests to associations`)
    return c.json(requestsWithDetails)
  } catch (error: any) {
    console.error('❌ Error in association badge requests route:', error)
    return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
  }
})

// Create badge request
app.post('/make-server-053bcd80/badge-requests', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const { company_id, association_id, badge_type, message, supporting_documents_urls } = await c.req.json()
    
    if (!company_id || !association_id || !badge_type) {
      return c.json({ error: 'Company ID, Association ID, and Badge Type are required' }, 400)
    }
    
    console.log('🎖️ Creating badge request:', { company_id, association_id, badge_type })
    
    // Verify company ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', company_id)
      .single()
    
    if (companyError || !company) {
      return c.json({ error: 'Company not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      return c.json({ error: 'Unauthorized: You can only request badges for your own companies' }, 403)
    }
    
    // Verify association exists and is an association
    const { data: association, error: assocError } = await supabase
      .from('companies')
      .select('is_association, name')
      .eq('id', association_id)
      .single()
    
    if (assocError || !association) {
      return c.json({ error: 'Association not found' }, 404)
    }
    
    if (!association.is_association) {
      return c.json({ error: 'Target company is not an association' }, 400)
    }
    
    // Create request
    const { data: request, error } = await supabase
      .from('badge_requests')
      .insert({
        company_id,
        association_id,
        badge_type,
        message: message?.trim() || null,
        supporting_documents_urls: supporting_documents_urls || [],
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return c.json({ error: 'You already have a pending request for this badge' }, 400)
      }
      console.error('❌ Error creating badge request:', error)
      return c.json({ error: 'Failed to create request', details: error.message }, 500)
    }
    
    // Fetch company and association details
    const { data: companyDetails } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', company_id)
      .single()
    
    const { data: associationDetails } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', association_id)
      .single()
    
    console.log('✅ Badge request created:', request.id)
    return c.json({
      ...request,
      company: companyDetails,
      association: associationDetails
    })
  } catch (error: any) {
    console.error('❌ Error in create badge request route:', error)
    return c.json({ error: 'Failed to create request', details: error.message }, 500)
  }
})

// Approve/reject badge request (association owner only)
app.put('/make-server-053bcd80/badge-requests/:requestId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const requestId = c.req.param('requestId')
    const { status, review_message } = await c.req.json()
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Status must be "approved" or "rejected"' }, 400)
    }
    
    console.log('🎖️ Reviewing badge request:', requestId, status)
    
    // Get request
    const { data: request, error: requestError } = await supabase
      .from('badge_requests')
      .select('*')
      .eq('id', requestId)
      .single()
    
    if (requestError || !request) {
      return c.json({ error: 'Request not found' }, 404)
    }
    
    // Get association info
    const { data: association } = await supabase
      .from('companies')
      .select('id, owner_id, name')
      .eq('id', request.association_id)
      .single()
    
    if (!association) {
      return c.json({ error: 'Association not found' }, 404)
    }
    
    // Verify user owns the association
    if (association.owner_id !== userId) {
      return c.json({ error: 'Unauthorized: You can only review requests to your own associations' }, 403)
    }
    
    if (request.status !== 'pending') {
      return c.json({ error: 'Request has already been reviewed' }, 400)
    }
    
    // Update request
    const { data: updatedRequest, error } = await supabase
      .from('badge_requests')
      .update({
        status,
        review_message: review_message?.trim() || null,
        reviewed_by_user_id: userId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating badge request:', error)
      return c.json({ error: 'Failed to update request', details: error.message }, 500)
    }
    
    // If approved, create badge
    if (status === 'approved') {
      const { error: badgeError } = await supabase
        .from('company_badges')
        .insert({
          company_id: request.company_id,
          badge_type: request.badge_type,
          badge_name: `${association.name} Member`,
          badge_description: `Verified member of ${association.name}`,
          badge_icon: 'Award',
          badge_color: 'amber',
          issued_by_association_id: request.association_id,
          issued_by_association_name: association.name,
          verified: true,
          verification_date: new Date().toISOString()
        })
      
      if (badgeError) {
        console.error('❌ Error creating badge after approval:', badgeError)
        // Don't fail the request update, badge can be created manually
      } else {
        console.log('✅ Badge created after approval')
      }
    }
    
    console.log('✅ Badge request reviewed:', requestId, status)
    return c.json(updatedRequest)
  } catch (error: any) {
    console.error('❌ Error in review badge request route:', error)
    return c.json({ error: 'Failed to review request', details: error.message }, 500)
  }
})

// ============================================================================
// ADMIN ROUTES - Company & Badge Management
// ============================================================================

// Admin: Get all companies with owner info
app.get('/make-server-053bcd80/admin/companies', requireAuth, requireAdmin, async (c) => {
  try {
    console.log('🏢 [ADMIN] Fetching all companies...')
    console.log('🏢 [ADMIN] Supabase URL:', supabaseUrl)
    
    // First check if the companies table exists and is accessible
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ [ADMIN] Error fetching companies from database:', error)
      console.error('❌ [ADMIN] Error code:', error.code)
      console.error('❌ [ADMIN] Error message:', error.message)
      console.error('❌ [ADMIN] Error details:', JSON.stringify(error, null, 2))
      
      // Return empty array instead of error to prevent JSON parsing issues
      return c.json([])
    }
    
    if (!companies || companies.length === 0) {
      console.log('ℹ️ [ADMIN] No companies found in database')
      return c.json([])
    }
    
    console.log(`✅ [ADMIN] Found ${companies.length} companies, fetching details...`)
    
    // Fetch owner email, category and badges for each company
    const companiesWithDetails = await Promise.all(
      companies.map(async (company) => {
        try {
          // Get owner email
          let owner_email = 'Unknown'
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(company.owner_id)
            owner_email = userData?.user?.email || 'Unknown'
          } catch (err) {
            console.warn('⚠️ Could not fetch user email for:', company.owner_id)
          }
          
          // Get category
          let category = null
          if (company.category_id) {
            try {
              const { data: categoryData } = await supabase
                .from('company_categories')
                .select('id, name, icon')
                .eq('id', company.category_id)
                .single()
              category = categoryData
            } catch (err) {
              console.warn('⚠️ Could not fetch category for company:', company.id)
            }
          }
          
          // Get badges
          let badges = []
          try {
            const { data: badgeData } = await supabase
              .from('company_badges')
              .select('*')
              .eq('company_id', company.id)
            badges = badgeData || []
          } catch (err) {
            console.warn('⚠️ Could not fetch badges for company:', company.id)
          }
          
          return {
            ...company,
            category,
            owner_email,
            badges
          }
        } catch (err) {
          console.error('❌ Error processing company:', company.id, err)
          return {
            ...company,
            category: null,
            owner_email: 'Error',
            badges: []
          }
        }
      })
    )
    
    console.log(`✅ [ADMIN] Successfully fetched ${companiesWithDetails.length} companies with details`)
    return c.json(companiesWithDetails)
  } catch (error: any) {
    console.error('❌ [ADMIN] Catastrophic error in admin companies route:', error)
    console.error('❌ [ADMIN] Error stack:', error.stack)
    // Return empty array to prevent JSON parsing issues
    return c.json([])
  }
})

// Admin: Add badge to company directly
app.post('/make-server-053bcd80/admin/companies/:companyId/badges', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const { badge_type, badge_name, badge_description, association_id, association_name } = await c.req.json()
    
    if (!badge_type || !badge_name) {
      return c.json({ error: 'Badge type and name are required' }, 400)
    }
    
    console.log('🎖️ [ADMIN] Adding badge to company:', companyId)
    
    const { data: badge, error } = await supabase
      .from('company_badges')
      .insert({
        company_id: companyId,
        badge_type,
        badge_name,
        badge_description: badge_description || null,
        badge_icon: 'Award',
        badge_color: 'amber',
        issued_by_association_id: association_id || null,
        issued_by_association_name: association_name || null,
        verified: true,
        verification_date: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint
        return c.json({ error: 'Company already has this badge from this association' }, 400)
      }
      console.error('❌ Error adding badge:', error)
      return c.json({ error: 'Failed to add badge', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Badge added:', badge.id)
    return c.json(badge)
  } catch (error: any) {
    console.error('❌ Error in admin add badge route:', error)
    return c.json({ error: 'Failed to add badge', details: error.message }, 500)
  }
})

// Admin: Remove badge from company
app.delete('/make-server-053bcd80/admin/companies/:companyId/badges/:badgeId', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const badgeId = c.req.param('badgeId')
    
    console.log('🎖️ [ADMIN] Removing badge:', badgeId, 'from company:', companyId)
    
    const { error } = await supabase
      .from('company_badges')
      .delete()
      .eq('id', badgeId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error removing badge:', error)
      return c.json({ error: 'Failed to remove badge', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Badge removed')
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in admin remove badge route:', error)
    return c.json({ error: 'Failed to remove badge', details: error.message }, 500)
  }
})

// Admin: Update company (superadmin can update any company)
app.put('/make-server-053bcd80/admin/companies/:companyId', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const body = await c.req.json()
    
    console.log('🏢 [ADMIN] Updating company:', companyId)
    
    // Admin can update any company, no ownership check needed
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.website !== undefined) updateData.website = body.website?.trim() || null
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null
    if (body.location !== undefined) updateData.location = body.location?.trim() || null
    if (body.country !== undefined) updateData.country = body.country?.trim() || null
    if (body.founded_year !== undefined) updateData.founded_year = body.founded_year || null
    if (body.company_size !== undefined) {
      // Sanitize company_size: convert legacy '1-10' to '2-10'
      let sanitizedSize = body.company_size
      if (sanitizedSize === '1-10') {
        sanitizedSize = '2-10'
        console.log('⚠️ Converted legacy company_size from \"1-10\" to \"2-10\" in admin update')
      }
      updateData.company_size = sanitizedSize || null
    }
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email?.trim() || null
    if (body.contact_phone !== undefined) updateData.contact_phone = body.contact_phone?.trim() || null
    if (body.linkedin_url !== undefined) updateData.linkedin_url = body.linkedin_url?.trim() || null
    if (body.twitter_url !== undefined) updateData.twitter_url = body.twitter_url?.trim() || null
    if (body.instagram_url !== undefined) updateData.instagram_url = body.instagram_url?.trim() || null
    if (body.facebook_url !== undefined) updateData.facebook_url = body.facebook_url?.trim() || null
    if (typeof body.is_association === 'boolean') updateData.is_association = body.is_association
    if (typeof body.is_published === 'boolean') updateData.is_published = body.is_published
    
    // Handle category update
    if (body.category_id) {
      // Direct UUID provided
      updateData.category_id = body.category_id
    } else if (body.category) {
      // Legacy: category name provided (convert to UUID)
      const { data: categoryData, error: categoryError } = await supabase
        .from('company_categories')
        .select('id')
        .eq('name', body.category)
        .single()
      
      if (!categoryError && categoryData) {
        updateData.category_id = categoryData.id
      }
    }
    
    // Update company
    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ [ADMIN] Error updating company:', error)
      return c.json({ error: 'Failed to update company', details: error.message }, 500)
    }
    
    // Get category
    let category = null
    if (company.category_id) {
      const { data: categoryData } = await supabase
        .from('company_categories')
        .select('id, name, icon')
        .eq('id', company.category_id)
        .single()
      category = categoryData
    }
    
    // Get badges
    const { data: badges } = await supabase
      .from('company_badges')
      .select('*')
      .eq('company_id', company.id)
    
    console.log('✅ [ADMIN] Company updated:', company.id)
    return c.json({
      ...company,
      category,
      badges: badges || []
    })
  } catch (error: any) {
    console.error('❌ [ADMIN] Error in admin update company route:', error)
    return c.json({ error: 'Failed to update company', details: error.message }, 500)
  }
})

// Admin: Delete company (superadmin can delete any company)
app.delete('/make-server-053bcd80/admin/companies/:companyId', requireAuth, requireAdmin, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    
    console.log('🏢 [ADMIN] Deleting company:', companyId)
    
    // Admin can delete any company, no ownership check needed
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) {
      console.error('❌ [ADMIN] Error deleting company:', error)
      return c.json({ error: 'Failed to delete company', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Company deleted:', companyId)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ [ADMIN] Error in delete company route:', error)
    return c.json({ error: 'Failed to delete company', details: error.message }, 500)
  }
})

// Admin: Get all badge requests
app.get('/make-server-053bcd80/admin/badge-requests', requireAuth, requireAdmin, async (c) => {
  try {
    console.log('🎖️ [ADMIN] Fetching all badge requests...')
    
    const { data: requests, error } = await supabase
      .from('badge_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching badge requests:', error)
      return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
    }
    
    // Fetch company and association details for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, description')
          .eq('id', request.company_id)
          .single()
        
        const { data: association } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', request.association_id)
          .single()
        
        return {
          ...request,
          company,
          association
        }
      })
    )
    
    console.log(`✅ [ADMIN] Fetched ${requests.length} badge requests`)
    return c.json(requestsWithDetails)
  } catch (error: any) {
    console.error('❌ Error in admin badge requests route:', error)
    return c.json({ error: 'Failed to fetch requests', details: error.message }, 500)
  }
})

// ============================================================================
// ORGANIZATION PUBLICATIONS - Article Management Routes
// ============================================================================

// Get all publications for an organization (PUBLIC - shows approved only unless owner)
app.get('/make-server-053bcd80/companies/:companyId/publications', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log(`📰 Fetching publications for organization: ${companyId}`)
    
    const { data: publications, error } = await supabase
      .from('organization_publications')
      .select(`
        *,
        article:articles(
          id,
          title,
          content,
          author_id,
          created_at,
          publish_date,
          featured_image_url,
          category,
          tags,
          reading_time_minutes,
          view_count
        )
      `)
      .eq('organization_id', companyId)
      .eq('is_approved', true)
      .order('display_order', { ascending: true })
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching publications:', error)
      return c.json({ error: 'Failed to fetch publications', details: error.message }, 500)
    }
    
    console.log(`✅ Fetched ${publications?.length || 0} publications`)
    return c.json(publications || [])
  } catch (error: any) {
    console.error('❌ Error in publications route:', error)
    return c.json({ error: 'Failed to fetch publications', details: error.message }, 500)
  }
})

// Link an article to organization (requires auth + ownership)
app.post('/make-server-053bcd80/companies/:companyId/publications', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const { article_id, role = 'author', notes } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`📰 Linking article ${article_id} to organization ${companyId}`)
    
    if (!article_id) {
      return c.json({ error: 'article_id is required' }, 400)
    }
    
    // Verify user owns the organization
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id, name')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      console.error('❌ Organization not found:', companyError)
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      console.error('❌ User does not own organization')
      return c.json({ error: 'You do not own this organization' }, 403)
    }
    
    // Verify article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title')
      .eq('id', article_id)
      .single()
    
    if (articleError || !article) {
      console.error('❌ Article not found:', articleError)
      return c.json({ error: 'Article not found' }, 404)
    }
    
    // Validate role
    const validRoles = ['author', 'co-author', 'sponsor', 'featured']
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Invalid role. Must be one of: author, co-author, sponsor, featured' }, 400)
    }
    
    // Create the publication link
    const { data: publication, error } = await supabase
      .from('organization_publications')
      .insert({
        organization_id: companyId,
        article_id,
        role,
        notes: notes || null,
        added_by: userId,
        is_approved: true, // Auto-approve for now (owner-added content)
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .select(`
        *,
        article:articles(
          id,
          title,
          content,
          author_id,
          created_at,
          publish_date,
          featured_image_url,
          category,
          tags,
          reading_time_minutes,
          view_count
        )
      `)
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.error('❌ Article already linked to organization')
        return c.json({ error: 'This article is already linked to this organization' }, 400)
      }
      console.error('❌ Error linking article:', error)
      return c.json({ error: 'Failed to link article', details: error.message }, 500)
    }
    
    console.log(`✅ Article "${article.title}" linked to organization "${company.name}"`)
    return c.json(publication)
  } catch (error: any) {
    console.error('❌ Error in link article route:', error)
    return c.json({ error: 'Failed to link article', details: error.message }, 500)
  }
})

// Unlink article from organization
app.delete('/make-server-053bcd80/companies/:companyId/publications/:publicationId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const publicationId = c.req.param('publicationId')
    const userId = c.get('userId')
    
    console.log(`📰 Unlinking publication ${publicationId} from organization ${companyId}`)
    
    // Verify user owns the organization
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      console.error('❌ Organization not found:', companyError)
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      console.error('❌ User does not own organization')
      return c.json({ error: 'You do not own this organization' }, 403)
    }
    
    // Delete the publication link
    const { error } = await supabase
      .from('organization_publications')
      .delete()
      .eq('id', publicationId)
      .eq('organization_id', companyId)
    
    if (error) {
      console.error('❌ Error unlinking article:', error)
      return c.json({ error: 'Failed to unlink article', details: error.message }, 500)
    }
    
    console.log(`✅ Publication unlinked successfully`)
    return c.json({ success: true, message: 'Article unlinked from organization' })
  } catch (error: any) {
    console.error('❌ Error in unlink article route:', error)
    return c.json({ error: 'Failed to unlink article', details: error.message }, 500)
  }
})

// Update publication metadata (role, notes, display order)
app.put('/make-server-053bcd80/companies/:companyId/publications/:publicationId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const publicationId = c.req.param('publicationId')
    const { role, notes, display_order } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`📰 Updating publication ${publicationId}`)
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company || company.owner_id !== userId) {
      console.error('❌ Unauthorized access attempt')
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // Build update object
    const updateData: any = {}
    if (role) {
      const validRoles = ['author', 'co-author', 'sponsor', 'featured']
      if (!validRoles.includes(role)) {
        return c.json({ error: 'Invalid role. Must be one of: author, co-author, sponsor, featured' }, 400)
      }
      updateData.role = role
    }
    if (notes !== undefined) updateData.notes = notes
    if (display_order !== undefined) updateData.display_order = display_order
    
    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No fields to update' }, 400)
    }
    
    // Update publication
    const { data: publication, error } = await supabase
      .from('organization_publications')
      .update(updateData)
      .eq('id', publicationId)
      .eq('organization_id', companyId)
      .select(`
        *,
        article:articles(
          id,
          title,
          content,
          author_id,
          created_at,
          publish_date,
          featured_image_url,
          category,
          tags,
          reading_time_minutes,
          view_count
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error updating publication:', error)
      return c.json({ error: 'Failed to update publication', details: error.message }, 500)
    }
    
    console.log(`✅ Publication updated successfully`)
    return c.json(publication)
  } catch (error: any) {
    console.error('❌ Error in update publication route:', error)
    return c.json({ error: 'Failed to update publication', details: error.message }, 500)
  }
})

// Get user's articles (for linking dropdown)
app.get('/make-server-053bcd80/users/:userId/articles', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId')
    const requestingUserId = c.get('userId')
    
    // Users can only fetch their own articles (or admins can fetch any)
    const isAdmin = c.get('isAdmin')
    if (userId !== requestingUserId && !isAdmin) {
      console.error('❌ Unauthorized access to user articles')
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    console.log(`📰 Fetching articles for user: ${userId}`)
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, created_at, publish_date, category, tags, featured_image_url, reading_time_minutes')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching user articles:', error)
      return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
    }
    
    console.log(`✅ Fetched ${articles?.length || 0} articles`)
    return c.json(articles || [])
  } catch (error: any) {
    console.error('❌ Error in user articles route:', error)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})

// Get publication statistics for an organization
app.get('/make-server-053bcd80/companies/:companyId/publications/stats', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log(`📊 Fetching publication stats for organization: ${companyId}`)
    
    const { data: stats, error } = await supabase
      .from('organization_publications')
      .select('role, article:articles(view_count)')
      .eq('organization_id', companyId)
      .eq('is_approved', true)
    
    if (error) {
      console.error('❌ Error fetching publication stats:', error)
      return c.json({ error: 'Failed to fetch stats', details: error.message }, 500)
    }
    
    const result = {
      total: stats?.length || 0,
      by_role: {
        author: stats?.filter(p => p.role === 'author').length || 0,
        'co-author': stats?.filter(p => p.role === 'co-author').length || 0,
        sponsor: stats?.filter(p => p.role === 'sponsor').length || 0,
        featured: stats?.filter(p => p.role === 'featured').length || 0
      },
      total_views: stats?.reduce((sum, p) => sum + (p.article?.view_count || 0), 0) || 0
    }
    
    console.log(`✅ Stats calculated: ${result.total} publications, ${result.total_views} total views`)
    return c.json(result)
  } catch (error: any) {
    console.error('❌ Error in publication stats route:', error)
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500)
  }
})

// ============================================================================
// ORGANIZATION MEMBERS MANAGEMENT
// ============================================================================

// Get all members of an organization
app.get('/make-server-053bcd80/organizations/:companyId/members', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log(`👥 Fetching members for organization: ${companyId}`)
    
    const { data: members, error } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', companyId)
      .order('joined_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching members:', error)
      return c.json({ error: 'Failed to fetch members', details: error.message }, 500)
    }
    
    // Fetch user details for each member using admin client
    const formattedMembers = await Promise.all(
      (members || []).map(async (m) => {
        let email = 'Unknown'
        let name = 'Unknown'
        
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(m.user_id)
          if (!userError && userData?.user) {
            email = userData.user.email || 'Unknown'
            name = userData.user.user_metadata?.full_name || 
                   userData.user.user_metadata?.name || 
                   email.split('@')[0]
          }
        } catch (err) {
          console.warn(`⚠️ Could not fetch user data for ${m.user_id}:`, err)
        }
        
        return {
          id: m.id,
          userId: m.user_id,
          email,
          name,
          role: m.role,
          title: m.title,
          canEdit: m.can_edit,
          canManageBadges: m.can_manage_badges,
          canManageMembers: m.can_manage_members,
          invitedBy: m.invited_by,
          joinedAt: m.joined_at
        }
      })
    )
    
    console.log(`✅ Fetched ${formattedMembers.length} members`)
    return c.json({ members: formattedMembers })
  } catch (error: any) {
    console.error('❌ Error in members route:', error)
    return c.json({ error: 'Failed to fetch members', details: error.message }, 500)
  }
})

// Invite a new member to organization
app.post('/make-server-053bcd80/organizations/:companyId/members/invite', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const { email, role, title, permissions } = await c.req.json()
    const inviterId = c.get('userId')
    
    console.log(`📨 Inviting member ${email} to organization ${companyId}`)
    
    // Verify inviter has permission
    const { data: inviter } = await supabase
      .from('company_members')
      .select('role, can_manage_members')
      .eq('company_id', companyId)
      .eq('user_id', inviterId)
      .single()
    
    // Check if user is owner or admin/member with permission
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const isOwner = company?.owner_id === inviterId
    const canInvite = isOwner || inviter?.role === 'admin' || inviter?.can_manage_members
    
    if (!canInvite) {
      return c.json({ error: 'You do not have permission to invite members' }, 403)
    }
    
    // Find user by email using listUsers
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return c.json({ error: 'Failed to fetch users', details: userError.message }, 500)
    }
    
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return c.json({ error: 'User not found. They must sign up first.' }, 404)
    }
    
    // Check if already a member
    const { data: existing } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single()
    
    if (existing) {
      return c.json({ error: 'User is already a member of this organization' }, 400)
    }
    
    // Add member
    const { data: newMember, error } = await supabase
      .from('company_members')
      .insert({
        company_id: companyId,
        user_id: user.id,
        role: role || 'member',
        title: title || null,
        can_edit: permissions?.canEdit || false,
        can_manage_badges: permissions?.canManageBadges || false,
        can_manage_members: permissions?.canManageMembers || false,
        invited_by: inviterId
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error adding member:', error)
      return c.json({ error: 'Failed to add member', details: error.message }, 500)
    }
    
    console.log(`✅ Member ${email} invited successfully`)
    return c.json({ success: true, member: newMember })
  } catch (error: any) {
    console.error('❌ Error in invite member route:', error)
    return c.json({ error: 'Failed to invite member', details: error.message }, 500)
  }
})

// Update member role
app.put('/make-server-053bcd80/organizations/:companyId/members/:memberId/role', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const memberId = c.req.param('memberId')
    const { role } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`🔄 Updating member ${memberId} role to ${role}`)
    
    // Verify user has permission (owner or admin)
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const { data: userMember } = await supabase
      .from('company_members')
      .select('role, can_manage_members')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()
    
    const isOwner = company?.owner_id === userId
    const canManage = isOwner || userMember?.role === 'admin' || userMember?.can_manage_members
    
    if (!canManage) {
      return c.json({ error: 'You do not have permission to update member roles' }, 403)
    }
    
    // Update role
    const { error } = await supabase
      .from('company_members')
      .update({ role })
      .eq('id', memberId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error updating role:', error)
      return c.json({ error: 'Failed to update role', details: error.message }, 500)
    }
    
    console.log(`✅ Member role updated successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in update role route:', error)
    return c.json({ error: 'Failed to update role', details: error.message }, 500)
  }
})

// Update member permissions
app.put('/make-server-053bcd80/organizations/:companyId/members/:memberId/permissions', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const memberId = c.req.param('memberId')
    const { canEdit, canManageBadges, canManageMembers, title } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`🔄 Updating member ${memberId} permissions`)
    
    // Verify user has permission
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const { data: userMember } = await supabase
      .from('company_members')
      .select('role, can_manage_members')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()
    
    const isOwner = company?.owner_id === userId
    const canManage = isOwner || userMember?.role === 'admin' || userMember?.can_manage_members
    
    if (!canManage) {
      return c.json({ error: 'You do not have permission to update member permissions' }, 403)
    }
    
    // Update permissions
    const updates: any = {}
    if (canEdit !== undefined) updates.can_edit = canEdit
    if (canManageBadges !== undefined) updates.can_manage_badges = canManageBadges
    if (canManageMembers !== undefined) updates.can_manage_members = canManageMembers
    if (title !== undefined) updates.title = title
    
    const { error } = await supabase
      .from('company_members')
      .update(updates)
      .eq('id', memberId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error updating permissions:', error)
      return c.json({ error: 'Failed to update permissions', details: error.message }, 500)
    }
    
    console.log(`✅ Member permissions updated successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in update permissions route:', error)
    return c.json({ error: 'Failed to update permissions', details: error.message }, 500)
  }
})

// Remove member from organization
app.delete('/make-server-053bcd80/organizations/:companyId/members/:memberId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const memberId = c.req.param('memberId')
    const userId = c.get('userId')
    
    console.log(`🗑️ Removing member ${memberId} from organization ${companyId}`)
    
    // Get member being removed
    const { data: memberToRemove } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('id', memberId)
      .single()
    
    // Verify user has permission (owner, admin, or removing self)
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const { data: userMember } = await supabase
      .from('company_members')
      .select('role, can_manage_members')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()
    
    const isOwner = company?.owner_id === userId
    const isSelf = memberToRemove?.user_id === userId
    const canManage = isOwner || userMember?.role === 'admin' || userMember?.can_manage_members
    
    // Can't remove the owner
    if (memberToRemove?.user_id === company?.owner_id) {
      return c.json({ error: 'Cannot remove the organization owner' }, 400)
    }
    
    if (!isSelf && !canManage) {
      return c.json({ error: 'You do not have permission to remove members' }, 403)
    }
    
    // Remove member
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error removing member:', error)
      return c.json({ error: 'Failed to remove member', details: error.message }, 500)
    }
    
    console.log(`✅ Member removed successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in remove member route:', error)
    return c.json({ error: 'Failed to remove member', details: error.message }, 500)
  }
})

// ============================================================================
// ORGANIZATION BADGES MANAGEMENT
// ============================================================================

// Get all badges for an organization
app.get('/make-server-053bcd80/organizations/:companyId/badges', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log(`🏅 Fetching badges for organization: ${companyId}`)
    
    const { data: badges, error } = await supabase
      .from('company_badges')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching badges:', error)
      return c.json({ error: 'Failed to fetch badges', details: error.message }, 500)
    }
    
    console.log(`✅ Fetched ${badges?.length || 0} badges`)
    return c.json({ badges: badges || [] })
  } catch (error: any) {
    console.error('❌ Error in badges route:', error)
    return c.json({ error: 'Failed to fetch badges', details: error.message }, 500)
  }
})

// Create a badge request for organization
app.post('/make-server-053bcd80/organizations/:companyId/badges', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const { badgeType, name, description, icon, evidenceUrl, notes } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`🏅 Creating badge request for organization ${companyId}`)
    
    // Verify user has permission
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const { data: userMember } = await supabase
      .from('company_members')
      .select('role, can_manage_badges')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()
    
    const isOwner = company?.owner_id === userId
    const canManage = isOwner || userMember?.role === 'admin' || userMember?.can_manage_badges
    
    if (!canManage) {
      return c.json({ error: 'You do not have permission to request badges' }, 403)
    }
    
    // Check if badge already exists
    const { data: existing } = await supabase
      .from('company_badges')
      .select('id')
      .eq('company_id', companyId)
      .eq('badge_type', badgeType)
      .single()
    
    if (existing) {
      return c.json({ error: 'This badge already exists for your organization' }, 400)
    }
    
    // Create badge request (unverified by default)
    const { data: badge, error } = await supabase
      .from('company_badges')
      .insert({
        company_id: companyId,
        badge_type: badgeType,
        badge_name: name,
        badge_description: description || null,
        badge_icon: icon || null,
        evidence_url: evidenceUrl || null,
        notes: notes || null,
        verified: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating badge:', error)
      return c.json({ error: 'Failed to create badge', details: error.message }, 500)
    }
    
    console.log(`✅ Badge request created successfully (pending verification)`)
    return c.json({ success: true, badge })
  } catch (error: any) {
    console.error('❌ Error in create badge route:', error)
    return c.json({ error: 'Failed to create badge', details: error.message }, 500)
  }
})

// Update/verify a badge (admin only for verification)
app.put('/make-server-053bcd80/organizations/:companyId/badges/:badgeId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const badgeId = c.req.param('badgeId')
    const { verified, verificationNotes } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`🔄 Updating badge ${badgeId}`)
    
    // Only admins can verify badges
    const { data: adminCheck } = await supabase
      .from('kv_store_053bcd80')
      .select('value')
      .eq('key', 'admin_user_id')
      .single()
    
    const isAdmin = adminCheck?.value === `"${userId}"`
    
    if (!isAdmin && verified !== undefined) {
      return c.json({ error: 'Only admins can verify badges' }, 403)
    }
    
    const updates: any = {}
    if (verified !== undefined) {
      updates.verified = verified
      updates.verified_by = userId
      updates.verified_at = new Date().toISOString()
    }
    if (verificationNotes) updates.verification_notes = verificationNotes
    
    const { error } = await supabase
      .from('company_badges')
      .update(updates)
      .eq('id', badgeId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error updating badge:', error)
      return c.json({ error: 'Failed to update badge', details: error.message }, 500)
    }
    
    console.log(`✅ Badge updated successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in update badge route:', error)
    return c.json({ error: 'Failed to update badge', details: error.message }, 500)
  }
})

// Delete a badge
app.delete('/make-server-053bcd80/organizations/:companyId/badges/:badgeId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const badgeId = c.req.param('badgeId')
    const userId = c.get('userId')
    
    console.log(`🗑️ Deleting badge ${badgeId}`)
    
    // Verify user has permission
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    const { data: userMember } = await supabase
      .from('company_members')
      .select('role, can_manage_badges')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()
    
    // Check if admin (admins can delete any badge)
    const { data: adminCheck } = await supabase
      .from('kv_store_053bcd80')
      .select('value')
      .eq('key', 'admin_user_id')
      .single()
    
    const isAdmin = adminCheck?.value === `"${userId}"`
    const isOwner = company?.owner_id === userId
    const canManage = isOwner || userMember?.role === 'admin' || userMember?.can_manage_badges
    
    if (!isAdmin && !canManage) {
      return c.json({ error: 'You do not have permission to delete badges' }, 403)
    }
    
    const { error } = await supabase
      .from('company_badges')
      .delete()
      .eq('id', badgeId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('❌ Error deleting badge:', error)
      return c.json({ error: 'Failed to delete badge', details: error.message }, 500)
    }
    
    console.log(`✅ Badge deleted successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete badge route:', error)
    return c.json({ error: 'Failed to delete badge', details: error.message }, 500)
  }
})

// ============================================================================
// ADMIN: BADGE VERIFICATION SYSTEM
// ============================================================================

// Admin: Get all badge requests across all organizations
app.get('/make-server-053bcd80/admin/badges/all', requireAuth, requireAdmin, async (c) => {
  try {
    console.log('🏅 [ADMIN] Fetching all badge requests...')
    
    const { data: badges, error } = await supabase
      .from('company_badges')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching badges:', error)
      return c.json({ error: 'Failed to fetch badges', details: error.message }, 500)
    }
    
    // Fetch company names for all badges
    const badgesWithCompanies = await Promise.all(
      (badges || []).map(async (badge) => {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', badge.company_id)
          .single()
        
        return {
          id: badge.id,
          companyId: badge.company_id,
          companyName: company?.name || 'Unknown',
          badgeType: badge.badge_type,
          name: badge.badge_name,
          description: badge.badge_description,
          icon: badge.badge_icon,
          evidenceUrl: badge.evidence_url,
          notes: badge.notes,
          verified: badge.verified,
          verifiedBy: badge.verified_by,
          verifiedAt: badge.verified_at,
          verificationNotes: badge.verification_notes,
          earnedAt: badge.created_at,
          issuedByAssociationId: badge.issued_by_association_id
        }
      })
    )
    
    console.log(`✅ [ADMIN] Fetched ${badgesWithCompanies.length} badge requests`)
    return c.json({ badges: badgesWithCompanies })
  } catch (error: any) {
    console.error('❌ Error in admin badges route:', error)
    return c.json({ error: 'Failed to fetch badges', details: error.message }, 500)
  }
})

// Admin: Verify/Update a badge
app.put('/make-server-053bcd80/admin/badges/:badgeId/verify', requireAuth, requireAdmin, async (c) => {
  try {
    const badgeId = c.req.param('badgeId')
    const { verified, verificationNotes } = await c.req.json()
    const adminId = c.get('userId')
    
    console.log(`🔐 [ADMIN] Verifying badge ${badgeId}`)
    
    const updates: any = {
      verified: verified,
      verified_by: adminId,
      verified_at: new Date().toISOString()
    }
    
    if (verificationNotes !== undefined) {
      updates.verification_notes = verificationNotes
    }
    
    const { error } = await supabase
      .from('company_badges')
      .update(updates)
      .eq('id', badgeId)
    
    if (error) {
      console.error('❌ Error verifying badge:', error)
      return c.json({ error: 'Failed to verify badge', details: error.message }, 500)
    }
    
    console.log(`✅ [ADMIN] Badge ${verified ? 'verified' : 'unverified'} successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in admin verify badge route:', error)
    return c.json({ error: 'Failed to verify badge', details: error.message }, 500)
  }
})

// Admin: Delete/Reject a badge
app.delete('/make-server-053bcd80/admin/badges/:badgeId', requireAuth, requireAdmin, async (c) => {
  try {
    const badgeId = c.req.param('badgeId')
    
    console.log(`🗑️ [ADMIN] Deleting badge ${badgeId}`)
    
    const { error } = await supabase
      .from('company_badges')
      .delete()
      .eq('id', badgeId)
    
    if (error) {
      console.error('❌ Error deleting badge:', error)
      return c.json({ error: 'Failed to delete badge', details: error.message }, 500)
    }
    
    console.log(`✅ [ADMIN] Badge deleted successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in admin delete badge route:', error)
    return c.json({ error: 'Failed to delete badge', details: error.message }, 500)
  }
})

// ============================================================================
// ORGANIZATION-PLACE RELATIONSHIPS ROUTES
// ============================================================================

// ⚠️ IMPORTANT: Search route MUST come before other /places routes to prevent "search" being interpreted as :relationshipId
// Search places for adding relationships (public places only)
app.get('/make-server-053bcd80/organizations/:id/places/search', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const userId = c.get('userId')
    const searchQuery = c.req.query('q') || ''
    const category = c.req.query('category')
    const type = c.req.query('type')
    
    console.log('🔍 Searching places for organization:', organizationId, 'query:', searchQuery)
    
    // Verify user is owner OR member of this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    // Check if user is owner
    const isOwner = company.owner_id === userId
    
    // Check if user is a member (if not owner)
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
      return c.json({ error: 'Unauthorized - not a member of this organization' }, 403)
    }
    
    // Build search query
    let query = supabase
      .from('places')
      .select('id, name, type, category, city, state_province, country, latitude, longitude, status')
      .eq('status', 'active')
    
    // Apply search filter
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`)
    }
    
    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }
    
    // Apply type filter
    if (type) {
      query = query.eq('type', type)
    }
    
    query = query.order('name', { ascending: true }).limit(50)
    
    const { data: places, error } = await query
    
    if (error) {
      console.error('❌ Error searching places:', error)
      return c.json({ error: 'Failed to search places', details: error.message }, 500)
    }
    
    console.log(`✅ Found ${places.length} places matching search`)
    return c.json({ places })
  } catch (error: any) {
    console.error('❌ Error in search places route:', error)
    return c.json({ error: 'Failed to search places', details: error.message }, 500)
  }
})

// Get all place relationships for an organization
app.get('/make-server-053bcd80/organizations/:id/places', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const userId = c.get('userId')
    
    console.log('📍 Fetching place relationships for organization:', organizationId)
    
    // Verify user is owner OR member of this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    // Check if user is owner
    const isOwner = company.owner_id === userId
    
    // Check if user is a member (if not owner)
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
      return c.json({ error: 'Unauthorized - not a member of this organization' }, 403)
    }
    
    // Fetch place relationships with full place details
    const { data: relationships, error } = await supabase
      .from('organization_place_relationships')
      .select(`
        *,
        place:places (
          id,
          name,
          type,
          category,
          description,
          latitude,
          longitude,
          address_line1,
          address_line2,
          city,
          state_province,
          postal_code,
          country,
          phone,
          email,
          website,
          status
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching place relationships:', error)
      return c.json({ error: 'Failed to fetch place relationships', details: error.message }, 500)
    }
    
    console.log(`✅ Fetched ${relationships.length} place relationships`)
    return c.json({ relationships })
  } catch (error: any) {
    console.error('❌ Error in get organization places route:', error)
    return c.json({ error: 'Failed to fetch place relationships', details: error.message }, 500)
  }
})

// Create a new place relationship
app.post('/make-server-053bcd80/organizations/:id/places', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('➕ Creating place relationship for organization:', organizationId)
    
    // Verify user is owner OR admin/owner member of this organization
    const { data: company } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', organizationId)
      .single()
    
    if (!company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    // Check if user is owner
    const isOwner = company.owner_id === userId
    
    // Check if user is admin (if not owner)
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
    
    // Validate required fields
    if (!body.place_id || !body.relationship_type) {
      return c.json({ error: 'Missing required fields: place_id, relationship_type' }, 400)
    }
    
    // Create relationship
    const { data: relationship, error } = await supabase
      .from('organization_place_relationships')
      .insert({
        organization_id: organizationId,
        place_id: body.place_id,
        relationship_type: body.relationship_type,
        notes: body.notes || null,
        status: 'pending' // Default to pending, admin can verify later
      })
      .select(`
        *,
        place:places (
          id,
          name,
          type,
          category,
          city,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error creating place relationship:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return c.json({ error: 'This relationship already exists' }, 409)
      }
      
      return c.json({ error: 'Failed to create relationship', details: error.message }, 500)
    }
    
    console.log('✅ Place relationship created:', relationship.id)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in create place relationship route:', error)
    return c.json({ error: 'Failed to create relationship', details: error.message }, 500)
  }
})

// Update a place relationship
app.put('/make-server-053bcd80/organizations/:id/places/:relationshipId', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const relationshipId = c.req.param('relationshipId')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('✏️ Updating place relationship:', relationshipId)
    
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
      .from('organization_place_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .eq('organization_id', organizationId)
      .select(`
        *,
        place:places (
          id,
          name,
          type,
          category,
          city,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error updating place relationship:', error)
      return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
    }
    
    console.log('✅ Place relationship updated:', relationshipId)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in update place relationship route:', error)
    return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
  }
})

// Delete a place relationship
app.delete('/make-server-053bcd80/organizations/:id/places/:relationshipId', requireAuth, async (c) => {
  try {
    const organizationId = c.req.param('id')
    const relationshipId = c.req.param('relationshipId')
    const userId = c.get('userId')
    
    console.log('🗑️ Deleting place relationship:', relationshipId)
    
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
      .from('organization_place_relationships')
      .delete()
      .eq('id', relationshipId)
      .eq('organization_id', organizationId)
    
    if (error) {
      console.error('❌ Error deleting place relationship:', error)
      return c.json({ error: 'Failed to delete relationship', details: error.message }, 500)
    }
    
    console.log('✅ Place relationship deleted:', relationshipId)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete place relationship route:', error)
    return c.json({ error: 'Failed to delete relationship', details: error.message }, 500)
  }
})

// Admin: Get ALL place relationships across all organizations
app.get('/make-server-053bcd80/admin/place-relationships', requireAuth, requireAdmin, async (c) => {
  try {
    const status = c.req.query('status') // 'pending', 'verified', 'rejected', or 'all'
    
    console.log('🔗 [ADMIN] Fetching all place relationships...', { status })
    
    let query = supabase
      .from('organization_place_relationships')
      .select(`
        *,
        organization:companies!organization_place_relationships_organization_id_fkey (
          id,
          name,
          logo_url
        ),
        place:places (
          id,
          name,
          type,
          category,
          city,
          state_province,
          country,
          latitude,
          longitude
        )
      `)
      .order('created_at', { ascending: false })
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data: relationships, error } = await query
    
    if (error) {
      console.error('❌ Error fetching relationships:', error)
      return c.json({ error: 'Failed to fetch relationships', details: error.message }, 500)
    }
    
    console.log(`✅ [ADMIN] Fetched ${relationships?.length || 0} place relationships`)
    return c.json({ relationships: relationships || [] })
  } catch (error: any) {
    console.error('❌ Error in admin place relationships route:', error)
    return c.json({ error: 'Failed to fetch relationships', details: error.message }, 500)
  }
})

// Admin: Update relationship status (verify/reject)
app.put('/make-server-053bcd80/admin/place-relationships/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const relationshipId = c.req.param('id')
    const body = await c.req.json()
    
    console.log('🔗 [ADMIN] Updating relationship status:', relationshipId, body.status)
    
    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.relationship_type) updateData.relationship_type = body.relationship_type
    
    const { data: relationship, error} = await supabase
      .from('organization_place_relationships')
      .update(updateData)
      .eq('id', relationshipId)
      .select(`
        *,
        organization:companies!organization_place_relationships_organization_id_fkey (
          id,
          name,
          logo_url
        ),
        place:places (
          id,
          name,
          type,
          category,
          city,
          country
        )
      `)
      .single()
    
    if (error) {
      console.error('❌ Error updating relationship:', error)
      return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Relationship updated:', relationshipId)
    return c.json({ relationship })
  } catch (error: any) {
    console.error('❌ Error in admin update relationship route:', error)
    return c.json({ error: 'Failed to update relationship', details: error.message }, 500)
  }
})

// Create a new place (user-submitted, starts as active)
app.post('/make-server-053bcd80/places/create', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('📍 User creating new place:', body.name)
    
    // Validation - only require essential fields
    if (!body.name || !body.name.trim()) {
      return c.json({ error: 'Place name is required' }, 400)
    }
    if (!body.type) {
      return c.json({ error: 'Place type is required' }, 400)
    }
    if (!body.category) {
      return c.json({ error: 'Place category is required' }, 400)
    }
    if (!body.city) {
      return c.json({ error: 'City is required' }, 400)
    }
    if (!body.country) {
      return c.json({ error: 'Country is required' }, 400)
    }
    
    // Build insert data
    const insertData: any = {
      name: body.name.trim(),
      type: body.type,
      category: body.category,
      description: body.description?.trim() || null,
      status: 'active', // FIXED: Changed from 'pending' to 'active' to match database constraint
      created_by: userId,
      // Location
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      // Address
      address_line1: body.address_line1?.trim() || null,
      address_line2: body.address_line2?.trim() || null,
      city: body.city.trim(),
      state_province: body.state_province?.trim() || null,
      postal_code: body.postal_code?.trim() || null,
      country: body.country.trim(),
      // Contact
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      // Association
      company_id: body.company_id || null,
      // Media
      logo_url: body.logo_url || null
    }
    
    // Create place
    const { data: place, error } = await supabase
      .from('places')
      .insert(insertData)
      .select('id, name, type, category, city, state_province, country, latitude, longitude, status')
      .single()
    
    if (error) {
      console.error('❌ Error creating place:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      console.error('❌ Insert data was:', JSON.stringify(insertData, null, 2))
      return c.json({ error: 'Failed to create place', details: error.message, hint: error.hint || 'Check if places table exists' }, 500)
    }
    
    console.log('✅ Place created:', place.id)
    return c.json({ place })
  } catch (error: any) {
    console.error('❌ Error in create place route:', error)
    return c.json({ error: 'Failed to create place', details: error.message }, 500)
  }
})

// Parse Google Maps URL to extract place information
app.post('/make-server-053bcd80/places/parse-google-maps', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    const { url } = body
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'Google Maps URL is required' }, 400)
    }
    
    // Validate it's a Google Maps URL
    if (!isGoogleMapsUrl(url)) {
      return c.json({ error: 'Invalid Google Maps URL' }, 400)
    }
    
    console.log('🗺️ Parsing Google Maps URL:', url)
    
    const placeData = await parseGoogleMapsUrl(url)
    
    console.log('✅ Google Maps data extracted:', placeData)
    return c.json({ placeData })
  } catch (error: any) {
    console.error('❌ Error parsing Google Maps URL:', error)
    return c.json({ error: 'Failed to parse Google Maps URL', details: error.message }, 500)
  }
})

// End of company routes setup
}