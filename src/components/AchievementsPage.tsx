import { useState, useEffect } from 'react'
import { Award, Book, Flame, Trophy, Star, Medal, Crown, Target, Sparkles, Lock, ChevronRight, TrendingUp, Zap, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

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
  onProgressUpdate?: (progress: UserProgress) => void
  accessToken: string
}

const achievementData: Record<string, { 
  name: string
  description: string
  icon: any
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  points: number
  category: 'reading' | 'streak' | 'social' | 'creation' | 'explorer' | 'special'
  requirement: string
  tips?: string
}> = {
  // === READING ACHIEVEMENTS (Progressive Levels) ===
  'first-read': {
    name: 'First Steps',
    description: 'Read your first article',
    icon: Book,
    color: 'from-emerald-400 to-teal-500',
    rarity: 'common',
    points: 10,
    category: 'reading',
    requirement: 'Complete 1 article',
    tips: 'Every journey begins with a single step!'
  },
  'reader-5': {
    name: 'Getting Started',
    description: 'Read 5 articles',
    icon: Book,
    color: 'from-emerald-400 to-teal-500',
    rarity: 'common',
    points: 25,
    category: 'reading',
    requirement: 'Complete 5 articles',
    tips: 'You\'re building momentum!'
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
    tips: 'Keep exploring different topics!'
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
    name: 'Voracious Reader',
    description: 'Read 50 articles',
    icon: Medal,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 300,
    category: 'reading',
    requirement: 'Complete 50 articles',
    tips: 'Your dedication is inspiring!'
  },
  'reader-100': {
    name: 'Scholar Supreme',
    description: 'Read 100 articles',
    icon: Crown,
    color: 'from-purple-600 to-pink-600',
    rarity: 'mythic',
    points: 750,
    category: 'reading',
    requirement: 'Complete 100 articles',
    tips: 'You\'ve achieved true mastery!'
  },

  // === STREAK ACHIEVEMENTS (Daily Consistency) ===
  'streak-3': {
    name: 'Hot Start',
    description: 'Read for 3 consecutive days',
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    rarity: 'common',
    points: 30,
    category: 'streak',
    requirement: 'Read at least 1 article for 3 days in a row',
    tips: 'Consistency is key! Come back tomorrow.'
  },
  'streak-7': {
    name: 'Weekly Warrior',
    description: 'Read for 7 consecutive days',
    icon: Trophy,
    color: 'from-amber-400 to-orange-500',
    rarity: 'rare',
    points: 75,
    category: 'streak',
    requirement: 'Read at least 1 article for 7 days in a row',
    tips: 'A week of consistent reading - great habit!'
  },
  'streak-14': {
    name: 'Two Week Champion',
    description: 'Read for 14 consecutive days',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 200,
    category: 'streak',
    requirement: 'Read at least 1 article for 14 days in a row',
    tips: 'You\'re building a powerful habit!'
  },
  'streak-30': {
    name: 'Monthly Legend',
    description: 'Read for 30 consecutive days',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 500,
    category: 'streak',
    requirement: 'Read at least 1 article for 30 days in a row',
    tips: 'The ultimate achievement - a month of daily reading!'
  },
  'streak-100': {
    name: 'Unstoppable Force',
    description: 'Read for 100 consecutive days',
    icon: Zap,
    color: 'from-purple-600 to-pink-600',
    rarity: 'mythic',
    points: 2000,
    category: 'streak',
    requirement: 'Read at least 1 article for 100 days in a row',
    tips: 'Your dedication is legendary!'
  },

  // === SOCIAL ACHIEVEMENTS (Sharing & Engagement) ===
  'first-share': {
    name: 'Generous Soul',
    description: 'Share your first article',
    icon: Gift,
    color: 'from-pink-400 to-rose-500',
    rarity: 'common',
    points: 15,
    category: 'social',
    requirement: 'Share 1 article',
    tips: 'Spread the knowledge! Share what you love.'
  },
  'sharer-10': {
    name: 'Knowledge Spreader',
    description: 'Share 10 articles',
    icon: TrendingUp,
    color: 'from-blue-400 to-cyan-500',
    rarity: 'rare',
    points: 100,
    category: 'social',
    requirement: 'Share 10 articles',
    tips: 'You\'re helping others discover great content!'
  },
  'sharer-25': {
    name: 'Community Champion',
    description: 'Share 25 articles',
    icon: Medal,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 250,
    category: 'social',
    requirement: 'Share 25 articles',
    tips: 'Your recommendations are valuable!'
  },
  'sharer-50': {
    name: 'Influence Master',
    description: 'Share 50 articles',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 600,
    category: 'social',
    requirement: 'Share 50 articles',
    tips: 'You\'re a true community leader!'
  },

  // === EXPLORER ACHIEVEMENTS (Swipe Mode) ===
  'swiper-10': {
    name: 'Explorer Novice',
    description: 'Swipe through 10 articles',
    icon: Target,
    color: 'from-cyan-400 to-blue-500',
    rarity: 'common',
    points: 20,
    category: 'explorer',
    requirement: 'Swipe 10 articles',
    tips: 'Keep exploring to find your perfect matches!'
  },
  'swiper-50': {
    name: 'Discovery Hunter',
    description: 'Swipe through 50 articles',
    icon: Award,
    color: 'from-blue-400 to-purple-500',
    rarity: 'rare',
    points: 80,
    category: 'explorer',
    requirement: 'Swipe 50 articles',
    tips: 'You\'re getting good at finding great content!'
  },
  'swiper-100': {
    name: 'Swipe Master',
    description: 'Swipe through 100 articles',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 200,
    category: 'explorer',
    requirement: 'Swipe 100 articles',
    tips: 'You know what you like!'
  },
  'matches-10': {
    name: 'Good Taste',
    description: 'Like 10 articles in swipe mode',
    icon: Sparkles,
    color: 'from-pink-400 to-rose-500',
    rarity: 'rare',
    points: 60,
    category: 'explorer',
    requirement: 'Like 10 articles',
    tips: 'Building your perfect reading list!'
  },

  // === CREATION ACHIEVEMENTS (Most Valuable!) ===
  'first-article': {
    name: 'Creator Awakened',
    description: 'Publish your first article',
    icon: Sparkles,
    color: 'from-emerald-400 to-teal-500',
    rarity: 'rare',
    points: 100,
    category: 'creation',
    requirement: 'Create 1 article',
    tips: 'Your voice matters! Share your thoughts with the world.'
  },
  'creator-5': {
    name: 'Rising Creator',
    description: 'Publish 5 articles',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 350,
    category: 'creation',
    requirement: 'Create 5 articles',
    tips: 'You\'re becoming a valued contributor!'
  },
  'creator-10': {
    name: 'Master Creator',
    description: 'Publish 10 articles',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 800,
    category: 'creation',
    requirement: 'Create 10 articles',
    tips: 'Your impact on the community is significant!'
  },
  'creator-25': {
    name: 'Content Titan',
    description: 'Publish 25 articles',
    icon: Zap,
    color: 'from-purple-600 to-pink-600',
    rarity: 'mythic',
    points: 2500,
    category: 'creation',
    requirement: 'Create 25 articles',
    tips: 'You\'re a pillar of the DEWII community!'
  },

  // === SPECIAL ACHIEVEMENTS (Unique Milestones) ===
  'points-500': {
    name: 'Point Collector',
    description: 'Earn 500 points',
    icon: Award,
    color: 'from-blue-400 to-cyan-500',
    rarity: 'rare',
    points: 50,
    category: 'special',
    requirement: 'Reach 500 total points',
    tips: 'Points reflect your engagement with DEWII!'
  },
  'points-1000': {
    name: 'Point Master',
    description: 'Earn 1000 points',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    points: 150,
    category: 'special',
    requirement: 'Reach 1000 total points',
    tips: 'You\'re making great progress!'
  },
  'points-5000': {
    name: 'Point Legend',
    description: 'Earn 5000 points',
    icon: Crown,
    color: 'from-amber-400 to-yellow-300',
    rarity: 'legendary',
    points: 500,
    category: 'special',
    requirement: 'Reach 5000 total points',
    tips: 'Elite status achieved!'
  },
  'completionist': {
    name: 'The Completionist',
    description: 'Unlock all other achievements',
    icon: Trophy,
    color: 'from-purple-600 to-pink-600',
    rarity: 'mythic',
    points: 5000,
    category: 'special',
    requirement: 'Unlock every achievement',
    tips: 'The ultimate DEWII master!'
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
  },
  mythic: {
    label: 'Mythic',
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    shadow: 'shadow-purple-700/50',
    border: 'border-purple-700/30',
    glow: 'bg-purple-700/20',
    textColor: 'text-purple-700 dark:text-purple-500'
  }
}

export function AchievementsPage({ progress, onBack, onProgressUpdate, accessToken }: AchievementsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reading' | 'streak' | 'social' | 'creation' | 'explorer' | 'special'>('all')
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(progress)

  // Sync local state when progress prop changes
  useEffect(() => {
    setCurrentProgress(progress)
  }, [progress])

  const handleClaimAchievements = async () => {
    setIsClaiming(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/claim-achievements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      console.log('Claim achievements response:', response.status, data)

      if (response.ok) {
        if (data.claimedCount > 0) {
          // Update local progress
          setCurrentProgress(data.progress)
          
          // Notify parent component
          if (onProgressUpdate) {
            onProgressUpdate(data.progress)
          }

          // Show success toasts for each new achievement
          data.newAchievements.forEach((achievement: any) => {
            toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
              description: `${achievement.description} (+${achievement.points} pts)`,
              duration: 5000
            })
          })

          toast.success(`Claimed ${data.claimedCount} achievement${data.claimedCount > 1 ? 's' : ''}!`, {
            description: `Check out your new rewards below!`,
            duration: 3000
          })
        } else {
          toast.info('No new achievements to claim', {
            description: 'Keep reading to unlock more!'
          })
        }
      } else {
        console.error('Failed to claim achievements:', data)
        toast.error('Failed to claim achievements', {
          description: data.error || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Error claiming achievements:', error)
      toast.error('Something went wrong', {
        description: 'Check console for details'
      })
    } finally {
      setIsClaiming(false)
    }
  }

  // Get unlocked achievements
  const unlockedAchievements = currentProgress.achievements
    .map(id => ({ id, ...achievementData[id] }))
    .filter(a => a.name)

  // Get locked achievements with progress
  const lockedAchievements = Object.keys(achievementData)
    .filter(id => !currentProgress.achievements.includes(id))
    .map(id => {
      const achievement = achievementData[id]
      let progressPercent = 0
      let progressText = ''
      
      if (achievement.category === 'reading') {
        const required = parseInt(id.split('-')[1])
        progressPercent = Math.min((currentProgress.totalArticlesRead / required) * 100, 100)
        progressText = `${currentProgress.totalArticlesRead}/${required}`
      } else if (achievement.category === 'streak') {
        const required = parseInt(id.split('-')[1])
        progressPercent = Math.min((currentProgress.currentStreak / required) * 100, 100)
        progressText = `${currentProgress.currentStreak}/${required}`
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
      {/* Hero Section - Updated Design */}
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
          {/* Top Section - Icon & Title */}
          <div className="flex items-center justify-between gap-6 flex-wrap mb-6">
            {/* Left: Icon Badge */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {/* Rotating glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-spin-slow" />
                
                {/* Main badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500 blur-xl opacity-75 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500 rounded-3xl p-6 transform group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Achievement Gallery
                  </h1>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Sparkles key={i} className="w-6 h-6 text-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
                <p className="text-xl text-muted-foreground">Unlock rewards and track your reading journey</p>
              </div>
            </div>

            {/* Right: Points Display */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative bg-muted/50 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-emerald-500/30 group-hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-sm text-muted-foreground">Points Earned</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      {totalPointsEarned}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Medal className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{unlockedAchievements.length}/{totalAchievements}</div>
              </div>
            </div>
            
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{Math.round(completionPercent)}%</div>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="font-bold text-foreground">{unlockedAchievements.length} of {totalAchievements} unlocked</span>
            </div>
            
            <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Progress fill */}
              <div 
                className="relative h-full bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${completionPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                {completionPercent > 10 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg">
                    {Math.round(completionPercent)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full h-auto">
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
              value="creation"
              onClick={() => setSelectedCategory('creation')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Creation
            </TabsTrigger>
            <TabsTrigger 
              value="social"
              onClick={() => setSelectedCategory('social')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger 
              value="explorer"
              onClick={() => setSelectedCategory('explorer')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Explorer
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
        </div>
      </Tabs>

      {/* Claim Achievements Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleClaimAchievements}
          disabled={isClaiming}
          size="lg"
          className="bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 hover:from-amber-500 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Gift className="w-5 h-5 mr-2" />
          {isClaiming ? 'Checking...' : 'Claim Eligible Achievements'}
        </Button>
      </div>

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
                  {/* Outer glow effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-br ${rarity.gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500 animate-pulse`} />
                  
                  <Card className={`relative overflow-hidden border-4 ${rarity.border} bg-gradient-to-br ${rarity.gradient} transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 shadow-2xl`}>
                    {/* Animated geometric background art */}
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Floating circles */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={`circle-${i}`}
                          className="absolute rounded-full bg-white/20"
                          style={{
                            width: `${30 + Math.random() * 80}px`,
                            height: `${30 + Math.random() * 80}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float-random-${i % 4} ${4 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        />
                      ))}
                      
                      {/* Animated lines */}
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={`line-${i}`}
                          className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          style={{
                            width: '150%',
                            left: '-25%',
                            top: `${i * 25}%`,
                            animation: `slide-horizontal ${3 + i}s linear infinite`,
                            animationDelay: `${i * 0.3}s`
                          }}
                        />
                      ))}
                      
                      {/* Rotating gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10 animate-spin-slow" />
                      
                      {/* Sparkle effect */}
                      {hoveredAchievement === achievement.id && (
                        <>
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={`sparkle-${i}`}
                              className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)'
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                    
                    <CardContent className="relative p-6 space-y-4 bg-card/90 backdrop-blur-sm">
                      {/* Rarity Badge with shine */}
                      <div className="flex items-center justify-between">
                        <Badge className={`relative overflow-hidden bg-white/95 text-transparent bg-clip-text bg-gradient-to-r ${rarity.gradient} border-2 ${rarity.border} ${rarity.shadow} shadow-xl font-bold`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                          <span className="relative">{rarity.label}</span>
                        </Badge>
                        <div className={`relative px-3 py-1 rounded-full bg-gradient-to-r ${rarity.gradient} border-2 border-white/50 shadow-lg`}>
                          <span className="text-sm font-bold text-white drop-shadow-lg">+{achievement.points} pts</span>
                        </div>
                      </div>

                      {/* Icon with elaborate animation */}
                      <div className="relative py-4">
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={`ring-${i}`}
                              className={`absolute w-20 h-20 rounded-full border-2 ${rarity.border} animate-ping`}
                              style={{
                                animationDuration: `${2 + i}s`,
                                animationDelay: `${i * 0.3}s`,
                                opacity: 0.3
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Main icon container */}
                        <div className="relative">
                          <div className={`absolute -inset-4 bg-gradient-to-br ${rarity.gradient} blur-2xl opacity-60 animate-pulse`} />
                          <div className={`relative w-24 h-24 mx-auto bg-gradient-to-br ${rarity.gradient} rounded-3xl flex items-center justify-center ${rarity.shadow} shadow-2xl border-4 border-white/30 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                            {/* Inner glow */}
                            <div className="absolute inset-2 bg-white/20 rounded-2xl blur-md" />
                            <Icon className="relative w-12 h-12 text-white drop-shadow-2xl animate-float" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2">
                        <h3 className={`text-2xl font-bold bg-gradient-to-br ${rarity.gradient} bg-clip-text text-transparent drop-shadow-sm`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-foreground/80 font-medium">
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

                      {/* Unlocked Badge with celebration animation */}
                      <div className={`relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${rarity.gradient} border-2 border-white/30 shadow-lg`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        <Sparkles className="relative w-5 h-5 text-white drop-shadow-lg animate-spin-slow" />
                        <span className="relative text-sm font-bold text-white drop-shadow-lg tracking-wider">✨ UNLOCKED ✨</span>
                        <Sparkles className="relative w-5 h-5 text-white drop-shadow-lg animate-spin-slow" style={{ animationDirection: 'reverse' }} />
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
        
        @keyframes float-random-0 {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes float-random-1 {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes float-random-2 {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes float-random-3 {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes slide-horizontal {
          0% { left: '-25%'; }
          100% { left: '125%'; }
        }
        
        @keyframes sparkle {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}