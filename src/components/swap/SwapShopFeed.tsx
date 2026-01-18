import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Package, RefreshCw, ArrowUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { SwapItemCard } from './SwapItemCard';
import { AddSwapItemModal } from './AddSwapItemModal';
import { SwapItemDetailModal } from './SwapItemDetailModal';

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
}

interface SwapShopFeedProps {
  userId: string | null;
}

const CATEGORIES = [
  { value: 'all', label: 'All Items', color: '#14B8A6' },
  { value: 'clothing', label: 'Clothing', color: '#10B981' },
  { value: 'accessories', label: 'Accessories', color: '#06b6d4' },
  { value: 'home_goods', label: 'Home Goods', color: '#14B8A6' },
  { value: 'wellness', label: 'Wellness', color: '#10B981' },
  { value: 'construction', label: 'Construction', color: '#059669' },
  { value: 'other', label: 'Other', color: '#0d9488' },
];

const CONDITIONS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'well_loved', label: 'Well-Loved' },
  { value: 'vintage', label: 'Vintage' },
];

export function SwapShopFeed({ userId }: SwapShopFeedProps) {
  const [items, setItems] = useState<SwapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SwapItem | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (condition !== 'all') params.append('condition', condition);
      if (search) params.append('search', search);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/items?${params}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch swap items');

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching swap items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, condition]);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setShowBackToTop(scrollElement.scrollTop > 500);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleItemAdded = () => {
    setShowAddModal(false);
    fetchItems();
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (categoryValue: string) => {
    setCategory(categoryValue);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Expose modal opener for global access
  useEffect(() => {
    (window as any).__swapOpenAddModal = () => setShowAddModal(true);
    return () => {
      delete (window as any).__swapOpenAddModal;
    };
  }, []);

  return (
    <>
      {/* Sticky Header */}
      <div className="shrink-0 sticky top-0 z-30 bg-gradient-to-b from-cyan-950/98 via-teal-950/95 to-cyan-950/90 backdrop-blur-xl border-b border-cyan-400/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Package size={28} className="text-cyan-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">SWAP Shop</h1>
                <p className="text-xs text-cyan-300 hidden sm:block">Community Marketplace</p>
              </div>
            </div>

            {/* Add Item Button */}
            {userId && (
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                }}
                whileHover={{ boxShadow: '0 6px 30px rgba(16, 185, 129, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">List Item</span>
              </motion.button>
            )}
          </div>

          {/* Search Bar */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <Input
                  type="text"
                  placeholder="Search hemp items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-cyan-400/30 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
              <motion.button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-cyan-400/30 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={18} className="text-cyan-300" />
              </motion.button>
            </form>
          </div>

          {/* Category Pills */}
          <div className="pb-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className="shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap"
                  style={{
                    background: category === cat.value 
                      ? `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`
                      : 'rgba(255, 255, 255, 0.05)',
                    color: category === cat.value ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                    border: category === cat.value 
                      ? `1px solid ${cat.color}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: category === cat.value 
                      ? `0 0 20px ${cat.color}40`
                      : 'none',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="pb-4">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-xl text-white text-sm font-medium focus:border-cyan-400 focus:ring-cyan-400/20 focus:outline-none"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value} className="bg-gray-900">
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 animate-pulse"
                >
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-teal-500/20" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-white/10 rounded w-16" />
                      <div className="h-6 bg-white/10 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 mb-6">
                <Package className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No items found</h3>
              <p className="text-white/60 mb-6">
                {search || category !== 'all' || condition !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Be the first to list an item!'}
              </p>
              {userId && (
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                  }}
                  whileHover={{ boxShadow: '0 6px 30px rgba(16, 185, 129, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                  List Your First Item
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <SwapItemCard
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #10B981, #14B8A6)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showAddModal && userId && (
        <AddSwapItemModal
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onItemAdded={handleItemAdded}
        />
      )}

      {selectedItem && (
        <SwapItemDetailModal
          item={selectedItem}
          userId={userId}
          onClose={() => setSelectedItem(null)}
          onProposalSent={() => {
            setSelectedItem(null);
            fetchItems();
          }}
        />
      )}
    </>
  );
}
