import { motion } from 'motion/react'
import { Sparkles, Star, Heart, Zap } from 'lucide-react'

interface BudCharacterProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  expression?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'winking'
  mood?: 'default' | 'success' | 'info' | 'warning'
  animate?: boolean
  className?: string
  onHover?: () => void
  onClick?: () => void
}

const sizeMap = {
  sm: { container: 'w-12 h-12', face: 'w-10 h-10', leaf: 'w-5 h-7', petal: 'w-3 h-6', eye: 'w-1.5 h-2', sparkle: 'w-3 h-3' },
  md: { container: 'w-16 h-16', face: 'w-14 h-14', leaf: 'w-6 h-9', petal: 'w-4 h-7', eye: 'w-2 h-2.5', sparkle: 'w-4 h-4' },
  lg: { container: 'w-20 h-20', face: 'w-16 h-16', leaf: 'w-7 h-10', petal: 'w-5 h-8', eye: 'w-2 h-2.5', sparkle: 'w-5 h-5' },
  xl: { container: 'w-24 h-24', face: 'w-20 h-20', leaf: 'w-8 h-12', petal: 'w-6 h-10', eye: 'w-2.5 h-3', sparkle: 'w-6 h-6' }
}

const moodColors = {
  default: {
    glow: 'from-green-400 via-emerald-400 to-green-400',
    face: 'from-pink-300 via-rose-300 to-pink-400',
    petals: 'from-pink-400 via-rose-400 to-pink-500'
  },
  success: {
    glow: 'from-green-400 via-emerald-400 to-green-500',
    face: 'from-emerald-300 via-green-300 to-emerald-400',
    petals: 'from-green-400 via-emerald-400 to-green-500'
  },
  info: {
    glow: 'from-blue-400 via-cyan-400 to-blue-400',
    face: 'from-blue-300 via-cyan-300 to-blue-400',
    petals: 'from-blue-400 via-cyan-400 to-blue-500'
  },
  warning: {
    glow: 'from-yellow-400 via-orange-400 to-yellow-400',
    face: 'from-yellow-300 via-orange-300 to-yellow-400',
    petals: 'from-yellow-400 via-orange-400 to-yellow-500'
  }
}

export function BudCharacter({ 
  size = 'lg', 
  expression = 'happy', 
  mood = 'default',
  animate = true,
  className = '',
  onHover,
  onClick
}: BudCharacterProps) {
  const sizes = sizeMap[size]
  const colors = moodColors[mood]

  const renderEyes = () => {
    if (expression === 'winking') {
      return (
        <div className="flex gap-3 mb-1 items-center">
          {/* Winking eye */}
          <div className="relative">
            <div className={`${sizes.eye} bg-gray-800 dark:bg-gray-900 rounded-full`}>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
            </div>
          </div>
          {/* Closed eye (wink) */}
          <div className="w-3 h-1 bg-gray-800 dark:bg-gray-900 rounded-full" />
        </div>
      )
    }

    if (expression === 'thinking') {
      return (
        <div className="flex gap-3 mb-1 items-center">
          <div className="relative">
            <div className={`${sizes.eye} bg-gray-800 dark:bg-gray-900 rounded-full translate-x-1`}>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
            </div>
          </div>
          <div className="relative">
            <div className={`${sizes.eye} bg-gray-800 dark:bg-gray-900 rounded-full translate-x-1`}>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
            </div>
          </div>
        </div>
      )
    }

    // Default happy/excited eyes with blink
    return (
      <div className="flex gap-3 mb-1 items-center">
        <div className="relative">
          <motion.div 
            animate={animate ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
            className={`${sizes.eye} bg-gray-800 dark:bg-gray-900 rounded-full`}
          >
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
          </motion.div>
        </div>
        <div className="relative">
          <motion.div 
            animate={animate ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
            className={`${sizes.eye} bg-gray-800 dark:bg-gray-900 rounded-full`}
          >
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
          </motion.div>
        </div>
      </div>
    )
  }

  const renderMouth = () => {
    if (expression === 'celebrating') {
      return (
        <svg width="20" height="14" viewBox="0 0 20 14" className="relative">
          <path
            d="M 2 2 Q 10 12, 18 2"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            className="text-gray-800 dark:text-gray-900"
          />
          {/* Open mouth */}
          <ellipse cx="10" cy="8" rx="6" ry="4" fill="currentColor" className="text-gray-800/20 dark:text-gray-900/20" />
        </svg>
      )
    }

    if (expression === 'thinking') {
      return (
        <svg width="12" height="8" viewBox="0 0 12 8" className="relative">
          <line
            x1="2" y1="4" x2="10" y2="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-gray-800 dark:text-gray-900"
          />
        </svg>
      )
    }

    // Default happy smile
    const mouthSize = expression === 'excited' ? 'width="18" height="12"' : 'width="16" height="10"'
    const mouthPath = expression === 'excited' 
      ? 'M 2 2 Q 9 10, 16 2'
      : 'M 2 2 Q 8 8, 14 2'
    
    return (
      <svg width={expression === 'excited' ? '18' : '16'} height={expression === 'excited' ? '12' : '10'} viewBox={expression === 'excited' ? '0 0 18 12' : '0 0 16 10'} className="relative">
        <path
          d={mouthPath}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="text-gray-800 dark:text-gray-900"
        />
      </svg>
    )
  }

  const renderAccessory = () => {
    if (expression === 'celebrating') {
      return (
        <>
          <motion.div
            animate={animate ? { 
              rotate: [0, 360],
              scale: [1, 1.4, 1],
              y: [-2, -8, -2]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 -right-3 z-20"
          >
            <Star className={`${sizes.sparkle} text-yellow-400 fill-yellow-400 drop-shadow-lg`} />
          </motion.div>
          <motion.div
            animate={animate ? { 
              rotate: [360, 0],
              scale: [1, 1.3, 1],
              y: [-2, -6, -2]
            } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -top-3 -left-3 z-20"
          >
            <Sparkles className={`${sizes.sparkle} text-pink-400 fill-pink-400 drop-shadow-lg`} />
          </motion.div>
        </>
      )
    }

    if (expression === 'thinking') {
      return (
        <motion.div
          animate={animate ? { 
            y: [-8, -12, -8],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-2 z-20"
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      )
    }

    // Default sparkle
    return (
      <>
        <motion.div
          animate={animate ? { 
            rotate: [0, 360],
            scale: [1, 1.3, 1]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2 z-20"
        >
          <Sparkles className={`${sizes.sparkle} text-yellow-400 fill-yellow-400 drop-shadow-lg`} />
        </motion.div>
        <motion.div
          animate={animate ? { 
            rotate: [360, 0],
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }}
          className="absolute -bottom-1 -left-2 z-20"
        >
          <Star className={`${sizes.sparkle} text-green-400 fill-green-400 drop-shadow-lg`} />
        </motion.div>
      </>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`relative ${sizes.container} flex items-center justify-center`}
        animate={animate ? { 
          y: [0, -8, 0],
          rotate: [0, 2, 0, -2, 0]
        } : {}}
        transition={{
          y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }}
        whileHover={{ 
          scale: 1.15,
          rotate: [0, -5, 5, -5, 0],
          transition: { 
            scale: { duration: 0.3 },
            rotate: { duration: 0.5, repeat: 2 }
          }
        }}
        whileTap={{ 
          scale: 0.95,
          rotate: 0,
          transition: { duration: 0.1 }
        }}
        onHoverStart={onHover}
        onTap={onClick}
        style={{ cursor: onHover || onClick ? 'pointer' : 'default' }}
      >
        {/* Glow behind BUD */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-full blur-xl opacity-40`} />
        
        {/* BUD character - Plant bud with leaves */}
        <div className={`relative ${sizes.container} flex items-center justify-center`}>
          
          {/* Leaves */}
          <motion.div
            animate={animate ? { rotate: [-2, 2, -2] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-1 top-3"
          >
            <div className={`${sizes.leaf} bg-gradient-to-br from-green-400 to-emerald-500 rounded-full -rotate-45 shadow-lg border-2 border-green-300/50`} />
          </motion.div>
          
          <motion.div
            animate={animate ? { rotate: [2, -2, 2] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -right-1 top-3"
          >
            <div className={`${sizes.leaf} bg-gradient-to-bl from-green-400 to-emerald-500 rounded-full rotate-45 shadow-lg border-2 border-green-300/50`} />
          </motion.div>
          
          {/* Main bud body */}
          <div className="relative z-10">
            {/* Outer petals/bud leaves */}
            <div className="absolute inset-0">
              {[0, 72, 144, 216, 288].map((rotation, i) => (
                <motion.div
                  key={i}
                  animate={animate ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${size === 'sm' ? '14' : size === 'md' ? '16' : size === 'lg' ? '18' : '22'}px)`,
                    transformOrigin: 'center'
                  }}
                >
                  <div className={`${sizes.petal} bg-gradient-to-b ${colors.petals} rounded-full shadow-md border border-pink-300/40`} />
                </motion.div>
              ))}
            </div>
            
            {/* Main face sphere */}
            <div className={`relative ${sizes.face} bg-gradient-to-br ${colors.face} rounded-full shadow-xl flex items-center justify-center border-3 border-white/60`}>
              {/* Cute face */}
              <div className="relative">
                {/* Eyes */}
                {renderEyes()}
                
                {/* Smile with rosy cheeks */}
                <div className="flex items-center gap-2 justify-center">
                  {/* Left cheek */}
                  <div className={`${size === 'sm' ? 'w-1.5 h-1' : 'w-2 h-1.5'} bg-pink-400/60 dark:bg-pink-500/60 rounded-full`} />
                  
                  {/* Mouth */}
                  {renderMouth()}
                  
                  {/* Right cheek */}
                  <div className={`${size === 'sm' ? 'w-1.5 h-1' : 'w-2 h-1.5'} bg-pink-400/60 dark:bg-pink-500/60 rounded-full`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sparkles and accessories */}
          {renderAccessory()}
        </div>
      </motion.div>
    </div>
  )
}