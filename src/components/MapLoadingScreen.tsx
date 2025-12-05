import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MapLoadingScreenProps {
  city: string
  country: string
  isVisible: boolean
}

export function MapLoadingScreen({ city, country, isVisible }: MapLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState('Entering Atlas City View')

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setLoadingPhase('Entering Atlas City View')
      return
    }

    // Simulate loading progress
    const duration = 2500 // Total duration in ms
    const steps = 100
    const interval = duration / steps

    let currentProgress = 0
    const timer = setInterval(() => {
      currentProgress += 1
      setProgress(currentProgress)

      // Update loading phase based on progress
      if (currentProgress < 30) {
        setLoadingPhase('Entering Atlas City View')
      } else if (currentProgress < 70) {
        setLoadingPhase('Loading City Map')
      } else {
        setLoadingPhase('Rendering City Grid')
      }

      if (currentProgress >= 100) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridScroll 20s linear infinite'
          }}
        />
      </div>

      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-pink-500/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-8">
        {/* Animated map pin */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Pulsing rings */}
            <motion.div
              animate={{ 
                scale: [1, 2, 2],
                opacity: [0.5, 0, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border-4 border-pink-500"
              style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%', width: '100px', height: '100px' }}
            />
            <motion.div
              animate={{ 
                scale: [1, 2, 2],
                opacity: [0.5, 0, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5
              }}
              className="absolute inset-0 rounded-full border-4 border-cyan-500"
              style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%', width: '100px', height: '100px' }}
            />
            
            {/* Map pin icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-pink-500/50 border-4 border-white/20">
              <MapPin className="w-12 h-12 text-white" fill="white" />
            </div>
          </div>
        </motion.div>

        {/* City name - GTA style */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-2"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-wider"
            style={{
              textShadow: `
                0 0 20px rgba(236, 72, 153, 0.8),
                0 0 40px rgba(236, 72, 153, 0.6),
                0 0 60px rgba(236, 72, 153, 0.4),
                4px 4px 0px rgba(0, 0, 0, 0.5)
              `,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.1em'
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.6), 4px 4px 0px rgba(0, 0, 0, 0.5)',
                '0 0 30px rgba(236, 72, 153, 1), 0 0 50px rgba(236, 72, 153, 0.8), 4px 4px 0px rgba(0, 0, 0, 0.5)',
                '0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.6), 4px 4px 0px rgba(0, 0, 0, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {city}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-pink-300 font-bold uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            {country}
          </motion.p>
        </motion.div>

        {/* Unified Progress Bar with Percentage and Phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          {/* Progress percentage */}
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className="text-5xl font-black text-white font-mono"
              style={{
                textShadow: `0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)`
              }}
            >
              {progress}%
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border-2 border-pink-500/50">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-full relative"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              >
                {/* Glowing effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent animate-pulse"
                  style={{
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)'
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Loading phase text */}
          <motion.div
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border border-pink-500/50 rounded-full backdrop-blur-md"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-pink-200 font-semibold text-base uppercase tracking-widest">
              {loadingPhase}...
            </span>
          </motion.div>
        </motion.div>

        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)'
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Corner decorations - GTA style */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-pink-500/50" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-pink-500/50" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-pink-500/50" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-pink-500/50" />
      </div>

      <style>{`
        @keyframes gridScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </motion.div>
  )
}