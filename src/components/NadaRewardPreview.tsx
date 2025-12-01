import { Coins, Plus, Sparkles, TrendingUp, CheckCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from './ui/badge'

interface NadaRewardPreviewProps {
  basePoints: number
  bonusPoints?: Array<{ reason: string; points: number }>
  product?: any // Optional for additional context
}

export function NadaRewardPreview({ basePoints, bonusPoints = [], product }: NadaRewardPreviewProps) {
  const totalPoints = basePoints + bonusPoints.reduce((sum, bonus) => sum + bonus.points, 0)

  // Animation variants for coins
  const coinAnimation = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 }
    }
  }

  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'linear'
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 via-yellow-950/40 to-orange-950/40 border-2 border-amber-500/30 rounded-2xl p-5"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
          backgroundSize: '200% 100%'
        }}
        variants={shimmer}
        animate="animate"
      />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              variants={coinAnimation}
              initial="initial"
              animate="animate"
            >
              <Coins className="w-6 h-6 text-amber-400" />
            </motion.div>
            <h3 className="font-black text-white">NADA Rewards</h3>
          </div>
          
          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30 font-bold">
            <Sparkles className="w-3 h-3 mr-1" />
            Earn on purchase
          </Badge>
        </div>

        {/* Points Breakdown */}
        <div className="space-y-2">
          {/* Base Points */}
          <div className="flex items-center justify-between bg-amber-950/30 border border-amber-500/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-white font-bold">Supporting hemp business</span>
            </div>
            <span className="text-amber-400 font-black text-lg">+{basePoints}</span>
          </div>

          {/* Bonus Points */}
          {bonusPoints.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {bonusPoints.map((bonus, index) => (
                <motion.div
                  key={bonus.reason}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm">{bonus.reason}</span>
                      <p className="text-emerald-300/60 text-xs">Bonus reward</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-black text-lg">+{bonus.points}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400/50 rounded-xl px-4 py-4 mt-3"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-pulse" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Total Reward</p>
                  <p className="text-white font-black text-xl flex items-center gap-2">
                    {totalPoints} NADA
                    {totalPoints > basePoints && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                        +{((totalPoints - basePoints) / basePoints * 100).toFixed(0)}% bonus!
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut'
                }}
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Explainer */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200/80 text-xs leading-relaxed">
                <span className="font-bold">NADA points</span> are awarded when you click through to support hemp businesses. 
                {bonusPoints.length > 0 && (
                  <> You're earning <span className="font-bold text-emerald-300">bonus points</span> because this product has verified sustainability credentials!</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Achievement Hint (if high bonus) */}
        {totalPoints >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="bg-gradient-to-r from-purple-950/30 to-pink-950/30 border border-purple-500/20 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">High-Value Purchase!</p>
                <p className="text-purple-300/70 text-xs">
                  This purchase may unlock special achievements
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
