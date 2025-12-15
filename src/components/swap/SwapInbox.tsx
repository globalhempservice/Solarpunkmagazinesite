import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  Send, 
  Handshake, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  Sparkles,
  MessageCircle,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SwapProposal {
  id: string;
  swap_item_id: string;
  proposer_user_id: string;
  proposer_item_id: string | null;
  proposal_type: 'item' | 'service';
  offer_title: string | null;
  offer_description: string | null;
  offer_category: string | null;
  offer_condition: string | null;
  offer_images: string[];
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  responded_at: string | null;
  swap_item?: any;
  proposer_item?: any;
  proposer_profile?: any;
}

interface SwapDeal {
  id: string;
  proposal_id: string;
  user1_id: string;
  user2_id: string;
  item1_id: string;
  item2_id: string | null;
  conversation_id: string;
  status: 'negotiating' | 'agreed' | 'shipping' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  unread_count: number;
  other_user: any;
  my_item: any;
  their_item: any;
  proposal: any;
}

type TabType = 'incoming' | 'active' | 'outgoing';

export function SwapInbox() {
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [incomingProposals, setIncomingProposals] = useState<SwapProposal[]>([]);
  const [outgoingProposals, setOutgoingProposals] = useState<SwapProposal[]>([]);
  const [activeDeals, setActiveDeals] = useState<SwapDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('supabase_access_token');
      if (!token) {
        setError('Please sign in to view your SWAP inbox');
        setLoading(false);
        return;
      }

      if (activeTab === 'incoming') {
        await loadIncomingProposals(token);
      } else if (activeTab === 'outgoing') {
        await loadOutgoingProposals(token);
      } else if (activeTab === 'active') {
        await loadActiveDeals(token);
      }
    } catch (err: any) {
      console.error('Error loading SWAP inbox:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadIncomingProposals = async (token: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals?type=incoming`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load incoming proposals');
    }

    const data = await response.json();
    setIncomingProposals(data.proposals || []);
  };

  const loadOutgoingProposals = async (token: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals?type=outgoing`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load outgoing proposals');
    }

    const data = await response.json();
    setOutgoingProposals(data.proposals || []);
  };

  const loadActiveDeals = async (token: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/deals`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load active deals');
    }

    const data = await response.json();
    setActiveDeals(data.deals || []);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const token = localStorage.getItem('supabase_access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals/${proposalId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'accepted' })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to accept proposal');
      }

      // Reload data
      await loadData();
      
      // Switch to active deals tab
      setActiveTab('active');
    } catch (err: any) {
      console.error('Error accepting proposal:', err);
      alert('Failed to accept proposal: ' + err.message);
    }
  };

  const handleDeclineProposal = async (proposalId: string) => {
    try {
      const token = localStorage.getItem('supabase_access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/proposals/${proposalId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'declined' })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to decline proposal');
      }

      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error declining proposal:', err);
      alert('Failed to decline proposal: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-fuchsia-500 to-pink-500 p-3 rounded-2xl">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black">SWAP Inbox</h1>
              <p className="text-sm text-gray-400">Manage your barter proposals & deals</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border-2 border-fuchsia-500/30 rounded-2xl p-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {/* Incoming Tab */}
            <button
              onClick={() => setActiveTab('incoming')}
              className={`relative px-4 py-3 rounded-xl font-black text-sm transition-all ${
                activeTab === 'incoming'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-black/20 text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Inbox className="w-4 h-4" />
                <span>Incoming</span>
              </div>
              {incomingProposals.filter(p => p.status === 'pending').length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {incomingProposals.filter(p => p.status === 'pending').length}
                </div>
              )}
            </button>

            {/* Active Deals Tab */}
            <button
              onClick={() => setActiveTab('active')}
              className={`relative px-4 py-3 rounded-xl font-black text-sm transition-all ${
                activeTab === 'active'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-black/20 text-green-300 hover:bg-green-500/10 border border-green-500/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Handshake className="w-4 h-4" />
                <span>Active</span>
              </div>
              {activeDeals.filter(d => d.unread_count > 0).length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {activeDeals.filter(d => d.unread_count > 0).length}
                </div>
              )}
            </button>

            {/* Outgoing Tab */}
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-4 py-3 rounded-xl font-black text-sm transition-all ${
                activeTab === 'outgoing'
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-black/20 text-orange-300 hover:bg-orange-500/10 border border-orange-500/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Sent</span>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            {activeTab === 'incoming' && (
              <IncomingTab 
                proposals={incomingProposals}
                onAccept={handleAcceptProposal}
                onDecline={handleDeclineProposal}
              />
            )}
            {activeTab === 'active' && (
              <ActiveDealsTab deals={activeDeals} />
            )}
            {activeTab === 'outgoing' && (
              <OutgoingTab proposals={outgoingProposals} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INCOMING PROPOSALS TAB
// ============================================================================
interface IncomingTabProps {
  proposals: SwapProposal[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function IncomingTab({ proposals, onAccept, onDecline }: IncomingTabProps) {
  const pendingProposals = proposals.filter(p => p.status === 'pending');

  if (pendingProposals.length === 0) {
    return (
      <motion.div
        key="incoming"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/30 rounded-2xl p-12 text-center"
      >
        <Inbox className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
        <h3 className="text-xl font-black text-cyan-300 mb-2">No Incoming Proposals</h3>
        <p className="text-cyan-400/60">When someone wants your items, proposals will appear here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="incoming"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {pendingProposals.map((proposal) => (
        <IncomingProposalCard
          key={proposal.id}
          proposal={proposal}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </motion.div>
  );
}

// ============================================================================
// INCOMING PROPOSAL CARD (Anonymous)
// ============================================================================
interface IncomingProposalCardProps {
  proposal: SwapProposal;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function IncomingProposalCard({ proposal, onAccept, onDecline }: IncomingProposalCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/40 rounded-2xl p-4 hover:border-cyan-400/60 transition-all">
      {/* Header - Anonymous User */}
      <div className="flex items-start gap-4 mb-4">
        {/* Anonymous Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
            <EyeOff className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
            Anonymous
          </div>
        </div>

        {/* Proposal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-black">Privacy-Protected Proposal</h3>
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400">
              {new Date(proposal.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-cyan-300/80 mb-2">
            Someone wants to swap for your item
          </p>

          {/* Target Item */}
          {proposal.swap_item && (
            <div className="bg-black/30 rounded-lg p-3 mb-3 border border-cyan-500/20">
              <p className="text-xs text-cyan-400 mb-1 font-bold">THEY WANT:</p>
              <div className="flex items-center gap-3">
                {proposal.swap_item.images?.[0] && (
                  <img 
                    src={proposal.swap_item.images[0]} 
                    alt={proposal.swap_item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-cyan-500/30"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{proposal.swap_item.title}</p>
                  <p className="text-xs text-cyan-400">{proposal.swap_item.category}</p>
                </div>
              </div>
            </div>
          )}

          {/* What They Offer */}
          <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-lg p-3 border border-orange-500/30">
            <p className="text-xs text-orange-400 mb-1 font-bold">THEY OFFER:</p>
            
            {proposal.proposal_type === 'item' && proposal.proposer_item ? (
              <div className="flex items-center gap-3">
                {proposal.proposer_item.images?.[0] && (
                  <img 
                    src={proposal.proposer_item.images[0]} 
                    alt={proposal.proposer_item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-orange-500/30"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{proposal.proposer_item.title}</p>
                  <p className="text-xs text-orange-400">{proposal.proposer_item.category}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white font-bold text-sm mb-1">
                  {proposal.offer_title || 'Service/Help'}
                </p>
                <p className="text-xs text-orange-300/80 line-clamp-2">
                  {proposal.offer_description}
                </p>
                {proposal.offer_category && (
                  <div className="mt-1">
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                      {proposal.offer_category}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Personal Message (if any) */}
          {proposal.message && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 w-full text-left bg-black/20 rounded-lg p-3 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-cyan-400 font-bold flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  Personal Message
                </p>
                <ArrowRight className={`w-4 h-4 text-cyan-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </div>
              {expanded && (
                <p className="text-sm text-white mt-2 whitespace-pre-wrap">
                  {proposal.message}
                </p>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <EyeOff className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-purple-300 font-bold mb-1">Privacy First</p>
            <p className="text-xs text-purple-400/80">
              This user's identity is hidden. If you accept to discuss, both identities will be revealed and you can chat directly.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onDecline(proposal.id)}
          className="px-4 py-3 rounded-xl bg-gradient-to-br from-red-900/30 to-pink-900/30 border-2 border-red-500/40 text-red-300 font-black text-sm hover:from-red-900/50 hover:to-pink-900/50 hover:border-red-400/60 transition-all flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Decline
        </button>
        <button
          onClick={() => onAccept(proposal.id)}
          className="px-4 py-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-green-400/60 text-white font-black text-sm hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept to Discuss
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVE DEALS TAB
// ============================================================================
interface ActiveDealsTabProps {
  deals: SwapDeal[];
}

function ActiveDealsTab({ deals }: ActiveDealsTabProps) {
  if (deals.length === 0) {
    return (
      <motion.div
        key="active"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500/30 rounded-2xl p-12 text-center"
      >
        <Handshake className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
        <h3 className="text-xl font-black text-green-300 mb-2">No Active Deals</h3>
        <p className="text-green-400/60">Accept proposals to start negotiating</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {deals.map((deal) => (
        <ActiveDealCard key={deal.id} deal={deal} />
      ))}
    </motion.div>
  );
}

// ============================================================================
// ACTIVE DEAL CARD (Identities Revealed)
// ============================================================================
interface ActiveDealCardProps {
  deal: SwapDeal;
}

function ActiveDealCard({ deal }: ActiveDealCardProps) {
  const statusColors: Record<string, string> = {
    negotiating: 'from-blue-500 to-cyan-500',
    agreed: 'from-purple-500 to-pink-500',
    shipping: 'from-orange-500 to-amber-500',
    completed: 'from-green-500 to-emerald-500',
    cancelled: 'from-gray-500 to-slate-500'
  };

  const statusLabels: Record<string, string> = {
    negotiating: 'Discussing',
    agreed: 'Agreed',
    shipping: 'Shipping',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/40 rounded-2xl p-4 hover:border-green-400/60 transition-all">
      {/* Header - Revealed User */}
      <div className="flex items-start gap-4 mb-4">
        {/* User Avatar */}
        <div className="relative flex-shrink-0">
          {deal.other_user?.avatar_url ? (
            <img 
              src={deal.other_user.avatar_url} 
              alt={deal.other_user.display_name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-green-400/60"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center border-2 border-green-400/60">
              <Eye className="w-8 h-8 text-white" />
            </div>
          )}
          {deal.unread_count > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
              {deal.unread_count}
            </div>
          )}
        </div>

        {/* Deal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-black">{deal.other_user?.display_name || 'User'}</h3>
            {deal.other_user?.country && (
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                {deal.other_user.country}
              </span>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`bg-gradient-to-r ${statusColors[deal.status]} px-3 py-1 rounded-full text-xs font-black text-white`}>
              {statusLabels[deal.status]}
            </div>
            {deal.last_message_at && (
              <span className="text-xs text-green-400">
                Last message: {new Date(deal.last_message_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Swap Items */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* My Item */}
            <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
              <p className="text-xs text-green-400 mb-1 font-bold">YOU OFFER:</p>
              <div className="flex items-center gap-2">
                {deal.my_item?.images?.[0] && (
                  <img 
                    src={deal.my_item.images[0]} 
                    alt={deal.my_item.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <p className="text-white text-xs font-bold flex-1 line-clamp-2">
                  {deal.my_item?.title || 'Item'}
                </p>
              </div>
            </div>

            {/* Their Item */}
            <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
              <p className="text-xs text-orange-400 mb-1 font-bold">THEY OFFER:</p>
              <div className="flex items-center gap-2">
                {deal.their_item?.images?.[0] ? (
                  <img 
                    src={deal.their_item.images[0]} 
                    alt={deal.their_item.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : deal.proposal?.offer_title ? (
                  <Sparkles className="w-10 h-10 text-orange-400" />
                ) : null}
                <p className="text-white text-xs font-bold flex-1 line-clamp-2">
                  {deal.their_item?.title || deal.proposal?.offer_title || 'Service'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          // TODO: Navigate to chat interface
          console.log('Open chat for deal:', deal.id);
        }}
        className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-green-400/60 text-white font-black text-sm hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        Open Chat
        {deal.unread_count > 0 && (
          <span className="ml-1">({deal.unread_count} new)</span>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// OUTGOING PROPOSALS TAB
// ============================================================================
interface OutgoingTabProps {
  proposals: SwapProposal[];
}

function OutgoingTab({ proposals }: OutgoingTabProps) {
  if (proposals.length === 0) {
    return (
      <motion.div
        key="outgoing"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-2 border-orange-500/30 rounded-2xl p-12 text-center"
      >
        <Send className="w-16 h-16 text-orange-400/30 mx-auto mb-4" />
        <h3 className="text-xl font-black text-orange-300 mb-2">No Sent Proposals</h3>
        <p className="text-orange-400/60">Browse items and send your first proposal</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="outgoing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {proposals.map((proposal) => (
        <OutgoingProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </motion.div>
  );
}

// ============================================================================
// OUTGOING PROPOSAL CARD
// ============================================================================
interface OutgoingProposalCardProps {
  proposal: SwapProposal;
}

function OutgoingProposalCard({ proposal }: OutgoingProposalCardProps) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    accepted: <CheckCircle2 className="w-4 h-4" />,
    declined: <XCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />
  };

  const statusColors = {
    pending: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    accepted: 'bg-green-500/20 text-green-300 border-green-500/30',
    declined: 'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };

  return (
    <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-2 border-orange-500/40 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-400" />
          <span className="text-xs text-orange-400">
            Sent {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${statusColors[proposal.status]}`}>
          {statusIcons[proposal.status]}
          <span className="capitalize">{proposal.status}</span>
        </div>
      </div>

      {/* Target Item */}
      {proposal.swap_item && (
        <div className="bg-black/30 rounded-lg p-3 mb-3 border border-orange-500/20">
          <p className="text-xs text-orange-400 mb-2 font-bold">YOU REQUESTED:</p>
          <div className="flex items-center gap-3">
            {proposal.swap_item.images?.[0] && (
              <img 
                src={proposal.swap_item.images[0]} 
                alt={proposal.swap_item.title}
                className="w-12 h-12 rounded-lg object-cover border border-orange-500/30"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{proposal.swap_item.title}</p>
              <p className="text-xs text-orange-400">{proposal.swap_item.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Your Offer */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-3 border border-cyan-500/30">
        <p className="text-xs text-cyan-400 mb-2 font-bold">YOU OFFERED:</p>
        
        {proposal.proposal_type === 'item' && proposal.proposer_item ? (
          <div className="flex items-center gap-3">
            {proposal.proposer_item.images?.[0] && (
              <img 
                src={proposal.proposer_item.images[0]} 
                alt={proposal.proposer_item.title}
                className="w-12 h-12 rounded-lg object-cover border border-cyan-500/30"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{proposal.proposer_item.title}</p>
              <p className="text-xs text-cyan-400">{proposal.proposer_item.category}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-white font-bold text-sm mb-1">
              {proposal.offer_title || 'Service/Help'}
            </p>
            <p className="text-xs text-cyan-300/80 line-clamp-2">
              {proposal.offer_description}
            </p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {proposal.status === 'pending' && (
        <div className="mt-3 bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
          <p className="text-xs text-orange-300">
            Waiting for response... The item owner will see your proposal anonymously.
          </p>
        </div>
      )}
      {proposal.status === 'accepted' && (
        <div className="mt-3 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs text-green-300 font-bold">
            Accepted! Check your Active Deals tab to continue.
          </p>
        </div>
      )}
      {proposal.status === 'declined' && (
        <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-300">
            This proposal was declined. Keep exploring other items!
          </p>
        </div>
      )}
    </div>
  );
}
