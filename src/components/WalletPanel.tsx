import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wallet, Zap, Coins, ArrowRight, Sparkles, TrendingUp, X, Clock, Info, Shield, Leaf, Sprout, Sun, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { NadaFeedbackSection } from './NadaFeedbackSection'

interface WalletPanelProps {
  isOpen: boolean
  onClose: () => void
  currentPoints: number
  nadaPoints: number
  onExchange: (pointsToExchange: number) => Promise<void>
  userId?: string
  accessToken?: string
  serverUrl?: string
}

const EXCHANGE_RATE = 50 // 50 app points = 1 NADA point

// Water Drop Ripple SVG Component
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

// Alchemy Lab Icon - Transmutation & Transformation
function AlchemyLabIcon({ className = "w-16 h-16", elements }: { className?: string, elements?: AlchemyElement[] }) {
  // Default elements if none provided
  const defaultElements: AlchemyElement[] = [
    { type: 'circle', size: 40 },
    { type: 'triangle-up', size: 40 },
    { type: 'line-h', y: 50 },
    { type: 'dot', size: 4 }
  ]
  
  const displayElements = elements || defaultElements
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {displayElements.map((el, idx) => {
        switch(el.type) {
          case 'circle':
            return <circle key={idx} cx="50" cy="50" r={el.size} stroke="currentColor" strokeWidth="3" />
          case 'circle-filled':
            return <circle key={idx} cx="50" cy="50" r={el.size} fill="currentColor" opacity="0.3" />
          case 'triangle-up':
            return <path key={idx} d={`M 50 ${50 - el.size} L ${50 + el.size} ${50 + el.size/2} L ${50 - el.size} ${50 + el.size/2} Z`} stroke="currentColor" strokeWidth="3" fill="none" />
          case 'triangle-down':
            return <path key={idx} d={`M 50 ${50 + el.size} L ${50 - el.size} ${50 - el.size/2} L ${50 + el.size} ${50 - el.size/2} Z`} stroke="currentColor" strokeWidth="3" fill="none" />
          case 'square':
            return <rect key={idx} x={50 - el.size/2} y={50 - el.size/2} width={el.size} height={el.size} stroke="currentColor" strokeWidth="3" fill="none" />
          case 'line-h':
            return <line key={idx} x1={50 - el.size!} y1={el.y || 50} x2={50 + el.size!} y2={el.y || 50} stroke="currentColor" strokeWidth="3" />
          case 'line-v':
            return <line key={idx} x1={el.x || 50} y1={50 - el.size!} x2={el.x || 50} y2={50 + el.size!} stroke="currentColor" strokeWidth="3" />
          case 'cross':
            return (
              <g key={idx}>
                <line x1={50 - el.size!} y1="50" x2={50 + el.size!} y2="50" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1={50 - el.size!} x2="50" y2={50 + el.size!} stroke="currentColor" strokeWidth="2" />
              </g>
            )
          case 'dot':
            return <circle key={idx} cx="50" cy="50" r={el.size} fill="currentColor" />
          case 'ring':
            return (
              <g key={idx}>
                <circle cx="50" cy="50" r={el.size} stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r={el.size! / 2} fill="currentColor" />
              </g>
            )
          default:
            return null
        }
      })}
    </svg>
  )
}

type AlchemyElement = {
  type: 'circle' | 'circle-filled' | 'triangle-up' | 'triangle-down' | 'square' | 'line-h' | 'line-v' | 'cross' | 'dot' | 'ring'
  size: number
  x?: number
  y?: number
}

export function WalletPanel({ isOpen, onClose, currentPoints, nadaPoints, onExchange, userId, accessToken, serverUrl }: WalletPanelProps) {
  const [exchangeAmount, setExchangeAmount] = useState(1) // Number of NADA points to get
  const [isExchanging, setIsExchanging] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAlchemyController, setShowAlchemyController] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [alchemyElements, setAlchemyElements] = useState<AlchemyElement[]>([
    { type: 'circle', size: 40 },
    { type: 'triangle-up', size: 40 },
    { type: 'line-h', size: 20, y: 50 },
    { type: 'dot', size: 4 }
  ])

  const pointsCost = exchangeAmount * EXCHANGE_RATE
  const canExchange = currentPoints >= pointsCost && !rateLimitedUntil

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, rateLimitedUntil - Date.now())
        setCountdown(Math.ceil(remaining / 1000))
        
        if (remaining <= 0) {
          setRateLimitedUntil(null)
          setErrorMessage(null)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [rateLimitedUntil])

  const handleExchange = async () => {
    if (!canExchange || isExchanging) return

    setIsExchanging(true)
    setErrorMessage(null)
    
    try {
      await onExchange(pointsCost)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      setExchangeAmount(1) // Reset
    } catch (error: any) {
      // Check if it's a rate limit error (429 status)
      if (error.message && error.message.includes('Rate limit')) {
        // Set rate limited for 5 minutes
        const unlockTime = Date.now() + 5 * 60 * 1000
        setRateLimitedUntil(unlockTime)
        setErrorMessage('⏳ Rate limit reached! You can exchange again in 5 minutes.')
      } else if (error.message && error.message.includes('Daily')) {
        setErrorMessage('📅 Daily limit reached! You can exchange again tomorrow.')
      } else {
        setErrorMessage(error.message || 'Exchange failed. Please try again.')
      }
    } finally {
      setIsExchanging(false)
    }
  }

  const maxNadaPoints = Math.floor(currentPoints / EXCHANGE_RATE)

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Randomize alchemy symbol
  const randomizeAlchemySymbol = () => {
    const allTypes: AlchemyElement['type'][] = [
      'circle', 'circle-filled', 'triangle-up', 'triangle-down', 
      'square', 'line-h', 'line-v', 'cross', 'dot', 'ring'
    ]
    
    // Generate 2-5 random elements
    const numElements = Math.floor(Math.random() * 4) + 2 // 2 to 5
    const newElements: AlchemyElement[] = []
    
    for (let i = 0; i < numElements; i++) {
      const randomType = allTypes[Math.floor(Math.random() * allTypes.length)]
      const randomSize = Math.floor(Math.random() * 25) + 20 // Size between 20-45
      
      const element: AlchemyElement = {
        type: randomType,
        size: randomSize
      }
      
      // Add position for lines if needed
      if (randomType === 'line-h') {
        element.y = Math.floor(Math.random() * 40) + 30 // y between 30-70
      }
      if (randomType === 'line-v') {
        element.x = Math.floor(Math.random() * 40) + 30 // x between 30-70
      }
      
      newElements.push(element)
    }
    
    setAlchemyElements(newElements)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gradient-to-br from-teal-950/80 via-emerald-950/80 to-amber-950/80 backdrop-blur-md z-[60]"
            onClick={onClose}
          />

          {/* Wallet Panel - Full Page Slide Down */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto overscroll-contain bg-background">
              {/* Solarpunk Header with Organic Patterns */}
              <div className="relative bg-gradient-to-br from-teal-900 via-emerald-800 to-amber-700 dark:from-teal-950 dark:via-emerald-900 dark:to-amber-900 hempin:from-teal-900 hempin:via-emerald-900 hempin:to-amber-800 pt-20 pb-12 px-6 overflow-hidden">
                
                {/* Animated leaf/plant patterns */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 Q 40 20, 30 30 Q 20 20, 30 10' fill='white' opacity='0.4'/%3E%3Cpath d='M10 30 Q 20 40, 30 30 Q 20 20, 10 30' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }} />
                </div>

                {/* Animated sun rays */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-full"
                  >
                    <Sun className="w-full h-full text-amber-300" />
                  </motion.div>
                </div>

                {/* Floating eco particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ y: 100, x: Math.random() * 300, opacity: 0, rotate: 0 }}
                      animate={{ 
                        y: -100, 
                        x: Math.random() * 300 + (i % 2 ? 50 : -50),
                        opacity: [0, 0.7, 0],
                        rotate: 360
                      }}
                      transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeInOut'
                      }}
                    >
                      {i % 3 === 0 ? (
                        <Leaf className="w-5 h-5 text-emerald-300" />
                      ) : i % 3 === 1 ? (
                        <Sprout className="w-5 h-5 text-teal-300" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Comic-style close button */}
                <button
                  onClick={onClose}
                  className="fixed top-6 right-6 z-[100] p-3 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform font-black" strokeWidth={3} />
                </button>

                {/* Comic-style Title */}
                <div className="relative text-center mb-6">
                  {/* Glow effect behind icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 rounded-full blur-3xl opacity-40 animate-pulse" />
                  
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block mb-3 relative cursor-pointer"
                    onClick={() => setShowAlchemyController(!showAlchemyController)}
                  >
                    <AlchemyLabIcon 
                      className="w-16 h-16 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] filter" 
                      elements={alchemyElements}
                    />
                  </motion.div>
                  
                  {/* Comic text effect */}
                  <div className="relative">
                    <h2 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight mb-1" style={{
                      textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
                    }}>
                      WALLET
                    </h2>
                    <p className="text-emerald-100 font-bold drop-shadow-lg tracking-wide">
                      Transform Energy into Impact
                    </p>
                  </div>
                </div>

                {/* Comic-style Balance Cards */}
                <div className="relative grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {/* App Points Card */}
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 border-4 border-amber-300/50 shadow-[0_8px_0_rgba(0,0,0,0.2),0_0_30px_rgba(251,191,36,0.4)] cursor-pointer"
                  >
                    {/* Comic dots pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }} />
                    
                    <div className="relative flex flex-col items-center justify-center text-center min-h-[100px]">
                      <Zap className="w-8 h-8 fill-white text-white drop-shadow-lg mb-3" strokeWidth={3} />
                      <div className="text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)] mb-2" style={{
                        textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                      }}>
                        {currentPoints.toLocaleString()}
                      </div>
                      <motion.span 
                        initial={{ opacity: 0, height: 0 }}
                        whileHover={{ opacity: 1, height: 'auto' }}
                        className="text-xs font-black text-white/90 uppercase tracking-wider drop-shadow-md overflow-hidden"
                      >
                        Energy
                      </motion.span>
                    </div>

                    {/* Comic shine effect */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/40 rounded-full blur-sm" />
                  </motion.div>

                  {/* NADA Points Card */}
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl p-5 border-4 border-emerald-300/50 shadow-[0_8px_0_rgba(0,0,0,0.2),0_0_30px_rgba(16,185,129,0.4)] cursor-pointer"
                  >
                    {/* Comic dots pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }} />
                    
                    <div className="relative flex flex-col items-center justify-center text-center min-h-[100px]">
                      <NadaRippleIcon className="w-8 h-8 text-white drop-shadow-lg mb-3" />
                      <div className="text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)] mb-2" style={{
                        textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                      }}>
                        {nadaPoints.toLocaleString()}
                      </div>
                      <motion.span 
                        initial={{ opacity: 0, height: 0 }}
                        whileHover={{ opacity: 1, height: 'auto' }}
                        className="text-xs font-black text-white/90 uppercase tracking-wider drop-shadow-md overflow-hidden"
                      >
                        NADA
                      </motion.span>
                    </div>

                    {/* Comic shine effect */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/40 rounded-full blur-sm" />
                  </motion.div>
                </div>
              </div>

              {/* Exchange Section with Solarpunk Card Design */}
              <div className="max-w-lg mx-auto p-6 pb-32 space-y-6">
                {/* Error Message with Comic Style */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="relative overflow-hidden p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 hempin:from-red-950/40 hempin:to-orange-950/40 border-4 border-red-400/50 dark:border-red-600/50 rounded-2xl shadow-[0_6px_0_rgba(220,38,38,0.2)]"
                  >
                    {/* Comic dots */}
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }} />
                    
                    <div className="relative flex items-start gap-3">
                      <Clock className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={3} />
                      <div className="flex-1">
                        <p className="font-black text-red-900 dark:text-red-100">
                          {errorMessage}
                        </p>
                        {rateLimitedUntil && (
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-bold">
                            ⏱️ Time remaining: {formatCountdown(countdown)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Exchange Rate Info with Aura */}
                <div className="relative">
                  {/* Glow aura */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                  
                  <div className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-muted/50 to-card rounded-3xl border-4 border-border shadow-[0_8px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_0_rgba(255,255,255,0.05)]">
                    {/* Comic dots background */}
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }} />
                    
                    {/* Decorative sparkles */}
                    <div className="absolute top-2 right-2">
                      <Sparkles className="w-6 h-6 text-amber-400 opacity-50" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Sparkles className="w-5 h-5 text-emerald-400 opacity-50" />
                    </div>
                    
                    <div className="relative">
                      {/* Title */}
                      <div className="text-center mb-4">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Generation Rate</p>
                        <div className="h-1 w-16 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full mx-auto" />
                      </div>
                      
                      {/* Conversion display */}
                      <div className="flex items-center justify-center gap-5">
                        {/* Energy badge */}
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-40" />
                          <div className="relative flex flex-col items-center gap-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 border-3 border-amber-300/50 shadow-[0_6px_0_rgba(251,191,36,0.3)] min-w-[100px]">
                            <Zap className="w-7 h-7 fill-white text-white drop-shadow-lg" strokeWidth={3} />
                            <div className="text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]" style={{
                              textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                            }}>
                              {EXCHANGE_RATE}
                            </div>
                            <div className="text-[10px] font-black text-white/80 uppercase tracking-wider">Energy</div>
                          </div>
                        </div>
                        
                        {/* Animated arrow */}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="flex flex-col items-center gap-1"
                        >
                          <ArrowRight className="w-8 h-8 text-foreground" strokeWidth={4} />
                          <div className="text-[10px] font-black text-muted-foreground uppercase">Becomes</div>
                        </motion.div>
                        
                        {/* NADA badge */}
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-40" />
                          <div className="relative flex flex-col items-center gap-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl p-4 border-3 border-emerald-300/50 shadow-[0_6px_0_rgba(16,185,129,0.3)] min-w-[100px]">
                            <NadaRippleIcon className="w-7 h-7 text-white drop-shadow-lg" />
                            <div className="text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]" style={{
                              textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                            }}>
                              1
                            </div>
                            <div className="text-[10px] font-black text-white/80 uppercase tracking-wider">NADA</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom description */}
                      <div className="text-center mt-4 pt-3 border-t-2 border-border/50">
                        <p className="text-xs text-muted-foreground font-bold">
                          Every <span className="text-amber-600 dark:text-amber-400 font-black">{EXCHANGE_RATE} Energy</span> = <span className="text-emerald-600 dark:text-emerald-400 font-black">1 NADA</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Calculator Card */}
                <div className="relative overflow-hidden rounded-3xl border-4 border-border/50 bg-card shadow-[0_8px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_0_rgba(255,255,255,0.05)]">
                  {/* Aura glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-10" />
                  
                  <div className="relative p-6 space-y-5">
                    <label className="font-black text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      How many NADA do you want?
                    </label>
                    
                    {/* Comic-style Input with increment/decrement */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExchangeAmount(Math.max(1, exchangeAmount - 1))}
                        className="w-12 h-12 p-0 text-2xl font-black rounded-xl border-3 shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all"
                        disabled={exchangeAmount <= 1}
                      >
                        -
                      </Button>
                      
                      <div className="flex-1 text-center relative">
                        {/* Glow behind number */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-20" />
                        
                        <input
                          type="number"
                          min="1"
                          max={maxNadaPoints}
                          value={exchangeAmount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            setExchangeAmount(Math.min(maxNadaPoints, Math.max(1, val)))
                          }}
                          className="relative w-full text-center text-5xl font-black bg-transparent border-0 focus:outline-none text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text"
                          style={{
                            textShadow: '0 2px 10px rgba(16,185,129,0.3)'
                          }}
                        />
                        <div className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                          NADA Points
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExchangeAmount(Math.min(maxNadaPoints, exchangeAmount + 1))}
                        className="w-12 h-12 p-0 text-2xl font-black rounded-xl border-3 shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all"
                        disabled={exchangeAmount >= maxNadaPoints}
                      >
                        +
                      </Button>
                    </div>

                    {/* Quick select buttons */}
                    <div className="flex gap-2">
                      {[5, 10, maxNadaPoints].map((amount, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => setExchangeAmount(Math.min(maxNadaPoints, amount))}
                          className="flex-1 font-black rounded-xl border-2 shadow-[0_3px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-0.5 transition-all"
                          disabled={maxNadaPoints < (idx === 2 ? 1 : amount)}
                        >
                          {idx === 2 ? 'MAX' : amount}
                        </Button>
                      ))}
                    </div>

                    {/* Cost Display with Comic Style */}
                    <div className="relative overflow-hidden p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 hempin:from-amber-950/40 hempin:via-orange-950/40 hempin:to-yellow-950/40 rounded-2xl border-4 border-amber-300/50 dark:border-amber-700/50 shadow-[0_6px_0_rgba(245,158,11,0.2)]">
                      {/* Comic dots pattern */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '8px 8px'
                      }} />
                      
                      <div className="relative">
                        <div className="text-center mb-2">
                          <span className="text-xs font-black text-muted-foreground uppercase tracking-wide">Use</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Zap className="w-6 h-6 fill-amber-500 text-amber-500" strokeWidth={0} />
                          <span className={`text-3xl font-black ${canExchange ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`} style={{
                            textShadow: canExchange ? '0 2px 10px rgba(245,158,11,0.3)' : '0 2px 10px rgba(220,38,38,0.3)'
                          }}>
                            {pointsCost.toLocaleString()}
                          </span>
                        </div>
                        {!canExchange && currentPoints < pointsCost && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-3 text-center font-black uppercase">
                            Need {(pointsCost - currentPoints).toLocaleString()} more points!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comic-style Exchange Button */}
                <div className="relative">
                  {/* Button glow */}
                  {canExchange && !rateLimitedUntil && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
                  )}
                  
                  <Button
                    onClick={handleExchange}
                    disabled={!canExchange || isExchanging}
                    className="relative w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white border-4 border-emerald-400/50 shadow-[0_8px_0_rgba(16,185,129,0.4)] hover:shadow-[0_10px_0_rgba(16,185,129,0.5)] active:shadow-[0_2px_0_rgba(16,185,129,0.4)] active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider"
                  >
                    {rateLimitedUntil ? (
                      <>
                        <Clock className="w-6 h-6 mr-2" strokeWidth={3} />
                        Wait {formatCountdown(countdown)}
                      </>
                    ) : isExchanging ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="flex items-center"
                      >
                        <TrendingUp className="w-6 h-6" strokeWidth={3} />
                      </motion.div>
                    ) : showSuccess ? (
                      <>
                        <Sparkles className="w-6 h-6 mr-2" strokeWidth={3} />
                        Success!
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-6 h-6 mr-2" strokeWidth={3} />
                        Generate Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Info Section - Collapsible Rules */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowRules(!showRules)}
                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-2xl transition-all border-2 border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                      <h3 className="font-black text-foreground">Generation Rules</h3>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform ${showRules ? 'rotate-180' : ''}`} 
                      strokeWidth={3}
                    />
                  </button>

                  <AnimatePresence>
                    {showRules && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-4">
                          {/* Rate Limit */}
                          <div className="relative overflow-hidden flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hempin:from-blue-950/30 hempin:to-cyan-950/30 rounded-xl border-3 border-blue-300/50 dark:border-blue-700/50 shadow-[0_4px_0_rgba(59,130,246,0.2)]">
                            {/* Comic dots */}
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                              backgroundSize: '6px 6px'
                            }} />
                            
                            <Clock className="relative w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" strokeWidth={3} />
                            <div className="relative flex-1">
                              <p className="font-black text-blue-900 dark:text-blue-100">
                                Rate Limit
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 font-bold">
                                Max 5 generations per 5 minutes
                              </p>
                            </div>
                          </div>

                          {/* Daily Limit */}
                          <div className="relative overflow-hidden flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hempin:from-purple-950/30 hempin:to-pink-950/30 rounded-xl border-3 border-purple-300/50 dark:border-purple-700/50 shadow-[0_4px_0_rgba(168,85,247,0.2)]">
                            {/* Comic dots */}
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                              backgroundSize: '6px 6px'
                            }} />
                            
                            <Shield className="relative w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" strokeWidth={3} />
                            <div className="relative flex-1">
                              <p className="font-black text-purple-900 dark:text-purple-100">
                                Daily Limit
                              </p>
                              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5 font-bold">
                                Max 10 generations per day
                              </p>
                            </div>
                          </div>

                          {/* Max Exchange */}
                          <div className="relative overflow-hidden flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hempin:from-orange-950/30 hempin:to-amber-950/30 rounded-xl border-3 border-orange-300/50 dark:border-orange-700/50 shadow-[0_4px_0_rgba(249,115,22,0.2)]">
                            {/* Comic dots */}
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                              backgroundSize: '6px 6px'
                            }} />
                            
                            <Sparkles className="relative w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" strokeWidth={3} />
                            <div className="relative flex-1">
                              <p className="font-black text-orange-900 dark:text-orange-100">
                                Single Generation Limit
                              </p>
                              <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5 font-bold">
                                Max 5,000 points per generation (100 NADA)
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alchemy Controller Easter Egg */}
          <AnimatePresence>
            {showAlchemyController && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-20 bottom-20 w-80 z-[80] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full overflow-y-auto bg-card border-l-4 border-amber-500 shadow-[-10px_0_40px_rgba(245,158,11,0.4)] rounded-l-3xl p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-foreground">
                      Change Logo
                    </h3>
                    <button
                      onClick={() => setShowAlchemyController(false)}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Symbol Preview */}
                  <div className="relative mb-6">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
                    <div className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 hempin:from-amber-950/50 hempin:to-emerald-950/50 rounded-2xl p-8 border-3 border-amber-300/50 dark:border-amber-700/50">
                      <AlchemyLabIcon 
                        className="w-32 h-32 mx-auto text-amber-600 dark:text-amber-400" 
                        elements={alchemyElements}
                      />
                    </div>
                  </div>

                  {/* Randomize Button */}
                  <Button
                    onClick={randomizeAlchemySymbol}
                    className="w-full h-12 font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-3 border-amber-300/50 shadow-[0_6px_0_rgba(245,158,11,0.4)] active:shadow-[0_2px_0_rgba(245,158,11,0.4)] active:translate-y-1 transition-all uppercase tracking-wider"
                  >
                    <Sparkles className="w-5 h-5 mr-2" strokeWidth={3} />
                    Transmute
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}