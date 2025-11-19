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
            {/* Left Button - Explore (Home) - BIGGER with Aura */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('feed')}
                className={`flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-20 h-20 ${
                  currentView === 'feed'
                    ? 'text-emerald-600 dark:text-emerald-400 hempin:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  {/* Enhanced aura effect - ACTIVE */}
                  {currentView === 'feed' && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-emerald-400/40 rounded-full blur-2xl animate-pulse" />
                  )}
                  {/* Permanent subtle aura - INACTIVE */}
                  {currentView !== 'feed' && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-emerald-400/15 group-hover:from-emerald-400/25 group-hover:via-teal-400/20 group-hover:to-emerald-400/25 rounded-full blur-xl transition-all duration-300" />
                  )}
                  <div className={`relative rounded-full p-4 transition-all ${
                    currentView === 'feed'
                      ? 'bg-emerald-500/20 scale-110 shadow-lg'
                      : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
                  }`}>
                    <Home className="h-10 w-10 transition-transform" strokeWidth={currentView === 'feed' ? 3 : 2.5} />
                  </div>
                </div>
              </Button>
            </div>

            {/* Center Button - Me (Elevated & Larger) */}
            <div className="flex-1 flex justify-center items-center -mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('dashboard')}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full relative"
              >
                {/* Large glow effect */}
                {currentView === 'dashboard' && (
                  <div className="absolute -inset-6 bg-gradient-to-br from-sky-400/40 via-purple-400/30 to-pink-400/40 dark:from-sky-400/30 dark:via-purple-400/20 dark:to-pink-400/30 hempin:from-amber-400/40 hempin:via-yellow-400/30 hempin:to-amber-400/40 rounded-full blur-2xl animate-pulse" />
                )}
                
                {/* Outer ring */}
                <div className={`relative rounded-full p-1.5 transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 dark:from-sky-400 dark:via-purple-400 dark:to-pink-400 hempin:from-amber-500 hempin:via-yellow-500 hempin:to-amber-500 scale-110 shadow-2xl'
                    : 'bg-gradient-to-br from-muted/50 to-muted hover:from-muted hover:to-muted/80 hover:scale-105'
                }`}>
                  {/* Inner circle */}
                  <div className={`rounded-full p-5 transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-pink-500/30 dark:from-sky-400/20 dark:via-purple-400/15 dark:to-pink-400/20 hempin:from-amber-500/30 hempin:via-yellow-500/20 hempin:to-amber-500/30 backdrop-blur-sm'
                      : 'bg-background'
                  }`}>
                    <User 
                      className={`h-12 w-12 transition-all ${
                        currentView === 'dashboard'
                          ? 'text-sky-600 dark:text-sky-400 hempin:text-amber-400 drop-shadow-lg'
                          : 'text-muted-foreground'
                      }`}
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

            {/* Right Button - Create (Plus) - BIGGER with Aura - LOCKED at 25 articles */}
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
                className={`flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-20 h-20 ${
                  currentView === 'editor'
                    ? 'text-amber-600 dark:text-amber-400 hempin:text-amber-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  {/* Unlocked State - Normal Plus Icon */}
                  {isArticleCreationUnlocked && (
                    <>
                      {/* Enhanced aura effect - ACTIVE */}
                      {currentView === 'editor' && (
                        <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/40 via-yellow-400/30 to-amber-400/40 rounded-full blur-2xl animate-pulse" />
                      )}
                      {/* Permanent subtle aura - INACTIVE */}
                      {currentView !== 'editor' && (
                        <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/15 via-yellow-400/10 to-amber-400/15 group-hover:from-amber-400/25 group-hover:via-yellow-400/20 group-hover:to-amber-400/25 rounded-full blur-xl transition-all duration-300" />
                      )}
                      <div className={`relative rounded-full p-4 transition-all ${
                        currentView === 'editor'
                          ? 'bg-amber-500/20 scale-110 shadow-lg'
                          : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
                      }`}>
                        <Plus className="h-10 w-10 transition-transform" strokeWidth={currentView === 'editor' ? 3 : 2.5} />
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