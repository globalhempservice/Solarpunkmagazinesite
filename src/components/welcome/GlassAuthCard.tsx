import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface GlassAuthCardProps {
  children: ReactNode
}

export function GlassAuthCard({ children }: GlassAuthCardProps) {
  return (
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
      {/* Glow effect behind card */}
      <div 
        className="absolute -inset-4 rounded-[2rem] opacity-30 blur-2xl"
        style={{
          background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.4), rgba(20, 184, 166, 0.3))',
        }}
      />
      
      {/* Main card */}
      <div 
        className="relative rounded-3xl p-8 shadow-2xl"
        style={{
          background: 'rgba(11, 47, 39, 0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(110, 231, 183, 0.2)',
        }}
      >
        {/* Inner glow */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
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
  )
}
