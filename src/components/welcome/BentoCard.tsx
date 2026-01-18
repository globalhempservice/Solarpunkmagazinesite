import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface BentoCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
}

export function BentoCard({ icon, title, description, index }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay: 0.2 + index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group relative min-h-[180px] rounded-2xl p-6 cursor-pointer overflow-hidden"
      style={{
        background: 'rgba(20, 184, 166, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(110, 231, 183, 0.15)',
      }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />
      
      {/* Subtle gradient on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
        }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2))',
            border: '1px solid rgba(110, 231, 183, 0.3)',
          }}
        >
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-300 transition-colors">
            {title}
          </h3>
          <p className="text-emerald-200/70 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Bottom shine effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px opacity-50 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(110, 231, 183, 0.5), transparent)',
        }}
      />
    </motion.div>
  )
}
