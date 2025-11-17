import { Lock } from 'lucide-react'
import { motion } from 'motion/react'

interface ComicLockOverlayProps {
  articlesNeeded: number
}

export function ComicLockOverlay({ articlesNeeded }: ComicLockOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-[2px]" />
      
      {/* Comic-style lock badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
        }}
        transition={{ 
          type: 'spring',
          duration: 0.8,
          bounce: 0.6
        }}
        className="relative z-20 pointer-events-auto"
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full opacity-40 blur-xl animate-pulse" />
        
        {/* Comic burst effect behind */}
        <motion.div 
          className="absolute inset-0 -z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="w-32 h-32 -translate-x-1/4 -translate-y-1/4">
            <defs>
              <radialGradient id="burstGradient">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            {[...Array(12)].map((_, i) => (
              <polygon
                key={i}
                points="50,50 48,30 52,30"
                fill="url(#burstGradient)"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          </svg>
        </motion.div>

        {/* Main lock badge with comic border */}
        <div className="relative">
          {/* White comic-style border */}
          <div className="absolute -inset-1 bg-white rounded-2xl transform rotate-2" />
          <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl" />
          
          {/* Inner content */}
          <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl p-4 shadow-2xl border-4 border-white">
            {/* Lock icon with shake animation */}
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="mb-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-md opacity-50" />
                <Lock className="w-12 h-12 text-white relative z-10 drop-shadow-lg" strokeWidth={3} />
              </div>
            </motion.div>
            
            {/* Text badge */}
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-inner">
              <div className="text-center">
                <div className="text-xl font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                  {articlesNeeded}
                </div>
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider leading-tight">
                  {articlesNeeded === 1 ? 'Article' : 'Articles'}
                </div>
              </div>
            </div>

            {/* Comic "POW" style decoration */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform rotate-12">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full"
              style={{
                left: `${Math.cos((i * Math.PI * 2) / 6) * 40 + 50}%`,
                top: `${Math.sin((i * Math.PI * 2) / 6) * 40 + 50}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Click hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white/30 shadow-xl">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👆 Click to see progress
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}
