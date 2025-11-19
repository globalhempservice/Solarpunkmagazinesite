import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles, Zap } from 'lucide-react'
import { Button } from './ui/button'

// NADA Ripple Icon from Wallet
function NadaRippleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center droplet */}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      
      {/* First ripple */}
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      
      {/* Second ripple */}
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      
      {/* Third ripple */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

interface MarketUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  nadaPoints: number
  cost: number
}

export function MarketUnlockModal({ isOpen, onClose, onConfirm, nadaPoints, cost }: MarketUnlockModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (nadaPoints < cost) {
      setError(`Insufficient NADA. You need ${cost} NADA but only have ${nadaPoints}.`)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await onConfirm()
      setIsSuccess(true)
      
      // Show success animation for 2 seconds, then close
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to unlock Community Market')
      setIsProcessing(false)
    }
  }

  const hasEnoughNada = nadaPoints >= cost
  const remainingAfter = nadaPoints - cost

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl p-1 max-w-md w-full relative overflow-hidden shadow-2xl"
          >
            {/* Ripple Animation Background - NADA Pranas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/30"
                  animate={{
                    scale: [1, 3, 5],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* Inner Content */}
            <div className="bg-background rounded-[22px] p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success State */}
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-center mb-2">Market Unlocked!</h3>
                  <p className="text-muted-foreground text-center">
                    The Community Market is now accessible
                  </p>
                </motion.div>
              )}

              {/* Transaction Form */}
              {!isSuccess && (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                      <NadaRippleIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Unlock Community Market</h2>
                    <p className="text-muted-foreground text-sm">
                      Spend NADA to unlock voting and feature submission
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-4 mb-6">
                    {/* Cost */}
                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cost</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                            <NadaRippleIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xl font-black">{cost}</span>
                          <span className="text-sm text-muted-foreground">NADA</span>
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Your Balance</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-black ${hasEnoughNada ? 'text-emerald-500' : 'text-red-500'}`}>
                            {nadaPoints}
                          </span>
                          <span className="text-sm text-muted-foreground">NADA</span>
                        </div>
                      </div>
                      
                      {hasEnoughNada && (
                        <>
                          <div className="h-px bg-border my-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">After Purchase</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black">{remainingAfter}</span>
                              <span className="text-sm text-muted-foreground">NADA</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Warning for insufficient balance */}
                    {!hasEnoughNada && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-red-500 font-semibold text-center">
                          ⚠️ Insufficient NADA points
                        </p>
                        <p className="text-xs text-red-500/80 text-center mt-1">
                          You need {cost - nadaPoints} more NADA to unlock this feature
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-red-500 font-semibold text-center">{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={!hasEnoughNada || isProcessing}
                      className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-black"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Processing...
                        </div>
                      ) : (
                        `Unlock for ${cost} NADA`
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}