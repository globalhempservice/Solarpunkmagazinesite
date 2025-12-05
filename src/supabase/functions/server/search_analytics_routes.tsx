import { Hono } from 'npm:hono'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Search Analytics Routes
 * Handles tracking and analytics for the 3D Globe search functionality
 */
export function setupSearchAnalyticsRoutes(app: Hono, requireAuth?: any, requireAdmin?: any) {
  
  // ============================================
  // PUBLIC ROUTES (No auth required)
  // ============================================
  
  /**
   * POST /make-server-053bcd80/search/track
   * Track a new search query (works for both authenticated and anonymous users)
   */
  app.post('/make-server-053bcd80/search/track', async (c) => {
    try {
      const body = await c.req.json()
      const {
        userId,
        sessionId,
        searchQuery,
        resultsCount,
        activeLayer,
        globeLat,
        globeLng,
        globeAltitude,
        searchExpanded = true
      } = body

      // Validate required fields
      if (!searchQuery || searchQuery.trim() === '') {
        return c.json({ error: 'Search query is required' }, 400)
      }

      if (!sessionId) {
        return c.json({ error: 'Session ID is required' }, 400)
      }

      // Get IP and user agent from request headers
      const ipAddress = c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       'unknown'
      const userAgent = c.req.header('user-agent') || 'unknown'
      const referrer = c.req.header('referer') || c.req.header('referrer') || null

      // Insert search record
      const { data, error } = await supabase
        .from('search_analytics_053bcd80')
        .insert({
          user_id: userId || null,
          session_id: sessionId,
          search_query: searchQuery.trim(),
          results_count: resultsCount || 0,
          active_layer: activeLayer || 'all',
          globe_lat: globeLat || null,
          globe_lng: globeLng || null,
          globe_altitude: globeAltitude || null,
          search_expanded: searchExpanded,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          clicked: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error tracking search:', error)
        return c.json({ 
          error: 'Failed to track search', 
          details: error.message 
        }, 500)
      }

      return c.json({ 
        success: true, 
        searchId: data.id,
        message: 'Search tracked successfully' 
      })
    } catch (error: any) {
      console.error('Error in search tracking:', error)
      return c.json({ 
        error: 'Internal server error', 
        details: error.message 
      }, 500)
    }
  })

  /**
   * POST /make-server-053bcd80/search/track-click
   * Track when a user clicks on a search result
   */
  app.post('/make-server-053bcd80/search/track-click', async (c) => {
    try {
      const body = await c.req.json()
      const {
        searchId,
        resultType,
        resultName,
        resultId,
        resultCountry,
        resultCity,
        resultLat,
        resultLng,
        timeToClickMs
      } = body

      // Validate required fields
      if (!searchId) {
        return c.json({ error: 'Search ID is required' }, 400)
      }

      if (!resultType || !resultName) {
        return c.json({ error: 'Result type and name are required' }, 400)
      }

      // Update search record with click data
      const { data, error } = await supabase
        .from('search_analytics_053bcd80')
        .update({
          clicked: true,
          result_type: resultType,
          result_name: resultName,
          result_id: resultId || null,
          result_country: resultCountry || null,
          result_city: resultCity || null,
          result_lat: resultLat || null,
          result_lng: resultLng || null,
          time_to_click_ms: timeToClickMs || null,
          clicked_at: new Date().toISOString()
        })
        .eq('id', searchId)
        .select()
        .single()

      if (error) {
        console.error('Error tracking search click:', error)
        return c.json({ 
          error: 'Failed to track search click', 
          details: error.message 
        }, 500)
      }

      return c.json({ 
        success: true,
        message: 'Search click tracked successfully' 
      })
    } catch (error: any) {
      console.error('Error in search click tracking:', error)
      return c.json({ 
        error: 'Internal server error', 
        details: error.message 
      }, 500)
    }
  })

  /**
   * GET /make-server-053bcd80/search/suggestions
   * Get search suggestions based on partial query (autocomplete)
   */
  app.get('/make-server-053bcd80/search/suggestions', async (c) => {
    try {
      const query = c.req.query('q') || ''
      const limit = parseInt(c.req.query('limit') || '10')

      if (query.trim() === '') {
        return c.json({ suggestions: [] })
      }

      // Call the database function for suggestions
      const { data, error } = await supabase
        .rpc('get_search_suggestions_053bcd80', {
          partial_query: query.trim(),
          suggestion_limit: limit
        })

      if (error) {
        console.error('Error getting search suggestions:', error)
        return c.json({ 
          error: 'Failed to get suggestions', 
          details: error.message 
        }, 500)
      }

      return c.json({ 
        suggestions: data || [],
        query: query.trim()
      })
    } catch (error: any) {
      console.error('Error in search suggestions:', error)
      return c.json({ 
        error: 'Internal server error', 
        details: error.message 
      }, 500)
    }
  })

  // ============================================
  // AUTHENTICATED USER ROUTES
  // ============================================

  /**
   * GET /make-server-053bcd80/search/my-history
   * Get the authenticated user's search history
   */
  if (requireAuth) {
    app.get('/make-server-053bcd80/search/my-history', requireAuth, async (c) => {
      try {
        const userId = c.get('userId')
        const limit = parseInt(c.req.query('limit') || '50')
        const offset = parseInt(c.req.query('offset') || '0')

        const { data, error, count } = await supabase
          .from('search_analytics_053bcd80')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('searched_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching search history:', error)
          return c.json({ 
            error: 'Failed to fetch search history', 
            details: error.message 
          }, 500)
        }

        return c.json({ 
          searches: data || [],
          total: count || 0,
          limit,
          offset
        })
      } catch (error: any) {
        console.error('Error in search history:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })
  }

  // ============================================
  // ADMIN ROUTES (Analytics & Insights)
  // ============================================

  if (requireAdmin) {
    /**
     * GET /make-server-053bcd80/search/admin/summary
     * Get aggregated search analytics summary
     */
    app.get('/make-server-053bcd80/search/admin/summary', requireAdmin, async (c) => {
      try {
        const days = parseInt(c.req.query('days') || '30')
        
        const { data, error } = await supabase
          .from('search_analytics_summary_053bcd80')
          .select('*')
          .gte('search_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('search_date', { ascending: false })

        if (error) {
          console.error('Error fetching search summary:', error)
          return c.json({ 
            error: 'Failed to fetch search summary', 
            details: error.message 
          }, 500)
        }

        return c.json({ summary: data || [] })
      } catch (error: any) {
        console.error('Error in search summary:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })

    /**
     * GET /make-server-053bcd80/search/admin/top-searches
     * Get top searched queries (filtered to 3+ characters only)
     */
    app.get('/make-server-053bcd80/search/admin/top-searches', requireAdmin, async (c) => {
      try {
        const { data, error } = await supabase
          .from('top_searches_053bcd80')
          .select('*')
          .limit(50)

        if (error) {
          console.error('Error fetching top searches:', error)
          return c.json({ 
            error: 'Failed to fetch top searches', 
            details: error.message 
          }, 500)
        }

        // Filter out searches with less than 3 characters
        const filtered = (data || []).filter((search: any) => 
          search.query && search.query.trim().length >= 3
        )

        return c.json({ topSearches: filtered })
      } catch (error: any) {
        console.error('Error in top searches:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })

    /**
     * GET /make-server-053bcd80/search/admin/trending
     * Get trending searches with trend scores
     */
    app.get('/make-server-053bcd80/search/admin/trending', requireAdmin, async (c) => {
      try {
        const days = parseInt(c.req.query('days') || '7')
        const limit = parseInt(c.req.query('limit') || '20')

        const { data, error } = await supabase
          .rpc('get_trending_searches_053bcd80', {
            days_back: days,
            result_limit: limit
          })

        if (error) {
          console.error('Error fetching trending searches:', error)
          return c.json({ 
            error: 'Failed to fetch trending searches', 
            details: error.message 
          }, 500)
        }

        return c.json({ trending: data || [] })
      } catch (error: any) {
        console.error('Error in trending searches:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })

    /**
     * GET /make-server-053bcd80/search/admin/failed-searches
     * Get searches that returned no results (to improve search)
     */
    app.get('/make-server-053bcd80/search/admin/failed-searches', requireAdmin, async (c) => {
      try {
        const days = parseInt(c.req.query('days') || '7')

        const { data, error } = await supabase
          .from('search_analytics_053bcd80')
          .select('search_query, searched_at')
          .eq('results_count', 0)
          .gte('searched_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('searched_at', { ascending: false })
          .limit(100)

        if (error) {
          console.error('Error fetching failed searches:', error)
          return c.json({ 
            error: 'Failed to fetch failed searches', 
            details: error.message 
          }, 500)
        }

        // Group by query and count (filter out searches < 3 chars)
        const grouped = (data || []).reduce((acc: any, search: any) => {
          // Skip searches with less than 3 characters
          if (!search.search_query || search.search_query.trim().length < 3) {
            return acc
          }
          
          const query = search.search_query.toLowerCase()
          if (!acc[query]) {
            acc[query] = {
              query: search.search_query,
              count: 0,
              lastSearched: search.searched_at
            }
          }
          acc[query].count++
          if (search.searched_at > acc[query].lastSearched) {
            acc[query].lastSearched = search.searched_at
          }
          return acc
        }, {})

        const failedSearches = Object.values(grouped)
          .sort((a: any, b: any) => b.count - a.count)

        return c.json({ failedSearches })
      } catch (error: any) {
        console.error('Error in failed searches:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })

    /**
     * GET /make-server-053bcd80/search/admin/stats
     * Get overall search statistics
     */
    app.get('/make-server-053bcd80/search/admin/stats', requireAdmin, async (c) => {
      try {
        const days = parseInt(c.req.query('days') || '30')
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

        // Get overall stats
        const { data: searches, error: searchError } = await supabase
          .from('search_analytics_053bcd80')
          .select('*')
          .gte('searched_at', startDate)

        if (searchError) {
          return c.json({ 
            error: 'Failed to fetch search stats', 
            details: searchError.message 
          }, 500)
        }

        const totalSearches = searches?.length || 0
        const uniqueUsers = new Set(searches?.filter(s => s.user_id).map(s => s.user_id)).size
        const uniqueSessions = new Set(searches?.map(s => s.session_id)).size
        const searchesWithClicks = searches?.filter(s => s.clicked).length || 0
        const clickThroughRate = totalSearches > 0 
          ? ((searchesWithClicks / totalSearches) * 100).toFixed(2)
          : '0.00'
        
        // Average time to click (only for searches that were clicked)
        const clickedSearches = searches?.filter(s => s.time_to_click_ms !== null) || []
        const avgTimeToClick = clickedSearches.length > 0
          ? Math.round(clickedSearches.reduce((sum, s) => sum + (s.time_to_click_ms || 0), 0) / clickedSearches.length)
          : 0

        // Searches by layer
        const byLayer = searches?.reduce((acc: any, s: any) => {
          const layer = s.active_layer || 'unknown'
          acc[layer] = (acc[layer] || 0) + 1
          return acc
        }, {})

        // Searches by result type
        const byResultType = searches?.reduce((acc: any, s: any) => {
          if (s.result_type) {
            acc[s.result_type] = (acc[s.result_type] || 0) + 1
          }
          return acc
        }, {})

        // Top countries
        const topCountries = searches
          ?.filter(s => s.result_country)
          .reduce((acc: any, s: any) => {
            acc[s.result_country] = (acc[s.result_country] || 0) + 1
            return acc
          }, {})

        const topCountriesList = Object.entries(topCountries || {})
          .map(([country, count]) => ({ country, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10)

        return c.json({
          stats: {
            totalSearches,
            uniqueUsers,
            uniqueSessions,
            searchesWithClicks,
            clickThroughRate: parseFloat(clickThroughRate),
            avgTimeToClickMs: avgTimeToClick,
            searchesByLayer: byLayer || {},
            searchesByResultType: byResultType || {},
            topCountries: topCountriesList,
            period: {
              days,
              startDate,
              endDate: new Date().toISOString()
            }
          }
        })
      } catch (error: any) {
        console.error('Error in search stats:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })
    
    /**
     * GET /make-server-053bcd80/search/admin/all-searches
     * Get all recent search records (filtered and deduplicated)
     */
    app.get('/make-server-053bcd80/search/admin/all-searches', requireAdmin, async (c) => {
      try {
        const days = parseInt(c.req.query('days') || '30')
        const limit = parseInt(c.req.query('limit') || '100')
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
          .from('search_analytics_053bcd80')
          .select('*')
          .gte('searched_at', startDate)
          .order('searched_at', { ascending: false })
          .limit(limit * 3) // Fetch more since we'll filter

        if (error) {
          console.error('Error fetching all searches:', error)
          return c.json({ 
            error: 'Failed to fetch searches', 
            details: error.message 
          }, 500)
        }

        // Filter out short searches and deduplicate
        const filtered = (data || []).filter((search: any) => 
          search.search_query && search.search_query.trim().length >= 3
        )
        
        // Deduplicate by keeping only the most recent search for each unique query
        const uniqueMap = new Map()
        filtered.forEach((search: any) => {
          const query = search.search_query.toLowerCase()
          if (!uniqueMap.has(query)) {
            uniqueMap.set(query, search)
          }
        })
        
        const deduplicated = Array.from(uniqueMap.values()).slice(0, limit)

        return c.json({ searches: deduplicated })
      } catch (error: any) {
        console.error('Error in all searches:', error)
        return c.json({ 
          error: 'Internal server error', 
          details: error.message 
        }, 500)
      }
    })
  }

  console.log('✅ Search analytics routes setup complete')
}