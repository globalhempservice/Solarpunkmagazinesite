import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { parseGoogleMapsUrl, isGoogleMapsUrl } from './google_maps_parser.tsx'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Helper function to create a fresh Supabase client for each request
// This prevents connection reset issues
function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'Connection': 'close', // Force close connection after each request
      },
    },
  })
}

// Retry helper for transient network errors
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 5,
  delayMs = 500
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection/gateway error that we should retry
      const errorMessage = error?.message?.toLowerCase() || ''
      const shouldRetry = 
        errorMessage.includes('connection reset') ||
        errorMessage.includes('connection error') ||
        errorMessage.includes('connection lost') ||
        errorMessage.includes('gateway error') ||
        errorMessage.includes('econnreset') ||
        errorMessage.includes('sendrequest') ||
        error?.code === 'ECONNRESET'
      
      if (shouldRetry && attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(1.5, attempt) // Exponential backoff: 500ms, 750ms, 1125ms, 1687ms
        console.log(`🔄 Retry ${attempt + 1}/${maxRetries - 1} after ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // If we exhausted retries or it's not a retryable error, throw
      if (!shouldRetry) {
        console.error('❌ Non-retryable error:', error)
      } else {
        console.error('❌ Max retries exhausted')
      }
      throw error
    }
  }
  
  throw lastError
}

// DEPLOY TIMESTAMP: 2025-12-19T08:45:00Z - Enhanced retry logic with connection pooling fix
console.log('🚀 Places routes loaded - Enhanced retry with better client management!')

// Helper middleware for routes (passed from main server)
export function setupPlacesRoutes(app: Hono, requireAuth: any, requireAdmin: any) {

// ============================================================================
// GOOGLE MAPS PARSER ROUTE
// ============================================================================

// Parse Google Maps URL and extract place information
app.post('/make-server-053bcd80/places/parse-google-maps-url', async (c) => {
  try {
    const body = await c.req.json()
    const { url } = body
    
    console.log('📥 Received parse request:', { url })
    
    if (!url) {
      console.error('❌ No URL provided')
      return c.json({ error: 'URL is required' }, 400)
    }
    
    if (!isGoogleMapsUrl(url)) {
      console.error('❌ Invalid Google Maps URL format:', url)
      return c.json({ 
        error: 'Invalid Google Maps URL', 
        details: 'Please provide a valid Google Maps link (e.g., https://maps.google.com/... or https://maps.app.goo.gl/...)' 
      }, 400)
    }
    
    console.log('🗺️ Parsing Google Maps URL:', url)
    
    const placeData = await parseGoogleMapsUrl(url)
    
    console.log('✅ Successfully parsed Google Maps URL:', placeData)
    return c.json({ placeData })
  } catch (error: any) {
    console.error('❌ Error parsing Google Maps URL:', error)
    console.error('❌ Error stack:', error.stack)
    return c.json({ 
      error: 'Failed to parse Google Maps URL', 
      details: error.message || 'Unknown error occurred',
      stack: error.stack 
    }, 500)
  }
})

// ============================================================================
// PLACES ROUTES - Public & Admin Routes
// ============================================================================

// Get all places (public - only active)
app.get('/make-server-053bcd80/places', async (c) => {
  try {
    const category = c.req.query('category')
    const type = c.req.query('type')
    const country = c.req.query('country')
    const companyId = c.req.query('company_id')
    
    console.log('📍 Fetching places...', { category, type, country, companyId })
    
    // Use direct REST API call to avoid Supabase client connection pooling issues
    const data = await withRetry(async () => {
      // Build query parameters
      const params = new URLSearchParams({
        select: 'id,name,type,category,description,status,latitude,longitude,city,state_province,country,phone,email,website,company_id,owner_name,manager_name,year_established,specialties,photos,logo_url,created_by,created_at',
        status: 'eq.active',
        order: 'created_at.desc'
      })
      
      // Apply filters
      if (category && category !== 'all') {
        params.set('category', `eq.${category}`)
      }
      if (type) {
        params.set('type', `eq.${type}`)
      }
      if (country && country !== 'all') {
        params.set('country', `eq.${country}`)
      }
      if (companyId) {
        params.set('company_id', `eq.${companyId}`)
      }
      
      // Direct fetch to REST API
      const response = await fetch(
        `${supabaseUrl}/rest/v1/places?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ REST API error:', response.status, errorText)
        throw new Error(`REST API error: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      return result || []
    })
    
    console.log(`✅ Fetched ${data?.length || 0} places`)
    return c.json({ places: data || [] })
  } catch (error: any) {
    console.error('❌ Error in /places route:', error)
    return c.json({ 
      error: 'Failed to fetch places', 
      details: error.message,
      places: [] // Return empty array on error
    }, 500)
  }
})

// Get places statistics (public)
// ⚠️ IMPORTANT: This route MUST come BEFORE /places/:id to prevent "stats" from being interpreted as a UUID
app.get('/make-server-053bcd80/places/stats', async (c) => {
  try {
    console.log('📊 Fetching places statistics...')
    
    // Get total places count by category
    const { data: categoryCounts, error: categoryError } = await getSupabaseClient()
      .from('places')
      .select('category')
      .eq('status', 'active')
    
    if (categoryError) {
      console.error('❌ Error fetching category stats:', categoryError)
      return c.json({ error: 'Failed to fetch statistics', details: categoryError.message }, 500)
    }
    
    // Get total hectares for agriculture
    const { data: agriculturePlaces, error: hectaresError } = await getSupabaseClient()
      .from('places')
      .select('area_hectares')
      .eq('category', 'agriculture')
      .eq('status', 'active')
      .not('area_hectares', 'is', null)
    
    if (hectaresError) {
      console.error('❌ Error fetching hectares:', hectaresError)
    }
    
    const totalHectares = agriculturePlaces?.reduce((sum, place) => {
      return sum + (parseFloat(place.area_hectares) || 0)
    }, 0) || 0
    
    // Count by category
    const categoryStats = categoryCounts.reduce((acc: any, place: any) => {
      acc[place.category] = (acc[place.category] || 0) + 1
      return acc
    }, {})
    
    const stats = {
      total_places: categoryCounts.length,
      total_hectares: Math.round(totalHectares * 100) / 100, // Round to 2 decimals
      by_category: categoryStats,
      agriculture_with_area: agriculturePlaces?.length || 0
    }
    
    console.log('✅ Statistics calculated:', stats)
    return c.json(stats)
  } catch (error: any) {
    console.error('❌ Error in /places/stats route:', error)
    return c.json({ error: 'Failed to fetch statistics', details: error.message }, 500)
  }
})

// Get single place by ID (public - only active)
// ⚠️ IMPORTANT: This route must come AFTER /places/stats (specific routes before parameterized routes)
app.get('/make-server-053bcd80/places/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    console.log('📍 Fetching place:', id)
    
    const { data: place, error } = await getSupabaseClient()
      .from('places')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          website,
          description
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Place not found' }, 404)
      }
      console.error('❌ Error fetching place:', error)
      return c.json({ error: 'Failed to fetch place', details: error.message }, 500)
    }
    
    console.log('✅ Place found:', place.name)
    return c.json({ place })
  } catch (error: any) {
    console.error('❌ Error in /places/:id route:', error)
    return c.json({ error: 'Failed to fetch place', details: error.message }, 500)
  }
})

// ============================================================================
// ADMIN ROUTES - Full CRUD operations
// ============================================================================

// Create place (authenticated users - active immediately)
// Updated: 2025-12-05 - Status set to 'verified' (matching valid_status constraint)
app.post('/make-server-053bcd80/places/create', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    const {
      name,
      type,
      category,
      description,
      // Location data
      latitude,
      longitude,
      // Address
      city,
      state_province,
      postal_code,
      country,
      // Contact
      phone,
      website,
      // Association
      company_id
    } = body
    
    console.log('📍 Creating place (user submission):', { name, latitude, longitude })
    
    // Validation
    if (!name || !name.trim()) {
      return c.json({ error: 'Place name is required' }, 400)
    }
    if (!type) {
      return c.json({ error: 'Place type is required' }, 400)
    }
    if (!category) {
      return c.json({ error: 'Place category is required' }, 400)
    }
    if (!city || !city.trim()) {
      return c.json({ error: 'City is required' }, 400)
    }
    if (!country) {
      return c.json({ error: 'Country is required' }, 400)
    }
    if (!latitude || !longitude) {
      return c.json({ error: 'Location coordinates (latitude/longitude) are required' }, 400)
    }
    
    // Build insert data
    const insertData: any = {
      name: name.trim(),
      type,
      category,
      description: description?.trim() || null,
      status: 'active', // Changed back to 'active' after fixing database constraint
      // Location
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      // Address
      address_line1: null, // Not used in simplified form
      address_line2: null,
      city: city.trim(),
      state_province: state_province?.trim() || null,
      postal_code: postal_code?.trim() || null,
      country: country.trim(),
      // Contact
      phone: phone?.trim() || null,
      email: null, // Not used in simplified form
      website: website?.trim() || null,
      // Association
      company_id: company_id || null,
      // Metadata
      created_by: userId
    }
    
    console.log('📤 Insert data:', insertData)
    
    const { data: place, error } = await getSupabaseClient()
      .from('places')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating place:', error)
      console.error('❌ Insert data was:', insertData)
      console.error('❌ Error details:', error)
      return c.json({ error: 'Failed to create place', details: error.message }, 500)
    }
    
    console.log('✅ Place created:', place.id)
    return c.json({ place })
  } catch (error: any) {
    console.error('❌ Error in create place route:', error)
    return c.json({ error: 'Failed to create place', details: error.message }, 500)
  }
})

// Admin: Get all places (including inactive)
app.get('/make-server-053bcd80/admin/places', requireAuth, requireAdmin, async (c) => {
  try {
    const status = c.req.query('status') // 'active', 'planned', 'closed', or 'all'
    
    console.log('📍 [ADMIN] Fetching all places...', { status })
    
    let query = getSupabaseClient()
      .from('places')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data: places, error } = await query
    
    if (error) {
      console.error('❌ Error fetching places:', error)
      return c.json({ error: 'Failed to fetch places', details: error.message }, 500)
    }
    
    // Remove PostGIS binary geography columns from response
    const transformedPlaces = places.map(place => {
      const { location, area_boundary, ...rest } = place
      return rest
    })
    
    console.log(`✅ [ADMIN] Fetched ${transformedPlaces.length} places`)
    return c.json({ places: transformedPlaces })
  } catch (error: any) {
    console.error('❌ Error in admin/places route:', error)
    return c.json({ error: 'Failed to fetch places', details: error.message }, 500)
  }
})

// Admin: Create place
app.post('/make-server-053bcd80/admin/places', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    const {
      name,
      type,
      category,
      description,
      status,
      // Location data
      latitude,
      longitude,
      area_boundary_coords, // Array of [lng, lat] pairs for polygon
      // Address
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      // Contact
      phone,
      email,
      website,
      social_media,
      // Association
      company_id,
      owner_name,
      manager_name,
      // Products/Services
      products_services,
      specialties,
      // Certifications
      certifications,
      // Operating Details
      operating_hours,
      seasonal_info,
      year_established,
      // Media
      photos,
      videos,
      logo_url
    } = body
    
    // Validation
    if (!name || !name.trim()) {
      return c.json({ error: 'Place name is required' }, 400)
    }
    if (!type) {
      return c.json({ error: 'Place type is required' }, 400)
    }
    if (!category) {
      return c.json({ error: 'Place category is required' }, 400)
    }
    if (!country) {
      return c.json({ error: 'Country is required' }, 400)
    }
    if (!latitude && !area_boundary_coords) {
      return c.json({ error: 'Either point location (latitude/longitude) or area boundary is required' }, 400)
    }
    
    console.log('📍 [ADMIN] Creating place:', name)
    
    // Build insert data
    const insertData: any = {
      name: name.trim(),
      type,
      category,
      description: description?.trim() || null,
      status: status || 'active',
      // Location - store as simple lat/lng, trigger will create geography
      latitude: latitude || null,
      longitude: longitude || null,
      // Address
      address_line1: address_line1?.trim() || null,
      address_line2: address_line2?.trim() || null,
      city: city?.trim() || null,
      state_province: state_province?.trim() || null,
      postal_code: postal_code?.trim() || null,
      country: country.trim(),
      // Contact
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      website: website?.trim() || null,
      social_media: social_media || null,
      // Association
      company_id: company_id || null,
      owner_name: owner_name?.trim() || null,
      manager_name: manager_name?.trim() || null,
      // Products/Services
      products_services: products_services || null,
      specialties: specialties || null,
      // Certifications
      certifications: certifications || null,
      // Operating Details
      operating_hours: operating_hours || null,
      seasonal_info: seasonal_info?.trim() || null,
      year_established: year_established || null,
      // Media
      photos: photos || null,
      videos: videos || null,
      logo_url: logo_url || null,
      // Metadata
      created_by: userId
    }
    
    // Handle area boundary polygon if provided
    if (area_boundary_coords && Array.isArray(area_boundary_coords) && area_boundary_coords.length >= 3) {
      // Polygon boundary - ensure first and last points are the same
      const coords = [...area_boundary_coords]
      if (JSON.stringify(coords[0]) !== JSON.stringify(coords[coords.length - 1])) {
        coords.push(coords[0]) // Close the polygon
      }
      
      // Create WKT (Well-Known Text) format for polygon
      const wktCoords = coords.map(([lng, lat]: [number, number]) => `${lng} ${lat}`).join(',')
      insertData.area_boundary = `SRID=4326;POLYGON((${wktCoords}))`
    }
    
    const { data: place, error } = await getSupabaseClient()
      .from('places')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating place:', error)
      return c.json({ error: 'Failed to create place', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Place created:', place.id)
    return c.json({ place })
  } catch (error: any) {
    console.error('❌ Error in create place route:', error)
    return c.json({ error: 'Failed to create place', details: error.message }, 500)
  }
})

// Admin: Update place
app.put('/make-server-053bcd80/admin/places/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    console.log('📍 [ADMIN] Updating place:', id)
    
    // Build update data (only include provided fields)
    const updateData: any = {}
    
    // Basic fields
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.type !== undefined) updateData.type = body.type
    if (body.category !== undefined) updateData.category = body.category
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.status !== undefined) updateData.status = body.status
    
    // Address
    if (body.address_line1 !== undefined) updateData.address_line1 = body.address_line1?.trim() || null
    if (body.address_line2 !== undefined) updateData.address_line2 = body.address_line2?.trim() || null
    if (body.city !== undefined) updateData.city = body.city?.trim() || null
    if (body.state_province !== undefined) updateData.state_province = body.state_province?.trim() || null
    if (body.postal_code !== undefined) updateData.postal_code = body.postal_code?.trim() || null
    if (body.country !== undefined) updateData.country = body.country.trim()
    
    // Contact
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null
    if (body.email !== undefined) updateData.email = body.email?.trim() || null
    if (body.website !== undefined) updateData.website = body.website?.trim() || null
    if (body.social_media !== undefined) updateData.social_media = body.social_media || null
    
    // Association
    if (body.company_id !== undefined) updateData.company_id = body.company_id || null
    if (body.owner_name !== undefined) updateData.owner_name = body.owner_name?.trim() || null
    if (body.manager_name !== undefined) updateData.manager_name = body.manager_name?.trim() || null
    
    // Products/Services
    if (body.products_services !== undefined) updateData.products_services = body.products_services || null
    if (body.specialties !== undefined) updateData.specialties = body.specialties || null
    
    // Certifications
    if (body.certifications !== undefined) updateData.certifications = body.certifications || null
    
    // Operating Details
    if (body.operating_hours !== undefined) updateData.operating_hours = body.operating_hours || null
    if (body.seasonal_info !== undefined) updateData.seasonal_info = body.seasonal_info?.trim() || null
    if (body.year_established !== undefined) updateData.year_established = body.year_established || null
    
    // Media
    if (body.photos !== undefined) updateData.photos = body.photos || null
    if (body.videos !== undefined) updateData.videos = body.videos || null
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null
    
    // Handle location updates - store lat/lng, trigger will update geography
    if (body.latitude !== undefined) updateData.latitude = body.latitude
    if (body.longitude !== undefined) updateData.longitude = body.longitude
    
    // Handle area boundary polygon updates
    if (body.area_boundary_coords !== undefined && Array.isArray(body.area_boundary_coords) && body.area_boundary_coords.length >= 3) {
      const coords = [...body.area_boundary_coords]
      if (JSON.stringify(coords[0]) !== JSON.stringify(coords[coords.length - 1])) {
        coords.push(coords[0])
      }
      const wktCoords = coords.map(([lng, lat]: [number, number]) => `${lng} ${lat}`).join(',')
      updateData.area_boundary = `SRID=4326;POLYGON((${wktCoords}))`
    }
    
    const { data: place, error } = await getSupabaseClient()
      .from('places')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Place not found' }, 404)
      }
      console.error('❌ Error updating place:', error)
      return c.json({ error: 'Failed to update place', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Place updated:', place.id)
    return c.json({ place })
  } catch (error: any) {
    console.error('❌ Error in update place route:', error)
    return c.json({ error: 'Failed to update place', details: error.message }, 500)
  }
})

// Admin: Delete place
app.delete('/make-server-053bcd80/admin/places/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id')
    
    console.log('📍 [ADMIN] Deleting place:', id)
    
    const { error } = await getSupabaseClient()
      .from('places')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Error deleting place:', error)
      return c.json({ error: 'Failed to delete place', details: error.message }, 500)
    }
    
    console.log('✅ [ADMIN] Place deleted:', id)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in delete place route:', error)
    return c.json({ error: 'Failed to delete place', details: error.message }, 500)
  }
})

} // End of setupPlacesRoutes