import { motion, Reorder } from 'motion/react'
import { 
  FileText, Heart, MapPin, RefreshCw, MessageSquare, Globe,
  Edit3, Check, Target, Sparkles
} from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import {
  DEFAULT_HOME_LAYOUT,
  STORAGE_KEYS,
  SAVE_DEBOUNCE_MS
} from './home-launcher-utils'

interface HomeAppLauncherProps {
  userId: string
  displayName: string
  userLevel?: number
  currentXP?: number
  nextLevelXP?: number
  onAppClick?: (appKey: string) => void
}

interface AppItem {
  key: string
  icon: any
  label: string
  bgColor: string // Solid background color for the icon
  iconColor: string // Icon color (usually white or dark)
  route?: string
  category?: string
  badge?: number
  isNew?: boolean
}

// All available apps with solid colored backgrounds
const ALL_APPS: AppItem[] = [
  {
    key: 'places',
    icon: MapPin,
    label: 'PLACES',
    bgColor: 'linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)', // Teal/cyan
    iconColor: '#0f766e',
    route: '/places',
    category: 'Location'
  },
  {
    key: 'globe',
    icon: Globe,
    label: 'GLOBE',
    bgColor: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)', // Blue
    iconColor: '#1e3a8a',
    route: '/globe',
    category: 'Business'
  },
  {
    key: 'swap',
    icon: RefreshCw,
    label: 'SWAP',
    bgColor: 'linear-gradient(135deg, #fdba74 0%, #f97316 100%)', // Orange
    iconColor: '#7c2d12',
    route: '/swap',
    category: 'Marketplace'
  },
  {
    key: 'swipe',
    icon: Heart,
    label: 'SWIPE',
    bgColor: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)', // Pink
    iconColor: '#831843',
    route: '/swipe',
    category: 'Discovery'
  },
  {
    key: 'mag',
    icon: FileText,
    label: 'MAG',
    bgColor: 'linear-gradient(135deg, #c7d2fe 0%, #818cf8 100%)', // Indigo
    iconColor: '#312e81',
    route: '/mag',
    category: 'Content'
  },
  {
    key: 'forum',
    icon: MessageSquare,
    label: 'FORUM',
    bgColor: 'linear-gradient(135deg, #d8b4fe 0%, #a855f7 100%)', // Purple
    iconColor: '#581c87',
    route: '/forum',
    category: 'Community'
  },
  {
    key: 'swag',
    icon: Sparkles,
    label: 'SWAG',
    bgColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Gold/yellow
    iconColor: '#78350f',
    route: '/swag',
    category: 'Marketplace'
  },
  {
    key: 'compass',
    icon: Target,
    label: 'HUNT',
    bgColor: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', // Orange/amber
    iconColor: '#7c2d12',
    route: '/compass',
    category: 'Games'
  },
]

// Animated gradient orbs for background
const FloatingOrbs = ({ isLightTheme }: { isLightTheme: boolean }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top left orb */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          top: '-250px',
          left: '-250px',
          background: isLightTheme 
            ? 'radial-gradient(circle, rgba(94, 234, 212, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(94, 234, 212, 0.25) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Top right orb */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          top: '-150px',
          right: '-150px',
          background: isLightTheme
            ? 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Bottom left orb */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '450px',
          height: '450px',
          bottom: '-200px',
          left: '-100px',
          background: isLightTheme
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.13) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Bottom right orb */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '380px',
          height: '380px',
          bottom: '-150px',
          right: '-120px',
          background: isLightTheme
            ? 'radial-gradient(circle, rgba(249, 168, 212, 0.14) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(249, 168, 212, 0.18) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -35, 0],
          y: [0, -25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Center floating orb */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '320px',
          height: '320px',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isLightTheme
            ? 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          x: [-20, 20, -20],
          y: [-30, 30, -30],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
    </div>
  )
}

export function HomeAppLauncher({
  userId,
  displayName,
  userLevel = 1,
  currentXP = 0,
  nextLevelXP = 100,
  onAppClick
}: HomeAppLauncherProps) {
  const supabase = createClient()
  
  // Customization states
  const [isEditMode, setIsEditMode] = useState(false)
  const [customization, setCustomization] = useState<string[]>(DEFAULT_HOME_LAYOUT.appOrder)
  const [isLoading, setIsLoading] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect if theme is light (white background)
  const [isLightTheme, setIsLightTheme] = useState(false)

  // Check theme on mount and when it changes
  useEffect(() => {
    const checkTheme = () => {
      const html = document.documentElement
      // Light theme if NO theme class OR has 'light' class, or root background is white
      const hasLightTheme = !html.classList.contains('dark') && 
                           !html.classList.contains('hempin') && 
                           !html.classList.contains('solarpunk-dreams') &&
                           !html.classList.contains('midnight-hemp') &&
                           !html.classList.contains('golden-hour')
      setIsLightTheme(hasLightTheme)
    }

    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Get enabled apps based on customization
  const enabledApps = customization
    .map(key => ALL_APPS.find(app => app.key === key))
    .filter((app): app is AppItem => app !== undefined)

  // Get available apps for adding
  const availableApps = ALL_APPS.filter(
    app => !customization.includes(app.key)
  )

  // Load customization from Supabase and localStorage
  useEffect(() => {
    if (userId) {
      loadCustomization()
    }
  }, [userId])

  const loadCustomization = async () => {
    try {
      // Try localStorage first (instant)
      const localConfig = localStorage.getItem(STORAGE_KEYS.HOME_LAYOUT)
      if (localConfig) {
        const parsed = JSON.parse(localConfig)
        if (parsed.appOrder) {
          // Auto-migrate: Add any new apps that aren't in the saved layout
          const allAppKeys = ALL_APPS.map(app => app.key)
          const missingApps = allAppKeys.filter(key => !parsed.appOrder.includes(key))
          const migratedOrder = [...parsed.appOrder, ...missingApps]
          setCustomization(migratedOrder)
          
          // Save the migrated layout back
          if (missingApps.length > 0) {
            console.log('🔄 Auto-migrated layout to include new apps:', missingApps)
            saveCustomization(migratedOrder)
          }
        }
      }

      // Then load from Supabase (source of truth)
      const { data, error } = await supabase
        .from('user_progress')
        .select('home_layout_config')
        .eq('user_id', userId)
        .single()
      
      if (data?.home_layout_config) {
        const config = data.home_layout_config as { appOrder: string[] }
        if (config.appOrder) {
          // Auto-migrate: Add any new apps that aren't in the saved layout
          const allAppKeys = ALL_APPS.map(app => app.key)
          const missingApps = allAppKeys.filter(key => !config.appOrder.includes(key))
          const migratedOrder = [...config.appOrder, ...missingApps]
          setCustomization(migratedOrder)
          
          // Sync to localStorage
          const migratedConfig = { ...config, appOrder: migratedOrder }
          localStorage.setItem(STORAGE_KEYS.HOME_LAYOUT, JSON.stringify(migratedConfig))
          
          // Save back to Supabase if we added new apps
          if (missingApps.length > 0) {
            console.log('🔄 Auto-migrated layout to include new apps:', missingApps)
            saveCustomization(migratedOrder)
          }
        }
      } else if (!localConfig) {
        // No saved config, use default
        setCustomization(DEFAULT_HOME_LAYOUT.appOrder)
      }
    } catch (err) {
      console.error('Error loading home layout customization:', err)
      setCustomization(DEFAULT_HOME_LAYOUT.appOrder)
    }
  }

  const saveCustomization = async (newAppOrder: string[]) => {
    const newConfig = {
      appOrder: newAppOrder,
      hiddenApps: [],
      favorites: [],
      quickActions: [],
      gridColumns: 3,
      iconSize: 'large',
      showStats: true,
      showRecentApps: false
    }

    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEYS.HOME_LAYOUT, JSON.stringify(newConfig))
    
    // Debounce Supabase save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_progress')
          .update({ home_layout_config: newConfig })
          .eq('user_id', userId)
        
        if (error) {
          console.error('Error saving home layout to Supabase:', error)
        }
      } catch (err) {
        console.error('Error saving home layout:', err)
      }
    }, SAVE_DEBOUNCE_MS)
  }

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (isEditMode) {
      // Exiting edit mode - save
      saveCustomization(customization)
    }
  }

  const handleReorder = (newOrder: string[]) => {
    setCustomization(newOrder)
  }

  const handleAppClick = (app: AppItem) => {
    if (isEditMode) return // Don't trigger navigation in edit mode
    
    onAppClick?.(app.key)
  }

  // XP progress percentage
  const xpProgress = (currentXP / nextLevelXP) * 100

  return (
    <div className="w-full min-h-screen relative">
      {/* Animated gradient orbs background */}
      <FloatingOrbs isLightTheme={isLightTheme} />

      {/* Content */}
      <div className="relative z-10 px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Edit button */}
          <div className="flex items-center justify-end mb-6">
            {/* Edit/Done button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleEditMode}
              className="px-4 py-2.5 rounded-2xl flex items-center gap-2 relative overflow-hidden shadow-lg"
              style={{
                background: isEditMode 
                  ? isLightTheme
                    ? 'rgba(232, 255, 0, 0.9)'
                    : 'rgba(232, 255, 0, 0.2)'
                  : isLightTheme
                    ? 'rgba(0, 0, 0, 0.08)'
                    : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isEditMode 
                  ? '1.5px solid rgba(232, 255, 0, 0.5)' 
                  : isLightTheme
                    ? '1.5px solid rgba(0, 0, 0, 0.1)'
                    : '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isEditMode
                  ? '0 4px 20px rgba(232, 255, 0, 0.3)'
                  : isLightTheme
                    ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                    : '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              {isEditMode ? (
                <>
                  <Check 
                    size={18} 
                    strokeWidth={2.5}
                    style={{
                      color: isLightTheme ? '#000' : '#E8FF00',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                  />
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: isLightTheme ? '#000' : '#E8FF00' }}
                  >
                    Done
                  </span>
                </>
              ) : (
                <>
                  <Edit3 
                    size={18} 
                    strokeWidth={2}
                    style={{
                      color: isLightTheme ? '#000' : '#fff',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: isLightTheme ? '#000' : '#fff' }}
                  >
                    Edit
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Progress Widget (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 p-6 rounded-3xl relative overflow-hidden"
            style={{
              background: isLightTheme
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isLightTheme
                ? '1.5px solid rgba(0, 0, 0, 0.08)'
                : '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: isLightTheme
                ? '0 8px 32px rgba(0, 0, 0, 0.08)'
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Gradient glow behind (subtle in light mode) */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                opacity: isLightTheme ? 0.05 : 0.15,
                filter: 'blur(40px)',
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p 
                    className="text-sm font-medium mb-1"
                    style={{ 
                      color: isLightTheme 
                        ? 'rgba(0, 0, 0, 0.5)' 
                        : 'rgba(255, 255, 255, 0.7)' 
                    }}
                  >
                    Your Progress
                  </p>
                  <h3 
                    className="text-2xl font-bold"
                    style={{ 
                      color: isLightTheme 
                        ? 'rgba(0, 0, 0, 0.9)' 
                        : 'rgba(255, 255, 255, 0.95)' 
                    }}
                  >
                    Level {userLevel}
                  </h3>
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ 
                    color: isLightTheme 
                      ? 'rgba(0, 0, 0, 0.6)' 
                      : 'rgba(255, 255, 255, 0.8)' 
                  }}
                >
                  {currentXP} / {nextLevelXP} XP
                </div>
              </div>

              {/* Progress bar */}
              <div 
                className="h-3 rounded-full overflow-hidden relative"
                style={{
                  background: isLightTheme
                    ? 'rgba(0, 0, 0, 0.08)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 animate-shimmer"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* App Grid */}
          <Reorder.Group
            axis="x"
            values={customization}
            onReorder={handleReorder}
            className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6"
            as="div"
          >
            {enabledApps.map((app, index) => {
              const Icon = app.icon
              return (
                <Reorder.Item
                  key={app.key}
                  value={app.key}
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  whileDrag={{ scale: 1.1, zIndex: 1000 }}
                  className={`relative ${isEditMode ? 'cursor-move' : 'cursor-pointer'}`}
                  onClick={() => !isEditMode && handleAppClick(app)}
                  as="div"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: 'spring', damping: 15, stiffness: 200 }}
                    className="flex flex-col items-center group"
                  >
                    {/* Icon container with wiggle in edit mode */}
                    <motion.div
                      className="relative w-full aspect-square"
                      animate={isEditMode ? {
                        rotate: [-2, 2, -2],
                      } : {
                        rotate: 0
                      }}
                      transition={{
                        repeat: isEditMode ? Infinity : 0,
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      whileHover={!isEditMode ? { scale: 1.05, y: -4 } : {}}
                    >
                      {/* Badge (if any) */}
                      {app.badge && !isEditMode && (
                        <div className="absolute -top-2 -right-2 z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
                            <div 
                              className="relative px-2 py-0.5 bg-[#E8FF00] rounded-full flex items-center justify-center shadow-lg text-xs font-bold"
                              style={{
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                color: '#000',
                              }}
                            >
                              {app.badge}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* App icon card - solid colored background */}
                      <div 
                        className="w-full h-full rounded-3xl flex flex-col items-center justify-center gap-2 relative overflow-hidden transition-all duration-300"
                        style={{
                          background: app.bgColor,
                          boxShadow: isLightTheme
                            ? '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                            : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                          border: isLightTheme
                            ? '1px solid rgba(255, 255, 255, 0.8)'
                            : '1.5px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {/* Glass highlight overlay */}
                        <div 
                          className="absolute inset-0 rounded-3xl pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                          }}
                        />
                        
                        {/* Icon */}
                        <Icon 
                          className="relative z-10" 
                          size={44}
                          strokeWidth={2}
                          style={{
                            color: app.iconColor,
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                          }}
                        />
                        
                        {/* Label inside card */}
                        <p 
                          className="relative z-10 text-xs font-bold tracking-wide"
                          style={{ 
                            color: app.iconColor,
                            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                          }}
                        >
                          {app.label}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  )
}