import { useState } from 'react'
import { Award, Book, Flame, TrendingUp, Trophy, Star, Zap, Crown, Target, Sparkles, Medal, Lock, Edit, Trash2, Eye, ChevronRight, Rocket, Activity, LogOut, Image as ImageIcon, Heart, Mail, Eye as EyeIcon, EyeOff, AlertCircle, BarChart3, BookOpen, Compass, Sun, Wand2, Atom, Gem, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { Input } from "./ui/input"
import { isFeatureUnlocked, FEATURE_UNLOCKS } from '../utils/featureUnlocks'
import { ComicLockOverlay } from './ComicLockOverlay'
import { BadgeDisplay } from './BadgeDisplay'

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
    type: 'youtube' | 'audio' | 'image' | 'pdf'
    url: string
    caption?: string
    title?: string
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
  nickname?: string
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
  onViewPointsSystem?: () => void
  onViewReadingAnalytics?: () => void
  onFeatureUnlock?: (featureId: 'reading-analytics') => void
  accessToken?: string
  equippedBadgeId?: string | null
  profileBannerUrl?: string | null
  userEmail?: string | null
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

export function UserDashboard({ progress, userArticles, onEditArticle, onDeleteArticle, onLogout, onViewReadingHistory, onViewMatches, matchesCount, onViewAchievements, onViewPointsSystem, onViewReadingAnalytics, onFeatureUnlock, accessToken, equippedBadgeId, profileBannerUrl, userEmail }: UserDashboardProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [fireIconClicked, setFireIconClicked] = useState(false)
  const [marketingNewsletter, setMarketingNewsletter] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState ('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [passwordChangeError, setPasswordChangeError] = useState('')
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  
  // Calculate user level based on XP from activities (NOT spendable points!)
  // XP is earned from permanent achievements and activities
  const calculateXP = () => {
    let xp = 0
    
    // Articles read: 50 XP each
    xp += progress.totalArticlesRead * 50
    
    // Achievements unlocked: 100 XP each (independent of their point value)
    xp += progress.achievements.length * 100
    
    // Longest streak: 30 XP per day
    xp += progress.longestStreak * 30
    
    // Articles shared: 20 XP each (if we track this)
    // We'll extract this from shareCount achievement progress
    const shareAchievements = ['first-share', 'sharer-10', 'sharer-25', 'sharer-50']
    const hasShares = shareAchievements.some(id => progress.achievements.includes(id))
    if (hasShares) {
      // Estimate based on achievements
      if (progress.achievements.includes('sharer-50')) xp += 50 * 20
      else if (progress.achievements.includes('sharer-25')) xp += 25 * 20
      else if (progress.achievements.includes('sharer-10')) xp += 10 * 20
      else if (progress.achievements.includes('first-share')) xp += 1 * 20
    }
    
    // Articles created: 150 XP each (premium activity!)
    const creatorAchievements = ['first-article', 'creator-5', 'creator-10', 'creator-25']
    const hasCreated = creatorAchievements.some(id => progress.achievements.includes(id))
    if (hasCreated) {
      // Estimate based on achievements
      if (progress.achievements.includes('creator-25')) xp += 25 * 150
      else if (progress.achievements.includes('creator-10')) xp += 10 * 150
      else if (progress.achievements.includes('creator-5')) xp += 5 * 150
      else if (progress.achievements.includes('first-article')) xp += 1 * 150
    }
    
    // Secret bonuses 🎁
    // Streak consistency bonus: Extra XP if current streak matches longest
    if (progress.currentStreak === progress.longestStreak && progress.currentStreak >= 7) {
      xp += progress.currentStreak * 10 // Consistency bonus!
    }
    
    // Completionist bonus: Massive XP if you have lots of achievements
    if (progress.achievements.length >= 30) xp += 1000 // Elite player
    else if (progress.achievements.length >= 20) xp += 500
    else if (progress.achievements.length >= 10) xp += 200
    
    // Early adopter secret bonus (if they have certain special achievements)
    if (progress.achievements.includes('completionist')) xp += 5000
    
    return xp
  }
  
  // Calculate level from XP using a curve (gets harder as you level up)
  const calculateLevelFromXP = (xp: number) => {
    // Exponential curve: each level requires more XP
    // Level 1: 0 XP
    // Level 2: 100 XP
    // Level 3: 300 XP
    // Level 4: 600 XP
    // Level 5: 1000 XP
    // Formula: XP needed = (level * level * 50)
    
    let level = 1
    let xpNeeded = 0
    
    while (xpNeeded <= xp) {
      level++
      xpNeeded += level * level * 50
    }
    
    return level - 1
  }
  
  const totalXP = calculateXP()
  const level = Math.max(1, calculateLevelFromXP(totalXP))
  
  // Calculate XP to next level
  const xpForCurrentLevel = Array.from({ length: level }, (_, i) => (i + 1) * (i + 1) * 50).reduce((a, b) => a + b, 0)
  const xpForNextLevel = xpForCurrentLevel + ((level + 1) * (level + 1) * 50)
  const xpToNextLevel = xpForNextLevel - totalXP
  const levelProgress = ((totalXP - xpForCurrentLevel) / ((level + 1) * (level + 1) * 50)) * 100

  // Get level title
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 50) return '💎 Cosmic Visionary'
    if (lvl >= 40) return '🌌 Quantum Scholar'
    if (lvl >= 30) return '🔮 Mythic Sage'
    if (lvl >= 25) return '⚡ Solar Champion'
    if (lvl >= 20) return '🌟 Legendary Scholar'
    if (lvl >= 15) return '👑 Master Reader'
    if (lvl >= 10) return '⚡ Expert Explorer'
    if (lvl >= 5) return '📚 Avid Learner'
    return '✨ Knowledge Seeker'
  }

  // Get level avatar configuration (icon, colors, sparkle color)
  const getLevelConfig = (lvl: number) => {
    if (lvl >= 50) {
      return {
        icon: Gem,
        bgGradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
        glowColor: 'from-violet-400 via-purple-500 to-fuchsia-500',
        blurColor: 'from-violet-400 to-fuchsia-600',
        borderColor: 'border-violet-500/30',
        sparkleColor: 'text-violet-500',
        progressGradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
        progressShadow: 'shadow-violet-500/50',
        particleColor: 'bg-violet-400/30'
      }
    }
    if (lvl >= 40) {
      return {
        icon: Atom,
        bgGradient: 'from-cyan-400 via-blue-500 to-indigo-600',
        glowColor: 'from-cyan-400 via-blue-500 to-indigo-500',
        blurColor: 'from-cyan-400 to-indigo-600',
        borderColor: 'border-cyan-500/30',
        sparkleColor: 'text-cyan-500',
        progressGradient: 'from-cyan-400 via-blue-500 to-indigo-500',
        progressShadow: 'shadow-cyan-500/50',
        particleColor: 'bg-cyan-400/30'
      }
    }
    if (lvl >= 30) {
      return {
        icon: Wand2,
        bgGradient: 'from-fuchsia-400 via-pink-500 to-purple-600',
        glowColor: 'from-fuchsia-400 via-pink-500 to-purple-500',
        blurColor: 'from-fuchsia-400 to-purple-600',
        borderColor: 'border-fuchsia-500/30',
        sparkleColor: 'text-fuchsia-500',
        progressGradient: 'from-fuchsia-400 via-pink-500 to-purple-500',
        progressShadow: 'shadow-fuchsia-500/50',
        particleColor: 'bg-fuchsia-400/30'
      }
    }
    if (lvl >= 25) {
      return {
        icon: Sun,
        bgGradient: 'from-orange-400 via-yellow-500 to-amber-600',
        glowColor: 'from-orange-400 via-yellow-500 to-amber-500',
        blurColor: 'from-orange-400 to-amber-600',
        borderColor: 'border-orange-500/30',
        sparkleColor: 'text-orange-500',
        progressGradient: 'from-orange-400 via-yellow-500 to-amber-500',
        progressShadow: 'shadow-orange-500/50',
        particleColor: 'bg-orange-400/30'
      }
    }
    if (lvl >= 20) {
      return {
        icon: Crown,
        bgGradient: 'from-amber-400 via-orange-500 to-red-500',
        glowColor: 'from-amber-400 via-orange-500 to-red-500',
        blurColor: 'from-amber-400 to-orange-600',
        borderColor: 'border-amber-500/30',
        sparkleColor: 'text-amber-500',
        progressGradient: 'from-amber-400 via-orange-500 to-red-500',
        progressShadow: 'shadow-orange-500/50',
        particleColor: 'bg-amber-400/30'
      }
    }
    if (lvl >= 15) {
      return {
        icon: Medal,
        bgGradient: 'from-violet-400 via-purple-500 to-indigo-600',
        glowColor: 'from-violet-400 via-purple-500 to-indigo-500',
        blurColor: 'from-violet-400 to-indigo-600',
        borderColor: 'border-violet-500/30',
        sparkleColor: 'text-violet-500',
        progressGradient: 'from-violet-400 via-purple-500 to-indigo-500',
        progressShadow: 'shadow-violet-500/50',
        particleColor: 'bg-violet-400/30'
      }
    }
    if (lvl >= 10) {
      return {
        icon: Compass,
        bgGradient: 'from-indigo-400 via-purple-500 to-violet-600',
        glowColor: 'from-indigo-400 via-purple-500 to-violet-500',
        blurColor: 'from-indigo-400 to-violet-600',
        borderColor: 'border-indigo-500/30',
        sparkleColor: 'text-indigo-500',
        progressGradient: 'from-indigo-400 via-purple-500 to-violet-500',
        progressShadow: 'shadow-indigo-500/50',
        particleColor: 'bg-indigo-400/30'
      }
    }
    if (lvl >= 5) {
      return {
        icon: BookOpen,
        bgGradient: 'from-blue-400 via-cyan-500 to-sky-600',
        glowColor: 'from-blue-400 via-cyan-500 to-sky-500',
        blurColor: 'from-blue-400 to-sky-600',
        borderColor: 'border-blue-500/30',
        sparkleColor: 'text-blue-500',
        progressGradient: 'from-blue-400 via-cyan-500 to-sky-500',
        progressShadow: 'shadow-blue-500/50',
        particleColor: 'bg-blue-400/30'
      }
    }
    // Level 1-4: Knowledge Seeker
    return {
      icon: Book,
      bgGradient: 'from-emerald-400 via-green-500 to-teal-600',
      glowColor: 'from-emerald-400 via-green-500 to-teal-500',
      blurColor: 'from-emerald-400 to-teal-600',
      borderColor: 'border-emerald-500/30',
      sparkleColor: 'text-emerald-500',
      progressGradient: 'from-emerald-400 via-green-500 to-teal-500',
      progressShadow: 'shadow-emerald-500/50',
      particleColor: 'bg-emerald-400/30'
    }
  }

  const levelConfig = getLevelConfig(level)
  const LevelIcon = levelConfig.icon

  return (
    <div className="space-y-8">
      {/* PROFILE BANNER WITH FLOATING BUSINESS CARD */}
      <div className="relative overflow-hidden rounded-3xl min-h-[400px] flex items-end pb-8">
        {/* Banner Background */}
        {profileBannerUrl ? (
          <>
            <img
              src={profileBannerUrl}
              alt="Profile Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
          </>
        ) : (
          // Default gradient if no banner
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
        )}

        {/* Floating Business Card */}
        <div className="relative w-full px-6">
          <div className="max-w-2xl mx-auto">
            {/* Glass morphism card */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Main card */}
              <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Avatar with badge */}
                  <div className="relative flex-shrink-0">
                    {/* Avatar glow */}
                    <div className="absolute -inset-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-xl opacity-50" />
                    
                    {/* Avatar container */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Equipped Badge - positioned at bottom right */}
                    {equippedBadgeId && (
                      <div className="absolute -bottom-2 -right-2 transform scale-90">
                        <BadgeDisplay
                          badgeId={equippedBadgeId}
                          size="md"
                          equipped={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold text-white mb-1 truncate">
                      {progress.nickname || 'Hemp Pioneer'}
                    </h2>
                    {userEmail && (
                      <p className="text-white/70 text-sm truncate mb-3">
                        {userEmail}
                      </p>
                    )}
                    
                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2">
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-semibold text-sm">{progress.points.toLocaleString()} XP</span>
                      </div>
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-semibold text-sm">{progress.totalArticlesRead} articles</span>
                      </div>
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-semibold text-sm">{progress.currentStreak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ULTRA HERO LEVEL CARD */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated gradient background - Dynamic based on level */}
        <div className={`absolute inset-0 bg-gradient-to-br ${levelConfig.glowColor.replace('from-', 'from-').replace(' via-', '/20 via-').replace(' to-', '/20 to-')}/20 animate-gradient-xy`} />
        
        {/* Floating particles effect - Dynamic color */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${levelConfig.particleColor} rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className={`relative backdrop-blur-xl bg-card/80 ${levelConfig.borderColor} rounded-3xl p-8 shadow-2xl`}>
          <div className="flex items-center gap-6 flex-wrap">
            {/* Dynamic Avatar with Level Badge */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {/* Rotating glow ring - Dynamic colors */}
                <div className={`absolute -inset-4 bg-gradient-to-r ${levelConfig.glowColor} rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-spin-slow`} />
                
                {/* Main badge - Dynamic colors */}
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${levelConfig.blurColor} blur-xl opacity-75 animate-pulse`} />
                  <div className={`relative bg-gradient-to-br ${levelConfig.bgGradient} rounded-3xl p-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <LevelIcon className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Level number badge */}
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg border-4 border-card shadow-xl transform group-hover:scale-110 transition-transform">
                    {level}
                  </div>
                </div>
              </div>
              
              {/* Three sparkles below the badge - Dynamic color */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Sparkles key={i} className={`w-5 h-5 ${levelConfig.sparkleColor} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              
              {/* Equipped Badge Display */}
              {equippedBadgeId && (
                <div className="mt-3">
                  <BadgeDisplay
                    badgeId={equippedBadgeId}
                    size="lg"
                    equipped={true}
                  />
                </div>
              )}
            </div>
            
            {/* XP Display and Progress Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* XP Counter Pill */}
                <div className="relative group/xp">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-md" />
                  <div className="relative bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-xl px-5 py-2.5 border-2 border-purple-500/30 group-hover/xp:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-purple-500" />
                      <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {totalXP.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar - Clean with no labels, Dynamic colors */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Progress fill with neon glow - Dynamic gradient */}
              <div 
                className={`relative h-full bg-gradient-to-r ${levelConfig.progressGradient} transition-all duration-1000 ease-out rounded-full shadow-lg ${levelConfig.progressShadow}`}
                style={{ width: `${Math.max(0, Math.min(100, levelProgress))}%` }}
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
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredStat('currentStreak')}
                onMouseLeave={() => {
                  setHoveredStat(null)
                  setFireIconClicked(false)
                }}
                onClick={() => setFireIconClicked(!fireIconClicked)}
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
                    
                    {/* Animated label - shows on hover (desktop) or click (mobile) */}
                    <div 
                      className={`text-xs font-medium text-orange-600 dark:text-orange-400 text-center transition-all duration-300 ${
                        hoveredStat === 'currentStreak' || fireIconClicked 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      Day Streak
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Best Streak */}
              <div 
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredStat('bestStreak')}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={onViewPointsSystem}
                title="Click to view Points System"
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
                    {/* Add label for clarity */}
                    <div className="text-xs text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      View Points System
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
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-emerald-500/40 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 h-full">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-transparent rounded-bl-full" />
            
            {/* Animated rays */}
            {hoveredStat === 'articles' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <Book className="relative w-10 h-10 text-emerald-500 drop-shadow-lg" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {progress.totalArticlesRead}
              </div>
              {/* Two-line hover label */}
              <div className={`text-xs font-medium text-emerald-600 dark:text-emerald-400 text-center transition-all duration-300 ${
                hoveredStat === 'articles' 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}>
                <div>Articles</div>
                <div>Read</div>
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
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-pink-500/40 overflow-hidden transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 h-full">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-transparent rounded-bl-full" />
            
            {/* Animated rays */}
            {hoveredStat === 'matches' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full" />
                <Heart className="relative w-10 h-10 text-pink-500 drop-shadow-lg fill-pink-500" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-pink-500 to-rose-500 bg-clip-text text-transparent">
                {matchesCount || 0}
              </div>
              {/* Two-line hover label */}
              <div className={`text-xs font-medium text-pink-600 dark:text-pink-400 text-center transition-all duration-300 ${
                hoveredStat === 'matches' 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}>
                <div>Reading</div>
                <div>Matches</div>
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
          title="Click to view Achievements"
        >
          <div className={`absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-all duration-300 ${hoveredStat === 'achievements' ? 'animate-pulse' : ''}`} />
          
          <Card className="relative bg-card/90 backdrop-blur-sm border-2 border-purple-500/40 overflow-hidden transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-transparent rounded-bl-full" />
            
            {hoveredStat === 'achievements' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400/20 rounded-full animate-ping" />
              </div>
            )}
            
            <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                <Medal className="relative w-10 h-10 text-purple-500 drop-shadow-lg" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {progress.achievements.length}
              </div>
              {/* Two-line hover label */}
              <div className={`text-xs font-medium text-purple-600 dark:text-purple-400 text-center transition-all duration-300 ${
                hoveredStat === 'achievements' 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}>
                <div>View</div>
                <div>Achievements</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reading Analytics Card - Gated at 50 articles */}
      <div 
        className="relative overflow-hidden rounded-3xl cursor-pointer group"
        onClick={() => {
          const analyticsUnlocked = isFeatureUnlocked('reading-analytics', progress.totalArticlesRead)
          
          if (!analyticsUnlocked && onFeatureUnlock) {
            onFeatureUnlock('reading-analytics')
            return
          }
          
          if (onViewReadingAnalytics) {
            onViewReadingAnalytics()
          }
        }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 animate-gradient-xy" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Comic Lock Overlay - Show when locked */}
        {!isFeatureUnlocked('reading-analytics', progress.totalArticlesRead) && (
          <ComicLockOverlay 
            articlesNeeded={FEATURE_UNLOCKS['reading-analytics'].requiredArticles - progress.totalArticlesRead} 
          />
        )}

        <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-blue-500/30 group-hover:border-blue-500/50 rounded-3xl shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between gap-6">
              {/* Left: Icon and Text */}
              <div className="flex items-center gap-6 flex-1">
                {/* Icon */}
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 blur-xl opacity-50 group-hover:opacity-75 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/50">
                    <BarChart3 className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      📊 Reading Analytics
                    </h3>
                    {isFeatureUnlocked('reading-analytics', progress.totalArticlesRead) && (
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Deep insights into your reading habits with charts, graphs, and detailed statistics
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Activity className="w-3 h-3" />
                      <span>Activity Charts</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>Reading Velocity</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <Target className="w-3 h-3" />
                      <span>Milestones</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: CTA Arrow */}
              <div className="flex items-center">
                <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/30 group-hover:border-blue-500/50 group-hover:bg-blue-500/20 transition-all">
                  <ChevronRight className="w-8 h-8 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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