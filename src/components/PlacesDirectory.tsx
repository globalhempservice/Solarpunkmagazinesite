import { useState, useEffect } from 'react'
import { MapPin, Search, Filter, Building2, ArrowLeft, ExternalLink, Phone, Mail, Globe as GlobeIcon, Calendar, Users, List, Grid3x3, Plus, Wheat, Factory, Package, ShoppingCart, Cross, Building, Lock, Star, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'
import { PlaceDetailModal } from './places/PlaceDetailModal'
import { AddPlaceModal } from './places/AddPlaceModal'

interface PlacesDirectoryProps {
  serverUrl: string
  onBack: () => void
  onViewOnGlobe?: () => void
  onMessagePlace?: (ownerId: string, placeId: string, placeName: string) => void
  currentUserId?: string | null // Current logged-in user ID
  currentUserName?: string
  currentUserAvatar?: string | null
  accessToken?: string | null
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
  created_by?: string // Owner user ID
}

const CATEGORY_COLORS = {
  agriculture: 'from-green-500 to-emerald-600',
  processing: 'from-blue-500 to-cyan-600',
  storage: 'from-purple-500 to-violet-600',
  retail: 'from-pink-500 to-rose-600',
  medical: 'from-red-500 to-orange-600',
  other: 'from-slate-500 to-gray-600',
}

// Map categories to Lucide React icons
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

export function PlacesDirectory({ serverUrl, onBack, onViewOnGlobe, onMessagePlace, currentUserId, currentUserName, currentUserAvatar, accessToken }: PlacesDirectoryProps) {
  const [view, setView] = useState<'home' | 'browse'>('home')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [autoOpenMessaging, setAutoOpenMessaging] = useState(false)
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false)

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/places`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlaces(data.places || [])
      }
    } catch (error) {
      console.error('Error fetching places:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique countries
  const countries = Array.from(new Set(places.map(p => p.country))).sort()

  // Filter places
  const filteredPlaces = places.filter(place => {
    const matchesSearch = !searchQuery || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.city?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory
    const matchesCountry = selectedCountry === 'all' || place.country === selectedCountry
    
    return matchesSearch && matchesCategory && matchesCountry
  })

  // HOME VIEW - Hub Landing Page
  if (view === 'home') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 pt-16">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.3) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            
            <div className="relative z-10 pt-20 pb-16">
              {/* Hero Content */}
              <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="inline-block"
                >
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-4 border-cyan-400/50">
                    <MapPin className="w-14 h-14 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-blue-300 mb-4">
                    Hemp Places Directory
                  </h1>
                  <p className="text-xl text-cyan-200/80 max-w-2xl mx-auto">
                    Discover hemp farms, shops, factories & more worldwide
                  </p>
                </motion.div>

                {/* Quick Stats Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center gap-3"
                >
                  <Badge className="bg-cyan-500/20 backdrop-blur-sm text-cyan-200 border-2 border-cyan-400/30 px-4 py-2 text-sm">
                    {places.length} Places
                  </Badge>
                  <Badge className="bg-teal-500/20 backdrop-blur-sm text-teal-200 border-2 border-teal-400/30 px-4 py-2 text-sm">
                    {countries.length} Countries
                  </Badge>
                  <Badge className="bg-blue-500/20 backdrop-blur-sm text-blue-200 border-2 border-blue-400/30 px-4 py-2 text-sm">
                    6 Categories
                  </Badge>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Action Cards Grid - 4 Cards Only */}
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* 1. Add Your Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddPlaceModalOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl p-8 cursor-pointer transition-all hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Add Your Place</h3>
                    <p className="text-purple-200/70">
                      Submit your hemp farm, shop, or facility to the global directory
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 2. Claim a Listing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-8 cursor-pointer transition-all hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/20"
              >
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Star className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Claim a Listing</h3>
                    <p className="text-amber-200/70">
                      Own or manage a place already listed? Claim it to update and verify
                    </p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </motion.div>

              {/* 3. Browse Directory */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('browse')}
                className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-teal-500/10 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-8 cursor-pointer transition-all hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <List className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Browse Directory</h3>
                    <p className="text-cyan-200/70">
                      Search and filter through all registered hemp places worldwide
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 4. 3D Globe View - LOCKED FOR PRO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.01 }}
                className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl border-2 border-emerald-400/30 rounded-2xl p-8 cursor-not-allowed transition-all opacity-75"
              >
                {/* Lock Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-2xl">
                      <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-sm font-black px-4 py-1">
                      PRO ONLY
                    </Badge>
                  </div>
                </div>
                
                <div className="relative space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                    <GlobeIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">3D Globe View</h3>
                    <p className="text-emerald-200/70">
                      Explore hemp places on an interactive 3D world map
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Add Place Modal - Available in home view */}
        <AddPlaceModal
          isOpen={isAddPlaceModalOpen}
          onClose={() => setIsAddPlaceModalOpen(false)}
          serverUrl={serverUrl}
          accessToken={accessToken || undefined}
          onPlaceAdded={fetchPlaces}
        />
      </>
    )
  }

  // BROWSE VIEW - Search & Filter with Cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 pt-16">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gradient-to-r from-cyan-900/95 via-teal-900/95 to-cyan-900/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setView('home')}
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Browse Directory</h1>
              <p className="text-sm text-cyan-200">
                {filteredPlaces.length} of {places.length} places
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-400 focus:border-cyan-500/50"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-md text-white focus:border-cyan-500/50 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="agriculture">Agriculture</option>
              <option value="processing">Processing</option>
              <option value="storage">Storage</option>
              <option value="retail">Retail</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-md text-white focus:border-cyan-500/50 outline-none"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500" />
            <p className="text-slate-400 mt-4">Loading places...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No places found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPlace(place)}
                className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-cyan-500/20 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer"
              >
                {/* Image/Logo */}
                {(place.logo_url || place.photos?.[0] || place.company?.logo_url) && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-slate-900/50">
                    <img
                      src={place.logo_url || place.photos?.[0] || place.company?.logo_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`bg-gradient-to-r ${CATEGORY_COLORS[place.category as keyof typeof CATEGORY_COLORS]} text-white border-0 flex items-center gap-1.5`}>
                          {getCategoryIcon(place.category, "w-3.5 h-3.5")}
                          <span className="capitalize">{place.category}</span>
                        </Badge>
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                          {place.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {place.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {place.description}
                    </p>
                  )}
                  
                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">
                        {[place.city, place.state_province, place.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    
                    {/* Company */}
                    {place.company && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{place.company.name}</span>
                      </div>
                    )}
                    
                    {/* Year Established */}
                    {place.year_established && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Est. {place.year_established}</span>
                      </div>
                    )}
                    
                    {/* Manager/Owner */}
                    {(place.manager_name || place.owner_name) && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{place.manager_name || place.owner_name}</span>
                      </div>
                    )}
                    
                    {/* Area (for farms) */}
                    {place.area_hectares && (
                      <div className="flex items-center gap-2 text-sm text-green-300">
                        <Wheat className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{place.area_hectares.toFixed(2)} hectares</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Specialties */}
                  {place.specialties && place.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {place.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-slate-600 text-slate-400"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Contact Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
                    {/* Message Button - Only show if user is NOT the owner */}
                    {place.created_by && onMessagePlace && place.created_by !== currentUserId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => {
                          // Open the detail modal (which has inline messaging)
                          setSelectedPlace(place)
                          setAutoOpenMessaging(true)
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message Place
                      </Button>
                    )}
                    {place.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => window.open(place.website, '_blank')}
                      >
                        <GlobeIcon className="w-4 h-4" />
                        Website
                      </Button>
                    )}
                    {place.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => window.location.href = `mailto:${place.email}`}
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                    )}
                    {place.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={() => window.location.href = `tel:${place.phone}`}
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          isOpen={!!selectedPlace}
          onClose={() => {
            setSelectedPlace(null)
            setAutoOpenMessaging(false) // Reset the flag
          }}
          onMessagePlace={onMessagePlace}
          currentUserId={currentUserId || undefined}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          serverUrl={serverUrl}
          accessToken={accessToken || undefined}
          autoOpenMessaging={autoOpenMessaging}
        />
      )}

      {/* Add Place Modal */}
      <AddPlaceModal
        isOpen={isAddPlaceModalOpen}
        onClose={() => setIsAddPlaceModalOpen(false)}
        serverUrl={serverUrl}
        accessToken={accessToken || undefined}
        onPlaceAdded={fetchPlaces}
      />
    </div>
  )
}