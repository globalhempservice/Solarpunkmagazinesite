import { Home, User, Plus, Heart, X, RefreshCw, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { motion } from 'motion/react'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from '../utils/featureUnlocks'

interface BottomNavbarProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'swipe'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor' | 'swipe') => void
  isAuthenticated: boolean
  totalArticlesRead?: number
  onFeatureUnlock?: (featureId: 'article-creation') => void
  exploreMode?: 'grid' | 'swipe'
  swipeControls?: {
    onSkip: () => void
    onMatch: () => void
    onReset: () => void
    isAnimating: boolean
  }
  closeWallet?: () => void
}

export function BottomNavbar({ currentView, onNavigate, isAuthenticated, totalArticlesRead = 0, onFeatureUnlock, exploreMode, swipeControls, closeWallet }: BottomNavbarProps) {
  if (!isAuthenticated) return null

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor' | 'swipe') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    closeWallet?.()
    onNavigate(view)
  }

  const isArticleCreationUnlocked = isFeatureUnlocked('article-creation', totalArticlesRead)
  const articlesNeeded = FEATURE_UNLOCKS['article-creation'].requiredArticles - totalArticlesRead

  // Always show the standard navbar - swipe controls are now in the page itself
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-24 flex items-end justify-center px-4">
        <div className="relative h-24 flex items-end justify-center w-full">
          {/* Gradient blur mask: 100% blur at bottom, 0% blur at top where it connects to content */}
          <div 
            className="absolute inset-0 backdrop-blur-2xl pointer-events-auto"
            style={{
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
              maskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
            }}
          />

          {/* Navigation Items */}
          <div className="relative flex items-center justify-center w-full max-w-md mx-auto pointer-events-auto h-full pb-4">
            {/* Left Button - Explore (Home) - Emerald Green */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('feed')}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-20 h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95"
              >
                <div className="relative">
                  {/* Animated glow background - Emerald */}
                  <div className={`absolute -inset-8 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full blur-3xl transition-all duration-500 ${
                    currentView === 'feed' 
                      ? 'opacity-30 animate-pulse' 
                      : 'opacity-10 group-hover:opacity-20'
                  }`} />
                  
                  {/* Circle background with gradient */}
                  <div className={`relative rounded-full p-5 transition-all group-hover:scale-110 ${
                    currentView === 'feed'
                      ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-br from-emerald-500/80 via-teal-500/80 to-emerald-500/80 group-hover:from-emerald-400 group-hover:via-teal-500 group-hover:to-emerald-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  }`}>
                    {/* Shine effect */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/40 rounded-full blur-md" />
                    
                    <Home 
                      className="relative h-10 w-10 text-white drop-shadow-lg"
                      strokeWidth={currentView === 'feed' ? 3 : 2.5} 
                    />
                  </div>
                </div>
              </Button>
            </div>

            {/* Center Button - Me (Elevated & Larger) - Purple/Pink Gradient */}
            <div className="flex-1 flex justify-center items-center -mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('dashboard')}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full relative focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-95"
              >
                <div className="relative">
                  {/* Animated glow background - Purple/Pink */}
                  <div className={`absolute -inset-10 bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 rounded-full blur-3xl transition-all duration-500 ${
                    currentView === 'dashboard' 
                      ? 'opacity-30 animate-pulse' 
                      : 'opacity-10 group-hover:opacity-20'
                  }`} />
                  
                  {/* Circle background with gradient */}
                  <div className={`relative rounded-full p-6 transition-all group-hover:scale-110 ${
                    currentView === 'dashboard'
                      ? 'bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 dark:from-sky-400 dark:via-purple-400 dark:to-pink-400 hempin:from-amber-500 hempin:via-yellow-500 hempin:to-amber-500 shadow-[0_0_24px_rgba(168,85,247,0.5)]'
                      : 'bg-gradient-to-br from-sky-500/80 via-purple-500/80 to-pink-500/80 dark:from-sky-400/80 dark:via-purple-400/80 dark:to-pink-400/80 hempin:from-amber-500/80 hempin:via-yellow-500/80 hempin:to-amber-500/80 group-hover:from-sky-500 group-hover:via-purple-500 group-hover:to-pink-500 group-hover:shadow-[0_0_24px_rgba(168,85,247,0.4)]'
                  }`}>
                    {/* Shine effect */}
                    <div className="absolute top-3 right-3 w-10 h-10 bg-white/40 rounded-full blur-md" />
                    
                    <User 
                      className="relative h-12 w-12 text-white drop-shadow-lg"
                      strokeWidth={currentView === 'dashboard' ? 3 : 2.5}
                    />
                  </div>
                </div>
                
                {/* Active indicator dot */}
                {currentView === 'dashboard' && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-sky-500 to-pink-500 dark:from-sky-400 dark:to-pink-400 hempin:from-amber-500 hempin:to-yellow-500 shadow-lg" />
                  </div>
                )}
              </Button>
            </div>

            {/* Right Button - Create (Plus) - Emerald/Teal (matching CREATE card) - LOCKED at 25 articles */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isArticleCreationUnlocked) {
                    handleNavigate('editor')
                  } else if (onFeatureUnlock) {
                    onFeatureUnlock('article-creation')
                  }
                }}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-20 h-20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 active:scale-95"
              >
                <div className="relative">
                  {/* Unlocked State - Normal Plus Icon */}
                  {isArticleCreationUnlocked && (
                    <>
                      {/* Animated glow background - Teal/Cyan */}
                      <div className={`absolute -inset-8 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full blur-3xl transition-all duration-500 ${
                        currentView === 'editor' 
                          ? 'opacity-30 animate-pulse' 
                          : 'opacity-10 group-hover:opacity-20'
                      }`} />
                      
                      {/* Circle background with gradient */}
                      <div className={`relative rounded-full p-5 transition-all group-hover:scale-110 ${
                        currentView === 'editor'
                          ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'bg-gradient-to-br from-emerald-500/80 via-teal-500/80 to-cyan-500/80 group-hover:from-emerald-400 group-hover:via-teal-500 group-hover:to-cyan-500 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                      }`}>
                        {/* Shine effect */}
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white/40 rounded-full blur-md" />
                        
                        <Plus 
                          className="relative h-10 w-10 text-white drop-shadow-lg"
                          strokeWidth={currentView === 'editor' ? 3 : 2.5} 
                        />
                      </div>
                    </>
                  )}

                  {/* Locked State - Comic Lock */}
                  {!isArticleCreationUnlocked && (
                    <>
                      {/* Outer glow ring - pulsing */}
                      <div className="absolute -inset-8 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full opacity-30 blur-xl animate-pulse" />
                      
                      {/* Comic burst effect behind - rotating */}
                      <motion.div 
                        className="absolute inset-0 -z-10 scale-150"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        <svg viewBox="0 0 100 100" className="w-24 h-24 -translate-x-1/4 -translate-y-1/4">
                          <defs>
                            <radialGradient id="navBurstGradient">
                              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          {[...Array(12)].map((_, i) => (
                            <polygon
                              key={i}
                              points="50,50 48,30 52,30"
                              fill="url(#navBurstGradient)"
                              transform={`rotate(${i * 30} 50 50)`}
                            />
                          ))}
                        </svg>
                      </motion.div>

                      {/* Main lock badge with comic border */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8, bounce: 0.6 }}
                        className="relative"
                      >
                        {/* White comic-style border */}
                        <div className="absolute -inset-0.5 bg-white rounded-xl transform rotate-2" />
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl" />
                        
                        {/* Inner content */}
                        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-lg p-3 shadow-2xl border-2 border-white">
                          {/* Lock icon with shake animation */}
                          <motion.div
                            animate={{ 
                              rotate: [0, -8, 8, -8, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 2
                            }}
                            className="mb-1"
                          >
                            <div className="relative">
                              <div className="absolute inset-0 bg-white blur-sm opacity-50" />
                              <Lock className="w-7 h-7 text-white relative z-10 drop-shadow-lg" strokeWidth={3} />
                            </div>
                          </motion.div>
                          
                          {/* Number badge */}
                          <div className="bg-white rounded px-1.5 py-0.5 shadow-inner min-w-[28px]">
                            <div className="text-center">
                              <div className="text-xs font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text leading-none">
                                {articlesNeeded}
                              </div>
                            </div>
                          </div>

                          {/* Comic "!" decoration */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform rotate-12">
                            <span className="text-white text-[10px] font-black leading-none">!</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Floating particles */}
                      <div className="absolute inset-0 pointer-events-none scale-150">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                            style={{
                              left: `${Math.cos((i * Math.PI * 2) / 4) * 40 + 50}%`,
                              top: `${Math.sin((i * Math.PI * 2) / 4) * 40 + 50}%`,
                            }}
                            animate={{
                              y: [-8, 8, -8],
                              opacity: [0.4, 1, 0.4],
                              scale: [0.6, 1, 0.6]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}