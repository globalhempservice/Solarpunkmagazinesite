import { useState } from 'react'
import { motion } from 'motion/react'
import { X, Package, AlertCircle, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

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

interface SwapProposalCardProps {
  proposal: SwapProposal
  userId: string
  accessToken: string
  projectId: string
  isIncoming: boolean // true if someone wants my item, false if I want their item
  onClose: () => void
  onAccept: (conversationId: string) => void
  onDecline: () => void
}

export function SwapProposalCard({
  proposal,
  userId,
  accessToken,
  projectId,
  isIncoming,
  onClose,
  onAccept,
  onDecline
}: SwapProposalCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const myItem = isIncoming ? proposal.swap_item : proposal.proposer_item
  const theirItem = isIncoming ? proposal.proposer_item : proposal.swap_item
  const otherUser = isIncoming ? proposal.proposer_profile : proposal.swap_item.user_profile

  const handleAccept = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals/${proposal.id}/accept`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to accept proposal')
      }

      const data = await response.json()
      
      // Notify parent component with the conversation ID
      if (data.conversation_id) {
        onAccept(data.conversation_id)
      }
    } catch (err) {
      console.error('Error accepting proposal:', err)
      setError('Failed to accept proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals/${proposal.id}/decline`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to decline proposal')
      }

      onDecline()
    } catch (err) {
      console.error('Error declining proposal:', err)
      setError('Failed to decline proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h2 className="font-semibold">SWAP Proposal</h2>
          <p className="text-xs text-muted-foreground">
            {isIncoming ? 'Someone wants to trade with you' : 'Waiting for response'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Privacy Notice */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF00E5]/10 to-[#E8FF00]/10 border border-[#FF00E5]/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E8FF00] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Privacy-Protected SWAP</h4>
              <p className="text-xs text-muted-foreground">
                {isIncoming 
                  ? "This user's identity is hidden. If you accept, their name and location will be revealed, and you can discuss details privately."
                  : "Your proposal is pending. If accepted, you'll be able to chat and arrange the trade."}
              </p>
            </div>
          </div>
        </div>

        {/* Proposer Info (Anonymous) */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF00E5]/30 to-[#00D9FF]/30 flex items-center justify-center">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Anonymous Trader</p>
            <p className="text-sm text-muted-foreground">
              {otherUser.country} 🌍
            </p>
          </div>
        </div>

        {/* THEY WANT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#FF00E5]" />
            <h3 className="font-semibold text-sm">THEY WANT</h3>
          </div>
          <div className="p-4 rounded-xl border-2 border-[#FF00E5]/30 bg-[#FF00E5]/5">
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {myItem.images && myItem.images.length > 0 ? (
                  <img 
                    src={myItem.images[0]} 
                    alt={myItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{myItem.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {myItem.category} • {myItem.condition}
                </p>
                {myItem.description && (
                  <p className="text-sm line-clamp-2">{myItem.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* THEY OFFER */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#00D9FF]" />
            <h3 className="font-semibold text-sm">THEY OFFER</h3>
          </div>
          <div className="p-4 rounded-xl border-2 border-[#00D9FF]/30 bg-[#00D9FF]/5">
            <div className="flex gap-4">
              {/* Item Image */}
              <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {theirItem.images && theirItem.images.length > 0 ? (
                  <img 
                    src={theirItem.images[0]} 
                    alt={theirItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{theirItem.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {theirItem.category} • {theirItem.condition}
                </p>
                {theirItem.description && (
                  <p className="text-sm line-clamp-2">{theirItem.description}</p>
                )}
              </div>
            </div>

            {/* Personal Message */}
            {proposal.message && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Their message:</p>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm italic">"{proposal.message}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Only show for incoming proposals */}
      {isIncoming && proposal.status === 'pending' && (
        <div className="p-4 border-t border-border/50 bg-card/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="px-4 py-3 rounded-xl border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-50 transition-all font-medium text-red-500 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              DECLINE
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-4 py-3 rounded-xl border-2 border-[#00FF85]/30 bg-[#00FF85]/10 hover:bg-[#00FF85]/20 disabled:opacity-50 transition-all font-medium text-[#00FF85] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#00FF85]/30 border-t-[#00FF85] rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              ACCEPT & CHAT
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Accepting will reveal both identities and open a private chat
          </p>
        </div>
      )}

      {/* Status Display for outgoing or non-pending proposals */}
      {(!isIncoming || proposal.status !== 'pending') && (
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <p className="text-center text-sm text-muted-foreground">
            {proposal.status === 'accepted' && 'Proposal accepted! You can now chat.'}
            {proposal.status === 'rejected' && 'This proposal was declined.'}
            {proposal.status === 'cancelled' && 'This proposal was cancelled.'}
            {!isIncoming && proposal.status === 'pending' && 'Waiting for the other user to respond...'}
          </p>
        </div>
      )}
    </div>
  )
}
