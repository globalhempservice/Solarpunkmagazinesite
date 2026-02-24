import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { MiniAppProps } from '../../types/mini-app'
import { MapPin, Search, Filter, Building2, Plus, Wheat, Factory, Package, ShoppingCart, Cross, Building, Calendar, Users, Globe as GlobeIcon, Mail, Phone, MessageCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { motion, AnimatePresence } from 'motion/react'
import { AddPlaceModal } from '../places/AddPlaceModal'
import { PlaceDetailModal } from '../places/PlaceDetailModal'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import budCharacterUrl from '../../assets/bud-character.svg'

const sizeMap = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-24 h-24', xl: 'w-32 h-32' }
function BudCharacter({ size = 'md', animate = true, className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', animate?: boolean, expression?: string, mood?: string, className?: string }) {
  return (
    <motion.img
      src={budCharacterUrl}
      className={`${sizeMap[size]} drop-shadow-lg ${className}`}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

interface Place {
  id: string
  name: string
  type: string
  category: string
  description?: string
  status: string
  latitude?: number
  longitude?: number
  area_hectares?: number
  city?: string
  state_province?: string
  country: string
  phone?: string
  email?: string
  website?: string
  company?: {
    id: string
    name: string
    logo_url?: string
  }
  owner_name?: string
  manager_name?: string
  year_established?: number
  specialties?: string[]
  photos?: string[]
  logo_url?: string
  created_by?: string
  distance?: number // Distance in km
}

const CATEGORY_COLORS = {
  agriculture: 'from-green-500 to-emerald-600',
  processing: 'from-blue-500 to-cyan-600',
  storage: 'from-purple-500 to-violet-600',
  retail: 'from-pink-500 to-rose-600',
  medical: 'from-red-500 to-orange-600',
  other: 'from-slate-500 to-gray-600',
}

const getCategoryIcon = (category: string, className: string = "w-5 h-5") => {
  const iconProps = { className, strokeWidth: 2 }
  
  switch (category) {
    case 'agriculture':
      return <Wheat {...iconProps} />
    case 'processing':
      return <Factory {...iconProps} />
    case 'storage':
      return <Package {...iconProps} />
    case 'retail':
      return <ShoppingCart {...iconProps} />
    case 'medical':
      return <Cross {...iconProps} />
    case 'other':
      return <Building {...iconProps} />
    default:
      return <MapPin {...iconProps} />
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Places App - Revamped with infinite scroll and geolocation sorting
 */
export function PlacesApp({ 
  onClose, 
  userId,
  serverUrl = '',
  accessToken,
  onMessagePlace,
  currentUserName,
  currentUserAvatar,
  onManageOrganization
}: MiniAppProps & {
  onMessagePlace?: (ownerId: string, placeId: string, placeName: string) => void
  currentUserName?: string
  currentUserAvatar?: string | null
  onManageOrganization?: () => void
}) {
  const metadata = getMiniAppMetadata('places')!
  const [places, setPlaces] = useState<Place[]>([])
  const [displayedPlaces, setDisplayedPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  
  // Game-like screen flow states
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'category' | 'country' | 'name' | 'location-request' | 'results' | 'nearby' | 'validation'>('welcome')
  const [searchPath, setSearchPath] = useState<'specific' | 'nearby' | null>(null)
  const [budMessage, setBudMessage] = useState('Hey there! Looking for hemp places?')
  const [hoveredButton, setHoveredButton] = useState<'specific' | 'nearby' | null>(null)
  const [detectedLocation, setDetectedLocation] = useState<string>('')
  const [manualCountry, setManualCountry] = useState<string>('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [newlyAddedPlace, setNewlyAddedPlace] = useState<Place | null>(null)
  
  // Infinite scroll
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const ITEMS_PER_PAGE = 10

  // Request user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setLocationPermission('granted')
          console.log('📍 User location obtained:', position.coords.latitude, position.coords.longitude)
        },
        () => {
          // User denied location permission - silently handle
          setLocationPermission('denied')
        }
      )
    }
  }, [])

  // Load all places - ONLY call this when showing results, NOT on mount
  const loadPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/places`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        let loadedPlaces = data.places || []
        
        // Calculate distances if user location is available
        if (userLocation) {
          loadedPlaces = loadedPlaces.map((place: Place) => {
            if (place.latitude && place.longitude) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                place.latitude,
                place.longitude
              )
              return { ...place, distance }
            }
            return { ...place, distance: Infinity } // Places without coords go to end
          })
          
          // Sort by distance
          loadedPlaces.sort((a: Place, b: Place) => {
            const distA = a.distance ?? Infinity
            const distB = b.distance ?? Infinity
            return distA - distB
          })
          
          console.log('📍 Places sorted by distance')
        }
        
        setPlaces(loadedPlaces)
        console.log('✅ Loaded places:', loadedPlaces.length)
      } else {
        console.error('❌ Failed to load places, status:', response.status)
      }
    } catch (error) {
      console.error('❌ Error loading places:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load places when transitioning to results screen
  useEffect(() => {
    if (currentScreen === 'results' || currentScreen === 'nearby') {
      if (places.length === 0) {
        loadPlaces()
      }
    }
  }, [currentScreen])

  // Get unique countries - filter out undefined/null values
  const countries = Array.from(new Set(places.filter(p => p && p.country).map(p => p.country))).sort()

  // Filter places based on search and filters - MEMOIZED to prevent infinite loops
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesSearch = !searchQuery || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.city?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory
      const matchesCountry = selectedCountry === 'all' || place.country === selectedCountry
      
      return matchesSearch && matchesCategory && matchesCountry
    })
  }, [places, searchQuery, selectedCategory, selectedCountry])

  // Update displayed places when filters change or page changes
  useEffect(() => {
    const endIndex = page * ITEMS_PER_PAGE
    const newDisplayed = filteredPlaces.slice(0, endIndex)
    setDisplayedPlaces(newDisplayed)
    setHasMore(endIndex < filteredPlaces.length)
  }, [filteredPlaces, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory, selectedCountry])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasMore || loading) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    
    // Load more when user is 300px from bottom
    if (scrollHeight - scrollTop - clientHeight < 300) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, loading])

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Handle screen transitions and BUD messages
  const handleSpecificSearch = () => {
    setSearchPath('specific')
    setCurrentScreen('category')
    setBudMessage('Great! What type of place are you looking for?')
  }

  const handleNearbySearch = async () => {
    setSearchPath('nearby')
    setCurrentScreen('location-request')
    setBudMessage('Allow location sharing to find places near you!')
    
    // Auto-detect location in background
    if (navigator.geolocation && !userLocation) {
      setIsDetectingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setLocationPermission('granted')
          
          // Reverse geocode to get country name
          try {
            // For demo, we'll just set a generic detected location message
            setDetectedLocation(`📍 Location detected`)
          } catch (error) {
            setDetectedLocation(`📍 Lat: ${position.coords.latitude.toFixed(2)}, Lon: ${position.coords.longitude.toFixed(2)}`)
          }
          
          setIsDetectingLocation(false)
        },
        () => {
          setLocationPermission('denied')
          setIsDetectingLocation(false)
        }
      )
    } else if (userLocation) {
      setDetectedLocation(`📍 Location detected`)
    }
  }

  const handleWelcomeChoice = (choice: 'specific' | 'nearby') => {
    if (choice === 'specific') {
      handleSpecificSearch()
    } else {
      handleNearbySearch()
    }
  }

  const handleCategorySelected = (category: string) => {
    setSelectedCategory(category)
    setCurrentScreen('country')
    setBudMessage(`${category}! Now, which country are you interested in?`)
  }

  const handleCountrySelected = (country: string) => {
    setSelectedCountry(country)
    setCurrentScreen('results')
    setBudMessage(`Here's what I found for you!`)
  }

  const handleSearchByName = () => {
    setCurrentScreen('name')
    setBudMessage('What place name are you looking for?')
  }

  const resetSearch = () => {
    setCurrentScreen('welcome')
    setSearchPath(null)
    setSelectedCategory('all')
    setSelectedCountry('all')
    setSearchQuery('')
    setBudMessage('Hey there! Looking for hemp places?')
  }

  // Render screen based on current state
  const renderScreen = () => {
    // Welcome Screen - BUD asks initial question
    if (currentScreen === 'welcome') {
      // Dynamic BUD message based on button hover
      const displayMessage = hoveredButton === 'specific' 
        ? "I'll help you find it!"
        : hoveredButton === 'nearby' 
        ? "Show me the closest places!"
        : budMessage

      return (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 relative"
        >
          {/* Close Button - X Icon Top Right */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute z-50 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
            style={{ top: 'calc(var(--nav-top) + 1rem)', right: '1.5rem' }}
            title="Close Places"
          >
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </motion.button>

          {/* BUD Character with speech bubble - ABSOLUTE POSITIONED to not affect layout */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="pointer-events-auto">
                <BudCharacter size="xl" expression="happy" mood="default" animate={true} />
              </div>
              
              {/* Speech bubble below BUD - Comic style with animation */}
              <motion.div
                key={displayMessage} // Re-animate on message change
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring",
                  damping: 20,
                  stiffness: 300
                }}
                className="mt-6 max-w-sm pointer-events-auto"
              >
                <div className="relative bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-100/10 backdrop-blur-xl border-3 border-pink-400/50 rounded-3xl p-5 shadow-2xl shadow-pink-500/20">
                  {/* Comic-style speech bubble tail */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    {/* Outer border tail */}
                    <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[16px] border-b-pink-400/50" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {/* Inner fill tail */}
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-pink-100/10 dark:border-b-pink-900/20" />
                  </div>
                  
                  <p className="text-white text-center leading-relaxed font-bold text-lg tracking-wide">
                    {displayMessage}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons - Fixed position, not affected by BUD */}
          <div className="flex flex-col gap-4 w-full max-w-md mt-64">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredButton('specific')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleWelcomeChoice('specific')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-6 px-8 text-xl font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all border-2 border-cyan-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Search className="w-8 h-8" />
                  <span>Looking for something specific</span>
                </div>
                <ChevronDown className="w-6 h-6 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredButton('nearby')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleWelcomeChoice('nearby')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white py-6 px-8 text-xl font-bold shadow-2xl hover:shadow-violet-500/50 transition-all border-2 border-violet-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MapPin className="w-8 h-8" />
                  <span>What's nearby</span>
                </div>
                <ChevronDown className="w-6 h-6 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      )
    }

    // Category Selection Screen
    if (currentScreen === 'category') {
      const categories = [
        { id: 'agriculture', name: 'Agriculture', icon: Wheat, color: 'from-green-500 to-emerald-600' },
        { id: 'processing', name: 'Processing', icon: Factory, color: 'from-blue-500 to-cyan-600' },
        { id: 'storage', name: 'Storage', icon: Package, color: 'from-purple-500 to-violet-600' },
        { id: 'retail', name: 'Retail', icon: ShoppingCart, color: 'from-pink-500 to-rose-600' },
        { id: 'medical', name: 'Medical', icon: Cross, color: 'from-red-500 to-orange-600' },
        { id: 'other', name: 'Other', icon: Building, color: 'from-slate-500 to-gray-600' },
      ]

      return (
        <motion.div
          key="category"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex-1 flex flex-col p-6"
        >
          {/* Navigation Header - Back & Close Buttons */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            {/* Back Button - Top Left */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentScreen('welcome')
                setSearchPath(null)
                setBudMessage('Hey there! Looking for hemp places?')
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Back"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </motion.button>

            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Close Places"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          </div>

          {/* BUD Message */}
          <div className="mb-6 mt-16">
            <div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-100/10 backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4 shadow-xl">
              <BudCharacter size="md" expression="thinking" mood="default" animate={true} className="flex-shrink-0" />
              <p className="text-white font-medium">{budMessage}</p>
            </div>
          </div>

          {/* Category Grid */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="grid grid-cols-2 gap-4 pb-6">
              {categories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCategorySelected(category.id)}
                    className={`relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${category.color} text-white shadow-xl hover:shadow-2xl transition-all border-2 border-white/20 min-h-[140px]`}
                  >
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-lg">{category.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )
    }

    // Country Selection Screen  
    if (currentScreen === 'country') {
      return (
        <motion.div
          key="country"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex-1 flex flex-col p-6"
        >
          {/* Navigation Header - Back & Close Buttons */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            {/* Back Button - Top Left */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentScreen('category')
                setSelectedCategory('all')
                setBudMessage('Great! What type of place are you looking for?')
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Back"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </motion.button>

            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Close Places"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          </div>

          {/* BUD Message */}
          <div className="mb-6 mt-16">
            <div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-100/10 backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4 shadow-xl">
              <BudCharacter size="md" expression="thinking" mood="default" animate={true} className="flex-shrink-0" />
              <p className="text-white font-medium">{budMessage}</p>
            </div>
          </div>

          {/* Country List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 pb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCountrySelected('all')}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/30 text-white hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">All Countries</span>
                  <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                </div>
              </motion.button>
              
              {countries.map((country, index) => (
                <motion.button
                  key={country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCountrySelected(country)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-cyan-400/20 text-white hover:border-cyan-400/50 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>{country}</span>
                    <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )
    }

    // Name Search Screen
    if (currentScreen === 'name') {
      return (
        <motion.div
          key="name"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex-1 flex flex-col p-6"
        >
          {/* Navigation Header - Back & Close Buttons */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            {/* Back Button - Top Left */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentScreen('category')
                setSearchQuery('')
                setBudMessage('Great! What type of place are you looking for?')
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Back"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </motion.button>

            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Close Places"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          </div>

          {/* BUD Message */}
          <div className="mb-6 mt-16">
            <div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-100/10 backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4 shadow-xl">
              <BudCharacter size="md" expression="thinking" mood="default" animate={true} className="flex-shrink-0" />
              <p className="text-white font-medium">{budMessage}</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
            <input
              type="text"
              placeholder="Type place name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  setCurrentScreen('results')
                  setBudMessage('Here\'s what I found!')
                }
              }}
              className="w-full pl-14 pr-4 py-4 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl text-white text-lg placeholder:text-slate-400 focus:border-cyan-500/50 focus:outline-none"
              autoFocus
            />
          </div>

          <Button
            onClick={() => {
              if (searchQuery) {
                setCurrentScreen('results')
                setBudMessage('Here\'s what I found!')
              }
            }}
            disabled={!searchQuery}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-4 text-lg"
          >
            Search
          </Button>
        </motion.div>
      )
    }

    // Location Request Screen
    if (currentScreen === 'location-request') {
      const countryList = ['United States', 'France', 'Thailand', 'Canada', 'Portugal', 'Spain', 'Germany', 'Italy', 'Netherlands', 'Belgium']

      return (
        <motion.div
          key="location-request"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8"
        >
          {/* Navigation Header - Back & Close Buttons */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
            {/* Back Button - Top Left */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentScreen('welcome')
                setSearchPath(null)
                setBudMessage('Hey there! Looking for hemp places?')
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Back"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </motion.button>

            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
              title="Close Places"
            >
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="w-full max-w-md flex flex-col items-center">
            {/* BUD Message - Only if helpful */}
            {isDetectingLocation && (
              <div className="mb-8">
                <div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-100/10 backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4 shadow-xl">
                  <BudCharacter size="md" expression="thinking" mood="default" animate={true} className="flex-shrink-0" />
                  <p className="text-white font-medium">Detecting your location...</p>
                </div>
              </div>
            )}

            {/* Location Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-2xl" />
                <div className="relative bg-gradient-to-br from-cyan-500/20 to-teal-500/20 p-8 rounded-full border-2 border-cyan-400/30">
                  <MapPin className="w-16 h-16 text-cyan-400" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-3 text-center"
            >
              Find Places Nearby
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 text-center mb-8"
            >
              {isDetectingLocation 
                ? 'Detecting your location...' 
                : detectedLocation 
                ? 'Location detected! Click Go to see nearby places.' 
                : 'Select your country to find places near you.'
              }
            </motion.p>

            {/* Location Display or Country Input */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full mb-6"
            >
              {isDetectingLocation ? (
                /* Loading State */
                <div className="w-full p-6 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/20 border-t-cyan-500" />
                </div>
              ) : detectedLocation ? (
                /* Location Detected - Read-only Field */
                <div className="w-full p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-emerald-300 text-sm">Location detected</p>
                      <p className="text-white font-medium">{detectedLocation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Location - Country Dropdown */
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select your country
                  </label>
                  <select
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    className="w-full p-4 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl text-white text-lg focus:border-cyan-500/50 focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5rem'
                    }}
                  >
                    <option value="" className="bg-slate-900">Choose a country...</option>
                    {countryList.map(country => (
                      <option key={country} value={country} className="bg-slate-900">
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>

            {/* Go Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!detectedLocation && !manualCountry}
              onClick={() => {
                if (detectedLocation) {
                  // Location detected - proceed with geolocation
                  setCurrentScreen('nearby')
                  setBudMessage('Found some great places nearby!')
                } else if (manualCountry) {
                  // Manual country selected - filter by country
                  setSelectedCountry(manualCountry)
                  setCurrentScreen('results')
                  setBudMessage(`Here's what I found in ${manualCountry}!`)
                }
              }}
              className="w-full py-6 px-8 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all border-2 border-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isDetectingLocation ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-white/20 border-t-white" />
                  <span>Detecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>Go</span>
                  <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
                </div>
              )}
            </motion.button>

            {/* Alternative Option */}
            {!isDetectingLocation && !detectedLocation && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-400 text-sm text-center mt-6"
              >
                Allow location access in your browser for automatic detection
              </motion.p>
            )}
          </div>
        </motion.div>
      )
    }

    // Validation Screen - Place successfully added
    if (currentScreen === 'validation' && newlyAddedPlace) {
      return (
        <motion.div
          key="validation"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col h-full"
        >
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border-b-2 border-emerald-400/20 p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8">
            {/* Success Message */}
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-3xl font-black text-white">
                Place Added Successfully!
              </h2>
              <p className="text-lg text-emerald-300">
                Your place "{newlyAddedPlace.name}" is now pending validation by our team.
              </p>
              <p className="text-sm text-slate-400">
                We'll review it and make it visible to the community soon.
              </p>
            </div>

            {/* Place Preview Card */}
            <div className="w-full max-w-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(newlyAddedPlace.category, "w-6 h-6 text-emerald-400")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{newlyAddedPlace.name}</h3>
                  <p className="text-sm text-slate-400 capitalize">{newlyAddedPlace.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              {newlyAddedPlace.description && (
                <p className="text-sm text-slate-300">{newlyAddedPlace.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md space-y-3">
              {onManageOrganization && (
                <Button
                  onClick={() => {
                    onManageOrganization()
                    onClose()
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-black shadow-lg shadow-emerald-500/30"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Manage My Organizations
                </Button>
              )}
              
              <Button
                onClick={() => setCurrentScreen('welcome')}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 py-6 text-lg font-black"
              >
                Add Another Place
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white py-6"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )
    }

    // Results Screen (nearby or filtered results)
    if (currentScreen === 'results' || currentScreen === 'nearby') {
      return (
        <motion.div
          key="results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Header with Pin Icon in Center */}
          <div className="relative bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border-b-2 border-emerald-400/20">
            {/* Back & Close Buttons */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
              {/* Back Button - Top Left */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetSearch}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
                title="New Search"
              >
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </motion.button>

              {/* Close Button - Top Right */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center"
                title="Close"
              >
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </motion.button>
            </div>

            {/* Center Pin Icon */}
            <div className="flex flex-col items-center justify-center py-8 pt-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border-2 border-emerald-400/30"
              >
                <MapPin className="w-12 h-12 text-emerald-300" strokeWidth={2.5} />
              </motion.div>
              {displayedPlaces.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-emerald-200 mt-3 text-sm"
                >
                  {displayedPlaces.length} place{displayedPlaces.length !== 1 ? 's' : ''} found
                </motion.p>
              )}
            </div>
          </div>

          {/* Scrollable Results */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4">
              {loading && displayedPlaces.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500" />
                  <p className="text-slate-400 mt-4">Loading places...</p>
                </div>
              ) : displayedPlaces.length === 0 ? (
                // Empty state - just show message, BUD cards will be at bottom
                <div className="space-y-4 py-8">
                  <div className="text-center mb-8">
                    <p className="text-slate-400 text-lg">No places found</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {displayedPlaces.map((place, index) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedPlace(place)}
                        className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-cyan-500/20 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer"
                      >
                        {/* Image/Logo */}
                        {(place.logo_url || place.photos?.[0] || place.company?.logo_url) && (
                          <div className="h-40 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-slate-900/50">
                            <img
                              src={place.logo_url || place.photos?.[0] || place.company?.logo_url}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-2">{place.name}</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={`bg-gradient-to-r ${CATEGORY_COLORS[place.category as keyof typeof CATEGORY_COLORS]} text-white border-0 flex items-center gap-1.5 text-xs`}>
                                  {getCategoryIcon(place.category, "w-3 h-3")}
                                  <span className="capitalize">{place.category}</span>
                                </Badge>
                                {place.distance !== undefined && place.distance !== Infinity && (
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs">
                                    📍 {place.distance < 1 
                                      ? `${Math.round(place.distance * 1000)}m` 
                                      : `${place.distance.toFixed(1)}km`
                                    }
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          {place.description && (
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                              {place.description}
                            </p>
                          )}
                          
                          {/* Location */}
                          <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span className="truncate">
                              {[place.city, place.state_province, place.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {place.website && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(place.website, '_blank')
                                }}
                              >
                                <GlobeIcon className="w-3 h-3" />
                                Website
                              </Button>
                            )}
                            {place.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = `tel:${place.phone}`
                                }}
                              >
                                <Phone className="w-3 h-3" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Loading more indicator */}
                  {hasMore && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/20 border-t-cyan-500" />
                      <p className="text-slate-400 mt-2 text-sm">Loading more...</p>
                    </div>
                  )}
                </>
              )}

              {/* BUD Card at Bottom - Show ONE random action */}
              <div className="mt-8 pb-6">
                {/* Randomly show either "Make a new search" or "Add a new place" */}
                {Math.random() < 0.5 ? (
                  // BUD Card 1: Make a new search
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={resetSearch}
                    className="bg-gradient-to-br from-pink-900/30 via-rose-900/30 to-pink-900/30 backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-5 shadow-xl cursor-pointer hover:shadow-2xl hover:shadow-pink-500/30 hover:border-pink-400/60 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <BudCharacter 
                        size="md" 
                        expression="curious" 
                        mood="default" 
                        animate={true} 
                        className="flex-shrink-0" 
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg">Make a new search?</p>
                        <p className="text-pink-200 text-sm mt-1">Let me help you find something else!</p>
                      </div>
                      <Search className="w-6 h-6 text-pink-300 flex-shrink-0" />
                    </div>
                  </motion.div>
                ) : (
                  // BUD Card 2: Add a new place
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setIsAddPlaceModalOpen(true)}
                    className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-emerald-900/30 backdrop-blur-xl border-2 border-emerald-400/40 rounded-2xl p-5 shadow-xl cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/60 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <BudCharacter 
                        size="md" 
                        expression="happy" 
                        mood="default" 
                        animate={true} 
                        className="flex-shrink-0" 
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg">Add a new place you love</p>
                        <p className="text-emerald-200 text-sm mt-1">Share your favorite hemp spot!</p>
                      </div>
                      <Plus className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    return null
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      skipLoading={true}
      showWelcomeFirst={false}
    >
      {/* Places App - Emerald/Teal Gradient Theme */}
      <div className="h-full flex flex-col bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 relative">
        {renderScreen()}

        {/* Place Detail Modal - Overlays everything including navbars */}
        <AnimatePresence>
          {selectedPlace && (
            <PlaceDetailModal
              place={selectedPlace}
              onClose={() => setSelectedPlace(null)}
              onMessage={
                onMessagePlace && selectedPlace.created_by
                  ? () => {
                      onMessagePlace(
                        selectedPlace.created_by,
                        selectedPlace.id,
                        selectedPlace.name
                      )
                      setSelectedPlace(null)
                    }
                  : undefined
              }
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
            />
          )}
        </AnimatePresence>

        {/* Add Place Modal - Overlays everything including navbars */}
        <AnimatePresence>
          {isAddPlaceModalOpen && (
            <AddPlaceModal
              isOpen={isAddPlaceModalOpen}
              onClose={() => setIsAddPlaceModalOpen(false)}
              onPlaceAdded={(newPlace) => {
                setPlaces((prev) => [newPlace, ...prev])
                setNewlyAddedPlace(newPlace)
                setIsAddPlaceModalOpen(false)
                setCurrentScreen('validation')
              }}
              userId={userId}
              serverUrl={serverUrl}
              accessToken={accessToken}
            />
          )}
        </AnimatePresence>
      </div>
    </MiniAppContainer>
  )
}