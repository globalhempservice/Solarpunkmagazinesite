import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Sparkles, MessageCircle, ChevronDown, ChevronUp, Zap, Shield, TrendingUp, Clock, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CountryFlag } from '../profile/CountryFlag';
import { motion, AnimatePresence } from 'motion/react';
import { ProposeSwapModal } from './ProposeSwapModal';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';

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
  power_level?: number;
  user_profile: {
    display_name: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
}

interface SwapItemDetailModalProps {
  item: SwapItem;
  userId: string | null;
  accessToken?: string;
  onClose: () => void;
  onProposalSent: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  well_loved: 'Well-Loved',
  vintage: 'Vintage',
};

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Clothing',
  accessories: 'Accessories',
  home_goods: 'Home Goods',
  wellness: 'Wellness',
  construction: 'Construction',
  other: 'Other',
};

function getRarityLabel(level: number): { label: string; color: string; border: string } {
  if (level >= 10) return { label: 'LEGENDARY', color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300', border: 'border-yellow-400/60' }
  if (level >= 9)  return { label: 'EPIC',      color: 'text-fuchsia-300', border: 'border-fuchsia-500/60' }
  if (level >= 7)  return { label: 'RARE',       color: 'text-cyan-300',    border: 'border-cyan-400/60' }
  if (level >= 4)  return { label: 'UNCOMMON',   color: 'text-emerald-300', border: 'border-emerald-500/60' }
  return           { label: 'COMMON',     color: 'text-slate-400',   border: 'border-slate-500/40' }
}

export function SwapItemDetailModal({ item, userId, accessToken, onClose, onProposalSent }: SwapItemDetailModalProps) {
  const isOwnItem = userId === item.user_id;
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [isProposeSwapModalOpen, setProposeSwapModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const powerLevel = item.power_level || 1;
  const rarity = getRarityLabel(powerLevel);

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/items/${item.id}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Listing removed');
      onClose();
    } catch {
      toast.error('Could not delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-x-0 top-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[200] p-4" style={{ bottom: 'var(--nav-bottom)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-purple-950/90 via-fuchsia-950/90 to-pink-950/90 border-2 border-fuchsia-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        
        {/* Close button - Top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-fuchsia-500/30 hover:bg-fuchsia-500/20 transition-all flex items-center justify-center group"
        >
          <X className="w-5 h-5 text-fuchsia-300 group-hover:text-white transition-colors" />
        </button>

        {/* Scrollable content */}
        <div className="relative overflow-y-auto max-h-[90vh] custom-scrollbar">
          {/* Hero Image Section with Overlays */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50">
            {/* Image */}
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-32 h-32 text-fuchsia-500/30" />
              </div>
            )}

            {/* Dark gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {/* Power Level Badge */}
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-2 border-yellow-300/50 font-black text-sm px-3 py-1 shadow-lg">
                <Zap className="w-4 h-4 mr-1" />
                LVL {powerLevel}
              </Badge>

              {/* Rarity Badge */}
              <Badge className={`bg-black/70 backdrop-blur-sm border-2 ${rarity.border} font-black text-sm px-3 py-1 shadow-lg`}>
                <span className={rarity.color}>{rarity.label}</span>
              </Badge>

              {/* Hemp Badge */}
              {item.hemp_inside && (
                <Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-2 border-emerald-300/50 font-black text-sm px-3 py-1 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Hemp {item.hemp_percentage ? `${item.hemp_percentage}%` : '100%'}
                </Badge>
              )}
            </div>

            {/* PROPOSE SWAP BUTTON - Over image, bottom center */}
            {!isOwnItem && userId && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)]"
              >
                <Button
                  onClick={() => setProposeSwapModalOpen(true)}
                  className="w-full h-14 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-300 hover:via-orange-400 hover:to-pink-400 text-black font-black text-lg shadow-2xl border-2 border-yellow-300/50 relative overflow-hidden group"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <MessageCircle className="w-6 h-6 mr-2 relative z-10" />
                  <span className="relative z-10">PROPOSE SWAP DEAL</span>
                  <Sparkles className="w-5 h-5 ml-2 relative z-10 animate-pulse" />
                </Button>
              </motion.div>
            )}

            {/* Own item indicator + delete */}
            {isOwnItem && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] flex gap-3">
                <Badge className="flex-1 h-14 bg-purple-900/80 backdrop-blur-sm border-2 border-purple-500/50 text-purple-200 font-black text-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 mr-2" />
                  YOUR ITEM
                </Badge>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-14 px-4 rounded-xl bg-red-900/70 backdrop-blur-sm border-2 border-red-500/50 text-red-300 hover:bg-red-800/80 hover:border-red-400/70 transition-all disabled:opacity-50 flex items-center gap-2 font-black"
                >
                  <Trash2 className="w-5 h-5" />
                  {deleting ? '...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="relative p-6 space-y-4">
            {/* Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-black text-3xl text-white mb-2 leading-tight">{item.title}</h1>
              
              {/* Quick stats bar */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-fuchsia-300">
                  <Package className="w-4 h-4" />
                  <span className="font-bold">{CATEGORY_LABELS[item.category] || item.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-pink-300">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">{CONDITION_LABELS[item.condition] || item.condition}</span>
                </div>
                {item.years_in_use && item.years_in_use > 0 && (
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{item.years_in_use}y</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Owner Info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 p-4 bg-black/30 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl relative overflow-hidden"
            >
              {/* Privacy overlay indicator */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-purple-900/90 border-purple-500/50 text-purple-200 text-xs font-black px-2 py-0.5">
                  <Shield className="w-3 h-3 mr-1" />
                  PRIVATE
                </Badge>
              </div>

              {/* Blurred Avatar */}
              <div className="relative">
                {item.user_profile?.avatar_url ? (
                  <img
                    src={item.user_profile.avatar_url}
                    alt="Private Seller"
                    className="w-12 h-12 rounded-full border-2 border-fuchsia-400/50 shadow-lg blur-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-pink-500/30 border-2 border-fuchsia-400/50 blur-md" />
                )}
                {/* Lock icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-purple-900/90 border border-purple-400/50 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                </div>
              </div>

              {/* Blurred Name */}
              <div className="flex-1">
                <p className="font-black text-white blur-sm select-none">Anonymous User</p>
                <p className="text-sm text-fuchsia-300/70">Identity revealed after match</p>
              </div>

              {/* Blurred Country Flag */}
              {item.country && (
                <div className="blur-sm">
                  <CountryFlag countryCode={item.country} size="md" />
                </div>
              )}
            </motion.div>

            {/* Description - Always visible */}
            {item.description && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-purple-900/20 border border-fuchsia-500/20 rounded-xl"
              >
                <p className="text-fuchsia-100/90 leading-relaxed">{item.description}</p>
              </motion.div>
            )}

            {/* Expandable Details Section */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="border-2 border-fuchsia-500/20 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm"
            >
              <button
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-fuchsia-500/10 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 group-hover:from-fuchsia-500/30 group-hover:to-pink-500/30 transition-colors">
                    <Package className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <span className="font-black text-white">Item Details</span>
                </div>
                {detailsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-fuchsia-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-fuchsia-300" />
                )}
              </button>

              <AnimatePresence>
                {detailsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-fuchsia-300/60 uppercase tracking-wider font-bold">Category</p>
                        <p className="text-white font-bold">{CATEGORY_LABELS[item.category] || item.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-fuchsia-300/60 uppercase tracking-wider font-bold">Condition</p>
                        <p className="text-white font-bold">{CONDITION_LABELS[item.condition] || item.condition}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-fuchsia-300/60 uppercase tracking-wider font-bold">Location</p>
                        <div className="flex items-center gap-2">
                          {item.country && <CountryFlag countryCode={item.country} size="sm" />}
                          <p className="text-white font-bold">
                            {item.city ? `${item.city}, ${item.country}` : item.country || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-fuchsia-300/60 uppercase tracking-wider font-bold">Shipping</p>
                        <p className="text-white font-bold">{item.willing_to_ship ? '✓ Available' : '✗ Local only'}</p>
                      </div>
                      {item.years_in_use && item.years_in_use > 0 && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-xs text-fuchsia-300/60 uppercase tracking-wider font-bold">Years in Use</p>
                          <p className="text-white font-bold">{item.years_in_use} year{item.years_in_use !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Expandable Story Section */}
            {item.story && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-2 border-pink-500/20 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm"
              >
                <button
                  onClick={() => setStoryExpanded(!storyExpanded)}
                  className="w-full p-4 flex items-center justify-between hover:bg-pink-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 group-hover:from-pink-500/30 group-hover:to-orange-500/30 transition-colors">
                      <Sparkles className="w-5 h-5 text-pink-300" />
                    </div>
                    <span className="font-black text-white">Item Story</span>
                  </div>
                  {storyExpanded ? (
                    <ChevronUp className="w-5 h-5 text-pink-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-pink-300" />
                  )}
                </button>

                <AnimatePresence>
                  {storyExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2">
                        <p className="text-fuchsia-100/90 italic leading-relaxed">
                          &ldquo;{item.story}&rdquo;
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Bottom spacing for scroll */}
            <div className="h-4" />
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #d946ef, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #e879f9, #f472b6);
        }
      `}</style>

      {/* Propose Swap Modal */}
      {isProposeSwapModalOpen && userId && accessToken && (
        <ProposeSwapModal
          theirItem={item}
          userId={userId}
          accessToken={accessToken}
          onClose={() => setProposeSwapModalOpen(false)}
          onProposalSent={() => {
            setProposeSwapModalOpen(false);
            onProposalSent();
          }}
        />
      )}
    </div>,
    document.body
  );
}