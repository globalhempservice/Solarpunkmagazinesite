import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wallet, Zap, Coins, ArrowRight, Sparkles, TrendingUp, X } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface WalletPanelProps {
  isOpen: boolean
  onClose: () => void
  currentPoints: number
  nadaPoints: number
  onExchange: (pointsToExchange: number) => Promise<void>
}

const EXCHANGE_RATE = 50 // 50 app points = 1 NADA point

export function WalletPanel({ isOpen, onClose, currentPoints, nadaPoints, onExchange }: WalletPanelProps) {
  const [exchangeAmount, setExchangeAmount] = useState(1) // Number of NADA points to get
  const [isExchanging, setIsExchanging] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const pointsCost = exchangeAmount * EXCHANGE_RATE
  const canExchange = currentPoints >= pointsCost

  const handleExchange = async () => {
    if (!canExchange || isExchanging) return

    setIsExchanging(true)
    try {
      await onExchange(pointsCost)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      setExchangeAmount(1) // Reset
    } catch (error) {
      console.error('Exchange failed:', error)
    } finally {
      setIsExchanging(false)
    }
  }

  const maxNadaPoints = Math.floor(currentPoints / EXCHANGE_RATE)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Wallet Panel - Full Page Slide Down */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[70] min-h-screen"
          >
            <div className="bg-background min-h-screen overflow-auto">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 pt-20 pb-8 px-6 overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }} />
                </div>

                {/* Animated coins floating */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ y: 100, x: Math.random() * 300, opacity: 0 }}
                      animate={{ 
                        y: -100, 
                        x: Math.random() * 300,
                        opacity: [0, 0.6, 0],
                        rotate: 360
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.8
                      }}
                    >
                      <Coins className="w-6 h-6 text-white" />
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>

                {/* Title */}
                <div className="relative text-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-2"
                  >
                    <Wallet className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-white drop-shadow-lg tracking-wide">
                    Wallet
                  </h2>
                  <p className="text-white/90 text-sm font-medium mt-1">
                    Transform your points into NADA
                  </p>
                </div>

                {/* Balances */}
                <div className="relative grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {/* App Points */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border-2 border-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-gray-600 uppercase">Points</span>
                    </div>
                    <div className="text-2xl font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                      {currentPoints.toLocaleString()}
                    </div>
                  </div>

                  {/* NADA Points */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border-2 border-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-600 uppercase">NADA</span>
                    </div>
                    <div className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                      {nadaPoints.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exchange Section */}
              <div className="max-w-md mx-auto p-6 space-y-5">
                {/* Exchange Rate Info */}
                <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-xl border-2 border-border">
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 px-3 py-1">
                    <Zap className="w-3 h-3 fill-current mr-1" />
                    {EXCHANGE_RATE}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-3 py-1">
                    <Coins className="w-3 h-3 mr-1" />
                    1 NADA
                  </Badge>
                </div>

                {/* Exchange Calculator */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">
                    How many NADA points do you want?
                  </label>
                  
                  {/* Input with increment/decrement */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeAmount(Math.max(1, exchangeAmount - 1))}
                      className="w-10 h-10 p-0 text-xl font-bold"
                      disabled={exchangeAmount <= 1}
                    >
                      -
                    </Button>
                    
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        min="1"
                        max={maxNadaPoints}
                        value={exchangeAmount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          setExchangeAmount(Math.min(maxNadaPoints, Math.max(1, val)))
                        }}
                        className="w-full text-center text-3xl font-black bg-transparent border-0 focus:outline-none text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        NADA Points
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeAmount(Math.min(maxNadaPoints, exchangeAmount + 1))}
                      className="w-10 h-10 p-0 text-xl font-bold"
                      disabled={exchangeAmount >= maxNadaPoints}
                    >
                      +
                    </Button>
                  </div>

                  {/* Quick select buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeAmount(Math.min(maxNadaPoints, 5))}
                      className="flex-1 text-xs"
                      disabled={maxNadaPoints < 5}
                    >
                      5
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeAmount(Math.min(maxNadaPoints, 10))}
                      className="flex-1 text-xs"
                      disabled={maxNadaPoints < 10}
                    >
                      10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeAmount(maxNadaPoints)}
                      className="flex-1 text-xs"
                      disabled={maxNadaPoints < 1}
                    >
                      MAX
                    </Button>
                  </div>

                  {/* Cost Display */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Cost:</span>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className={`text-lg font-black ${canExchange ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pointsCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!canExchange && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                        Not enough points! Need {(pointsCost - currentPoints).toLocaleString()} more.
                      </div>
                    )}
                  </div>
                </div>

                {/* Exchange Button */}
                <Button
                  onClick={handleExchange}
                  disabled={!canExchange || isExchanging}
                  className="w-full h-14 text-lg font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExchanging ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <TrendingUp className="w-5 h-5" />
                    </motion.div>
                  ) : showSuccess ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Exchange Complete!
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Exchange Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}