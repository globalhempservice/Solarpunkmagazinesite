import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, TrendingUp, Clock, Sparkles, Store, Zap, Award, Target, MessageSquare } from 'lucide-react'
import { Badge } from './ui/badge'

interface Transaction {
  id: string
  type: 'vote' | 'submit' | 'earn' | 'unlock'
  amount: number
  description: string
  timestamp: string
}

interface NadaWalletPanelProps {
  isOpen: boolean
  onClose: () => void
  nadaPoints: number
  userId: string | null
  accessToken: string | null
  serverUrl: string
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

export function NadaWalletPanel({ isOpen, onClose, nadaPoints, userId, accessToken, serverUrl }: NadaWalletPanelProps) {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalVotes: 0,
    totalIdeasSubmitted: 0,
    totalUnlocks: 0
  })

  // Fetch user market stats and transactions
  useEffect(() => {
    if (isOpen && userId && accessToken) {
      fetchWalletData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, accessToken])

  const fetchWalletData = async () => {
    if (!userId || !accessToken) return
    
    setIsLoading(true)
    
    try {
      // Fetch market stats
      const statsResponse = await fetch(`${serverUrl}/user-market-stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats({
          totalVotes: statsData.totalVotes || 0,
          totalIdeasSubmitted: statsData.totalIdeasSubmitted || 0,
          totalUnlocks: statsData.totalUnlocks || 0
        })
      }
      
      // Fetch recent transactions
      const txResponse = await fetch(`${serverUrl}/nada-transactions/${userId}?limit=20`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (txResponse.ok) {
        const txData = await txResponse.json()
        const formattedTransactions = txData.transactions.map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          timestamp: tx.created_at
        }))
        setRecentTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'vote': return TrendingUp
      case 'submit': return MessageSquare
      case 'earn': return Sparkles
      case 'unlock': return Award
      default: return Sparkles
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'vote': return 'from-purple-500 to-pink-500'
      case 'submit': return 'from-blue-500 to-cyan-500'
      case 'earn': return 'from-emerald-500 to-teal-500'
      case 'unlock': return 'from-amber-500 to-yellow-500'
      default: return 'from-violet-500 to-purple-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with market gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-indigo-950/80 to-blue-950/80 backdrop-blur-md z-[60]"
            onClick={onClose}
          />

          {/* NADA Wallet Panel - Full Page Slide Down */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
              {/* Market Header with Animated Patterns */}
              <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 pt-20 pb-12 px-6 overflow-hidden">
                
                {/* Animated background particles */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' stroke='white' stroke-width='2' fill='none' opacity='0.4'/%3E%3Ccircle cx='30' cy='30' r='10' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }} />
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ y: 100, x: Math.random() * 300, opacity: 0 }}
                      animate={{ 
                        y: -100, 
                        x: Math.random() * 300 + (i % 2 ? 50 : -50),
                        opacity: [0, 0.7, 0]
                      }}
                      transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeInOut'
                      }}
                    >
                      {i % 2 === 0 ? (
                        <Sparkles className="w-5 h-5 text-violet-300" />
                      ) : (
                        <Store className="w-5 h-5 text-pink-300" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="fixed top-6 right-6 z-[100] p-3 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform font-black" strokeWidth={3} />
                </button>

                {/* Title */}
                <div className="relative text-center mb-6">
                  {/* Glow effect behind icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-40 animate-pulse" />
                  
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block mb-3 relative"
                  >
                    <NadaRippleIcon className="w-16 h-16 text-violet-300 drop-shadow-[0_0_15px_rgba(167,139,250,0.8)] filter" />
                  </motion.div>
                  
                  {/* Comic text effect */}
                  <div className="relative">
                    <h2 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-tight mb-1" style={{
                      textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.1)'
                    }}>
                      WALLET
                    </h2>
                    <p className="text-violet-100 font-bold drop-shadow-lg tracking-wide">
                      Your Voice Currency Balance
                    </p>
                  </div>
                </div>

                {/* NADA Balance Card - Icon + Counter Only */}
                <div className="relative max-w-lg mx-auto">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-3xl p-8 border-4 border-violet-400/50 shadow-[0_8px_0_rgba(0,0,0,0.2),0_0_30px_rgba(167,139,250,0.4)]"
                  >
                    {/* Comic dots pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }} />
                    
                    <div className="relative flex items-center justify-center gap-4">
                      <NadaRippleIcon className="w-16 h-16 text-white drop-shadow-lg" />
                      <div className="text-7xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]" style={{
                        textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                      }}>
                        {nadaPoints.toLocaleString()}
                      </div>
                    </div>

                    {/* Comic shine effect */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/40 rounded-full blur-sm" />
                  </motion.div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-500/30 p-4">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }} />
                    <div className="relative text-center">
                      <TrendingUp className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                      <div className="text-2xl font-black text-white">{userStats.totalVotes}</div>
                      <div className="text-xs text-purple-200">Votes</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-2 border-blue-500/30 p-4">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }} />
                    <div className="relative text-center">
                      <MessageSquare className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                      <div className="text-2xl font-black text-white">{userStats.totalIdeasSubmitted}</div>
                      <div className="text-xs text-blue-200">Ideas</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 to-yellow-600/20 backdrop-blur-xl border-2 border-amber-500/30 p-4">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '8px 8px'
                    }} />
                    <div className="relative text-center">
                      <Award className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                      <div className="text-2xl font-black text-white">{userStats.totalUnlocks}</div>
                      <div className="text-xs text-amber-200">Unlocks</div>
                    </div>
                  </div>
                </div>

                {/* How to Earn NADA */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border-3 border-emerald-500/30 p-6">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                  }} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-300" />
                      <h3 className="text-xl font-black text-white">How to Earn NADA</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center border border-amber-400/50 flex-shrink-0 mt-0.5">
                          <Zap className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Read articles in the Magazine</p>
                          <p className="text-xs text-white/60">Earn Powers by reading. Collect enough Powers to exchange for NADA.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/30 flex items-center justify-center border border-orange-400/50 flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-orange-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Build streaks & engage</p>
                          <p className="text-xs text-white/60">Daily reading streaks and sharing articles earn Powers faster.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center border border-emerald-400/50 flex-shrink-0 mt-0.5">
                          <NadaRippleIcon className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Exchange in Magazine Wallet</p>
                          <p className="text-xs text-white/60">Once you have enough Powers, exchange them for NADA to use here.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-white/10 p-6">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-violet-300" />
                      <h3 className="text-xl font-black text-white">Recent Activity</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {recentTransactions.length > 0 ? (
                        recentTransactions.filter(tx => ['vote', 'submit', 'unlock'].includes(tx.type)).map((tx) => {
                          const Icon = getTransactionIcon(tx.type)
                          const colorClass = getTransactionColor(tx.type)
                          
                          return (
                            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center border-2 border-white/20 shadow-lg`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{tx.description}</p>
                                <p className="text-xs text-white/50">{formatTimestamp(tx.timestamp)}</p>
                              </div>
                              
                              <div className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-300' : tx.amount < 0 ? 'text-red-300' : 'text-white/50'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount !== 0 ? tx.amount : '—'}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-sm text-white/50 font-bold">No activity yet</p>
                          <p className="text-xs text-white/30">Start voting and submitting ideas!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom padding for safe scrolling */}
              <div className="h-24" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}