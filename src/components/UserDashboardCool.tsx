import { useState } from 'react'
import { Award, Book, Flame, TrendingUp, Trophy, Star, Zap, Crown, Target, Sparkles, Medal, Lock, Edit, Trash2, Eye, ChevronRight, Rocket, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  media?: Array<{
    type: 'youtube' | 'audio' | 'image'
    url: string
    caption?: string
  }>
}

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
  userArticles?: Article[]
  onEditArticle?: (article: Article) => void
  onDeleteArticle?: (articleId: string) => void
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

const lockedAchievements = [
  { id: 'reader-10', requiredReads: 10 },
  { id: 'reader-25', requiredReads: 25 },
  { id: 'reader-50', requiredReads: 50 },
  { id: 'streak-3', requiredStreak: 3 },
  { id: 'streak-7', requiredStreak: 7 },
  { id: 'streak-30', requiredStreak: 30 },
]

export function UserDashboard({ progress, userArticles, onEditArticle, onDeleteArticle }: UserDashboardProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  
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

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 via-yellow-300 to-amber-500 shadow-amber-500/50'
      case 'epic':
        return 'from-purple-400 via-pink-400 to-purple-500 shadow-purple-500/50'
      case 'rare':
        return 'from-blue-400 via-cyan-400 to-blue-500 shadow-blue-500/50'
      default:
        return 'from-emerald-400 via-teal-400 to-emerald-500 shadow-emerald-500/50'
    }
  }

  return (
    <div className="space-y-8">
      {/* ULTRA HERO LEVEL CARD */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 animate-gradient-xy" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative backdrop-blur-xl bg-card/80 border-2 border-amber-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Left: Level Badge */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {/* Rotating glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-spin-slow" />
                
                {/* Main badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 blur-xl opacity-75 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-6 transform group-hover:scale-110 transition-transform duration-300">
                    <Crown className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Level number badge */}
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg border-4 border-card shadow-xl transform group-hover:scale-110 transition-transform">
                    {level}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Level {level}
                  </h2>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Sparkles key={i} className="w-6 h-6 text-amber-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
                <p className="text-xl text-muted-foreground">{getLevelTitle(level)}</p>
              </div>
            </div>

            {/* Right: Points Display */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative bg-muted/50 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary animate-pulse" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {progress.points}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Progress to Next Level</span>
              </div>
              <span className="font-bold text-foreground">{pointsToNextLevel} points to Level {level + 1}</span>
            </div>
            
            <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Progress fill */}
              <div 
                className="relative h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                {levelProgress > 10 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg">
                    {Math.round(levelProgress)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID - MEGA ENHANCED */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Articles Read */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('articles')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'articles' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-emerald-500/40 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-transparent rounded-bl-full" />
            
            {/* Animated rays */}
            {hoveredStat === 'articles' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <Book className="relative w-10 h-10 text-emerald-500 drop-shadow-lg" />
                </div>
                <Activity className="w-5 h-5 text-emerald-400/50 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1">
                {progress.totalArticlesRead}
              </div>
              <div className="text-sm text-muted-foreground">Articles Read</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Streak */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('streak')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'streak' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-orange-500/40 overflow-hidden transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-transparent rounded-bl-full" />
            
            {hoveredStat === 'streak' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                  <Flame className="relative w-10 h-10 text-orange-500 drop-shadow-lg animate-pulse" />
                </div>
                <Zap className="w-5 h-5 text-orange-400/50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">
                {progress.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
            </CardContent>
          </Card>
        </div>

        {/* Best Streak */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('best')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'best' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-amber-500/40 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/30 to-transparent rounded-bl-full" />
            
            {hoveredStat === 'best' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                  <Trophy className="relative w-10 h-10 text-amber-500 drop-shadow-lg" />
                </div>
                <Star className="w-5 h-5 text-amber-400/50 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-br from-amber-500 to-yellow-500 bg-clip-text text-transparent mb-1">
                {progress.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak 🏆</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('achievements')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'achievements' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-purple-500/40 overflow-hidden transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-transparent rounded-bl-full" />
            
            {hoveredStat === 'achievements' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <Medal className="relative w-10 h-10 text-purple-500 drop-shadow-lg" />
                </div>
                <Sparkles className="w-5 h-5 text-purple-400/50 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-1">
                {progress.achievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Achievements ⭐</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REST OF THE COMPONENT CONTINUES... */}
      {/* Achievements Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Unlocked Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unlockedAchievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className="relative group overflow-hidden rounded-xl border-2 bg-card p-4 transition-all hover:scale-102"
                    style={{
                      borderColor: `rgba(${achievement.rarity === 'legendary' ? '251, 191, 36' : achievement.rarity === 'epic' ? '168, 85, 247' : achievement.rarity === 'rare' ? '59, 130, 246' : '16, 185, 129'}, 0.3)`,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative flex items-center gap-4">
                      <div className={`relative p-3 rounded-xl bg-gradient-to-br ${achievement.color} shadow-lg ${getRarityStyles(achievement.rarity)}`}>
                        <div className="absolute inset-0 blur-md opacity-50" />
                        <Icon className="relative w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">{achievement.rarity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      </div>
                      
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Next to Unlock */}
        {nextToUnlock.length > 0 && (
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Next to Unlock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextToUnlock.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className="relative group overflow-hidden rounded-xl border-2 border-border/30 bg-muted/30 p-4 transition-all hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative p-3 rounded-xl bg-muted border border-border">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                        <Lock className="absolute -top-1 -right-1 w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                          <Badge variant="outline" className="text-xs">{achievement.progressText}</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                            style={{ width: `${achievement.progressPercent}%` }}
                          />
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Articles */}
      {userArticles && userArticles.length > 0 && (
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              Your Articles ({userArticles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userArticles.map((article) => (
                <div
                  key={article.id}
                  className="group flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views || 0}
                      </span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onEditArticle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditArticle(article)}
                        className="gap-2 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                    {onDeleteArticle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteArticle(article.id)}
                        className="gap-2 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS for custom animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  )
}
