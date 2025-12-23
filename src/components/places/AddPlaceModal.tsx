import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Loader2, Sparkles, ChevronRight, ChevronLeft, Building2, FileText, CheckCircle2, Wheat, Factory, Package, ShoppingCart, Cross, Building } from 'lucide-react'
import { Button } from '../ui/button'
import { toast } from 'sonner@2.0.3'

interface AddPlaceModalProps {
  isOpen: boolean
  onClose: () => void
  serverUrl: string
  accessToken?: string
  onPlaceAdded?: () => void
}

export function AddPlaceModal({
  isOpen,
  onClose,
  serverUrl,
  accessToken,
  onPlaceAdded
}: AddPlaceModalProps) {
  const [step, setStep] = useState<'intro' | 'basic' | 'category' | 'details' | 'review'>('intro')
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [parsingUrl, setParsingUrl] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state_province: '',
    country: '',
    postal_code: '',
    latitude: null as number | null,
    longitude: null as number | null,
    category: 'retail',
    type: 'shop',
    description: '',
    phone: '',
    email: '',
    website: ''
  })

  const CATEGORIES = [
    { value: 'agriculture', label: 'Agriculture', icon: Wheat, description: 'Farms & cultivation' },
    { value: 'processing', label: 'Processing', icon: Factory, description: 'Manufacturing & processing' },
    { value: 'storage', label: 'Storage', icon: Package, description: 'Warehousing & storage' },
    { value: 'retail', label: 'Retail', icon: ShoppingCart, description: 'Shops & dispensaries' },
    { value: 'medical', label: 'Medical', icon: Cross, description: 'Medical facilities' },
    { value: 'other', label: 'Other', icon: Building, description: 'Other facilities' }
  ]

  const TYPES_BY_CATEGORY: Record<string, string[]> = {
    agriculture: ['farm', 'greenhouse', 'outdoor_cultivation', 'indoor_cultivation'],
    processing: ['factory', 'mill', 'extraction_facility', 'manufacturing_plant'],
    storage: ['warehouse', 'distribution_center', 'cold_storage'],
    retail: ['shop', 'dispensary', 'online_store', 'market_stall'],
    medical: ['clinic', 'pharmacy', 'research_facility'],
    other: ['office', 'research_center', 'education_center', 'other']
  }

  const handleClose = () => {
    setStep('intro')
    setGoogleMapsUrl('')
    setExtractedData(null)
    setFormData({
      name: '',
      address: '',
      city: '',
      state_province: '',
      country: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      category: 'retail',
      type: 'shop',
      description: '',
      phone: '',
      email: '',
      website: ''
    })
    onClose()
  }

  const handleParseGoogleMapsUrl = async () => {
    if (!googleMapsUrl.trim()) {
      toast.error('Please paste a Google Maps link')
      return
    }

    const isGoogleMapsLink = googleMapsUrl.includes('google.com/maps') || 
                             googleMapsUrl.includes('maps.google.com') || 
                             googleMapsUrl.includes('maps.app.goo.gl') || 
                             googleMapsUrl.includes('goo.gl/maps')
    
    if (!isGoogleMapsLink) {
      toast.error('Please provide a valid Google Maps link')
      return
    }

    try {
      setParsingUrl(true)
      console.log('📤 Parsing Google Maps URL:', googleMapsUrl)

      const response = await fetch(`${serverUrl}/places/parse-google-maps-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ url: googleMapsUrl })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to parse Google Maps URL')
      }

      const { placeData } = await response.json()
      console.log('📍 Extracted place data:', placeData)

      // Auto-fill the form
      setFormData(prev => ({
        ...prev,
        name: placeData.name || prev.name,
        address: placeData.address || prev.address,
        city: placeData.city || prev.city,
        state_province: placeData.state_province || prev.state_province,
        country: placeData.country || prev.country,
        postal_code: placeData.postal_code || prev.postal_code,
        latitude: placeData.latitude || prev.latitude,
        longitude: placeData.longitude || prev.longitude,
        phone: placeData.phone || prev.phone,
        website: placeData.website || prev.website
      }))
      
      setExtractedData(placeData)

      const extracted = []
      if (placeData.name) extracted.push('name')
      if (placeData.address) extracted.push('address')
      if (placeData.city) extracted.push('city')
      if (placeData.phone) extracted.push('phone')
      if (placeData.website) extracted.push('website')

      if (extracted.length > 0) {
        toast.success(`✅ Extracted: ${extracted.join(', ')}`)
      } else {
        toast.warning('Could not extract data. Please fill manually.')
      }

    } catch (error: any) {
      console.error('❌ Error parsing Google Maps URL:', error)
      toast.error(error.message || 'Failed to parse Google Maps URL')
    } finally {
      setParsingUrl(false)
    }
  }

  const handleBasicContinue = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a place name')
      return
    }
    if (!formData.address.trim()) {
      toast.error('Please enter an address')
      return
    }
    setStep('category')
  }

  const handleCategoryContinue = () => {
    setStep('details')
  }

  const handleSubmit = async () => {
    // Final validation
    if (!formData.name || !formData.address || !formData.category || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      console.log('📤 Submitting place:', formData)

      // Map form data to API expected format
      const submitData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        // Location - use extracted coordinates or defaults
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        // Address
        address: formData.address, // Add this field
        city: formData.city || 'Unknown',
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        country: formData.country || 'Unknown',
        // Contact
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      }

      console.log('📤 Mapped submit data:', submitData)

      const response = await fetch(`${serverUrl}/places/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to create place')
      }

      const { place } = await response.json()
      console.log('✅ Place created:', place)

      toast.success('🎉 Place added successfully!')
      onPlaceAdded?.(place)
      handleClose()

    } catch (error: any) {
      console.error('❌ Error creating place:', error)
      toast.error(error.message || 'Failed to create place')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Covers everything including navbars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-[10000]"
            onClick={onClose}
          />

          {/* Modal - Above backdrop and navbars */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              paddingTop: 'max(16px, env(safe-area-inset-top))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
            }}
          >
            <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 flex flex-col">
              {/* Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add Place</h2>
                    <p className="text-sm text-emerald-300">
                      {step === 'intro' && 'Share your favorite hemp farm, shop, facility, or dispensary with the global community'}
                      {step === 'basic' && 'Step 1: Basic Info'}
                      {step === 'category' && 'Step 2: Category'}
                      {step === 'details' && 'Step 3: Details'}
                      {step === 'review' && 'Step 4: Review'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {step === 'intro' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 gap-4">
                      <div 
                        onClick={() => setStep('basic')}
                        className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold text-lg">1</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-semibold text-white mb-1">Basic Info</h4>
                        <p className="text-sm text-slate-400">Name & location</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-xl opacity-60">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-lg">2</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Details</h4>
                        <p className="text-sm text-slate-400">Category & type</p>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/30 rounded-xl opacity-60">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                            <span className="text-pink-400 font-bold text-lg">3</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Review</h4>
                        <p className="text-sm text-slate-400">Confirm & submit</p>
                      </div>
                    </div>
                  </motion.div>
                ) : step === 'basic' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Google Maps URL Extractor */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Google Maps Link (Optional)
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Paste a Google Maps link to auto-fill location details
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={googleMapsUrl}
                          onChange={(e) => setGoogleMapsUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !parsingUrl) {
                              handleParseGoogleMapsUrl()
                            }
                          }}
                          placeholder="https://maps.google.com/..."
                          disabled={parsingUrl}
                          className="flex-1 px-4 py-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                        />
                        <Button
                          onClick={handleParseGoogleMapsUrl}
                          disabled={!googleMapsUrl.trim() || parsingUrl}
                          className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6"
                        >
                          {parsingUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Extract'
                          )}
                        </Button>
                      </div>

                      {/* Tips */}
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                        <p className="text-xs text-cyan-300">
                          <strong>💡 Tip:</strong> Open Google Maps, search for your place, click "Share", and copy the link
                        </p>
                      </div>
                    </div>

                    {/* Manual Entry Fields */}
                    <div className="pt-6 border-t border-slate-700 space-y-4">
                      <h3 className="font-semibold text-white mb-4">Or enter manually</h3>
                      
                      {/* Place Name */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Place Name <span className="text-pink-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Green Valley Hemp Farm"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Address <span className="text-pink-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="e.g., 123 Hemp Street"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Show extracted data preview if available */}
                      {extractedData && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                            ✅ Extracted Data
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {extractedData.city && (
                              <div>
                                <span className="text-slate-400">City:</span>{' '}
                                <span className="text-white">{extractedData.city}</span>
                              </div>
                            )}
                            {extractedData.state_province && (
                              <div>
                                <span className="text-slate-400">State:</span>{' '}
                                <span className="text-white">{extractedData.state_province}</span>
                              </div>
                            )}
                            {extractedData.country && (
                              <div>
                                <span className="text-slate-400">Country:</span>{' '}
                                <span className="text-white">{extractedData.country}</span>
                              </div>
                            )}
                            {extractedData.phone && (
                              <div>
                                <span className="text-slate-400">Phone:</span>{' '}
                                <span className="text-white">{extractedData.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : step === 'category' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Category Selection */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Category <span className="text-pink-400">*</span>
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Select the category that best describes your place
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {CATEGORIES.map(category => (
                          <div
                            key={category.value}
                            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.category === category.value 
                                ? 'bg-gradient-to-br from-emerald-600/40 to-teal-600/40 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30' 
                                : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                          >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              formData.category === category.value
                                ? 'bg-emerald-400/30'
                                : 'bg-emerald-500/20'
                            }`}>
                              <category.icon className={`w-6 h-6 ${
                                formData.category === category.value
                                  ? 'text-emerald-300'
                                  : 'text-emerald-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm ${
                                formData.category === category.value
                                  ? 'text-emerald-100'
                                  : 'text-white'
                              }`}>{category.label}</h4>
                              <p className={`text-xs ${
                                formData.category === category.value
                                  ? 'text-emerald-200'
                                  : 'text-slate-400'
                              }`}>{category.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : step === 'details' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Type Selection */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Type <span className="text-pink-400">*</span>
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Select the type that best describes your place
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TYPES_BY_CATEGORY[formData.category].map(type => (
                          <div
                            key={type}
                            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.type === type 
                                ? 'bg-gradient-to-br from-purple-600/40 to-violet-600/40 border-purple-400 ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/30' 
                                : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/30 hover:border-purple-500/50'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, type: type }))}
                          >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              formData.type === type
                                ? 'bg-purple-400/30'
                                : 'bg-purple-500/20'
                            }`}>
                              <FileText className={`w-6 h-6 ${
                                formData.type === type
                                  ? 'text-purple-300'
                                  : 'text-purple-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm capitalize ${
                                formData.type === type
                                  ? 'text-purple-100'
                                  : 'text-white'
                              }`}>{type.replace(/_/g, ' ')}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="pt-6 border-t border-slate-700 space-y-4">
                      <h3 className="font-semibold text-white mb-4">Additional Details</h3>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g., We offer high-quality hemp products and services"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g., +1 123 456 7890"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g., contact@yourplace.com"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Website
                        </label>
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="e.g., https://www.yourplace.com"
                          className="w-full px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : step === 'review' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Review and Submit */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Review Your Place
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          Please review the details of your place before submitting
                        </p>
                      </div>
                      
                      <div className="bg-slate-800/80 border border-purple-500/30 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                          ✅ Place Details
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Name:</span>{' '}
                            <span className="text-white">{formData.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Address:</span>{' '}
                            <span className="text-white">{formData.address}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">City:</span>{' '}
                            <span className="text-white">{formData.city}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">State:</span>{' '}
                            <span className="text-white">{formData.state_province}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Country:</span>{' '}
                            <span className="text-white">{formData.country}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Postal Code:</span>{' '}
                            <span className="text-white">{formData.postal_code}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Category:</span>{' '}
                            <span className="text-white">{formData.category}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Type:</span>{' '}
                            <span className="text-white">{formData.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Description:</span>{' '}
                            <span className="text-white">{formData.description}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Phone:</span>{' '}
                            <span className="text-white">{formData.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Email:</span>{' '}
                            <span className="text-white">{formData.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Website:</span>{' '}
                            <span className="text-white">{formData.website}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* Footer */}
              {step === 'basic' && (
                <div className="p-6 border-t border-purple-500/20 bg-slate-900/50 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('intro')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBasicContinue}
                    disabled={!formData.name.trim() || !formData.address.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {step === 'category' && (
                <div className="p-6 border-t border-purple-500/20 bg-slate-900/50 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('basic')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCategoryContinue}
                    disabled={!formData.category}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {step === 'details' && (
                <div className="p-6 border-t border-purple-500/20 bg-slate-900/50 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('category')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('review')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white gap-2 shadow-lg shadow-purple-500/30"
                  >
                    Review
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {step === 'review' && (
                <div className="p-6 border-t border-purple-500/20 bg-slate-900/50 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Submit
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}