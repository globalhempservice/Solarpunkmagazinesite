import { Home, User, Plus, Package, MapPin, Briefcase, Store, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { motion } from 'motion/react'

// ================================================
// CONTEXTUAL PLUS BUTTON CONFIGURATION
// ================================================
// This defines how the + button behaves in each environment

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
  
  // SWAP Shop Environment - Orange/Yellow
  'swap-shop': {
    icon: Package,
    label: 'List Swap Item',
    colors: { from: '#fbbf24', via: '#f59e0b', to: '#f97316' },
    glow: 'rgba(251,191,36,0.4)',
    action: 'list-swap-item',
  },
  
  // SWAG Shop Environment - Purple/Pink
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
  
  // Places Environment - Blue/Cyan
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
  
  // B2B/RFP Environment - Professional Blue/Gray
  'community-market': {
    icon: Briefcase,
    label: 'Create RFP',
    colors: { from: '#3b82f6', via: '#6366f1', to: '#8b5cf6' },
    glow: 'rgba(79,70,229,0.4)',
    action: 'create-rfp',
  },
  
  // Default for other views
  'dashboard': {
    icon: Plus,
    label: 'Quick Action',
    colors: { from: '#34d399', via: '#14b8a6', to: '#06b6d4' },
    glow: 'rgba(20,184,166,0.4)',
    action: 'quick-action',
  },
}

interface BottomNavbarProps {
  currentView: string // Now accepts any view string
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
  onMEButtonClick?: () => void
  meDrawerOpen?: boolean
  hasNewDiscoveryMatches?: boolean
  // New contextual action handlers
  onContextualPlusClick?: (action: PlusButtonConfig['action']) => void
}

export function BottomNavbar({ currentView, onNavigate, isAuthenticated, totalArticlesRead = 0, onFeatureUnlock, exploreMode, swipeControls, closeWallet, onMEButtonClick, meDrawerOpen, hasNewDiscoveryMatches, onContextualPlusClick }: BottomNavbarProps) {
  if (!isAuthenticated) return null

  const handleNavigate = (view: 'feed' | 'dashboard' | 'editor' | 'swipe') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    closeWallet?.()
    onNavigate(view)
  }

  // REMOVED: Old article count unlock system
  // Now using new CreateModal for universal + button
  
  // Get contextual config for the + button
  const plusConfig = CONTEXTUAL_PLUS_CONFIGS[currentView] || CONTEXTUAL_PLUS_CONFIGS['dashboard']
  const PlusIcon = plusConfig.icon
  
  // REMOVED: shouldShowLock - now always unlocked, opens modal instead

  // Determine if this view should have active state
  const isActiveContext = ['editor', 'swap-shop', 'swag-shop', 'swag-marketplace', 'places-directory', 'globe', 'community-market'].includes(currentView)

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
                onClick={() => {
                  closeWallet?.()
                  onMEButtonClick?.()
                }}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full relative focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-95"
              >
                <div className="relative">
                  {/* Animated glow background - Purple/Pink */}
                  <div className={`absolute -inset-10 bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 rounded-full blur-3xl transition-all duration-500 ${
                    meDrawerOpen
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

                  {/* Notification Badge */}
                  {hasNewDiscoveryMatches && (
                    <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
                        <div className="relative w-5 h-5 bg-[#E8FF00] border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Active indicator dot */}
                {currentView === 'dashboard' && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-sky-500 to-pink-500 dark:from-sky-400 dark:to-pink-400 hempin:from-amber-500 hempin:to-yellow-500 shadow-lg" />
                  </div>
                )}
              </Button>
            </div>

            {/* Right Button - Contextual Plus - Adapts per environment */}
            <div className="flex-1 flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onContextualPlusClick) {
                    onContextualPlusClick(plusConfig.action)
                  }
                }}
                className="flex flex-col items-center gap-0 h-auto py-0 px-0 transition-all group rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/50 active:scale-95"
              >
                <div className="relative">
                  {/* Unlocked State - Contextual Icon & Colors */}
                  <>
                    {/* Animated glow background - Contextual colors */}
                    <div 
                      className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-500 ${
                        isActiveContext ? 'opacity-30 animate-pulse' : 'opacity-10 group-hover:opacity-20'
                      }`}
                      style={{
                        background: `linear-gradient(to right, ${plusConfig.colors.from}, ${plusConfig.colors.via}, ${plusConfig.colors.to})`
                      }}
                    />
                    
                    {/* Circle background with contextual gradient */}
                    <div 
                      className="relative rounded-full p-4 transition-all group-hover:scale-110"
                      style={{
                        background: `linear-gradient(to bottom right, ${plusConfig.colors.from}${isActiveContext ? '' : 'cc'}, ${plusConfig.colors.via}${isActiveContext ? '' : 'cc'}, ${plusConfig.colors.to}${isActiveContext ? '' : 'cc'})`,
                        boxShadow: isActiveContext ? `0 0 20px ${plusConfig.glow}` : undefined
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/40 rounded-full blur-md" />
                      
                      {/* Icon morphing animation - Package ↔ Plus for SWAP */}
                      {currentView === 'swap-shop' ? (
                        <div className="relative w-8 h-8">
                          {/* Package Icon */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ 
                              opacity: [1, 0, 1],
                              scale: [1, 0.8, 1],
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <Package 
                              className="w-8 h-8 text-white drop-shadow-lg"
                              strokeWidth={2.5}
                            />
                          </motion.div>

                          {/* Plus Icon */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.8, 1, 0.8],
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <Plus 
                              className="w-8 h-8 text-white drop-shadow-lg"
                              strokeWidth={2.5}
                            />
                          </motion.div>
                        </div>
                      ) : (
                        <PlusIcon 
                          className="relative h-8 w-8 text-white drop-shadow-lg"
                          strokeWidth={isActiveContext ? 2.5 : 2} 
                        />
                      )}
                    </div>
                  </>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}