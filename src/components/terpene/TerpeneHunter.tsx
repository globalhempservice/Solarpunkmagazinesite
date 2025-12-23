import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Compass, Leaf, QrCode, Trophy, 
  Target, MapPin, Camera, BookOpen, Lock,
  CheckCircle, Crown, X, ArrowLeft, Sparkles,
  TrendingUp, Award, Zap
} from 'lucide-react'
import { createClient } from '../../utils/supabase/client'

interface TerpeneHunterProps {
  userId: string
  accessToken: string
  onClose: () => void
}

type View = 'locked' | 'home' | 'hunt' | 'herbarium' | 'scanner'

// Wheel family definitions matching database
const WHEEL_FAMILIES = [
  { id: 'citrus', label: 'Citrus', color: '#FFD700', angle: 0 },
  { id: 'fruity', label: 'Fruity', color: '#FF4500', angle: 36 },
  { id: 'floral', label: 'Floral', color: '#FF6EC7', angle: 72 },
  { id: 'herbal', label: 'Herbal', color: '#9370DB', angle: 108 },
  { id: 'pine', label: 'Pine', color: '#228B22', angle: 144 },
  { id: 'earthy', label: 'Earthy', color: '#8B7355', angle: 180 },
  { id: 'woody', label: 'Woody', color: '#8B4513', angle: 216 },
  { id: 'spice', label: 'Spice', color: '#CD853F', angle: 252 },
  { id: 'sweet', label: 'Sweet', color: '#FFC0CB', angle: 288 },
  { id: 'fresh', label: 'Fresh', color: '#00CED1', angle: 324 },
]

// Core objectives (inner ring)
const CORE_OBJECTIVES = [
  { id: 'energy', label: 'Energy', color: '#f59e0b', icon: '⚡' },
  { id: 'calm', label: 'Calm', color: '#06b6d4', icon: '🧘' },
  { id: 'relax', label: 'Relax', color: '#8b5cf6', icon: '💆' },
  { id: 'sleep', label: 'Sleep', color: '#6366f1', icon: '🌙' },
  { id: 'focus', label: 'Focus', color: '#10b981', icon: '🎯' },
  { id: 'mood', label: 'Mood', color: '#ec4899', icon: '✨' },
]

export function TerpeneHunter({ userId, accessToken, onClose }: TerpeneHunterProps) {
  const [currentView, setCurrentView] = useState<View>('locked')
  const [selectedFamily, setSelectedFamily] = useState<string>('citrus')
  const [selectedObjective, setSelectedObjective] = useState<string>('energy')
  const [isLightTheme, setIsLightTheme] = useState(false)
  const [rotation, setRotation] = useState(0)
  
  // Access control
  const [hasPro, setHasPro] = useState(false)
  const [hasAdultVerification, setHasAdultVerification] = useState(false)
  const [adultVerifiedUntil, setAdultVerifiedUntil] = useState<string | null>(null)
  const [isBangkok, setIsBangkok] = useState(false)

  // Stats from database
  const [collectionStats, setCollectionStats] = useState({
    uniqueCollected: 0,
    totalSpecies: 31,
    todayFinds: 0,
    currentStreak: 0,
    totalXP: 0,
    totalPoints: 0,
  })

  const supabase = createClient()

  // Check theme
  useEffect(() => {
    const checkTheme = () => {
      const html = document.documentElement
      const hasLightTheme = !html.classList.contains('dark') && 
                           !html.classList.contains('hempin') && 
                           !html.classList.contains('solarpunk-dreams') &&
                           !html.classList.contains('midnight-hemp') &&
                           !html.classList.contains('golden-hour')
      setIsLightTheme(hasLightTheme)
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Check access & load stats
  useEffect(() => {
    // Mock unlock for demo
    setHasPro(true)
    setHasAdultVerification(true)
    setIsBangkok(true)
    setAdultVerifiedUntil('2026-01-16')
    setCurrentView('home')

    // Load real stats
    loadStats()
  }, [userId])

  const loadStats = async () => {
    try {
      // Get collection stats
      const { data: stats } = await supabase
        .from('user_terpene_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (stats) {
        setCollectionStats({
          uniqueCollected: stats.unique_terpenes_collected || 0,
          totalSpecies: 31,
          todayFinds: 0, // TODO: Calculate from encounters today
          currentStreak: stats.current_streak || 0,
          totalXP: stats.total_xp_from_terpenes || 0,
          totalPoints: stats.total_points_from_terpenes || 0,
        })
      }
    } catch (err) {
      console.error('Error loading terpene stats:', err)
    }
  }

  const hasAccess = (hasPro || hasAdultVerification) && isBangkok

  // Auto-rotate wheel slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Locked Screen
  if (currentView === 'locked') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
        background: isLightTheme
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-3xl text-center"
          style={{
            background: isLightTheme
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px)',
            border: isLightTheme
              ? '2px solid rgba(0,0,0,0.1)'
              : '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div className="mb-6 relative">
            <div className="w-32 h-32 mx-auto rounded-full blur-lg opacity-30"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316, #fb923c)',
              }}
            />
            <Lock 
              size={48} 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ color: isLightTheme ? '#000' : '#fff' }}
            />
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{
            color: isLightTheme ? '#000' : '#fff'
          }}>
            Terpene Hunter
          </h2>
          
          <p className="text-sm mb-1" style={{
            color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
          }}>
            Bangkok Only
          </p>

          <p className="text-sm mb-6" style={{
            color: isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
          }}>
            Unlock with PRO or Adult Verification
          </p>

          <div className="space-y-3">
            <button
              className="w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #E8FF00, #b8cc00)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(232, 255, 0, 0.4)',
              }}
            >
              <Crown size={20} className="inline mr-2" />
              Upgrade to PRO
            </button>

            <button
              className="w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: isLightTheme
                  ? 'rgba(0,0,0,0.1)'
                  : 'rgba(255,255,255,0.1)',
                color: isLightTheme ? '#000' : '#fff',
                border: isLightTheme
                  ? '2px solid rgba(0,0,0,0.2)'
                  : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <MapPin size={20} className="inline mr-2" />
              Verify at Partner Shop
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Home Screen with Compass Wheel
  if (currentView === 'home') {
    const completionPct = Math.round((collectionStats.uniqueCollected / collectionStats.totalSpecies) * 100)

    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{
        background: isLightTheme
          ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
          style={{
            background: isLightTheme
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            borderBottom: isLightTheme
              ? '1px solid rgba(0,0,0,0.1)'
              : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all hover:scale-110"
            style={{
              background: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <ArrowLeft size={20} style={{ color: isLightTheme ? '#000' : '#fff' }} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="font-bold text-lg" style={{ color: isLightTheme ? '#000' : '#fff' }}>
              Terpene Hunter
            </h1>
            {hasAdultVerification && (
              <div className="flex items-center justify-center gap-1 text-xs"
                style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}
              >
                <CheckCircle size={12} style={{ color: '#10b981' }} />
                Adult Verified • Bangkok
              </div>
            )}
          </div>

          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl text-center"
              style={{
                background: isLightTheme
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: isLightTheme
                  ? '2px solid rgba(0,0,0,0.1)'
                  : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>
                {collectionStats.uniqueCollected}/{collectionStats.totalSpecies}
              </div>
              <div className="text-xs" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                Collected
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl text-center"
              style={{
                background: isLightTheme
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: isLightTheme
                  ? '2px solid rgba(0,0,0,0.1)'
                  : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: '#f59e0b' }}>
                {collectionStats.currentStreak}🔥
              </div>
              <div className="text-xs" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                Day Streak
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl text-center"
              style={{
                background: isLightTheme
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: isLightTheme
                  ? '2px solid rgba(0,0,0,0.1)'
                  : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: '#6366f1' }}>
                {completionPct}%
              </div>
              <div className="text-xs" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                Complete
              </div>
            </motion.div>
          </div>

          {/* Interactive Compass Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative w-80 h-80 mx-auto">
              {/* Outer Ring - Aroma Families */}
              <motion.svg
                className="absolute inset-0"
                viewBox="0 0 320 320"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {WHEEL_FAMILIES.map((family, i) => {
                  const angle = (i * 36) - 90
                  const nextAngle = ((i + 1) * 36) - 90
                  const isSelected = selectedFamily === family.id
                  
                  return (
                    <g key={family.id}>
                      {/* Segment */}
                      <path
                        d={`
                          M 160 160
                          L ${160 + 140 * Math.cos((angle * Math.PI) / 180)} ${160 + 140 * Math.sin((angle * Math.PI) / 180)}
                          A 140 140 0 0 1 ${160 + 140 * Math.cos((nextAngle * Math.PI) / 180)} ${160 + 140 * Math.sin((nextAngle * Math.PI) / 180)}
                          Z
                        `}
                        fill={isSelected ? family.color : `${family.color}40`}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedFamily(family.id)}
                        style={{
                          filter: isSelected ? `drop-shadow(0 0 10px ${family.color})` : 'none',
                        }}
                      />
                      
                      {/* Label */}
                      <text
                        x={160 + 110 * Math.cos(((angle + 18) * Math.PI) / 180)}
                        y={160 + 110 * Math.sin(((angle + 18) * Math.PI) / 180)}
                        textAnchor="middle"
                        fontSize="10"
                        fill={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        transform={`rotate(${angle + 18 + 90}, ${160 + 110 * Math.cos(((angle + 18) * Math.PI) / 180)}, ${160 + 110 * Math.sin(((angle + 18) * Math.PI) / 180)})`}
                      >
                        {family.label.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
              </motion.svg>

              {/* Middle Ring - Core Objectives */}
              <motion.svg
                className="absolute inset-0"
                viewBox="0 0 320 320"
              >
                <circle cx="160" cy="160" r="85" fill="rgba(0,0,0,0.3)" />
                {CORE_OBJECTIVES.map((obj, i) => {
                  const angle = (i * 60) - 90
                  const nextAngle = ((i + 1) * 60) - 90
                  const isSelected = selectedObjective === obj.id
                  
                  return (
                    <g key={obj.id}>
                      <path
                        d={`
                          M 160 160
                          L ${160 + 85 * Math.cos((angle * Math.PI) / 180)} ${160 + 85 * Math.sin((angle * Math.PI) / 180)}
                          A 85 85 0 0 1 ${160 + 85 * Math.cos((nextAngle * Math.PI) / 180)} ${160 + 85 * Math.sin((nextAngle * Math.PI) / 180)}
                          Z
                        `}
                        fill={isSelected ? obj.color : `${obj.color}30`}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedObjective(obj.id)}
                        style={{
                          filter: isSelected ? `drop-shadow(0 0 15px ${obj.color})` : 'none',
                        }}
                      />
                      
                      <text
                        x={160 + 55 * Math.cos(((angle + 30) * Math.PI) / 180)}
                        y={160 + 55 * Math.sin(((angle + 30) * Math.PI) / 180)}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#fff"
                        fontWeight="bold"
                      >
                        {obj.label.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
              </motion.svg>

              {/* Center Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #E8FF00, #b8cc00)',
                    boxShadow: '0 0 30px rgba(232, 255, 0, 0.5)',
                  }}
                >
                  <Target size={32} style={{ color: '#000' }} />
                </motion.div>
              </div>

              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: '2px solid rgba(232, 255, 0, 0.5)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </div>

            {/* Selected Info */}
            <div className="text-center mt-4">
              <div className="text-sm mb-1" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                Hunting for:
              </div>
              <div className="text-xl font-bold" style={{
                color: WHEEL_FAMILIES.find(f => f.id === selectedFamily)?.color || '#fff'
              }}>
                {WHEEL_FAMILIES.find(f => f.id === selectedFamily)?.label} • {CORE_OBJECTIVES.find(o => o.id === selectedObjective)?.label}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('hunt')}
              className="p-6 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, #E8FF00, #b8cc00)',
                boxShadow: '0 8px 24px rgba(232, 255, 0, 0.3)',
              }}
            >
              <Sparkles size={32} className="mx-auto mb-2" style={{ color: '#000' }} />
              <div className="font-bold text-lg" style={{ color: '#000' }}>
                Start Hunt
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
                Find nearby terpenes
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView('herbarium')}
              className="p-6 rounded-2xl text-center"
              style={{
                background: isLightTheme
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                border: isLightTheme
                  ? '2px solid rgba(0,0,0,0.1)'
                  : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <BookOpen size={32} className="mx-auto mb-2" style={{ color: '#a855f7' }} />
              <div className="font-bold text-lg" style={{ color: isLightTheme ? '#000' : '#fff' }}>
                Herbarium
              </div>
              <div className="text-xs mt-1" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                {collectionStats.uniqueCollected} species
              </div>
            </motion.button>
          </div>

          {/* Daily Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl"
            style={{
              background: isLightTheme
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: isLightTheme
                ? '1px solid rgba(0,0,0,0.1)'
                : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: isLightTheme ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }}>
                Today's Progress
              </span>
              <span className="text-xs" style={{ color: '#10b981' }}>
                {collectionStats.todayFinds}/3 finds
              </span>
            </div>
            
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{
              background: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(collectionStats.todayFinds / 3) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp size={16} style={{ color: '#f59e0b' }} />
                <span style={{ color: isLightTheme ? '#000' : '#fff' }}>
                  +{collectionStats.totalXP} XP
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={16} style={{ color: '#E8FF00' }} />
                <span style={{ color: isLightTheme ? '#000' : '#fff' }}>
                  +{collectionStats.totalPoints} HEMP
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Placeholder for other views
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
      background: isLightTheme ? '#fff' : '#000',
    }}>
      <div className="text-center">
        <p className="text-2xl mb-4" style={{ color: isLightTheme ? '#000' : '#fff' }}>
          {currentView.toUpperCase()} View
        </p>
        <p className="text-sm mb-4" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
          Coming soon...
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 rounded-2xl font-semibold"
          style={{
            background: '#E8FF00',
            color: '#000',
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}