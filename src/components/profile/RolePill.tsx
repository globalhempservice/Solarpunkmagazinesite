interface RolePillProps {
  role: string
  size?: 'sm' | 'md'
}

export function RolePill({ role, size = 'md' }: RolePillProps) {
  const getRoleConfig = (role: string) => {
    const roleMap: Record<string, { label: string; gradient: string; textColor: string }> = {
      'consumer': {
        label: 'Consumer',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        textColor: 'text-emerald-400'
      },
      'professional': {
        label: 'Professional',
        gradient: 'from-cyan-500/20 to-blue-500/20',
        textColor: 'text-cyan-400'
      },
      'founder': {
        label: 'Founder',
        gradient: 'from-purple-500/20 to-pink-500/20',
        textColor: 'text-purple-400'
      },
      'designer': {
        label: 'Designer',
        gradient: 'from-pink-500/20 to-rose-500/20',
        textColor: 'text-pink-400'
      },
      'researcher': {
        label: 'Researcher',
        gradient: 'from-blue-500/20 to-indigo-500/20',
        textColor: 'text-blue-400'
      },
      'farmer': {
        label: 'Farmer',
        gradient: 'from-green-500/20 to-emerald-500/20',
        textColor: 'text-green-400'
      },
      'buyer': {
        label: 'Buyer',
        gradient: 'from-orange-500/20 to-amber-500/20',
        textColor: 'text-orange-400'
      },
      'cultivator': {
        label: 'Cultivator',
        gradient: 'from-lime-500/20 to-green-500/20',
        textColor: 'text-lime-400'
      },
      'entrepreneur': {
        label: 'Entrepreneur',
        gradient: 'from-violet-500/20 to-purple-500/20',
        textColor: 'text-violet-400'
      },
      'other': {
        label: 'Other',
        gradient: 'from-slate-500/20 to-gray-500/20',
        textColor: 'text-slate-400'
      }
    }

    return roleMap[role.toLowerCase()] || {
      label: role.charAt(0).toUpperCase() + role.slice(1),
      gradient: 'from-slate-500/20 to-gray-500/20',
      textColor: 'text-slate-400'
    }
  }

  const config = getRoleConfig(role)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full border border-border/50 bg-gradient-to-r ${config.gradient} backdrop-blur-sm`}
    >
      <span className={`font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </span>
  )
}
