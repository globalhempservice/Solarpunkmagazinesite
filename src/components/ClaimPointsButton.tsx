import { Check, Loader, Zap } from 'lucide-react'
import { motion } from 'motion/react'

interface ClaimPointsButtonProps {
  isAlreadyRead: boolean
  claimingPoints: boolean
  pointsClaimed: boolean
  onClick: () => void
  points?: number  // Dynamic points (5 for RSS, 10 for regular)
}

export function ClaimPointsButton({ isAlreadyRead, claimingPoints, pointsClaimed, onClick, points = 10 }: ClaimPointsButtonProps) {
  // Already read - grey out
  if (isAlreadyRead) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-4 border-border/30 bg-gradient-to-br from-muted/50 to-muted/30 p-8 shadow-lg cursor-not-allowed opacity-60">
        {/* Halftone pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }} />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Check className="w-8 h-8 text-muted-foreground" strokeWidth={3} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-muted-foreground mb-1">Already Claimed</h3>
            <p className="text-sm text-muted-foreground/70">You've already earned points for this article!</p>
          </div>
        </div>
      </div>
    )
  }

  // Points claimed - success state
  if (pointsClaimed) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative overflow-hidden rounded-3xl border-4 border-emerald-500 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 shadow-2xl"
      >
        {/* Halftone pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }} />

        {/* Animated glow */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 to-teal-400/40 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl"
          >
            <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </motion.div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-white mb-2">+{points} Points Earned!</h3>
            <p className="text-sm text-white/90">Great job completing this article!</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Active claim button
  return (
    <button
      onClick={onClick}
      disabled={claimingPoints}
      className="relative overflow-hidden rounded-3xl border-4 border-emerald-500 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 group w-full disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {/* Halftone pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
        backgroundSize: '16px 16px'
      }} />

      {/* Comic shadow */}
      <div className="absolute inset-0" style={{
        boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.2)'
      }} />

      {/* Animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 to-teal-400/40 blur-2xl group-hover:blur-3xl transition-all" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        {claimingPoints ? (
          <>
            <Loader className="w-16 h-16 text-white animate-spin" strokeWidth={3} />
            <div className="text-center">
              <h3 className="text-3xl font-black text-white mb-2">Processing...</h3>
              <p className="text-sm text-white/90">Verifying your reading progress</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="absolute -inset-2 bg-white/40 rounded-full blur-lg animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl">
                <Zap className="w-10 h-10 fill-emerald-600 text-emerald-600" strokeWidth={0} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-white mb-2 group-hover:scale-110 transition-transform">Claim +{points} Points</h3>
              <p className="text-sm text-white/90">Click here to mark as read & earn rewards!</p>
            </div>
          </>
        )}
      </div>
    </button>
  )
}