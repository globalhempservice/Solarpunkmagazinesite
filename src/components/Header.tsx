import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Shield, ArrowLeft, Flame, Zap, Sparkles, Settings } from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import { WalletPanel } from './WalletPanel'
import { PointsRulesModal } from './PointsRulesModal'
import { BubbleController } from './BubbleController'
import { WikiPage } from './WikiPage'
import { MessageIcon } from './messaging/MessageIcon'

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
  onOpenMessages?: () => void
  projectId?: string
  publicAnonKey?: string
}

type Theme = 'light' | 'dark' | 'hempin'

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

export function Header({ currentView, onNavigate, isAuthenticated, exploreMode, onSwitchToGrid, currentStreak, onBack, userPoints = 0, nadaPoints = 0, onPointsAnimationComplete, homeButtonTheme, userId, accessToken, serverUrl, onExchangePoints, isWalletOpen = false, onWalletOpenChange, onToggleCategoryMenu, onOpenMessages, projectId, publicAnonKey }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isAnimating, setIsAnimating] = useState(false)
  const [previousPoints, setPreviousPoints] = useState(userPoints)
  const [pointsGained, setPointsGained] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [showDewiiAnimation, setShowDewiiAnimation] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPointsRulesModal, setShowPointsRulesModal] = useState(false)
  const [showBubbleController, setShowBubbleController] = useState(false)
  const [showWikiPage, setShowWikiPage] = useState(false)
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
  const logoButtonRef = useRef<HTMLButtonElement>(null)

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
      // Silently fail - no need to log errors for unauthenticated users
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
      applyTheme(savedTheme)
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
        applyTheme('dark')
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
    // If not authenticated, just cycle theme (landing page behavior)
    if (!isAuthenticated) {
      cycleTheme()
      setShowDewiiAnimation(true)
      setTimeout(() => setShowDewiiAnimation(false), 2000)
      return
    }

    // If authenticated, show bubble controller
    if (logoButtonRef.current) {
      const rect = logoButtonRef.current.getBoundingClientRect()
      setBubblePosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      })
    }
    setShowBubbleController(!showBubbleController)
    
    // Toggle category menu if on browse page
    if (currentView === 'browse' && onToggleCategoryMenu) {
      onToggleCategoryMenu()
    }
  }

  const handleWikiClick = () => {
    setShowBubbleController(false)
    setShowWikiPage(true)
  }

  const handleCloseBubble = () => {
    setShowBubbleController(false)
  }

  const handleCloseWiki = () => {
    setShowWikiPage(false)
  }

  const handleThemeSelect = (selectedTheme: Theme) => {
    applyTheme(selectedTheme)
    setShowBubbleController(false)
    
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
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
    <header className="sticky top-0 z-50 w-full pointer-events-none">
      {/* Gradient blur mask: 100% blur at top, 0% blur at bottom where it connects to content */}
      <div 
        className="absolute inset-0 backdrop-blur-2xl pointer-events-auto"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      />
      
      <div className="h-20 flex items-center justify-center relative px-4 pointer-events-auto">
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
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all group rounded-full w-12 h-12 p-0 border-2 border-white/20"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
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
          ref={logoButtonRef}
          onClick={handleLogoClick}
          className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 z-10"
          aria-label={isAuthenticated ? "Open menu" : "Change theme"}
        >
          {/* Animated glow background - Transparent */}
          <div className={`absolute -inset-8 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-500 ${isAnimating ? 'opacity-30 animate-pulse' : ''}`} />
          
          {/* Direct icon container - No circles */}
          <div className="relative p-5 sm:p-6 transition-all group-hover:scale-110">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <BrandLogo size="lg" showAnimation={true} theme={(homeButtonTheme as any) || 'default'} />
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
          {/* Points Counters Stack - Right of Logo - CLICKABLE! */}
          <div className="flex flex-col gap-1">
            {/* Power Up Points */}
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
                  
                  {/* Floating +Points text */}
                  <motion.div
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ y: -40, opacity: 0, scale: 1.2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    <span className="text-lg font-bold text-amber-500 drop-shadow-lg whitespace-nowrap">
                      +{pointsGained}
                    </span>
                  </motion.div>
                </>
              )}
            </motion.button>
            
            {/* NADA Points */}
            <motion.button
              onClick={() => onWalletOpenChange?.(true)}
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                variant="secondary"
                className="gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 text-emerald-600 dark:text-emerald-400 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all"
              >
                {/* NADA Ripple Icon */}
                <NadaRippleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span className="font-bold">{(nadaPoints || 0).toLocaleString()}</span>
              </Badge>
            </motion.button>
          </div>
          
          {/* Settings button - Colorful Pill - ONLY on ME page */}
          {currentView === 'dashboard' && (
            <motion.button
              onClick={() => onNavigate('settings')}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full blur opacity-60 group-hover:opacity-80 transition-all" />
              
              {/* Main pill button */}
              <div className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                <span className="hidden sm:inline text-white font-bold tracking-wide">
                  Settings
                </span>
              </div>
            </motion.button>
          )}
          
          {/* Messages button - Available in Mag environment (feed, browse, dashboard, article) */}
          {(currentView === 'feed' || currentView === 'browse' || currentView === 'dashboard' || currentView === 'article') && onOpenMessages && userId && accessToken && projectId && publicAnonKey && (
            <MessageIcon
              onClick={onOpenMessages}
              userId={userId}
              accessToken={accessToken}
              projectId={projectId}
              publicAnonKey={publicAnonKey}
            />
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

      {/* Bubble Controller - Only shown when authenticated */}
      {isAuthenticated && (
        <BubbleController
          isVisible={showBubbleController}
          onWikiClick={handleWikiClick}
          onThemeClick={cycleTheme}
          onThemeSelect={handleThemeSelect}
          onClose={handleCloseBubble}
          position={bubblePosition}
          currentTheme={theme}
        />
      )}

      {/* Wiki Page */}
      <WikiPage
        isOpen={showWikiPage}
        onClose={handleCloseWiki}
      />
    </header>
  )
}