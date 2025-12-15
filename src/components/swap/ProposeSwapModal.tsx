import { useState, useEffect } from 'react';
import { X, Package, Sparkles, Zap, Check, Loader, ArrowDownUp, Wrench, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
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
  user_profile?: {
    display_name: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
}

interface ProposeSwapModalProps {
  theirItem: SwapItem;
  userId: string;
  accessToken: string | undefined;
  onClose: () => void;
  onProposalSent: () => void;
}

type ProposalType = 'item' | 'service';

export function ProposeSwapModal({ theirItem, userId, accessToken, onClose, onProposalSent }: ProposeSwapModalProps) {
  const [proposalType, setProposalType] = useState<ProposalType>('item');
  
  // Item-to-item state
  const [myItems, setMyItems] = useState<SwapItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SwapItem | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  
  // Service/skills state
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`;

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await fetch(`${serverUrl}/swap/items?user_id=${userId}&status=available`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter to only show items owned by this user
        const ownedItems = (data.items || []).filter((item: SwapItem) => item.user_id === userId);
        setMyItems(ownedItems);
      }
    } catch (error) {
      console.error('Error fetching my items:', error);
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleProposeSwap = async () => {
    // Validation
    if (proposalType === 'item' && !selectedItem) {
      toast.error('Please select an item from your inventory');
      return;
    }
    if (proposalType === 'service' && (!serviceTitle.trim() || !serviceDescription.trim())) {
      toast.error('Please provide a title and description for your service');
      return;
    }

    setSubmitting(true);
    try {
      const body: any = {
        swap_item_id: theirItem.id,
        proposal_type: proposalType,
        message: personalMessage.trim() || null
      };

      if (proposalType === 'item') {
        body.proposer_item_id = selectedItem!.id;
      } else {
        body.offer_title = serviceTitle.trim();
        body.offer_description = serviceDescription.trim();
        body.offer_category = serviceCategory || 'Services';
        body.offer_condition = 'One-time';
      }

      const response = await fetch(`${serverUrl}/swap/proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Swap proposal sent! 🔄', {
          description: proposalType === 'item' 
            ? 'Check "My Inventory → To Swap" for updates'
            : 'Your skills offer has been sent'
        });
        onProposalSent();
      } else {
        toast.error('Failed to send proposal', {
          description: data.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Error proposing swap:', error);
      toast.error('Failed to send proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = proposalType === 'item' 
    ? !!selectedItem 
    : !!(serviceTitle.trim() && serviceDescription.trim());

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] px-4 py-4 pb-24">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-purple-950/95 via-fuchsia-950/95 to-pink-950/95 border-2 border-fuchsia-500/40 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[calc(90vh-80px)]"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        
        {/* Header - Compact */}
        <div className="relative border-b-2 border-fuchsia-500/20 p-3 bg-black/20 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-fuchsia-500/30 hover:bg-fuchsia-500/20 transition-all flex items-center justify-center group"
          >
            <X className="w-4 h-4 text-fuchsia-300 group-hover:text-white transition-colors" />
          </button>

          <div className="flex items-center gap-2 pr-10">
            <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-400/30">
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
            </div>
            <div>
              <h2 className="font-black text-base text-white">Make a SWAP</h2>
              <p className="text-xs text-fuchsia-300/70">Choose your offer type</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="relative overflow-y-auto overflow-x-hidden max-h-[calc(100vh-280px)] custom-scrollbar">
          <div className="p-3 space-y-3">
            {/* What I Get */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <h3 className="font-black text-xs text-white">What I Get</h3>
              </div>
              <CompactItemCard item={theirItem} highlight="pink" />
            </div>

            {/* SWAP ICON - Smaller */}
            <motion.div
              animate={{ 
                rotateX: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex justify-center py-1"
            >
              <div className="p-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 border-2 border-fuchsia-400/30">
                <ArrowDownUp className="w-4 h-4 text-fuchsia-300" />
              </div>
            </motion.div>

            {/* What I Propose - TWO TABS */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-yellow-400" />
                <h3 className="font-black text-xs text-white">What I Propose</h3>
              </div>

              {/* Tab Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-xl border border-fuchsia-500/20">
                <button
                  onClick={() => setProposalType('item')}
                  className={`px-3 py-2 rounded-lg font-black text-xs transition-all ${
                    proposalType === 'item'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                      : 'bg-transparent text-fuchsia-300 hover:bg-fuchsia-500/10'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 inline-block mr-1" />
                  Trade Item
                </button>
                <button
                  onClick={() => setProposalType('service')}
                  className={`px-3 py-2 rounded-lg font-black text-xs transition-all ${
                    proposalType === 'service'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg'
                      : 'bg-transparent text-fuchsia-300 hover:bg-fuchsia-500/10'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 inline-block mr-1" />
                  Skills/Help
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {proposalType === 'item' ? (
                  <motion.div
                    key="item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedItem ? (
                      <div className="relative">
                        <CompactItemCard item={selectedItem} highlight="yellow" />
                        <button
                          onClick={() => setShowItemSelector(true)}
                          className="absolute top-1.5 right-1.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-yellow-400/30 hover:bg-yellow-400/20 transition-all text-xs font-bold text-yellow-300 hover:text-yellow-200"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowItemSelector(true)}
                        className="w-full border-2 border-dashed border-yellow-500/30 rounded-xl p-4 hover:border-yellow-400/50 hover:bg-yellow-500/5 transition-all group"
                      >
                        <div className="text-center">
                          <div className="inline-block p-2 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 mb-1.5 group-hover:border-yellow-400/40 transition-all">
                            <Package className="w-6 h-6 text-yellow-400/70 group-hover:text-yellow-300 transition-colors" />
                          </div>
                          <p className="text-yellow-300 font-bold text-xs">Select item from inventory</p>
                          <p className="text-yellow-400/60 text-xs mt-0.5">
                            {loading ? 'Loading items...' : myItems.length > 0 ? `${myItems.length} available` : 'No items yet'}
                          </p>
                        </div>
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="service"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {/* Service Form */}
                    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-400/30 rounded-xl p-3 space-y-2">
                      {/* Title */}
                      <div>
                        <label className="block text-xs font-black text-cyan-300 mb-1">
                          Service Title <span className="text-red-400">*</span>
                        </label>
                        <Input
                          placeholder="e.g., Logo Design, Website Dev, Translation..."
                          value={serviceTitle}
                          onChange={(e) => setServiceTitle(e.target.value)}
                          className="bg-black/30 border-cyan-500/30 text-white placeholder:text-cyan-400/40 text-sm h-9"
                          maxLength={60}
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-black text-cyan-300 mb-1">Category (Optional)</label>
                        <select
                          value={serviceCategory}
                          onChange={(e) => setServiceCategory(e.target.value)}
                          className="w-full bg-black/30 border border-cyan-500/30 text-white text-sm h-9 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        >
                          <option value="">Select category...</option>
                          <option value="Design">🎨 Design</option>
                          <option value="Development">💻 Development</option>
                          <option value="Writing">✍️ Writing</option>
                          <option value="Marketing">📢 Marketing</option>
                          <option value="Consulting">💡 Consulting</option>
                          <option value="Photography">📸 Photography</option>
                          <option value="Translation">🌐 Translation</option>
                          <option value="Teaching">🎓 Teaching</option>
                          <option value="Other">🔧 Other</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-black text-cyan-300 mb-1">
                          What You'll Do <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                          placeholder="Describe your service... What will you deliver? Timeline? Any specifics?"
                          value={serviceDescription}
                          onChange={(e) => setServiceDescription(e.target.value)}
                          className="bg-black/30 border-cyan-500/30 text-white placeholder:text-cyan-400/40 text-sm min-h-[80px] resize-none"
                          maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-cyan-400/60">Be specific about deliverables</p>
                          <p className="text-xs text-cyan-400/60">{serviceDescription.length}/500</p>
                        </div>
                      </div>

                      {/* Clear Form Button */}
                      <button
                        onClick={() => {
                          setServiceTitle('');
                          setServiceDescription('');
                          setServiceCategory('');
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-black/30 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all text-xs font-bold text-cyan-300 hover:text-cyan-200"
                      >
                        <X className="w-3 h-3 inline-block mr-1" />
                        Clear Form
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personal Message (optional for both types) */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-fuchsia-300">Personal Note (Optional)</label>
                <Textarea
                  placeholder="Add a friendly message to introduce yourself..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  className="bg-black/30 border-fuchsia-500/20 text-white placeholder:text-fuchsia-400/40 text-xs min-h-[60px] resize-none"
                  maxLength={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="relative border-t-2 border-fuchsia-500/20 p-3 bg-black/20 backdrop-blur-sm">
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 font-black text-xs h-9"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProposeSwap}
              disabled={!canSubmit || submitting}
              className={`flex-1 font-black text-xs h-9 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
                proposalType === 'item'
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-300 hover:via-orange-400 hover:to-pink-400'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-400'
              } text-black`}
            >
              {submitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 mr-1 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <Sparkles className="w-3.5 h-3.5 mr-1 relative z-10" />
                  <span className="relative z-10">Send Proposal</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
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
      </motion.div>

      {/* Item Selector Modal */}
      <AnimatePresence>
        {showItemSelector && (
          <ItemSelectorModal
            items={myItems}
            loading={loading}
            onSelect={(item) => {
              setSelectedItem(item);
              setShowItemSelector(false);
            }}
            onClose={() => setShowItemSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact Item Card Component
function CompactItemCard({ item, highlight }: { item: SwapItem; highlight: 'pink' | 'yellow' }) {
  const powerLevel = item.power_level || 1;
  const borderColor = highlight === 'pink' ? 'border-pink-400/50' : 'border-yellow-400/50';
  const bgGradient = highlight === 'pink' 
    ? 'from-pink-900/50 to-purple-900/50' 
    : 'from-yellow-900/50 to-orange-900/50';

  return (
    <div className={`relative bg-gradient-to-br ${bgGradient} border-2 ${borderColor} rounded-xl overflow-hidden shadow-xl`}>
      {/* Image - Much smaller aspect ratio */}
      <div className="aspect-[2/1] bg-purple-900/30 relative">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-fuchsia-500/30" />
          </div>
        )}

        {/* Level badge */}
        <Badge className="absolute top-1.5 left-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-300/50 font-black text-xs px-1.5 py-0.5">
          <Zap className="w-2.5 h-2.5 mr-0.5" />
          LVL {powerLevel}
        </Badge>

        {/* Hemp badge */}
        {item.hemp_inside && (
          <Badge className="absolute top-1.5 right-1.5 bg-gradient-to-r from-emerald-400 to-green-500 text-white border border-emerald-300/50 font-black text-xs px-1.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
            Hemp
          </Badge>
        )}
      </div>

      {/* Content - More compact */}
      <div className="p-2">
        <h4 className="font-black text-white text-xs mb-0.5 line-clamp-1">{item.title}</h4>
        <p className="text-xs text-fuchsia-300/70 line-clamp-1">{item.description}</p>
      </div>
    </div>
  );
}

// Item Selector Modal
function ItemSelectorModal({ 
  items, 
  loading, 
  onSelect, 
  onClose 
}: { 
  items: SwapItem[]; 
  loading: boolean; 
  onSelect: (item: SwapItem) => void; 
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-purple-950/95 via-fuchsia-950/95 to-pink-950/95 border-2 border-fuchsia-500/40 rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative border-b-2 border-fuchsia-500/20 p-6 bg-black/20 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-fuchsia-500/30 hover:bg-fuchsia-500/20 transition-all flex items-center justify-center group"
          >
            <X className="w-5 h-5 text-fuchsia-300 group-hover:text-white transition-colors" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
              <Package className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-black text-2xl text-white">Select Your Item</h2>
              <p className="text-fuchsia-300/70">Choose what you'll offer in this swap</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-fuchsia-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-purple-900/20 border-2 border-dashed border-fuchsia-500/20 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-fuchsia-400/50" />
              <h4 className="font-black text-xl mb-2 text-white">No Items to Trade</h4>
              <p className="text-fuchsia-200/60 mb-4">Add items to your inventory first</p>
              <Button 
                onClick={onClose}
                className="bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black"
              >
                <Package className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <SelectableItemCard
                  key={item.id}
                  item={item}
                  onSelect={() => onSelect(item)}
                />
              ))}
            </div>
          )}
        </div>

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
      </motion.div>
    </motion.div>
  );
}

// Selectable Item Card (in grid)
function SelectableItemCard({ item, onSelect }: { item: SwapItem; onSelect: () => void }) {
  const powerLevel = item.power_level || 1;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 border-2 border-fuchsia-500/20 hover:border-yellow-400/50 rounded-xl overflow-hidden transition-all text-left group"
    >
      {/* Image */}
      <div className="aspect-video bg-purple-900/20 relative">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-fuchsia-500/30" />
          </div>
        )}

        {/* Level badge */}
        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-300/50 font-black text-xs px-1.5 py-0.5">
          <Zap className="w-2.5 h-2.5 mr-0.5" />
          {powerLevel}
        </Badge>

        {/* Hemp badge */}
        {item.hemp_inside && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white border border-emerald-300/50 font-black text-xs px-1.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5" />
          </Badge>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/20 group-hover:via-yellow-500/10 group-hover:to-yellow-500/20 transition-all flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-yellow-400/0 group-hover:bg-yellow-400/90 border-2 border-yellow-300/0 group-hover:border-yellow-300/50 flex items-center justify-center transition-all scale-0 group-hover:scale-100">
            <Check className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.title}</h4>
        <p className="text-xs text-fuchsia-300/60 line-clamp-1">{item.description}</p>
      </div>
    </motion.button>
  );
}