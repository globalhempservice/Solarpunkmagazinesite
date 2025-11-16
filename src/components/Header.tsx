import { useState, useEffect } from 'react'
import { BrandLogo } from "./BrandLogo"
import { Sparkles, Grid, Flame, ArrowLeft, BookOpen, Settings, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'

interface HeaderProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'matched-articles' | 'achievements' | 'browse' | 'linkedin-importer' | 'settings'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor' | 'admin' | 'browse' | 'settings') => void
  isAuthenticated: boolean
  onLogout: () => void
  userPoints?: number
  exploreMode?: 'grid' | 'swipe'
  onSwitchToGrid?: () => void
  currentStreak?: number
  onBack?: () => void
  onPointsAnimationComplete?: () => void
}

type Theme = 'light' | 'dark' | 'hempin'

export function Header({ currentView, onNavigate, isAuthenticated, exploreMode, onSwitchToGrid, currentStreak, onBack, userPoints = 0, onPointsAnimationComplete }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isAnimating, setIsAnimating] = useState(false)
  const [previousPoints, setPreviousPoints] = useState(userPoints)
  const [pointsGained, setPointsGained] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)

  // Detect points change and trigger animation
  useEffect(() => {
    if (userPoints > previousPoints && previousPoints > 0) {
      const gained = userPoints - previousPoints
      setPointsGained(gained)
      setShowPointsAnimation(true)
      
      // Hide animation after delay
      setTimeout(() => {
        setShowPointsAnimation(false)
        if (onPointsAnimationComplete) {
          onPointsAnimationComplete()
        }
      }, 2000)
    }
    setPreviousPoints(userPoints)
  }, [userPoints])

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'hempin'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      }
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'hempin')
    
    // Apply new theme class
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'hempin']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    applyTheme(themeOrder[nextIndex])
    
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Get theme label with fun names
  const getThemeLabel = () => {
    switch(theme) {
      case 'light': return '☀️ Bright'
      case 'dark': return '🌱 Eco'
      case 'hempin': return '🌿 Hemp'
      default: return '☀️ Bright'
    }
  }

  // Get theme colors for the glow effect
  const getThemeGlow = () => {
    switch(theme) {
      case 'light': return 'from-sky-400 to-blue-500'
      case 'dark': return 'from-emerald-400 to-teal-500'
      case 'hempin': return 'from-amber-400 to-orange-500'
      default: return 'from-sky-400 to-blue-500'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Back Button OR Streak Badge */}
        <div className="flex-1 flex items-center">
          {/* Back button for sub-pages */}
          {(currentView === 'reading-history' || currentView === 'matched-articles' || currentView === 'achievements' || currentView === 'article') && onBack && (
            <Button
              onClick={onBack}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          
          {/* Streak badge in swipe mode */}
          {currentView === 'feed' && exploreMode === 'swipe' && currentStreak !== undefined && (
            <Badge
              variant="secondary"
              className="gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400 animate-pulse"
            >
              <Flame className="w-4 h-4 fill-orange-500" />
              <span className="font-bold">{currentStreak} day streak</span>
            </Badge>
          )}
        </div>
        
        {/* Center: Logo with Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="group relative flex items-center justify-center py-2 px-6 rounded-2xl transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95"
          aria-label="Change theme"
        >
          {/* Animated glow background */}
          <div className={`absolute -inset-4 bg-gradient-to-r ${getThemeGlow()} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 ${isAnimating ? 'opacity-40 animate-pulse' : ''}`} />
          
          {/* Logo with scale animation */}
          <div className={`relative transform group-hover:scale-110 transition-all duration-300 ${isAnimating ? 'scale-125 rotate-12' : ''}`}>
            <BrandLogo size="sm" showAnimation={true} />
            
            {/* Floating sparkles on hover */}
            {isAnimating && (
              <>
                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-primary animate-ping" />
                <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-primary animate-ping" style={{ animationDelay: '150ms' }} />
              </>
            )}
          </div>
          
          {/* Decorative shine effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </button>
        
        {/* Right: Browse Button OR Switch to Grid View Button */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Points Counter - Always visible */}
          <motion.div
            key={userPoints}
            initial={{ scale: 1 }}
            animate={{ 
              scale: showPointsAnimation ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Badge 
              variant="secondary"
              className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-md"
            >
              <Star className={`w-4 h-4 fill-amber-500 ${showPointsAnimation ? 'animate-spin' : ''}`} />
              <span className="font-bold">{userPoints.toLocaleString()}</span>
            </Badge>
            
            {/* Sparkle effect on points gain */}
            {showPointsAnimation && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl"
                />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 animate-ping" />
              </>
            )}
          </motion.div>
          
          {/* Browse button - show on feed */}
          {currentView === 'feed' && (
            <Button
              onClick={() => onNavigate('browse')}
              size="sm"
              variant="outline"
              className="gap-2 border-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Browse</span>
            </Button>
          )}
          
          {/* Settings button - show only when NOT on feed */}
          {currentView !== 'feed' && (
            <Button
              onClick={() => onNavigate('settings')}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Points Animation */}
      <AnimatePresence>
        {showPointsAnimation && (
          <motion.div
            key="points-animation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute top-16 right-4 bg-background/80 backdrop-blur-lg p-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">+{pointsGained} points</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}