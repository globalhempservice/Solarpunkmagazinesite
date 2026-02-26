import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, ChevronDown, ChevronRight, Inbox, ArrowRight, ArrowLeft, Handshake, MessageCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface SwapDeal {
  id: string
  proposal_id: string
  user1_id: string
  user2_id: string
  item1_id: string
  item2_id: string | null
  conversation_id: string
  status: 'negotiating' | 'agreed' | 'shipping' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  last_message_at: string | null
  unread_count: number
  other_user: { user_id: string; display_name: string; avatar_url: string | null; country: string } | null
  my_item: { id: string; title: string; images: string[] } | null
  their_item: { id: string; title: string; images: string[] } | null
  proposal: any
}

interface SwapConversationListProps {
  userId: string
  accessToken: string
  projectId: string
  publicAnonKey: string
  onSelectProposal: (proposal: SwapProposal) => void
  onSelectConversation: (conversationId: string, proposal: SwapProposal) => void
}

const DEAL_STATUS_NEXT: Record<string, { label: string; nextStatus: string; color: string } | null> = {
  negotiating: { label: 'Mark as Agreed', nextStatus: 'agreed',   color: 'text-purple-300 border-purple-500/40 bg-purple-900/30 hover:bg-purple-800/40' },
  agreed:      { label: 'Mark as Shipped', nextStatus: 'shipping', color: 'text-orange-300 border-orange-500/40 bg-orange-900/30 hover:bg-orange-800/40' },
  shipping:    { label: 'Confirm Received', nextStatus: 'completed', color: 'text-green-300 border-green-500/40 bg-green-900/30 hover:bg-green-800/40' },
  completed:   null,
  cancelled:   null,
}

const DEAL_STATUS_LABEL: Record<string, string> = {
  negotiating: 'Discussing',
  agreed:      'Agreed',
  shipping:    'Shipping',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const DEAL_STATUS_COLOR: Record<string, string> = {
  negotiating: 'text-cyan-300',
  agreed:      'text-purple-300',
  shipping:    'text-orange-300',
  completed:   'text-green-300',
  cancelled:   'text-slate-400',
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
  const [activeDeals, setActiveDeals] = useState<SwapDeal[]>([])
  const [incomingExpanded, setIncomingExpanded] = useState(true)
  const [outgoingExpanded, setOutgoingExpanded] = useState(true)
  const [dealsExpanded, setDealsExpanded] = useState(true)
  const [updatingDeal, setUpdatingDeal] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
  }, [userId, accessToken])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      const base = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

      const [inRes, outRes, dealRes] = await Promise.all([
        fetch(`${base}/swap/proposals?type=incoming`, { headers }),
        fetch(`${base}/swap/proposals?type=outgoing`, { headers }),
        fetch(`${base}/swap/deals`, { headers }),
      ])

      if (inRes.ok)   { const d = await inRes.json();   setIncomingProposals(d.proposals || []) }
      if (outRes.ok)  { const d = await outRes.json();  setOutgoingProposals(d.proposals || []) }
      if (dealRes.ok) { const d = await dealRes.json(); setActiveDeals(d.deals || []) }
    } catch (err) {
      console.error('Error fetching SWAP data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDealStatus = async (dealId: string, nextStatus: string) => {
    setUpdatingDeal(dealId)
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/deals/${dealId}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        }
      )
      if (!res.ok) throw new Error('Failed to update')
      toast.success(nextStatus === 'completed' ? '🎉 Trade completed!' : `Deal status updated`)
      fetchAll()
    } catch {
      toast.error('Could not update deal status')
    } finally {
      setUpdatingDeal(null)
    }
  }

  const handleProposalClick = (proposal: SwapProposal) => {
    if (proposal.status === 'accepted' && proposal.conversation_id) {
      onSelectConversation(proposal.conversation_id, proposal)
    } else if (proposal.status === 'pending') {
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
          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{item.title}</h4>
                {isPending && (
                  <span className="px-2 py-0.5 bg-[#E8FF00]/20 text-[#E8FF00] text-xs rounded-full flex-shrink-0">NEW</span>
                )}
                {isActive && (
                  <span className="px-2 py-0.5 bg-[#00FF85]/20 text-[#00FF85] text-xs rounded-full flex-shrink-0">ACTIVE</span>
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
                <span className="truncate">{isPending ? 'Awaiting response' : 'Discussion open'}</span>
              </div>
            </div>
          </div>
          {proposal.message && isPending && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 pl-15">
              &ldquo;{proposal.message}&rdquo;
            </p>
          )}
        </div>
      </motion.button>
    )
  }

  const incomingPending = incomingProposals.filter(p => p.status === 'pending')
  const outgoingPending = outgoingProposals.filter(p => p.status === 'pending')
  const ongoingDeals = activeDeals.filter(d => d.status !== 'completed' && d.status !== 'cancelled')

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

  const hasAnything = incomingProposals.length > 0 || outgoingProposals.length > 0 || activeDeals.length > 0

  if (!hasAnything) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF00E5]/20 to-[#E8FF00]/20 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No SWAP Deals Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Your SWAP proposals and deals will appear here.</p>
          <p className="text-xs text-muted-foreground">Add items to your inventory and start proposing trades!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="p-4 space-y-4">

        {/* ── Active Deals ────────────────────────────────── */}
        {activeDeals.length > 0 && (
          <div>
            <button
              onClick={() => setDealsExpanded(!dealsExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                <Handshake className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <h3 className="font-semibold">Active Deals</h3>
                  <p className="text-xs text-muted-foreground">{ongoingDeals.length} in progress</p>
                </div>
              </div>
              {dealsExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {dealsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {activeDeals.map(deal => {
                    const nextAction = DEAL_STATUS_NEXT[deal.status]
                    return (
                      <div key={deal.id} className="p-4 border border-border/50 rounded-xl space-y-3">
                        {/* Deal header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                              {deal.other_user?.avatar_url ? (
                                <img src={deal.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-sm truncate">{deal.other_user?.display_name || 'Trader'}</span>
                          </div>
                          <span className={`text-xs font-black uppercase tracking-wide ${DEAL_STATUS_COLOR[deal.status]}`}>
                            {DEAL_STATUS_LABEL[deal.status]}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {deal.my_item && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                              {deal.my_item.images?.[0] && (
                                <img src={deal.my_item.images[0]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              )}
                              <span className="truncate text-muted-foreground">{deal.my_item.title}</span>
                            </div>
                          )}
                          {deal.their_item && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                              {deal.their_item.images?.[0] && (
                                <img src={deal.their_item.images[0]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              )}
                              <span className="truncate text-muted-foreground">{deal.their_item.title}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions row */}
                        <div className="flex gap-2">
                          {/* Open Chat */}
                          <button
                            onClick={() => {
                              // Build a minimal proposal-like object for onSelectConversation
                              const syntheticProposal = {
                                id: deal.proposal_id,
                                created_at: deal.created_at,
                                status: 'accepted' as const,
                                swap_item_id: deal.item1_id,
                                proposer_item_id: deal.item2_id,
                                proposer_user_id: deal.user1_id === userId ? deal.user2_id : deal.user1_id,
                                message: null,
                                swap_item: { id: deal.item1_id, title: deal.my_item?.title || '', category: '', description: '', condition: '', images: deal.my_item?.images || [], user_profile: { user_id: deal.user1_id, display_name: '', avatar_url: null, country: '' } },
                                proposer_item: { id: deal.item2_id || '', title: deal.their_item?.title || '', category: '', description: '', condition: '', images: deal.their_item?.images || [] },
                                proposer_profile: { user_id: deal.other_user?.user_id || '', display_name: deal.other_user?.display_name || 'Trader', avatar_url: deal.other_user?.avatar_url || null, country: deal.other_user?.country || '' },
                                conversation_id: deal.conversation_id,
                              }
                              onSelectConversation(deal.conversation_id, syntheticProposal)
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat
                            {deal.unread_count > 0 && (
                              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black">{deal.unread_count}</span>
                            )}
                          </button>

                          {/* Status progression */}
                          {nextAction && deal.status !== 'completed' && deal.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateDealStatus(deal.id, nextAction.nextStatus)}
                              disabled={updatingDeal === deal.id}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black border transition-colors disabled:opacity-50 ${nextAction.color}`}
                            >
                              {updatingDeal === deal.id ? (
                                <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {nextAction.label}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Items I Own (Incoming Proposals) ────────────── */}
        {incomingProposals.length > 0 && (
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
                    {incomingPending.length} pending
                  </p>
                </div>
              </div>
              {incomingExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
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

        {/* ── Items I Want (Outgoing Proposals) ───────────── */}
        {outgoingProposals.length > 0 && (
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
                    {outgoingPending.length} pending
                  </p>
                </div>
              </div>
              {outgoingExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
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
