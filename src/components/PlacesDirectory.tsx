import { useState, useEffect } from 'react'
import { MapPin, Search, Filter, Building2, ArrowLeft, ExternalLink, Phone, Mail, Globe as GlobeIcon, Calendar, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'

interface PlacesDirectoryProps {
  serverUrl: string
  onBack: () => void
  onViewOnGlobe?: () => void
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
}

const CATEGORY_COLORS = {
  agriculture: 'from-green-500 to-emerald-600',
  processing: 'from-blue-500 to-cyan-600',
  storage: 'from-purple-500 to-violet-600',
  retail: 'from-pink-500 to-rose-600',
  medical: 'from-red-500 to-orange-600',
  other: 'from-slate-500 to-gray-600',
}

const CATEGORY_ICONS = {
  agriculture: '🌾',
  processing: '🏭',
  storage: '📦',
  retail: '🛒',
  medical: '🏥',
  other: '🏢',
}

export function PlacesDirectory({ serverUrl, onBack, onViewOnGlobe }: PlacesDirectoryProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  
  // Stats
  const [stats, setStats] = useState({
    total_places: 0,
    total_hectares: 0,
    by_category: {} as any
  })

  useEffect(() => {
    fetchPlaces()
    fetchStats()
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

  const fetchStats = async () => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info')
      const response = await fetch(`${serverUrl}/places/stats`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/20 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-pink-900/95 via-rose-900/95 to-pink-900/95 backdrop-blur-xl border-b border-pink-500/30 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="gap-2 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Hemp Places Directory</h1>
                    <p className="text-sm text-pink-200">
                      Discover hemp farms, shops, factories & more worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {onViewOnGlobe && (
              <Button
                onClick={onViewOnGlobe}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              >
                <GlobeIcon className="w-4 h-4" />
                View on 3D Globe
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 border-b border-pink-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{stats.total_places}</div>
              <div className="text-xs text-pink-200">Total Places</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.total_hectares.toFixed(0)}</div>
              <div className="text-xs text-green-200">Hectares (Agriculture)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{countries.length}</div>
              <div className="text-xs text-blue-200">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(stats.by_category || {}).length}
              </div>
              <div className="text-xs text-purple-200">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-pink-500/30 text-white placeholder:text-slate-400"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-pink-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-pink-500/30 rounded-md text-white"
            >
              <option value="all">All Categories</option>
              <option value="agriculture">🌾 Agriculture</option>
              <option value="processing">🏭 Processing</option>
              <option value="storage">📦 Storage</option>
              <option value="retail">🛒 Retail</option>
              <option value="medical">🏥 Medical</option>
              <option value="other">🏢 Other</option>
            </select>
          </div>
          
          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-pink-500/30 rounded-md text-white"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredPlaces.length} of {places.length} places
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500/20 border-t-pink-500" />
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
                className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-pink-500/20 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-pink-500/20"
              >
                {/* Image/Logo */}
                {(place.logo_url || place.photos?.[0] || place.company?.logo_url) && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-pink-900/20 to-slate-900/50">
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
                        <Badge className={`bg-gradient-to-r ${CATEGORY_COLORS[place.category as keyof typeof CATEGORY_COLORS]} text-white border-0`}>
                          {CATEGORY_ICONS[place.category as keyof typeof CATEGORY_ICONS]} {place.category}
                        </Badge>
                        <Badge variant="outline" className="border-pink-500/50 text-pink-400">
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
                      <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
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
                        <span className="text-green-400">🌾</span>
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
                    {place.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
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
    </div>
  )
}
