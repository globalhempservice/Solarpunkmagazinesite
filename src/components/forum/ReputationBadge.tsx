import { Sparkles, Award, Crown } from 'lucide-react'

interface ReputationBadgeProps {
  reputation: number
  size?: 'sm' | 'md' | 'lg'
}

export function ReputationBadge({ reputation, size = 'sm' }: ReputationBadgeProps) {
  const getLevel = () => {
    if (reputation >= 1000) return { name: 'Elder', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' }
    if (reputation >= 500) return { name: 'Expert', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' }
    if (reputation >= 100) return { name: 'Contributor', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' }
    return { name: 'Member', icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' }
  }

  const level = getLevel()
  const Icon = level.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full ${level.bg} border ${level.border} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} ${level.color}`} />
      <span className={`font-medium ${level.color}`}>{level.name}</span>
      <span className="text-white/40">·</span>
      <span className="text-white/60">{reputation}</span>
    </div>
  )
}
