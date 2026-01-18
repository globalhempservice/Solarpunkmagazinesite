import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Package, ShoppingCart, Star, Heart, Filter, Search, 
  ArrowLeft, X, CheckCircle, AlertCircle, Crown, Shield,
  Leaf, Sparkles, Award, TrendingUp, Zap, Globe, Lock,
  Mail, Check, Percent, DollarSign, MapPin, Truck,
  ChevronRight, Tag, Info, Eye, ThumbsUp, MessageCircle, Building2, ChevronDown, ShoppingBag
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { toast } from 'sonner'
import { ProductDetailModal } from './ProductDetailModal'
import { BadgeRequirementModal } from './BadgeRequirementModal'
import { PurchaseModal } from './PurchaseModal'
import { AddSwagProductModal } from './swag/AddSwagProductModal'

interface SwagProduct {
  id: string
  company_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  stock_quantity: number | null
  is_published: boolean
  is_featured: boolean
  external_shop_url: string | null
  external_shop_platform?: string | null
  badge_gated: boolean
  required_badge_type: string | null
  made_in_country: string | null
  company?: {
    id: string
    name: string
    logo_url: string | null
    is_association: boolean
  }
  created_at: string
  updated_at: string
  
  // Provenance fields
  hemp_source?: string | null
  hemp_source_country?: string | null
  certifications?: string[] | null
  carbon_footprint?: number | null
  processing_method?: string | null
  fair_trade_verified?: boolean
  provenance_verified?: boolean
  conscious_score?: number | null
  conscious_score_breakdown?: any
}

interface SwagMarketplaceProps {
  accessToken: string
  serverUrl: string
  userId?: string
  userBadges?: any[]
  onClose: () => void
  nadaPoints: number
  onNadaUpdate: (newBalance: number) => void
}

const BADGE_ICONS: Record<string, any> = {
  Shield: Shield,
  Crown: Crown,
  Star: Star
}

export function SwagMarketplace({ accessToken, serverUrl, userId, userBadges = [], onClose, nadaPoints, onNadaUpdate }: SwagMarketplaceProps) {
  const [products, setProducts] = useState<SwagProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'featured'>('featured')
  const [selectedProduct, setSelectedProduct] = useState<SwagProduct | null>(null)
  const [showBadgeRequirementModal, setShowBadgeRequirementModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const autoScrollRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  // Listen for contextual + button trigger
  useEffect(() => {
    (window as any).__swagMarketplaceOpenAddModal = () => setShowAddProductModal(true);
    
    return () => {
      delete (window as any).__swagMarketplaceOpenAddModal;
    };
  }, [])

  // AUTO-SCROLL ANIMATION - Works on both desktop and mobile (scrolls content area only)
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (loading || products.length === 0 || !scrollContainer) return;

    let frameCount = 0;
    const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
    // Increase scroll speed on mobile for better visibility
    const scrollSpeed = isMobile ? 1.0 : 0.5; // 60px/sec on mobile, 30px/sec on desktop

    const autoScroll = () => {
      if (!scrollContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      
      // Direct scroll manipulation (more reliable on mobile)
      scrollContainer.scrollTop += scrollSpeed;
      
      // Debug log every 120 frames (every 2 seconds)
      frameCount++;
      if (frameCount === 120) {
        console.log('🎵 SWAG Auto-scroll active -', isMobile ? 'MOBILE' : 'DESKTOP', '- scrollTop:', Math.round(scrollContainer.scrollTop));
        frameCount = 0;
      }
      
      // Loop back to top when reaching the end
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        scrollContainer.scrollTop = 0;
        console.log('🎵 Auto-scroll looped back to top (vinyl style - SWAG)');
      }
      
      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);
    console.log('🎵 Auto-scroll started for SWAG Marketplace (content area) -', isMobile ? 'MOBILE' : 'DESKTOP');

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        console.log('🎵 Auto-scroll stopped for SWAG Marketplace');
      }
    };
  }, [loading, products.length]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${serverUrl}/swag-products`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        // Handle both array response and object with products property
        const productsList = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsList)
      } else {
        console.error('Failed to fetch products:', data)
        setProducts([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Check if user has required badge
  const hasRequiredBadge = (product: SwagProduct) => {
    if (!product.badge_gated) return true
    if (!userId || !product.required_badge_type) return false
    return userBadges.some(badge => badge.type === product.required_badge_type)
  }

  // Get related products (same category, exclude current product)
  const getRelatedProducts = (product: SwagProduct) => {
    return products
      .filter(p => 
        p.id !== product.id && 
        p.category === product.category && 
        p.is_published
      )
      .slice(0, 4)
  }

  // Handle purchase (for internal products - not implemented yet)
  const handlePurchase = async (productId: string) => {
    // TODO: Phase 2 - Implement internal checkout with Stripe
    console.log('Internal purchase (Phase 2):', productId)
  }

  // Handle external shop purchase
  const handleExternalShopPurchase = () => {
    if (selectedProduct && selectedProduct.external_shop_url) {
      setShowPurchaseModal(true)
    }
  }

  // Callback after purchase modal completes
  const handlePurchaseComplete = () => {
    // Refresh products to get updated analytics
    fetchProducts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Get unique categories - MOVED AFTER LOADING CHECK
  const categories = ['all', ...Array.from(new Set((products || []).map(p => p.category)))]

  // Filter and sort products - MOVED AFTER LOADING CHECK
  const filteredProducts = (products || [])
    .filter(p => p.is_published) // Only show published products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.company?.name.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === 'price-low') {
        return a.price - b.price
      }
      if (sortBy === 'price-high') {
        return b.price - a.price
      }
      return 0
    })

  // Featured products - MOVED AFTER LOADING CHECK
  const featuredProducts = filteredProducts.filter(p => p.is_featured)

  return (
    <>
      {/* Sticky Header */}
      <div className="shrink-0 sticky top-0 z-30 bg-gradient-to-b from-emerald-950/98 via-teal-950/95 to-emerald-950/90 backdrop-blur-xl border-b border-emerald-400/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row: Logo + Title */}
          <div className="flex items-center gap-3 h-16 sm:h-20">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-lg" />
              <ShoppingBag className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Hemp'in Swag</h1>
              <p className="text-xs text-emerald-300 hidden sm:block">Official Organization Merchandise</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, organizations..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-emerald-400/30 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="pb-3 flex items-center gap-2">
            {/* Sort */}
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none w-full pl-4 pr-10 py-2 rounded-xl bg-white/5 border border-emerald-400/30 text-white text-sm font-medium focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="featured" className="bg-gray-900">Featured First</option>
                <option value="newest" className="bg-gray-900">Newest First</option>
                <option value="price-low" className="bg-gray-900">Price: Low to High</option>
                <option value="price-high" className="bg-gray-900">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-emerald-500 text-white border border-emerald-400'
                  : 'bg-white/5 text-emerald-300 border border-emerald-400/30 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>
          </div>

          {/* Category Pills */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-2 min-w-max">
                    {categories.map(category => (
                      <motion.button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-emerald-400 shadow-lg'
                            : 'bg-white/5 text-emerald-300 border border-white/10 hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Featured Products Section */}
          {featuredProducts.length > 0 && selectedCategory === 'all' && !searchQuery && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-xl text-white">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredProducts.slice(0, 3).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    hasRequiredBadge={hasRequiredBadge(product)}
                    isFeatured={true}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Products Grid */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-white">
                {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
              </h2>
              <p className="text-emerald-200/60 font-medium text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-emerald-950/50 border-2 border-dashed border-emerald-500/20 rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-emerald-400/50" />
                <h3 className="font-black text-xl mb-2 text-white">No Products Found</h3>
                <p className="text-emerald-200/60">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No products available in this category yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    hasRequiredBadge={hasRequiredBadge(product)}
                    isFeatured={false}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Detail Modal */}
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              isOpen={!!selectedProduct}
              onClose={() => setSelectedProduct(null)}
              hasRequiredBadge={hasRequiredBadge(selectedProduct)}
              nadaPoints={nadaPoints}
              onPurchase={handlePurchase}
              relatedProducts={getRelatedProducts(selectedProduct)}
              onProductClick={(product) => setSelectedProduct(product)}
              onBadgeRequirement={() => setShowBadgeRequirementModal(true)}
              onExternalShopPurchase={handleExternalShopPurchase}
            />
          )}

          {/* Badge Requirement Modal */}
          {showBadgeRequirementModal && selectedProduct && (
            <BadgeRequirementModal
              isOpen={showBadgeRequirementModal}
              onClose={() => setShowBadgeRequirementModal(false)}
              badgeType={selectedProduct.required_badge_type || 'Shield'}
              organizationName={selectedProduct.company?.name || 'Organization'}
              organizationLogo={selectedProduct.company?.logo_url}
              hasRequiredBadge={hasRequiredBadge(selectedProduct)}
            />
          )}

          {/* Purchase Modal (External Shop) */}
          {showPurchaseModal && selectedProduct && selectedProduct.company && userId && (
            <PurchaseModal
              isOpen={showPurchaseModal}
              onClose={() => setShowPurchaseModal(false)}
              product={selectedProduct}
              company={{
                id: selectedProduct.company.id,
                name: selectedProduct.company.name,
                logo_url: selectedProduct.company.logo_url,
                is_association: selectedProduct.company.is_association || false
              }}
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              onPurchaseComplete={handlePurchaseComplete}
            />
          )}

          {/* Add Product Modal */}
          {showAddProductModal && (
            <AddSwagProductModal
              isOpen={showAddProductModal}
              onClose={() => setShowAddProductModal(false)}
              accessToken={accessToken}
              serverUrl={serverUrl}
              onProductAdded={fetchProducts}
            />
          )}
        </div>
      </div>
    </>
  )
}

// Product Card Component
interface ProductCardProps {
  product: SwagProduct
  hasRequiredBadge: boolean
  isFeatured: boolean
  onClick?: (product: SwagProduct) => void
}

function ProductCard({ product, hasRequiredBadge, isFeatured, onClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const BadgeIcon = product.required_badge_type ? BADGE_ICONS[product.required_badge_type] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(product)}
      className={`bg-emerald-950/50 border-2 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer ${
        isFeatured
          ? 'border-amber-400/50 shadow-lg shadow-amber-500/20'
          : 'border-emerald-500/20 hover:border-emerald-400/50'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-emerald-900/30 overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-emerald-400/30" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {isFeatured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50 shadow-lg gap-1 font-black">
                <Sparkles className="w-3 h-3" />
                Featured
              </Badge>
            )}
            {product.badge_gated && (
              <Badge className={`gap-1 font-black ${
                hasRequiredBadge
                  ? 'bg-purple-500/90 text-white border-purple-400/50'
                  : 'bg-gray-900/90 text-gray-300 border-gray-600/50'
              }`}>
                {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                Members Only
              </Badge>
            )}
          </div>

          {product.stock_quantity !== null && product.stock_quantity <= 10 && product.stock_quantity > 0 && (
            <Badge variant="destructive" className="bg-red-500/90 text-white border-red-400/50 font-black">
              {product.stock_quantity} left
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge variant="outline" className="bg-gray-900/90 text-gray-300 border-gray-600/50 font-black">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Company */}
        {product.company && (
          <div className="flex items-center gap-2 mb-2">
            {product.company.logo_url ? (
              <img
                src={product.company.logo_url}
                alt={product.company.name}
                className="w-5 h-5 rounded-md object-cover border border-emerald-400/30"
              />
            ) : (
              <Building2 className="w-5 h-5 text-emerald-400/50" />
            )}
            <span className="text-xs text-emerald-300/70 font-bold truncate">
              {product.company.name}
            </span>
            {product.company.is_association && (
              <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            )}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-black text-white mb-2 line-clamp-2 group-hover:text-emerald-200 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-emerald-200/60 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            {product.category}
          </Badge>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
          <div>
            <div className="font-black text-2xl text-white">{product.price}</div>
            <div className="text-xs text-emerald-300/60 font-bold">NADA Points</div>
          </div>

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black border-2 border-emerald-400/30"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  )
}