import { useState } from 'react'
import { Award, Book, Flame, Trophy, Star, Medal, Crown, Target, Sparkles, Lock, ChevronRight, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"

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

interface AchievementsPageProps {
  progress: UserProgress
  onBack: () => void
}

const achievementData: Record<string, { 
  name: string
  description: string
  icon: any
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  category: 'reading' | 'streak' | 'special'
  requirement: string
  tips?: string
}> = {
  'first-read': {
    name: 'First Steps',
    description: 'Read your first article',
    icon: Book,
    color: 'from-emerald-400 to-teal-500',
    rarity: 'common',
    points: 10,
    category: 'reading',
    requirement: 'Complete 1 article',
    tips: 'Start your reading journey by completing any article!'
  },
  'reader-10': {
    name: 'Curious Mind',
    description: 'Read 10 articles',
    icon: Award,
    color: 'from-blue-400 to-cyan-500',
    rarity: 'rare',
    points: 50,
    category: 'reading',
    requirement: 'Complete 10 articles',
    tips: 'Keep exploring different topics to reach 10 articles!'
  },
  'reader-25': {
    name: 'Knowledge Seeker',
    description: 'Read 25 articles',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 150,
    category: 'reading',
    requirement: 'Complete 25 articles',
    tips: 'You\'re building an impressive knowledge base!'
  },
  'reader-50': {
    name: 'Master Reader',
    description: 'Read 50 articles',
    icon: Medal,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 500,
    category: 'reading',
    requirement: 'Complete 50 articles',
    tips: 'Only the most dedicated readers reach this milestone!'
  },
  'streak-3': {
    name: '3-Day Streak',
    description: 'Read for 3 consecutive days',
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    rarity: 'rare',
    points: 30,
    category: 'streak',
    requirement: 'Read at least 1 article for 3 days in a row',
    tips: 'Build a daily reading habit! Come back tomorrow to keep your streak alive.'
  },
  'streak-7': {
    name: 'Weekly Warrior',
    description: 'Read for 7 consecutive days',
    icon: Trophy,
    color: 'from-amber-400 to-orange-500',
    rarity: 'epic',
    points: 100,
    category: 'streak',
    requirement: 'Read at least 1 article for 7 days in a row',
    tips: 'A week of consistent reading shows true dedication!'
  },
  'streak-30': {
    name: 'Legendary Streak',
    description: 'Read for 30 consecutive days',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 1000,
    category: 'streak',
    requirement: 'Read at least 1 article for 30 days in a row',
    tips: 'The ultimate achievement! A month of daily reading creates lasting change.'
  },
}

const rarityConfig = {
  common: {
    label: 'Common',
    gradient: 'from-emerald-400 via-teal-400 to-emerald-500',
    shadow: 'shadow-emerald-500/50',
    border: 'border-emerald-500/30',
    glow: 'bg-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  rare: {
    label: 'Rare',
    gradient: 'from-blue-400 via-cyan-400 to-blue-500',
    shadow: 'shadow-blue-500/50',
    border: 'border-blue-500/30',
    glow: 'bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  epic: {
    label: 'Epic',
    gradient: 'from-purple-400 via-pink-400 to-purple-500',
    shadow: 'shadow-purple-500/50',
    border: 'border-purple-500/30',
    glow: 'bg-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  legendary: {
    label: 'Legendary',
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    shadow: 'shadow-amber-500/50',
    border: 'border-amber-500/30',
    glow: 'bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400'
  }
}

export function AchievementsPage({ progress, onBack }: AchievementsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reading' | 'streak' | 'special'>('all')
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null)

  // Get unlocked achievements
  const unlockedAchievements = progress.achievements
    .map(id => ({ id, ...achievementData[id] }))
    .filter(a => a.name)

  // Get locked achievements with progress
  const lockedAchievements = Object.keys(achievementData)
    .filter(id => !progress.achievements.includes(id))
    .map(id => {
      const achievement = achievementData[id]
      let progressPercent = 0
      let progressText = ''
      
      if (achievement.category === 'reading') {
        const required = parseInt(id.split('-')[1])
        progressPercent = Math.min((progress.totalArticlesRead / required) * 100, 100)
        progressText = `${progress.totalArticlesRead}/${required}`
      } else if (achievement.category === 'streak') {
        const required = parseInt(id.split('-')[1])
        progressPercent = Math.min((progress.currentStreak / required) * 100, 100)
        progressText = `${progress.currentStreak}/${required}`
      }
      
      return {
        id,
        ...achievement,
        progressPercent,
        progressText
      }
    })

  // Filter achievements based on selected category
  const filteredUnlocked = selectedCategory === 'all' 
    ? unlockedAchievements 
    : unlockedAchievements.filter(a => a.category === selectedCategory)
  
  const filteredLocked = selectedCategory === 'all' 
    ? lockedAchievements 
    : lockedAchievements.filter(a => a.category === selectedCategory)

  const totalAchievements = Object.keys(achievementData).length
  const completionPercent = (unlockedAchievements.length / totalAchievements) * 100
  const totalPointsEarned = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)
  const totalPointsAvailable = Object.values(achievementData).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                background: ['#fbbf24', '#a855f7', '#ec4899', '#06b6d4'][i % 4],
                opacity: 0.3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative backdrop-blur-xl bg-card/80 border-2 border-purple-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500 rounded-3xl p-6">
                <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Achievement Gallery
              </h1>
              <p className="text-xl text-muted-foreground">
                Unlock rewards and track your reading journey
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-border/50">
                <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {unlockedAchievements.length}/{totalAchievements}
                </div>
                <div className="text-sm text-muted-foreground font-semibold">Achievements</div>
              </div>
              
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-border/50">
                <div className="text-4xl font-bold bg-gradient-to-br from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  {Math.round(completionPercent)}%
                </div>
                <div className="text-sm text-muted-foreground font-semibold">Complete</div>
              </div>
              
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-border/50">
                <div className="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {totalPointsEarned}
                </div>
                <div className="text-sm text-muted-foreground font-semibold">Points Earned</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="max-w-2xl mx-auto pt-4">
              <div className="relative h-6 bg-muted/50 rounded-full overflow-hidden border-2 border-border/50">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                  style={{ width: `${completionPercent}%` }}
                >
                  {completionPercent > 10 && (
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(completionPercent)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger 
            value="all" 
            onClick={() => setSelectedCategory('all')}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger 
            value="reading"
            onClick={() => setSelectedCategory('reading')}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            <Book className="w-4 h-4 mr-2" />
            Reading
          </TabsTrigger>
          <TabsTrigger 
            value="streak"
            onClick={() => setSelectedCategory('streak')}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
          >
            <Flame className="w-4 h-4 mr-2" />
            Streaks
          </TabsTrigger>
          <TabsTrigger 
            value="special"
            onClick={() => setSelectedCategory('special')}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Special
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Unlocked Achievements */}
      {filteredUnlocked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Unlocked ({filteredUnlocked.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnlocked.map((achievement) => {
              const Icon = achievement.icon
              const rarity = rarityConfig[achievement.rarity]
              
              return (
                <div
                  key={achievement.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredAchievement(achievement.id)}
                  onMouseLeave={() => setHoveredAchievement(null)}
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-br ${rarity.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-300`} />
                  
                  <Card className={`relative overflow-hidden border-2 ${rarity.border} transform group-hover:scale-105 transition-all duration-300`}>
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rarity.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    {/* Shine effect on hover */}
                    {hoveredAchievement === achievement.id && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className={`absolute -inset-full top-0 ${rarity.glow} blur-2xl animate-spin-slow`} />
                      </div>
                    )}
                    
                    <CardContent className="relative p-6 space-y-4">
                      {/* Rarity Badge */}
                      <div className="flex items-center justify-between">
                        <Badge className={`bg-gradient-to-r ${rarity.gradient} text-white border-0 ${rarity.shadow} shadow-lg`}>
                          {rarity.label}
                        </Badge>
                        <div className={`px-3 py-1 rounded-full ${rarity.glow} border ${rarity.border}`}>
                          <span className={`text-sm font-bold ${rarity.textColor}`}>+{achievement.points} pts</span>
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="relative">
                        <div className={`absolute inset-0 ${rarity.glow} blur-xl rounded-full`} />
                        <div className={`relative w-20 h-20 mx-auto bg-gradient-to-br ${rarity.gradient} rounded-2xl flex items-center justify-center ${rarity.shadow} shadow-xl transform group-hover:rotate-12 transition-transform duration-300`}>
                          <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>

                      {/* Requirement */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>{achievement.requirement}</span>
                        </div>
                      </div>

                      {/* Unlocked Badge */}
                      <div className={`flex items-center justify-center gap-2 py-2 rounded-lg ${rarity.glow} border ${rarity.border}`}>
                        <Sparkles className={`w-4 h-4 ${rarity.textColor}`} />
                        <span className={`text-sm font-bold ${rarity.textColor}`}>UNLOCKED!</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {filteredLocked.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Locked ({filteredLocked.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocked.map((achievement) => {
              const Icon = achievement.icon
              const rarity = rarityConfig[achievement.rarity]
              
              return (
                <div
                  key={achievement.id}
                  className="relative group"
                >
                  <Card className="relative overflow-hidden border-2 border-border/50 opacity-75 hover:opacity-90 transition-opacity">
                    {/* Locked overlay */}
                    <div className="absolute inset-0 bg-muted/30 backdrop-blur-[2px]" />
                    
                    <CardContent className="relative p-6 space-y-4">
                      {/* Rarity Badge */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-muted-foreground/30">
                          {rarity.label}
                        </Badge>
                        <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">
                          <span className="text-sm font-bold text-muted-foreground">+{achievement.points} pts</span>
                        </div>
                      </div>

                      {/* Icon with Lock */}
                      <div className="relative">
                        <div className="relative w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                          <Icon className="w-10 h-10 text-muted-foreground/50" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background rounded-full p-2 border-2 border-border">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>

                      {/* Progress */}
                      {achievement.progressPercent > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold text-foreground">{achievement.progressText}</span>
                          </div>
                          <Progress value={achievement.progressPercent} className="h-2" />
                        </div>
                      )}

                      {/* Requirement */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                          <Target className="w-3 h-3" />
                          <span>{achievement.requirement}</span>
                        </div>
                        {achievement.tips && (
                          <p className="text-xs text-center text-muted-foreground/80 italic">
                            💡 {achievement.tips}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
        <div className="text-center py-16">
          <Medal className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No achievements in this category yet</h3>
          <p className="text-muted-foreground">Try another category or start reading to unlock achievements!</p>
        </div>
      )}

      <style>{`
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
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
