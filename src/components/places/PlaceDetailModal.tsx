import { motion, AnimatePresence } from 'motion/react'
import { X, MapPin, Building2, Calendar, Users, Wheat, Mail, Phone, Globe as GlobeIcon, MessageCircle, ExternalLink } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { PlaceInlineMessaging } from './PlaceInlineMessaging'
import { useState, useEffect, useRef } from 'react'

interface PlaceDetailModalProps {
  place: any
  isOpen: boolean
  onClose: () => void
  onMessagePlace?: (ownerId: string, placeId: string, placeName: string) => void
  currentUserId?: string
  currentUserName?: string
  currentUserAvatar?: string | null
  serverUrl?: string
  accessToken?: string
  autoOpenMessaging?: boolean
}

const CATEGORY_COLORS = {
  agriculture: 'from-green-500 to-emerald-600',
  processing: 'from-blue-500 to-cyan-600',
  storage: 'from-orange-500 to-amber-600',
  retail: 'from-pink-500 to-rose-600',
  medical: 'from-purple-500 to-indigo-600',
  other: 'from-slate-500 to-slate-600'
}

const getCategoryIcon = (category: string, className: string) => {
  const icons: { [key: string]: JSX.Element } = {
    agriculture: <Wheat className={className} />,
    processing: <Building2 className={className} />,
    retail: <GlobeIcon className={className} />,
  }
  return icons[category] || <MapPin className={className} />
}

export function PlaceDetailModal({ 
  place, 
  isOpen, 
  onClose, 
  onMessagePlace,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  serverUrl,
  accessToken,
  autoOpenMessaging
}: PlaceDetailModalProps) {
  const [showMessaging, setShowMessaging] = useState(false)
  const messagingRef = useRef<HTMLDivElement>(null)

  // Reset messaging state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowMessaging(false)
    }
  }, [isOpen])

  // Auto-open messaging if requested
  useEffect(() => {
    if (isOpen && autoOpenMessaging) {
      setShowMessaging(true)
    }
  }, [isOpen, autoOpenMessaging])

  // Auto-scroll to messaging when it appears
  useEffect(() => {
    if (showMessaging && messagingRef.current) {
      setTimeout(() => {
        messagingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [showMessaging])

  if (!place) return null

  const isOwner = place.created_by === currentUserId
  const canMessage = !isOwner && place.created_by && serverUrl && accessToken && currentUserId && currentUserName

  console.log('🏢 PlaceDetailModal render:', { 
    placeName: place.name, 
    isOpen, 
    showMessaging, 
    canMessage, 
    isOwner,
    autoOpenMessaging,
    currentUserId,
    placeCreatedBy: place.created_by
  })

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
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            style={{
              // Respect safe areas on mobile
              paddingTop: 'max(16px, env(safe-area-inset-top))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
            }}
          >
            <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 flex flex-col">
              {/* Header with Close Button */}
              <div className="relative flex items-center justify-end p-4 border-b border-cyan-500/20">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Inline Messaging - AT THE TOP with beautiful design */}
                {canMessage && showMessaging && (
                  <div
                    ref={messagingRef}
                    className="border-b border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-slate-900/50 to-purple-950/20"
                  >
                    {/* Header for Messaging Section */}
                    <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-b border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Conversation</h3>
                          <p className="text-xs text-purple-300">with {place.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Messaging Component */}
                    <PlaceInlineMessaging
                      placeId={place.id}
                      placeName={place.name}
                      placeOwnerId={place.created_by}
                      currentUserId={currentUserId!}
                      currentUserName={currentUserName!}
                      currentUserAvatar={currentUserAvatar}
                      serverUrl={serverUrl!}
                      accessToken={accessToken!}
                    />
                  </div>
                )}

                {/* Hero Image/Logo */}
                {(place.logo_url || place.photos?.[0] || place.company?.logo_url) && (
                  <div className="h-64 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-slate-900/50 relative">
                    <img
                      src={place.logo_url || place.photos?.[0] || place.company?.logo_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Title & Badges */}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">{place.name}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`bg-gradient-to-r ${CATEGORY_COLORS[place.category as keyof typeof CATEGORY_COLORS]} text-white border-0 flex items-center gap-1.5`}>
                        {getCategoryIcon(place.category, "w-3.5 h-3.5")}
                        <span className="capitalize">{place.category}</span>
                      </Badge>
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                        {place.type.replace(/_/g, ' ')}
                      </Badge>
                      {isOwner && (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          Your Place
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {place.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">About</h3>
                      <p className="text-slate-300 leading-relaxed">
                        {place.description}
                      </p>
                    </div>
                  )}

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Location */}
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">Location</div>
                        <div className="text-sm text-white">
                          {[place.city, place.state_province, place.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    {place.company && (
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 mb-0.5">Company</div>
                          <div className="text-sm text-white">{place.company.name}</div>
                        </div>
                      </div>
                    )}

                    {/* Year Established */}
                    {place.year_established && (
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 mb-0.5">Established</div>
                          <div className="text-sm text-white">{place.year_established}</div>
                        </div>
                      </div>
                    )}

                    {/* Manager/Owner */}
                    {(place.manager_name || place.owner_name) && (
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 mb-0.5">Contact Person</div>
                          <div className="text-sm text-white">{place.manager_name || place.owner_name}</div>
                        </div>
                      </div>
                    )}

                    {/* Area (for farms) */}
                    {place.area_hectares && (
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <Wheat className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-400 mb-0.5">Area</div>
                          <div className="text-sm text-white">{place.area_hectares.toFixed(2)} hectares</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {place.specialties && place.specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {place.specialties.map((specialty: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-slate-600 text-slate-300 bg-slate-800/50"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(place.email || place.phone || place.website) && (
                    <div>
                      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        {place.email && (
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <a href={`mailto:${place.email}`} className="hover:text-blue-400 transition-colors">
                              {place.email}
                            </a>
                          </div>
                        )}
                        {place.phone && (
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Phone className="w-4 h-4 text-green-400" />
                            <a href={`tel:${place.phone}`} className="hover:text-green-400 transition-colors">
                              {place.phone}
                            </a>
                          </div>
                        )}
                        {place.website && (
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <GlobeIcon className="w-4 h-4 text-cyan-400" />
                            <a 
                              href={place.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                            >
                              {place.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-cyan-500/20 bg-slate-900/50">
                <div className="flex flex-wrap gap-3">
                  {/* Message Button - Toggles inline messaging OR opens panel */}
                  {canMessage && (
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg shadow-purple-500/30"
                      onClick={() => setShowMessaging(!showMessaging)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {showMessaging ? 'Hide Messages' : 'Message Place'}
                    </Button>
                  )}
                  
                  {place.website && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => window.open(place.website, '_blank')}
                    >
                      <GlobeIcon className="w-4 h-4" />
                      Visit Website
                    </Button>
                  )}
                  
                  {place.phone && (
                    <Button
                      variant="outline"
                      className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
                      onClick={() => window.location.href = `tel:${place.phone}`}
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}