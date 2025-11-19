import { useState, useEffect } from 'react'
import { BrandLogo } from "./BrandLogo"
import { Sparkles, Grid, Flame, ArrowLeft, BookOpen, Settings, Zap, Shield } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { WalletPanel } from './WalletPanel'
import { PointsRulesModal } from './PointsRulesModal'

interface HeaderProps {
  currentView: 'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'matched-articles' | 'achievements' | 'browse' | 'settings'
  onNavigate: (view: 'feed' | 'dashboard' | 'editor' | 'admin' | 'browse' | 'settings') => void
  isAuthenticated: boolean
  onLogout: () => void
  userPoints?: number
  nadaPoints?: number
  exploreMode?: 'grid' | 'swipe'
  onSwitchToGrid?: () => void
  currentStreak?: number
  onBack?: () => void
  onPointsAnimationComplete?: () => void
  homeButtonTheme?: string
  userId?: string
  accessToken?: string
  serverUrl?: string
  onExchangePoints?: (pointsToExchange: number) => Promise<void>
  isWalletOpen?: boolean
  onWalletOpenChange?: (isOpen: boolean) => void
  onToggleCategoryMenu?: () => void
}

type Theme = 'light' | 'dark' | 'hempin'

export function Header({ currentView, onNavigate, isAuthenticated, exploreMode, onSwitchToGrid, currentStreak, onBack, userPoints = 0, nadaPoints = 0, onPointsAnimationComplete, homeButtonTheme, userId, accessToken, serverUrl, onExchangePoints, isWalletOpen = false, onWalletOpenChange, onToggleCategoryMenu }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isAnimating, setIsAnimating] = useState(false)
  const [previousPoints, setPreviousPoints] = useState(userPoints)
  const [pointsGained, setPointsGained] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [showDewiiAnimation, setShowDewiiAnimation] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPointsRulesModal, setShowPointsRulesModal] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (accessToken && serverUrl) {
      checkAdminStatus()
    }
  }, [accessToken, serverUrl])

  const checkAdminStatus = async () => {
    if (!accessToken || !serverUrl) return
    
    try {
      const response = await fetch(`${serverUrl}/admin/check`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

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

  const handleLogoClick = () => {
    cycleTheme()
    setShowDewiiAnimation(true)
    setTimeout(() => setShowDewiiAnimation(false), 2000)
    
    // Toggle category menu if on browse page
    if (currentView === 'browse' && onToggleCategoryMenu) {
      onToggleCategoryMenu()
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
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient blur mask: 100% blur at top, 0% blur at bottom where it connects to content */}
      <div 
        className="absolute inset-0 backdrop-blur-2xl"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />
      
      <div className="h-20 flex items-center justify-center relative px-4">
        {/* LEFT SIDE: Back Button or Streak Badge */}
        <div className="absolute left-4 flex items-center gap-2">
          {/* ADMIN Button - Leftmost position, only shows for admin users */}
          {isAdmin && currentView !== 'admin' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                onClick={() => onNavigate('admin')}
                size="sm"
                className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all group rounded-full px-3 sm:px-4 h-10 sm:h-12"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline font-bold">ADMIN</span>
              </Button>
            </motion.div>
          )}
          
          {/* Back Button - Left of Logo */}
          {(currentView === 'reading-history' || currentView === 'matched-articles' || currentView === 'achievements' || currentView === 'article') && onBack && (
            <Button
              onClick={onBack}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all group rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
          )}
          
          {/* Streak badge in swipe mode - Left of Logo */}
          {currentView === 'feed' && exploreMode === 'swipe' && currentStreak !== undefined && (
            <Badge
              variant="secondary"
              className="gap-1.5 text-xs bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400 animate-pulse"
            >
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 fill-orange-500" />
              <span className="font-bold">{currentStreak}</span>
            </Badge>
          )}
        </div>

        {/* CENTER: Large Logo Button (Always Centered) */}
        <button
          onClick={handleLogoClick}
          className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 z-10"
          aria-label="Change theme"
        >
          {/* Animated glow background */}
          <div className={`absolute -inset-6 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${isAnimating ? 'opacity-40 animate-pulse' : ''}`} />
          
          {/* Outer ring - matching Me button */}
          <div className={`relative rounded-full p-1.5 transition-all group-hover:scale-110 ${
            isAnimating
              ? 'bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 dark:from-sky-400 dark:via-purple-400 dark:to-pink-400 hempin:from-amber-500 hempin:via-yellow-500 hempin:to-amber-500 scale-110 shadow-2xl'
              : 'bg-gradient-to-br from-muted/50 to-muted group-hover:from-muted group-hover:to-muted/80'
          }`}>
            {/* Inner circle */}
            <div className={`rounded-full p-4 sm:p-5 transition-all ${
              isAnimating
                ? 'bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-pink-500/30 dark:from-sky-400/20 dark:via-purple-400/15 dark:to-pink-400/20 hempin:from-amber-500/30 hempin:via-yellow-500/20 hempin:to-amber-500/30 backdrop-blur-sm'
                : 'bg-background'
            }`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <BrandLogo size="sm" showAnimation={true} theme={(homeButtonTheme as any) || 'default'} />
              </div>
            </div>
          </div>
          
          {/* Floating sparkles on animation */}
          {isAnimating && (
            <>
              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-primary animate-ping" />
              <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-primary animate-ping" style={{ animationDelay: '150ms' }} />
            </>
          )}
        </button>

        {/* RIGHT SIDE: Points Counter & Action Button */}
        <div className="absolute right-4 flex items-center gap-2">
          {/* Points Counter - Right of Logo - CLICKABLE! */}
          <motion.button
            onClick={() => onWalletOpenChange?.(true)}
            key={userPoints}
            initial={{ scale: 1 }}
            animate={{ 
              scale: showPointsAnimation ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
            className="relative group cursor-pointer"
          >
            <Badge 
              variant="secondary"
              className="gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all"
            >
              <Zap className={`w-3 h-3 sm:w-4 sm:h-4 fill-amber-500 ${showPointsAnimation ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
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
          </motion.button>
          
          {/* Settings button - Right of Points */}
          {currentView !== 'feed' && currentView !== 'admin' && (
            <Button
              onClick={() => onNavigate('settings')}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all group rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Comic-style "DEWII" Animation */}
      <AnimatePresence>
        {showDewiiAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 12 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          >
            {/* Comic book style container */}
            <div className="relative">
              {/* Background burst effect */}
              <div className="absolute inset-0 -m-8">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: i * 45 }}
                    animate={{ scale: 1.5, rotate: i * 45 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-t from-amber-400/60 to-transparent"
                    style={{ transformOrigin: 'center' }}
                  />
                ))}
              </div>
              
              {/* Main "DEWII" text */}
              <div className="relative bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-2xl px-8 py-4 border-4 border-foreground shadow-2xl transform rotate-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: 2,
                    repeatType: "reverse"
                  }}
                  className="text-5xl font-black tracking-wider"
                  style={{
                    textShadow: '4px 4px 0px rgba(0,0,0,0.3), -2px -2px 0px rgba(255,255,255,0.5)',
                    WebkitTextStroke: '2px black',
                    color: 'white'
                  }}
                >
                  DEWII
                </motion.div>
                
                {/* Comic sparkles around text */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 60],
                      y: [0, (Math.random() - 0.5) * 60],
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.1,
                      times: [0, 0.5, 1]
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white drop-shadow-lg" style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                    }} />
                  </motion.div>
                ))}
              </div>
              
              {/* Comic impact lines */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="absolute h-1 bg-foreground/40 rounded-full"
                  style={{
                    width: `${40 + Math.random() * 40}px`,
                    left: i % 2 === 0 ? '-60px' : 'auto',
                    right: i % 2 === 1 ? '-60px' : 'auto',
                    top: `${30 + i * 15}%`,
                    transformOrigin: i % 2 === 0 ? 'right' : 'left'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Points Animation (smaller notification) */}
      <AnimatePresence>
        {showPointsAnimation && (
          <motion.div
            key="points-animation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-lg p-2 rounded-lg shadow-lg flex items-center gap-2 border border-amber-500/30"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">+{pointsGained}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Wallet Panel */}
      {onExchangePoints && (
        <WalletPanel
          isOpen={isWalletOpen}
          onClose={() => onWalletOpenChange?.(false)}
          currentPoints={userPoints}
          nadaPoints={nadaPoints}
          onExchange={onExchangePoints}
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl}
          onShowPointsRules={() => setShowPointsRulesModal(true)}
        />
      )}
      
      {/* Points Rules Modal */}
      <PointsRulesModal
        isOpen={showPointsRulesModal}
        onClose={() => setShowPointsRulesModal(false)}
      />
    </header>
  )
}