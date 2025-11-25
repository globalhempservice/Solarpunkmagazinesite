import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

// End of company routes setup
}