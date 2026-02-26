import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Shield, ArrowLeft, Flame, Zap, Sparkles, Settings, 
  Home, User, Plus, Heart, X, RefreshCw, Package, 
  MapPin, Briefcase, Store, Building2, MessageCircle, Wallet
} from 'lucide-react'
import budCharacterUrl from '../assets/bud-character.svg'
import { WalletPanel } from './WalletPanel'
import { PointsRulesModal } from './PointsRulesModal'
import { BubbleController } from './BubbleController'
import { MessageIcon } from './messaging/MessageIcon'
import { MessagePanel } from './messaging/MessagePanel'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from '../utils/featureUnlocks'
import {
  AdminButton,
  BackButton,
  WalletButton,
  MessagesButton,
  HomeButton,
  MeButton,
  ContextualPlusButton,
  StreakBadge,
  LogoButton,
} from './navbar/NavbarButtons'

// ================================================
// TYPE DEFINITIONS
// ================================================

type ViewType = 
  | 'feed' | 'dashboard' | 'editor' | 'article' | 'admin' 
  | 'reading-history' | 'matched-articles' | 'achievements' 
  | 'browse' | 'settings' | 'swipe' | 'swap-shop' 
  | 'swag-shop' | 'swag-marketplace' | 'swag-admin'
  | 'places-directory' | 'globe' 
  | 'community-market' | 'reading-analytics'

type AppArea = 'magazine' | 'community-market'

interface PlusButtonConfig {
  icon: React.ElementType
  label: string
  colors: {
    from: string
    via: string
    to: string
  }
  glow: string
  action: 'create-article' | 'list-swap-item' | 'add-place' | 'browse-swag' | 'create-rfp' | 'quick-action' | 'submit-swag-product'
}

interface AppNavigationProps {
  // View & Navigation
  currentView: ViewType
  onNavigate: (view: any) => void
  onBack?: () => void
  
  // Authentication
  isAuthenticated: boolean
  onLogout: () => void
  userId?: string
  accessToken?: string
  
  // User Data
  userPoints?: number
  nadaPoints?: number
  totalArticlesRead?: number
  currentStreak?: number
  currentTheme?: 'light' | 'dark' | 'hempin'
  avatarUrl?: string | null
  displayName?: string
  
  // Server Config
  serverUrl?: string
  projectId?: string
  publicAnonKey?: string
  
  // Feature Unlocks & Actions
  onFeatureUnlock?: (featureId: 'article-creation') => void
  onPointsAnimationComplete?: () => void
  onExchangePoints?: (pointsToExchange: number) => Promise<void>
  onThemeChange?: (theme: 'light' | 'dark' | 'hempin') => void
  
  // UI State
  exploreMode?: 'grid' | 'swipe'
  onSwitchToGrid?: () => void
  homeButtonTheme?: string
  
  // Swipe Controls (for bottom navbar)
  swipeControls?: {
    onSkip: () => void
    onMatch: () => void
    onReset: () => void
    isAnimating: boolean
  }
  
  // ME Drawer
  onMEButtonClick?: () => void
  meDrawerOpen?: boolean
  hasNewDiscoveryMatches?: boolean
  
  // Contextual Plus Actions
  onContextualPlusClick?: (action: PlusButtonConfig['action']) => void
  
  // Category Menu (Magazine)
  onToggleCategoryMenu?: () => void
  
  // Admin Navigation
  onNavigateToMarketAdmin?: () => void
}

// ================================================
// CONTEXTUAL PLUS BUTTON CONFIGURATION
// ================================================

const CONTEXTUAL_PLUS_CONFIGS: Record<string, PlusButtonConfig> = {
  // Magazine Environment
  'feed': {
    icon: Plus,
    label: 'Create Article',
    colors: { from: '#34d399', via: '#14b8a6', to: '#06b6d4' },
    glow: 'rgba(20,184,166,0.4)',
    action: 'create-article',
  },
  'browse': {
    icon: Plus,
    label: 'Create Article',
    colors: { from: '#34d399', via: '#14b8a6', to: '#06b6d4' },
    glow: 'rgba(20,184,166,0.4)',
    action: 'create-article',
  },
  'editor': {
    icon: Plus,
    label: 'Create Article',
    colors: { from: '#34d399', via: '#14b8a6', to: '#06b6d4' },
    glow: 'rgba(20,184,166,0.4)',
    action: 'create-article',
  },
  
  // SWAP Shop Environment
  'swap-shop': {
    icon: Package,
    label: 'List Swap Item',
    colors: { from: '#fbbf24', via: '#f59e0b', to: '#f97316' },
    glow: 'rgba(251,191,36,0.4)',
    action: 'list-swap-item',
  },
  
  // SWAG Shop Environment
  'swag-shop': {
    icon: Sparkles,
    label: 'Browse Products',
    colors: { from: '#c084fc', via: '#ec4899', to: '#f43f5e' },
    glow: 'rgba(168,85,247,0.4)',
    action: 'browse-swag',
  },
  'swag-marketplace': {
    icon: Store,
    label: 'Submit Product',
    colors: { from: '#c084fc', via: '#ec4899', to: '#f43f5e' },
    glow: 'rgba(168,85,247,0.4)',
    action: 'submit-swag-product',
  },
  
  // Places Environment
  'places-directory': {
    icon: MapPin,
    label: 'Add Place',
    colors: { from: '#60a5fa', via: '#06b6d4', to: '#14b8a6' },
    glow: 'rgba(59,130,246,0.4)',
    action: 'add-place',
  },
  'globe': {
    icon: MapPin,
    label: 'Add Place',
    colors: { from: '#60a5fa', via: '#06b6d4', to: '#14b8a6' },
    glow: 'rgba(59,130,246,0.4)',
    action: 'add-place',
  },
  
  // Community Market / B2B
  'community-market': {
    icon: Briefcase,
    label: 'Create RFP',
    colors: { from: '#3b82f6', via: '#6366f1', to: '#8b5cf6' },
    glow: 'rgba(79,70,229,0.4)',
    action: 'create-rfp',
  },
  
  // Default
  'dashboard': {
    icon: Plus,
    label: 'Quick Action',
    colors: { from: '#34d399', via: '#14b8a6', to: '#06b6d4' },
    glow: 'rgba(20,184,166,0.4)',
    action: 'quick-action',
  },
}

// ================================================
// MAIN COMPONENT
// ================================================

export function AppNavigation({
  currentView,
  onNavigate,
  onBack,
  isAuthenticated,
  onLogout,
  userId,
  accessToken,
  userPoints = 0,
  nadaPoints = 0,
  totalArticlesRead = 0,
  currentStreak,
  currentTheme, // Theme state for bubble controller
  avatarUrl,
  displayName,
  serverUrl,
  projectId,
  publicAnonKey,
  onFeatureUnlock,
  onPointsAnimationComplete,
  onExchangePoints,
  onThemeChange,
  exploreMode,
  onSwitchToGrid,
  homeButtonTheme,
  swipeControls,
  onMEButtonClick,
  meDrawerOpen,
  hasNewDiscoveryMatches,
  onContextualPlusClick,
  onToggleCategoryMenu,
}: AppNavigationProps) {
  // ================================================
  // STATE
  // ================================================
  
  // Admin
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Wallet & Points
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [showPointsRulesModal, setShowPointsRulesModal] = useState(false)
  const [previousPoints, setPreviousPoints] = useState(userPoints)
  const [pointsGained, setPointsGained] = useState(0)
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [showDewiiAnimation, setShowDewiiAnimation] = useState(false)
  
  // Messenger
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [messengerInitialInboxType, setMessengerInitialInboxType] = useState<string | undefined>()
  const [messengerInitialConversationId, setMessengerInitialConversationId] = useState<string | undefined>()

  // Expose global opener so unconnected components (SwapInbox, etc.) can open the messenger
  useEffect(() => {
    (window as any).__openMessenger = (params?: { inboxType?: string; conversationId?: string }) => {
      if (params?.inboxType) setMessengerInitialInboxType(params.inboxType)
      if (params?.conversationId) setMessengerInitialConversationId(params.conversationId)
      setIsMessengerOpen(true)
    }
    return () => { delete (window as any).__openMessenger }
  }, [])

  // Fetch unread message count from backend
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !projectId) return
    
    fetchUnreadCount()

    // Poll every 2 minutes — auto-pauses when tab is hidden
    let interval: ReturnType<typeof setInterval> | null = null
    const start = () => { if (!interval) interval = setInterval(fetchUnreadCount, 120000) }
    const stop  = () => { if (interval) { clearInterval(interval); interval = null } }

    start()
    const onVisibility = () => document.hidden ? stop() : (start(), fetchUnreadCount())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [isAuthenticated, projectId]) // Removed accessToken - we only need to re-run when user logs in/out

  const fetchUnreadCount = async () => {
    if (!accessToken || !projectId) return
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/unread-count`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unread_count || 0)
        console.log('📬 Unread messages count:', data.unread_count || 0)
      } else {
        // Silently fail on 401 - user might not be authenticated or token expired
        if (response.status !== 401) {
          console.warn('⚠️ Failed to fetch unread count:', response.status, response.statusText)
        }
        setUnreadCount(0)
      }
    } catch (err) {
      // Silently fail - don't spam console with errors for missing messaging
      setUnreadCount(0)
    }
  }
  
  // Clear unread messages when messenger is opened
  useEffect(() => {
    if (isMessengerOpen) {
      fetchUnreadCount()
    }
  }, [isMessengerOpen])
  
  // Bubble Controller
  const [showBubbleController, setShowBubbleController] = useState(false)
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
  
  // Refs
  const logoButtonRef = useRef<HTMLButtonElement>(null)
  
  // ================================================
  // DETERMINE CURRENT AREA
  // ================================================
  
  const getCurrentArea = (): AppArea => {
    if (currentView === 'community-market') {
      return 'community-market'
    }
    return 'magazine'
  }
  
  const currentArea = getCurrentArea()
  
  // ================================================
  // ADMIN CHECK
  // ================================================
  
  useEffect(() => {
    // Only check admin status when authenticated and have required credentials
    if (isAuthenticated && accessToken && serverUrl) {
      checkAdminStatus()
    }
  }, [isAuthenticated, accessToken, serverUrl])

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
      // Silently fail - admin check is not critical
    }
  }
  
  // ================================================
  // POINTS ANIMATION
  // ================================================
  
  useEffect(() => {
    if (userPoints > previousPoints && previousPoints > 0) {
      const gained = userPoints - previousPoints
      setPointsGained(gained)
      setShowPointsAnimation(true)
      
      setTimeout(() => {
        setShowPointsAnimation(false)
        if (onPointsAnimationComplete) {
          onPointsAnimationComplete()
        }
      }, 2000)
    }
    setPreviousPoints(userPoints)
  }, [userPoints])
  
  // ================================================
  // WALLET HANDLERS
  // ================================================
  
  const handleWalletToggle = () => {
    setIsWalletOpen(!isWalletOpen)
  }
  
  const closeWallet = () => {
    setIsWalletOpen(false)
  }
  
  // ================================================
  // LOGO CLICK HANDLER
  // ================================================
  
  const handleLogoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAuthenticated) {
      const rect = event.currentTarget.getBoundingClientRect()
      setBubblePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
      setShowBubbleController(true)
    }
  }
  
  // ================================================
  // THEME HANDLERS
  // ================================================
  
  const handleThemeClick = () => {
    // Simple toggle between light and dark themes
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    console.log('🎨 Theme toggle:', currentTheme, '→', nextTheme)
    
    if (onThemeChange) {
      onThemeChange(nextTheme)
    }
    setShowBubbleController(false)
  }
  
  // Theme select handler no longer needed - keeping for compatibility
  const handleThemeSelect = (theme: 'light' | 'dark' | 'hempin') => {
    if (onThemeChange) {
      onThemeChange(theme)
    }
    setShowBubbleController(false)
  }
  
  // ================================================
  // RENDER: TOP NAVBAR
  // ================================================
  
  const renderTopNavbar = () => {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-20 flex items-center justify-center relative px-4">
          {/* Minimal blur only - iOS style */}
          <div 
            className="absolute inset-0 backdrop-blur-xl pointer-events-auto"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
            }}
          />
          
          {/* Content wrapper */}
          <div className="relative w-full flex items-center justify-center pointer-events-auto"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))'
            }}
          >
          {/* LEFT SIDE: Admin Buttons & Back Button */}
          <div className="absolute left-4 flex items-center gap-2">
            {/* ADMIN BUTTONS - Context-Aware */}
            {isAdmin && currentArea === 'community-market' && (
              <>
                {/* Market Admin - Cyan/Blue */}
                <AdminButton
                  onClick={() => {
                    // TODO: Open Market Admin Dashboard
                    console.log('Market Admin clicked')
                  }}
                  variant="market"
                  showLabel={true}
                />
                
                {/* Site Admin - Red/Orange */}
                <AdminButton
                  onClick={() => onNavigate('admin')}
                  variant="site"
                  showLabel={true}
                />
              </>
            )}
            
            {/* Magazine Admin - Single Admin Button */}
            {isAdmin && currentArea === 'magazine' && currentView !== 'admin' && (
              <AdminButton
                onClick={() => onNavigate('admin')}
                variant="site"
                showLabel={true}
              />
            )}
            
            {/* Back Button */}
            {(currentView === 'reading-history' || currentView === 'matched-articles' || currentView === 'achievements' || currentView === 'article') && onBack && (
              <BackButton onClick={onBack} />
            )}
            
            {/* Streak Badge in Swipe Mode */}
            {currentView === 'feed' && exploreMode === 'swipe' && currentStreak !== undefined && (
              <StreakBadge count={currentStreak} />
            )}
          </div>

          {/* CENTER: Logo */}
          <LogoButton
            onClick={handleLogoClick}
            isAuthenticated={isAuthenticated}
          >
            <img src={budCharacterUrl} alt="BUD" className="w-12 h-12 drop-shadow-lg" />
          </LogoButton>

          {/* RIGHT SIDE: Messages & Wallet */}
          {isAuthenticated && (
            <div className="absolute right-4 flex items-center gap-2">
              {/* Wallet Button */}
              <WalletButton
                onClick={handleWalletToggle}
                isOpen={isWalletOpen}
              />
              
              {/* Messages Icon */}
              {projectId && publicAnonKey && userId && accessToken && (
                <MessagesButton
                  onClick={() => setIsMessengerOpen(true)}
                  hasUnread={unreadCount > 0}
                />
              )}
            </div>
          )}
        </div> {/* Close content wrapper */}
        </div> {/* Close h-20 container */}
        
        {/* Points Animation */}
        <AnimatePresence>
          {showPointsAnimation && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white/20">
                <span className="font-bold">+{pointsGained} DEWII</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    )
  }
  
  // ================================================
  // RENDER: BOTTOM NAVBAR
  // ================================================
  
  const renderBottomNavbar = () => {
    if (!isAuthenticated) return null
    
    // Don't show in certain views
    if (currentView === 'reading-analytics' || currentView === 'swag-shop' || currentView === 'swag-marketplace') {
      return null
    }
    
    const handleNavigate = (view: any) => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      closeWallet()
      onNavigate(view)
    }

    // Get contextual config for the + button
    const plusConfig = CONTEXTUAL_PLUS_CONFIGS[currentView] || CONTEXTUAL_PLUS_CONFIGS['dashboard']

    // Determine if this view should have active state
    const isActiveContext = ['editor', 'swap-shop', 'swag-shop', 'swag-marketplace', 'places-directory', 'globe', 'community-market'].includes(currentView)
    
    // Map action to context for ContextualPlusButton
    const getContextFromAction = (action: PlusButtonConfig['action']): 'article' | 'swap' | 'swag' | 'places' | 'rfp' => {
      switch (action) {
        case 'create-article': return 'article'
        case 'list-swap-item': return 'swap'
        case 'browse-swag':
        case 'submit-swag-product': return 'swag'
        case 'add-place': return 'places'
        case 'create-rfp': return 'rfp'
        default: return 'article'
      }
    }
    
    const plusContext = getContextFromAction(plusConfig.action)

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-24 flex items-end justify-center px-4">
          <div className="relative h-24 flex items-end justify-center w-full">
            {/* Minimal blur only - iOS style */}
            <div 
              className="absolute inset-0 backdrop-blur-xl pointer-events-auto"
              style={{
                WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                maskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
              }}
            />

            {/* Navigation Items */}
            <div className="relative flex items-center justify-center w-full max-w-md mx-auto pointer-events-auto h-full pb-4"
              style={{
                filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.1)) drop-shadow(0 -2px 4px rgba(0,0,0,0.06))'
              }}
            >
              {/* Left Button - Home */}
              <div className="flex-1 flex justify-center items-center">
                <HomeButton
                  onClick={() => handleNavigate('feed')}
                  isActive={currentView === 'feed' && !meDrawerOpen}
                />
              </div>

              {/* Center Button - ME */}
              <div className="flex-1 flex justify-center items-center">
                <MeButton
                  onClick={() => {
                    closeWallet()
                    onMEButtonClick?.()
                  }}
                  isActive={meDrawerOpen || currentView === 'dashboard'}
                  hasNotification={hasNewDiscoveryMatches}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                />
              </div>

              {/* Right Button - Contextual Plus - Always Unlocked */}
              <div className="flex-1 flex justify-center items-center">
                <ContextualPlusButton
                  onClick={() => {
                    if (onContextualPlusClick) {
                      onContextualPlusClick(plusConfig.action)
                    }
                  }}
                  context={plusContext}
                  isActive={isActiveContext}
                  isLocked={false}
                  articlesNeeded={0}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
  
  // ================================================
  // RENDER: PERSISTENT PANELS
  // ================================================
  
  return (
    <>
      {/* Top Navbar */}
      {renderTopNavbar()}
      
      {/* Bottom Navbar */}
      {renderBottomNavbar()}
      
      {/* Wallet Panel (Persistent) */}
      <WalletPanel
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentPoints={userPoints || 0}
        nadaPoints={nadaPoints || 0}
        onExchange={onExchangePoints || (async () => {})}
        userId={userId}
        accessToken={accessToken}
        serverUrl={serverUrl}
        onShowPointsRules={() => setShowPointsRulesModal(true)}
      />
      
      {/* Messenger Modal (Persistent) */}
      {isMessengerOpen && userId && accessToken && projectId && publicAnonKey && (
        <MessagePanel
          isOpen={isMessengerOpen}
          onClose={() => {
            setIsMessengerOpen(false)
            setMessengerInitialInboxType(undefined)
            setMessengerInitialConversationId(undefined)
          }}
          userId={userId}
          accessToken={accessToken}
          serverUrl={serverUrl || `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`}
          projectId={projectId}
          publicAnonKey={publicAnonKey}
          initialInboxType={messengerInitialInboxType}
          initialConversationId={messengerInitialConversationId}
          onMarkedAsRead={fetchUnreadCount}
        />
      )}
      
      {/* Bubble Controller */}
      <BubbleController
        isVisible={showBubbleController}
        onClose={() => setShowBubbleController(false)}
        onThemeClick={handleThemeClick}
        position={bubblePosition}
        currentTheme={currentTheme}
      />
      
      {/* Points Rules Modal */}
      {showPointsRulesModal && (
        <PointsRulesModal
          isOpen={showPointsRulesModal}
          onClose={() => setShowPointsRulesModal(false)}
        />
      )}
    </>
  )
}