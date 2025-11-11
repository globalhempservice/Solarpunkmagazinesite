import { Flame, Trophy, Zap, Star } from 'lucide-react'

interface StreakBannerProps {
  currentStreak: number
  longestStreak: number
  points: number
}

export function StreakBanner({ currentStreak, longestStreak, points }: StreakBannerProps) {
  // Determine streak level and messaging
  const getStreakLevel = () => {
    if (currentStreak >= 30) return { level: 'legendary', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/50' }
    if (currentStreak >= 14) return { level: 'fire', color: 'from-orange-500 to-red-600', glow: 'shadow-orange-500/50' }
    if (currentStreak >= 7) return { level: 'hot', color: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/50' }
    if (currentStreak >= 3) return { level: 'warming', color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/50' }
    return { level: 'spark', color: 'from-primary to-primary/70', glow: 'shadow-primary/50' }
  }

  const getStreakMessage = () => {
    if (currentStreak >= 30) return '🌟 LEGENDARY STREAK!'
    if (currentStreak >= 14) return '🔥 ON FIRE!'
    if (currentStreak >= 7) return '⚡ UNSTOPPABLE!'
    if (currentStreak >= 3) return '💚 BUILDING MOMENTUM!'
    return '✨ STREAK STARTED!'
  }

  const streakLevel = getStreakLevel()
  const isNewRecord = currentStreak === longestStreak && currentStreak > 1

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-r ${streakLevel.color} p-[2px] shadow-lg ${streakLevel.glow}`}>
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
           style={{ 
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s infinite linear'
           }} 
      />
      
      <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Streak Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${streakLevel.color} blur-md opacity-50 animate-pulse`} />
              <div className={`relative bg-gradient-to-r ${streakLevel.color} rounded-full p-3 text-white`}>
                <Flame className="w-6 h-6" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold bg-gradient-to-r ${streakLevel.color} bg-clip-text text-transparent`}>
                  {getStreakMessage()}
                </h3>
                {isNewRecord && (
                  <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-foreground">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span> streak
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-foreground">{points}</span> points
                </span>
              </div>
            </div>
          </div>

          {/* Right: Best Streak */}
          {longestStreak > currentStreak && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div className="text-xs">
                <div className="text-muted-foreground">Best Streak</div>
                <div className="font-bold text-foreground">{longestStreak} days</div>
              </div>
            </div>
          )}

          {isNewRecord && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 rounded-lg border-2 border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">NEW RECORD!</span>
            </div>
          )}
        </div>

        {/* Progress to next milestone */}
        {currentStreak < 30 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Next milestone:</span>
              <span className="font-semibold">
                {currentStreak < 3 && '3 days - Building Momentum 💚'}
                {currentStreak >= 3 && currentStreak < 7 && '7 days - Unstoppable ⚡'}
                {currentStreak >= 7 && currentStreak < 14 && '14 days - On Fire 🔥'}
                {currentStreak >= 14 && currentStreak < 30 && '30 days - Legendary 🌟'}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${streakLevel.color} transition-all duration-500 rounded-full`}
                style={{ 
                  width: `${
                    currentStreak < 3 ? (currentStreak / 3) * 100 :
                    currentStreak < 7 ? ((currentStreak - 3) / 4) * 100 :
                    currentStreak < 14 ? ((currentStreak - 7) / 7) * 100 :
                    ((currentStreak - 14) / 16) * 100
                  }%` 
                }}
              />
            </div>
          </div>
        )}
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
