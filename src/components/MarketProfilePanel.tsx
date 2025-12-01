import { User, TrendingUp, Settings, ShoppingBag, Sparkles, Puzzle } from 'lucide-react'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Building2 } from 'lucide-react'
import { CompanyManager } from './CompanyManager'
import { CompanyManagerWrapper } from './CompanyManagerWrapper'
import { BadgeDisplay } from './BadgeDisplay'
import { PluginsShop } from './PluginsShop'

interface MarketProfilePanelProps {
  isOpen: boolean
  userId: string | null
  accessToken: string | null
  serverUrl: string
  userEmail: string | null
  nadaPoints: number
  equippedBadgeId?: string | null
  profileBannerUrl?: string | null
  onClose: () => void
  onVote?: () => void
  onSubmitIdea?: () => void
  onSettings?: () => void
  onNavigateToSwagMarketplace?: () => void
  onNadaUpdate?: (newBalance: number) => void
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

export function MarketProfilePanel({
  isOpen,
  userId,
  accessToken,
  serverUrl,
  userEmail,
  nadaPoints,
  equippedBadgeId,
  profileBannerUrl,
  onClose,
  onVote,
  onSubmitIdea,
  onSettings,
  onNavigateToSwagMarketplace,
  onNadaUpdate
}: MarketProfilePanelProps) {
  const [showCompanyManager, setShowCompanyManager] = useState(false)
  const [showPluginsShop, setShowPluginsShop] = useState(false)
  const [currentNadaPoints, setCurrentNadaPoints] = useState(nadaPoints)

  useEffect(() => {
    setCurrentNadaPoints(nadaPoints)
  }, [nadaPoints])

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

              {/* Profile Header with Banner Background */}
              <div className="relative min-h-[350px] flex items-end pb-6 overflow-hidden">
                {/* Banner Background */}
                {profileBannerUrl ? (
                  <>
                    <img
                      src={profileBannerUrl}
                      alt="Profile Banner"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
                  </>
                ) : (
                  // Default gradient if no banner
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-950" />
                )}

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

                {/* Floating Business Card */}
                <div className="relative w-full px-6 z-10">
                  <div className="max-w-md mx-auto">
                    {/* Glass morphism card */}
                    <div className="relative group">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                      
                      {/* Main card */}
                      <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                          {/* Avatar with badge */}
                          <div className="relative mb-4">
                            {/* Avatar glow */}
                            <div className="absolute -inset-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-xl opacity-60 animate-pulse" />
                            
                            {/* Avatar container */}
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-1 shadow-xl">
                              <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                                <User className="w-12 h-12 text-white" strokeWidth={2.5} />
                              </div>
                            </div>

                            {/* Equipped Badge - positioned at bottom right */}
                            {equippedBadgeId && (
                              <div className="absolute -bottom-2 -right-2 transform scale-90">
                                <BadgeDisplay
                                  badgeId={equippedBadgeId}
                                  size="md"
                                  equipped={true}
                                />
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="w-full">
                            <h2 className="text-2xl font-black text-white drop-shadow-lg mb-1">
                              {userEmail?.split('@')[0] || 'User'}
                            </h2>
                            {userEmail && (
                              <p className="text-white/70 text-sm truncate mb-4">
                                {userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
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

                  {/* Plugins Shop Button */}
                  <button
                    onClick={() => setShowPluginsShop(true)}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/60 via-violet-900/60 to-fuchsia-900/60 hover:from-purple-800/80 hover:via-violet-800/80 hover:to-fuchsia-800/80 p-4 border-2 border-purple-400/30 hover:border-purple-400/60 transition-all hover:scale-105 active:scale-95"
                  >
                    {/* Halftone pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '12px 12px'
                    }} />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <Puzzle className="w-6 h-6 text-purple-300" strokeWidth={2.5} />
                      <span className="text-sm font-black text-white">Plugins Shop</span>
                    </div>
                  </button>
                </div>
              </div>


            </div>
          </motion.div>

          {/* Company Manager Modal */}
          {showCompanyManager && userId && accessToken && (
            <CompanyManagerWrapper
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              onClose={() => setShowCompanyManager(false)}
            />
          )}

          {/* Plugins Shop Modal */}
          {showPluginsShop && userId && accessToken && (
            <PluginsShop
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              nadaPoints={currentNadaPoints}
              onClose={() => setShowPluginsShop(false)}
              onPurchaseComplete={(newBalance) => {
                setCurrentNadaPoints(newBalance)
                onNadaUpdate && onNadaUpdate(newBalance)
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}