import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Building2, MapPin, Globe as GlobeIcon, ArrowLeft, Sparkles, ZoomIn, ZoomOut, RotateCw, X, Users, Award, ExternalLink, Map, Package, Calendar, Search } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CompanyCard } from './CompanyCard'
import { GlobeLayerSelector, LayerType } from './GlobeLayerSelector'
import { StreetMapView } from './StreetMapView'
import { MapLoadingScreen } from './MapLoadingScreen'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

/**
 * COUNTRY FOCUS MODE SYSTEM:
 * ===========================
 * - Hover: Visual highlight only (no elevation, keeps pins visible)
 * - Click: Activates focus mode with:
 *   • Medium elevation (0.04) for country
 *   • Auto-center and zoom to country (1.8 altitude, 1.2s smooth transition)
 *   • City pins elevate HIGHER (0.08) than country surface
 *   • Golden rings elevate HIGHEST (0.09) above everything
 *   • Pins become 30% larger in focused country
 *   • Rings expand to 6 units (from 4)
 *   • "FOCUS MODE" badge appears at top
 * - Click again: Deselects and returns to default view (lat:20, lng:0, alt:2.5)
 * 
 * GOLDEN MARKERS: All city pins are ALWAYS golden (#fbbf24) across all layer themes!
 */

// Lazy load Globe to avoid bundling issues
// Note: react-globe.gl uses Three.js internally, which may show a "Multiple instances of Three.js" warning
// This is a known issue with the library and does not affect functionality
const GlobeComponent = lazy(() => import('react-globe.gl'))

interface WorldMapBrowser3DProps {
  serverUrl: string
  userId?: string
  accessToken?: string
  publicAnonKey: string
  onClose: () => void
  onViewCompany: (companyId: string) => void
  onManageOrganization?: () => void
  onAddOrganization?: () => void
}

interface LocationData {
  country: string
  cities: {
    [city: string]: any[]
  }
}

interface GlobeMarker {
  lat: number
  lng: number
  size: number
  color: string
  country: string
  city: string
  companies: any[]
}

export function WorldMapBrowser3D({ serverUrl, userId, accessToken, publicAnonKey, onClose, onViewCompany, onManageOrganization, onAddOrganization }: WorldMapBrowser3DProps) {
  const [companies, setCompanies] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [places, setPlaces] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([]) // Placeholder for future events
  const [loading, setLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('places')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<{ [country: string]: LocationData }>({})
  const [markers, setMarkers] = useState<GlobeMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null)
  
  // City Atlas modal state - for country/city dropdowns
  const [atlasCountry, setAtlasCountry] = useState<string>('')
  const [atlasCity, setAtlasCity] = useState<string>('')
  
  // Globe configuration (using defaults, admin panel removed)
  const globeConfig = {
    atmosphereColor: '#8FD14F',
    atmosphereAltitude: 0.15,
    oceanShininess: 30,
    cameraFOV: 50,
    autoRotate: false,
    rotationSpeed: 1,
    polygonSideGlow: 1.5, // Multiplier for color brightness (1.0 = normal, 1.5 = 50% brighter)
    showAtmosphere: true,
    atmosphereIntensity: 0.15,
    countryElevation: 0.04,
    markerAltitude: 0.05,
    markerSize: 1.0,
    markerSmoothness: 8,
    backgroundOpacity: 0,
    polygonCurvature: 4
  }
  const [countryPolygons, setCountryPolygons] = useState<any[]>([])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null)
  const [isCountryAnimating, setIsCountryAnimating] = useState(false)
  const [showAtlasCard, setShowAtlasCard] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [showStreetMap, setShowStreetMap] = useState(false)
  const [showMapLoading, setShowMapLoading] = useState(false)
  const [streetMapData, setStreetMapData] = useState<{ city: string; country: string; lat: number; lng: number; places: any[] } | null>(null)
  const globeEl = useRef<any>()
  
  // Search state
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null)
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`)

  // Suppress known Three.js warnings from react-globe.gl
  useEffect(() => {
    const originalWarn = console.warn
    const originalError = console.error
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      // Suppress Three.js multiple instances warning
      if (message.includes('THREE.WebGLRenderer') || 
          message.includes('Multiple instances') ||
          message.includes('three.module.js')) {
        return
      }
      originalWarn.apply(console, args)
    }
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      // Suppress Three.js related errors that don't affect functionality
      if (message.includes('THREE.WebGLRenderer') || 
          message.includes('three.module.js')) {
        return
      }
      originalError.apply(console, args)
    }
    
    return () => {
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
    fetchProducts()
    fetchPlaces()
    loadCountryPolygons()
  }, [])

  // Reprocess location data when layer changes
  useEffect(() => {
    if (activeLayer === 'organizations' && companies.length > 0) {
      // Show organization pins
      processLocationData(companies, 'organizations')
    } else if (activeLayer === 'products' && products.length > 0) {
      // Show product pins (using made_in_country field)
      processLocationData(products, 'products')
    } else if (activeLayer === 'places' && places.length > 0) {
      // Places layer - show places with exact coordinates
      processPlacesData(places)
    } else if (activeLayer === 'events') {
      // Events layer - no data yet, show empty
      setMarkers([])
      setLocationData({})
    } else if (activeLayer === 'all') {
      // All Layers - combine organizations, products, and places
      const allItems = [...companies, ...products, ...places]
      if (allItems.length > 0) {
        // We need to process organizations, products, and places separately, then combine
        const orgLocations: { [country: string]: LocationData } = {}
        const productLocations: { [country: string]: LocationData } = {}
        const placesLocations: { [country: string]: LocationData } = {}
        const combinedMarkers: GlobeMarker[] = []
        
        // Process organizations
        companies.forEach(item => {
          if (item.location) {
            const parts = item.location.split(',').map((s: string) => s.trim())
            const countryRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0]
            const country = getFullCountryName(countryRaw)
            const city = parts.length > 1 ? parts[0] : 'Other'
            
            if (!orgLocations[country]) {
              orgLocations[country] = { country, cities: {} }
            }
            if (!orgLocations[country].cities[city]) {
              orgLocations[country].cities[city] = []
            }
            orgLocations[country].cities[city].push(item)
          }
        })
        
        // Process products
        products.forEach(item => {
          if (item.made_in_country) {
            const country = getFullCountryName(item.made_in_country.trim())
            const city = 'Products'
            
            if (!productLocations[country]) {
              productLocations[country] = { country, cities: {} }
            }
            if (!productLocations[country].cities[city]) {
              productLocations[country].cities[city] = []
            }
            productLocations[country].cities[city].push(item)
          }
        })
        
        // Create markers for organizations (green)
        Object.entries(orgLocations).forEach(([country, data]) => {
          Object.entries(data.cities).forEach(([city, cityItems]) => {
            const coords = getCityCoordinates(city, country)
            if (coords) {
              combinedMarkers.push({
                lat: coords.lat,
                lng: coords.lng,
                size: Math.min(cityItems.length * 0.3, 2),
                color: '#10b981', // Green for organizations
                country,
                city,
                companies: cityItems
              })
            }
          })
        })
        
        // Create markers for products (amber)
        Object.entries(productLocations).forEach(([country, data]) => {
          Object.entries(data.cities).forEach(([city, cityItems]) => {
            const coords = getCityCoordinates(city, country)
            if (coords) {
              combinedMarkers.push({
                lat: coords.lat,
                lng: coords.lng,
                size: Math.min(cityItems.length * 0.3, 2),
                color: '#f59e0b', // Amber for products
                country,
                city,
                companies: cityItems
              })
            }
          })
        })
        
        // Process places (with exact coordinates)
        places.forEach(place => {
          if (place.latitude && place.longitude && place.country) {
            const country = getFullCountryName(place.country)
            const city = place.city || place.name
            
            if (!placesLocations[country]) {
              placesLocations[country] = { country, cities: {} }
            }
            if (!placesLocations[country].cities[city]) {
              placesLocations[country].cities[city] = []
            }
            placesLocations[country].cities[city].push(place)
            
            // Create marker with exact coordinates
            combinedMarkers.push({
              lat: place.latitude,
              lng: place.longitude,
              size: place.area_hectares ? Math.min(place.area_hectares / 10, 2) : 0.5,
              color: '#ec4899', // Pink for places
              country,
              city,
              companies: [place]
            })
          }
        })
        
        // Combine location data
        const combinedLocations = { ...orgLocations }
        
        // Merge products
        Object.entries(productLocations).forEach(([country, data]) => {
          if (combinedLocations[country]) {
            Object.entries(data.cities).forEach(([city, items]) => {
              if (combinedLocations[country].cities[city]) {
                combinedLocations[country].cities[city].push(...items)
              } else {
                combinedLocations[country].cities[city] = items
              }
            })
          } else {
            combinedLocations[country] = data
          }
        })
        
        // Merge places
        Object.entries(placesLocations).forEach(([country, data]) => {
          if (combinedLocations[country]) {
            Object.entries(data.cities).forEach(([city, items]) => {
              if (combinedLocations[country].cities[city]) {
                combinedLocations[country].cities[city].push(...items)
              } else {
                combinedLocations[country].cities[city] = items
              }
            })
          } else {
            combinedLocations[country] = data
          }
        })
        
        setLocationData(combinedLocations)
        setMarkers(combinedMarkers)
      } else {
        setMarkers([])
        setLocationData({})
      }
    } else if (activeLayer === 'off') {
      // Off - hide everything
      setMarkers([])
      setLocationData({})
    } else {
      // Fallback - clear markers
      setMarkers([])
      setLocationData({})
    }
  }, [activeLayer, companies, products, places, events])

  // Auto-rotation effect
  useEffect(() => {
    if (!globeEl.current || !globeConfig.autoRotate) return

    const intervalId = setInterval(() => {
      if (globeEl.current) {
        const currentPOV = globeEl.current.pointOfView()
        globeEl.current.pointOfView({
          ...currentPOV,
          lng: (currentPOV.lng + globeConfig.rotationSpeed * 0.1) % 360
        })
      }
    }, 50) // Update every 50ms for smooth rotation

    return () => clearInterval(intervalId)
  }, [globeConfig.autoRotate, globeConfig.rotationSpeed])

  // Camera FOV effect
  useEffect(() => {
    if (globeEl.current && globeEl.current.camera) {
      globeEl.current.camera().fov = globeConfig.cameraFOV
      globeEl.current.camera().updateProjectionMatrix()
    }
  }, [globeConfig.cameraFOV])



  const fetchPlaces = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/places`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📍 Fetched places:', data.places?.length || 0)
        setPlaces(data.places || [])
      }
    } catch (error) {
      console.error('Error fetching places:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/companies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        processLocationData(data, 'organizations')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/swag-products/published`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Fetched products for globe:', data.length)
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Map country codes to full names (for GeoJSON matching)
  const getFullCountryName = (countryCode: string): string => {
    const countryMap: { [key: string]: string } = {
      // Common codes
      'FR': 'France',
      'DE': 'Germany',
      'ES': 'Spain',
      'IT': 'Italy',
      'UK': 'United Kingdom',
      'GB': 'United Kingdom',
      'US': 'United States of America',
      'USA': 'United States of America',
      'CA': 'Canada',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'VE': 'Venezuela',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'GR': 'Greece',
      'PT': 'Portugal',
      'IE': 'Ireland',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'AU': 'Australia',
      'NZ': 'New Zealand',
      'ZA': 'South Africa',
      'EG': 'Egypt',
      'MA': 'Morocco',
      'KE': 'Kenya',
      'NG': 'Nigeria',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'PH': 'Philippines',
      'ID': 'Indonesia',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'KR': 'South Korea',
      'TW': 'Taiwan',
      'IL': 'Israel',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia',
      'TR': 'Turkey',
      'RU': 'Russia',
      'UA': 'Ukraine',
    }
    
    // If it's already a full name, return it
    if (countryMap[countryCode.toUpperCase()]) {
      return countryMap[countryCode.toUpperCase()]
    }
    
    // Otherwise return as-is (might already be full name)
    return countryCode
  }

  const getLayerColor = (layerType: LayerType): string => {
    switch (layerType) {
      case 'places': return '#f9a8d4' // Pastel pink
      case 'organizations': return '#10b981' // Emerald
      case 'products': return '#f59e0b' // Amber
      case 'events': return '#a855f7' // Purple
      case 'all': return '#06b6d4' // Cyan
      default: return '#10b981'
    }
  }

  // Track what content types exist in each country for "All Layers" mode
  const getCountryContentTypes = (countryName: string): { hasOrgs: boolean; hasProducts: boolean; hasEvents: boolean; hasPlaces: boolean } => {
    // Check organizations
    const hasOrgs = companies.some(c => {
      if (!c.location) return false
      const parts = c.location.split(',').map((s: string) => s.trim())
      const country = getFullCountryName(parts.length > 1 ? parts[parts.length - 1] : parts[0])
      return country === countryName
    })

    // Check products (using made_in_country field)
    const hasProducts = products.some(p => {
      if (!p.made_in_country) return false
      const country = getFullCountryName(p.made_in_country.trim())
      return country === countryName
    })
    
    // Check places
    const hasPlaces = places.some(p => {
      if (!p.country) return false
      const country = getFullCountryName(p.country)
      return country === countryName
    })
    
    // TODO: Enable when events are added
    const hasEvents = false

    return { hasOrgs, hasProducts, hasEvents, hasPlaces }
  }

  // Create gradient color for "All Layers" mode based on content types
  const getMultiContentColor = (countryName: string): string => {
    const { hasOrgs, hasProducts, hasEvents, hasPlaces } = getCountryContentTypes(countryName)
    const colors: string[] = []
    
    if (hasOrgs) colors.push('#10b981') // Emerald
    if (hasProducts) colors.push('#f59e0b') // Amber
    if (hasPlaces) colors.push('#ec4899') // Pink
    if (hasEvents) colors.push('#a855f7') // Purple

    if (colors.length === 0) return '#064e3b' // No content
    if (colors.length === 1) return colors[0] // Single color
    
    // For multiple colors, we'll return the first one and use CSS gradients in the renderer
    // Since react-globe.gl doesn't support gradients directly, we'll blend the colors
    // by averaging their RGB values
    if (colors.length === 2) {
      // Blend two colors
      if (hasOrgs && hasProducts) return '#d97706' // Green + Orange = Dark amber
      if (hasOrgs && hasEvents) return '#059669' // Green + Purple = Teal
      if (hasProducts && hasEvents) return '#c2410c' // Orange + Purple = Red-orange
    }
    
    // All three content types
    return '#0891b2' // Cyan (represents all)
  }

  const processLocationData = (items: any[], layerType: LayerType = 'organizations') => {
    const locations: { [country: string]: LocationData } = {}
    const globeMarkers: GlobeMarker[] = []
    const color = getLayerColor(layerType)
    
    console.log(`Processing ${layerType} data:`, items.length)
    
    items.forEach(item => {
      let location = item.location
      let country = ''
      let city = 'Other'
      
      // Handle different layer types
      if (layerType === 'products') {
        // Products use made_in_country field (just country name, no city)
        if (item.made_in_country) {
          country = getFullCountryName(item.made_in_country.trim())
          city = 'Products' // Generic city name for products
          console.log(`Product "${item.name}": made_in_country="${item.made_in_country}" -> country="${country}"`)
        } else {
          return // Skip products without made_in_country
        }
      } else if (layerType === 'organizations' || layerType === 'all') {
        // Organizations use location field (City, Country format)
        if (item.location) {
          const parts = item.location.split(',').map((s: string) => s.trim())
          const countryRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0]
          country = getFullCountryName(countryRaw)
          city = parts.length > 1 ? parts[0] : 'Other'
          console.log(`Organization "${item.name}": location="${item.location}" -> city="${city}", country="${country}"`)
        } else {
          return // Skip items without location
        }
      } else {
        // Events, Places, etc. - use location field if available
        if (item.location) {
          const parts = item.location.split(',').map((s: string) => s.trim())
          const countryRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0]
          country = getFullCountryName(countryRaw)
          city = parts.length > 1 ? parts[0] : 'Other'
        } else {
          return // Skip items without location
        }
      }
      
      if (country) {
        if (!locations[country]) {
          locations[country] = {
            country,
            cities: {}
          }
        }
        
        if (!locations[country].cities[city]) {
          locations[country].cities[city] = []
        }
        
        locations[country].cities[city].push(item)
      }
    })
    
    console.log(`Location data by country for ${layerType}:`, Object.keys(locations))
    
    // Create globe markers with coordinates
    Object.entries(locations).forEach(([country, data]) => {
      Object.entries(data.cities).forEach(([city, cityItems]) => {
        const coords = getCityCoordinates(city, country)
        if (coords) {
          globeMarkers.push({
            lat: coords.lat,
            lng: coords.lng,
            size: Math.min(cityItems.length * 0.3, 2),
            color,
            country,
            city,
            companies: cityItems
          })
        }
      })
    })
    
    console.log(`Created markers for ${layerType}:`, globeMarkers.length)
    
    setLocationData(locations)
    setMarkers(globeMarkers)
  }

  // Process places data - uses exact latitude/longitude from database
  const processPlacesData = (placesData: any[]) => {
    const locations: { [country: string]: LocationData } = {}
    const globeMarkers: GlobeMarker[] = []
    const color = '#ec4899' // Pink color for places
    
    console.log(`Processing places data:`, placesData.length)
    
    placesData.forEach(place => {
      // Places have exact coordinates
      if (place.latitude && place.longitude && place.country) {
        const country = getFullCountryName(place.country)
        const city = place.city || place.name
        
        // Add to location data
        if (!locations[country]) {
          locations[country] = {
            country,
            cities: {}
          }
        }
        
        if (!locations[country].cities[city]) {
          locations[country].cities[city] = []
        }
        
        locations[country].cities[city].push(place)
        
        // Create marker with exact coordinates
        globeMarkers.push({
          lat: place.latitude,
          lng: place.longitude,
          size: place.area_hectares ? Math.min(place.area_hectares / 10, 2) : 0.5, // Size based on area for farms
          color,
          country,
          city,
          companies: [place] // Reuse companies array for consistency
        })
      }
    })
    
    console.log(`Created ${globeMarkers.length} place markers`)
    
    setLocationData(locations)
    setMarkers(globeMarkers)
  }

  // Coordinate lookup for cities
  const getCityCoordinates = (city: string, country: string): { lat: number, lng: number } | null => {
    const coordinates: { [key: string]: { lat: number, lng: number } } = {
      // France
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Lyon': { lat: 45.7640, lng: 4.8357 },
      'Marseille': { lat: 43.2965, lng: 5.3698 },
      
      // Germany
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'Munich': { lat: 48.1351, lng: 11.5820 },
      'Hamburg': { lat: 53.5511, lng: 9.9937 },
      
      // USA
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'San Francisco': { lat: 37.7749, lng: -122.4194 },
      'Denver': { lat: 39.7392, lng: -104.9903 },
      'Portland': { lat: 45.5152, lng: -122.6784 },
      
      // Canada
      'Toronto': { lat: 43.6532, lng: -79.3832 },
      'Vancouver': { lat: 49.2827, lng: -123.1207 },
      
      // UK
      'London': { lat: 51.5074, lng: -0.1278 },
      'Manchester': { lat: 53.4808, lng: -2.2426 },
      
      // Spain
      'Barcelona': { lat: 41.3874, lng: 2.1686 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      
      // Netherlands
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      
      // Thailand
      'Bangkok': { lat: 13.7563, lng: 100.5018 },
      'Chiang Mai': { lat: 18.7883, lng: 98.9853 },
      'Phuket': { lat: 7.8804, lng: 98.3923 },
      
      // Asia - Major cities
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Hong Kong': { lat: 22.3193, lng: 114.1694 },
      'Seoul': { lat: 37.5665, lng: 126.9780 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Shanghai': { lat: 31.2304, lng: 121.4737 },
      'Beijing': { lat: 39.9042, lng: 116.4074 },
      'Manila': { lat: 14.5995, lng: 120.9842 },
      'Jakarta': { lat: -6.2088, lng: 106.8456 },
      'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
      'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
      'Hanoi': { lat: 21.0285, lng: 105.8542 },
      
      // Australia / Oceania
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'Melbourne': { lat: -37.8136, lng: 144.9631 },
      'Brisbane': { lat: -27.4698, lng: 153.0251 },
      'Auckland': { lat: -36.8485, lng: 174.7633 },
      
      // South America
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
      'Lima': { lat: -12.0464, lng: -77.0428 },
      'Bogotá': { lat: 4.7110, lng: -74.0721 },
      
      // Europe - Additional cities
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Milan': { lat: 45.4642, lng: 9.1900 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Prague': { lat: 50.0755, lng: 14.4378 },
      'Warsaw': { lat: 52.2297, lng: 21.0122 },
      'Brussels': { lat: 50.8503, lng: 4.3517 },
      'Copenhagen': { lat: 55.6761, lng: 12.5683 },
      'Stockholm': { lat: 59.3293, lng: 18.0686 },
      'Oslo': { lat: 59.9139, lng: 10.7522 },
      'Helsinki': { lat: 60.1699, lng: 24.9384 },
      'Athens': { lat: 37.9838, lng: 23.7275 },
      'Lisbon': { lat: 38.7223, lng: -9.1393 },
      'Dublin': { lat: 53.3498, lng: -6.2603 },
      'Zurich': { lat: 47.3769, lng: 8.5417 },
      
      // Middle East / Africa
      'Dubai': { lat: 25.2048, lng: 55.2708 },
      'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
      'Istanbul': { lat: 41.0082, lng: 28.9784 },
      'Cairo': { lat: 30.0444, lng: 31.2357 },
      'Johannesburg': { lat: -26.2041, lng: 28.0473 },
      'Cape Town': { lat: -33.9249, lng: 18.4241 },
      'Nairobi': { lat: -1.2864, lng: 36.8172 },
      
      // Others - country capitals as fallback
      'Other': getCountryCapitalCoordinates(country),
      'Products': getCountryCapitalCoordinates(country) // Products use country capital
    }
    
    return coordinates[city] || coordinates['Other']
  }

  const getCountryCapitalCoordinates = (country: string): { lat: number, lng: number } => {
    const capitals: { [key: string]: { lat: number, lng: number } } = {
      // Europe
      'France': { lat: 48.8566, lng: 2.3522 },
      'Germany': { lat: 52.5200, lng: 13.4050 },
      'Spain': { lat: 40.4168, lng: -3.7038 },
      'Italy': { lat: 41.9028, lng: 12.4964 },
      'United Kingdom': { lat: 51.5074, lng: -0.1278 },
      'Netherlands': { lat: 52.3676, lng: 4.9041 },
      'Switzerland': { lat: 46.9480, lng: 7.4474 },
      'Sweden': { lat: 59.3293, lng: 18.0686 },
      'Norway': { lat: 59.9139, lng: 10.7522 },
      'Denmark': { lat: 55.6761, lng: 12.5683 },
      
      // Americas
      'United States of America': { lat: 38.9072, lng: -77.0369 },
      'USA': { lat: 38.9072, lng: -77.0369 },
      'Canada': { lat: 45.4215, lng: -75.6972 },
      'Brazil': { lat: -15.7975, lng: -47.8919 },
      'Mexico': { lat: 19.4326, lng: -99.1332 },
      
      // Asia
      'Thailand': { lat: 13.7563, lng: 100.5018 },
      'Vietnam': { lat: 21.0285, lng: 105.8542 },
      'Japan': { lat: 35.6762, lng: 139.6503 },
      'China': { lat: 39.9042, lng: 116.4074 },
      'India': { lat: 28.6139, lng: 77.2090 },
      'Philippines': { lat: 14.5995, lng: 120.9842 },
      'Indonesia': { lat: -6.2088, lng: 106.8456 },
      'Malaysia': { lat: 3.1390, lng: 101.6869 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'South Korea': { lat: 37.5665, lng: 126.9780 },
      
      // Oceania
      'Australia': { lat: -35.2809, lng: 149.1300 },
      'New Zealand': { lat: -41.2865, lng: 174.7762 },
      
      // Africa
      'South Africa': { lat: -25.7479, lng: 28.2293 },
      'Kenya': { lat: -1.2921, lng: 36.8219 },
      'Nigeria': { lat: 9.0765, lng: 7.3986 },
      'Morocco': { lat: 33.9716, lng: -6.8498 },
    }
    
    return capitals[country] || { lat: 0, lng: 0 }
  }

  // Search functionality
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchExpanded])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results: any[] = []

    // Search countries
    const uniqueCountries = new Set<string>()
    Object.keys(locationData).forEach(country => {
      if (country.toLowerCase().includes(query)) {
        uniqueCountries.add(country)
        results.push({
          type: 'country',
          name: country,
          data: locationData[country]
        })
      }
    })

    // Search cities
    Object.keys(locationData).forEach(country => {
      Object.keys(locationData[country].cities).forEach(city => {
        if (city.toLowerCase().includes(query) && !uniqueCountries.has(country)) {
          results.push({
            type: 'city',
            name: city,
            country: country,
            data: locationData[country].cities[city]
          })
        }
      })
    })

    // Search places
    places.forEach(place => {
      if (place.name.toLowerCase().includes(query) || 
          place.description?.toLowerCase().includes(query) ||
          place.city?.toLowerCase().includes(query)) {
        results.push({
          type: 'place',
          name: place.name,
          city: place.city,
          country: place.country,
          data: place
        })
      }
    })

    // Search companies/organizations
    companies.forEach(company => {
      if (company.name.toLowerCase().includes(query) || 
          company.description?.toLowerCase().includes(query)) {
        results.push({
          type: 'organization',
          name: company.name,
          location: company.location,
          data: company
        })
      }
    })

    // Search products
    products.forEach(product => {
      if (product.name.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query)) {
        results.push({
          type: 'product',
          name: product.name,
          madeIn: product.made_in_country,
          data: product
        })
      }
    })

    setSearchResults(results.slice(0, 10)) // Limit to 10 results

    // Track search in analytics - ONLY for meaningful searches (3+ characters)
    // This prevents recording every single keystroke
    if (searchQuery.trim().length >= 3) {
      const trackSearch = async () => {
        try {
          const globeView = globeEl.current?.pointOfView()
          const response = await fetch(`${serverUrl}/search/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken || publicAnonKey}`
            },
            body: JSON.stringify({
              userId: userId || null,
              sessionId: sessionId,
              searchQuery: searchQuery.trim(),
              resultsCount: results.length,
              activeLayer: activeLayer,
              globeLat: globeView?.lat || null,
              globeLng: globeView?.lng || null,
              globeAltitude: globeView?.altitude || null,
              searchExpanded: true
            })
          })

          if (response.ok) {
            const data = await response.json()
            setCurrentSearchId(data.searchId)
            setSearchStartTime(Date.now())
          }
        } catch (error) {
          console.error('Failed to track search:', error)
        }
      }

      // Debounce the tracking by 500ms to avoid tracking while user is still typing
      const timeoutId = setTimeout(trackSearch, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, locationData, places, companies, products, serverUrl, userId, accessToken, sessionId, activeLayer, publicAnonKey])

  const handleSearchResultClick = async (result: any) => {
    // Track search click
    if (currentSearchId && searchStartTime) {
      try {
        const timeToClickMs = Date.now() - searchStartTime
        await fetch(`${serverUrl}/search/track-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          },
          body: JSON.stringify({
            searchId: currentSearchId,
            resultType: result.type,
            resultName: result.name,
            resultId: result.data?.id || null,
            resultCountry: result.country || result.data?.country || null,
            resultCity: result.city || result.data?.city || null,
            resultLat: result.data?.latitude || result.data?.lat || null,
            resultLng: result.data?.longitude || result.data?.lng || null,
            timeToClickMs: timeToClickMs
          })
        })
      } catch (error) {
        console.error('Failed to track search click:', error)
      }
    }

    if (result.type === 'country') {
      // Focus on country
      const countryCoords = getCountryCoordinates(result.name)
      if (globeEl.current) {
        globeEl.current.pointOfView({
          lat: countryCoords.lat,
          lng: countryCoords.lng,
          altitude: 1.8
        }, 1200)
      }
      setSelectedCountryName(result.name)
    } else if (result.type === 'city') {
      // Focus on city
      const marker = markers.find(m => m.city === result.name && m.country === result.country)
      if (marker && globeEl.current) {
        globeEl.current.pointOfView({
          lat: marker.lat,
          lng: marker.lng,
          altitude: 1.5
        }, 1200)
        setSelectedMarker(marker)
        setAtlasCountry(marker.country)
        setAtlasCity(marker.city)
      }
    } else if (result.type === 'place') {
      // Switch to Places layer and focus on place
      setActiveLayer('places')
      const place = result.data
      if (place.latitude && place.longitude) {
        // First, center the globe on the place location
        if (globeEl.current) {
          globeEl.current.pointOfView({
            lat: place.latitude,
            lng: place.longitude,
            altitude: 1.5
          }, 1200)
        }
        
        // Set the country and city for the atlas
        const country = getFullCountryName(place.country || '')
        const marker = markers.find(m => 
          m.country === country && 
          (m.city === place.city || m.city === 'Other')
        )
        
        if (marker) {
          setSelectedMarker(marker)
          setAtlasCountry(marker.country)
          setAtlasCity(marker.city)
        }
        
        // After centering, set up street map data and show loading
        setTimeout(() => {
          setStreetMapData({
            city: place.city || 'Unknown',
            country: place.country || 'Unknown',
            lat: place.latitude,
            lng: place.longitude,
            places: [place]
          })
          
          // Show loading screen
          setShowMapLoading(true)
          
          // After 2.5s, hide loading and show street map
          setTimeout(() => {
            setShowMapLoading(false)
            setShowStreetMap(true)
          }, 2500)
        }, 1300)
      }
    } else if (result.type === 'organization') {
      // Switch to Organizations layer and focus on organization location
      setActiveLayer('organizations')
      const location = result.data.location
      if (location) {
        const parts = location.split(',').map((s: string) => s.trim())
        const countryRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0]
        const country = getFullCountryName(countryRaw)
        const city = parts.length > 1 ? parts[0] : 'Other'
        
        const marker = markers.find(m => m.city === city && m.country === country)
        if (marker && globeEl.current) {
          globeEl.current.pointOfView({
            lat: marker.lat,
            lng: marker.lng,
            altitude: 1.5
          }, 1200)
          setSelectedMarker(marker)
          setAtlasCountry(marker.country)
          setAtlasCity(marker.city)
          
          // Open the organization details in the atlas
          setTimeout(() => {
            // Find and select the specific organization
            const org = companies.find(c => c.id === result.data.id)
            if (org) {
              setSelectedOrganization(org)
            }
          }, 1300)
        }
      }
    } else if (result.type === 'product') {
      // Switch to Products layer and focus on product country
      setActiveLayer('products')
      const country = getFullCountryName(result.madeIn)
      const countryCoords = getCountryCoordinates(country)
      if (globeEl.current) {
        globeEl.current.pointOfView({
          lat: countryCoords.lat,
          lng: countryCoords.lng,
          altitude: 1.8
        }, 1200)
      }
      setSelectedCountryName(country)
    }

    // Close search and reset tracking
    setSearchExpanded(false)
    setSearchQuery('')
    setSearchResults([])
    setCurrentSearchId(null)
    setSearchStartTime(null)
  }

  // Globe controls
  const handleZoomIn = () => {
    if (globeEl.current) {
      const currentAltitude = globeEl.current.pointOfView().altitude
      globeEl.current.pointOfView({ altitude: Math.max(currentAltitude - 0.5, 1.5) }, 1000)
    }
  }

  const handleZoomOut = () => {
    if (globeEl.current) {
      const currentAltitude = globeEl.current.pointOfView().altitude
      globeEl.current.pointOfView({ altitude: Math.min(currentAltitude + 0.5, 4) }, 1000)
    }
  }

  const handleResetView = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)
    }
  }

  const handleMarkerClick = (marker: GlobeMarker) => {
    setSelectedMarker(marker)
    // Initialize the City Atlas modal with the marker's country and city
    setAtlasCountry(marker.country)
    setAtlasCity(marker.city)
  }

  const openStreetView = async (marker: GlobeMarker) => {
    // Close the marker modal first
    setSelectedMarker(null)
    
    // Zoom into the location on the globe
    if (globeEl.current) {
      // Smooth zoom animation to the marker location
      globeEl.current.pointOfView(
        { 
          lat: marker.lat, 
          lng: marker.lng, 
          altitude: 0.1 // Very close zoom
        }, 
        2000 // 2 second animation
      )
    }

    // Wait for zoom animation to complete
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Store the street map data
    setStreetMapData({
      city: marker.city,
      country: marker.country,
      lat: marker.lat,
      lng: marker.lng,
      places: marker.companies // Contains places data
    })

    // Show loading screen
    setShowMapLoading(true)

    // Simulate map loading (2.5 seconds for loading screen)
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Hide loading screen and show street map
    setShowMapLoading(false)
    setShowStreetMap(true)
  }

  // Country interaction handlers
  const handleCountryHover = (polygon: any) => {
    if (polygon && polygon.properties) {
      const countryName = polygon.properties.ADMIN || polygon.properties.NAME
      console.log('Hovering over country:', countryName, 'Has companies:', !!locationData[countryName])
      // Only allow hover for countries with companies
      if (locationData[countryName]) {
        setHoveredCountry(countryName)
        document.body.style.cursor = 'pointer'
      }
    } else {
      setHoveredCountry(null)
      document.body.style.cursor = 'grab'
    }
  }

  const handleCountryClick = (polygon: any) => {
    if (polygon && polygon.properties) {
      const countryName = polygon.properties.ADMIN || polygon.properties.NAME
      console.log('Clicked country:', countryName, 'Has companies:', !!locationData[countryName])
      console.log('All countries with companies:', Object.keys(locationData))
      // Only allow click for countries with companies
      if (locationData[countryName]) {
        // If clicking the same country, deselect it and reset view
        if (selectedCountryName === countryName) {
          setSelectedCountryName(null)
          setShowAtlasCard(false)
          // Reset to default view
          if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)
          }
          return
        }
        
        console.log('Setting selected country:', countryName)
        console.log('Markers in country:', markers.filter(m => m.country === countryName))
        // Start the animation sequence
        setSelectedCountryName(countryName)
        setIsCountryAnimating(true)
        setShowAtlasCard(false) // Hide card initially
        
        // Auto-center and zoom to country - perfectly centered!
        if (globeEl.current) {
          const countryCoords = getCountryCapitalCoordinates(countryName)
          console.log('Centering on:', countryName, countryCoords)
          
          // Use pointOfView with all parameters for perfect centering
          globeEl.current.pointOfView({ 
            lat: countryCoords.lat, 
            lng: countryCoords.lng, 
            altitude: 1.5 // Optimal zoom for country view
          }, 1500) // Smooth 1.5s transition for better visual effect
        }
        
        // After 800ms, show the Atlas card
        setTimeout(() => {
          setShowAtlasCard(true)
        }, 800)
        
        // After 1000ms, mark animation as complete
        setTimeout(() => {
          setIsCountryAnimating(false)
        }, 1000)
      } else {
        console.log('Country has no companies, ignoring click')
      }
    }
  }

  // Get country stats
  const getCountryStats = (countryName: string) => {
    if (!locationData[countryName]) return null
    
    const countryData = locationData[countryName]
    const totalCompanies = Object.values(countryData.cities).reduce((sum, companies) => sum + companies.length, 0)
    const totalCities = Object.keys(countryData.cities).length
    
    // Get all companies from all cities in this country
    const allCompanies = Object.values(countryData.cities).flat()
    
    return {
      name: countryName,
      companies: totalCompanies,
      cities: totalCities,
      cityList: Object.entries(countryData.cities).map(([city, companies]) => ({
        city,
        count: companies.length
      })),
      companyList: allCompanies
    }
  }

  // Get country coordinates (center point)
  const getCountryCoordinates = (countryName: string): { lat: number; lng: number } => {
    // First, try to find the country in our polygon data
    const countryPolygon = countryPolygons.find((feature: any) => {
      const name = feature.properties?.ADMIN || feature.properties?.NAME
      return name === countryName
    })

    if (countryPolygon && countryPolygon.properties) {
      // Use label coordinates if available
      if (countryPolygon.properties.LABEL_X && countryPolygon.properties.LABEL_Y) {
        return {
          lat: countryPolygon.properties.LABEL_Y,
          lng: countryPolygon.properties.LABEL_X
        }
      }
      
      // Calculate centroid from geometry
      const geometry = countryPolygon.geometry
      if (geometry && geometry.coordinates) {
        const coordinates = geometry.type === 'Polygon' 
          ? geometry.coordinates[0] 
          : geometry.coordinates[0][0]
        
        if (coordinates && coordinates.length > 0) {
          const sum = coordinates.reduce((acc: any, coord: any) => {
            return { lng: acc.lng + coord[0], lat: acc.lat + coord[1] }
          }, { lng: 0, lat: 0 })
          
          return {
            lat: sum.lat / coordinates.length,
            lng: sum.lng / coordinates.length
          }
        }
      }
    }

    // Fallback: common country coordinates lookup
    const countryLookup: { [key: string]: { lat: number; lng: number } } = {
      'United States': { lat: 37.0902, lng: -95.7129 },
      'United States of America': { lat: 37.0902, lng: -95.7129 },
      'Canada': { lat: 56.1304, lng: -106.3468 },
      'Mexico': { lat: 23.6345, lng: -102.5528 },
      'Brazil': { lat: -14.2350, lng: -51.9253 },
      'Argentina': { lat: -38.4161, lng: -63.6167 },
      'United Kingdom': { lat: 55.3781, lng: -3.4360 },
      'France': { lat: 46.2276, lng: 2.2137 },
      'Germany': { lat: 51.1657, lng: 10.4515 },
      'Spain': { lat: 40.4637, lng: -3.7492 },
      'Italy': { lat: 41.8719, lng: 12.5674 },
      'Netherlands': { lat: 52.1326, lng: 5.2913 },
      'Switzerland': { lat: 46.8182, lng: 8.2275 },
      'China': { lat: 35.8617, lng: 104.1954 },
      'Japan': { lat: 36.2048, lng: 138.2529 },
      'India': { lat: 20.5937, lng: 78.9629 },
      'Australia': { lat: -25.2744, lng: 133.7751 },
      'South Africa': { lat: -30.5595, lng: 22.9375 },
      'Russia': { lat: 61.5240, lng: 105.3188 },
    }

    return countryLookup[countryName] || { lat: 0, lng: 0 }
  }

  // Load country polygons for real geography with custom colors
  const loadCountryPolygons = () => {
    // Using the built-in countries geojson data from react-globe.gl
    // This will be fetched automatically by the library
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        console.log('Loaded country polygons:', countries.features.length)
        console.log('Sample country names:', countries.features.slice(0, 10).map((f: any) => f.properties.ADMIN || f.properties.NAME))
        setCountryPolygons(countries.features)
      })
      .catch(err => {
        console.error('Error loading country data:', err)
        setCountryPolygons([])
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950">
        <div className="text-center">
          <GlobeIcon className="w-16 h-16 mx-auto mb-4 text-hemp-primary animate-spin" />
          <p className="text-lg font-black uppercase tracking-widest text-white">Loading Hemp Atlas</p>
        </div>
      </div>
    )
  }

  // Get theme colors based on active layer
  const getThemeColors = () => {
    switch (activeLayer) {
      case 'off':
        return {
          bgGradient: 'from-slate-900 via-gray-900 to-slate-950',
          oceanColor: '#1e293b', // Dark slate
          atmosphereColor: '#64748b', // Slate glow
          sideColor: '#475569' // Medium slate for sides
        }
      case 'places':
        return {
          bgGradient: 'from-pink-950 via-rose-900 to-fuchsia-950',
          oceanColor: '#831843', // Deep rose-pink
          atmosphereColor: '#f9a8d4', // Pastel pink glow
          sideColor: '#fda4af' // Bright pastel pink for sides - super kawaii gradient! 🌸
        }
      case 'organizations':
        return {
          bgGradient: 'from-emerald-950 via-teal-900 to-green-950',
          oceanColor: '#0f4c75', // Deep teal-blue
          atmosphereColor: '#10b981', // Emerald glow
          sideColor: '#14b8a6' // Bright teal for sides - creates beautiful gradient effect
        }
      case 'products':
        return {
          bgGradient: 'from-amber-950 via-orange-900 to-yellow-950',
          oceanColor: '#78350f', // Deep amber-brown
          atmosphereColor: '#f59e0b', // Amber glow
          sideColor: '#fb923c' // Bright orange for sides - warm gradient
        }
      case 'events':
        return {
          bgGradient: 'from-purple-950 via-violet-900 to-indigo-950',
          oceanColor: '#4c1d95', // Deep purple
          atmosphereColor: '#a855f7', // Purple glow
          sideColor: '#c084fc' // Bright purple for sides - vibrant gradient
        }
      case 'all':
        return {
          bgGradient: 'from-purple-950 via-teal-900 to-amber-950',
          oceanColor: '#1e3a8a', // Deep cosmic blue
          atmosphereColor: '#06b6d4', // Cyan glow
          sideColor: '#22d3ee' // Bright cyan for sides - multi-layer effect
        }
      default:
        return {
          bgGradient: 'from-emerald-950 via-teal-900 to-green-950',
          oceanColor: '#0f4c75',
          atmosphereColor: '#10b981',
          sideColor: '#14b8a6'
        }
    }
  }

  const theme = getThemeColors()

  // Create a solid color texture for the globe ocean (prevents see-through transparency!)
  const createSolidColorTexture = (color: string): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 2, 2)
    }
    return canvas.toDataURL()
  }

  const globeTexture = createSolidColorTexture(theme.oceanColor)

  // Helper to adjust color brightness based on glow intensity
  const adjustColorBrightness = (hexColor: string, intensity: number): string => {
    // Parse hex color
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Safety check: ensure intensity is valid
    const safeIntensity = isNaN(intensity) || intensity < 0 ? 1 : intensity
    
    // Apply intensity multiplier with proper clamping
    const newR = Math.min(255, Math.max(0, Math.round(r * safeIntensity)))
    const newG = Math.min(255, Math.max(0, Math.round(g * safeIntensity)))
    const newB = Math.min(255, Math.max(0, Math.round(b * safeIntensity)))
    
    // Convert back to hex with proper padding
    const hexR = newR.toString(16).padStart(2, '0')
    const hexG = newG.toString(16).padStart(2, '0')
    const hexB = newB.toString(16).padStart(2, '0')
    
    return `#${hexR}${hexG}${hexB}`
  }

  // Main 3D globe view
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} relative overflow-hidden transition-all duration-700`}>
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Layer Selector - Centered at top */}
      <GlobeLayerSelector
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
      />

      {/* Search Bar - Below Layer Selector */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <div className={`relative transition-all duration-500 ease-out ${searchExpanded ? 'w-[90vw] max-w-2xl' : 'w-14'}`}>
          {/* Search Icon Button (Collapsed State) */}
          {!searchExpanded && (
            <button
              onClick={() => setSearchExpanded(true)}
              className="relative group w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl border border-hemp-primary/40 hover:border-hemp-primary flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {/* Aura glow */}
              <div className="absolute -inset-2 bg-hemp-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-br from-hemp-primary/40 to-transparent rounded-full blur-lg opacity-60" />
              
              {/* Icon */}
              <Search className="w-6 h-6 text-hemp-primary relative z-10" />
            </button>
          )}

          {/* Expanded Search Box */}
          {searchExpanded && (
            <div className="relative">
              {/* Search Input Container */}
              <div className="relative bg-black/80 backdrop-blur-xl border border-hemp-primary/40 rounded-2xl shadow-2xl shadow-hemp-primary/20 overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-hemp-primary/20 to-transparent rounded-2xl blur-xl opacity-60 pointer-events-none" />
                
                {/* Input Row */}
                <div className="relative flex items-center gap-3 p-4">
                  <Search className="w-5 h-5 text-hemp-primary flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search countries, cities, places, products..."
                    className="flex-1 bg-transparent text-white placeholder-white/40 outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      setSearchExpanded(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border-t border-hemp-primary/20 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-3 hover:bg-hemp-primary/10 border-b border-white/5 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon based on type */}
                          {result.type === 'country' && <GlobeIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                          {result.type === 'city' && <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                          {result.type === 'place' && <Map className="w-4 h-4 text-pink-400 flex-shrink-0" />}
                          {result.type === 'organization' && <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          {result.type === 'product' && <Package className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                          
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="text-white group-hover:text-hemp-primary transition-colors truncate">
                              {result.name}
                            </div>
                            <div className="text-xs text-white/40 truncate">
                              {result.type === 'city' && `${result.country}`}
                              {result.type === 'place' && `${result.city}, ${result.country}`}
                              {result.type === 'organization' && result.location}
                              {result.type === 'product' && `Made in ${result.madeIn}`}
                            </div>
                          </div>

                          {/* Type badge */}
                          <Badge 
                            className="text-xs uppercase tracking-wider border-0"
                            style={{ 
                              background: result.type === 'country' ? '#0891b2' : 
                                         result.type === 'city' ? '#fbbf24' :
                                         result.type === 'place' ? '#ec4899' :
                                         result.type === 'organization' ? '#10b981' : '#f59e0b',
                              color: 'white'
                            }}
                          >
                            {result.type}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {searchQuery && searchResults.length === 0 && (
                  <div className="px-4 py-8 text-center text-white/40 border-t border-hemp-primary/20">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Globe Controls - Bottom Right (Above navbar) */}
      <div className="absolute bottom-20 md:bottom-24 right-3 md:right-4 z-30 pointer-events-auto">
        <div className="relative bg-black/40 backdrop-blur-xl border border-hemp-primary/30 rounded-2xl shadow-2xl shadow-hemp-primary/20 p-1.5 flex flex-col gap-1.5">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-hemp-primary/20 to-transparent rounded-2xl blur-xl opacity-50 pointer-events-none"></div>
          
          {/* Zoom Controls */}
          <div className="relative flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="group relative p-2.5 md:p-3 rounded-xl bg-black/30 hover:bg-hemp-primary/20 border border-transparent hover:border-hemp-primary/60 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-hemp-primary transition-colors" />
            </button>
            <button
              onClick={handleZoomOut}
              className="group relative p-2.5 md:p-3 rounded-xl bg-black/30 hover:bg-hemp-primary/20 border border-transparent hover:border-hemp-primary/60 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-hemp-primary transition-colors" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-hemp-primary/40 to-transparent"></div>

          {/* Camera Controls */}
          <div className="relative flex flex-col gap-1">
            <button
              onClick={handleResetView}
              className="group relative p-2.5 md:p-3 rounded-xl bg-black/30 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/60 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button
              onClick={onClose}
              className="group relative p-2.5 md:p-3 rounded-xl bg-black/30 hover:bg-red-500/20 border border-transparent hover:border-red-500/60 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Close Globe"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Country Focus Mode Badge */}
      {selectedCountryName && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 backdrop-blur-md border border-yellow-400/40 rounded-full shadow-2xl">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="font-mono text-yellow-400 font-bold tracking-wider">
              🎯 FOCUS: {selectedCountryName.toUpperCase()}
            </span>
            <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-xs">
              {locationData[selectedCountryName]?.length || 0} pins
            </Badge>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8">
        <div className="flex items-center justify-between">
          <Button onClick={onClose} variant="ghost" className="gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>


        </div>
      </div>

      {/* 3D Globe - Centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <GlobeComponent
            ref={globeEl}
            
            // Custom Hemp'in Solarpunk styled globe with SOLID ocean texture
            globeImageUrl={globeTexture}
            showGlobe={true}
            
            // Ocean material with dynamic theme color
            globeMaterial={{
              color: theme.oceanColor, // Use theme color (changes with layer!)
              shininess: globeConfig.oceanShininess,
              opacity: 1.0,
              transparent: false,
              depthWrite: true,
              side: 2 // DoubleSide
            }}
            bumpImageUrl={null}
            
            // Land polygons with dynamic colors based on active layer
            // 3-TIER COLOR SYSTEM:
            // Tier 1 (Top/Cap): Dark base color for country surface
            // Tier 2 (Sides): Vibrant glow color for elevated edges (theme.sideColor)
            // Tier 3 (Borders): Bright outline color for country borders
            polygonsData={countryPolygons}
            polygonCapColor={(d: any) => {
              const countryName = d.properties?.ADMIN || d.properties?.NAME
              const hasData = locationData[countryName]
              
              // Highlight selected country with gold
              if (countryName === selectedCountryName) return '#facc15' // Bright yellow/gold for selected
              // Subtle hover effect (lighter color, no elevation)
              if (countryName === hoveredCountry && hasData) {
                if (activeLayer === 'places') return '#f9a8d4' // Lighter pink
                if (activeLayer === 'organizations') return '#10b981' // Lighter green
                if (activeLayer === 'products') return '#f59e0b' // Lighter orange
                if (activeLayer === 'events') return '#a855f7' // Lighter purple
                if (activeLayer === 'all') return '#06b6d4' // Cyan
                return '#10b981'
              }
              
              // OFF layer - grey countries
              if (activeLayer === 'off') {
                return '#6b7280' // Grey
              }
              
              // PLACES layer - pink pastel theme 🌸
              if (activeLayer === 'places') {
                if (hasData) return '#831843' // Dark rose-pink to match ocean
                return '#500724' // Very dark rose for countries without data
              }
              
              // ORGANIZATIONS layer - green theme
              if (activeLayer === 'organizations') {
                if (hasData) return '#059669' // Dark emerald
                return '#064e3b' // Dark green for countries without data
              }
              
              // PRODUCTS layer - orange theme (orange only on borders, countries stay dark)
              if (activeLayer === 'products') {
                if (hasData) return '#78350f' // Dark amber/brown to match ocean
                return '#451a03' // Very dark amber for countries without data
              }
              
              // EVENTS layer - purple theme (purple only on borders, countries stay dark)
              if (activeLayer === 'events') {
                if (hasData) return '#4c1d95' // Dark purple to match ocean
                return '#2e1065' // Very dark purple for countries without data
              }
              
              // ALL LAYERS - gradient colors based on content types
              if (activeLayer === 'all') {
                if (hasData) {
                  return getMultiContentColor(countryName)
                }
                return '#1e293b' // Dark slate for countries without data
              }
              
              return '#064e3b' // Default dark
            }}
            polygonSideColor={(d: any) => {
              const countryName = d.properties?.ADMIN || d.properties?.NAME
              const hasData = locationData[countryName]
              
              // Selected/hovered countries get bright side glow
              if (countryName === selectedCountryName) return '#fbbf24' // Amber glow for selected
              if (countryName === hoveredCountry) return '#06b6d4' // Cyan glow for hovered
              
              // Countries with data get the vibrant side color from theme
              if (hasData) return theme.sideColor || '#14b8a6'
              
              // Countries without data get darker sides
              if (activeLayer === 'off') return '#374151'
              if (activeLayer === 'places') return '#500724'
              if (activeLayer === 'organizations') return '#064e3b'
              if (activeLayer === 'products') return '#451a03'
              if (activeLayer === 'events') return '#2e1065'
              if (activeLayer === 'all') return '#1e3a8a'
              
              return '#064e3b' // Default dark
            }}
            polygonStrokeColor={(d: any) => {
              const countryName = d.properties?.ADMIN || d.properties?.NAME
              const hasData = locationData[countryName]
              
              if (countryName === selectedCountryName) return '#fde047' // Bright yellow glow
              if (countryName === hoveredCountry) return '#22d3ee'
              
              // OFF layer - black borders
              if (activeLayer === 'off') {
                return '#000000' // Black
              }
              
              // PLACES layer - pink pastel borders 🌸
              if (activeLayer === 'places') {
                return '#f9a8d4' // Pastel pink
              }
              
              // ORGANIZATIONS layer - green borders
              if (activeLayer === 'organizations') {
                return '#10b981' // Emerald
              }
              
              // PRODUCTS layer - orange borders
              if (activeLayer === 'products') {
                return '#f59e0b' // Amber/Orange
              }
              
              // EVENTS layer - purple borders
              if (activeLayer === 'events') {
                return '#a855f7' // Purple
              }
              
              // ALL LAYERS - multi-color borders based on content
              if (activeLayer === 'all') {
                if (hasData) {
                  const { hasOrgs, hasProducts, hasEvents } = getCountryContentTypes(countryName)
                  const colors: string[] = []
                  if (hasOrgs) colors.push('#10b981')
                  if (hasProducts) colors.push('#f59e0b')
                  if (hasEvents) colors.push('#a855f7')
                  
                  // Return brightest color for border
                  if (colors.length > 0) return colors[0]
                }
                return '#06b6d4' // Cyan for countries without data
              }
              
              return '#10b981' // Default emerald
            }}
            polygonAltitude={(d: any) => {
              const countryName = d.properties?.ADMIN || d.properties?.NAME
              const hasData = locationData[countryName]
              // Pop out ONLY selected country (medium elevation)
              if (countryName === selectedCountryName) return 0.04 // Medium-small elevation
              // NO hover elevation - removed to keep pins visible
              // Use config elevation for countries with data
              if (hasData) return globeConfig.countryElevation
              return 0
            }}
            onPolygonHover={handleCountryHover}
            onPolygonClick={handleCountryClick}
            
            // Hemp'in atmosphere - dynamic based on config and layer
            showAtmosphere={globeConfig.showAtmosphere}
            atmosphereColor={theme.atmosphereColor}
            atmosphereAltitude={globeConfig.atmosphereIntensity}
            
            // Points (markers) - Color based on layer type!
            pointsData={markers}
            pointLat="lat"
            pointLng="lng"
            pointColor={(d: any) => {
              // Use marker's color when in selected country (super bright)
              if (d.country === selectedCountryName) {
                return '#fbbf24' // Super golden for selected country
              }
              // Otherwise use the marker's assigned color from layer
              return d.color || '#fbbf24'
            }}
            pointAltitude={(d: any) => {
              // Elevate markers in selected country higher than the country itself
              if (d.country === selectedCountryName) {
                return 0.08 // Higher than country elevation (0.04)
              }
              return globeConfig.markerAltitude
            }}
            pointRadius={(d: any) => {
              // Slightly larger markers in selected country
              const baseSize = (d.size + 0.3) * globeConfig.markerSize
              if (d.country === selectedCountryName) {
                return baseSize * 1.3 // 30% larger
              }
              return baseSize
            }}
            pointResolution={globeConfig.markerSmoothness}
            // No hover label - removed ugly tooltip
            onPointClick={(point: any) => {
              handleMarkerClick(point as GlobeMarker)
              // Center the city on click like we do for countries
              if (globeEl.current) {
                globeEl.current.pointOfView(
                  { 
                    lat: point.lat, 
                    lng: point.lng, 
                    altitude: 1.2 // Zoom level for city view
                  }, 
                  1200 // 1.2s smooth transition
                )
              }
            }}
            onPointHover={(point: any) => {
              document.body.style.cursor = point ? 'pointer' : 'grab'
            }}
            
            // Rings around markers - Always golden aura
            ringsData={markers}
            ringLat="lat"
            ringLng="lng"
            ringColor={() => '#fbbf24'} // Always golden
            ringMaxRadius={(d: any) => {
              // Larger rings in selected country
              if (d.country === selectedCountryName) return 6
              return 4
            }}
            ringPropagationSpeed={2.5}
            ringRepeatPeriod={1800}
            ringAltitude={(d: any) => {
              // Elevate rings higher in selected country (above country surface)
              if (d.country === selectedCountryName) {
                return 0.09 // Above markers (0.08) and country (0.04)
              }
              return 0.02
            }}
            
            // Globe settings
            width={typeof window !== 'undefined' ? window.innerWidth : 1200}
            height={typeof window !== 'undefined' ? window.innerHeight : 800}
            
            // Background - Dynamic based on layer theme
            backgroundColor={`rgba(0,0,0,${globeConfig.backgroundOpacity})`}
            
            // Polygon rendering quality
            polygonCapCurvatureResolution={globeConfig.polygonCurvature}
            
            // Enable controls
            enablePointerInteraction={true}
            
            // Initial view
            {...(globeEl.current ? {} : {
              pointOfView: { lat: 20, lng: 0, altitude: 2.5 }
            })}
          />
        </Suspense>
      </div>

      {/* Country Atlas Summary Card */}
      {selectedCountryName && showAtlasCard && (() => {
        const stats = getCountryStats(selectedCountryName)
        if (!stats) return null
        
        return (
          <div className="absolute bottom-4 md:bottom-auto left-4 right-4 md:right-auto md:left-8 md:top-1/2 md:-translate-y-1/2 z-30 pointer-events-auto animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
            <div className="bg-gradient-to-br from-emerald-950/70 via-teal-900/70 to-green-950/70 backdrop-blur-2xl border-2 border-hemp-primary rounded-3xl shadow-2xl shadow-hemp-primary/50 max-w-sm md:max-w-md w-full md:w-auto">
              {/* Header with Solarpunk Gradient */}
              <div className="bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary p-6 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <GlobeIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                        Country Atlas
                      </span>
                    </div>
                    <h3 className="font-black text-3xl text-white drop-shadow-lg mb-1">
                      {stats.name}
                    </h3>
                    <p className="text-sm text-white/80 font-semibold">Hemp Industry Overview</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedCountryName(null)
                      setShowAtlasCard(false)
                    }}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-white hover:bg-white/20 -mt-1 -mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative overflow-hidden bg-gradient-to-br from-hemp-primary/30 to-hemp-secondary/30 rounded-2xl p-6 border border-hemp-primary/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-hemp-primary/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-hemp-primary" />
                        <span className="text-xs uppercase tracking-wider text-hemp-primary/90 font-black">Companies</span>
                      </div>
                      <div className="font-black text-4xl text-white drop-shadow-lg">
                        {stats.companies}
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 border border-amber-500/50 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-amber-400" />
                        <span className="text-xs uppercase tracking-wider text-amber-400/90 font-black">Cities</span>
                      </div>
                      <div className="font-black text-4xl text-white drop-shadow-lg">
                        {stats.cities}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cities List */}
                <div className="mb-6">
                  <h4 className="font-black text-sm uppercase tracking-wider text-hemp-primary mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                    <span>City Breakdown</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
                  </h4>
                  <div className="space-y-2">
                    {stats.cityList.sort((a, b) => b.count - a.count).slice(0, 3).map((cityData, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gradient-to-r from-emerald-900/50 to-teal-900/50 hover:from-emerald-800/60 hover:to-teal-800/60 border border-hemp-primary/30 hover:border-hemp-primary/60 rounded-xl px-4 py-3 transition-all cursor-pointer group backdrop-blur-sm"
                        onClick={() => {
                          const marker = markers.find(m => m.city === cityData.city && m.country === stats.name)
                          if (marker) {
                            setSelectedCountryName(null)
                            handleMarkerClick(marker)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white text-xs font-black">{idx + 1}</span>
                          </div>
                          <span className="font-bold text-white group-hover:text-hemp-primary transition-colors">
                            {cityData.city}
                          </span>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-hemp-primary/20 border border-hemp-primary/40 text-hemp-primary font-black text-sm">
                          {cityData.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organizations List */}
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                    <span>Organizations</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent"></div>
                  </h4>
                  <div className="space-y-2">
                    {stats.companyList.slice(0, 3).map((company, idx) => (
                      <div
                        key={company.id || idx}
                        className="flex items-center justify-between bg-gradient-to-r from-amber-900/30 to-yellow-900/30 hover:from-amber-800/50 hover:to-yellow-800/50 border border-amber-500/30 hover:border-amber-500/60 rounded-xl px-4 py-3 transition-all cursor-pointer group backdrop-blur-sm"
                        onClick={() => {
                          setSelectedCompany(company)
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                              {company.name}
                            </span>
                            {company.location && (
                              <span className="text-xs text-amber-300/60 font-semibold block truncate">
                                {company.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {company.category && (
                          <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs shrink-0 ml-2">
                            {typeof company.category === 'object' ? company.category.name : company.category}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Organization Button */}
                <div className="mt-6 pt-4 border-t border-hemp-primary/30">
                  <Button
                    onClick={() => {
                      if (onAddOrganization) {
                        onAddOrganization()
                      } else {
                        console.log('Add Organization clicked')
                      }
                    }}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-hemp-primary/20 to-hemp-secondary/20 hover:from-hemp-primary/30 hover:to-hemp-secondary/30 backdrop-blur-xl border-2 border-hemp-primary/50 hover:border-hemp-primary text-white rounded-xl px-6 py-4 transition-all duration-300 group shadow-lg shadow-hemp-primary/20 hover:shadow-hemp-primary/40 mb-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-hemp-primary/0 via-hemp-primary/10 to-hemp-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-3 justify-center">
                      <div className="p-2 rounded-lg bg-hemp-primary/30 group-hover:bg-hemp-primary/50 transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-black text-sm uppercase tracking-wider">Add Organization</span>
                    </div>
                  </Button>
                  
                  <p className="text-xs text-center text-emerald-300/80 font-semibold">
                    Click to explore cities and organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}



      {/* Company Detail Modal - Slides in from Right (Styled like Country Atlas) */}
      {selectedCompany && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setSelectedCompany(null)}
          />
          
          {/* Modal Panel - Styled like Country Atlas but on right */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-auto animate-in slide-in-from-right duration-500">
            <div className="bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-green-950/95 backdrop-blur-xl border-2 border-hemp-primary rounded-3xl shadow-2xl shadow-hemp-primary/50 max-w-sm md:max-w-md w-[calc(100vw-2rem)] md:w-96">
              {/* Header with Solarpunk Gradient */}
              <div className="bg-gradient-to-r from-hemp-primary via-hemp-secondary to-hemp-primary p-6 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {selectedCompany.logo_url ? (
                        <img
                          src={selectedCompany.logo_url}
                          alt={selectedCompany.name}
                          className="w-10 h-10 rounded-lg object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                        Organization
                      </span>
                    </div>
                    <h3 className="font-black text-3xl text-white drop-shadow-lg mb-1">
                      {selectedCompany.name}
                    </h3>
                    {selectedCompany.location && (
                      <div className="flex items-center gap-2 text-white/80">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-semibold">{selectedCompany.location}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setSelectedCompany(null)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-white hover:bg-white/20 -mt-1 -mr-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                {/* Category & Size Badges */}
                <div className="flex items-center gap-3 flex-wrap mb-6">
                  {selectedCompany.category && (
                    <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-sm">
                      {typeof selectedCompany.category === 'object' ? selectedCompany.category.name : selectedCompany.category}
                    </div>
                  )}
                  {selectedCompany.company_size && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-hemp-primary/20 border border-hemp-primary/40 text-hemp-primary font-black text-sm">
                      <Users className="w-4 h-4" />
                      {selectedCompany.company_size}
                    </div>
                  )}
                  {selectedCompany.is_association && (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-black text-sm">
                      Association
                    </div>
                  )}
                </div>

                {/* About Section */}
                {selectedCompany.description && (
                  <div className="mb-6">
                    <h4 className="font-black text-sm uppercase tracking-wider text-hemp-primary mb-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                      <span>About</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
                    </h4>
                    <p className="text-white/80 leading-relaxed text-sm">
                      {selectedCompany.description}
                    </p>
                  </div>
                )}

                {/* Badges Section */}
                {selectedCompany.badges && selectedCompany.badges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-black text-sm uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                      <span>Badges</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-amber-500/50 to-transparent"></div>
                    </h4>
                    <div className="space-y-2">
                      {selectedCompany.badges.map((badge: any) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl px-4 py-3 backdrop-blur-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm">{badge.badge_type}</div>
                            {badge.issued_date && (
                              <div className="text-xs text-amber-300/60">
                                {new Date(badge.issued_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connect Section */}
                {selectedCompany.website && (
                  <div className="mb-6">
                    <h4 className="font-black text-sm uppercase tracking-wider text-hemp-primary mb-4 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                      <span>Connect</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
                    </h4>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-gradient-to-r from-emerald-900/50 to-teal-900/50 hover:from-emerald-800/60 hover:to-teal-800/60 border border-hemp-primary/30 hover:border-hemp-primary/60 rounded-xl px-4 py-3 transition-all group"
                    >
                      <span className="font-bold text-white group-hover:text-hemp-primary transition-colors">
                        Visit Website
                      </span>
                      <ExternalLink className="w-4 h-4 text-hemp-primary" />
                    </a>
                  </div>
                )}

                {/* View Full Profile Button */}
                <div className="pt-4 border-t border-hemp-primary/30">
                  <Button
                    onClick={() => {
                      onViewCompany(selectedCompany.id)
                    }}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-hemp-primary/20 to-hemp-secondary/20 hover:from-hemp-primary/30 hover:to-hemp-secondary/30 backdrop-blur-xl border-2 border-hemp-primary/50 hover:border-hemp-primary text-white rounded-xl px-6 py-4 transition-all duration-300 group shadow-lg shadow-hemp-primary/20 hover:shadow-hemp-primary/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-hemp-primary/0 via-hemp-primary/10 to-hemp-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-2 justify-center">
                      <span className="font-black text-sm uppercase tracking-wider">View Full Profile</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </Button>
                </div>

                {/* Footer Note */}
                <div className="mt-4">
                  <p className="text-xs text-center text-emerald-300/80 font-semibold">
                    Complete details and member access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* City Atlas Modal - Centered like Country Atlas with Pink Theme */}
      {selectedMarker && (() => {
        // Get list of all countries
        const countries = Object.keys(locationData).sort()
        
        // Get cities for the selected atlas country
        const citiesForCountry = atlasCountry && locationData[atlasCountry] 
          ? Object.keys(locationData[atlasCountry].cities).sort()
          : []
        
        // Get data for the selected city
        const cityData = atlasCountry && atlasCity && locationData[atlasCountry]?.cities[atlasCity]
          ? locationData[atlasCountry].cities[atlasCity]
          : []
        
        // Calculate stats
        const placesCount = cityData.length
        const productsCount = 0 // Placeholder
        const eventsCount = 0 // Placeholder
        
        return (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
              onClick={() => setSelectedMarker(null)}
            />
            
            {/* Modal Panel - Centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto animate-in zoom-in duration-500">
              <div className="bg-gradient-to-br from-pink-950/95 via-rose-900/95 to-fuchsia-950/95 backdrop-blur-2xl border-2 border-pink-500 rounded-3xl shadow-2xl shadow-pink-500/50 max-w-sm md:max-w-md w-[calc(100vw-2rem)] md:w-96">
                {/* Header with Pink Gradient - Interactive Selectors */}
                <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 p-6 rounded-t-3xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-white" />
                      <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                        City Atlas
                      </span>
                    </div>
                    <Button
                      onClick={() => setSelectedMarker(null)}
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-white hover:bg-white/20 -mt-1 -mr-1"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* City Selector - Large Title */}
                  <div className="mb-2">
                    <Select 
                      value={atlasCity} 
                      onValueChange={setAtlasCity}
                      disabled={!atlasCountry}
                    >
                      <SelectTrigger className="w-full bg-transparent border-none text-white hover:bg-white/10 transition-colors h-auto p-0 focus:ring-0 disabled:opacity-70">
                        <SelectValue>
                          <h3 className="font-black text-4xl text-white drop-shadow-lg text-left">
                            {atlasCity || 'Select City'}
                          </h3>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-pink-950 border-pink-500/50">
                        {citiesForCountry.map((city) => (
                          <SelectItem 
                            key={city} 
                            value={city}
                            className="text-white hover:bg-pink-900/50 focus:bg-pink-900/50"
                          >
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country Selector - Subtitle */}
                  <div>
                    <Select value={atlasCountry} onValueChange={(value) => {
                      setAtlasCountry(value)
                      setAtlasCity('') // Reset city when country changes
                    }}>
                      <SelectTrigger className="w-full bg-transparent border-none text-white/90 hover:bg-white/10 transition-colors h-auto p-0 focus:ring-0">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <GlobeIcon className="w-4 h-4" />
                            <span className="font-semibold">{atlasCountry || 'Select Country'}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-pink-950 border-pink-500/50">
                        {countries.map((country) => (
                          <SelectItem 
                            key={country} 
                            value={country}
                            className="text-white hover:bg-pink-900/50 focus:bg-pink-900/50"
                          >
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Body - Stats & Button Only */}
                <div className="p-6 space-y-5">
                  {/* Stats Pills - Compact horizontal layout */}
                  {atlasCity && atlasCountry && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      {/* Places Pill */}
                      <div 
                        className="group relative flex items-center gap-2 bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/50 rounded-full px-4 py-3 hover:from-pink-500/40 hover:to-rose-500/40 transition-all cursor-default"
                        title="Places"
                      >
                        <Building2 className="w-5 h-5 text-pink-300" />
                        <span className="font-black text-xl text-white">{placesCount}</span>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wider text-pink-300/90 font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Places
                        </span>
                      </div>

                      {/* Products Pill */}
                      <div 
                        className="group relative flex items-center gap-2 bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/50 rounded-full px-4 py-3 hover:from-pink-500/40 hover:to-rose-500/40 transition-all cursor-default"
                        title="Products"
                      >
                        <Package className="w-5 h-5 text-pink-300" />
                        <span className="font-black text-xl text-white">{productsCount}</span>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wider text-pink-300/90 font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Products
                        </span>
                      </div>

                      {/* Events Pill */}
                      <div 
                        className="group relative flex items-center gap-2 bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/50 rounded-full px-4 py-3 hover:from-pink-500/40 hover:to-rose-500/40 transition-all cursor-default"
                        title="Events"
                      >
                        <Calendar className="w-5 h-5 text-pink-300" />
                        <span className="font-black text-xl text-white">{eventsCount}</span>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wider text-pink-300/90 font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Events
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Open City Portal Button */}
                  <Button
                    onClick={() => {
                      // Find the marker for the selected city
                      const marker = markers.find(m => m.country === atlasCountry && m.city === atlasCity)
                      if (marker) {
                        openStreetView(marker)
                      }
                    }}
                    disabled={!atlasCity || !atlasCountry || placesCount === 0}
                    className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 disabled:from-pink-900/30 disabled:via-rose-900/30 disabled:to-fuchsia-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black gap-2 shadow-lg shadow-pink-500/50 disabled:shadow-none py-6 text-base uppercase tracking-wider mt-6"
                  >
                    <Map className="w-5 h-5" />
                    Open City Portal
                  </Button>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {/* Debug panel removed - can be restored from git history if needed */}
      {false && (
        <div className="absolute top-20 right-4 z-50 w-96 bg-black/90 backdrop-blur-xl border-2 border-yellow-400 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-yellow-400 uppercase tracking-wider flex items-center gap-2">
              🔬 Debug Panel
            </h3>
            <Button
              onClick={() => setShowDebugPanel(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6 text-white">
            {/* 🌊 OCEAN SURFACE SETTINGS - Testing transparency */}
            <div className="border-4 border-cyan-500/80 rounded-xl p-4 bg-cyan-900/20">
              <h4 className="font-bold text-cyan-300 mb-4 uppercase tracking-wide text-sm">🌊 Ocean Surface (Inside Globe)</h4>
              <div className="text-xs text-gray-400 mb-4">Controls the ocean/globe surface color and transparency</div>
              
              {/* ⚠️ IMPORTANT WARNING */}
              <div className="bg-yellow-900/50 border-2 border-yellow-400 rounded-lg p-3 mb-4 animate-pulse">
                <div className="text-yellow-300 font-bold text-xs mb-2">⚠️ TESTING TIP:</div>
                <div className="text-yellow-200 text-xs">
                  If opacity slider does NOTHING, turn OFF "Use Solid Color Texture" at the bottom! 
                  The texture might be blocking material opacity changes.
                </div>
              </div>
              
              {/* Show Globe Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugSettings.showGlobe}
                    onChange={(e) => setDebugSettings({...debugSettings, showGlobe: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm font-bold">Show Globe (showGlobe prop)</span>
                </label>
                <div className="text-xs text-yellow-300 mt-1">⚡ Turn OFF = hollow globe (no ocean)</div>
              </div>

              {/* Ocean Opacity */}
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                  Ocean Opacity: {debugSettings.oceanOpacity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={debugSettings.oceanOpacity}
                  onChange={(e) => setDebugSettings({...debugSettings, oceanOpacity: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>

              {/* Ocean Transparent Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugSettings.oceanTransparent}
                    onChange={(e) => setDebugSettings({...debugSettings, oceanTransparent: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm">Enable Transparent Material</span>
                </label>
              </div>

              {/* Ocean Depth Write Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugSettings.oceanDepthWrite}
                    onChange={(e) => setDebugSettings({...debugSettings, oceanDepthWrite: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm">Enable Depth Write</span>
                </label>
              </div>

              {/* Ocean Side Mode */}
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                  Material Side: {debugSettings.oceanSide === 0 ? 'FrontSide' : debugSettings.oceanSide === 1 ? 'BackSide' : 'DoubleSide'}
                </label>
                <select
                  value={debugSettings.oceanSide}
                  onChange={(e) => setDebugSettings({...debugSettings, oceanSide: parseInt(e.target.value)})}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="0">0 - FrontSide</option>
                  <option value="1">1 - BackSide</option>
                  <option value="2">2 - DoubleSide</option>
                </select>
              </div>

              {/* Use Globe Texture Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugSettings.useGlobeTexture}
                    onChange={(e) => setDebugSettings({...debugSettings, useGlobeTexture: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm">Use Solid Color Texture (globeImageUrl)</span>
                </label>
                <div className="text-xs text-gray-400 mt-1">When OFF, globeImageUrl = null</div>
              </div>
            </div>



            {/* Current Values Display */}
            <div className="bg-green-900/30 border border-green-400/30 rounded-xl p-4">
              <h4 className="font-bold text-green-300 mb-3 uppercase tracking-wide text-sm">Current Ocean Values</h4>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">showGlobe:</span>
                  <span className="text-white">{debugSettings.showGlobe.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">oceanOpacity:</span>
                  <span className="text-white">{debugSettings.oceanOpacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">oceanTransparent:</span>
                  <span className="text-white">{debugSettings.oceanTransparent.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">oceanDepthWrite:</span>
                  <span className="text-white">{debugSettings.oceanDepthWrite.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">oceanSide:</span>
                  <span className="text-white">{debugSettings.oceanSide}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">useTexture:</span>
                  <span className="text-white">{debugSettings.useGlobeTexture.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">oceanColor (from theme):</span>
                  <span className="text-white">{theme.oceanColor}</span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => setDebugSettings({
                oceanOpacity: 1.0,
                oceanTransparent: false,
                oceanDepthWrite: true,
                oceanSide: 2,
                showGlobe: true,
                useGlobeTexture: true,
                bumpImageUrl: null
              })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Reset Ocean Values
            </Button>
          </div>
        </div>
      )}

      {/* Admin Panel removed - controls now in bottom-right compact panel */}

      {/* Loading Screen - GTA Style */}
      {streetMapData && (
        <MapLoadingScreen
          city={streetMapData.city}
          country={streetMapData.country}
          isVisible={showMapLoading}
        />
      )}

      {/* Street Map View */}
      {showStreetMap && streetMapData && (
        <StreetMapView
          city={streetMapData.city}
          country={streetMapData.country}
          latitude={streetMapData.lat}
          longitude={streetMapData.lng}
          places={streetMapData.places}
          theme={activeLayer}
          onClose={() => {
            setShowStreetMap(false)
            // Reset globe view when closing
            if (globeEl.current) {
              globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)
            }
          }}
          onSelectPlace={(place) => {
            // DON'T close the street map - keep it open!
            // The StreetMapView sidebar will show the details
            console.log('Selected place:', place)
          }}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(236, 72, 153, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.7);
        }
      `}</style>
    </div>
  )
}