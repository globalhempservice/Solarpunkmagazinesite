import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Calendar, User, Building2, Phone, Mail, Globe, ExternalLink, Share2, Bookmark, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface PlaceHubProps {
  place: any
  isOpen: boolean
  onClose: () => void
  theme: 'places' | 'organizations' | 'products' | 'events' | 'all'
}

// Theme colors
const THEME_COLORS = {
  places: { primary: '#ec4899', secondary: '#f9a8d4', gradient: 'from-pink-500 via-rose-500 to-fuchsia-500' },
  organizations: { primary: '#10b981', secondary: '#6ee7b7', gradient: 'from-emerald-500 via-green-500 to-teal-500' },
  products: { primary: '#f59e0b', secondary: '#fbbf24', gradient: 'from-amber-500 via-orange-500 to-yellow-500' },
  events: { primary: '#a855f7', secondary: '#c084fc', gradient: 'from-purple-500 via-violet-500 to-fuchsia-500' },
  all: { primary: '#06b6d4', secondary: '#67e8f9', gradient: 'from-cyan-500 via-blue-500 to-teal-500' }
}

export function PlaceHub({ place, isOpen, onClose, theme }: PlaceHubProps) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.places

  if (!isOpen || !place) return null

  // Determine place type for future module loading
  const placeType = place.type // 'farm', 'dispensary', 'shop', 'factory', etc.

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200]"
        style={{ zIndex: 200 }}
      >
        {/* Close Button - Top Right */}
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            
            {/* Hero Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 md:p-12 mb-8 shadow-2xl`}
              style={{ boxShadow: `0 0 60px ${colors.primary}40` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                }} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Target Acquired Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-widest text-white/90 font-black">
                    TARGET ACQUIRED
                  </span>
                </div>

                {/* Place Name */}
                <h1 className="font-black text-4xl md:text-6xl text-white drop-shadow-lg mb-4">
                  {place.name}
                </h1>

                {/* Type Badge */}
                <Badge 
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 mb-6"
                >
                  {place.type?.replace(/_/g, ' ').toUpperCase() || 'LOCATION'}
                </Badge>

                {/* Description */}
                {place.description && (
                  <p className="text-lg text-white/90 max-w-3xl leading-relaxed">
                    {place.description}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Left Column - Location Info */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Location Info Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-black text-xl text-white mb-6 uppercase tracking-wider">
                    <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                    Location Info
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {place.city && (
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">City</div>
                        <div className="text-white font-semibold">{place.city}</div>
                      </div>
                    )}
                    {place.country && (
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Country</div>
                        <div className="text-white font-semibold">{place.country}</div>
                      </div>
                    )}
                    {place.address && (
                      <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Address</div>
                        <div className="text-white font-semibold">{place.address}</div>
                      </div>
                    )}
                    {place.latitude && place.longitude && (
                      <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Coordinates</div>
                        <div className="text-white/70 font-mono text-sm">
                          {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Place Type Specific Module - PLACEHOLDER FOR FUTURE */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-black text-xl text-white mb-4 uppercase tracking-wider">
                    <Building2 className="w-5 h-5" style={{ color: colors.primary }} />
                    {placeType === 'farm' && 'Farm Details'}
                    {placeType === 'dispensary' && 'Dispensary Info'}
                    {placeType === 'shop' && 'Shop Details'}
                    {placeType === 'factory' && 'Factory Operations'}
                    {!['farm', 'dispensary', 'shop', 'factory'].includes(placeType) && 'Details'}
                  </h3>
                  
                  <div className="text-white/50 text-center py-8">
                    {/* FUTURE: Farm-specific stats (area, crops, certifications) */}
                    {/* FUTURE: Shop inventory & hours */}
                    {/* FUTURE: Factory capacity & products */}
                    <div className="text-sm">
                      More details coming soon...
                    </div>
                  </div>
                </div>

              </motion.div>

              {/* Right Column - Actions & Meta */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* Quick Actions */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="font-black text-lg text-white mb-4 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Location
                    </Button>
                    <Button
                      className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
                      variant="outline"
                    >
                      <Bookmark className="w-4 h-4" />
                      Save Place
                    </Button>
                    <Button
                      className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
                      variant="outline"
                    >
                      <Star className="w-4 h-4" />
                      Add Review
                    </Button>
                  </div>
                </div>

                {/* Contact Info - if available */}
                {(place.phone || place.email || place.website) && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="font-black text-lg text-white mb-4 uppercase tracking-wider">
                      Contact
                    </h3>
                    
                    <div className="space-y-3">
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                        >
                          <Phone className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-sm">{place.phone}</span>
                        </a>
                      )}
                      {place.email && (
                        <a
                          href={`mailto:${place.email}`}
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                        >
                          <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-sm">{place.email}</span>
                        </a>
                      )}
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                        >
                          <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-sm">Visit Website</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats - for farms */}
                {place.area_hectares && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="font-black text-lg text-white mb-4 uppercase tracking-wider">
                      Stats
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Area</div>
                        <div className="text-2xl font-black text-white">
                          {place.area_hectares} <span className="text-sm font-normal text-white/70">hectares</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Future Modules Section - PLACEHOLDER */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h3 className="font-black text-2xl text-white mb-4 uppercase tracking-wider text-center">
                Coming Soon
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-white/5 rounded-xl">
                  <div className="font-black text-white mb-2">Products Catalog</div>
                  <div className="text-sm text-white/50">Browse available products from this location</div>
                </div>
                <div className="p-6 bg-white/5 rounded-xl">
                  <div className="font-black text-white mb-2">Events & Tours</div>
                  <div className="text-sm text-white/50">See upcoming events and book visits</div>
                </div>
                <div className="p-6 bg-white/5 rounded-xl">
                  <div className="font-black text-white mb-2">Reviews & Ratings</div>
                  <div className="text-sm text-white/50">Community feedback and experiences</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}