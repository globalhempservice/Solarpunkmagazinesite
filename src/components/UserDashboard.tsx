import { useState } from 'react'
import { Award, Book, Flame, TrendingUp, Trophy, Star, Zap, Crown, Target, Sparkles, Medal, Lock, Edit, Trash2, Eye, ChevronRight, Rocket, Activity, LogOut, Image as ImageIcon, Heart, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

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
  onLogout?: () => void
  onViewReadingHistory?: () => void
  onViewMatches?: () => void
  matchesCount?: number
  onViewAchievements?: () => void
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

export function UserDashboard({ progress, userArticles, onEditArticle, onDeleteArticle, onLogout, onViewReadingHistory, onViewMatches, matchesCount, onViewAchievements }: UserDashboardProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [marketingNewsletter, setMarketingNewsletter] = useState(false)
  
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
            {/* Left: Level Badge with Stars Below */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-3">
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
                
                {/* Three sparkles below the badge */}
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Sparkles key={i} className="w-5 h-5 text-amber-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              
              {/* Points Display - Now next to the level badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative bg-muted/50 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-primary animate-pulse" />
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
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Progress fill with neon glow */}
              <div 
                className="relative h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-1000 ease-out rounded-full shadow-lg shadow-orange-500/50"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Streak Stats - Icon + Number */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4">
              {/* Current Streak */}
              <div 
                className="relative group"
                onMouseEnter={() => setHoveredStat('currentStreak')}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={`absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'currentStreak' ? 'animate-pulse' : ''}`} />
                
                <div className="relative bg-card/90 backdrop-blur-sm border-2 border-orange-500/40 rounded-xl overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/30 to-transparent rounded-bl-full" />
                  
                  {/* Animated rays */}
                  {hoveredStat === 'currentStreak' && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-400/20 rounded-full animate-ping" />
                    </div>
                  )}
                  
                  <div className="relative p-4 flex flex-col items-center justify-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                      <Flame className="relative w-8 h-8 text-orange-500 drop-shadow-lg" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {progress.currentStreak}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Best Streak */}
              <div 
                className="relative group"
                onMouseEnter={() => setHoveredStat('bestStreak')}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={`absolute -inset-1 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'bestStreak' ? 'animate-pulse' : ''}`} />
                
                <div className="relative bg-card/90 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/30 to-transparent rounded-bl-full" />
                  
                  {/* Animated rays */}
                  {hoveredStat === 'bestStreak' && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-400/20 rounded-full animate-ping" />
                    </div>
                  )}
                  
                  <div className="relative p-4 flex flex-col items-center justify-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                      <Trophy className="relative w-8 h-8 text-amber-500 drop-shadow-lg" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-br from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                      {progress.longestStreak}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID - MEGA ENHANCED */}
      <div className="grid grid-cols-3 gap-4">
        {/* Articles Read */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('articles')}
          onMouseLeave={() => setHoveredStat(null)}
          onClick={onViewReadingHistory}
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
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <Book className="relative w-10 h-10 text-emerald-500 drop-shadow-lg" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {progress.totalArticlesRead}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reading Matches */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('matches')}
          onMouseLeave={() => setHoveredStat(null)}
          onClick={onViewMatches}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'matches' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-pink-500/40 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-transparent rounded-bl-full" />
            
            {/* Animated rays */}
            {hoveredStat === 'matches' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full" />
                <Heart className="relative w-10 h-10 text-pink-500 drop-shadow-lg fill-pink-500" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-pink-500 to-rose-500 bg-clip-text text-transparent">
                {matchesCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredStat('achievements')}
          onMouseLeave={() => setHoveredStat(null)}
          onClick={onViewAchievements}
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'achievements' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-purple-500/40 overflow-hidden transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-transparent rounded-bl-full" />
            
            {hoveredStat === 'achievements' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                <Medal className="relative w-10 h-10 text-purple-500 drop-shadow-lg" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {progress.achievements.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Articles */}
      {userArticles && userArticles.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl">
          {/* Animated gradient background - matching hero card style */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 animate-gradient-xy" />
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-primary/30 rounded-3xl shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30">
                      <Book className="relative w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Your Articles
                    </span>
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-base px-3 py-1">
                      {userArticles.length}
                    </Badge>
                  </div>
                </CardTitle>
                <div className="flex gap-2">
                  <Sparkles className="w-6 h-6 text-primary/50 animate-pulse" />
                  <Star className="w-6 h-6 text-primary/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="space-y-4">
                {userArticles.map((article) => (
                  <div
                    key={article.id}
                    className="group relative overflow-hidden p-5 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 hover:border-primary/40 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3 truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-primary/10 border-primary/30 text-primary"
                          >
                            {article.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-muted/50"
                          >
                            {article.readingTime} min read
                          </Badge>
                          {article.media && article.media.length > 0 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-1"
                            >
                              <ImageIcon className="w-3 h-3" />
                              {article.media.length} media
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {onEditArticle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditArticle(article)}
                            className="gap-2 hover:bg-primary/10 hover:text-primary transition-all group/btn"
                            title="Edit article"
                          >
                            <Edit className="w-5 h-5 transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                            <span className="hidden sm:inline font-semibold">Edit</span>
                          </Button>
                        )}
                        {onDeleteArticle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteArticle(article.id)}
                            className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all group/btn"
                            title="Delete article"
                          >
                            <Trash2 className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                            <span className="hidden sm:inline font-semibold">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Settings & Newsletter Preferences */}
      {onLogout && (
        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            {/* Account Settings Header */}
            <div>
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Account Settings
              </h4>
              <p className="text-sm text-muted-foreground">Manage your DEWII account and preferences</p>
            </div>

            <Separator />

            {/* Newsletter Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h5 className="font-medium text-foreground">Newsletter Preferences</h5>
              </div>
              
              <div className="space-y-4 pl-7">
                {/* Marketing Newsletter */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="marketing-newsletter" className="text-sm font-medium cursor-pointer">
                      Marketing Newsletter
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly digest with featured articles, community highlights, and platform updates
                    </p>
                  </div>
                  <Switch
                    id="marketing-newsletter"
                    checked={marketingNewsletter}
                    onCheckedChange={setMarketingNewsletter}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Logout Button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h5 className="font-medium text-foreground mb-1">Sign Out</h5>
                <p className="text-xs text-muted-foreground">Log out of your account</p>
              </div>
              <Button
                variant="outline"
                onClick={onLogout}
                className="gap-2 border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
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