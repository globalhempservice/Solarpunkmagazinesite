import { motion, AnimatePresence } from 'motion/react'
import { User, Settings, Building2, Package, LogOut, X, FileText, Compass, Inbox } from 'lucide-react'
import { createClient } from '../utils/supabase/client'
import { useEffect, useState } from 'react'
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
  onSwapInboxClick?: () => void
  onSettingsClick?: () => void
  onMyArticlesClick?: () => void
  onDiscoveryMatchClick?: () => void
}

export function MEButtonDrawer({ 
  isOpen, 
  onClose, 
  userId, 
  displayName: initialDisplayName, 
  avatarUrl: initialAvatarUrl,
  onProfileClick,
  onOrganizationsClick,
  onInventoryClick,
  onSwapInboxClick,
  onSettingsClick,
  onMyArticlesClick,
  onDiscoveryMatchClick
}: MEButtonDrawerProps) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [hasNewMatches, setHasNewMatches] = useState(false)

  // Fetch fresh profile data when drawer opens
  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData()
      checkForNewMatches()
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
      // Fall back to initial values
      setDisplayName(initialDisplayName)
      setAvatarUrl(initialAvatarUrl)
    }
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
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear localStorage
      localStorage.clear()
      
      // Reload the page to reset all state and show AuthForm
      window.location.reload()
    } catch (error) {
      console.error('Error during logout:', error)
      // Still reload on error to ensure clean state
      window.location.reload()
    }
  }

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      onClick: () => {
        onProfileClick?.()
        onClose()
      },
      gradient: 'from-sky-500 via-purple-500 to-pink-500'
    },
    {
      icon: Compass,
      label: 'Discovery Match',
      onClick: () => {
        onDiscoveryMatchClick?.()
        onClose()
      },
      gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500'
    },
    {
      icon: FileText,
      label: 'My Articles',
      onClick: () => {
        onMyArticlesClick?.()
        onClose()
      },
      gradient: 'from-blue-500 via-indigo-500 to-violet-500'
    },
    {
      icon: Building2,
      label: 'My Organizations',
      onClick: () => {
        onOrganizationsClick?.()
        onClose()
      },
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
    },
    {
      icon: Package,
      label: 'My Inventory',
      onClick: () => {
        onInventoryClick?.()
        onClose()
      },
      gradient: 'from-amber-500 via-orange-500 to-red-500'
    },
    {
      icon: Inbox,
      label: 'SWAP Inbox',
      onClick: () => {
        onSwapInboxClick?.()
        onClose()
      },
      gradient: 'from-fuchsia-500 via-purple-500 to-pink-500'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        onSettingsClick?.()
        onClose()
      },
      gradient: 'from-slate-500 via-gray-500 to-zinc-500'
    }
  ]

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
            onClick={onClose}
          />

          {/* Drawer - slides up from bottom */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-primary/20 rounded-t-3xl shadow-2xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={displayName}
                        className="w-12 h-12 rounded-full border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center border-2 border-primary/30">
                        <span className="text-white font-bold text-lg">
                          {displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full" />
                  </div>

                  {/* User info */}
                  <div>
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-sm text-muted-foreground">Member</p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Menu items */}
            <div className="px-4 py-6 space-y-2 max-h-[60vh] overflow-y-auto">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={item.onClick}
                    disabled={item.badge === 'Soon'}
                    className="w-full group relative"
                  >
                    {/* Pulsing notification OUTSIDE the pill for Discovery Match */}
                    {item.label === 'Discovery Match' && hasNewMatches && (
                      <div className="absolute -top-1 -left-1 z-30">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
                          <div className="relative w-6 h-6 bg-[#E8FF00] border-[3px] border-[#1a1d29] rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-[#1a1d29] rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 group-hover:border-primary/30 transition-all group-disabled:opacity-50">
                      {/* Icon circle */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center relative overflow-hidden`}>
                        {/* Shine effect */}
                        <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-full blur-md" />
                        <Icon className="w-6 h-6 text-white relative z-10" />
                      </div>

                      {/* Label */}
                      <span className="flex-1 text-left font-medium">{item.label}</span>

                      {/* Badge */}
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                          {item.badge}
                        </span>
                      )}

                      {/* Arrow */}
                      <svg
                        className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                )
              })}

              {/* Logout button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                onClick={handleLogout}
                className="w-full group relative mt-4"
              >
                {/* Red gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity" />
                
                {/* Content */}
                <div className="relative flex items-center gap-4 p-4 rounded-xl border border-red-500/20 bg-card/50 group-hover:border-red-500/50 transition-all">
                  {/* Icon circle */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-full blur-md" />
                    <LogOut className="w-6 h-6 text-white relative z-10" />
                  </div>

                  <span className="flex-1 text-left font-medium text-red-500">Log Out</span>
                </div>
              </motion.button>
            </div>

            {/* Safe area for mobile devices */}
            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}