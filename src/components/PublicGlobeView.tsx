import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ArrowLeft, Palette, Layers, Building2, Store, Sparkles, X } from 'lucide-react'
import { Button } from './ui/button'
import { GlobeCustomizationPanel } from './GlobeCustomizationPanel'
import { GlobeLayerPanel, GlobeLayer } from './GlobeLayerPanel'
import { CompanyCard } from './CompanyCard'

// Lazy load Globe to avoid bundling issues
const GlobeComponent = lazy(() => import('react-globe.gl'))

interface GlobeStyle {
  oceanColor: string
  landColor: string
  atmosphereColor: string
  atmosphereIntensity: number
  showGrid: boolean
}

interface PublicGlobeViewProps {
  serverUrl: string
  userId?: string | null
  accessToken?: string | null
  onBack: () => void
  onSignIn?: () => void
}

interface GlobeMarker {
  lat: number
  lng: number
  size: number
  color: string
  label: string
  type: 'company' | 'shop'
  data: any
}

const DEFAULT_STYLE: GlobeStyle = {
  oceanColor: '#059669', // Deep emerald ocean
  landColor: '#84cc16', // Bright lime green land - hemp vibes!
  atmosphereColor: '#fbbf24', // Golden atmosphere
  atmosphereIntensity: 0.7,
  showGrid: false
}

export function PublicGlobeView({ serverUrl, userId, accessToken, onBack, onSignIn }: PublicGlobeViewProps) {
  const globeEl = useRef<any>()
  const [globeStyle, setGlobeStyle] = useState<GlobeStyle>(DEFAULT_STYLE)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showLayers, setShowLayers] = useState(true)
  
  // Data states
  const [companies, setCompanies] = useState<any[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [markers, setMarkers] = useState<GlobeMarker[]>([])
  const [loading, setLoading] = useState(true)
  
  // Selected marker state
  const [selectedMarker, setSelectedMarker] = useState<GlobeMarker | null>(null)
  
  // Countries data for styling
  const [countries, setCountries] = useState<any[]>([])
  
  // Layer states
  const [layers, setLayers] = useState<GlobeLayer[]>([
    {
      id: 'companies',
      name: 'Organizations',
      icon: '🏢',
      color: '#10b981', // Emerald
      enabled: true,
      requiresAuth: true,
      count: 0,
      minZoomLevel: 0
    },
    {
      id: 'shops',
      name: 'Shops & Products',
      icon: '🛍️',
      color: '#f59e0b', // Amber
      enabled: true,
      requiresAuth: true,
      count: 0,
      minZoomLevel: 0
    }
  ])

  const isAuthenticated = !!userId && !!accessToken

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

  // Load countries data for polygon rendering
  useEffect(() => {
    console.log('🌍 Starting to load countries data...')
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => {
        console.log('📡 Countries data fetched, parsing JSON...')
        return res.json()
      })
      .then(data => {
        if (data && data.features) {
          console.log(`✅ Loaded ${data.features.length} countries for globe`)
          console.log('First country sample:', data.features[0])
          setCountries(data.features)
        } else {
          console.error('❌ No features in countries data:', data)
        }
      })
      .catch(err => {
        console.error('❌ Failed to load countries data:', err)
      })
  }, [])

  // Load saved style from localStorage on mount
  useEffect(() => {
    const savedStyle = localStorage.getItem('dewii-globe-style')
    if (savedStyle) {
      try {
        setGlobeStyle(JSON.parse(savedStyle))
      } catch (e) {
        console.error('Failed to load saved style:', e)
      }
    }
  }, [])

  // Fetch data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanies()
      fetchShops()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Update markers when data or layers change
  useEffect(() => {
    updateMarkers()
  }, [companies, shops, layers])

  // Update globe colors when style changes
  useEffect(() => {
    if (globeEl.current && globeEl.current.scene) {
      const scene = globeEl.current.scene()
      const globeMesh = scene.children.find((obj: any) => obj.type === 'Mesh')
      if (globeMesh && globeMesh.material) {
        globeMesh.material.color.set(globeStyle.oceanColor)
        globeMesh.material.needsUpdate = true
      }
    }
  }, [globeStyle.oceanColor])

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
        // Ensure data is an array
        const companiesArray = Array.isArray(data) ? data : []
        setCompanies(companiesArray)
        updateLayerCount('companies', companiesArray.length)
      } else {
        console.error('Failed to fetch companies:', response.status)
        setCompanies([])
        updateLayerCount('companies', 0)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompanies([])
      updateLayerCount('companies', 0)
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/swag-products`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Shops API response:', data)
        
        // API returns { products: [...], count, limit, offset }
        const productsArray = data.products || []
        
        // For now, use company location as fallback since products don't have location field yet
        // We'll map products to their company locations
        const shopsWithLocation = productsArray
          .filter((product: any) => product.company && product.company.name)
          .map((product: any) => ({
            ...product,
            // Use company info for location (will be enhanced later)
            locationName: product.company.name
          }))
        
        console.log(`Found ${shopsWithLocation.length} shops out of ${productsArray.length} total products`)
        setShops(shopsWithLocation)
        updateLayerCount('shops', shopsWithLocation.length)
      } else {
        console.error('Failed to fetch shops:', response.status)
        setShops([])
        updateLayerCount('shops', 0)
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
      updateLayerCount('shops', 0)
    }
  }

  const updateLayerCount = (layerId: string, count: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, count } : layer
    ))
  }

  const updateMarkers = () => {
    const newMarkers: GlobeMarker[] = []
    let companyMarkersCount = 0
    let shopMarkersCount = 0

    // Add company markers if layer is enabled
    const companiesLayer = layers.find(l => l.id === 'companies')
    if (companiesLayer?.enabled && isAuthenticated) {
      companies.forEach(company => {
        if (company.location) {
          const coords = parseLocation(company.location)
          if (coords) {
            newMarkers.push({
              lat: coords.lat,
              lng: coords.lng,
              size: 0.5,
              color: companiesLayer.color,
              label: company.name,
              type: 'company',
              data: company
            })
            companyMarkersCount++
          }
        }
      })
    }

    // Add shop markers if layer is enabled
    const shopsLayer = layers.find(l => l.id === 'shops')
    if (shopsLayer?.enabled && isAuthenticated) {
      shops.forEach(shop => {
        // Try to find the company location from companies array
        let locationString = null
        
        if (shop.company_id) {
          const company = companies.find(c => c.id === shop.company_id)
          if (company && company.location) {
            locationString = company.location
          }
        }
        
        // Fallback to company name if we have it
        if (!locationString && shop.company && shop.company.name) {
          locationString = shop.company.name
        }
        
        if (locationString) {
          const coords = parseLocation(locationString)
          if (coords) {
            newMarkers.push({
              lat: coords.lat,
              lng: coords.lng,
              size: 0.4,
              color: shopsLayer.color,
              label: shop.name,
              type: 'shop',
              data: shop
            })
            shopMarkersCount++
          }
        }
      })
    }

    console.log(`🗺️ Globe markers updated: ${companyMarkersCount} companies, ${shopMarkersCount} shops`)
    setMarkers(newMarkers)
  }

  const parseLocation = (location: string): { lat: number, lng: number } | null => {
    // Use our geocoding utility
    const { parseLocation: geocode, addJitter } = require('../utils/geocoding')
    const coords = geocode(location)
    if (!coords) return null
    
    // Add slight jitter to prevent exact overlaps
    return addJitter(coords, location)
  }

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    ))
  }

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn()
    }
  }

  // Hover state for countries
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50">
      {/* Debug - show hovered country */}
      {hoveredCountry && (
        <div className="absolute top-20 left-4 z-50 bg-emerald-600/90 backdrop-blur-xl border border-emerald-400/50 rounded-lg px-4 py-2 shadow-lg">
          <p className="text-white text-sm">Hovering: <strong>{hoveredCountry}</strong></p>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                Hemp Atlas Globe
              </h1>
              <p className="text-sm text-neutral-400">
                {isAuthenticated 
                  ? 'Explore the global hemp network' 
                  : 'Customize your view • Sign in to explore data'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowLayers(!showLayers)}
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Layers className="w-4 h-4" />
              Layers
            </Button>
            <Button
              onClick={() => setShowCustomization(!showCustomization)}
              variant="outline"
              size="sm"
              className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
            >
              <Palette className="w-4 h-4" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      {/* Globe */}
      <div className="w-full h-full">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4" />
              <p className="text-neutral-400">Loading globe...</p>
            </div>
          </div>
        }>
          <GlobeComponent
            ref={globeEl}
            key={`${globeStyle.oceanColor}-${globeStyle.landColor}-${globeStyle.atmosphereColor}`}
            
            // No texture - use solid color for ocean
            globeImageUrl={null as any}
            showGlobe={true}
            backgroundColor="rgba(0,0,0,0)"
            
            // Ocean color via globeMaterial - Pokemon Go vibrant style!
            globeMaterial={{
              color: globeStyle.oceanColor,
              shininess: 0.2,
              opacity: 1
            }}
            
            // Render countries as polygons with custom land color - POKEMON GO STYLE
            polygonsData={countries}
            polygonCapColor={(d: any) => {
              const countryName = d?.properties?.ADMIN || d?.properties?.NAME || ''
              // Brighten on hover for interactive feedback
              if (hoveredCountry && countryName && countryName === hoveredCountry) {
                return '#ffffff' // Bright white on hover
              }
              return globeStyle.landColor
            }}
            polygonSideColor={(d: any) => globeStyle.landColor}
            polygonStrokeColor={(d: any) => {
              const countryName = d?.properties?.ADMIN || d?.properties?.NAME || ''
              // Animate borders on hover
              if (hoveredCountry && countryName && countryName === hoveredCountry) {
                return globeStyle.atmosphereColor // Use atmosphere color for glow
              }
              // Always show borders for Pokemon Go style
              return globeStyle.showGrid ? '#ffffff' : 'rgba(255,255,255,0.4)'
            }}
            polygonAltitude={(d: any) => {
              const countryName = d?.properties?.ADMIN || d?.properties?.NAME || ''
              // Pop up on hover - Pokemon Go style interaction!
              if (hoveredCountry && countryName && countryName === hoveredCountry) {
                return 0.05 // Pop up significantly
              }
              return 0.01 // Base height
            }}
            polygonCapCurvatureResolution={4}
            polygonsTransitionDuration={300} // Smooth animations
            onPolygonHover={(polygon: any) => {
              if (polygon && polygon.properties) {
                const countryName = polygon.properties.ADMIN || polygon.properties.NAME
                console.log('🎯 Hovering country:', countryName)
                setHoveredCountry(countryName || null)
              } else {
                console.log('🎯 Hover cleared')
                setHoveredCountry(null)
              }
            }}
            polygonLabel={({ properties: d }: any) => `
              <div style="
                background: linear-gradient(135deg, rgba(16,185,129,0.95) 0%, rgba(5,150,105,0.95) 100%);
                padding: 12px 16px;
                border-radius: 8px;
                border: 2px solid rgba(255,255,255,0.3);
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                backdrop-filter: blur(10px);
              ">
                <b style="color: white; font-size: 14px;">${d.ADMIN || d.NAME || 'Unknown'}</b>
              </div>
            `}
            
            // Points for markers - bright and visible
            pointsData={markers}
            pointAltitude={0.03}
            pointRadius={(d: any) => d.size}
            pointColor={(d: any) => d.color}
            pointLabel={(d: any) => d.label}
            onPointClick={(point: any) => setSelectedMarker(point as GlobeMarker)}
            
            // Atmosphere styling - Pokemon Go glow!
            atmosphereColor={globeStyle.atmosphereColor}
            atmosphereAltitude={0.25}
            showAtmosphere={true}
            
            // Controls
            enablePointerInteraction={true}
          />
        </Suspense>
      </div>

      {/* Layer Panel */}
      {showLayers && (
        <GlobeLayerPanel
          layers={layers}
          isAuthenticated={isAuthenticated}
          onLayerToggle={handleLayerToggle}
          onSignInClick={handleSignIn}
        />
      )}

      {/* Customization Panel */}
      {showCustomization && (
        <GlobeCustomizationPanel
          style={globeStyle}
          onStyleChange={setGlobeStyle}
          onClose={() => setShowCustomization(false)}
        />
      )}

      {/* Selected Marker Card */}
      {selectedMarker && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-96 bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl z-50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {selectedMarker.type === 'company' ? (
                <Building2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Store className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="text-white">{selectedMarker.label}</h3>
            </div>
            <Button
              onClick={() => setSelectedMarker(null)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {selectedMarker.type === 'company' && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-400">
                {selectedMarker.data.description || 'No description available'}
              </p>
              <p className="text-xs text-neutral-500">
                📍 {selectedMarker.data.location}
              </p>
            </div>
          )}

          {selectedMarker.type === 'shop' && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-400">
                {selectedMarker.data.description || 'No description available'}
              </p>
              <p className="text-sm text-amber-400">
                ${selectedMarker.data.price}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4" />
            <p className="text-white">Loading data...</p>
          </div>
        </div>
      )}
    </div>
  )
}
