import { useState, useEffect, useRef } from 'react'
import { Building2, MapPin, Globe as GlobeIcon, ArrowLeft, Sparkles, ZoomIn, ZoomOut, RotateCw, X, Users, Award, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CompanyCard } from './CompanyCard'

// Dynamic import to avoid Three.js conflicts
// Note: You may see a warning about multiple Three.js instances in console
// This is expected with react-globe.gl and doesn't affect functionality
let Globe: any = null

interface WorldMapBrowser3DProps {
  serverUrl: string
  userId?: string
  accessToken?: string
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

export function WorldMapBrowser3D({ serverUrl, userId, accessToken, onClose, onViewCompany, onManageOrganization, onAddOrganization }: WorldMapBrowser3DProps) {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<{ [country: string]: LocationData }>({})
  const [markers, setMarkers] = useState<GlobeMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null)
  const [countryPolygons, setCountryPolygons] = useState<any[]>([])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null)
  const [isCountryAnimating, setIsCountryAnimating] = useState(false)
  const [showAtlasCard, setShowAtlasCard] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const globeEl = useRef<any>()

  useEffect(() => {
    // Dynamically import Globe to avoid Three.js conflicts
    import('react-globe.gl@2.27.2').then((module) => {
      Globe = module.default
      setGlobeReady(true)
    })
    
    fetchCompanies()
    loadCountryPolygons()
  }, [])

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
        processLocationData(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
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

  const processLocationData = (companies: any[]) => {
    const locations: { [country: string]: LocationData } = {}
    const globeMarkers: GlobeMarker[] = []
    
    console.log('Processing companies:', companies.length)
    
    companies.forEach(company => {
      if (company.location) {
        const parts = company.location.split(',').map((s: string) => s.trim())
        const countryRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0]
        const country = getFullCountryName(countryRaw) // Convert code to full name
        const city = parts.length > 1 ? parts[0] : 'Other'
        
        console.log(`Company "${company.name}": location="${company.location}" -> city="${city}", country="${country}"`)
        
        if (!locations[country]) {
          locations[country] = {
            country,
            cities: {}
          }
        }
        
        if (!locations[country].cities[city]) {
          locations[country].cities[city] = []
        }
        
        locations[country].cities[city].push(company)
      }
    })
    
    console.log('Location data by country:', Object.keys(locations))
    
    // Create globe markers with coordinates
    Object.entries(locations).forEach(([country, data]) => {
      Object.entries(data.cities).forEach(([city, cityCompanies]) => {
        const coords = getCityCoordinates(city, country)
        if (coords) {
          globeMarkers.push({
            lat: coords.lat,
            lng: coords.lng,
            size: Math.min(cityCompanies.length * 0.3, 2),
            color: '#10b981', // hemp-primary
            country,
            city,
            companies: cityCompanies
          })
        }
      })
    })
    
    console.log('Created markers:', globeMarkers.length)
    
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
      'Other': getCountryCapitalCoordinates(country)
    }
    
    return coordinates[city] || coordinates['Other']
  }

  const getCountryCapitalCoordinates = (country: string): { lat: number, lng: number } => {
    const capitals: { [key: string]: { lat: number, lng: number } } = {
      'France': { lat: 48.8566, lng: 2.3522 },
      'Germany': { lat: 52.5200, lng: 13.4050 },
      'Spain': { lat: 40.4168, lng: -3.7038 },
      'Italy': { lat: 41.9028, lng: 12.4964 },
      'United Kingdom': { lat: 51.5074, lng: -0.1278 },
      'USA': { lat: 38.9072, lng: -77.0369 },
      'Canada': { lat: 45.4215, lng: -75.6972 },
      'Brazil': { lat: -15.7975, lng: -47.8919 },
      'Japan': { lat: 35.6762, lng: 139.6503 },
      'China': { lat: 39.9042, lng: 116.4074 },
      'India': { lat: 28.6139, lng: 77.2090 },
      'Australia': { lat: -35.2809, lng: 149.1300 },
      'South Africa': { lat: -25.7479, lng: 28.2293 },
      'Netherlands': { lat: 52.3676, lng: 4.9041 },
      'Switzerland': { lat: 46.9480, lng: 7.4474 },
      'Sweden': { lat: 59.3293, lng: 18.0686 },
      'Norway': { lat: 59.9139, lng: 10.7522 },
      'Denmark': { lat: 55.6761, lng: 12.5683 },
    }
    
    return capitals[country] || { lat: 0, lng: 0 }
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
        // If clicking the same country, deselect it
        if (selectedCountryName === countryName) {
          setSelectedCountryName(null)
          setShowAtlasCard(false)
          return
        }
        
        console.log('Setting selected country:', countryName)
        // Start the animation sequence
        setSelectedCountryName(countryName)
        setIsCountryAnimating(true)
        setShowAtlasCard(false) // Hide card initially
        
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

  if (!globeReady || !Globe) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950">
        <div className="text-center">
          <GlobeIcon className="w-16 h-16 mx-auto mb-4 text-hemp-primary animate-spin" />
          <p className="text-lg font-black uppercase tracking-widest text-white">Loading Hemp Atlas</p>
        </div>
      </div>
    )
  }

  // Main 3D globe view
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 relative overflow-hidden">
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

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8">
        <div className="flex items-center justify-between">
          <Button onClick={onClose} variant="ghost" className="gap-2 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Globe controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              className="text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              className="text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleResetView}
              variant="ghost"
              size="icon"
              className="text-white bg-black/20 backdrop-blur-sm hover:bg-black/30"
              title="Reset View"
            >
              <RotateCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3D Globe - Centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Globe
          ref={globeEl}
          
          // Custom Hemp'in Solarpunk styled globe
          // Use GeoJSON polygons for countries with custom colors
          globeImageUrl={null as any}
          showGlobe={true}
          
          // Ocean color - Deep solarpunk blue that complements hemp-primary
          globeMaterial={{
            color: '#0f4c75', // Deep ocean blue
            shininess: 0.1
          }}
          
          // Land polygons with Hemp'in greens
          polygonsData={countryPolygons}
          polygonCapColor={(d: any) => {
            const countryName = d.properties?.ADMIN || d.properties?.NAME
            // Highlight hovered/selected countries with companies
            if (countryName === selectedCountryName) return '#facc15' // Bright yellow/gold for selected - VERY OBVIOUS
            if (countryName === hoveredCountry) return '#22d3ee' // Bright cyan for hover
            if (locationData[countryName]) return '#059669' // Darker green for countries with companies
            return '#064e3b' // Even darker for countries without companies
          }}
          polygonSideColor={() => '#064e3b'} // Even darker for depth
          polygonStrokeColor={(d: any) => {
            const countryName = d.properties?.ADMIN || d.properties?.NAME
            if (countryName === selectedCountryName) return '#fde047' // Bright yellow glow
            if (countryName === hoveredCountry) return '#22d3ee'
            return '#10b981'
          }}
          polygonAltitude={(d: any) => {
            const countryName = d.properties?.ADMIN || d.properties?.NAME
            // Pop out selected/hovered countries with companies - MUCH MORE DRAMATIC
            if (countryName === selectedCountryName) return 0.15 // Really tall
            if (countryName === hoveredCountry) return 0.06
            return 0.01
          }}
          onPolygonHover={handleCountryHover}
          onPolygonClick={handleCountryClick}
          
          // Hemp'in atmosphere
          showAtmosphere={true}
          atmosphereColor="#10b981"
          atmosphereAltitude={0.25}
          
          // Points (company markers)
          pointsData={markers}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => '#fbbf24'} // Bright yellow/gold for contrast
          pointAltitude={0.05}
          pointRadius={(d: any) => d.size + 0.3}
          pointLabel={(d: any) => `
            <div style="
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              padding: 8px 16px;
              border-radius: 20px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
              font-weight: 900; 
              font-size: 14px; 
              letter-spacing: 0.5px;
              text-align: center;
              white-space: nowrap;
            ">${d.city}</div>
          `}
          onPointClick={(point: any) => handleMarkerClick(point as GlobeMarker)}
          onPointHover={(point: any) => {
            document.body.style.cursor = point ? 'pointer' : 'grab'
          }}
          
          // Rings around markers - Bright yellow/gold
          ringsData={markers}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => '#fbbf24'}
          ringMaxRadius={4}
          ringPropagationSpeed={2.5}
          ringRepeatPeriod={1800}
          ringAltitude={0.02}
          
          // Globe settings
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          
          // Background - transparent to show our stars
          backgroundColor="rgba(0,0,0,0)"
          
          // Enable controls
          enablePointerInteraction={true}
          
          // Initial view
          {...(globeEl.current ? {} : {
            pointOfView: { lat: 20, lng: 0, altitude: 2.5 }
          })}
        />
      </div>

      {/* Country Atlas Summary Card */}
      {selectedCountryName && showAtlasCard && (() => {
        const stats = getCountryStats(selectedCountryName)
        if (!stats) return null
        
        return (
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto animate-in slide-in-from-left duration-300">
            <div className="bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-green-950/95 backdrop-blur-xl border-2 border-hemp-primary rounded-3xl shadow-2xl shadow-hemp-primary/50 max-w-sm md:max-w-md w-[calc(100vw-2rem)] md:w-auto">
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

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-hemp-primary/30">
                  <p className="text-xs text-center text-emerald-300/80 font-semibold">
                    Click to explore cities and organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Button
            onClick={() => {
              if (onAddOrganization) {
                onAddOrganization()
              } else {
                console.log('Add Organization clicked')
              }
            }}
            className="relative overflow-hidden bg-gradient-to-r from-hemp-primary/20 to-hemp-secondary/20 hover:from-hemp-primary/30 hover:to-hemp-secondary/30 backdrop-blur-xl border-2 border-hemp-primary/50 hover:border-hemp-primary text-white rounded-2xl px-6 md:px-8 py-4 md:py-6 transition-all duration-300 group shadow-lg shadow-hemp-primary/20 hover:shadow-hemp-primary/40 w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-hemp-primary/0 via-hemp-primary/10 to-hemp-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-hemp-primary/30 group-hover:bg-hemp-primary/50 transition-colors">
                <Building2 className="w-4 md:w-5 h-4 md:h-5" />
              </div>
              <span className="font-black text-base md:text-lg uppercase tracking-wider">Add Organization</span>
            </div>
          </Button>

          <Button
            onClick={() => {
              if (onManageOrganization) {
                onManageOrganization()
              } else {
                console.log('Manage my Org clicked')
              }
            }}
            className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 backdrop-blur-xl border-2 border-amber-500/50 hover:border-amber-500 text-white rounded-2xl px-6 md:px-8 py-4 md:py-6 transition-all duration-300 group shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 w-full md:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-amber-500/30 group-hover:bg-amber-500/50 transition-colors">
                <Building2 className="w-4 md:w-5 h-4 md:h-5" />
              </div>
              <span className="font-black text-base md:text-lg uppercase tracking-wider">Manage My Org</span>
            </div>
          </Button>
        </div>
      </div>

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
                      setSelectedCompany(null)
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

      {/* City Detail Modal - Slides in from Right */}
      {selectedMarker && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setSelectedMarker(null)}
          />
          
          {/* Modal Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-gradient-to-br from-emerald-950/98 via-teal-900/98 to-green-950/98 backdrop-blur-2xl border-l-2 border-amber-500 shadow-2xl shadow-amber-500/50 z-50 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 p-6 border-b-2 border-amber-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-white/80" />
                      <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                        City Directory
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedMarker(null)}
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-white hover:bg-white/20 -mt-1 -mr-1"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <h2 className="font-black text-2xl text-white drop-shadow-lg mb-1">
                {selectedMarker.city}
              </h2>
              
              <div className="flex items-center gap-2 text-white/80">
                <GlobeIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{selectedMarker.country}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-2xl p-6 border border-amber-500/50 backdrop-blur-sm mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span className="text-xs uppercase tracking-wider text-amber-400/90 font-black">Organizations</span>
                  </div>
                  <div className="font-black text-4xl text-white drop-shadow-lg">
                    {selectedMarker.companies.length}
                  </div>
                </div>
              </div>

              {/* Companies List */}
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-hemp-primary mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
                  <span>Companies & Organizations</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
                </h3>
                <div className="space-y-3">
                  {selectedMarker.companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between bg-gradient-to-r from-emerald-900/50 to-teal-900/50 hover:from-emerald-800/60 hover:to-teal-800/60 border border-hemp-primary/30 hover:border-hemp-primary/60 rounded-xl p-4 transition-all cursor-pointer group backdrop-blur-sm"
                      onClick={() => {
                        setSelectedMarker(null)
                        setSelectedCompany(company)
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-hemp-primary/30 group-hover:border-hemp-primary transition-colors shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-hemp-primary to-hemp-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white group-hover:text-hemp-primary transition-colors truncate">
                            {company.name}
                          </div>
                          {company.category && (
                            <div className="text-xs text-emerald-300/60 font-semibold truncate">
                              {typeof company.category === 'object' ? company.category.name : company.category}
                            </div>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-hemp-primary shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
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
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  )
}