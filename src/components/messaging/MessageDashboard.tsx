import { useState, useEffect } from 'react'
import { MessageCircle, Building2, Package, ShoppingBag, FileText, MapPin, ChevronRight } from 'lucide-react'

interface InboxCategory {
  id: string
  name: string
  description: string
  icon: any
  count: number
  unreadCount: number
  color: string
  gradient: string
  contextType: 'personal' | 'organization' | 'swap' | 'swag' | 'rfp' | 'place'
}

interface MessageDashboardProps {
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  onSelectInbox: (contextType: string) => void
}

export function MessageDashboard({
  userId,
  accessToken,
  projectId,
  publicAnonKey,
  onSelectInbox
}: MessageDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [inboxStats, setInboxStats] = useState<InboxCategory[]>([])

  useEffect(() => {
    fetchInboxStats()
  }, [userId])

  const fetchInboxStats = async () => {
    try {
      setLoading(true)

      // Fetch conversations
      console.log('📊 Fetching conversations for inbox stats...')
      const conversationsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/conversations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Fetch SWAP proposals separately (includes pending + accepted)
      console.log('📊 Fetching SWAP proposals...')
      const swapProposalsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      let groupedByType: any = {}
      let swapCount = 0
      let swapUnread = 0

      if (conversationsResponse.ok) {
        const data = await conversationsResponse.json()
        const conversations = data.conversations || []
        
        console.log('📊 Fetched conversations:', conversations.length, conversations)
        
        // Group conversations by context_type
        groupedByType = conversations.reduce((acc: any, conv: any) => {
          const type = conv.context_type || 'personal'
          if (!acc[type]) {
            acc[type] = { count: 0, unread: 0 }
          }
          acc[type].count++
          acc[type].unread += conv.unread_count
          return acc
        }, {})

        console.log('📊 Grouped by type:', groupedByType)
      }

      // Add SWAP proposal counts
      if (swapProposalsResponse.ok) {
        const swapData = await swapProposalsResponse.json()
        const proposals = swapData.proposals || []
        
        console.log('📊 Fetched SWAP proposals:', proposals.length, proposals)
        
        // Count total proposals (pending + accepted)
        swapCount = proposals.length
        
        // Count unread = pending proposals (not yet responded to)
        swapUnread = proposals.filter((p: any) => p.status === 'pending').length
        
        console.log('📊 SWAP stats - Total:', swapCount, 'Pending (unread):', swapUnread)
      }
        
      // Initialize inbox categories with actual counts
      setInboxStats([
        {
          id: 'personal',
          name: 'Personal',
          description: 'Direct messages & Discovery Matches',
          icon: MessageCircle,
          count: groupedByType.personal?.count || 0,
          unreadCount: groupedByType.personal?.unread || 0,
          color: '#E8FF00',
          gradient: 'from-[#E8FF00]/20 to-[#00D9FF]/20',
          contextType: 'personal'
        },
        {
          id: 'organizations',
          name: 'Organizations',
          description: 'Messages from your orgs & teams',
          icon: Building2,
          count: groupedByType.organization?.count || 0,
          unreadCount: groupedByType.organization?.unread || 0,
          color: '#00D9FF',
          gradient: 'from-[#00D9FF]/20 to-[#E8FF00]/20',
          contextType: 'organization'
        },
        {
          id: 'swap',
          name: 'SWAP Deals',
          description: 'C2C barter & trade discussions',
          icon: Package,
          count: swapCount,
          unreadCount: swapUnread,
          color: '#FF00E5',
          gradient: 'from-[#FF00E5]/20 to-[#E8FF00]/20',
          contextType: 'swap'
        },
        {
          id: 'swag',
          name: 'SWAG Orders',
          description: 'Hemp product commerce messages',
          icon: ShoppingBag,
          count: groupedByType.swag?.count || 0,
          unreadCount: groupedByType.swag?.unread || 0,
          color: '#00FF85',
          gradient: 'from-[#00FF85]/20 to-[#00D9FF]/20',
          contextType: 'swag'
        },
        {
          id: 'rfp',
          name: 'RFP Projects',
          description: 'Professional matching & proposals',
          icon: FileText,
          count: groupedByType.rfp?.count || 0,
          unreadCount: groupedByType.rfp?.unread || 0,
          color: '#FF6B00',
          gradient: 'from-[#FF6B00]/20 to-[#E8FF00]/20',
          contextType: 'rfp'
        },
        {
          id: 'places',
          name: 'Places',
          description: 'Location-based conversations',
          icon: MapPin,
          count: groupedByType.place?.count || 0,
          unreadCount: groupedByType.place?.unread || 0,
          color: '#9D00FF',
          gradient: 'from-[#9D00FF]/20 to-[#00D9FF]/20',
          contextType: 'place'
        }
      ])
    } catch (err) {
      console.error('Error fetching inbox stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8FF00]"></div>
        <p className="mt-4">Loading inboxes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Inbox Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        <div className="space-y-3">
          {inboxStats.map((inbox) => {
            const Icon = inbox.icon
            const hasMessages = inbox.count > 0
            const hasUnread = inbox.unreadCount > 0
            // Always enable Places inbox to show overview of user's places
            const isEnabled = hasMessages || inbox.contextType === 'place'

            return (
              <button
                key={inbox.id}
                onClick={() => isEnabled ? onSelectInbox(inbox.contextType) : null}
                disabled={!isEnabled}
                className={`
                  w-full p-4 rounded-2xl border transition-all duration-200
                  ${isEnabled 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]' 
                    : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                  }
                  ${hasUnread ? 'ring-2 ring-[#E8FF00]/30' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${inbox.gradient} flex items-center justify-center border border-white/10 flex-shrink-0`}>
                    <Icon size={24} className="text-white" style={{ color: inbox.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{inbox.name}</h3>
                      {hasUnread && (
                        <div className="px-2 py-0.5 bg-[#E8FF00] rounded-full">
                          <span className="text-xs text-black font-bold">
                            {inbox.unreadCount > 99 ? '99+' : inbox.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-white/60 truncate">{inbox.description}</p>
                    {hasMessages && (
                      <p className="text-xs text-white/40 mt-1">
                        {inbox.count} conversation{inbox.count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  {isEnabled && (
                    <ChevronRight size={20} className="text-white/40 flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}