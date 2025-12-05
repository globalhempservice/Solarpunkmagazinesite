import { useState, useEffect } from 'react'
import { MapPin, Plus, Search, X, Edit2, Trash2, Building2, Store, Factory, Warehouse, CheckCircle, Clock, AlertCircle, Database, Link as LinkIcon, Navigation, Loader2, Globe2, MapPinned } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { COUNTRIES, searchCities, getCitiesForCountry } from '../utils/countries-cities'

interface OrganizationPlacesTabProps {
  organizationId: string
  accessToken: string | null
  serverUrl: string
  userRole: string // 'owner', 'admin', 'member'
}

interface PlaceRelationship {
  id: string
  organization_id: string
  place_id: string
  relationship_type: string
  status: 'pending' | 'verified' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
  place: {
    id: string
    name: string
    type: string
    category: string
    description?: string
    city: string
    state_province?: string
    country: string
    latitude?: number
    longitude?: number
  }
}

interface Place {
  id: string
  name: string
  type: string
  category: string
  city: string
  state_province?: string
  country: string
  latitude?: number
  longitude?: number
  status?: string
}

// Hemp industry place types
const PLACE_TYPES = [
  'farm',
  'dispensary',
  'shop',
  'factory',
  'warehouse',
  'office',
  'lab',
  'processor',
  'distributor',
  'retailer',
  'cultivation_facility',
  'extraction_facility',
  'testing_lab',
  'grow_house',
  'co-op',
  'collective'
]

// Place categories
const PLACE_CATEGORIES = [
  'cultivation',
  'processing',
  'manufacturing',
  'retail',
  'distribution',
  'testing',
  'research',
  'office',
  'storage',
  'other'
]

// Relationship type configurations
const RELATIONSHIP_TYPES = [
  { value: 'owns', label: 'Owns', icon: Building2, color: 'emerald', description: 'Organization owns this place' },
  { value: 'distributed_at', label: 'Distributed At', icon: Store, color: 'blue', description: 'Products distributed at this location' },
  { value: 'supplies_from', label: 'Supplies From', icon: Factory, color: 'purple', description: 'Organization sources supplies from here' },
  { value: 'manufactures_at', label: 'Manufactures At', icon: Factory, color: 'orange', description: 'Manufacturing happens at this facility' },
  { value: 'partner', label: 'Partner', icon: Building2, color: 'amber', description: 'Business partner location' },
  { value: 'retail_outlet', label: 'Retail Outlet', icon: Store, color: 'pink', description: 'Retail store or outlet' },
  { value: 'warehouse', label: 'Warehouse', icon: Warehouse, color: 'gray', description: 'Storage or warehouse facility' },
  { value: 'office', label: 'Office', icon: Building2, color: 'indigo', description: 'Corporate or administrative office' },
  { value: 'customer', label: 'Customer', icon: Store, color: 'teal', description: 'This place is a customer' },
  { value: 'supplier', label: 'Supplier', icon: Factory, color: 'cyan', description: 'This place supplies to organization' },
]

export function OrganizationPlacesTab({ organizationId, accessToken, serverUrl, userRole }: OrganizationPlacesTabProps) {
  const [relationships, setRelationships] = useState<PlaceRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'relationships' | 'create'>('relationships')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedRelationType, setSelectedRelationType] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Simplified create place form state
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'shop',
    category: 'retail',
    description: '',
    google_maps_url: '',
    address: '',
    city: '',
    state_province: '',
    country: '',
    postal_code: '',
    phone: '',
    website: ''
  })
  
  // Google Maps URL parser state
  const [parsingMapsUrl, setParsingMapsUrl] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  
  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const canManage = userRole === 'owner' || userRole === 'admin'

  useEffect(() => {
    fetchRelationships()
  }, [organizationId])

  const fetchRelationships = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/places`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch place relationships')
      }

      const data = await response.json()
      setRelationships(data.relationships || [])
    } catch (error: any) {
      console.error('Error fetching place relationships:', error)
      // Don't show error toast if it's just an empty state
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        toast.error('Failed to load place relationships')
      }
      // Set empty array so UI still renders
      setRelationships([])
    } finally {
      setLoading(false)
    }
  }

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/places/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to search places')
      }

      const data = await response.json()
      setSearchResults(data.places || [])
    } catch (error: any) {
      console.error('Error searching places:', error)
      toast.error('Failed to search places')
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchPlaces(value)
  }

  const handleAddRelationship = async () => {
    if (!selectedPlace || !selectedRelationType) {
      toast.error('Please select a place and relationship type')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/places`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            place_id: selectedPlace.id,
            relationship_type: selectedRelationType,
            notes: notes || null
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create relationship')
      }

      toast.success('Place relationship added!')
      setShowAddModal(false)
      resetForm()
      fetchRelationships()
    } catch (error: any) {
      console.error('Error adding relationship:', error)
      toast.error(error.message || 'Failed to add relationship')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this place relationship?')) {
      return
    }

    try {
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/places/${relationshipId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete relationship')
      }

      toast.success('Place relationship removed')
      fetchRelationships()
    } catch (error: any) {
      console.error('Error deleting relationship:', error)
      toast.error('Failed to remove relationship')
    }
  }

  const parseGoogleMapsUrl = (url: string) => {
    try {
      // Try to extract coordinates from Google Maps URL
      // Format: https://www.google.com/maps/place/Name/@lat,lng,zoom
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coordMatch) {
        return {
          latitude: coordMatch[1],
          longitude: coordMatch[2]
        }
      }
      
      // Format: https://maps.google.com/?q=lat,lng
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (qMatch) {
        return {
          latitude: qMatch[1],
          longitude: qMatch[2]
        }
      }
    } catch (error) {
      console.error('Error parsing Google Maps URL:', error)
    }
    return null
  }

  const handleGoogleMapsUrlChange = (url: string) => {
    setNewPlace({ ...newPlace, google_maps_url: url })
    
    // Call backend parser for full extraction
    if (url && (url.includes('google.com/maps') || url.includes('maps.app.goo.gl'))) {
      parseGoogleMapsUrlViaBackend(url)
    }
  }
  
  // Parse Google Maps URL using backend API
  const parseGoogleMapsUrlViaBackend = async (url: string) => {
    if (!url) {
      return
    }
    
    // Basic validation before sending to backend
    const isGoogleMapsLink = url.includes('google.com/maps') || 
                             url.includes('maps.google.com') || 
                             url.includes('maps.app.goo.gl') || 
                             url.includes('goo.gl/maps')
    
    if (!isGoogleMapsLink) {
      console.log('❌ Not a Google Maps URL:', url)
      toast.error('Please provide a valid Google Maps link')
      return
    }
    
    try {
      setParsingMapsUrl(true)
      console.log('📤 Sending URL to backend:', url)
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Add authorization header if available
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      const response = await fetch(`${serverUrl}/places/parse-google-maps-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url })
      })
      
      console.log('📥 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Server error response:', errorData)
        throw new Error(errorData.details || errorData.error || errorData.message || 'Failed to parse Google Maps URL')
      }
      
      const { placeData } = await response.json()
      console.log('📍 Extracted data from Google Maps:', placeData)
      
      // Map country name to country code
      let countryCode = newPlace.country // Keep current if no match
      if (placeData.country) {
        const matchedCountry = COUNTRIES.find(c => 
          c.name.toLowerCase() === placeData.country.toLowerCase() ||
          c.code.toLowerCase() === placeData.country.toLowerCase()
        )
        if (matchedCountry) {
          countryCode = matchedCountry.code
        } else {
          console.warn('⚠️ Could not map country to country code:', placeData.country)
        }
      }
      
      // Auto-fill form with extracted data
      setNewPlace(prev => ({
        ...prev,
        name: placeData.name || prev.name,
        address: placeData.address || prev.address,
        city: placeData.city || prev.city,
        state_province: placeData.state_province || prev.state_province,
        country: countryCode,
        postal_code: placeData.postal_code || prev.postal_code,
        phone: placeData.phone || prev.phone,
        website: placeData.website || prev.website
      }))
      
      setExtractedData(placeData)
      
      // Show success message with what was extracted
      const extracted = []
      if (placeData.name) extracted.push('name')
      if (placeData.address) extracted.push('address')
      if (placeData.city) extracted.push('city')
      if (placeData.state_province) extracted.push('state/province')
      if (placeData.country) extracted.push('country')
      if (placeData.postal_code) extracted.push('postal code')
      if (placeData.phone) extracted.push('phone')
      if (placeData.website) extracted.push('website')
      if (placeData.latitude && placeData.longitude) extracted.push('coordinates')
      
      if (extracted.length > 0) {
        toast.success(`✅ Extracted: ${extracted.join(', ')}`)
      } else {
        toast.warning('⚠️ Could not extract data from this link. Please fill in the fields manually.')
      }
    } catch (error: any) {
      console.error('❌ Error parsing Google Maps URL:', error)
      toast.error(`Failed to extract data: ${error.message}`)
    } finally {
      setParsingMapsUrl(false)
    }
  }
  
  // Handle city search/autocomplete
  const handleCityChange = (value: string) => {
    setCityQuery(value)
    setNewPlace({ ...newPlace, city: value })
    
    // Search for city suggestions based on selected country
    if (newPlace.country && value.length >= 1) {
      const suggestions = searchCities(newPlace.country, value)
      setCitySuggestions(suggestions.slice(0, 10)) // Limit to 10 suggestions
      setShowCitySuggestions(suggestions.length > 0)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }
  
  // Handle country change - update city suggestions
  const handleCountryChange = (countryCode: string) => {
    setNewPlace({ ...newPlace, country: countryCode, city: '' })
    setCityQuery('')
    setCitySuggestions([])
    setShowCitySuggestions(false)
  }

  const handleCreatePlace = async () => {
    // Validation
    if (!newPlace.name || !newPlace.type || !newPlace.category || !newPlace.city || !newPlace.country) {
      toast.error('Please fill in all required fields (Name, Type, Category, City, Country)')
      return
    }

    try {
      setSubmitting(true)
      
      // Use coordinates from extractedData if available (from backend parser)
      let latitude = extractedData?.latitude || null
      let longitude = extractedData?.longitude || null
      
      // Fallback: try to extract from URL if we don't have coordinates yet
      if (!latitude || !longitude) {
        if (newPlace.google_maps_url) {
          const coords = parseGoogleMapsUrl(newPlace.google_maps_url)
          if (coords) {
            latitude = parseFloat(coords.latitude)
            longitude = parseFloat(coords.longitude)
          }
        }
      }
      
      // Validate we have coordinates
      if (!latitude || !longitude) {
        toast.error('⚠️ Location coordinates are required. Please provide a valid Google Maps link.')
        return
      }

      const response = await fetch(
        `${serverUrl}/places/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: newPlace.name,
            type: newPlace.type,
            category: newPlace.category,
            description: newPlace.description || null,
            address_line1: newPlace.address || null, // Map 'address' to 'address_line1'
            city: newPlace.city,
            state_province: newPlace.state_province || null,
            country: newPlace.country,
            postal_code: newPlace.postal_code || null,
            phone: newPlace.phone || null,
            website: newPlace.website || null,
            latitude,
            longitude,
            company_id: organizationId
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Create place error:', error)
        throw new Error(error.details || error.error || 'Failed to create place')
      }

      const data = await response.json()
      toast.success('✅ Place created successfully!')
      
      // Reset form
      setNewPlace({
        name: '',
        type: 'shop',
        category: 'retail',
        description: '',
        google_maps_url: '',
        address: '',
        city: '',
        state_province: '',
        country: '',
        postal_code: '',
        phone: '',
        website: ''
      })
      setExtractedData(null) // Reset extracted data
      
      // Show it in the add relationship modal
      setShowCreateModal(false)
      setSelectedPlace(data.place)
      setShowAddModal(true)
    } catch (error: any) {
      console.error('Error creating place:', error)
      toast.error(error.message || 'Failed to create place')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedPlace(null)
    setSelectedRelationType('')
    setNotes('')
    setSearchQuery('')
    setSearchResults([])
  }

  const getRelationshipConfig = (type: string) => {
    return RELATIONSHIP_TYPES.find(rt => rt.value === type) || RELATIONSHIP_TYPES[0]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xl text-white">Places Dashboard</h3>
          <p className="text-sm text-white/60 mt-1">
            Manage physical locations and their relationships
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {canManage && (
          <>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Place
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Add Place Relationship
            </Button>
          </>
        )}
      </div>

      {/* Place Relationships Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h4 className="font-black text-lg text-white">Place Relationships</h4>
        </div>

        {relationships.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-black text-lg text-white mb-2">No Place Relationships Yet</h3>
            <p className="text-white/60 mb-4">
              {canManage 
                ? 'Start building your location network by adding places'
                : 'This organization hasn\'t linked any places yet'
              }
            </p>
            {canManage && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Place
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relationships.map((rel) => {
              const config = getRelationshipConfig(rel.relationship_type)
              const Icon = config.icon

              return (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-${config.color}-500/20 border border-${config.color}-500/30`}>
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{rel.place.name}</h4>
                        <p className="text-sm text-white/60 truncate">
                          {rel.place.city}, {rel.place.country}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/30 text-xs`}>
                            {config.label}
                          </Badge>
                          {getStatusBadge(rel.status)}
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <Button
                        onClick={() => handleDeleteRelationship(rel.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {rel.notes && (
                    <p className="text-sm text-white/50 italic border-l-2 border-gray-700 pl-3">
                      {rel.notes}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs text-white/40">
                    <span>{rel.place.type.replace(/_/g, ' ')}</span>
                    <span>{new Date(rel.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Place Relationship Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl text-white">Add Place Relationship</h3>
                <Button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Step 1: Search for Place */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    1. Search for a Place
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Search by name, city, or country..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {/* Search Results */}
                  {searching && (
                    <div className="mt-2 text-sm text-white/60">Searching...</div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border border-gray-700 rounded-lg p-2">
                      {searchResults.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => {
                            setSelectedPlace(place)
                            setSearchResults([])
                            setSearchQuery(place.name)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedPlace?.id === place.id
                              ? 'bg-emerald-500/20 border border-emerald-500/30'
                              : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                          }`}
                        >
                          <div className="font-bold text-white">{place.name}</div>
                          <div className="text-sm text-white/60">
                            {place.type.replace(/_/g, ' ')} • {place.city}, {place.country}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPlace && (
                    <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{selectedPlace.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Can't find it? Create new place */}
                  {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                    <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-300 mb-2">Can&apos;t find the place you&apos;re looking for?</p>
                      <Button
                        onClick={() => {
                          setShowAddModal(false)
                          setShowCreateModal(true)
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Place
                      </Button>
                    </div>
                  )}
                </div>

                {/* Step 2: Select Relationship Type */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    2. Select Relationship Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RELATIONSHIP_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedRelationType(type.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            selectedRelationType === type.value
                              ? `bg-${type.color}-500/20 border-${type.color}-500/30`
                              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${selectedRelationType === type.value ? `text-${type.color}-400` : 'text-white/40'}`} />
                            <span className="font-bold text-sm text-white">{type.label}</span>
                          </div>
                          <p className="text-xs text-white/50">{type.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Step 3: Add Notes (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    3. Add Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional context about this relationship..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddRelationship}
                    disabled={!selectedPlace || !selectedRelationType || submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Relationship'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Place Modal - Simplified */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#2A2D3E] border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xl text-white">Create New Place</h3>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Google Maps Link - Featured */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-300 mb-2">
                    <Navigation className="w-4 h-4" />
                    Google Maps Link (Required for coordinates)
                  </label>
                  <Input
                    type="url"
                    placeholder="Paste Google Maps link to auto-extract coordinates..."
                    value={newPlace.google_maps_url}
                    onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    disabled={parsingMapsUrl}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-blue-300/60">
                      {parsingMapsUrl ? 'Extracting location data...' : 'We\'ll automatically extract location coordinates'}
                    </p>
                    {extractedData?.latitude && extractedData?.longitude && (
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Coordinates found
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-white mb-1">
                      Place Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="HEMPIN SHOWROOM"
                      value={newPlace.name}
                      onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-white/40 mt-1">Business name (not the full address)</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-white mb-1">Full Address</label>
                    <Input
                      type="text"
                      placeholder="235/38 Punna Withi 7 Alley, Khwaeng Bang Chak..."
                      value={newPlace.address}
                      onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-xs text-white/40 mt-1">Street address (auto-filled from Google Maps)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newPlace.type}
                      onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {PLACE_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newPlace.category}
                      onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {PLACE_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-white mb-1">Description</label>
                    <Input
                      type="text"
                      placeholder="Brief description..."
                      value={newPlace.description}
                      onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      City <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Bangkok"
                      value={newPlace.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {showCitySuggestions && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-40 overflow-y-auto">
                        {citySuggestions.map(suggestion => (
                          <button
                            key={suggestion}
                            onClick={() => handleCityChange(suggestion)}
                            className="w-full text-left p-2 hover:bg-gray-700 text-white"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">State/Province</label>
                    <Input
                      type="text"
                      placeholder="State/Province"
                      value={newPlace.state_province}
                      onChange={(e) => setNewPlace({ ...newPlace, state_province: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">
                      Country <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newPlace.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.emoji} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">Postal Code</label>
                    <Input
                      type="text"
                      placeholder="Postal Code"
                      value={newPlace.postal_code}
                      onChange={(e) => setNewPlace({ ...newPlace, postal_code: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">Phone</label>
                    <Input
                      type="text"
                      placeholder="+1 234 567 8900"
                      value={newPlace.phone}
                      onChange={(e) => setNewPlace({ ...newPlace, phone: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-1">Website</label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={newPlace.website}
                      onChange={(e) => setNewPlace({ ...newPlace, website: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreatePlace}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Place'}
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}