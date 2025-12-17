import { motion, AnimatePresence, useMotionValue, Reorder } from 'motion/react'
import { 
  User, Settings, Building2, Package, LogOut, FileText, Compass, Plug, 
  Edit3, Check, X, Plus, Gamepad2, BarChart, MessageCircle, Bell, 
  Star, BookOpen, Palette, Trophy
} from 'lucide-react'
import { createClient } from '../utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { projectId } from '../utils/supabase/info'

interface MEButtonDrawerProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  displayName: string
  avatarUrl?: string | null
  onProfileClick?: () => void
  onOrganizationsClick?: () => void
  onInventoryClick?: () => void
  onSettingsClick?: () => void
  onMyArticlesClick?: () => void
  onDiscoveryMatchClick?: () => void
  onPluginStoreClick?: () => void
}

interface MenuItem {
  key: string
  icon: any
  label: string
  onClick?: () => void
  gradient: string
  category?: string
  isAvailable?: boolean
}

// Helper to convert Tailwind gradient to CSS gradient
const getTailwindGradient = (gradient: string) => {
  const colorMap: Record<string, string> = {
    'sky-500': '#0ea5e9',
    'purple-500': '#a855f7',
    'pink-500': '#ec4899',
    'fuchsia-500': '#d946ef',
    'indigo-500': '#6366f1',
    'blue-500': '#3b82f6',
    'violet-500': '#8b5cf6',
    'emerald-500': '#10b981',
    'teal-500': '#14b8a6',
    'cyan-500': '#06b6d4',
    'amber-500': '#f59e0b',
    'orange-500': '#f97316',
    'red-500': '#ef4444',
    'slate-500': '#64748b',
    'gray-500': '#6b7280',
    'zinc-500': '#71717a',
    'lime-500': '#84cc16',
    'rose-500': '#f43f5e',
  }
  
  const colors = gradient.match(/(?:from|via|to)-([\w-]+)/g)?.map(match => {
    const color = match.replace(/^(?:from|via|to)-/, '')
    return colorMap[color] || '#3b82f6'
  }) || ['#3b82f6', '#8b5cf6', '#ec4899']
  
  return `linear-gradient(135deg, ${colors.join(', ')})`
}

// Default configuration
const DEFAULT_CONFIG = [
  'profile',
  'discovery',
  'articles',
  'organizations',
  'inventory',
  'settings',
  'plugin-store'
]

export function MEButtonDrawer({ 
  isOpen, 
  onClose, 
  userId, 
  displayName: initialDisplayName, 
  avatarUrl: initialAvatarUrl,
  onProfileClick,
  onOrganizationsClick,
  onInventoryClick,
  onSettingsClick,
  onMyArticlesClick,
  onDiscoveryMatchClick,
  onPluginStoreClick
}: MEButtonDrawerProps) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [hasNewMatches, setHasNewMatches] = useState(false)
  
  // Customization states
  const [isEditMode, setIsEditMode] = useState(false)
  const [customization, setCustomization] = useState<string[]>(DEFAULT_CONFIG)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // All available menu items pool
  const getAllMenuItems = (): MenuItem[] => [
    {
      key: 'profile',
      icon: User,
      label: 'My Profile',
      onClick: onProfileClick,
      gradient: 'from-sky-500 via-purple-500 to-pink-500',
      category: 'Core',
      isAvailable: true
    },
    {
      key: 'discovery',
      icon: Compass,
      label: 'Discovery Match',
      onClick: onDiscoveryMatchClick,
      gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
      category: 'Core',
      isAvailable: true
    },
    {
      key: 'articles',
      icon: FileText,
      label: 'My Articles',
      onClick: onMyArticlesClick,
      gradient: 'from-blue-500 via-indigo-500 to-violet-500',
      category: 'Content',
      isAvailable: true
    },
    {
      key: 'organizations',
      icon: Building2,
      label: 'Organizations',
      onClick: onOrganizationsClick,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      category: 'Business',
      isAvailable: true
    },
    {
      key: 'inventory',
      icon: Package,
      label: 'My Inventory',
      onClick: onInventoryClick,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      category: 'Items',
      isAvailable: true
    },
    {
      key: 'settings',
      icon: Settings,
      label: 'Settings',
      onClick: onSettingsClick,
      gradient: 'from-slate-500 via-gray-500 to-zinc-500',
      category: 'Core',
      isAvailable: true
    },
    {
      key: 'plugin-store',
      icon: Plug,
      label: 'Plugin Store',
      onClick: onPluginStoreClick,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      category: 'Store',
      isAvailable: true
    },
    {
      key: 'gamification',
      icon: Gamepad2,
      label: 'Gamification',
      gradient: 'from-lime-500 via-emerald-500 to-cyan-500',
      category: 'Future',
      isAvailable: true
    },
    {
      key: 'analytics',
      icon: BarChart,
      label: 'Analytics',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      category: 'Future',
      isAvailable: true
    },
    {
      key: 'messages',
      icon: MessageCircle,
      label: 'Messages',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      category: 'Future',
      isAvailable: true
    },
    {
      key: 'notifications',
      icon: Bell,
      label: 'Notifications',
      gradient: 'from-amber-500 via-yellow-500 to-orange-500',
      category: 'Future',
      isAvailable: true
    },
    {
      key: 'favorites',
      icon: Star,
      label: 'Favorites',
      gradient: 'from-yellow-500 via-amber-500 to-orange-500',
      category: 'Future',
      isAvailable: true
    },
  ]

  const allMenuItems = getAllMenuItems()

  // Get enabled items based on customization
  const enabledItems = customization
    .map(key => allMenuItems.find(item => item.key === key))
    .filter((item): item is MenuItem => item !== undefined)
    .slice(0, 9)

  // Get available items for adding (not currently enabled)
  const availableItems = allMenuItems.filter(
    item => !customization.includes(item.key)
  )

  // Empty slots count
  const emptySlots = Math.max(0, 9 - enabledItems.length)

  // Load customization from Supabase and localStorage
  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData()
      checkForNewMatches()
      loadCustomization()
    }
  }, [isOpen, userId])

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        setDisplayName(data.display_name || initialDisplayName)
        setAvatarUrl(data.avatar_url || initialAvatarUrl)
      }
    } catch (err) {
      console.error('Error loading profile data for ME drawer:', err)
      setDisplayName(initialDisplayName)
      setAvatarUrl(initialAvatarUrl)
    }
  }

  const loadCustomization = async () => {
    try {
      // Try localStorage first (instant)
      const localConfig = localStorage.getItem('me-modal-customization')
      if (localConfig) {
        const parsed = JSON.parse(localConfig)
        setCustomization(parsed)
      }

      // Then load from Supabase (source of truth)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('me_modal_config')
        .eq('user_id', userId)
        .single()
      
      if (data?.me_modal_config) {
        const config = data.me_modal_config as string[]
        setCustomization(config)
        // Sync to localStorage
        localStorage.setItem('me-modal-customization', JSON.stringify(config))
      } else if (!localConfig) {
        // No saved config, use default
        setCustomization(DEFAULT_CONFIG)
      }
    } catch (err) {
      console.error('Error loading ME modal customization:', err)
      // Fall back to default
      setCustomization(DEFAULT_CONFIG)
    }
  }

  const saveCustomization = async (newConfig: string[]) => {
    // Save to localStorage immediately
    localStorage.setItem('me-modal-customization', JSON.stringify(newConfig))
    
    // Debounce Supabase save (avoid too many writes)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ me_modal_config: newConfig })
          .eq('user_id', userId)
        
        if (error) {
          console.error('Error saving ME modal customization to Supabase:', error)
        }
      } catch (err) {
        console.error('Error saving ME modal customization:', err)
      }
    }, 1000) // 1 second debounce
  }

  const checkForNewMatches = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const hasNew = data.requests?.some((req: any) => req.hasNewRecommendations) || false
        setHasNewMatches(hasNew)
      }
    } catch (err) {
      console.error('Error checking for new matches:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      window.location.reload()
    } catch (error) {
      console.error('Error during logout:', error)
      window.location.reload()
    }
  }

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (isEditMode) {
      // Exiting edit mode - save
      saveCustomization(customization)
    }
  }

  const handleRemoveItem = (key: string) => {
    const newConfig = customization.filter(k => k !== key)
    setCustomization(newConfig)
  }

  const handleAddItem = (key: string) => {
    if (customization.length < 9) {
      const newConfig = [...customization, key]
      setCustomization(newConfig)
      setShowAddSheet(false)
    }
  }

  const handleReorder = (newOrder: string[]) => {
    setCustomization(newOrder)
  }

  const handleIconClick = (item: MenuItem) => {
    if (isEditMode) return // Don't trigger action in edit mode
    
    item.onClick?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              if (!isEditMode) {
                onClose()
              } else {
                // Exit edit mode and close
                setIsEditMode(false)
                saveCustomization(customization)
                onClose()
              }
            }}
          />

          {/* iOS Folder-Style Modal - Centered */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS-style glass container */}
            <div 
              className="rounded-3xl overflow-hidden relative"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Handle bar + Edit button */}
              <div className="flex items-center justify-between pt-4 pb-2 px-4">
                <div className="w-8" /> {/* Spacer for centering */}
                
                {/* Handle bar */}
                <div className="w-12 h-1.5 rounded-full" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                  }}
                />

                {/* Edit/Done button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleEditMode}
                  className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: isEditMode 
                      ? 'rgba(232, 255, 0, 0.2)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isEditMode 
                      ? '1.5px solid rgba(232, 255, 0, 0.5)' 
                      : '1.5px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: isEditMode
                      ? '0 0 12px rgba(232, 255, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)'
                      : '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {isEditMode ? (
                    <Check 
                      size={16} 
                      className="text-[#E8FF00] relative z-10"
                      strokeWidth={2.5}
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  ) : (
                    <Edit3 
                      size={16} 
                      className="text-white relative z-10"
                      strokeWidth={2}
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  )}
                </motion.button>
              </div>

              {/* Header - User Avatar only (centered) */}
              <div className="px-6 py-4 flex justify-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName}
                      className="w-20 h-20 rounded-3xl border-2"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }}
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-3xl flex items-center justify-center border-2"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <span className="text-white font-bold text-3xl">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {/* Online indicator */}
                  <div 
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2"
                    style={{
                      background: '#10b981',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    }}
                  />
                </div>
              </div>

              {/* iOS Grid - 3 columns (max 9 items) */}
              <div className="px-6 py-6">
                <Reorder.Group
                  axis="x"
                  values={customization}
                  onReorder={handleReorder}
                  className="grid grid-cols-3 gap-4"
                  as="div"
                >
                  {enabledItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Reorder.Item
                        key={item.key}
                        value={item.key}
                        drag={isEditMode}
                        dragListener={isEditMode}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        whileDrag={{ scale: 1.1, zIndex: 1000 }}
                        className={`relative flex flex-col items-center gap-2 group ${isEditMode ? 'cursor-move' : 'cursor-pointer'}`}
                        onClick={() => !isEditMode && handleIconClick(item)}
                        as="div"
                      >
                        {/* Minus badge (edit mode only) */}
                        {isEditMode && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveItem(item.key)
                            }}
                            className="absolute -top-2 -left-2 z-20 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              border: '2px solid rgba(255, 255, 255, 0.9)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <X size={12} className="text-white" strokeWidth={3} />
                          </motion.button>
                        )}

                        {/* iOS app icon - rounded square */}
                        <motion.div 
                          className="relative"
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
                        >
                          {/* Notification dot for Discovery Match */}
                          {item.key === 'discovery' && hasNewMatches && (
                            <div className="absolute -top-1 -right-1 z-10">
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
                                <div className="relative w-5 h-5 bg-[#E8FF00] rounded-full flex items-center justify-center shadow-lg"
                                  style={{
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                  }}
                                >
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Icon container - iOS rounded square */}
                          <div 
                            className="w-16 h-16 rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-200 group-hover:scale-110"
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                              border: '1.5px solid rgba(255, 255, 255, 0.25)',
                            }}
                          >
                            {/* Colored gradient glow behind */}
                            <div 
                              className="absolute inset-0 rounded-[18px] opacity-40"
                              style={{
                                background: getTailwindGradient(item.gradient),
                                filter: 'blur(8px)',
                              }}
                            />
                            
                            {/* Glass highlight */}
                            <div 
                              className="absolute inset-0 rounded-[18px]"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                              }}
                            />
                            
                            {/* White icon with subtle glow */}
                            <Icon 
                              className="relative z-10 text-white" 
                              size={32}
                              strokeWidth={2}
                              style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                              }}
                            />
                          </div>
                        </motion.div>

                        {/* Label */}
                        <span 
                          className="text-xs font-medium text-center leading-tight max-w-[70px] line-clamp-2"
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {item.label}
                        </span>
                      </Reorder.Item>
                    )
                  })}

                  {/* Empty slots with + button (edit mode only) */}
                  {isEditMode && Array.from({ length: emptySlots }).map((_, idx) => (
                    <motion.button
                      key={`empty-${idx}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: enabledItems.length * 0.05 + idx * 0.05 }}
                      onClick={() => setShowAddSheet(true)}
                      className="relative flex flex-col items-center gap-2 group"
                    >
                      <div 
                        className="w-16 h-16 rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-200 group-hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '2px dashed rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        <Plus 
                          className="text-white opacity-60 group-hover:opacity-100 transition-opacity" 
                          size={24}
                          strokeWidth={2}
                        />
                      </div>
                      <span 
                        className="text-xs font-medium text-center leading-tight opacity-0"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        Add
                      </span>
                    </motion.button>
                  ))}
                </Reorder.Group>

                {/* Logout button - Always centered bottom */}
                <div className="flex justify-center mt-6">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleLogout}
                    className="relative flex flex-col items-center gap-2 group"
                  >
                    <div 
                      className="w-16 h-16 rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-200 group-hover:scale-110"
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      {/* Red gradient glow behind */}
                      <div 
                        className="absolute inset-0 rounded-[18px] opacity-40"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                          filter: 'blur(8px)',
                        }}
                      />
                      
                      {/* Glass highlight */}
                      <div 
                        className="absolute inset-0 rounded-[18px]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        }}
                      />
                      
                      {/* White logout icon */}
                      <LogOut 
                        className="relative z-10 text-white" 
                        size={32}
                        strokeWidth={2}
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        }}
                      />
                    </div>

                    <span 
                      className="text-xs font-medium text-center leading-tight"
                      style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      Log Out
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Safe area for mobile devices */}
              <div className="h-safe-area-inset-bottom" />
            </div>
          </motion.div>

          {/* Add Icon Bottom Sheet */}
          <AnimatePresence>
            {showAddSheet && (
              <>
                {/* Sheet backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                  onClick={() => setShowAddSheet(false)}
                />

                {/* Bottom sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-[70] max-w-sm mx-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className="rounded-t-3xl overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderBottom: 'none',
                      boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Handle */}
                    <div className="flex justify-center pt-4 pb-2">
                      <div 
                        className="w-12 h-1.5 rounded-full"
                        style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                      />
                    </div>

                    {/* Title */}
                    <div className="px-6 py-2">
                      <h3 className="text-lg font-semibold text-white text-center">
                        Add Icon
                      </h3>
                      <p className="text-sm text-center mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Choose an icon to add to your ME panel
                      </p>
                    </div>

                    {/* Available icons grid */}
                    <div className="px-6 py-6 max-h-[50vh] overflow-y-auto">
                      <div className="grid grid-cols-3 gap-4">
                        {availableItems.map((item, idx) => {
                          const Icon = item.icon
                          return (
                            <motion.button
                              key={item.key}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              onClick={() => handleAddItem(item.key)}
                              className="relative flex flex-col items-center gap-2 group"
                            >
                              <div 
                                className="w-16 h-16 rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-200 group-hover:scale-110"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  backdropFilter: 'blur(20px)',
                                  WebkitBackdropFilter: 'blur(20px)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                                }}
                              >
                                <div 
                                  className="absolute inset-0 rounded-[18px] opacity-40"
                                  style={{
                                    background: getTailwindGradient(item.gradient),
                                    filter: 'blur(8px)',
                                  }}
                                />
                                <div 
                                  className="absolute inset-0 rounded-[18px]"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                                  }}
                                />
                                <Icon 
                                  className="relative z-10 text-white" 
                                  size={32}
                                  strokeWidth={2}
                                  style={{
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                  }}
                                />
                              </div>
                              <span 
                                className="text-xs font-medium text-center leading-tight max-w-[70px] line-clamp-2"
                                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                              >
                                {item.label}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="h-safe-area-inset-bottom" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
