import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface PremiumBentoCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
  size?: 'large' | 'medium' | 'small'
  metrics?: { label: string; value: string }[]
  chips?: string[]
}

export function PremiumBentoCard({ 
  icon, 
  title, 
  description, 
  index,
  size = 'medium',
  metrics,
  chips
}: PremiumBentoCardProps) {
  const sizeClasses = {
    large: 'lg:col-span-2 lg:row-span-2 min-h-[280px]',
    medium: 'lg:col-span-1 lg:row-span-1 min-h-[180px]',
    small: 'lg:col-span-1 lg:row-span-1 min-h-[140px]'
  }

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
      className={`group relative ${sizeClasses[size]} rounded-2xl p-6 cursor-pointer overflow-hidden`}
      style={{
        background: 'rgba(11, 47, 39, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(110, 231, 183, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        }}
      />
      
      {/* Subtle top highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(110, 231, 183, 0.6), transparent)',
        }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(20, 184, 166, 0.25))',
            border: '1px solid rgba(110, 231, 183, 0.3)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          }}
        >
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          <h3 className={`text-white font-bold ${size === 'large' ? 'text-2xl' : 'text-lg'} mb-2 group-hover:text-emerald-300 transition-colors`}>
            {title}
          </h3>
          <p className={`text-emerald-200/70 ${size === 'large' ? 'text-base' : 'text-sm'} leading-relaxed`}>
            {description}
          </p>

          {/* Metrics (for large cards) */}
          {metrics && size === 'large' && (
            <div className="flex gap-4 pt-2">
              {metrics.map((metric, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl font-bold text-emerald-400">{metric.value}</span>
                  <span className="text-xs text-emerald-200/60">{metric.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Chips (for medium cards) */}
          {chips && (
            <div className="flex flex-wrap gap-2 pt-2">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6EE7B7',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
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
