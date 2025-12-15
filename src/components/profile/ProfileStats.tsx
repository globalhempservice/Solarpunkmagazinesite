import { Zap, Coins, Calendar, Package } from 'lucide-react'

interface ProfileStatsProps {
  profile: {
    power_points?: number
    nada_balance?: number
    created_at: string
  }
  userProgress?: {
    points?: number
    total_articles_read?: number
    current_streak?: number
    achievements?: string[]
  } | null
  swapsCompleted?: number
}

export function ProfileStats({ profile, userProgress, swapsCompleted = 0 }: ProfileStatsProps) {
  // Calculate days on platform
  const daysOnPlatform = Math.floor(
    (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get power points from userProgress if available, otherwise use profile or default to 0
  const powerPoints = userProgress?.points ?? profile.power_points ?? 0
  
  // NADA balance from profile (Phase 1 will have this)
  const nadaBalance = profile.nada_balance ?? 0

  const stats = [
    {
      label: 'Power Points',
      value: powerPoints.toLocaleString(),
      icon: Zap,
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-500/10 to-amber-500/10'
    },
    {
      label: 'NADA Balance',
      value: nadaBalance.toLocaleString(),
      icon: Coins,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10'
    },
    {
      label: 'Days Active',
      value: daysOnPlatform.toLocaleString(),
      icon: Calendar,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/10 to-blue-500/10'
    },
    {
      label: 'Swaps Completed',
      value: swapsCompleted.toLocaleString(),
      icon: Package,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    }
  ]

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="relative group overflow-hidden rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-all"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 relative overflow-hidden`}>
                  {/* Shine effect */}
                  <div className="absolute top-0 right-0 w-4 h-4 bg-white/30 rounded-full blur-sm" />
                  <Icon className="w-5 h-5 text-white relative z-10" />
                </div>

                {/* Value */}
                <p className="text-2xl font-bold mb-1">{stat.value}</p>

                {/* Label */}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}