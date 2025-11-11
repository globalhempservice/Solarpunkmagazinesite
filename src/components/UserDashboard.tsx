import { Award, Book, Flame, TrendingUp, Trophy, Star, Zap, Crown, Target, Sparkles, Medal, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"

interface UserProgress {
  userId: string
  totalArticlesRead: number
  points: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  readArticles: string[]
  lastReadDate: string | null
}

interface UserDashboardProps {
  progress: UserProgress
}

const achievementData: Record<string, { name: string; description: string; icon: any; color: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }> = {
  'first-read': {
    name: 'First Steps',
    description: 'Read your first article',
    icon: Book,
    color: 'from-emerald-400 to-teal-500',
    rarity: 'common'
  },
  'reader-10': {
    name: 'Curious Mind',
    description: 'Read 10 articles',
    icon: Award,
    color: 'from-blue-400 to-cyan-500',
    rarity: 'rare'
  },
  'streak-3': {
    name: '3-Day Streak',
    description: 'Read for 3 consecutive days',
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    rarity: 'rare'
  },
  'streak-7': {
    name: 'Weekly Warrior',
    description: 'Read for 7 consecutive days',
    icon: Trophy,
    color: 'from-amber-400 to-orange-500',
    rarity: 'epic'
  },
  'streak-30': {
    name: 'Legendary Streak',
    description: 'Read for 30 consecutive days',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary'
  },
  'reader-25': {
    name: 'Knowledge Seeker',
    description: 'Read 25 articles',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic'
  },
  'reader-50': {
    name: 'Master Reader',
    description: 'Read 50 articles',
    icon: Medal,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary'
  }
}

// Locked achievements to show progress
const lockedAchievements = [
  { id: 'reader-10', requiredReads: 10 },
  { id: 'reader-25', requiredReads: 25 },
  { id: 'reader-50', requiredReads: 50 },
  { id: 'streak-3', requiredStreak: 3 },
  { id: 'streak-7', requiredStreak: 7 },
  { id: 'streak-30', requiredStreak: 30 },
]

export function UserDashboard({ progress }: UserDashboardProps) {
  // Calculate user level based on points
  const level = Math.floor(progress.points / 100) + 1
  const pointsToNextLevel = ((level) * 100) - progress.points
  const levelProgress = ((progress.points % 100) / 100) * 100

  // Get level title
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 20) return '🌟 Legendary Scholar'
    if (lvl >= 15) return '👑 Master Reader'
    if (lvl >= 10) return '⚡ Expert Explorer'
    if (lvl >= 5) return '📚 Avid Learner'
    return '✨ Knowledge Seeker'
  }

  // Calculate next milestone
  const nextMilestone = progress.totalArticlesRead < 10 ? 10 : 
                        progress.totalArticlesRead < 25 ? 25 : 
                        progress.totalArticlesRead < 50 ? 50 : 100
  
  const progressToNext = Math.min((progress.totalArticlesRead / nextMilestone) * 100, 100)

  // Get unlocked and locked achievements
  const unlockedAchievements = progress.achievements
    .map(id => ({ id, ...achievementData[id] }))
    .filter(a => a.name)

  const nextToUnlock = lockedAchievements
    .filter(la => !progress.achievements.includes(la.id))
    .map(la => {
      const achievement = achievementData[la.id]
      let progressPercent = 0
      let progressText = ''
      
      if (la.requiredReads !== undefined) {
        progressPercent = Math.min((progress.totalArticlesRead / la.requiredReads) * 100, 100)
        progressText = `${progress.totalArticlesRead}/${la.requiredReads} articles`
      } else if (la.requiredStreak !== undefined) {
        progressPercent = Math.min((progress.currentStreak / la.requiredStreak) * 100, 100)
        progressText = `${progress.currentStreak}/${la.requiredStreak} days`
      }
      
      return {
        id: la.id,
        ...achievement,
        progressPercent,
        progressText
      }
    })
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Hero Level Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-[2px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
             style={{ 
               backgroundSize: '200% 100%',
               animation: 'shimmer 4s infinite linear'
             }} 
        />
        
        <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
                  <Crown className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-card">
                  {level}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Level {level}
                  </h3>
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <p className="text-lg text-muted-foreground">{getLevelTitle(level)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-center px-4 py-2 bg-muted/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Total Points</div>
                <div className="text-xl font-bold text-foreground">{progress.points}</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="font-semibold text-foreground">{pointsToNextLevel} points to Level {level + 1}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 rounded-full relative"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                     style={{ 
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite linear'
                     }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-emerald-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Book className="w-8 h-8 text-emerald-500" />
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {progress.totalArticlesRead}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Articles Read</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-orange-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                <Zap className="w-4 h-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
                {progress.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-amber-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Trophy className="w-8 h-8 text-amber-500" />
                <Star className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {progress.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
          <Card className="relative bg-card/80 backdrop-blur-sm border-2 border-purple-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Medal className="w-8 h-8 text-purple-500" />
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {progress.achievements.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Achievements</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Milestone */}
      <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Next Milestone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-foreground">{progress.totalArticlesRead} articles read</span>
            <span className="text-muted-foreground">Goal: {nextMilestone} articles</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 rounded-full relative"
              style={{ width: `${progressToNext}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                   style={{ 
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s infinite linear'
                   }} 
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {nextMilestone - progress.totalArticlesRead} more article{nextMilestone - progress.totalArticlesRead !== 1 ? 's' : ''} to unlock your next reward! 🎯
          </p>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <CardTitle>Unlocked Achievements</CardTitle>
                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  {unlockedAchievements.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unlockedAchievements.map((achievement) => {
                  const Icon = achievement.icon
                  const rarityColors = {
                    common: 'border-gray-400/30 bg-gray-500/5',
                    rare: 'border-blue-400/30 bg-blue-500/5',
                    epic: 'border-purple-400/30 bg-purple-500/5',
                    legendary: 'border-amber-400/50 bg-amber-500/10'
                  }
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`relative overflow-hidden flex items-start gap-3 p-3 rounded-lg border-2 ${rarityColors[achievement.rarity]} group`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`relative p-2 rounded-lg bg-gradient-to-br ${achievement.color}`}>
                        <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{achievement.name}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                              achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                              'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {achievement.rarity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next to Unlock */}
        {nextToUnlock.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-muted">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-muted-foreground">Next to Unlock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nextToUnlock.map((achievement) => {
                  const Icon = achievement.icon
                  
                  return (
                    <div
                      key={achievement.id}
                      className="relative overflow-hidden flex items-start gap-3 p-3 rounded-lg border-2 border-dashed border-muted bg-muted/20"
                    >
                      <div className="relative p-2 rounded-lg bg-muted/50">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <p className="font-semibold text-muted-foreground">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground/70">
                            {achievement.description}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{achievement.progressText}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30 transition-all duration-500 rounded-full"
                              style={{ width: `${achievement.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
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
