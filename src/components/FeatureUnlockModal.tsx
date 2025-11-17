import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Lock, Unlock, Heart, Share2, Zap, TrendingUp, Palette, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FEATURE_UNLOCKS, type FeatureId } from '../utils/featureUnlocks'

interface FeatureUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  featureId: FeatureId
  currentProgress: number
}

const featureIcons: Record<FeatureId, React.ReactNode> = {
  'swipe-mode': <Heart className="w-12 h-12" />,
  'article-sharing': <Share2 className="w-12 h-12" />,
  'article-creation': <Zap className="w-12 h-12" />,
  'reading-analytics': <TrendingUp className="w-12 h-12" />,
  'theme-customization': <Palette className="w-12 h-12" />
}

const featureColors: Record<FeatureId, { gradient: string; glow: string; border: string }> = {
  'swipe-mode': {
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    glow: 'shadow-pink-500/50',
    border: 'border-pink-500/30'
  },
  'article-sharing': {
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-500/30'
  },
  'article-creation': {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    glow: 'shadow-emerald-500/50',
    border: 'border-emerald-500/30'
  },
  'reading-analytics': {
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    glow: 'shadow-blue-500/50',
    border: 'border-blue-500/30'
  },
  'theme-customization': {
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    glow: 'shadow-orange-500/50',
    border: 'border-orange-500/30'
  }
}

export function FeatureUnlockModal({ isOpen, onClose, featureId, currentProgress }: FeatureUnlockModalProps) {
  const feature = FEATURE_UNLOCKS[featureId]
  const colors = featureColors[featureId]
  const progress = Math.min((currentProgress / feature.requiredArticles) * 100, 100)
  const articlesRemaining = Math.max(feature.requiredArticles - currentProgress, 0)
  const isUnlocked = currentProgress >= feature.requiredArticles

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-4 border-border bg-background">
        {/* Accessibility - Visually hidden but available for screen readers */}
        <DialogTitle className="sr-only">
          {feature.name} - {isUnlocked ? 'Unlocked' : 'Locked'} Feature
        </DialogTitle>
        <DialogDescription className="sr-only">
          {feature.description} You have read {currentProgress} out of {feature.requiredArticles} articles required to unlock this feature.
        </DialogDescription>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm border-2 border-border hover:border-foreground/50 transition-all group"
        >
          <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Header with animated gradient */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient} p-8 pb-10`}>
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          
          {/* Comic-style burst background */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <pattern id="comic-burst" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#comic-burst)" />
            </svg>
          </div>

          {/* Lock/Unlock Icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
            className="relative mx-auto w-20 h-20 mb-4"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
            
            {/* Main icon circle with comic border */}
            <div className="relative w-full h-full bg-white rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isUnlocked ? (
                  <motion.div
                    key="unlocked"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className={`bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}
                  >
                    <Unlock className="w-10 h-10 stroke-current" style={{ WebkitTextStroke: '2px', WebkitTextStrokeColor: 'url(#gradient)' }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      rotate: [0, -5, 5, -5, 0]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      scale: { type: 'spring', duration: 0.6 },
                      rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
                    }}
                    className="text-gray-400"
                  >
                    <Lock className="w-10 h-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Comic-style speed lines */}
            {!isUnlocked && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-8 bg-white/40 origin-bottom"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-50px)`
                    }}
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                      scaleY: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Feature Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-white text-center mb-3 uppercase tracking-wide"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            {feature.name}
          </motion.h2>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <Badge 
              className={`text-sm px-4 py-1 border-2 border-white/50 ${
                isUnlocked 
                  ? 'bg-white text-emerald-600' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}
            >
              {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
            </Badge>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Feature Icon Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white`}>
              <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse" />
              <div className="relative">
                {featureIcons[featureId]}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground text-base"
          >
            {feature.description}
          </motion.p>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            {/* Progress Bar with comic style */}
            <div className="relative">
              {/* Comic border effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-full opacity-20 blur`} />
              
              <div className="relative h-8 bg-muted rounded-full overflow-hidden border-4 border-border shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${colors.gradient} relative overflow-hidden`}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  
                  {/* Progress percentage */}
                  {progress > 20 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black text-white drop-shadow-lg">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                <span className="font-semibold text-foreground">
                  {currentProgress} / {feature.requiredArticles} Articles
                </span>
              </div>
              {!isUnlocked && (
                <span className="text-muted-foreground font-medium">
                  {articlesRemaining} more to go!
                </span>
              )}
            </div>
          </motion.div>

          {/* Call to Action Message - Only show when unlocked */}
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className={`p-4 rounded-xl bg-gradient-to-r ${colors.gradient} ${colors.glow} shadow-xl`}>
                <p className="text-center text-white font-bold text-lg">
                  Feature Unlocked! Start using it now!
                </p>
              </div>
            </motion.div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-bold py-6 text-lg shadow-lg ${colors.glow} border-0`}
          >
            {isUnlocked ? 'Let\'s Go! 🚀' : 'Keep Reading'}
          </Button>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 3s infinite linear;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}