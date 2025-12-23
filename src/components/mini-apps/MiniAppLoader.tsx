import { motion } from 'motion/react'
import { MiniAppMetadata } from '../../types/mini-app'
import { Loader2 } from 'lucide-react'

interface MiniAppLoaderProps {
  metadata: MiniAppMetadata
  progress?: number // 0-100
  currentTip?: string
}

/**
 * Universal loading screen for all mini-apps
 * Shows app branding, loading animation, and optional tips
 */
export function MiniAppLoader({ metadata, progress, currentTip }: MiniAppLoaderProps) {
  const { name, tagline, icon, brandColors, tips } = metadata

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${brandColors.background} 0%, ${brandColors.primary} 100%)`
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${brandColors.accent} 0%, transparent 50%), 
                             radial-gradient(circle at 80% 80%, ${brandColors.secondary} 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 max-w-md">
        {/* App Icon with Pulse Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            damping: 15,
            stiffness: 200,
            delay: 0.1
          }}
          className="mb-8 relative"
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse"
            style={{ background: brandColors.accent }}
          />
          
          {/* Icon container */}
          <div 
            className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`
            }}
          >
            <div className="text-white" style={{ fontSize: '3rem' }}>
              {icon}
            </div>
          </div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-white mb-3 text-center drop-shadow-lg"
        >
          {name}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white/80 mb-8 text-center"
        >
          {tagline}
        </motion.p>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Loader2 className="w-12 h-12 text-white animate-spin" strokeWidth={2.5} />
        </motion.div>

        {/* Progress Bar (if provided) */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-xs mb-6"
          >
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${brandColors.accent}, ${brandColors.secondary})`,
                  width: `${progress}%`
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-white/60 text-sm text-center mt-2">{Math.round(progress)}%</p>
          </motion.div>
        )}

        {/* Tips */}
        {currentTip && (
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-white/70 text-sm max-w-sm px-6"
          >
            💡 {currentTip}
          </motion.div>
        )}

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/50"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
