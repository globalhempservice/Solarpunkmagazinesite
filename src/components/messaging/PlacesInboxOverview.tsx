import { useState, useEffect } from 'react'
import { MapPin, MessageCircle, ChevronRight, Building2 } from 'lucide-react'

interface Place {
  id: string
  name: string
  type: string
  category: string
  city?: string
  country: string
  logo_url?: string
  unread_messages?: number
  total_messages?: number
}

interface PlacesInboxOverviewProps {
  userId: string
  accessToken: string
  projectId: string
  serverUrl: string
  onSelectPlace: (placeId: string, placeName: string) => void
}

export function PlacesInboxOverview({
  userId,
  accessToken,
  projectId,
  serverUrl,
  onSelectPlace
}: PlacesInboxOverviewProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserPlaces()
  }, [userId])

  const fetchUserPlaces = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch place conversations for this user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/conversations?contextType=place`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch place conversations')
      }

      const data = await response.json()
      const conversations = data.conversations || []
      
      // Group conversations by place (context_id) and count messages
      const placeMap = new Map()
      conversations.forEach((conv: any) => {
        const placeId = conv.context_id
        if (!placeId) return
        
        if (!placeMap.has(placeId)) {
          placeMap.set(placeId, {
            id: placeId,
            name: conv.context_name || 'Unknown Place',
            unread_messages: 0,
            total_messages: 0
          })
        }
        
        const place = placeMap.get(placeId)
        place.unread_messages += conv.unread_count
        place.total_messages += 1 // Count conversations
      })

      setPlaces(Array.from(placeMap.values()))
    } catch (err: any) {
      console.error('Error fetching place conversations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9D00FF]"></div>
        <p className="mt-4">Loading your places...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
        <p className="text-red-400">Failed to load places</p>
        <button
          onClick={fetchUserPlaces}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9D00FF]/20 to-[#00D9FF]/20 flex items-center justify-center mb-4 border border-white/10">
          <MapPin className="w-8 h-8 text-[#9D00FF]" />
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">No Places Yet</h3>
        <p className="text-sm max-w-xs">
          You don't own or manage any places in the directory yet. Add a place to start receiving messages!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9D00FF]/20 to-[#00D9FF]/20 flex items-center justify-center border border-white/10">
            <MapPin className="w-6 h-6 text-[#9D00FF]" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Places Inboxes</h2>
            <p className="text-white/60 text-sm">{places.length} {places.length === 1 ? 'place' : 'places'}</p>
          </div>
        </div>
        <p className="text-white/60 text-sm mt-2">
          Manage messages for your hemp places and facilities
        </p>
      </div>

      {/* Places List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {places.map((place) => (
            <button
              key={place.id}
              onClick={() => onSelectPlace(place.id, place.name)}
              className="w-full group"
            >
              <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-[#9D00FF]/50">
                {/* Place Logo/Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9D00FF]/20 to-[#00D9FF]/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    {place.logo_url ? (
                      <img
                        src={place.logo_url}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#9D00FF]" />
                    )}
                  </div>
                  
                  {/* Unread Badge */}
                  {place.unread_messages && place.unread_messages > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E8FF00] flex items-center justify-center border-2 border-[#1A1D2E]">
                      <span className="text-black text-xs font-bold">
                        {place.unread_messages > 9 ? '9+' : place.unread_messages}
                      </span>
                    </div>
                  )}
                </div>

                {/* Place Info */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-white font-semibold truncate group-hover:text-[#9D00FF] transition-colors">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                    <span className="capitalize">{place.type}</span>
                    <span>•</span>
                    <span className="truncate">
                      {place.city ? `${place.city}, ${place.country}` : place.country}
                    </span>
                  </div>
                  
                  {/* Message Count */}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>
                      {place.total_messages || 0} {place.total_messages === 1 ? 'message' : 'messages'}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#9D00FF] transition-colors flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <p className="text-xs text-white/50 text-center">
          Messages sent to your places appear here. Visitors can contact your facilities directly.
        </p>
      </div>
    </div>
  )
}