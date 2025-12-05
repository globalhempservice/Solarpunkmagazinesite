// Google Maps URL Parser Utility
// Extracts place information from Google Maps URLs

export interface GoogleMapsPlaceData {
  name?: string
  address?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  phone?: string
  website?: string
  place_id?: string
  rating?: number
  user_ratings_total?: number
}

/**
 * Parse Google Maps URL and extract place information
 * Handles both short URLs (maps.app.goo.gl) and full URLs
 */
export async function parseGoogleMapsUrl(url: string): Promise<GoogleMapsPlaceData> {
  try {
    console.log('🗺️ Parsing Google Maps URL:', url)
    
    // Step 1: If it's a shortened URL, follow redirect to get full URL
    let fullUrl = url
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
      console.log('🔗 Following shortened URL redirect...')
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
        })
        fullUrl = response.url
        console.log('🔗 Full URL:', fullUrl)
      } catch (error) {
        console.error('❌ Error following redirect:', error)
        // Continue with original URL
      }
    }
    
    const result: GoogleMapsPlaceData = {}
    
    // Step 2: Extract coordinates from URL
    // Format: @latitude,longitude,zoom
    const coordMatch = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      result.latitude = parseFloat(coordMatch[1])
      result.longitude = parseFloat(coordMatch[2])
      console.log('📍 Coordinates extracted:', result.latitude, result.longitude)
    }
    
    // Alternative coordinate format: ?q=latitude,longitude
    if (!result.latitude) {
      const qMatch = fullUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (qMatch) {
        result.latitude = parseFloat(qMatch[1])
        result.longitude = parseFloat(qMatch[2])
        console.log('📍 Coordinates extracted (q param):', result.latitude, result.longitude)
      }
    }
    
    // Step 3: Extract place name from URL
    // Format: /place/Place+Name/@
    const placeMatch = fullUrl.match(/\/place\/([^/@]+)/)
    if (placeMatch) {
      result.name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
      console.log('📝 Place name extracted:', result.name)
    }
    
    // Step 4: Extract place_id if available
    const placeIdMatch = fullUrl.match(/place_id=([^&]+)/)
    if (placeIdMatch) {
      result.place_id = placeIdMatch[1]
      console.log('🆔 Place ID extracted:', result.place_id)
    }
    
    // Step 5: Use reverse geocoding to get address details from coordinates
    if (result.latitude && result.longitude) {
      console.log('🌍 Reverse geocoding coordinates...')
      try {
        // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key required)
        const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${result.latitude}&lon=${result.longitude}&format=json&addressdetails=1`
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'DEWII Hemp\'in Universe/1.0 (mag.hempin.org)',
            'Accept-Language': 'en'
          }
        })
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          console.log('🌍 Geocoding result:', JSON.stringify(geocodeData, null, 2))
          
          // Extract address components
          if (geocodeData.address) {
            const addr = geocodeData.address
            
            // Build full address from components
            const addressParts = []
            if (addr.house_number) addressParts.push(addr.house_number)
            if (addr.road) addressParts.push(addr.road)
            if (addr.neighbourhood) addressParts.push(addr.neighbourhood)
            if (addr.suburb) addressParts.push(addr.suburb)
            
            // Full address - use display_name but clean it up
            result.address = geocodeData.display_name
            
            // City - try multiple fields in order of preference
            result.city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.locality || addr.state_district
            
            // State/Province
            result.state_province = addr.state || addr.province || addr.region || addr.state_district
            
            // Country - prioritize country field, fallback to country_code
            result.country = addr.country
            
            // Also get country code for validation
            const countryCode = addr.country_code?.toUpperCase()
            
            console.log('✅ Address parsed:', {
              address: result.address,
              city: result.city,
              state: result.state_province,
              country: result.country,
              countryCode: countryCode
            })
            
            // Postal code
            result.postal_code = addr.postcode
            
            // If we extracted a place name from URL, keep it
            // Otherwise use a business name or POI from geocoding
            if (!result.name) {
              result.name = geocodeData.name || addr.amenity || addr.shop || addr.building
            } else {
              // If result.name looks like a full address, try to extract just the place name
              // Check if geocoding gives us a more specific place name
              if (geocodeData.name && geocodeData.name.length < result.name.length) {
                // Use the shorter, more specific name from geocoding
                const geoName = geocodeData.name
                // Only replace if it doesn't look like an address
                if (!geoName.includes(',') && !geoName.match(/\d{2,}/)) {
                  result.name = geoName
                }
              }
            }
          }
        }
      } catch (geocodeError) {
        console.error('❌ Reverse geocoding failed:', geocodeError)
        // Continue without geocoding data
      }
    }
    
    // Step 6: Try to fetch place details from the actual page (scraping)
    // This is a fallback for when we can't get data from coordinates
    if (!result.name || !result.city) {
      console.log('🕷️ Attempting to scrape page for more details...')
      try {
        const pageResponse = await fetch(fullUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (pageResponse.ok) {
          const html = await pageResponse.text()
          
          // Extract place name from meta tags or page title
          if (!result.name) {
            const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
            if (ogTitleMatch) {
              result.name = ogTitleMatch[1]
              console.log('📝 Name from og:title:', result.name)
            } else {
              const titleMatch = html.match(/<title>([^<]+)<\/title>/)
              if (titleMatch) {
                // Google Maps titles are like "Place Name - Google Maps"
                result.name = titleMatch[1].replace(/\s*-\s*Google Maps.*$/i, '').trim()
                console.log('📝 Name from title:', result.name)
              }
            }
          }
          
          // Try to extract address from structured data
          const jsonLdMatch = html.match(/<script type="application\/ld\+json">(\{[^<]+\})<\/script>/)
          if (jsonLdMatch) {
            try {
              const jsonData = JSON.parse(jsonLdMatch[1])
              if (jsonData.address) {
                if (jsonData.address.addressLocality) result.city = jsonData.address.addressLocality
                if (jsonData.address.addressRegion) result.state_province = jsonData.address.addressRegion
                if (jsonData.address.addressCountry) result.country = jsonData.address.addressCountry
                if (jsonData.address.postalCode) result.postal_code = jsonData.address.postalCode
                console.log('📍 Address from JSON-LD:', jsonData.address)
              }
              if (jsonData.telephone && !result.phone) {
                result.phone = jsonData.telephone
                console.log('📞 Phone from JSON-LD:', result.phone)
              }
              if (jsonData.url && !result.website) {
                result.website = jsonData.url
                console.log('🌐 Website from JSON-LD:', result.website)
              }
            } catch (jsonError) {
              console.error('❌ Failed to parse JSON-LD:', jsonError)
            }
          }
        }
      } catch (scrapeError) {
        console.error('❌ Page scraping failed:', scrapeError)
        // Continue without scraped data
      }
    }
    
    console.log('✅ Final parsed data:', result)
    return result
    
  } catch (error: any) {
    console.error('❌ Google Maps URL parsing error:', error)
    throw new Error(`Failed to parse Google Maps URL: ${error.message}`)
  }
}

/**
 * Validate if a string is a Google Maps URL
 */
export function isGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    console.log('🔍 URL validation: Invalid input (empty or not a string)')
    return false
  }
  
  // Common Google Maps URL patterns
  const patterns = [
    /^https?:\/\/(www\.)?google\.[a-z.]+\/maps/i,        // https://google.com/maps
    /^https?:\/\/maps\.google\.[a-z.]+/i,                 // https://maps.google.com
    /^https?:\/\/maps\.app\.goo\.gl/i,                    // https://maps.app.goo.gl (short link)
    /^https?:\/\/goo\.gl\/maps/i,                         // https://goo.gl/maps (old short link)
    /^https?:\/\/www\.google\.[a-z.]+\/maps/i,           // www variant
  ]
  
  const isValid = patterns.some(pattern => pattern.test(url))
  console.log('🔍 URL validation:', {
    url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
    isValid,
    matchedPattern: patterns.findIndex(pattern => pattern.test(url))
  })
  
  return isValid
}