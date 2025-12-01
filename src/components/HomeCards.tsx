import { Badge } from './ui/badge'
import { Heart, Zap, BookOpen, Search, Filter, Sparkles, RefreshCw, Flame, TrendingUp, Users, Trophy, Plus, Store } from 'lucide-react'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from '../utils/featureUnlocks'
import { ComicLockOverlay } from './ComicLockOverlay'
import { NadaLockOverlay } from './NadaLockOverlay'
import { MarketUnlockModal } from './MarketUnlockModal'
import { BudCharacter } from './BudCharacter'
import { BudModal } from './BudModal'
import { motion } from 'motion/react'
import { useState } from 'react'

// NADA Ripple Icon from Wallet
function NadaRippleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center droplet */}
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      
      {/* First ripple */}
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      
      {/* Second ripple */}
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      
      {/* Third ripple */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

interface HomeCardsProps {
  onArticleClick: (article: any) => void
  articles: any[]
  userProgress?: any
  matchedArticles?: any[]
  onNavigateToBrowse?: () => void
  onNavigateToAchievements?: () => void
  onNavigateToSwipe?: () => void
  onNavigateToEditor?: () => void
  onFeatureUnlock?: (featureId: string) => void
  setPreviousView?: (view: string) => void
  nadaPoints?: number
  marketUnlocked?: boolean
  onMarketUnlock?: () => Promise<void>
  onNavigateToMarket?: () => void
}

export function HomeCards({
  onArticleClick,
  articles,
  userProgress,
  matchedArticles = [],
  onNavigateToBrowse,
  onNavigateToAchievements,
  onNavigateToSwipe,
  onNavigateToEditor,
  onFeatureUnlock,
  setPreviousView,
  nadaPoints = 0,
  marketUnlocked = false,
  onMarketUnlock,
  onNavigateToMarket
}: HomeCardsProps) {
  const [isMarketUnlocking, setIsMarketUnlocking] = useState(false)
  const [showMarketInfo, setShowMarketInfo] = useState(false)

  // Calculate user level using same XP logic as UserDashboard
  const calculateXP = () => {
    if (!userProgress) return 0
    
    let xp = 0
    
    // Articles read: 50 XP each
    xp += userProgress.totalArticlesRead * 50
    
    // Achievements unlocked: 100 XP each
    xp += (userProgress.achievements?.length || 0) * 100
    
    // Longest streak: 30 XP per day
    xp += userProgress.longestStreak * 30
    
    // Articles shared: 20 XP each
    const shareAchievements = ['first-share', 'sharer-10', 'sharer-25', 'sharer-50']
    const hasShares = shareAchievements.some(id => userProgress.achievements?.includes(id))
    if (hasShares) {
      if (userProgress.achievements.includes('sharer-50')) xp += 50 * 20
      else if (userProgress.achievements.includes('sharer-25')) xp += 25 * 20
      else if (userProgress.achievements.includes('sharer-10')) xp += 10 * 20
      else if (userProgress.achievements.includes('first-share')) xp += 1 * 20
    }
    
    // Articles created: 150 XP each
    const creatorAchievements = ['first-article', 'creator-5', 'creator-10', 'creator-25']
    const hasCreated = creatorAchievements.some(id => userProgress.achievements?.includes(id))
    if (hasCreated) {
      if (userProgress.achievements.includes('creator-25')) xp += 25 * 150
      else if (userProgress.achievements.includes('creator-10')) xp += 10 * 150
      else if (userProgress.achievements.includes('creator-5')) xp += 5 * 150
      else if (userProgress.achievements.includes('first-article')) xp += 1 * 150
    }
    
    // Secret bonuses
    if (userProgress.currentStreak === userProgress.longestStreak && userProgress.currentStreak >= 7) {
      xp += userProgress.currentStreak * 10
    }
    
    if (userProgress.achievements?.length >= 30) xp += 1000
    else if (userProgress.achievements?.length >= 20) xp += 500
    else if (userProgress.achievements?.length >= 10) xp += 200
    
    if (userProgress.achievements?.includes('completionist')) xp += 5000
    
    return xp
  }
  
  const calculateLevelFromXP = (xp: number) => {
    let level = 1
    let xpNeeded = 0
    
    while (xpNeeded <= xp) {
      level++
      xpNeeded += level * level * 50
    }
    
    return level - 1
  }
  
  const totalXP = calculateXP()
  const userLevel = Math.max(1, calculateLevelFromXP(totalXP))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
      {/* 1. BROWSE ARTICLES - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigateToBrowse?.()}
        className="group relative overflow-hidden bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-500 rounded-3xl p-6 border-4 border-blue-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(99,102,241,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(99,102,241,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
      >
        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {/* Comic shine */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/40 rounded-full blur-md" />
        
        <div className="relative space-y-3 flex flex-col items-center">
          {/* Icon + Title Row - Centered */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white blur-xl opacity-50" />
              <BookOpen className="relative w-10 h-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
              textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
            }}>
              MAGAZINE
            </h3>
          </div>
          
          {/* Badge Row - Centered */}
          <div className="flex justify-center">
            <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-3 py-1 text-xs font-black">
              ARTICLES
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 2. YOUR PROGRESS - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigateToAchievements?.()}
        className="group relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 rounded-3xl p-6 border-4 border-amber-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(251,191,36,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(251,191,36,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
      >
        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {/* Comic shine */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/40 rounded-full blur-md" />
        
        <div className="relative space-y-3 flex flex-col items-center">
          {/* Icon + Title Row - Centered */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white blur-xl opacity-50" />
              <Sparkles className="relative w-10 h-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
              textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
            }}>
              PROGRESS
            </h3>
          </div>
          
          {/* Badge Row - Centered */}
          <div className="flex justify-center">
            <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-3 py-1 text-xs font-black">
              LEVEL {userLevel}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 3. SWIPE MODE - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const totalRead = userProgress?.totalArticlesRead || 0
          const swipeUnlocked = isFeatureUnlocked('swipe-mode', totalRead)
          
          if (!swipeUnlocked) {
            onFeatureUnlock?.('swipe-mode')
            return
          }
          
          setPreviousView?.('feed')
          onNavigateToSwipe?.()
        }}
        className="group relative overflow-hidden bg-gradient-to-br from-pink-400 via-rose-500 to-purple-500 rounded-3xl p-6 border-4 border-pink-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(236,72,153,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(236,72,153,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
      >
        {/* Lock overlay */}
        {!isFeatureUnlocked('swipe-mode', userProgress?.totalArticlesRead || 0) && (
          <ComicLockOverlay 
            articlesNeeded={FEATURE_UNLOCKS['swipe-mode'].requiredArticles - (userProgress?.totalArticlesRead || 0)} 
          />
        )}

        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-rose-500 to-purple-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {/* Comic shine */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/40 rounded-full blur-md" />
        
        <div className="relative space-y-3 flex flex-col items-center">
          {/* Icon + Title Row - Centered */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white blur-xl opacity-50" />
              <Heart className="relative w-10 h-10 text-white fill-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
              textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
            }}>
              SWIPE
            </h3>
          </div>
          
          {/* Badge Row - Centered */}
          <div className="flex justify-center">
            <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-3 py-1 text-xs font-black">
              {matchedArticles.length} MATCHES
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 4. CREATE ARTICLE - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const totalRead = userProgress?.totalArticlesRead || 0
          const createUnlocked = isFeatureUnlocked('article-creation', totalRead)
          
          if (!createUnlocked) {
            onFeatureUnlock?.('article-creation')
            return
          }
          
          onNavigateToEditor?.()
        }}
        className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl p-6 border-4 border-emerald-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(16,185,129,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(16,185,129,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
      >
        {/* Lock overlay */}
        {!isFeatureUnlocked('article-creation', userProgress?.totalArticlesRead || 0) && (
          <ComicLockOverlay 
            articlesNeeded={FEATURE_UNLOCKS['article-creation'].requiredArticles - (userProgress?.totalArticlesRead || 0)} 
          />
        )}

        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {/* Comic shine */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/40 rounded-full blur-md" />
        
        <div className="relative space-y-3 flex flex-col items-center">
          {/* Icon + Title Row - Centered */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white blur-xl opacity-50" />
              <Plus className="relative w-10 h-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
              textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
            }}>
              CREATE
            </h3>
          </div>
          
          {/* Badge Row - Centered */}
          <div className="flex justify-center">
            <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-3 py-1 text-xs font-black">
              IMPORT
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 5. COMMUNITY MARKET - TALL NADA Card (2x height) */}
      <motion.div 
        whileHover={{ scale: marketUnlocked ? 1.02 : 1.01 }}
        whileTap={{ scale: marketUnlocked ? 0.98 : 1 }}
        onClick={() => {
          if (marketUnlocked && onNavigateToMarket) {
            // Navigate to market if unlocked
            onNavigateToMarket()
          } else if (!marketUnlocked && onMarketUnlock) {
            // Show modal to confirm unlock
            setIsMarketUnlocking(true)
          }
        }}
        className={`group relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl p-12 border-4 border-violet-400/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(139,92,246,${marketUnlocked ? '0.5' : '0.4'})] lg:col-span-2 lg:row-span-2 transition-all ${
          marketUnlocked 
            ? 'opacity-100 cursor-pointer hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(139,92,246,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1'
            : 'cursor-pointer'
        }`}
      >
        {/* NADA Lock overlay - Custom ripple prana animation */}
        {!marketUnlocked && (
          <NadaLockOverlay 
            nadaRequired={10}
            nadaCurrent={nadaPoints}
          />
        )}

        {/* Badge - Shows either unlocked status or cost */}
        <div className="absolute top-6 right-6 z-10">
          {marketUnlocked ? (
            <Badge className="bg-violet-500/40 backdrop-blur-sm text-white border-2 border-violet-400/50 shadow-lg px-5 py-2.5 font-black text-base">
              UNLOCKED
            </Badge>
          ) : nadaPoints >= 10 ? (
            <Badge className="bg-white/40 backdrop-blur-sm text-white border-2 border-white/50 shadow-lg px-5 py-2.5 font-black text-base animate-pulse">
              CLICK TO UNLOCK
            </Badge>
          ) : (
            <Badge className="bg-white/40 backdrop-blur-sm text-white border-2 border-white/50 shadow-lg px-5 py-2.5 font-black text-base">
              10 NADA
            </Badge>
          )}
        </div>

        {/* BUD Helper - Top Left Corner - ONLY when unlocked */}
        {marketUnlocked && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMarketInfo(true)
            }}
            className="absolute top-6 left-6 z-10 group/bud"
            title="What is this?"
          >
            <BudCharacter size="sm" className="hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />
        
        {/* Glow effect - Purple comet colors */}
        <div className={`absolute -inset-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 rounded-3xl blur-2xl transition-opacity ${
          marketUnlocked ? 'opacity-30 group-hover:opacity-50' : 'opacity-20'
        }`} />
        
        {/* Comic shine */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/40 rounded-full blur-md" />
        
        <div className="relative flex flex-col items-center text-center h-full justify-center gap-6 pt-8">
          {/* Icon + Title Row - Smaller size */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white blur-xl opacity-50" />
              <Store className="relative w-12 h-12 text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
              textShadow: '4px 4px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
            }}>
              COMMUNITY
              <br />
              MARKET
            </h3>
          </div>
          
          {/* NADA Cost Badge - only when not unlocked */}
          {!marketUnlocked && (
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-white/30">
              <NadaRippleIcon className="w-8 h-8 text-white" />
              <span className="text-3xl font-black text-white drop-shadow-lg">10 NADA</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Market Unlock Modal */}
      {isMarketUnlocking && onMarketUnlock && (
        <MarketUnlockModal
          isOpen={isMarketUnlocking}
          onClose={() => setIsMarketUnlocking(false)}
          onConfirm={onMarketUnlock}
          nadaPoints={nadaPoints}
          cost={10}
        />
      )}

      {/* Market Info Modal */}
      {showMarketInfo && (
        <BudModal
          isOpen={showMarketInfo}
          onClose={() => setShowMarketInfo(false)}
          title="Community Market"
          description="The Community Market is a special feature that allows you to vote on new features, submit your own ideas, and help shape the future of DEWII. By unlocking this feature, you'll gain access to a platform where your voice matters and your contributions can make a difference."
          buttonText="Got it!"
        />
      )}
    </div>
  )
}