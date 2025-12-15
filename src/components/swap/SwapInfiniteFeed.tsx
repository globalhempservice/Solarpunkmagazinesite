import { useState, useEffect, useRef, useCallback } from 'react';
import { Package } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AddSwapItemModal } from './AddSwapItemModal';
import { SwapItemDetailModal } from './SwapItemDetailModal';
import { SwapItemCard } from './SwapItemCard';
import { motion } from 'motion/react';

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

interface SwapInfiniteFeedProps {
  userId: string | null;
  accessToken: string | null;
  onBack: () => void;
  onPlusButtonTrigger?: () => void;
}

const ITEMS_PER_PAGE = 20;

export function SwapInfiniteFeed({ userId, accessToken, onBack, onPlusButtonTrigger }: SwapInfiniteFeedProps) {
  const [items, setItems] = useState<SwapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SwapItem | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const userHasInteracted = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for contextual + button trigger
  useEffect(() => {
    if (onPlusButtonTrigger) {
      (window as any).__swapOpenAddModal = () => setShowAddModal(true);
      
      return () => {
        delete (window as any).__swapOpenAddModal;
      };
    }
  }, [onPlusButtonTrigger]);

  // Fetch items with pagination
  const fetchItems = useCallback(async (offset: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/swap/items?limit=${ITEMS_PER_PAGE}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch swap items:', errorData);
        if (!append) setItems([]);
        return;
      }

      const data = await response.json();
      
      if (append) {
        // Prevent duplicate items by filtering out any that already exist
        const newItems = (data.items || []).filter(
          (newItem: SwapItem) => !items.find(existingItem => existingItem.id === newItem.id)
        );
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(data.items || []);
      }
      
      setTotalCount(data.total || 0);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error fetching swap items:', error);
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchItems(0, false);
  }, [fetchItems]);

  // Infinite scroll - load more when near bottom
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement || !hasMore || loadingMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Load more when scrolled 70% down (automatic, seamless)
      if (scrolledPercentage > 0.7 && hasMore && !loadingMore) {
        console.log('🔄 Auto-scroll triggered at', Math.round(scrolledPercentage * 100) + '%', '- Loading next', ITEMS_PER_PAGE, 'items');
        fetchItems(items.length, true);
      }
    };

    // Check immediately on mount/update - auto-load if content doesn't fill screen
    const checkIfNeedMore = () => {
      const { scrollHeight, clientHeight } = scrollElement;
      if (scrollHeight <= clientHeight && hasMore && !loadingMore && items.length > 0) {
        console.log('🔄 Auto-loading more items (content doesn\'t fill screen)');
        fetchItems(items.length, true);
      }
    };
    
    checkIfNeedMore();
    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [items.length, hasMore, loadingMore, fetchItems]);

  // AUTO-SCROLL ANIMATION - Works on both desktop and mobile
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement || items.length === 0) return;

    let frameCount = 0;
    // Increase scroll speed on mobile for better visibility
    const scrollSpeed = isMobile ? 1.0 : 0.5; // 60px/sec on mobile, 30px/sec on desktop

    const autoScroll = () => {
      if (!scrollElement) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      // Direct scrollTop manipulation (more reliable on mobile)
      scrollElement.scrollTop += scrollSpeed;
      
      // Debug log every 120 frames (every 2 seconds)
      frameCount++;
      if (frameCount === 120) {
        console.log('🎵 SWAP Auto-scroll active -', isMobile ? 'MOBILE' : 'DESKTOP', '- scrollTop:', Math.round(scrollElement.scrollTop));
        frameCount = 0;
      }
      
      // Loop back to top when reaching the end
      if (scrollElement.scrollTop + clientHeight >= scrollHeight - 100) {
        if (!hasMore) {
          scrollElement.scrollTop = 0;
          console.log('🎵 Auto-scroll looped back to top (vinyl style - SWAP)');
        }
      }
      
      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);
    console.log('🎵 Auto-scroll started for SWAP feed -', isMobile ? 'MOBILE' : 'DESKTOP');

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        console.log('🎵 Auto-scroll stopped for SWAP feed');
      }
    };
  }, [items.length, hasMore, isMobile]);

  const handleItemAdded = () => {
    setShowAddModal(false);
    // Refresh from start
    fetchItems(0, false);
  };

  return (
    <>
      {/* FIXED BACKGROUND - Full screen, behind everything */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A0F0D] via-[#1a1a1a] to-[#0A0F0D] -z-10" />

      {/* SCROLLABLE CONTENT CONTAINER - Vinyl record style (never stops!) */}
      <div 
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto pb-28 pt-20"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y' 
        }}
      >
        {loading ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
              <p className="text-gray-400">Loading items...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center px-4">
              {/* Empty state logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                className="mb-8 cursor-pointer"
                onClick={() => userId && setShowAddModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative inline-block">
                  <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-12 rounded-3xl border-4 border-amber-950 shadow-[0_10px_0_rgba(0,0,0,0.3),0_0_60px_rgba(251,191,36,0.6)]">
                    <Package className="w-32 h-32 text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]" strokeWidth={2.5} />
                  </div>
                  <motion.div className="mt-6">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 tracking-tighter">
                      SWAP
                    </h1>
                  </motion.div>
                </div>
              </motion.div>
              <p className="text-gray-400 mb-2 text-lg">No items yet</p>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Click the logo above to list your first item for barter!
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* Simple grid with consistent spacing */}
            <div className="max-w-md mx-auto space-y-[2vh]">
              {items.map((item) => (
                <SwapItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>

            {/* Loading indicator at bottom */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
                  <p className="text-gray-400 text-sm">Loading more items...</p>
                </div>
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && items.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-block bg-black/40 backdrop-blur-sm border border-amber-500/30 px-6 py-3 rounded-full">
                  <p className="text-gray-400 text-sm">
                    ✨ You've seen all <span className="text-amber-400 font-bold">{totalCount}</span> item{totalCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && userId && accessToken && (
        <AddSwapItemModal
          userId={userId}
          accessToken={accessToken}
          onClose={() => setShowAddModal(false)}
          onItemAdded={handleItemAdded}
        />
      )}

      {selectedItem && (
        <SwapItemDetailModal
          item={selectedItem}
          userId={userId}
          accessToken={accessToken || undefined}
          onClose={() => setSelectedItem(null)}
          onProposalSent={() => {
            setSelectedItem(null);
            fetchItems(0, false);
          }}
        />
      )}
    </>
  );
}