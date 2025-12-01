import { Crown, Leaf, Sparkles, LucideIcon } from 'lucide-react'

interface BadgeInfo {
  id: string
  name: string
  description?: string
  icon: LucideIcon
  iconColor: string
  bgGradient: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

interface BadgeDisplayProps {
  badgeId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  equipped?: boolean
  showLabel?: boolean
  showRarity?: boolean
  onClick?: () => void
  className?: string
}

// Badge definitions - synchronized with MarketProfilePanel
export const BADGE_DEFINITIONS: Record<string, BadgeInfo> = {
  'badge-founder': {
    id: 'badge-founder',
    name: 'Founder',
    description: 'Early supporter of the Hemp\'in movement',
    icon: Crown,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500 to-pink-600',
    rarity: 'legendary'
  },
  'badge-hemp-pioneer': {
    id: 'badge-hemp-pioneer',
    name: 'Hemp Pioneer',
    description: 'Trailblazer in sustainable hemp advocacy',
    icon: Leaf,
    iconColor: 'text-emerald-400',
    bgGradient: 'from-emerald-500 to-green-600',
    rarity: 'epic'
  },
  'badge-nada-whale': {
    id: 'badge-nada-whale',
    name: 'NADA Whale',
    description: 'Generous contributor to the community',
    icon: Sparkles,
    iconColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500 to-blue-600',
    rarity: 'rare'
  }
}

// Size mapping
const SIZE_CLASSES = {
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    label: 'text-xs',
    equipped: 'w-3 h-3 -top-0.5 -right-0.5'
  },
  md: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    label: 'text-sm',
    equipped: 'w-4 h-4 -top-1 -right-1'
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    label: 'text-base',
    equipped: 'w-5 h-5 -top-1.5 -right-1.5'
  },
  xl: {
    container: 'w-24 h-24',
    icon: 'w-12 h-12',
    label: 'text-lg',
    equipped: 'w-6 h-6 -top-2 -right-2'
  }
}

// Rarity colors
const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400'
}

const RARITY_GLOWS = {
  common: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]',
  rare: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]',
  epic: 'shadow-[0_0_20px_rgba(167,139,250,0.5)]',
  legendary: 'shadow-[0_0_25px_rgba(251,191,36,0.6)]'
}

export function BadgeDisplay({
  badgeId,
  size = 'md',
  equipped = false,
  showLabel = false,
  showRarity = false,
  onClick,
  className = ''
}: BadgeDisplayProps) {
  const badge = BADGE_DEFINITIONS[badgeId]
  
  if (!badge) {
    console.warn(`Badge not found: ${badgeId}`)
    return null
  }

  const IconComponent = badge.icon
  const sizeClass = SIZE_CLASSES[size]
  const rarityColor = RARITY_COLORS[badge.rarity || 'common']
  const rarityGlow = RARITY_GLOWS[badge.rarity || 'common']

  return (
    <div 
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      onClick={onClick}
    >
      {/* Badge Icon Container */}
      <div className="relative">
        <div
          className={`
            ${sizeClass.container}
            rounded-full 
            bg-gradient-to-br ${badge.bgGradient}
            flex items-center justify-center
            ${rarityGlow}
            ${onClick ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''}
          `}
        >
          <IconComponent 
            className={`${sizeClass.icon} text-white drop-shadow-lg`} 
            strokeWidth={2.5} 
          />
        </div>

        {/* Equipped Star Indicator */}
        {equipped && (
          <div 
            className={`
              absolute ${sizeClass.equipped}
              rounded-full 
              bg-amber-400 
              border-2 border-background
              flex items-center justify-center
              shadow-lg
              animate-pulse
            `}
          >
            <Sparkles className="w-full h-full p-0.5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Badge Label */}
      {showLabel && (
        <div className="text-center">
          <p className={`font-semibold ${sizeClass.label}`}>
            {badge.name}
          </p>
          {showRarity && badge.rarity && (
            <p className={`text-xs ${rarityColor} capitalize`}>
              {badge.rarity}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to get badge info
export function getBadgeInfo(badgeId: string): BadgeInfo | null {
  return BADGE_DEFINITIONS[badgeId] || null
}

// Helper function to check if badge exists
export function badgeExists(badgeId: string): boolean {
  return badgeId in BADGE_DEFINITIONS
}
