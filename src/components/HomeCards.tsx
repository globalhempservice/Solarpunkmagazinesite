import { Badge } from './ui/badge'
import { Heart, Zap, BookOpen, Search, Filter, Sparkles, RefreshCw, Flame, TrendingUp, Users, Trophy, Plus } from 'lucide-react'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from '../utils/featureUnlocks'
import { ComicLockOverlay } from './ComicLockOverlay'
import { NadaLockOverlay } from './NadaLockOverlay'
import { MarketUnlockModal } from './MarketUnlockModal'
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
  articles: any[]
  userProgress: any | null
  matchedArticles: any[]
  onNavigateToBrowse: () => void
  onNavigateToAchievements: () => void
  onNavigateToSwipe: () => void
  onNavigateToEditor: () => void
  onFeatureUnlock: (featureId: 'swipe-mode' | 'article-creation') => void
  setPreviousView: (view: 'feed' | 'swipe') => void
  nadaPoints?: number
  marketUnlocked?: boolean
  onMarketUnlock?: () => Promise<void>
  onNavigateToMarket?: () => void
}

export function HomeCards({
  articles,
  userProgress,
  matchedArticles,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* 1. BROWSE ARTICLES - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNavigateToBrowse}
        className="group relative overflow-hidden bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-500 rounded-3xl p-8 border-4 border-blue-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(99,102,241,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(99,102,241,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
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
        
        <div className="relative flex flex-col items-center text-center min-h-[140px] justify-center gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-50" />
            <BookOpen className="relative w-12 h-12 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
          </div>
          
          {/* Title */}
          <h3 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
            textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
          }}>
            MAGAZINE
          </h3>
          
          {/* Stat badge */}
          <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-4 py-1 text-sm font-black">
            ARTICLES
          </Badge>
          
          {/* Description */}
          <p className="text-white/90 font-bold text-sm drop-shadow-lg mt-1">
            Discover & Explore Content
          </p>
        </div>
      </motion.div>

      {/* 2. YOUR PROGRESS - Big Neon Button */}
      <motion.div 
        whileHover={{ scale: 1.03, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNavigateToAchievements}
        className="group relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 rounded-3xl p-8 border-4 border-amber-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(251,191,36,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(251,191,36,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
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
        
        <div className="relative flex flex-col items-center text-center min-h-[140px] justify-center gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-50" />
            <Sparkles className="relative w-12 h-12 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
          </div>
          
          {/* Title */}
          <h3 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
            textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
          }}>
            PROGRESS
          </h3>
          
          {/* Stat badge */}
          <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-4 py-1 text-sm font-black">
            LEVEL {Math.floor((userProgress?.points || 0) / 100) + 1}
          </Badge>
          
          {/* Description with stats - Using SVG icons */}
          <div className="flex items-center gap-4">
            {/* Achievements with Trophy icon */}
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white/90 font-black text-lg drop-shadow-lg">
                {userProgress?.achievements?.length || 0}
              </span>
            </div>
            {/* Streak with Flame icon */}
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <Flame className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white/90 font-black text-lg drop-shadow-lg">
                {userProgress?.currentStreak || 0}
              </span>
            </div>
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
            onFeatureUnlock('swipe-mode')
            return
          }
          
          setPreviousView('feed')
          onNavigateToSwipe()
        }}
        className="group relative overflow-hidden bg-gradient-to-br from-pink-400 via-rose-500 to-purple-500 rounded-3xl p-8 border-4 border-pink-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(236,72,153,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(236,72,153,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
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
        
        <div className="relative flex flex-col items-center text-center min-h-[140px] justify-center gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-50" />
            <Heart className="relative w-12 h-12 text-white fill-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
          </div>
          
          {/* Title */}
          <h3 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
            textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
          }}>
            SWIPE
          </h3>
          
          {/* Stat badge */}
          <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-4 py-1 text-sm font-black">
            {matchedArticles.length} MATCHES
          </Badge>
          
          {/* Description */}
          <p className="text-white/90 font-bold text-sm drop-shadow-lg mt-1">
            Your Reading List
          </p>
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
            onFeatureUnlock('article-creation')
            return
          }
          
          onNavigateToEditor()
        }}
        className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl p-8 border-4 border-emerald-300/50 shadow-[0_10px_0_rgba(0,0,0,0.2),0_0_40px_rgba(16,185,129,0.5)] cursor-pointer transition-all hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_0_60px_rgba(16,185,129,0.7)] active:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1"
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
        
        <div className="relative flex flex-col items-center text-center min-h-[140px] justify-center gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-50" />
            <Plus className="relative w-12 h-12 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" strokeWidth={3} />
          </div>
          
          {/* Title */}
          <h3 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
            textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
          }}>
            CREATE
          </h3>
          
          {/* Stat badge */}
          <Badge className="bg-white/30 backdrop-blur-sm text-white border-2 border-white/40 shadow-lg px-4 py-1 text-sm font-black">
            IMPORT
          </Badge>
          
          {/* Description */}
          <p className="text-white/90 font-bold text-sm drop-shadow-lg mt-1">
            Share Good Content
          </p>
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
        
        <div className="relative flex flex-col items-center text-center h-full justify-center gap-6">
          {/* NADA Ripple Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-2xl opacity-60" />
            <NadaRippleIcon className="relative w-20 h-20 text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]" />
          </div>
          
          {/* Title */}
          <h3 className="text-5xl lg:text-6xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.3)] tracking-tight" style={{
            textShadow: '4px 4px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
          }}>
            COMMUNITY
            <br />
            MARKET
          </h3>
          
          {/* NADA Cost Badge */}
          {!marketUnlocked && (
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-white/30">
              <NadaRippleIcon className="w-8 h-8 text-white" />
              <span className="text-3xl font-black text-white drop-shadow-lg">10 NADA</span>
            </div>
          )}
          
          {/* Description */}
          <div className="space-y-3 max-w-lg">
            <p className="text-white font-black text-lg drop-shadow-lg">
              Vote on Features • Submit Ideas • Shape DEWII's Future
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-white/90 font-bold text-sm">Vote</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-white/90 font-bold text-sm">Submit</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-white/90 font-bold text-sm">Shape</p>
              </div>
            </div>
          </div>
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
    </div>
  )
}