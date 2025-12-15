import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
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
  { value: 'all', label: 'All Items' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'home_goods', label: 'Home Goods' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'construction', label: 'Construction' },
  { value: 'other', label: 'Other' },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleItemAdded = () => {
    setShowAddModal(false);
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F0D] to-[#1a1a1a]">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2 flex items-center gap-3">
                <Package className="w-8 h-8 text-cyan-400" />
                SWAP Shop
              </h1>
              <p className="text-gray-400">
                Barter used hemp items with the community
              </p>
            </div>
            {userId && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-black hover:from-cyan-400 hover:to-teal-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                List an Item
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/40 border-cyan-500/30 text-white placeholder:text-gray-500"
              />
              <Button type="submit" variant="outline" className="border-cyan-500/30">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-cyan-500/30 rounded-md text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-cyan-500/30 rounded-md text-white"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="mt-4 text-gray-400">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-400">No items found</h3>
            <p className="text-gray-500 mb-6">
              {search || category !== 'all' || condition !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to list an item!'}
            </p>
            {userId && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-black hover:from-cyan-400 hover:to-teal-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                List Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <SwapItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
