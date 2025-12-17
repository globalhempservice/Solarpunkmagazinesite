/**
 * ADVANCED BUTTON MICRO-INTERACTIONS
 * Particle bursts, magnetic effects, ripples, and more
 */

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SPECIAL_EFFECTS } from '../../utils/buttonDesignTokens'

// ================================================
// PARTICLE BURST EFFECT
// ================================================

interface Particle {
  id: number
  angle: number
  color: string
}

interface ParticleBurstProps {
  trigger: boolean
  color?: string
  count?: number
  onComplete?: () => void
}

export function ParticleBurst({ 
  trigger, 
  color = '#10b981', 
  count = SPECIAL_EFFECTS.particleBurst.count,
  onComplete,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  
  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / count) * i,
        color,
      }))
      
      setParticles(newParticles)
      
      setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, SPECIAL_EFFECTS.particleBurst.duration * 1000)
    }
  }, [trigger, count, color, onComplete])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
          style={{
            background: particle.color,
            boxShadow: `0 0 8px ${particle.color}`,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * SPECIAL_EFFECTS.particleBurst.spread,
            y: Math.sin((particle.angle * Math.PI) / 180) * SPECIAL_EFFECTS.particleBurst.spread,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: SPECIAL_EFFECTS.particleBurst.duration,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ================================================
// RIPPLE EFFECT
// ================================================

export interface RippleInstance {
  id: number
  x: number
  y: number
}

interface RippleEffectProps {
  ripples: RippleInstance[]
  color?: string
}

export function RippleEffect({ ripples, color = '#ffffff' }: RippleEffectProps) {
  return (
    <>
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            borderColor: color,
          }}
          initial={{ 
            scale: SPECIAL_EFFECTS.ripple.scale[0], 
            opacity: SPECIAL_EFFECTS.ripple.opacity[0],
          }}
          animate={{ 
            scale: SPECIAL_EFFECTS.ripple.scale[1],
            opacity: SPECIAL_EFFECTS.ripple.opacity[1],
          }}
          transition={{ duration: SPECIAL_EFFECTS.ripple.duration }}
        />
      ))}
    </>
  )
}

// ================================================
// SHIMMER SWEEP
// ================================================

interface ShimmerSweepProps {
  enabled?: boolean
  color?: string
}

export function ShimmerSweep({ 
  enabled = true,
  color = 'rgba(255, 255, 255, 0.2)',
}: ShimmerSweepProps) {
  if (!enabled) return null
  
  return (
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
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
      }}
    />
  )
}

// ================================================
// AURORA GRADIENT (Flowing background)
// ================================================

interface AuroraGradientProps {
  colors: string[]
  enabled?: boolean
}

export function AuroraGradient({ colors, enabled = true }: AuroraGradientProps) {
  if (!enabled) return null
  
  const gradientString = colors.join(', ')
  
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      animate={{
        backgroundPosition: SPECIAL_EFFECTS.aurora.positions,
      }}
      transition={{
        duration: SPECIAL_EFFECTS.aurora.duration,
        repeat: Infinity,
        ease: SPECIAL_EFFECTS.aurora.ease,
      }}
      style={{
        background: `linear-gradient(45deg, ${gradientString})`,
        backgroundSize: '200% 200%',
        opacity: 0.3,
      }}
    />
  )
}

// ================================================
// NOISE TEXTURE OVERLAY
// ================================================

interface NoiseTextureProps {
  opacity?: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
}

export function NoiseTexture({ 
  opacity = SPECIAL_EFFECTS.noiseTexture.opacity,
  blendMode = SPECIAL_EFFECTS.noiseTexture.blend,
}: NoiseTextureProps) {
  return (
    <div
      className={`absolute inset-0 rounded-full pointer-events-none mix-blend-${blendMode}`}
      style={{
        backgroundImage: `url("${SPECIAL_EFFECTS.noiseTexture.url}")`,
        opacity,
      }}
    />
  )
}

// ================================================
// GLOW PULSE (Breathing effect for idle state)
// ================================================

interface GlowPulseProps {
  color: string
  enabled?: boolean
}

export function GlowPulse({ color, enabled = true }: GlowPulseProps) {
  if (!enabled) return null
  
  return (
    <motion.div
      className="absolute -inset-4 rounded-full blur-2xl pointer-events-none"
      style={{ background: color }}
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ================================================
// SHINE HIGHLIGHT (Top-right reflection)
// ================================================

interface ShineHighlightProps {
  intensity?: number
  size?: 'sm' | 'md' | 'lg'
}

const SHINE_SIZES = {
  sm: 'w-1/4 h-1/4',
  md: 'w-1/3 h-1/3',
  lg: 'w-1/2 h-1/2',
}

export function ShineHighlight({ intensity = 0.3, size = 'md' }: ShineHighlightProps) {
  return (
    <div
      className={`absolute top-1 right-1 ${SHINE_SIZES[size]} rounded-full blur-md pointer-events-none transition-opacity duration-300`}
      style={{
        background: `rgba(255, 255, 255, ${intensity})`,
      }}
    />
  )
}

// ================================================
// LOADING SPINNER
// ================================================

interface LoadingSpinnerProps {
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

const SPINNER_SIZES = {
  sm: 'w-3 h-3 border-[1.5px]',
  md: 'w-4 h-4 border-2',
  lg: 'w-6 h-6 border-[3px]',
}

export function LoadingSpinner({ color = '#ffffff', size = 'md' }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`${SPINNER_SIZES[size]} border-t-transparent rounded-full`}
      style={{ borderColor: color }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ================================================
// MAGNETIC CURSOR FOLLOWER
// ================================================

interface MagneticCursorProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function MagneticCursor({ 
  children, 
  strength = SPECIAL_EFFECTS.magnetic.strength,
  className = '',
}: MagneticCursorProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = rect.width
    
    if (distance < maxDistance) {
      const factor = (maxDistance - distance) / maxDistance
      setOffset({
        x: (deltaX / distance) * strength * factor,
        y: (deltaY / distance) * strength * factor,
      })
    }
  }
  
  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }
  
  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// ================================================
// BADGE COMPONENT
// ================================================

interface BadgeProps {
  count: number
  color?: string
  glow?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const BADGE_POSITIONS = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
}

export function Badge({ 
  count, 
  color = '#ef4444', 
  glow = true,
  position = 'top-right',
}: BadgeProps) {
  if (count <= 0) return null
  
  return (
    <div className={`absolute ${BADGE_POSITIONS[position]} z-20`}>
      <div className="relative">
        {/* Glow effect */}
        {glow && (
          <div
            className="absolute inset-0 rounded-full blur-md animate-pulse"
            style={{ background: color }}
          />
        )}
        
        {/* Badge pill */}
        <motion.div
          className="relative min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white"
          style={{ background: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span className="text-xs font-bold text-white leading-none">
            {count > 99 ? '99+' : count}
          </span>
        </motion.div>
      </div>
    </div>
  )
}

// ================================================
// NOTIFICATION DOT
// ================================================

interface NotificationDotProps {
  color?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  pulse?: boolean
}

const DOT_POSITIONS = {
  'top-right': 'top-0 right-0 translate-x-1 -translate-y-1',
  'top-left': 'top-0 left-0 -translate-x-1 -translate-y-1',
  'bottom-right': 'bottom-0 right-0 translate-x-1 translate-y-1',
  'bottom-left': 'bottom-0 left-0 -translate-x-1 translate-y-1',
}

export function NotificationDot({ 
  color = '#E8FF00', 
  position = 'top-right',
  pulse = true,
}: NotificationDotProps) {
  return (
    <div className={`absolute ${DOT_POSITIONS[position]} z-20`}>
      <div className="relative">
        {/* Glow */}
        <div 
          className={`absolute inset-0 rounded-full blur-md ${pulse ? 'animate-pulse' : ''}`}
          style={{ background: color }}
        />
        
        {/* Dot */}
        <div 
          className="relative w-3 h-3 rounded-full border-2 border-white"
          style={{ background: color }}
        >
          {pulse && (
            <div 
              className="absolute inset-1 rounded-full animate-ping"
              style={{ background: 'white' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ================================================
// FOCUS RING (Accessibility)
// ================================================

interface FocusRingProps {
  color: string
  width?: string
  offset?: string
}

export function FocusRing({ 
  color, 
  width = '2px', 
  offset = '2px',
}: FocusRingProps) {
  return (
    <div
      className="absolute rounded-full opacity-0 group-focus-visible:opacity-100 transition-opacity pointer-events-none"
      style={{
        inset: `-${offset}`,
        border: `${width} solid ${color}`,
        filter: 'blur(1px)',
      }}
    />
  )
}
