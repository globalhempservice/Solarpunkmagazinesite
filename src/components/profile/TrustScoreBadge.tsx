interface TrustScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function TrustScoreBadge({ score, size = 'md' }: TrustScoreBadgeProps) {
  // Determine trust level
  const getTrustLevel = (score: number) => {
    if (score >= 200) return {
      label: 'Community Leader',
      color: 'from-yellow-500 to-amber-500',
      textColor: 'text-yellow-400',
      icon: 'crown'
    }
    if (score >= 100) return {
      label: 'Power User',
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      icon: 'star'
    }
    if (score >= 50) return {
      label: 'Verified',
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      icon: 'shield'
    }
    if (score >= 25) return {
      label: 'Trusted',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      icon: 'check'
    }
    return {
      label: 'New User',
      color: 'from-slate-500 to-gray-500',
      textColor: 'text-slate-400',
      icon: 'seedling'
    }
  }

  const level = getTrustLevel(score)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5'
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Render icon based on type
  const renderIcon = () => {
    const className = `${iconSize[size]} ${level.textColor}`
    
    switch (level.icon) {
      case 'crown':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15 8.5L22 9L17 14L19 22L12 18L5 22L7 14L2 9L9 8.5L12 2Z" />
          </svg>
        )
      case 'star':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        )
      case 'shield':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" />
            <path d="M10 14L7 11L8.41 9.59L10 11.17L15.59 5.58L17 7L10 14Z" fill="white" />
          </svg>
        )
      case 'check':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'seedling':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 7 4 7 9C7 11 8 12 8 12C8 12 8 11 9 10C10 9 11 9 11 9V20C11 21.1 11.9 22 13 22C14.1 22 15 21.1 15 20V9C15 9 16 9 17 10C18 11 18 12 18 12C18 12 19 11 19 9C19 4 14 2 14 2H12Z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full border border-border/50 bg-card/80 backdrop-blur-sm relative overflow-hidden group`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        {renderIcon()}
        <span className="font-medium">{level.label}</span>
        <span className={`${level.textColor} font-bold`}>{score}</span>
      </div>
    </div>
  )
}
