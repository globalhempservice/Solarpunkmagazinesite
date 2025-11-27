import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Initialize Supabase client with SERVICE_ROLE_KEY for server operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Helper middleware for routes (passed from main server)
export function setupSwagRoutes(app: Hono, requireAuth: any) {

console.log('🚀 Setting up swag routes...')

// ============================================================================
// PUBLIC ROUTES (No Auth Required) - Specific routes BEFORE wildcards
// ============================================================================

/**
 * GET /swag-products/meta/categories
 * Get list of available product categories
 */
app.get('/make-server-053bcd80/swag-products/meta/categories', async (c) => {
  try {
    const categories = [
      { value: 'apparel', label: 'Apparel', icon: '👕' },
      { value: 'accessories', label: 'Accessories', icon: '🎒' },
      { value: 'seeds', label: 'Seeds & Cultivation', icon: '🌱' },
      { value: 'education', label: 'Education & Media', icon: '📚' },
      { value: 'other', label: 'Other', icon: '✨' }
    ]
    
    return c.json(categories)
  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * GET /swag-products/by-company/:companyId
 * Get all products for a specific company (public, shows published only)
 */
app.get('/make-server-053bcd80/swag-products/by-company/:companyId', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    
    const { data, error } = await supabase
      .from('swag_products_053bcd80')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_published', true)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      return c.json({ error: 'Failed to fetch products', details: error.message }, 500)
    }
    
    return c.json(data || [])
  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

// ============================================================================
// AUTHENTICATED ROUTES - Specific routes BEFORE wildcards
// ============================================================================

/**
 * GET /swag-products/my/:companyId
 * Get all products for my company (includes unpublished)
 * Requires: User owns the company
 */
app.get('/make-server-053bcd80/swag-products/my/:companyId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const userId = c.get('userId')
    
    console.log('🛍️ Fetching products for company:', companyId, 'user:', userId)
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      console.log('❌ Company not found:', companyId)
      return c.json({ error: 'Company not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      console.log('❌ User does not own company')
      return c.json({ error: 'Forbidden: You do not own this company' }, 403)
    }
    
    // Fetch all products (including unpublished)
    const { data, error } = await supabase
      .from('swag_products_053bcd80')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Failed to fetch products:', error)
      return c.json({ error: 'Failed to fetch products', details: error.message }, 500)
    }
    
    console.log('✅ Fetched', data?.length || 0, 'products')
    return c.json({ products: data || [] })
  } catch (error) {
    console.log('❌ Error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * POST /swag-products/upload-image
 * Upload product image to Supabase Storage
 * Requires: Authentication
 */
app.post('/make-server-053bcd80/swag-products/upload-image', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    console.log('📸 Uploading image for user:', userId)
    
    // Parse multipart form data
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'Bad Request: No file provided' }, 400)
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Bad Request: Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, 400)
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'Bad Request: File too large. Max size: 5MB' }, 400)
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExt}`
    
    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('swag-images-053bcd80')
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false
      })
    
    if (error) {
      console.log('❌ Upload failed:', error)
      return c.json({ error: 'Failed to upload image', details: error.message }, 500)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('swag-images-053bcd80')
      .getPublicUrl(fileName)
    
    console.log('✅ Image uploaded successfully')
    return c.json({
      message: 'Image uploaded successfully',
      url: publicUrl,
      path: fileName
    })
  } catch (error) {
    console.log('❌ Error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * GET /swag-products
 * Get all published swag products (public feed)
 * Query params: category, featured, company_id, limit, offset, search
 */
app.get('/make-server-053bcd80/swag-products', async (c) => {
  try {
    // Parse query parameters
    const category = c.req.query('category')
    const featured = c.req.query('featured')
    const companyId = c.req.query('company_id')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    const search = c.req.query('search')
    const membersOnly = c.req.query('members_only') === 'true'
    
    // Build query
    let query = supabase
      .from('swag_products_053bcd80')
      .select(`
        *,
        company:companies (
          id,
          name,
          logo_url,
          is_association
        )
      `)
      .eq('is_published', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    if (membersOnly) {
      query = query.eq('requires_badge', true)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return c.json({ error: 'Failed to fetch swag products', details: error.message }, 500)
    }
    
    return c.json({
      products: data || [],
      count: count || 0,
      limit,
      offset
    })
  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * POST /swag-products
 * Create new swag product
 * Requires: User owns the company
 */
app.post('/make-server-053bcd80/swag-products', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('🔵 Creating swag product for user:', userId)
    console.log('📦 Request body:', body)
    
    const { company_id, ...productData } = body
    
    if (!company_id) {
      console.log('❌ No company_id provided')
      return c.json({ error: 'Bad Request: company_id is required' }, 400)
    }
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', company_id)
      .single()
    
    if (companyError || !company) {
      console.log('❌ Company not found:', company_id)
      return c.json({ error: 'Company not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      console.log('❌ User does not own company')
      return c.json({ error: 'Forbidden: You do not own this company' }, 403)
    }
    
    console.log('✅ Company ownership verified')
    
    // Generate slug from name if not provided
    const slug = productData.slug || productData.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    console.log('🏷️ Generated slug:', slug)
    
    // Create product
    const { data, error } = await supabase
      .from('swag_products_053bcd80')
      .insert({
        company_id,
        ...productData,
        slug,
        created_by: userId
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Database error:', error)
      return c.json({ error: 'Failed to create product', details: error.message }, 500)
    }
    
    console.log('✅ Product created successfully:', data.id)
    return c.json(data, 201)
  } catch (error) {
    console.log('❌ Unexpected error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * GET /swag-products/:id
 * Get single swag product by ID (public)
 * NOTE: This wildcard route MUST come after all specific routes
 */
app.get('/make-server-053bcd80/swag-products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    
    const { data, error } = await supabase
      .from('swag_products_053bcd80')
      .select(`
        *,
        company:companies (
          id,
          name,
          logo_url,
          description,
          location,
          website,
          is_association
        )
      `)
      .eq('id', productId)
      .eq('is_published', true)
      .single()
    
    if (error) {
      return c.json({ error: 'Product not found', details: error.message }, 404)
    }
    
    return c.json(data)
  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * PUT /swag-products/:id
 * Update swag product
 * Requires: User owns the company
 */
app.put('/make-server-053bcd80/swag-products/:id', requireAuth, async (c) => {
  try {
    const productId = c.req.param('id')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('🔄 Updating product:', productId, 'by user:', userId)
    
    // Get existing product to verify ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from('swag_products_053bcd80')
      .select('company_id')
      .eq('id', productId)
      .single()
    
    if (fetchError || !existingProduct) {
      console.log('❌ Product not found')
      return c.json({ error: 'Product not found' }, 404)
    }
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', existingProduct.company_id)
      .single()
    
    if (companyError || !company || company.owner_id !== userId) {
      console.log('❌ User does not own this product')
      return c.json({ error: 'Forbidden: You do not own this product' }, 403)
    }
    
    // Don't allow changing company_id or created_by
    delete body.company_id
    delete body.created_by
    delete body.id
    delete body.created_at
    
    // Update product
    const { data, error } = await supabase
      .from('swag_products_053bcd80')
      .update(body)
      .eq('id', productId)
      .select()
      .single()
    
    if (error) {
      console.log('❌ Failed to update:', error)
      return c.json({ error: 'Failed to update product', details: error.message }, 500)
    }
    
    console.log('✅ Product updated successfully')
    return c.json(data)
  } catch (error) {
    console.log('❌ Error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

/**
 * DELETE /swag-products/:id
 * Delete swag product
 * Requires: User owns the company
 */
app.delete('/make-server-053bcd80/swag-products/:id', requireAuth, async (c) => {
  try {
    const productId = c.req.param('id')
    const userId = c.get('userId')
    
    console.log('🗑️ Deleting product:', productId, 'by user:', userId)
    
    // Get existing product to verify ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from('swag_products_053bcd80')
      .select('company_id, images, primary_image_url')
      .eq('id', productId)
      .single()
    
    if (fetchError || !existingProduct) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', existingProduct.company_id)
      .single()
    
    if (companyError || !company || company.owner_id !== userId) {
      return c.json({ error: 'Forbidden: You do not own this product' }, 403)
    }
    
    // Delete product
    const { error } = await supabase
      .from('swag_products_053bcd80')
      .delete()
      .eq('id', productId)
    
    if (error) {
      console.log('❌ Failed to delete:', error)
      return c.json({ error: 'Failed to delete product', details: error.message }, 500)
    }
    
    console.log('✅ Product deleted successfully')
    return c.json({ message: 'Product deleted successfully', id: productId })
  } catch (error) {
    console.log('❌ Error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

console.log('✅ Swag routes setup complete')

} // End of setupSwagRoutes function
