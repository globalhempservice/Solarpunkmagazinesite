import { X, ExternalLink, ShoppingCart, Coins, CheckCircle, AlertCircle, Sparkles, ArrowRight, Shield, Globe } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { ProvenancePreview } from './ProvenancePreview'
import { NadaRewardPreview } from './NadaRewardPreview'
import { toast } from 'sonner@2.0.3'

interface SwagProduct {
  id: string
  company_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  external_shop_url: string | null
  external_shop_platform?: string | null
  
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

interface Company {
  id: string
  name: string
  logo_url: string | null
  is_association: boolean
}

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  product: SwagProduct
  company: Company
  userId: string
  accessToken: string
  serverUrl: string
  onPurchaseComplete?: () => void
}

// Platform logos/icons mapping
const PLATFORM_INFO: Record<string, { name: string; color: string }> = {
  'shopify': { name: 'Shopify', color: 'from-green-500 to-emerald-600' },
  'lazada': { name: 'Lazada', color: 'from-blue-500 to-indigo-600' },
  'shopee': { name: 'Shopee', color: 'from-orange-500 to-red-600' },
  'woocommerce': { name: 'WooCommerce', color: 'from-purple-500 to-pink-600' },
  'custom': { name: 'External Shop', color: 'from-gray-500 to-slate-600' }
}

export function PurchaseModal({
  isOpen,
  onClose,
  product,
  company,
  userId,
  accessToken,
  serverUrl,
  onPurchaseComplete
}: PurchaseModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [nadaReward, setNadaReward] = useState<number>(50) // Base points
  const [hasTrackedView, setHasTrackedView] = useState(false)

  // Detect platform from URL
  const detectPlatform = (url: string | null): string => {
    if (!url) return 'custom'
    const urlLower = url.toLowerCase()
    if (urlLower.includes('shopify')) return 'shopify'
    if (urlLower.includes('lazada')) return 'lazada'
    if (urlLower.includes('shopee')) return 'shopee'
    if (urlLower.includes('woocommerce')) return 'woocommerce'
    return 'custom'
  }

  const platform = product.external_shop_platform || detectPlatform(product.external_shop_url)
  const platformInfo = PLATFORM_INFO[platform] || PLATFORM_INFO['custom']

  // Calculate NADA reward based on product properties
  useEffect(() => {
    let points = 50 // Base
    if (product.provenance_verified) points += 25
    if (product.conscious_score && product.conscious_score >= 90) points += 25
    if (product.certifications?.includes('Regenerative')) points += 50
    setNadaReward(points)
  }, [product])

  // Track product view when modal opens
  useEffect(() => {
    if (isOpen && !hasTrackedView) {
      trackProductView()
      setHasTrackedView(true)
    }
  }, [isOpen])

  // Reset tracking state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasTrackedView(false)
      setIsRedirecting(false)
    }
  }, [isOpen])

  async function trackProductView() {
    try {
      await fetch(`${serverUrl}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          product_id: product.id,
          company_id: product.company_id,
          action_type: 'product_view'
        })
      })
      console.log('📊 Product view tracked')
    } catch (error) {
      console.error('Failed to track product view:', error)
    }
  }

  async function handleRedirect() {
    if (!product.external_shop_url) {
      toast.error('No shop URL available')
      return
    }

    setIsRedirecting(true)

    try {
      // Track click-through and award NADA
      const response = await fetch(`${serverUrl}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          product_id: product.id,
          company_id: product.company_id,
          action_type: 'click_through',
          external_shop_platform: platform
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Show success toast with NADA earned
        toast.success(`+${data.nada_awarded} NADA earned! 🌱`, {
          description: 'Thank you for supporting hemp businesses!'
        })

        // Small delay for toast to show
        setTimeout(() => {
          // Open external shop in new tab
          window.open(product.external_shop_url, '_blank', 'noopener,noreferrer')

          // Close modal
          onClose()

          // Callback for parent to update NADA balance
          if (onPurchaseComplete) {
            onPurchaseComplete()
          }
        }, 500)
      } else {
        throw new Error(data.error || 'Failed to track purchase')
      }
    } catch (error) {
      console.error('Failed to track click-through:', error)
      toast.error('Failed to track analytics, but you can still visit the shop')
      
      // Still redirect even if analytics fails
      setTimeout(() => {
        window.open(product.external_shop_url, '_blank', 'noopener,noreferrer')
        onClose()
      }, 500)
    }
  }

  if (!isOpen) return null

  const hasProvenance = product.provenance_verified || product.hemp_source || product.certifications?.length

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 border-2 border-emerald-500/30 rounded-3xl shadow-2xl"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-green-400 animate-pulse" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isRedirecting}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-emerald-900/50 border-2 border-emerald-500/30 text-emerald-200 hover:bg-emerald-800/50 hover:text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-6 space-y-6">
            {/* Header: Product Summary */}
            <div className="flex gap-4">
              {/* Product Image */}
              {product.image_url && (
                <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500/30 bg-emerald-900/30">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-2xl text-white mb-1 truncate">
                  {product.name}
                </h2>
                <p className="text-emerald-200/70 text-sm mb-2">
                  {product.description}
                </p>
                
                {/* Company Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {company.logo_url && (
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-5 h-5 rounded-full border border-emerald-500/30"
                    />
                  )}
                  <span className="text-emerald-300 text-sm font-bold">
                    {company.name}
                  </span>
                  {company.is_association && (
                    <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Association
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="text-3xl font-black text-white">
                  ${product.price ? product.price.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            {/* Hemp Provenance Preview */}
            {hasProvenance && (
              <div>
                <ProvenancePreview product={product} compact={true} />
              </div>
            )}

            {/* External Shop Redirect Section */}
            <div className="bg-emerald-900/30 border-2 border-emerald-500/20 rounded-2xl p-5 space-y-4">
              {/* Platform Badge */}
              <div className="flex items-center justify-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${platformInfo.color} text-white font-bold shadow-lg`}>
                  <Globe className="w-5 h-5" />
                  <span>Sold on {platformInfo.name}</span>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-teal-900/30 border-2 border-teal-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-teal-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-teal-200 text-sm font-bold mb-1">
                      You'll be redirected to {platformInfo.name}
                    </p>
                    <p className="text-teal-300/70 text-xs">
                      This product is sold through an external shop. You'll complete your purchase on their secure platform.
                    </p>
                  </div>
                </div>

                {/* Supporting Organization */}
                <div className="flex items-center gap-2 pt-2 border-t border-teal-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-200 text-sm">
                    You're supporting: <span className="font-bold">{company.name}</span>
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-emerald-300/60 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Partner</span>
                </div>
              </div>
            </div>

            {/* NADA Reward Preview */}
            <NadaRewardPreview 
              basePoints={50}
              bonusPoints={[
                product.provenance_verified && { reason: 'Verified Provenance', points: 25 },
                product.conscious_score && product.conscious_score >= 90 && { reason: 'Exceptional Sustainability', points: 25 },
                product.certifications?.includes('Regenerative') && { reason: 'Regenerative Agriculture', points: 50 }
              ].filter(Boolean) as Array<{ reason: string; points: number }>}
              product={product}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={onClose}
                disabled={isRedirecting}
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-emerald-900/30 border-2 border-emerald-500/30 text-emerald-200 hover:bg-emerald-800/40 hover:text-white font-bold disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedirect}
                disabled={isRedirecting || !product.external_shop_url}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {isRedirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Continue to {platformInfo.name}
                    <ExternalLink className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center text-emerald-300/50 text-xs">
              <Sparkles className="w-4 h-4 inline-block mr-1" />
              Earn {nadaReward} NADA points for supporting hemp businesses
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
