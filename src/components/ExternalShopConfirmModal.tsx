import { X, ExternalLink, Shield, Building2, AlertTriangle, ArrowLeft, Globe, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

interface ExternalShopConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  organizationName: string
  organizationLogo?: string | null
  externalShopUrl: string
  isAssociation?: boolean
}

export function ExternalShopConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  organizationName,
  organizationLogo,
  externalShopUrl,
  isAssociation = false
}: ExternalShopConfirmModalProps) {
  const [countdown, setCountdown] = useState(5)
  const [canProceed, setCanProceed] = useState(false)

  // Start countdown when modal opens
  useState(() => {
    if (isOpen && !canProceed) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanProceed(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  })

  // Reset when modal closes
  useState(() => {
    if (!isOpen) {
      setCountdown(5)
      setCanProceed(false)
    }
  })

  if (!isOpen) return null

  const urlDomain = new URL(externalShopUrl).hostname

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 border-2 border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-green-400 animate-pulse" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-emerald-900/50 border-2 border-emerald-500/30 text-emerald-200 hover:bg-emerald-800/50 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative p-8">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 border-2 border-amber-400/50 shadow-2xl">
                  <ExternalLink className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-black text-3xl text-center text-white mb-4">
              Leaving DEWII Marketplace
            </h2>
            <p className="text-emerald-200/80 text-center mb-6">
              You're about to visit an external shop
            </p>

            {/* Organization Info Card */}
            <div className="mb-6 p-5 bg-emerald-900/40 rounded-2xl border-2 border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                {organizationLogo ? (
                  <img
                    src={organizationLogo}
                    alt={organizationName}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400/40"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-800/50 border-2 border-emerald-400/40 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-emerald-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-white text-lg">{organizationName}</p>
                    {isAssociation && (
                      <Badge className="bg-purple-500/90 text-white border-purple-400/50 gap-1 text-xs">
                        <Shield className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-emerald-300/70 font-bold">ORGANIZATION</p>
                </div>
              </div>

              {/* Product Name */}
              <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-500/20">
                <p className="text-xs text-emerald-300/70 font-bold mb-1">PRODUCT</p>
                <p className="font-black text-white">{productName}</p>
              </div>
            </div>

            {/* External URL Display */}
            <div className="mb-6 p-4 bg-teal-900/30 rounded-xl border border-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <p className="text-xs text-teal-300/70 font-bold uppercase">Destination</p>
              </div>
              <p className="text-sm text-teal-200 font-mono break-all">{urlDomain}</p>
            </div>

            {/* Safety Information */}
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-900/20 rounded-xl border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-200/90 font-bold mb-1">External Website</p>
                  <p className="text-xs text-amber-200/70">
                    This shop is operated by {organizationName}. DEWII is not responsible for external transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-emerald-200/90 font-bold mb-1">Trusted Partner</p>
                  <p className="text-xs text-emerald-200/70">
                    This organization is {isAssociation ? 'a verified association' : 'listed'} in the DEWII Hemp Atlas directory.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Reminders */}
            <div className="mb-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
              <p className="text-xs text-purple-300/70 font-bold uppercase mb-2">Remember</p>
              <ul className="space-y-2 text-sm text-purple-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Purchases are made directly with {organizationName}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Payment is handled by their external shop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>You can return to DEWII anytime</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                disabled={!canProceed}
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`w-full gap-2 text-lg py-6 font-black transition-all ${
                  canProceed
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white border-2 border-teal-400/30'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed border-2 border-gray-600/30'
                }`}
              >
                {canProceed ? (
                  <>
                    Continue to External Shop
                    <ExternalLink className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Please wait... ({countdown}s)
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={onClose}
                className="w-full gap-2 font-black text-lg py-6 border-2 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <ArrowLeft className="w-5 h-5" />
                Stay on DEWII
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-emerald-200/50 text-center mt-4">
              Always verify the URL before making purchases
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
