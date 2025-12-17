import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import { LucideIcon } from 'lucide-react'
import {
  SPRING_CONFIGS,
  ANIMATION_DURATIONS,
  BUTTON_SIZES,
  BUTTON_STATES,
  BUTTON_THEMES,
  SPECIAL_EFFECTS,
  ACCESSIBILITY,
  ICON_STYLES,
  createGlowShadow,
  createGradient,
  calculateMagneticOffset,
} from '../../utils/buttonDesignTokens'

// ================================================
// TYPES
// ================================================

type ButtonSize = keyof typeof BUTTON_SIZES
type ButtonTheme = keyof typeof BUTTON_THEMES | { gradient: { from: string; via: string; to: string }; glow: string; border: string; text: string; shadow: string }
type ButtonState = 'idle' | 'hover' | 'active' | 'pressed' | 'disabled' | 'loading'

interface HempButtonProps {
  // Core
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
  
  // Appearance
  icon?: LucideIcon
  label?: string
  showLabel?: boolean
  size?: ButtonSize
  theme?: ButtonTheme
  
  // States
  isActive?: boolean
  
  // Effects
  enableMagnetic?: boolean
  enableShimmer?: boolean
  enableBreathing?: boolean
  enableRipple?: boolean
  enableParticles?: boolean
  
  // Customization
  className?: string
  'aria-label'?: string
  title?: string
  
  // Badge
  badge?: {
    count?: number
    color?: string
    glow?: boolean
  }
  
  // Notification dot
  showNotification?: boolean
}

// ================================================
// COMPONENT
// ================================================

export function HempButton({
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  label,
  showLabel = false,
  size = 'md',
  theme = 'glass',
  isActive = false,
  enableMagnetic = false,
  enableShimmer = false,
  enableBreathing = false,
  enableRipple = true,
  enableParticles = false,
  className = '',
  'aria-label': ariaLabel,
  title,
  badge,
  showNotification = false,
}: HempButtonProps) {
  // ================================================
  // STATE
  // ================================================
  
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  // ================================================
  // MAGNETIC EFFECT
  // ================================================
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: SPECIAL_EFFECTS.magnetic.damping, stiffness: 150 }
  const x = useSpring(useTransform(mouseX, (v) => v), springConfig)
  const y = useSpring(useTransform(mouseY, (v) => v), springConfig)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableMagnetic || disabled || !buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const offset = calculateMagneticOffset(rect, e.clientX, e.clientY)
    
    mouseX.set(offset.x)
    mouseY.set(offset.y)
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }
  
  // ================================================
  // RIPPLE EFFECT
  // ================================================
  
  const createRipple = (e: React.MouseEvent) => {
    if (!enableRipple || disabled || !buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const rippleId = Date.now()
    setRipples((prev) => [...prev, { id: rippleId, x, y }])
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId))
    }, SPECIAL_EFFECTS.ripple.duration * 1000)
  }
  
  // ================================================
  // THEME RESOLUTION
  // ================================================
  
  const resolvedTheme = typeof theme === 'string' ? BUTTON_THEMES[theme] : theme
  
  // ================================================
  // STATE RESOLUTION
  // ================================================
  
  const currentState: ButtonState = disabled 
    ? 'disabled' 
    : loading 
    ? 'loading' 
    : isPressed 
    ? 'pressed' 
    : isActive 
    ? 'active' 
    : isHovered 
    ? 'hover' 
    : 'idle'
  
  const stateConfig = BUTTON_STATES[currentState]
  const sizeConfig = BUTTON_SIZES[size]
  
  // ================================================
  // CLICK HANDLER
  // ================================================
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return
    
    createRipple(e)
    onClick?.(e)
  }
  
  // ================================================
  // BREATHING ANIMATION
  // ================================================
  
  const breathingAnimation = enableBreathing && !isHovered && !isActive ? {
    scale: SPECIAL_EFFECTS.breathing.scale,
    transition: {
      duration: SPECIAL_EFFECTS.breathing.duration,
      repeat: SPECIAL_EFFECTS.breathing.repeat,
      ease: SPECIAL_EFFECTS.breathing.ease,
    },
  } : {}
  
  // ================================================
  // RENDER
  // ================================================
  
  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
      aria-label={ariaLabel || label}
      title={title}
      className={`
        group relative rounded-full flex items-center justify-center
        transition-all focus:outline-none
        ${sizeConfig.width} ${sizeConfig.padding}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        x: enableMagnetic ? x : 0,
        y: enableMagnetic ? y : 0,
      }}
      animate={{
        scale: stateConfig.scale,
        opacity: stateConfig.opacity,
        y: stateConfig.y || 0,
        ...breathingAnimation,
      }}
      whileTap={!disabled && !loading ? { scale: BUTTON_STATES.pressed.scale } : undefined}
      transition={SPRING_CONFIGS.bouncy}
    >
      {/* ================================================ */}
      {/* OUTER GLOW */}
      {/* ================================================ */}
      <div
        className="absolute -inset-2 rounded-full blur-xl transition-opacity duration-300 pointer-events-none"
        style={{
          background: createGradient(resolvedTheme.gradient),
          opacity: stateConfig.glowIntensity,
        }}
      />
      
      {/* ================================================ */}
      {/* GRADIENT BORDER RING */}
      {/* ================================================ */}
      <div
        className="absolute inset-0 rounded-full p-[2px] transition-opacity duration-300"
        style={{
          background: createGradient(resolvedTheme.gradient),
          opacity: isActive ? 0.8 : isHovered ? 0.6 : 0.3,
        }}
      >
        {/* iOS-style Inner glass background with multiple layers */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Glass highlight (top edge) */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 100%)',
            }}
          />
          
          {/* Glass reflection (diagonal shimmer) */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.08) 100%)',
            }}
          />
          
          {/* Subtle inner shadow for depth */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.05)',
            }}
          />
        </div>
      </div>
      
      {/* ================================================ */}
      {/* MAIN GRADIENT FILL (for active state) */}
      {/* ================================================ */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{
            background: createGradient(resolvedTheme.gradient),
            opacity: 0.9,
          }}
        />
      )}
      
      {/* ================================================ */}
      {/* SHIMMER SWEEP EFFECT */}
      {/* ================================================ */}
      {enableShimmer && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: SPECIAL_EFFECTS.shimmer.duration,
            repeat: Infinity,
            repeatDelay: SPECIAL_EFFECTS.shimmer.delay,
            ease: 'linear',
          }}
          style={{
            background: SPECIAL_EFFECTS.shimmer.gradient,
          }}
        />
      )}
      
      {/* ================================================ */}
      {/* NOISE TEXTURE OVERLAY */}
      {/* ================================================ */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("${SPECIAL_EFFECTS.noiseTexture.url}")`,
          opacity: SPECIAL_EFFECTS.noiseTexture.opacity,
        }}
      />
      
      {/* ================================================ */}
      {/* SHINE HIGHLIGHT (top-right) */}
      {/* ================================================ */}
      <div
        className="absolute top-1 right-1 w-1/3 h-1/3 rounded-full blur-md pointer-events-none transition-opacity duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          opacity: isHovered ? 0.5 : 0.3,
        }}
      />
      
      {/* ================================================ */}
      {/* RIPPLE EFFECTS */}
      {/* ================================================ */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full border-2 border-white pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            borderColor: resolvedTheme.text,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ 
            scale: SPECIAL_EFFECTS.ripple.scale,
            opacity: SPECIAL_EFFECTS.ripple.opacity,
          }}
          transition={{ duration: SPECIAL_EFFECTS.ripple.duration }}
        />
      ))}
      
      {/* ================================================ */}
      {/* ICON */}
      {/* ================================================ */}
      {Icon && (
        <div className="relative z-10">
          <Icon
            className={`${sizeConfig.iconSize} transition-all duration-200`}
            style={{
              color: isActive ? '#ffffff' : resolvedTheme.text,
              filter: ICON_STYLES.shadow,
              strokeWidth: isActive 
                ? ICON_STYLES.strokeWeight.active 
                : isHovered 
                ? ICON_STYLES.strokeWeight.hover 
                : ICON_STYLES.strokeWeight.idle,
            }}
          />
        </div>
      )}
      
      {/* ================================================ */}
      {/* LOADING SPINNER */}
      {/* ================================================ */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
      
      {/* ================================================ */}
      {/* LABEL (if showLabel) */}
      {/* ================================================ */}
      {showLabel && label && (
        <span
          className="ml-2 text-sm font-medium relative z-10"
          style={{ color: resolvedTheme.text }}
        >
          {label}
        </span>
      )}
      
      {/* ================================================ */}
      {/* BADGE (top-right corner) */}
      {/* ================================================ */}
      {badge && badge.count !== undefined && badge.count > 0 && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative">
            {/* Badge glow */}
            {badge.glow && (
              <div
                className="absolute inset-0 rounded-full blur-md animate-pulse"
                style={{ background: badge.color || '#ef4444' }}
              />
            )}
            {/* Badge pill */}
            <div
              className="relative min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: badge.color || '#ef4444' }}
            >
              <span className="text-xs font-bold text-white leading-none">
                {badge.count > 99 ? '99+' : badge.count}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* ================================================ */}
      {/* NOTIFICATION DOT (top-right) */}
      {/* ================================================ */}
      {showNotification && (
        <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 z-20">
          <motion.div 
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {/* Outer glow - pulsing */}
            <motion.div 
              className="absolute inset-0 w-5 h-5 -translate-x-1 -translate-y-1 rounded-full blur-lg"
              style={{
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%)',
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Mid glow - breathing */}
            <motion.div 
              className="absolute inset-0 w-4 h-4 -translate-x-0.5 -translate-y-0.5 rounded-full blur-md"
              style={{
                background: 'radial-gradient(circle, rgba(248, 113, 113, 0.9) 0%, rgba(239, 68, 68, 0) 60%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Orb core */}
            <div className="relative w-3 h-3 rounded-full overflow-hidden">
              {/* Gradient fill */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)',
                }}
              />
              
              {/* Shine highlight */}
              <div 
                className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 70%)',
                  transform: 'translate(20%, 20%)',
                }}
              />
              
              {/* Border ring */}
              <div className="absolute inset-0 rounded-full border border-red-200/50" />
              
              {/* Ping effect */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{
                  scale: [1, 2],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
      
      {/* ================================================ */}
      {/* FOCUS RING (Accessibility) */}
      {/* ================================================ */}
      <div
        className="absolute -inset-1 rounded-full opacity-0 group-focus-visible:opacity-100 transition-opacity pointer-events-none"
        style={{
          border: `${ACCESSIBILITY.focusRing.width} solid ${resolvedTheme.glow}`,
          filter: `blur(1px)`,
        }}
      />
    </motion.button>
  )
}