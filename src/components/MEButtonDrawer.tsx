import { motion, AnimatePresence } from 'motion/react'
import {
  User, Settings, Building2, Package, LogOut, FileText,
  Compass, BarChart3, Sparkles, MessageCircle
} from 'lucide-react'
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
  onSettingsClick?: () => void
  onMyArticlesClick?: () => void
  onDashboardClick?: () => void
  onInventoryClick?: () => void
  // PRO (kept optional for future wiring, unused for now)
  onOrganizationsClick?: () => void
  onDiscoveryMatchClick?: () => void
}

// Reusable app icon button inside the drawer
function AppIcon({
  icon: Icon,
  label,
  onClick,
  gradient,
  notificationDot,
}: {
  icon: any
  label: string
  onClick?: () => void
  gradient: string
  notificationDot?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 group"
    >
      <div
        className="w-16 h-16 rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-200 group-hover:scale-110 group-active:scale-95"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Colored glow */}
        <div
          className="absolute inset-0 rounded-[18px] opacity-40"
          style={{ background: gradient, filter: 'blur(8px)' }}
        />
        {/* Glass highlight */}
        <div
          className="absolute inset-0 rounded-[18px]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          }}
        />
        {/* Notification dot */}
        {notificationDot && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
            <div
              className="relative w-5 h-5 bg-[#E8FF00] rounded-full flex items-center justify-center shadow-lg"
              style={{ border: '2px solid rgba(255, 255, 255, 0.3)' }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        )}
        <Icon
          className="relative z-10 text-white"
          size={32}
          strokeWidth={2}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        />
      </div>
      <span
        className="text-xs font-medium text-center leading-tight max-w-[70px]"
        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
      >
        {label}
      </span>
    </button>
  )
}

export function MEButtonDrawer({
  isOpen,
  onClose,
  userId,
  displayName: initialDisplayName,
  avatarUrl: initialAvatarUrl,
  onProfileClick,
  onSettingsClick,
  onMyArticlesClick,
  onDashboardClick,
  onInventoryClick,
}: MEButtonDrawerProps) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [hasNewMatches, setHasNewMatches] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData()
      checkForNewMatches()
    }
  }, [isOpen, userId])

  const loadProfileData = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .single()

      if (data) {
        setDisplayName(data.display_name || initialDisplayName)
        setAvatarUrl(data.avatar_url || initialAvatarUrl)
      }
    } catch {
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
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setHasNewMatches(data.requests?.some((req: any) => req.hasNewRecommendations) || false)
      }
    } catch {
      // ignore
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  const go = (fn?: () => void) => {
    fn?.()
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
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
              {/* Handle bar */}
              <div className="flex justify-center pt-4 pb-2">
                <div
                  className="w-12 h-1.5 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                />
              </div>

              {/* Header — name only */}
              <div className="px-6 pt-2 pb-4 text-center">
                <p
                  className="text-lg font-bold leading-tight"
                  style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                >
                  {displayName || 'Hemp Pioneer'}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  Hemp Pioneer
                </p>
              </div>

              <div className="px-6 pb-6 space-y-5">

                {/* ── Community section label ── */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(16,185,129,0.8)' }}>
                    Your Space
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>

                {/* Community icons row */}
                <div className="grid grid-cols-3 gap-4">
                  <AppIcon
                    icon={FileText}
                    label="My Articles"
                    gradient="linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)"
                    onClick={() => go(onMyArticlesClick)}
                  />
                  <AppIcon
                    icon={BarChart3}
                    label="Dashboard"
                    gradient="linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1)"
                    onClick={() => go(onDashboardClick)}
                  />
                  <AppIcon
                    icon={Package}
                    label="My Swaps"
                    gradient="linear-gradient(135deg, #f59e0b, #f97316, #ef4444)"
                    onClick={() => go(onInventoryClick)}
                  />
                </div>

                {/* ── PRO teaser banner ── */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))',
                    border: '1.5px solid rgba(251,191,36,0.35)',
                    boxShadow: '0 4px 16px rgba(251,191,36,0.1)',
                  }}
                  onClick={() => {/* Coming soon */}}
                >
                  {/* Subtle shimmer */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)',
                    }}
                  />
                  {/* Notification dot if there are new discovery matches */}
                  {hasNewMatches && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E8FF00] rounded-full animate-pulse" />
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <Sparkles size={20} className="text-white relative z-10" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold" style={{ color: 'rgba(251,191,36,0.95)' }}>
                      Unlock PRO
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Organizations · Materials · RFPs
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M6 12l4-4-4-4" stroke="rgba(251,191,36,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>

                {/* ── Divider ── */}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* ── Bottom fixed row: Profile | Settings | Logout ── */}
                <div className="grid grid-cols-3 gap-4">
                  <AppIcon
                    icon={User}
                    label="Profile"
                    gradient="linear-gradient(135deg, #0ea5e9, #a855f7, #ec4899)"
                    onClick={() => go(onProfileClick)}
                  />
                  <AppIcon
                    icon={Settings}
                    label="Settings"
                    gradient="linear-gradient(135deg, #64748b, #475569, #334155)"
                    onClick={() => go(onSettingsClick)}
                  />
                  <AppIcon
                    icon={LogOut}
                    label="Log Out"
                    gradient="linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
                    onClick={handleLogout}
                  />
                </div>

              </div>

              {/* Safe area */}
              <div className="h-safe-area-inset-bottom" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
