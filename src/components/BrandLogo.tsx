interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAnimation?: boolean
  className?: string
}

export function BrandLogo({ size = 'md', showAnimation = true, className = '' }: BrandLogoProps) {
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

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Animated glow effect */}
      {showAnimation && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-amber-500 rounded-full blur-xl opacity-40 animate-pulse" 
               style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-400 rounded-full blur-lg opacity-30 animate-pulse" 
               style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </>
      )}
      
      {/* Main orb with gradient */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 dark:from-emerald-500 dark:via-teal-600 dark:to-emerald-700 hempin:from-amber-500 hempin:via-emerald-500 hempin:to-teal-600 p-[2px] shadow-lg">
        {/* Inner glow layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Content container */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500/90 via-teal-500/90 to-emerald-600/90 dark:from-emerald-600/90 dark:via-teal-700/90 dark:to-emerald-800/90 hempin:from-amber-600/90 hempin:via-emerald-600/90 hempin:to-teal-700/90 flex items-center justify-center overflow-hidden">
          {/* Animated background shimmer */}
          {showAnimation && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 3s infinite linear'
                 }} />
          )}
          
          {/* Hemp Branch SVG Icon */}
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
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
