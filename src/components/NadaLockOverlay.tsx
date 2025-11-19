import { motion } from 'motion/react'
import { Lock, Sparkles } from 'lucide-react'

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

interface NadaLockOverlayProps {
  nadaRequired: number
  nadaCurrent: number
}

export function NadaLockOverlay({ nadaRequired, nadaCurrent }: NadaLockOverlayProps) {
  const nadaNeeded = Math.max(0, nadaRequired - nadaCurrent)
  const hasEnough = nadaCurrent >= nadaRequired

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-3xl overflow-hidden">
      {/* Animated Ripple Background - NADA Pranas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              border: '2px solid rgba(16, 185, 129, 0.3)', // emerald color
            }}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Floating NADA particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + (i * 0.3),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Lock Content */}
      <div className="relative text-center px-6">
        {/* NADA Ripple Icon with Pulse - Instead of Lock */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50"
        >
          <NadaRippleIcon className="w-14 h-14 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 drop-shadow-lg">
          {hasEnough ? 'Ready to Unlock!' : 'Locked'}
        </h3>

        {/* NADA Requirement */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 border border-white/20">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
              <NadaRippleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className={`text-2xl font-black ${hasEnough ? 'text-emerald-400' : 'text-white'}`}>
                {nadaRequired} NADA
              </div>
              <div className="text-xs text-white/70">Required to unlock</div>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="flex items-center justify-center gap-2 text-white/90 mb-2">
          <span className="text-sm font-semibold">Your Balance:</span>
          <span className={`text-lg font-black ${hasEnough ? 'text-emerald-400' : 'text-white'}`}>
            {nadaCurrent} NADA
          </span>
        </div>

        {/* Need More Message */}
        {!hasEnough && nadaNeeded > 0 && (
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-white/80 text-sm font-bold"
          >
            Need {nadaNeeded} more NADA
          </motion.div>
        )}

        {/* Ready to unlock */}
        {hasEnough && (
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-emerald-400 text-sm font-black mt-2"
          >
            ✨ Click to unlock! ✨
          </motion.div>
        )}
      </div>
    </div>
  )
}