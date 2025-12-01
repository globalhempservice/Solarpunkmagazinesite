import { useState } from 'react'
import { X, ThumbsUp, ThumbsDown, Smartphone, Moon, Bookmark, MessageCircle, Headphones, Mail, Tag, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react'

interface VotingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  serverUrl: string
  accessToken: string | null
  nadaPoints?: number
  onVoteSuccess?: (newNadaBalance: number) => void
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
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="1" />
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" />
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" fill="none" />
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  )
}

// Pre-loaded feature ideas for voting
const FEATURE_IDEAS = [
  {
    id: 'mobile-app',
    title: 'Native Mobile App',
    description: 'iOS and Android apps with offline reading and push notifications for new articles.',
    category: 'Platform',
    icon: Smartphone,
    iconColor: 'from-blue-400 to-cyan-400',
    iconBg: 'bg-blue-500/20',
    nadaCost: 1
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode Theme',
    description: 'A beautiful dark theme option for comfortable reading at night.',
    category: 'UI/UX',
    icon: Moon,
    iconColor: 'from-indigo-400 to-purple-400',
    iconBg: 'bg-indigo-500/20',
    nadaCost: 1
  },
  {
    id: 'bookmarks',
    title: 'Article Bookmarks',
    description: 'Save articles for later reading and organize them into collections.',
    category: 'Features',
    icon: Bookmark,
    iconColor: 'from-amber-400 to-orange-400',
    iconBg: 'bg-amber-500/20',
    nadaCost: 1
  },
  {
    id: 'comments',
    title: 'Community Comments',
    description: 'Discuss articles with other readers through a comment system.',
    category: 'Social',
    icon: MessageCircle,
    iconColor: 'from-pink-400 to-rose-400',
    iconBg: 'bg-pink-500/20',
    nadaCost: 1
  },
  {
    id: 'audio',
    title: 'Audio Narration',
    description: 'Listen to articles with AI-powered text-to-speech narration.',
    category: 'Accessibility',
    icon: Headphones,
    iconColor: 'from-green-400 to-emerald-400',
    iconBg: 'bg-green-500/20',
    nadaCost: 1
  },
  {
    id: 'newsletter',
    title: 'Email Newsletter',
    description: 'Weekly digest of top articles delivered to your inbox.',
    category: 'Content',
    icon: Mail,
    iconColor: 'from-red-400 to-pink-400',
    iconBg: 'bg-red-500/20',
    nadaCost: 1
  },
  {
    id: 'tags',
    title: 'Article Tags',
    description: 'Advanced filtering with custom tags and multi-tag search.',
    category: 'Features',
    icon: Tag,
    iconColor: 'from-teal-400 to-cyan-400',
    iconBg: 'bg-teal-500/20',
    nadaCost: 1
  },
  {
    id: 'reader-stats',
    title: 'Advanced Reader Stats',
    description: 'Detailed analytics about your reading habits and preferences.',
    category: 'Analytics',
    icon: BarChart3,
    iconColor: 'from-violet-400 to-fuchsia-400',
    iconBg: 'bg-violet-500/20',
    nadaCost: 1
  }
]

export function VotingModal({
  isOpen,
  onClose,
  userId,
  serverUrl,
  accessToken,
  nadaPoints = 0,
  onVoteSuccess
}: VotingModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voting, setVoting] = useState(false)
  const [showNadaDeduction, setShowNadaDeduction] = useState(false)
  const [comicText, setComicText] = useState<{ text: string; type: 'positive' | 'negative' } | null>(null)
  const [exitingCardDirection, setExitingCardDirection] = useState<'left' | 'right' | null>(null)

  const handleVote = async (voteType: 'upvote' | 'downvote', index: number) => {
    const idea = FEATURE_IDEAS[index]
    if (voting || nadaPoints < idea.nadaCost || !userId || !accessToken) return

    setVoting(true)
    
    // Step 1: Slide card out
    setExitingCardDirection(voteType === 'upvote' ? 'right' : 'left')
    
    // Step 2: Immediately show comic text (overlap with card slide)
    setTimeout(() => {
      setComicText({
        text: voteType === 'upvote' ? 'YASS!' : 'NOPE!',
        type: voteType === 'upvote' ? 'positive' : 'negative'
      })
    }, 50)

    // Step 3: Immediately deduct NADA (overlap with comic)
    setTimeout(() => {
      setShowNadaDeduction(true)
      setTimeout(() => setShowNadaDeduction(false), 500)
    }, 100)

    try {
      console.log('🗳️ Submitting vote:', {
        ideaId: idea.id,
        userId,
        voteType,
        ideaTitle: idea.title
      })

      const response = await fetch(
        `${serverUrl}/nada-ideas/${idea.id}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            userId,
            vote: voteType,
            ideaTitle: idea.title,
            ideaDescription: idea.description
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Vote failed:', error)
        throw new Error(error.error || 'Failed to vote')
      }

      const data = await response.json()
      const newBalance = data.newNadaBalance

      console.log('✅ Vote successful! New NADA balance:', newBalance)

      // Update balance
      if (onVoteSuccess) onVoteSuccess(newBalance)

      // Step 4: After animations, move to next card (faster)
      setTimeout(() => {
        setComicText(null)
        setExitingCardDirection(null)
        
        if (index < FEATURE_IDEAS.length - 1) {
          setCurrentIndex(index + 1)
        } else {
          // All ideas voted - close modal
          onClose()
        }
        setVoting(false)
      }, 600)

    } catch (error) {
      console.error('❌ Vote error:', error)
      alert(error instanceof Error ? error.message : 'Failed to vote')
      setVoting(false)
      setComicText(null)
      setExitingCardDirection(null)
    }
  }

  if (!isOpen) return null

  // Get the cards to render (current + next 2)
  const cardsToRender = [currentIndex, currentIndex + 1, currentIndex + 2]
    .filter(i => i < FEATURE_IDEAS.length)

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 select-none">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100000] p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Progress Bar */}
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-white">
                {currentIndex + 1} / {FEATURE_IDEAS.length}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / FEATURE_IDEAS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white shadow-lg"
            aria-label="Close"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        {/* NADA Info Row */}
        <div className="flex items-center gap-3">
          {/* NADA Balance */}
          <div className="relative flex items-center gap-2 px-4 py-2 bg-violet-900/40 backdrop-blur-md rounded-full border border-violet-400/30">
            <NadaRippleIcon className="w-5 h-5 text-violet-300" />
            <span className="font-black text-white">{nadaPoints}</span>
            
            {/* -1 Animation */}
            <AnimatePresence>
              {showNadaDeduction && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -30, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-red-400 font-black text-sm"
                >
                  -1
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cost per vote */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full border border-violet-400/30">
            <NadaRippleIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-black text-white">1 NADA per vote</span>
          </div>
        </div>
      </div>

      {/* Comic Text Effect - Center Screen */}
      <AnimatePresence>
        {comicText && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: comicText.type === 'positive' ? 5 : -5 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="fixed inset-0 z-[100001] flex items-center justify-center pointer-events-none"
          >
            <div 
              className={`text-8xl font-black uppercase ${
                comicText.type === 'positive' ? 'text-green-400' : 'text-red-500'
              }`}
              style={{
                textShadow: `
                  6px 6px 0px rgba(0,0,0,0.4),
                  -3px -3px 0px white,
                  3px -3px 0px white,
                  -3px 3px 0px white,
                  3px 3px 0px white
                `,
                WebkitTextStroke: '4px white'
              }}
            >
              {comicText.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Deck Container */}
      <div className="fixed inset-0 flex items-center justify-center px-6 pt-40 pb-36">
        <div className="relative w-full max-w-md h-full">
          {/* Render deck of 3 cards */}
          {cardsToRender.reverse().map((index, stackIndex) => (
            <FeatureCard
              key={FEATURE_IDEAS[index].id}
              idea={FEATURE_IDEAS[index]}
              index={index}
              stackIndex={cardsToRender.length - 1 - stackIndex}
              isTop={index === currentIndex}
              onVote={(voteType) => handleVote(voteType, index)}
              canVote={!voting && nadaPoints >= FEATURE_IDEAS[index].nadaCost}
              exitDirection={index === currentIndex ? exitingCardDirection : null}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons - Above ME navbar */}
      <div className="fixed bottom-24 left-0 right-0 z-[100000]">
        <div className="flex items-center justify-center gap-8 px-4">
          {/* Downvote Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => !voting && handleVote('downvote', currentIndex)}
            disabled={voting || nadaPoints < FEATURE_IDEAS[currentIndex].nadaCost}
            className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
            animate={exitingCardDirection === 'left' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-3 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-[0_10px_40px_rgba(239,68,68,0.5)] border-4 border-white/20 group-hover:scale-110 transition-all">
              <ThumbsDown className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </motion.button>

          {/* Upvote Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => !voting && handleVote('upvote', currentIndex)}
            disabled={voting || nadaPoints < FEATURE_IDEAS[currentIndex].nadaCost}
            className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
            animate={exitingCardDirection === 'right' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-3 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.5)] border-4 border-white/20 group-hover:scale-110 transition-all">
              <ThumbsUp className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  idea: typeof FEATURE_IDEAS[0]
  index: number
  stackIndex: number
  isTop: boolean
  onVote: (voteType: 'upvote' | 'downvote') => void
  canVote: boolean
  exitDirection: 'left' | 'right' | null
}

function FeatureCard({ idea, index, stackIndex, isTop, onVote, canVote, exitDirection }: FeatureCardProps) {
  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    
    // Get screen width for threshold calculation (30% of screen)
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375
    const threshold = screenWidth * 0.3
    
    if (Math.abs(info.offset.x) > threshold && canVote) {
      // Swiped
      const direction = info.offset.x > 0 ? 'upvote' : 'downvote'
      onVote(direction)
    }
  }

  // Calculate scale and position based on stack depth
  const scale = 1 - (stackIndex * 0.05)
  const yOffset = stackIndex * 10
  const zIndex = 100 - stackIndex

  // Exit animation when card is voted
  const getExitX = () => {
    if (exitDirection === 'left') return -1000
    if (exitDirection === 'right') return 1000
    return 0
  }

  const IconComponent = idea.icon

  return (
    <motion.div
      drag={isTop && !exitDirection ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ 
        x: isTop ? x : 0,
        scale,
        y: yOffset,
        zIndex
      }}
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      animate={{ 
        scale: exitDirection ? 0.9 : scale, 
        y: yOffset, 
        opacity: 1,
        x: getExitX()
      }}
      transition={{ 
        type: 'spring', 
        damping: 20, 
        stiffness: 200,
        x: { duration: 0.4, ease: 'easeInOut' }
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      {/* Feature Card */}
      <div className="h-full rounded-[3rem] bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 shadow-[0_20px_100px_rgba(139,92,246,0.5)] border-4 border-white/10 flex flex-col relative overflow-visible">
        {/* Halftone pattern */}
        <div className="absolute inset-0 opacity-20 rounded-[3rem] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }} />

        {/* Category Badge - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30">
            <span className="text-sm font-black text-white">{idea.category}</span>
          </div>
        </div>

        {/* Content - Centered */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${idea.iconColor} ${idea.iconBg} backdrop-blur-md border-4 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center`}>
              <IconComponent className="w-24 h-24 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight px-4">
            {idea.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-white/90 max-w-sm leading-relaxed px-4">
            {idea.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}