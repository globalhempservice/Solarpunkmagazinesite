import { Home, User, Plus, Heart, X, RefreshCw, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { isFeatureUnlocked } from '../utils/featureUnlocks'

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
}

export function BottomNavbar({ currentView, onNavigate, isAuthenticated, totalArticlesRead = 0, onFeatureUnlock, exploreMode, swipeControls }: BottomNavbarProps) {
  if (!isAuthenticated) return null

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor' | 'swipe') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onNavigate(view)
  }

  const isArticleCreationUnlocked = isFeatureUnlocked('article-creation', totalArticlesRead)

  // Always show the standard navbar - swipe controls are now in the page itself
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="relative h-24 flex items-end justify-center">
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
                  {/* Enhanced aura effect - ACTIVE */}
                  {currentView === 'editor' && isArticleCreationUnlocked && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/40 via-yellow-400/30 to-amber-400/40 rounded-full blur-2xl animate-pulse" />
                  )}
                  {/* Permanent subtle aura - INACTIVE */}
                  {currentView !== 'editor' && isArticleCreationUnlocked && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/15 via-yellow-400/10 to-amber-400/15 group-hover:from-amber-400/25 group-hover:via-yellow-400/20 group-hover:to-amber-400/25 rounded-full blur-xl transition-all duration-300" />
                  )}
                  {/* Locked aura effect - red/gray when locked */}
                  {!isArticleCreationUnlocked && (
                    <div className="absolute -inset-4 bg-gradient-to-br from-gray-400/15 via-gray-400/10 to-gray-400/15 group-hover:from-red-400/20 group-hover:via-orange-400/15 group-hover:to-red-400/20 rounded-full blur-xl transition-all duration-300" />
                  )}
                  <div className={`relative rounded-full p-4 transition-all ${
                    currentView === 'editor' && isArticleCreationUnlocked
                      ? 'bg-amber-500/20 scale-110 shadow-lg'
                      : !isArticleCreationUnlocked
                      ? 'bg-muted/50 hover:bg-muted/70 hover:scale-105'
                      : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
                  }`}>
                    {isArticleCreationUnlocked ? (
                      <Plus className="h-10 w-10 transition-transform" strokeWidth={currentView === 'editor' ? 3 : 2.5} />
                    ) : (
                      <Lock className="h-10 w-10 transition-transform text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}