import { motion } from 'motion/react'
import { Leaf, Zap, Package } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  variant?: 'app' | 'market' | 'swap'
}

export function LoadingScreen({ message = 'Loading...', variant = 'app' }: LoadingScreenProps) {
  // Color scheme based on variant
  const colors = variant === 'swap' 
    ? {
        bgGradient: 'from-amber-900 via-yellow-900 to-orange-950',
        textureColor: '%23f59e0b',
        orbColor1: 'bg-yellow-400/20',
        orbColor2: 'bg-amber-400/20',
        orbColor3: 'bg-orange-400/10',
        cardGradient: 'from-yellow-400 via-amber-500 to-orange-500',
        borderColor: 'border-amber-950',
        textColor: 'text-amber-950',
        iconColor: 'text-yellow-400',
        glowColor: 'from-yellow-300/50',
        spinnerBorder: 'border-yellow-400/30 border-t-yellow-400 border-r-amber-400',
        coreGradient: 'from-yellow-300 to-amber-400',
        counterSpinnerBorder: 'border-amber-400/30 border-b-amber-400 border-l-orange-400',
        spinnerGlow: 'bg-yellow-400/20',
        messageTagBg: 'bg-white/10',
        messageTagBorder: 'border-white/20',
        messageTagIconColor: 'text-yellow-300',
        messageTagTextColor: 'text-yellow-200',
        particleColor: 'bg-yellow-400/30'
      }
    : variant === 'market'
    ? {
        bgGradient: 'from-emerald-900 via-teal-900 to-green-950',
        textureColor: '%23059669',
        orbColor1: 'bg-emerald-400/20',
        orbColor2: 'bg-teal-400/20',
        orbColor3: 'bg-green-400/10',
        cardGradient: 'from-emerald-400 via-teal-400 to-green-500',
        borderColor: 'border-emerald-950',
        textColor: 'text-emerald-950',
        iconColor: 'text-emerald-400',
        glowColor: 'from-emerald-300/50',
        spinnerBorder: 'border-emerald-400/30 border-t-emerald-400 border-r-teal-400',
        coreGradient: 'from-emerald-300 to-teal-400',
        counterSpinnerBorder: 'border-teal-400/30 border-b-teal-400 border-l-green-400',
        spinnerGlow: 'bg-emerald-400/20',
        messageTagBg: 'bg-white/10',
        messageTagBorder: 'border-white/20',
        messageTagIconColor: 'text-emerald-300',
        messageTagTextColor: 'text-emerald-200',
        particleColor: 'bg-emerald-400/30'
      }
    : {
        bgGradient: 'from-emerald-900 via-teal-900 to-green-950',
        textureColor: '%23059669',
        orbColor1: 'bg-emerald-400/20',
        orbColor2: 'bg-teal-400/20',
        orbColor3: 'bg-green-400/10',
        cardGradient: 'from-emerald-400 via-teal-400 to-green-500',
        borderColor: 'border-emerald-950',
        textColor: 'text-emerald-950',
        iconColor: 'text-emerald-400',
        glowColor: 'from-emerald-300/50',
        spinnerBorder: 'border-emerald-400/30 border-t-emerald-400 border-r-teal-400',
        coreGradient: 'from-emerald-300 to-teal-400',
        counterSpinnerBorder: 'border-teal-400/30 border-b-teal-400 border-l-green-400',
        spinnerGlow: 'bg-emerald-400/20',
        messageTagBg: 'bg-white/10',
        messageTagBorder: 'border-white/20',
        messageTagIconColor: 'text-emerald-300',
        messageTagTextColor: 'text-emerald-200',
        particleColor: 'bg-emerald-400/30'
      };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.bgGradient} relative overflow-hidden`}>
      
      {/* Hemp fiber texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colors.textureColor}' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }} />

      {/* Animated background orbs */}
      <div className={`absolute top-20 left-20 w-64 h-64 ${colors.orbColor1} rounded-full blur-3xl animate-pulse`} />
      <div className={`absolute bottom-20 right-20 w-80 h-80 ${colors.orbColor2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${colors.orbColor3} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }} />

      {/* Main loading content */}
      <div className="relative z-10 text-center space-y-8 px-6">
        
        {/* Logo Container with Comic Style */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative inline-block"
        >
          {/* Comic drop shadow */}
          <div 
            className={`absolute inset-0 ${colors.borderColor} rounded-3xl`}
            style={{
              transform: 'translate(8px, 8px)',
              zIndex: -1
            }}
          />

          {/* Main logo card */}
          <div className={`relative bg-gradient-to-br ${colors.cardGradient} p-8 rounded-3xl border-4 ${colors.borderColor} shadow-2xl`}>
            
            {/* Halftone pattern */}
            <div className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: '12px 12px'
            }} />

            {/* Neon glow */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.glowColor} to-transparent blur-xl`} />

            {/* DEWII Text */}
            <div className="relative">
              <motion.h1 
                className={`text-6xl font-black ${colors.textColor} tracking-tighter`}
                animate={{ 
                  textShadow: variant === 'swap' 
                    ? [
                        '0 0 20px rgba(251, 191, 36, 0.5)',
                        '0 0 40px rgba(251, 191, 36, 0.8)',
                        '0 0 20px rgba(251, 191, 36, 0.5)'
                      ]
                    : [
                        '0 0 20px rgba(16, 185, 129, 0.5)',
                        '0 0 40px rgba(16, 185, 129, 0.8)',
                        '0 0 20px rgba(16, 185, 129, 0.5)'
                      ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                DEWII
              </motion.h1>
              
              {/* Icon decoration */}
              <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full ${colors.borderColor} flex items-center justify-center border-3 border-white shadow-lg`}>
                {variant === 'swap' ? (
                  <Package className={`w-6 h-6 ${colors.iconColor}`} strokeWidth={3} />
                ) : (
                  <Leaf className={`w-6 h-6 ${colors.iconColor}`} strokeWidth={3} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading animation */}
        <div className="flex justify-center items-center gap-3">
          {/* Spinning energy circles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className={`w-16 h-16 rounded-full border-4 ${colors.spinnerBorder}`} />
            <div className={`absolute inset-0 rounded-full ${colors.spinnerGlow} blur-md`} />
          </motion.div>

          {/* Center energy core */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`w-4 h-4 rounded-full bg-gradient-to-br ${colors.coreGradient} shadow-lg`}
          />

          {/* Counter-rotating outer ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className={`w-16 h-16 rounded-full border-4 ${colors.counterSpinnerBorder}`} />
            <div className={`absolute inset-0 rounded-full ${colors.spinnerGlow} blur-md`} />
          </motion.div>
        </div>

        {/* Loading text with comic style */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative inline-block"
        >
          {/* Text shadow */}
          <div 
            className={`absolute inset-0 ${colors.borderColor}/50 font-black text-xl`}
            style={{ transform: 'translate(3px, 3px)' }}
          >
            {message}
          </div>
          
          {/* Main text */}
          <div className="relative">
            <p className="text-white font-black text-xl tracking-wide drop-shadow-lg">
              {message}
            </p>
            
            {/* Animated dots */}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block ml-1"
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="inline-block"
            >
              •
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="inline-block"
            >
              •
            </motion.span>
          </div>
        </motion.div>

        {/* Variant-specific messaging */}
        {variant === 'swap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${colors.messageTagBg} backdrop-blur-md rounded-full border ${colors.messageTagBorder}`}
          >
            <Package className={`w-5 h-5 ${colors.messageTagIconColor}`} />
            <p className={`${colors.messageTagTextColor} font-semibold text-sm`}>Barter Economy Loading</p>
          </motion.div>
        )}

        {variant === 'market' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${colors.messageTagBg} backdrop-blur-md rounded-full border ${colors.messageTagBorder}`}
          >
            <Zap className={`w-5 h-5 ${colors.messageTagIconColor}`} />
            <p className={`${colors.messageTagTextColor} font-semibold text-sm`}>Powering up the Community Market</p>
          </motion.div>
        )}

        {variant === 'app' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${colors.messageTagBg} backdrop-blur-md rounded-full border ${colors.messageTagBorder}`}
          >
            <Leaf className={`w-5 h-5 ${colors.messageTagIconColor}`} />
            <p className={`${colors.messageTagTextColor} font-semibold text-sm`}>Sustainable Knowledge Awaits</p>
          </motion.div>
        )}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${colors.particleColor}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  )
}