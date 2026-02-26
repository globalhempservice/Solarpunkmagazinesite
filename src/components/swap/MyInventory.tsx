import { useState, useEffect } from 'react';
import { Package, Heart, RefreshCw, MessageSquare, ArrowLeft, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { SwapItemCard } from './SwapItemCard';

interface SwapItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  hemp_inside: boolean;
  hemp_percentage: number | null;
  images: string[];
  country: string | null;
  city: string | null;
  willing_to_ship: boolean;
  story: string | null;
  years_in_use: number | null;
  status: string;
  created_at: string;
  user_profile: {
    display_name: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
  power_level?: number;
}

interface LikedItem extends SwapItem {
  liked_at: string;
  expires_at: string;
}

interface SwapProposal {
  id: string;
  my_item: SwapItem;
  their_item: SwapItem;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

interface MyInventoryProps {
  userId: string;
  accessToken: string;
  onBack: () => void;
  onItemClick?: (item: SwapItem) => void;
}

export function MyInventory({ userId, accessToken, onBack, onItemClick }: MyInventoryProps) {
  const [activeTab, setActiveTab] = useState<'owned' | 'liked' | 'to-swap' | 'deals'>('owned');
  const [ownedItems, setOwnedItems] = useState<SwapItem[]>([]);
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [swapProposals, setSwapProposals] = useState<SwapProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`;

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'owned') {
        await fetchOwnedItems();
      } else if (activeTab === 'liked') {
        await fetchLikedItems();
      } else if (activeTab === 'to-swap') {
        await fetchSwapProposals();
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedItems = async () => {
    try {
      const response = await fetch(`${serverUrl}/swap/items?user_id=${userId}&status=active`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter to only show items owned by this user
        const ownedItems = (data.items || []).filter((item: SwapItem) => item.user_id === userId);
        setOwnedItems(ownedItems);
      } else {
        console.error('Error response from server:', data);
      }
    } catch (error) {
      console.error('Error fetching owned items:', error);
    }
  };

  const fetchLikedItems = async () => {
    try {
      const response = await fetch(`${serverUrl}/swap/likes?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setLikedItems(data.likes || []);
      }
    } catch (error) {
      console.error('Error fetching liked items:', error);
    }
  };

  const fetchSwapProposals = async () => {
    try {
      const response = await fetch(`${serverUrl}/swap/proposals?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSwapProposals(data.proposals || []);
      }
    } catch (error) {
      console.error('Error fetching swap proposals:', error);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff <= 0) return 'Expired';
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'owned': return ownedItems.length;
      case 'liked': return likedItems.length;
      case 'to-swap': return swapProposals.filter(p => p.status === 'pending').length;
      case 'deals': return swapProposals.filter(p => p.status === 'accepted').length;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950 to-pink-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-purple-950 via-fuchsia-950 to-pink-950 border-b-2 border-fuchsia-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/20 gap-2 font-black"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-2xl border-2 border-fuchsia-400/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-400/20 to-pink-400/20 blur-xl" />
              <Package className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-3xl text-white">My SWAP Inventory</h1>
              <p className="text-fuchsia-200/70">Manage your items, likes & swap deals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-purple-950/50 border-2 border-fuchsia-500/20 p-1 rounded-2xl">
            <TabsTrigger 
              value="owned" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-black gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Owned</span>
              <Badge variant="secondary" className="ml-1 bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-400/30">
                {getTabCount('owned')}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="liked" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-black gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Liked</span>
              <Badge variant="secondary" className="ml-1 bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-400/30">
                {getTabCount('liked')}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="to-swap" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-black gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">To Swap</span>
              <Badge variant="secondary" className="ml-1 bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-400/30">
                {getTabCount('to-swap')}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="deals" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-black gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Deals</span>
              <Badge variant="secondary" className="ml-1 bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-400/30">
                {getTabCount('deals')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* OWNED Tab */}
          <TabsContent value="owned" className="mt-6">
            <div className="mb-4">
              <h2 className="font-black text-xl text-white mb-2">Items You Own</h2>
              <p className="text-fuchsia-200/60">These are items you've listed and can offer in swaps</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : ownedItems.length === 0 ? (
              <div className="bg-purple-950/50 border-2 border-dashed border-fuchsia-500/20 rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-fuchsia-400/50" />
                <h3 className="font-black text-xl mb-2 text-white">No Items Yet</h3>
                <p className="text-fuchsia-200/60 mb-4">Start by adding items you want to swap</p>
                <Button className="bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black">
                  <Package className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedItems.map((item) => (
                  <SwapItemCard
                    key={item.id}
                    item={item}
                    onClick={() => onItemClick?.(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* LIKED Tab */}
          <TabsContent value="liked" className="mt-6">
            <div className="mb-4">
              <h2 className="font-black text-xl text-white mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Items You Like
              </h2>
              <p className="text-fuchsia-200/60">You have 24 hours to propose a swap for these items</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : likedItems.length === 0 ? (
              <div className="bg-purple-950/50 border-2 border-dashed border-fuchsia-500/20 rounded-2xl p-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-fuchsia-400/50" />
                <h3 className="font-black text-xl mb-2 text-white">No Liked Items</h3>
                <p className="text-fuchsia-200/60">Swipe right on items you want to swap for</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedItems.map((item) => (
                  <div key={item.id} className="relative">
                    <SwapItemCard
                      item={item}
                      onClick={() => onItemClick?.(item)}
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-pink-500/90 text-white border-pink-400/50 font-black gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(item.expires_at)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TO SWAP Tab */}
          <TabsContent value="to-swap" className="mt-6">
            <div className="mb-4">
              <h2 className="font-black text-xl text-white mb-2 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-fuchsia-400" />
                Pending Swap Proposals
              </h2>
              <p className="text-fuchsia-200/60">Waiting for the other party to respond</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : swapProposals.filter(p => p.status === 'pending').length === 0 ? (
              <div className="bg-purple-950/50 border-2 border-dashed border-fuchsia-500/20 rounded-2xl p-12 text-center">
                <RefreshCw className="w-16 h-16 mx-auto mb-4 text-fuchsia-400/50" />
                <h3 className="font-black text-xl mb-2 text-white">No Pending Swaps</h3>
                <p className="text-fuchsia-200/60">Propose swaps from your liked items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {swapProposals
                  .filter(p => p.status === 'pending')
                  .map((proposal) => (
                    <SwapProposalCard key={proposal.id} proposal={proposal} />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* DEALS Tab */}
          <TabsContent value="deals" className="mt-6">
            <div className="mb-4">
              <h2 className="font-black text-xl text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Active Swap Deals
              </h2>
              <p className="text-fuchsia-200/60">Accepted proposals - negotiate in SWAP Deals inbox</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : swapProposals.filter(p => p.status === 'accepted').length === 0 ? (
              <div className="bg-purple-950/50 border-2 border-dashed border-fuchsia-500/20 rounded-2xl p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-fuchsia-400/50" />
                <h3 className="font-black text-xl mb-2 text-white">No Active Deals</h3>
                <p className="text-fuchsia-200/60">When proposals are accepted, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {swapProposals
                  .filter(p => p.status === 'accepted')
                  .map((proposal) => (
                    <SwapProposalCard key={proposal.id} proposal={proposal} isAccepted />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Swap Proposal Card Component
interface SwapProposalCardProps {
  proposal: SwapProposal;
  isAccepted?: boolean;
}

function SwapProposalCard({ proposal, isAccepted = false }: SwapProposalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-950/50 border-2 border-fuchsia-500/20 rounded-2xl p-6 hover:border-fuchsia-400/50 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <Badge className={isAccepted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>
          {isAccepted ? 'Accepted' : 'Pending'}
        </Badge>
        <div className="flex items-center gap-2 text-fuchsia-200/60">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-bold">
            {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Item */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-fuchsia-400" />
            <h3 className="font-black text-white">You Offer</h3>
          </div>
          <div className="bg-purple-900/30 border border-fuchsia-500/20 rounded-xl p-3">
            <p className="font-bold text-white mb-1">{proposal.my_item.title}</p>
            <p className="text-sm text-fuchsia-200/60 line-clamp-2">{proposal.my_item.description}</p>
          </div>
        </div>

        {/* Their Item */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="font-black text-white">You Get</h3>
          </div>
          <div className="bg-purple-900/30 border border-fuchsia-500/20 rounded-xl p-3">
            <p className="font-bold text-white mb-1">{proposal.their_item.title}</p>
            <p className="text-sm text-fuchsia-200/60 line-clamp-2">{proposal.their_item.description}</p>
          </div>
        </div>
      </div>

      {isAccepted && (
        <Button className="w-full mt-4 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black gap-2">
          <MessageSquare className="w-4 h-4" />
          Continue in SWAP Deals Inbox
        </Button>
      )}
    </motion.div>
  );
}

// Import projectId from utils
import { projectId } from '../../utils/supabase/info';