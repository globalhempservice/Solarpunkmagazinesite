import { useState } from 'react'
import { X, Star, Shield, Crown, Package, Building2, ExternalLink, ShoppingCart, AlertCircle, Check, ChevronLeft, ChevronRight, Sparkles, Tag, Box, Info } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner@2.0.3'

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
  is_external_link: boolean
  external_shop_url: string | null
  badge_gated: boolean
  required_badge_type: string | null
  company?: {
    id: string
    name: string
    logo_url: string | null
    is_association: boolean
  }
  created_at: string
  updated_at: string
}

interface ProductDetailModalProps {
  product: SwagProduct
  isOpen: boolean
  onClose: () => void
  hasRequiredBadge: boolean
  nadaPoints: number
  onPurchase: (productId: string) => Promise<void>
  relatedProducts?: SwagProduct[]
  onProductClick?: (product: SwagProduct) => void
  onBadgeRequirement?: () => void
  onExternalShopConfirm?: () => void
}

const BADGE_ICONS: Record<string, any> = {
  Shield: Shield,
  Crown: Crown,
  Star: Star
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  hasRequiredBadge,
  nadaPoints,
  onPurchase,
  relatedProducts = [],
  onProductClick,
  onBadgeRequirement,
  onExternalShopConfirm
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [purchasing, setPurchasing] = useState(false)
  const [imageError, setImageError] = useState(false)

  // For now, we'll use a single image, but this supports multiple images in the future
  const images = product.image_url ? [product.image_url] : []
  
  const BadgeIcon = product.required_badge_type ? BADGE_ICONS[product.required_badge_type] : null

  const canPurchase = !product.badge_gated || hasRequiredBadge
  const canAfford = nadaPoints >= product.price
  const inStock = product.stock_quantity === null || product.stock_quantity > 0

  const handlePurchase = async () => {
    if (!canPurchase || !canAfford || !inStock || purchasing) return

    setPurchasing(true)
    try {
      await onPurchase(product.id)
      toast.success('Purchase successful!', {
        description: `${product.name} has been added to your collection.`
      })
      onClose()
    } catch (error) {
      toast.error('Purchase failed', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setPurchasing(false)
    }
  }

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 border-2 border-emerald-500/30 rounded-3xl shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 p-2 rounded-xl bg-emerald-900/50 border-2 border-emerald-500/30 text-emerald-200 hover:bg-emerald-800/50 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-emerald-900/30 rounded-2xl overflow-hidden border-2 border-emerald-500/20">
                  {images.length > 0 && !imageError ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Image Navigation */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-900/80 border-2 border-emerald-500/30 text-white hover:bg-emerald-800 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-900/80 border-2 border-emerald-500/30 text-white hover:bg-emerald-800 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? 'bg-emerald-400 w-6'
                                    : 'bg-emerald-600/50 hover:bg-emerald-500/70'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-emerald-400/30" />
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      {product.is_featured && (
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

                {/* Thumbnail Grid (Future Enhancement) */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-emerald-400'
                            : 'border-emerald-500/20 hover:border-emerald-500/50'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                {/* Company Info */}
                {product.company && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-900/30 rounded-2xl border-2 border-emerald-500/20">
                    {product.company.logo_url ? (
                      <img
                        src={product.company.logo_url}
                        alt={product.company.name}
                        className="w-10 h-10 rounded-lg object-cover border-2 border-emerald-400/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-800/50 border-2 border-emerald-400/30 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wide">Sold by</p>
                      <p className="font-black text-white">{product.company.name}</p>
                    </div>
                    {product.company.is_association && (
                      <Shield className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <h1 className="font-black text-3xl md:text-4xl text-white mb-3">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Price */}
                <div className="p-6 bg-emerald-900/30 rounded-2xl border-2 border-emerald-500/20">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-black text-5xl text-white">{product.price}</span>
                    <span className="text-xl text-emerald-300/60 font-bold">NADA</span>
                  </div>
                  {nadaPoints < product.price && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                      <AlertCircle className="w-4 h-4" />
                      You need {product.price - nadaPoints} more NADA
                    </div>
                  )}
                  {nadaPoints >= product.price && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <Check className="w-4 h-4" />
                      You have enough NADA
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-lg text-white uppercase tracking-wide">Product Details</h3>
                  </div>
                  <p className="text-emerald-200/80 leading-relaxed">{product.description}</p>
                </div>

                {/* Stock Info */}
                {product.stock_quantity !== null && (
                  <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-200">
                        {product.stock_quantity > 0 ? (
                          <>{product.stock_quantity} units available</>
                        ) : (
                          <>Currently out of stock</>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge Requirements */}
                {product.badge_gated && !hasRequiredBadge && (
                  <button
                    onClick={() => {
                      onBadgeRequirement?.()
                    }}
                    className="w-full p-4 bg-purple-900/20 rounded-2xl border-2 border-purple-500/30 hover:bg-purple-900/30 hover:border-purple-500/50 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      {BadgeIcon && (
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                          <BadgeIcon className="w-5 h-5 text-purple-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-black text-white mb-1">Members Only Product</h4>
                        <p className="text-sm text-purple-200/70 mb-2">
                          This product requires the <strong>{product.required_badge_type}</strong> badge to purchase.
                        </p>
                        <p className="text-xs text-purple-300 font-bold">Click to learn more →</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Purchase Button */}
                <div className="space-y-3">
                  {product.is_external_link ? (
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black text-lg py-6 border-2 border-teal-400/30"
                      onClick={() => onExternalShopConfirm?.()}
                    >
                      Visit External Shop
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled={!canPurchase || !canAfford || !inStock || purchasing}
                      onClick={handlePurchase}
                      className={`w-full gap-2 text-lg py-6 font-black ${
                        canPurchase && canAfford && inStock
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-2 border-emerald-400/30'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {purchasing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : !inStock ? (
                        'Out of Stock'
                      ) : !canPurchase ? (
                        'Badge Required'
                      ) : !canAfford ? (
                        'Insufficient NADA'
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Purchase Now
                        </>
                      )}
                    </Button>
                  )}

                  {!product.is_external_link && (
                    <p className="text-xs text-emerald-200/50 text-center">
                      Secure checkout powered by NADA Points
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="pt-8 border-t-2 border-emerald-500/20">
                <h2 className="font-black text-2xl text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <button
                      key={relatedProduct.id}
                      onClick={() => onProductClick?.(relatedProduct)}
                      className="bg-emerald-950/50 border-2 border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-400/50 transition-all duration-200 hover:scale-105 text-left"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-emerald-900/30">
                        {relatedProduct.image_url ? (
                          <img
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-emerald-400/30" />
                          </div>
                        )}
                        {relatedProduct.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50 shadow-lg gap-1 font-black text-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-black text-white text-sm mb-1 line-clamp-2">{relatedProduct.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-lg text-emerald-300">{relatedProduct.price} NADA</span>
                          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                            {relatedProduct.category}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}