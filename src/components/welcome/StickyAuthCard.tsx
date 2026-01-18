import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface StickyAuthCardProps {
  children: ReactNode
}

export function StickyAuthCard({ children }: StickyAuthCardProps) {
  return (
    <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] flex items-center">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.8,
          delay: 0.3,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative w-full max-w-[440px] mx-auto"
      >
        {/* Glow effect behind card - stronger */}
        <div 
          className="absolute -inset-6 rounded-[2.5rem] opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.5), rgba(20, 184, 166, 0.4))',
          }}
        />
        
        {/* Main card with stronger depth */}
        <div 
          className="relative rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(11, 47, 39, 0.7)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Grain texture */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Inner glow - stronger */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, transparent 50%)',
            }}
          />
          
          {/* Top highlight - more visible */}
          <div 
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(110, 231, 183, 0.5), transparent)',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Bottom shine */}
          <div 
            className="absolute bottom-0 left-8 right-8 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(110, 231, 183, 0.3), transparent)',
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
