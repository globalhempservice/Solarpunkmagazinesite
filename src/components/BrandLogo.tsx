import { Leaf, Sun, Droplets, Trees, Sparkle } from 'lucide-react'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAnimation?: boolean
  className?: string
  onClick?: () => void
  theme?: 'default' | 'solar' | 'ocean' | 'forest' | 'sunset' | 'aurora'
}

export function BrandLogo({ size = 'md', showAnimation = true, className = '', onClick, theme = 'default' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  // Theme configurations
  const themeConfig = {
    default: {
      gradient: 'from-emerald-400 via-teal-500 to-emerald-600 dark:from-emerald-500 dark:via-teal-600 dark:to-emerald-700 hempin:from-amber-500 hempin:via-emerald-500 hempin:to-teal-600',
      innerGradient: 'from-emerald-500/90 via-teal-500/90 to-emerald-600/90 dark:from-emerald-600/90 dark:via-teal-700/90 dark:to-emerald-800/90 hempin:from-amber-600/90 hempin:via-emerald-600/90 hempin:to-teal-700/90',
      glow: 'from-emerald-400 via-teal-500 to-amber-500',
      icon: null // Hemp plant SVG (default)
    },
    solar: {
      gradient: 'from-amber-400 via-orange-500 to-amber-600',
      innerGradient: 'from-amber-500/90 via-orange-500/90 to-amber-600/90',
      glow: 'from-amber-400 via-orange-500 to-yellow-400',
      icon: Sun
    },
    ocean: {
      gradient: 'from-blue-400 via-cyan-500 to-blue-600',
      innerGradient: 'from-blue-500/90 via-cyan-500/90 to-blue-600/90',
      glow: 'from-blue-400 via-cyan-500 to-teal-400',
      icon: Droplets
    },
    forest: {
      gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
      innerGradient: 'from-emerald-500/90 via-teal-500/90 to-emerald-600/90',
      glow: 'from-emerald-400 via-teal-500 to-green-400',
      icon: Trees
    },
    sunset: {
      gradient: 'from-rose-400 via-pink-500 to-rose-600',
      innerGradient: 'from-rose-500/90 via-pink-500/90 to-rose-600/90',
      glow: 'from-rose-400 via-pink-500 to-purple-400',
      icon: () => (
        <svg className={`${iconSizes[size]} text-white drop-shadow-lg relative z-10`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )
    },
    aurora: {
      gradient: 'from-purple-400 via-indigo-500 to-purple-600',
      innerGradient: 'from-purple-500/90 via-indigo-500/90 to-purple-600/90',
      glow: 'from-purple-400 via-indigo-500 to-pink-400',
      icon: Sparkle
    }
  }

  const config = themeConfig[theme]
  const IconComponent = config.icon

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} 
      onClick={onClick}
    >
      {/* Animated glow effect */}
      {showAnimation && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${config.glow} rounded-full blur-xl opacity-40 animate-pulse`}
               style={{ animationDuration: '3s' }} />
          <div className={`absolute inset-0 bg-gradient-to-tr ${config.glow} rounded-full blur-lg opacity-30 animate-pulse`}
               style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </>
      )}
      
      {/* Main orb with gradient */}
      <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${config.gradient} p-[2px] shadow-lg`}>
        {/* Inner glow layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Content container */}
        <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${config.innerGradient} flex items-center justify-center overflow-hidden`}>
          {/* Animated background shimmer - DISABLED to prevent moving gradient */}
          {/* {showAnimation && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )} */}
          
          {/* Icon */}
          {IconComponent ? (
            typeof IconComponent === 'function' && IconComponent.prototype === undefined ? (
              <IconComponent />
            ) : (
              <IconComponent className={`${iconSizes[size]} text-white drop-shadow-lg relative z-10`} strokeWidth={2.5} />
            )
          ) : (
            // Default Hemp Branch SVG Icon
            <svg 
              className={`${iconSizes[size]} text-white drop-shadow-lg relative z-10`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Main stem */}
              <path d="M12 2 L12 22" strokeWidth="2.5" />
              
              {/* Hemp leaves - top pair */}
              <path d="M12 5 L8 4 L6 5 L5 7 L6 8 L8 8 L10 7" />
              <path d="M12 5 L16 4 L18 5 L19 7 L18 8 L16 8 L14 7" />
              
              {/* Hemp leaves - middle-top pair */}
              <path d="M12 9 L7 8 L5 9 L4 11 L5 12 L7 12 L9 11" />
              <path d="M12 9 L17 8 L19 9 L20 11 L19 12 L17 12 L15 11" />
              
              {/* Hemp leaves - center pair (largest) */}
              <path d="M12 13 L6 12 L4 13 L3 15 L4 17 L6 17 L9 15.5" strokeWidth="2.2" />
              <path d="M12 13 L18 12 L20 13 L21 15 L20 17 L18 17 L15 15.5" strokeWidth="2.2" />
              
              {/* Hemp leaves - bottom pair */}
              <path d="M12 17 L8 16 L6.5 17 L6 18.5 L7 19.5 L9 19" />
              <path d="M12 17 L16 16 L17.5 17 L18 18.5 L17 19.5 L15 19" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}