import { User, Award, Crown, Leaf, Sparkles, TrendingUp, Settings } from 'lucide-react'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Building2 } from 'lucide-react'
import { CompanyManager } from './CompanyManager'
import { CompanyManagerWrapper } from './CompanyManagerWrapper'

interface MarketProfilePanelProps {
  isOpen: boolean
  userId: string | null
  accessToken: string | null
  serverUrl: string
  userEmail: string | null
  nadaPoints: number
  onClose: () => void
  onVote?: () => void
  onSubmitIdea?: () => void
  onSettings?: () => void
}

interface UserProgress {
  selectedBadge?: string
}

// NADA Ripple Icon
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

// Badge definitions matching MarketSettings
const BADGES_INFO = [
  {
    id: 'badge-founder',
    name: 'Founder',
    icon: Crown,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'badge-hemp-pioneer',
    name: 'Hemp Pioneer',
    icon: Leaf,
    iconColor: 'text-emerald-400',
    bgGradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'badge-nada-whale',
    name: 'NADA Whale',
    icon: Sparkles,
    iconColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500 to-blue-600',
  }
]

export function MarketProfilePanel({
  isOpen,
  userId,
  accessToken,
  serverUrl,
  userEmail,
  nadaPoints,
  onClose,
  onVote,
  onSubmitIdea,
  onSettings
}: MarketProfilePanelProps) {
  const [userProgress, setUserProgress] = useState<UserProgress>({})
  const [ownedBadges, setOwnedBadges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [equipingBadgeId, setEquipingBadgeId] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [activeTab, setActiveTab] = useState<'badges' | 'companies'>('badges')
  const [showCompanyManager, setShowCompanyManager] = useState(false)

  useEffect(() => {
    if (isOpen && userId && accessToken) {
      fetchUserData()
    }
  }, [isOpen, userId, accessToken]) // Refetch every time the panel opens

  const fetchUserData = async () => {
    if (!userId || !accessToken) return

    setIsLoading(true)
    try {
      // Fetch user progress
      const progressResponse = await fetch(
        `${serverUrl}/user-progress/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setUserProgress(progressData)
        console.log('User progress:', progressData)
      }

      // Fetch owned items to get badges
      const itemsResponse = await fetch(
        `${serverUrl}/user-swag-items/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        const items = itemsData.items || []
        // Filter to only badge items
        const badgeIds = items.filter((id: string) => id.startsWith('badge-'))
        setOwnedBadges(badgeIds)
        console.log('Owned badges:', badgeIds)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get current badge info
  const getCurrentBadge = () => {
    const badgeId = userProgress.selectedBadge
    if (!badgeId || badgeId === 'default') return null
    return BADGES_INFO.find(b => b.id === badgeId)
  }

  const currentBadge = getCurrentBadge()

  // Handle badge equip
  const handleEquipBadge = async (badgeId: string) => {
    if (!userId || !accessToken || equipingBadgeId) return
    
    // If clicking the already active badge, do nothing
    if (userProgress.selectedBadge === badgeId) return
    
    setEquipingBadgeId(badgeId)
    
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/select-badge`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ badge: badgeId })
        }
      )

      if (response.ok) {
        // Update local state immediately
        setUserProgress(prev => ({
          ...prev,
          selectedBadge: badgeId
        }))
        console.log('Badge equipped successfully:', badgeId)
        setShowSuccessToast(true)
      } else {
        console.error('Failed to equip badge:', await response.text())
      }
    } catch (error) {
      console.error('Error equipping badge:', error)
    } finally {
      // Clear loading state after a moment
      setTimeout(() => {
        setEquipingBadgeId(null)
      }, 600)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - hides market content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
            onClick={onClose}
          />

          {/* Profile Panel - Full Screen */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[9995] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable content container */}
            <div className="h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-emerald-900 via-teal-900 to-green-950 pb-24">
              
              {/* Hemp fiber texture overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px'
              }} />

              {/* Profile Header */}
              <div className="relative pt-12 pb-8 px-6 overflow-hidden">
                
                {/* Settings Button - Top Right */}
                <button
                  onClick={() => {
                    onSettings && onSettings()
                    onClose()
                  }}
                  className="fixed top-6 right-6 z-[10000] p-3 rounded-2xl bg-gradient-to-br from-amber-500/90 to-yellow-500/90 backdrop-blur-sm hover:from-amber-400 hover:to-yellow-400 transition-all group border-2 border-amber-300/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:scale-110 active:scale-95"
                >
                  <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" strokeWidth={3} />
                </button>

                {/* Animated background particles */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' stroke='white' stroke-width='2' fill='none' opacity='0.4'/%3E%3Ccircle cx='30' cy='30' r='10' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }} />
                </div>

                {/* Pulsing glow orbs */}
                <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Profile Content */}
                <div className="relative z-10 text-center">
                  {/* Profile Avatar with Globe Aura */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Outer pulsing aura */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 blur-2xl"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          width: '120px',
                          height: '120px',
                          marginLeft: '-10px',
                          marginTop: '-10px'
                        }}
                      />

                      {/* Middle aura */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/40 blur-xl"
                        animate={{
                          scale: [1, 1.25, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.4
                        }}
                        style={{
                          width: '110px',
                          height: '110px',
                          marginLeft: '-5px',
                          marginTop: '-5px'
                        }}
                      />

                      {/* Main profile icon */}
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center border-4 border-emerald-950 shadow-2xl">
                        <User className="w-12 h-12 text-white" strokeWidth={2.5} />
                        
                        {/* Shine overlay */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* User Email */}
                  <h2 className="text-2xl font-black text-white drop-shadow-lg mb-2">
                    {userEmail?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-emerald-200/80 text-sm mb-6">{userEmail}</p>

                  {/* Active Badge Display */}
                  {currentBadge ? (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${currentBadge.bgGradient} blur-md opacity-60`} />
                        <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${currentBadge.bgGradient} flex items-center justify-center`}>
                          <currentBadge.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-emerald-200/60 uppercase tracking-wide">Active Badge</p>
                        <p className="text-sm font-black text-white">{currentBadge.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                        <Award className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-emerald-200/60 uppercase tracking-wide">No Badge</p>
                        <p className="text-sm font-bold text-white/70">Click a badge below to equip</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* NADA Counter Section */}
              <div className="px-6 py-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/80 via-purple-900/80 to-indigo-900/80 p-5 border-2 border-violet-400/30 shadow-2xl">
                  {/* Halftone pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                    backgroundSize: '16px 16px'
                  }} />

                  {/* Glow orb */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-400/20 rounded-full blur-3xl" />

                  <div className="relative z-10 flex items-center justify-center gap-4">
                    {/* NADA Icon */}
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-violet-400/40 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <NadaRippleIcon className="w-9 h-9 text-white" />
                      </div>
                    </div>

                    {/* NADA Count */}
                    <div className="text-5xl font-black text-white drop-shadow-2xl">
                      {nadaPoints} <span className="text-3xl text-violet-200/80">NADA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Actions - Vote & Submit Idea */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Vote Button */}
                  <button
                    onClick={() => {
                      onVote && onVote()
                      onClose()
                    }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-fuchsia-900/60 hover:from-purple-800/80 hover:via-pink-800/80 hover:to-fuchsia-800/80 p-4 border-2 border-purple-400/30 hover:border-purple-400/60 transition-all hover:scale-105 active:scale-95"
                  >
                    {/* Halftone pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '12px 12px'
                    }} />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-300" strokeWidth={2.5} />
                      <span className="text-sm font-black text-white">Vote</span>
                    </div>
                  </button>

                  {/* Submit Idea Button */}
                  <button
                    onClick={() => {
                      onSubmitIdea && onSubmitIdea()
                      onClose()
                    }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/60 via-cyan-900/60 to-teal-900/60 hover:from-blue-800/80 hover:via-cyan-800/80 hover:to-teal-800/80 p-4 border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all hover:scale-105 active:scale-95"
                  >
                    {/* Halftone pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '12px 12px'
                    }} />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <Sparkles className="w-6 h-6 text-cyan-300" strokeWidth={2.5} />
                      <span className="text-sm font-black text-white">Submit Idea</span>
                    </div>
                  </button>

                  {/* My Organizations Button */}
                  <button
                    onClick={() => setShowCompanyManager(true)}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900/60 via-green-900/60 to-teal-900/60 hover:from-emerald-800/80 hover:via-green-800/80 hover:to-teal-800/80 p-4 border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all hover:scale-105 active:scale-95"
                  >
                    {/* Halftone pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '12px 12px'
                    }} />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <Building2 className="w-6 h-6 text-emerald-300" strokeWidth={2.5} />
                      <span className="text-sm font-black text-white">Organizations</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* My Badges Section */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="px-6 pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-300" />
                    <h3 className="font-black text-lg text-white">My Badges</h3>
                    <Badge variant="outline" className="ml-auto bg-emerald-500/20 border-emerald-400/50 text-emerald-300">
                      {ownedBadges.length}
                    </Badge>
                  </div>

                  {ownedBadges.length === 0 ? (
                    <div className="py-12 text-center bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white/50" />
                      </div>
                      <p className="text-sm text-white/80 mb-2 font-semibold">No badges yet</p>
                      <p className="text-xs text-emerald-200/60">Purchase badges in the Swag Shop!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {ownedBadges.map((badgeId) => {
                        const badgeInfo = BADGES_INFO.find(b => b.id === badgeId)
                        if (!badgeInfo) return null

                        const BadgeIcon = badgeInfo.icon
                        const isActive = userProgress.selectedBadge === badgeId

                        return (
                          <div key={badgeId} className="relative group">
                            {/* Comic-style badge card - Now Clickable! */}
                            <button
                              onClick={() => handleEquipBadge(badgeId)}
                              disabled={isActive || equipingBadgeId !== null}
                              className={`relative w-full p-4 rounded-2xl border-4 transition-all ${
                                isActive 
                                  ? 'border-amber-400 bg-amber-500/20 scale-105 cursor-default' 
                                  : 'border-white/20 bg-white/5 hover:border-emerald-400/60 hover:scale-105 cursor-pointer'
                              }`}
                              style={{
                                boxShadow: isActive 
                                  ? '0 0 30px rgba(251, 191, 36, 0.5), 6px 6px 0px 0px rgba(0,0,0,0.4)' 
                                  : '6px 6px 0px 0px rgba(0,0,0,0.3)'
                              }}
                            >
                              {/* Loading Spinner Overlay */}
                              {equipingBadgeId === badgeId && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                                  <div className="w-8 h-8 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                </div>
                              )}

                              {/* Halftone pattern */}
                              <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none" style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                                backgroundSize: '8px 8px'
                              }} />

                              {/* Badge icon */}
                              <div className="mb-3 flex justify-center relative">
                                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${badgeInfo.bgGradient} blur-lg opacity-50`} />
                                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${badgeInfo.bgGradient} flex items-center justify-center border-2 border-white/20 shadow-lg`}>
                                  <BadgeIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                </div>
                              </div>

                              {/* Badge name */}
                              <p className="text-xs font-black text-center text-white line-clamp-2">{badgeInfo.name}</p>

                              {/* Active indicator */}
                              {isActive && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl border-2 border-emerald-950">
                                  <Sparkles className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Success Toast Notification */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
                onAnimationComplete={() => {
                  if (showSuccessToast) {
                    setTimeout(() => setShowSuccessToast(false), 2000)
                  }
                }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 shadow-2xl border-2 border-white/30">
                  {/* Halftone pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                    backgroundSize: '12px 12px'
                  }} />

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl" />

                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-black text-white">Badge Equipped!</p>
                      <p className="text-xs text-white/80">Saved & will persist across sessions</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Company Manager Modal */}
          {showCompanyManager && userId && accessToken && (
            <CompanyManagerWrapper
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              onClose={() => setShowCompanyManager(false)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}