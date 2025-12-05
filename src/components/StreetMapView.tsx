import { useRef, useState, useEffect } from 'react'
import { X, ArrowLeft, Navigation, Maximize2, Minimize2, MapPin, Info } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { PlaceHub } from './PlaceHub'

interface StreetMapViewProps {
  city: string
  country: string
  latitude: number
  longitude: number
  places: any[]
  theme: 'places' | 'organizations' | 'products' | 'events' | 'all'
  onClose: () => void
  onSelectPlace?: (place: any) => void
}

// Theme colors for roads and markers
const THEME_COLORS = {
  places: { primary: '#ec4899', secondary: '#f9a8d4', road: '#ec4899' },
  organizations: { primary: '#10b981', secondary: '#6ee7b7', road: '#10b981' },
  products: { primary: '#f59e0b', secondary: '#fbbf24', road: '#f59e0b' },
  events: { primary: '#a855f7', secondary: '#c084fc', road: '#a855f7' },
  all: { primary: '#06b6d4', secondary: '#67e8f9', road: '#06b6d4' }
}

export function StreetMapView({
  city,
  country,
  latitude,
  longitude,
  places,
  theme,
  onClose,
  onSelectPlace
}: StreetMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPlaceHub, setShowPlaceHub] = useState(false)
  const themeColors = THEME_COLORS[theme] || THEME_COLORS.places

  useEffect(() => {
    // Dynamically import Leaflet
    const initMap = async () => {
      try {
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Import Leaflet JS
        let L = (window as any).L
        
        if (!L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
          L = (window as any).L
        }
        
        if (!mapRef.current || leafletMapRef.current) return

        // Create map
        const map = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 14,
          zoomControl: false,
          attributionControl: false // HIDE ATTRIBUTION
        })

        leafletMapRef.current = map

        // Use CartoDB Dark Matter No Labels (RAW - NO FILTER)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(map)

        // Create custom marker icon
        const createCustomIcon = (color: string) => {
          const markerSize = 40
          
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="position: relative; width: ${markerSize}px; height: ${markerSize}px;">
                <div style="
                  position: absolute;
                  top: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: ${markerSize}px;
                  height: ${markerSize}px;
                  background: ${color};
                  border: 3px solid white;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg) translateX(-50%);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 30px ${color}80, 0 0 60px ${color}40;
                  animation: pulse 2s ease-in-out infinite;
                "></div>
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -60%);
                  width: ${markerSize * 0.4}px;
                  height: ${markerSize * 0.4}px;
                  background: white;
                  border-radius: 50%;
                  z-index: 1;
                "></div>
              </div>
            `,
            iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize],
            popupAnchor: [0, -markerSize]
          })
        }

        // Add markers for all places
        places.forEach((place) => {
          if (place.latitude && place.longitude) {
            const marker = L.marker([place.latitude, place.longitude], {
              icon: createCustomIcon(themeColors.primary)
            }).addTo(map)

            // GTA-Style popup content with Tron aesthetics
            const popupContent = `
              <div style="
                position: relative;
                min-width: 280px;
                font-family: 'Courier New', monospace;
                background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.95));
                padding: 0;
                overflow: hidden;
              ">
                <!-- Scanline effect -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: repeating-linear-gradient(
                    0deg,
                    rgba(255,255,255,0.03) 0px,
                    transparent 1px,
                    transparent 2px,
                    rgba(255,255,255,0.03) 3px
                  );
                  pointer-events: none;
                  z-index: 10;
                "></div>

                <!-- Corner brackets -->
                <div style="
                  position: absolute;
                  top: 8px;
                  left: 8px;
                  width: 20px;
                  height: 20px;
                  border-top: 2px solid ${themeColors.primary};
                  border-left: 2px solid ${themeColors.primary};
                  opacity: 0.8;
                "></div>
                <div style="
                  position: absolute;
                  top: 8px;
                  right: 8px;
                  width: 20px;
                  height: 20px;
                  border-top: 2px solid ${themeColors.primary};
                  border-right: 2px solid ${themeColors.primary};
                  opacity: 0.8;
                "></div>
                <div style="
                  position: absolute;
                  bottom: 8px;
                  left: 8px;
                  width: 20px;
                  height: 20px;
                  border-bottom: 2px solid ${themeColors.primary};
                  border-left: 2px solid ${themeColors.primary};
                  opacity: 0.8;
                "></div>
                <div style="
                  position: absolute;
                  bottom: 8px;
                  right: 8px;
                  width: 20px;
                  height: 20px;
                  border-bottom: 2px solid ${themeColors.primary};
                  border-right: 2px solid ${themeColors.primary};
                  opacity: 0.8;
                "></div>

                <!-- Content -->
                <div style="padding: 20px; position: relative; z-index: 5;">
                  <!-- Header bar -->
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid ${themeColors.primary}40;
                  ">
                    <div style="
                      width: 6px;
                      height: 6px;
                      background: ${themeColors.primary};
                      border-radius: 50%;
                      box-shadow: 0 0 10px ${themeColors.primary};
                      animation: blink 2s infinite;
                    "></div>
                    <span style="
                      color: ${themeColors.primary};
                      font-size: 10px;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      font-weight: bold;
                    ">TARGET ACQUIRED</span>
                  </div>

                  <!-- Place name -->
                  <h3 style="
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 0 0 10px ${themeColors.primary}80;
                    letter-spacing: 1px;
                  ">${place.name}</h3>

                  <!-- Type badge -->
                  <div style="
                    display: inline-block;
                    padding: 4px 12px;
                    background: ${themeColors.primary}20;
                    border: 1px solid ${themeColors.primary};
                    border-radius: 4px;
                    margin-bottom: 12px;
                  ">
                    <span style="
                      color: ${themeColors.primary};
                      font-size: 11px;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      font-weight: bold;
                    ">${place.type.replace(/_/g, ' ')}</span>
                  </div>

                  <!-- Description -->
                  ${place.description ? `
                    <p style="
                      margin: 12px 0;
                      font-size: 12px;
                      color: rgba(255,255,255,0.7);
                      line-height: 1.5;
                      font-family: system-ui;
                    ">${place.description.substring(0, 120)}${place.description.length > 120 ? '...' : ''}</p>
                  ` : ''}

                  <!-- Location info grid -->
                  <div style="
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 8px;
                    margin: 12px 0;
                    padding: 12px;
                    background: rgba(0,0,0,0.3);
                    border-left: 2px solid ${themeColors.primary};
                    font-size: 11px;
                  ">
                    ${place.city ? `
                      <span style="color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">CITY:</span>
                      <span style="color: white; font-weight: bold;">${place.city}</span>
                    ` : ''}
                    ${place.country ? `
                      <span style="color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">COUNTRY:</span>
                      <span style="color: white; font-weight: bold;">${place.country}</span>
                    ` : ''}
                  </div>

                  <!-- Action button -->
                  <button 
                    onclick="window.selectPlace('${place.id}')"
                    style="
                      width: 100%;
                      padding: 12px;
                      background: linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary});
                      color: white;
                      border: none;
                      border-radius: 0;
                      font-weight: bold;
                      cursor: pointer;
                      font-size: 13px;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      position: relative;
                      overflow: hidden;
                      box-shadow: 0 0 20px ${themeColors.primary}60, inset 0 0 20px rgba(255,255,255,0.1);
                      border: 1px solid ${themeColors.primary};
                      transition: all 0.3s;
                    "
                    onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 0 30px ${themeColors.primary}80, inset 0 0 30px rgba(255,255,255,0.2)'"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px ${themeColors.primary}60, inset 0 0 20px rgba(255,255,255,0.1)'"
                  >
                    <span style="position: relative; z-index: 1;">► VIEW DETAILS</span>
                  </button>
                </div>
              </div>
            `

            marker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'gta-popup'
            })

            // Don't open sidebar on marker click - only show popup
            // Sidebar opens when user clicks "VIEW DETAILS" button
          }
        })

        // Add custom zoom controls
        addCustomControls(map, L)

        setIsLoading(false)

      } catch (error) {
        console.error('Error initializing map:', error)
        setIsLoading(false)
      }
    }

    initMap()

    // Global function for popup button
    ;(window as any).selectPlace = (placeId: string) => {
      const place = places.find(p => p.id === placeId)
      if (place) {
        setSelectedPlace(place)
        if (onSelectPlace) onSelectPlace(place)
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
      delete (window as any).selectPlace
    }
  }, [latitude, longitude, places, theme])

  const addCustomControls = (map: any, L: any) => {
    const zoomControl = L.control({ position: 'bottomright' })
    zoomControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'custom-zoom-controls')
      div.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.9); padding: 8px; border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid ${themeColors.primary}40;">
          <button id="zoom-in" style="width: 44px; height: 44px; background: ${themeColors.primary}; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; box-shadow: 0 0 20px ${themeColors.primary}60;">+</button>
          <button id="zoom-out" style="width: 44px; height: 44px; background: ${themeColors.primary}; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; box-shadow: 0 0 20px ${themeColors.primary}60;">−</button>
        </div>
      `
      
      L.DomEvent.on(div.querySelector('#zoom-in'), 'click', () => map.zoomIn())
      L.DomEvent.on(div.querySelector('#zoom-out'), 'click', () => map.zoomOut())
      
      return div
    }
    zoomControl.addTo(map)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const recenterMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([latitude, longitude], 14)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black ${isFullscreen ? '' : 'p-4 md:p-8'}`}
      style={{ zIndex: 100 }}
    >
      {/* Header - MUST BE ON TOP */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/80 to-transparent p-4" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Globe
            </Button>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <h2 className="font-bold text-white">{city}</h2>
              <p className="text-xs text-white/60">{country} • Atlas City View</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              className="text-white border-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              {places.length} {places.length === 1 ? 'Place' : 'Places'}
            </Badge>
            
            <Button
              onClick={recenterMap}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              title="Recenter map"
            >
              <Navigation className="w-4 h-4" />
            </Button>

            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className={`w-full h-full ${isFullscreen ? '' : 'rounded-2xl overflow-hidden border-2'}`}
        style={{ borderColor: themeColors.primary }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[9998]">
          <div className="text-center">
            <div 
              className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
              style={{ borderColor: `${themeColors.primary} transparent transparent transparent` }}
            />
            <p className="text-white">Loading Atlas City View...</p>
            <p className="text-white/60 text-sm mt-2">{city}, {country}</p>
          </div>
        </div>
      )}

      {/* Place Details Sidebar - GTA Style */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-96 overflow-y-auto"
            style={{ 
              zIndex: 9999,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(20,20,20,0.98))',
              backdropFilter: 'blur(20px)',
              borderLeft: `2px solid ${themeColors.primary}`
            }}
          >
            {/* Scanlines effect */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px)`,
                zIndex: 1
              }}
            />

            <div className="p-6 space-y-6 relative z-10">
              {/* Close button */}
              <Button
                onClick={() => setSelectedPlace(null)}
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/10"
                style={{ zIndex: 20 }}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Status bar */}
              <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-widest">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: themeColors.primary, boxShadow: `0 0 10px ${themeColors.primary}` }}
                />
                Location Data
              </div>

              {/* Place details */}
              <div>
                <h3 
                  className="font-bold text-white mb-3"
                  style={{ 
                    textShadow: `0 0 20px ${themeColors.primary}60`,
                    letterSpacing: '1px'
                  }}
                >
                  {selectedPlace.name}
                </h3>
                <Badge 
                  className="text-white border"
                  style={{ 
                    background: `${themeColors.primary}20`,
                    borderColor: themeColors.primary
                  }}
                >
                  {selectedPlace.type.replace(/_/g, ' ')}
                </Badge>
              </div>

              {selectedPlace.description && (
                <div 
                  className="p-4 text-sm text-white/70"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderLeft: `2px solid ${themeColors.primary}`,
                    fontFamily: 'system-ui'
                  }}
                >
                  {selectedPlace.description}
                </div>
              )}

              {/* Data grid */}
              <div 
                className="space-y-3 p-4"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${themeColors.primary}40`
                }}
              >
                <div className="text-xs text-white/50 uppercase tracking-widest mb-3">
                  ▸ Location Info
                </div>
                {selectedPlace.city && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 uppercase text-xs tracking-wider">City</span>
                    <span className="text-white font-mono">{selectedPlace.city}</span>
                  </div>
                )}
                {selectedPlace.country && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 uppercase text-xs tracking-wider">Country</span>
                    <span className="text-white font-mono">{selectedPlace.country}</span>
                  </div>
                )}
                {selectedPlace.category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 uppercase text-xs tracking-wider">Category</span>
                    <span className="text-white font-mono">{selectedPlace.category}</span>
                  </div>
                )}
              </div>

              {/* Action button */}
              {onSelectPlace && (
                <Button
                  onClick={() => setShowPlaceHub(true)}
                  className="w-full text-white uppercase tracking-widest hover:scale-105 transition-transform"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 30px ${themeColors.primary}60, inset 0 0 20px rgba(255,255,255,0.1)`,
                    border: `1px solid ${themeColors.primary}`
                  }}
                >
                  ► View Full Details
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place Hub - Full Screen */}
      <PlaceHub
        place={selectedPlace}
        isOpen={showPlaceHub}
        onClose={() => {
          setShowPlaceHub(false)
          setSelectedPlace(null)
        }}
        theme={theme}
      />

      {/* Custom styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50%, 99% { opacity: 0.3; }
        }
        
        .leaflet-container {
          background: #000000 !important;
          font-family: 'Courier New', monospace !important;
        }
        
        /* Clean map - no filters */
        .leaflet-tile-pane {
          filter: none !important;
          opacity: 1 !important;
        }
        
        /* GTA-style popup */
        .gta-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 40px ${themeColors.primary}40, 0 0 80px ${themeColors.primary}20 !important;
          border: 2px solid ${themeColors.primary} !important;
          border-radius: 0 !important;
        }
        
        .gta-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        
        .gta-popup .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 1px solid ${themeColors.primary} !important;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        /* Hide attribution */
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </motion.div>
  )
}