import { Home, User, Plus, Heart, X, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

interface BottomNavbarProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor') => void
  isAuthenticated: boolean
  exploreMode?: 'grid' | 'swipe'
  swipeControls?: {
    onSkip: () => void
    onMatch: () => void
    onReset: () => void
    isAnimating: boolean
  }
}

export function BottomNavbar({ currentView, onNavigate, isAuthenticated, exploreMode, swipeControls }: BottomNavbarProps) {
  if (!isAuthenticated) return null

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onNavigate(view)
  }

  // Show swipe controls when in swipe mode on feed
  if (currentView === 'feed' && exploreMode === 'swipe' && swipeControls) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="relative h-32 flex items-end justify-center">
            {/* Arc Background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-auto">
              {/* SVG Arc Shape */}
              <svg
                className="absolute bottom-0 left-0 right-0 w-full h-28"
                viewBox="0 0 500 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="swipeNavGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" className="text-background/95" stopColor="currentColor" />
                    <stop offset="100%" className="text-background/98" stopColor="currentColor" />
                  </linearGradient>
                </defs>
                {/* Arc path with center curve */}
                <path
                  d="M 0,40 L 0,100 L 500,100 L 500,40 Q 500,35 495,32 L 320,32 Q 310,32 305,25 Q 280,0 250,0 Q 220,0 195,25 Q 190,32 180,32 L 5,32 Q 0,35 0,40 Z"
                  fill="url(#swipeNavGradient)"
                  className="drop-shadow-2xl"
                />
              </svg>
              
              {/* Backdrop blur overlay */}
              <div className="absolute inset-0 backdrop-blur-xl bg-background/40" style={{ 
                clipPath: 'polygon(0 40%, 0 100%, 100% 100%, 100% 40%, 64% 40%, 61% 25%, 58% 15%, 54% 8%, 50% 0%, 46% 8%, 42% 15%, 39% 25%, 36% 40%, 0 40%)'
              }} />
            </div>

            {/* Swipe Control Buttons */}
            <div className="relative flex items-center justify-center w-full max-w-md mx-auto pointer-events-auto h-full gap-8">
              {/* Skip Button - Left */}
              <div className="flex-1 flex justify-center items-center">
                <Button
                  onClick={swipeControls.onSkip}
                  disabled={swipeControls.isAnimating}
                  className="w-20 h-20 rounded-full border-4 border-red-500/40 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 p-0 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                >
                  {/* Animated glow */}
                  <div className="absolute -inset-2 bg-red-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <X className="w-11 h-11 text-red-500 relative z-10 transition-transform group-hover:rotate-90" strokeWidth={3} />
                </Button>
              </div>

              {/* Match Button - Center (Elevated & Larger) */}
              <div className="flex-1 flex justify-center items-center -mt-12">
                <Button
                  onClick={swipeControls.onMatch}
                  disabled={swipeControls.isAnimating}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 p-0 shadow-2xl shadow-emerald-500/50 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                >
                  {/* Large animated glow */}
                  <div className="absolute -inset-6 bg-gradient-to-br from-emerald-400/50 to-emerald-600/50 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                  
                  {/* Outer animated ring */}
                  <div className="absolute -inset-2 rounded-full border-4 border-emerald-400/30 group-hover:border-emerald-400/60 transition-all animate-ping" style={{ animationDuration: '2s' }} />
                  
                  <Heart className="w-16 h-16 text-white fill-white relative z-10 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                </Button>
              </div>

              {/* Reset Button - Right */}
              <div className="flex-1 flex justify-center items-center">
                <Button
                  onClick={swipeControls.onReset}
                  disabled={swipeControls.isAnimating}
                  className="w-20 h-20 rounded-full border-4 border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 p-0 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group relative"
                >
                  {/* Animated glow */}
                  <div className="absolute -inset-2 bg-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <RefreshCw className="w-10 h-10 text-primary relative z-10 transition-transform group-hover:rotate-180 duration-500" strokeWidth={3} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="relative h-24 flex items-end justify-center">
          {/* Arc Background */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-auto">
            {/* SVG Arc Shape */}
            <svg
              className="absolute bottom-0 left-0 right-0 w-full h-24"
              viewBox="0 0 500 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" className="text-background/95" stopColor="currentColor" />
                  <stop offset="100%" className="text-background/98" stopColor="currentColor" />
                </linearGradient>
              </defs>
              {/* Arc path with center curve */}
              <path
                d="M 0,40 L 0,100 L 500,100 L 500,40 Q 500,35 495,32 L 320,32 Q 310,32 305,25 Q 280,0 250,0 Q 220,0 195,25 Q 190,32 180,32 L 5,32 Q 0,35 0,40 Z"
                fill="url(#navGradient)"
                className="drop-shadow-2xl"
              />
            </svg>
            
            {/* Backdrop blur overlay */}
            <div className="absolute inset-0 backdrop-blur-xl bg-background/40" style={{ 
              clipPath: 'polygon(0 40%, 0 100%, 100% 100%, 100% 40%, 64% 40%, 61% 25%, 58% 15%, 54% 8%, 50% 0%, 46% 8%, 42% 15%, 39% 25%, 36% 40%, 0 40%)'
            }} />
          </div>

          {/* Navigation Items */}
          <div className="relative flex items-center justify-center w-full max-w-md mx-auto pointer-events-auto h-full">
            {/* Left Button - Explore */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('feed')}
                className={`flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-16 h-16 ${
                  currentView === 'feed'
                    ? 'text-emerald-600 dark:text-emerald-400 hempin:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  {currentView === 'feed' && (
                    <div className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-lg animate-pulse" />
                  )}
                  <div className={`relative rounded-full p-3 transition-all ${
                    currentView === 'feed'
                      ? 'bg-emerald-500/20 scale-110'
                      : 'hover:bg-muted/50 hover:scale-105'
                  }`}>
                    <Home className="h-9 w-9 transition-transform" strokeWidth={currentView === 'feed' ? 3 : 2.5} />
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

            {/* Right Button - Create */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('editor')}
                className={`flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full w-16 h-16 ${
                  currentView === 'editor'
                    ? 'text-amber-600 dark:text-amber-400 hempin:text-amber-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  {currentView === 'editor' && (
                    <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-lg animate-pulse" />
                  )}
                  <div className={`relative rounded-full p-3 transition-all ${
                    currentView === 'editor'
                      ? 'bg-amber-500/20 scale-110'
                      : 'hover:bg-muted/50 hover:scale-105'
                  }`}>
                    <Plus className="h-9 w-9 transition-transform" strokeWidth={currentView === 'editor' ? 3 : 2.5} />
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