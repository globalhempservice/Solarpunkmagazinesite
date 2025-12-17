import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, ChevronDown, ChevronRight, Inbox, ArrowRight, ArrowLeft } from 'lucide-react'

interface SwapProposal {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  swap_item_id: string
  proposer_item_id: string
  proposer_user_id: string
  message: string | null
  swap_item: {
    id: string
    title: string
    category: string
    description: string
    condition: string
    images: string[]
    user_profile: {
      user_id: string
      display_name: string
      avatar_url: string | null
      country: string
    }
  }
  proposer_item: {
    id: string
    title: string
    category: string
    description: string
    condition: string
    images: string[]
  }
  proposer_profile: {
    user_id: string
    display_name: string
    avatar_url: string | null
    country: string
  }
  conversation_id: string | null
}

interface SwapConversationListProps {
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  onSelectProposal: (proposal: SwapProposal) => void
  onSelectConversation: (conversationId: string, proposal: SwapProposal) => void
}

export function SwapConversationList({
  userId,
  accessToken,
  projectId,
  publicAnonKey,
  onSelectProposal,
  onSelectConversation
}: SwapConversationListProps) {
  const [loading, setLoading] = useState(true)
  const [incomingProposals, setIncomingProposals] = useState<SwapProposal[]>([])
  const [outgoingProposals, setOutgoingProposals] = useState<SwapProposal[]>([])
  const [incomingExpanded, setIncomingExpanded] = useState(true)
  const [outgoingExpanded, setOutgoingExpanded] = useState(true)

  useEffect(() => {
    fetchProposals()
  }, [userId, accessToken])

  const fetchProposals = async () => {
    try {
      setLoading(true)

      // Fetch incoming proposals (people want my items)
      const incomingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals?type=incoming`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Fetch outgoing proposals (I want their items)
      const outgoingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals?type=outgoing`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (incomingResponse.ok) {
        const data = await incomingResponse.json()
        setIncomingProposals(data.proposals || [])
      }

      if (outgoingResponse.ok) {
        const data = await outgoingResponse.json()
        setOutgoingProposals(data.proposals || [])
      }
    } catch (err) {
      console.error('Error fetching SWAP proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProposalClick = (proposal: SwapProposal) => {
    if (proposal.status === 'accepted' && proposal.conversation_id) {
      // Open active conversation
      onSelectConversation(proposal.conversation_id, proposal)
    } else if (proposal.status === 'pending') {
      // Open interactive proposal card
      onSelectProposal(proposal)
    }
  }

  const renderProposalItem = (proposal: SwapProposal, isIncoming: boolean) => {
    const isPending = proposal.status === 'pending'
    const isActive = proposal.status === 'accepted'
    const item = isIncoming ? proposal.swap_item : proposal.proposer_item
    const otherUser = isIncoming ? proposal.proposer_profile : proposal.swap_item.user_profile

    return (
      <motion.button
        key={proposal.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => handleProposalClick(proposal)}
        className="w-full group"
      >
        <div className="p-4 border border-border/50 rounded-xl hover:border-[#FF00E5]/30 hover:bg-[#FF00E5]/5 transition-all">
          {/* Header */}
          <div className="flex items-start gap-3 mb-2">
            {/* Item Image */}
            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{item.title}</h4>
                {isPending && (
                  <span className="px-2 py-0.5 bg-[#E8FF00]/20 text-[#E8FF00] text-xs rounded-full flex-shrink-0">
                    NEW
                  </span>
                )}
                {isActive && (
                  <span className="px-2 py-0.5 bg-[#00FF85]/20 text-[#00FF85] text-xs rounded-full flex-shrink-0">
                    ACTIVE
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isIncoming ? (
                  <ArrowLeft className="w-3 h-3 text-[#FF00E5]" />
                ) : (
                  <ArrowRight className="w-3 h-3 text-[#00D9FF]" />
                )}
                <span>{otherUser.country}</span>
                <span>•</span>
                <span className="truncate">
                  {isPending ? 'Awaiting response' : 'Discussion open'}
                </span>
              </div>
            </div>
          </div>

          {/* Preview message if any */}
          {proposal.message && isPending && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 pl-15">
              "{proposal.message}"
            </p>
          )}
        </div>
      </motion.button>
    )
  }

  const incomingPending = incomingProposals.filter(p => p.status === 'pending')
  const incomingActive = incomingProposals.filter(p => p.status === 'accepted')
  const outgoingPending = outgoingProposals.filter(p => p.status === 'pending')
  const outgoingActive = outgoingProposals.filter(p => p.status === 'accepted')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#FF00E5]/20 border-t-[#FF00E5] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SWAP deals...</p>
        </div>
      </div>
    )
  }

  const totalIncoming = incomingProposals.length
  const totalOutgoing = outgoingProposals.length
  const hasAnyProposals = totalIncoming > 0 || totalOutgoing > 0

  if (!hasAnyProposals) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF00E5]/20 to-[#E8FF00]/20 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No SWAP Deals Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your SWAP proposals and deals will appear here.
          </p>
          <p className="text-xs text-muted-foreground">
            Add items to your inventory and start proposing trades!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="p-4 space-y-4">
        {/* Items I Own (Incoming Proposals) */}
        {totalIncoming > 0 && (
          <div>
            <button
              onClick={() => setIncomingExpanded(!incomingExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#FF00E5]/10 to-[#E8FF00]/10 border border-[#FF00E5]/20 hover:border-[#FF00E5]/40 transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                <ArrowLeft className="w-5 h-5 text-[#FF00E5]" />
                <div className="text-left">
                  <h3 className="font-semibold">Items I Own</h3>
                  <p className="text-xs text-muted-foreground">
                    {incomingPending.length} pending • {incomingActive.length} active
                  </p>
                </div>
              </div>
              {incomingExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {incomingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {incomingProposals.map(proposal => renderProposalItem(proposal, true))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Items I Want (Outgoing Proposals) */}
        {totalOutgoing > 0 && (
          <div>
            <button
              onClick={() => setOutgoingExpanded(!outgoingExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#00D9FF]/10 to-[#00FF85]/10 border border-[#00D9FF]/20 hover:border-[#00D9FF]/40 transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                <ArrowRight className="w-5 h-5 text-[#00D9FF]" />
                <div className="text-left">
                  <h3 className="font-semibold">Items I Want</h3>
                  <p className="text-xs text-muted-foreground">
                    {outgoingPending.length} pending • {outgoingActive.length} active
                  </p>
                </div>
              </div>
              {outgoingExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {outgoingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {outgoingProposals.map(proposal => renderProposalItem(proposal, false))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}