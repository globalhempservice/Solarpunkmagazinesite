import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Initialize Supabase client with SERVICE_ROLE_KEY for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Admin user ID from environment
const ADMIN_USER_ID = Deno.env.get('ADMIN_USER_ID')

export function setupAdminSwagRoutes(app: Hono, requireAdmin: any) {
  console.log('🔐 Setting up admin swag routes...')

  /**
   * GET /admin/swag-products
   * Get ALL swag products (published and unpublished) - Admin only
   */
  app.get('/make-server-053bcd80/admin/swag-products', requireAdmin, async (c) => {
    try {
      console.log('🛍️ [ADMIN] Fetching all swag products')

      const { data, error } = await supabase
        .from('swag_products_053bcd80')
        .select(`
          *,
          company:companies (
            id,
            name,
            logo_url,
            owner_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ADMIN] Error fetching products:', error)
        return c.json({ error: 'Failed to fetch products', details: error.message }, 500)
      }

      console.log(`✅ [ADMIN] Fetched ${data?.length || 0} products`)
      return c.json(data || [])
    } catch (error: any) {
      console.error('❌ [ADMIN] Error in get products route:', error)
      return c.json({ error: 'Failed to fetch products', details: error.message }, 500)
    }
  })

  /**
   * GET /admin/swag-products/:id
   * Get single swag product with full details - Admin only
   */
  app.get('/make-server-053bcd80/admin/swag-products/:productId', requireAdmin, async (c) => {
    try {
      const productId = c.req.param('productId')
      console.log('🛍️ [ADMIN] Fetching product:', productId)

      const { data, error } = await supabase
        .from('swag_products_053bcd80')
        .select(`
          *,
          company:companies (
            id,
            name,
            logo_url,
            owner_id,
            description,
            location,
            website,
            is_association
          )
        `)
        .eq('id', productId)
        .single()

      if (error) {
        console.error('❌ [ADMIN] Error fetching product:', error)
        return c.json({ error: 'Product not found', details: error.message }, 404)
      }

      console.log('✅ [ADMIN] Product fetched:', data.id)
      return c.json(data)
    } catch (error: any) {
      console.error('❌ [ADMIN] Error in get product route:', error)
      return c.json({ error: 'Failed to fetch product', details: error.message }, 500)
    }
  })

  /**
   * PUT /admin/swag-products/:id
   * Update any swag product - Admin only (no ownership check)
   */
  app.put('/make-server-053bcd80/admin/swag-products/:productId', requireAdmin, async (c) => {
    try {
      const productId = c.req.param('productId')
      const body = await c.req.json()

      console.log('🛍️ [ADMIN] Updating product:', productId)

      // Admin can update any product, no ownership check needed

      // Don't allow changing id or created_at
      delete body.id
      delete body.created_at

      // Update product
      const { data, error } = await supabase
        .from('swag_products_053bcd80')
        .update(body)
        .eq('id', productId)
        .select(`
          *,
          company:companies (
            id,
            name,
            logo_url,
            owner_id
          )
        `)
        .single()

      if (error) {
        console.error('❌ [ADMIN] Error updating product:', error)
        return c.json({ error: 'Failed to update product', details: error.message }, 500)
      }

      console.log('✅ [ADMIN] Product updated:', data.id)
      return c.json(data)
    } catch (error: any) {
      console.error('❌ [ADMIN] Error in update product route:', error)
      return c.json({ error: 'Failed to update product', details: error.message }, 500)
    }
  })

  /**
   * DELETE /admin/swag-products/:id
   * Delete any swag product - Admin only (no ownership check)
   */
  app.delete('/make-server-053bcd80/admin/swag-products/:productId', requireAdmin, async (c) => {
    try {
      const productId = c.req.param('productId')

      console.log('🛍️ [ADMIN] Deleting product:', productId)

      // Admin can delete any product, no ownership check needed
      const { error } = await supabase
        .from('swag_products_053bcd80')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('❌ [ADMIN] Error deleting product:', error)
        return c.json({ error: 'Failed to delete product', details: error.message }, 500)
      }

      console.log('✅ [ADMIN] Product deleted:', productId)
      return c.json({ success: true })
    } catch (error: any) {
      console.error('❌ [ADMIN] Error in delete product route:', error)
      return c.json({ error: 'Failed to delete product', details: error.message }, 500)
    }
  })

  console.log('✅ Admin swag routes setup complete')
}
