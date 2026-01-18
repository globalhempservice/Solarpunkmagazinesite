import { Flame, Sparkles, CheckCircle2, Lock, FileText } from 'lucide-react'
import { ThreadStatus } from './types'

interface StatusChipProps {
  status: ThreadStatus
  size?: 'sm' | 'md'
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const configs = {
    new: { 
      label: 'New', 
      icon: Sparkles, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/20', 
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20'
    },
    hot: { 
      label: 'Hot', 
      icon: Flame, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/20', 
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/20'
    },
    answered: { 
      label: 'Answered', 
      icon: CheckCircle2, 
      color: 'text-teal-400', 
      bg: 'bg-teal-500/20', 
      border: 'border-teal-500/30',
      glow: 'shadow-teal-500/20'
    },
    proposal: { 
      label: 'Proposal', 
      icon: FileText, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/20', 
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20'
    },
    locked: { 
      label: 'Locked', 
      icon: Lock, 
      color: 'text-slate-400', 
      bg: 'bg-slate-500/20', 
      border: 'border-slate-500/30',
      glow: 'shadow-slate-500/20'
    },
  }

  const config = configs[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  }

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full ${config.bg} border ${config.border} ${sizeClasses[size]} shadow-sm ${config.glow}`}
    >
      <Icon className={`${iconSizes[size]} ${config.color}`} />
      <span className={`font-semibold ${config.color}`}>{config.label}</span>
    </div>
  )
}
