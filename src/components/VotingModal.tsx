import { useState, useEffect } from 'react'
import { X, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Zap, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'

interface VotingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  serverUrl: string
  accessToken: string
  nadaPoints: number
  onVoteSuccess: (newNadaBalance: number) => void
}

// Pre-loaded feature ideas for voting
const FEATURE_IDEAS = [
  {
    id: 'mobile-app',
    title: 'Native Mobile App',
    description: 'iOS and Android apps with offline reading and push notifications for new articles.',
    category: 'Platform',
    nadaCost: 1
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode Theme',
    description: 'A beautiful dark theme option for comfortable reading at night.',
    category: 'UI/UX',
    nadaCost: 1
  },
  {
    id: 'bookmarks',
    title: 'Article Bookmarks',
    description: 'Save articles for later reading and organize them into collections.',
    category: 'Features',
    nadaCost: 1
  },
  {
    id: 'comments',
    title: 'Community Comments',
    description: 'Discuss articles with other readers through a comment system.',
    category: 'Social',
    nadaCost: 1
  },
  {
    id: 'audio',
    title: 'Audio Narration',
    description: 'Listen to articles with AI-powered text-to-speech narration.',
    category: 'Accessibility',
    nadaCost: 1
  },
  {
    id: 'newsletter',
    title: 'Email Newsletter',
    description: 'Weekly digest of top articles delivered to your inbox.',
    category: 'Content',
    nadaCost: 1
  },
  {
    id: 'tags',
    title: 'Article Tags',
    description: 'Advanced filtering with custom tags and multi-tag search.',
    category: 'Features',
    nadaCost: 1
  },
  {
    id: 'reader-stats',
    title: 'Advanced Reader Stats',
    description: 'Detailed analytics about your reading habits and preferences.',
    category: 'Analytics',
    nadaCost: 1
  }
]

export function VotingModal({
  isOpen,
  onClose,
  userId,
  serverUrl,
  accessToken,
  nadaPoints,
  onVoteSuccess
}: VotingModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voting, setVoting] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [votedIdeas, setVotedIdeas] = useState<Set<string>>(new Set())

  const currentIdea = FEATURE_IDEAS[currentIndex]

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (voting || nadaPoints < currentIdea.nadaCost) return

    setVoting(true)
    setDirection(voteType === 'upvote' ? 'right' : 'left')

    try {
      console.log('🗳️ Submitting vote:', {
        ideaId: currentIdea.id,
        userId,
        voteType,
        ideaTitle: currentIdea.title
      })

      const response = await fetch(
        `${serverUrl}/nada-ideas/${currentIdea.id}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            userId,
            vote: voteType,
            ideaTitle: currentIdea.title,
            ideaDescription: currentIdea.description
          })
        }
      )

      console.log('📡 Vote response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Vote failed:', error)
        throw new Error(error.error || 'Failed to vote')
      }

      const data = await response.json()
      const newBalance = data.newNadaBalance

      console.log('✅ Vote successful! New NADA balance:', newBalance)

      // Mark as voted
      setVotedIdeas(prev => new Set([...prev, currentIdea.id]))

      // Wait for animation
      setTimeout(() => {
        // Move to next idea
        if (currentIndex < FEATURE_IDEAS.length - 1) {
          setCurrentIndex(currentIndex + 1)
          // Update balance after each vote
          onVoteSuccess(newBalance)
        } else {
          // All ideas voted - close modal
          onVoteSuccess(newBalance)
          onClose()
        }
        setVoting(false)
        setDirection(null)
      }, 500)

    } catch (error) {
      console.error('❌ Vote error:', error)
      alert(error instanceof Error ? error.message : 'Failed to vote')
      setVoting(false)
      setDirection(null)
    }
  }

  const handleSkip = () => {
    if (voting) return
    
    if (currentIndex < FEATURE_IDEAS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Card Container */}
        <div className="relative h-[600px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ 
                x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                opacity: 0,
                rotate: direction === 'left' ? -10 : direction === 'right' ? 10 : 0
              }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ 
                x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
                opacity: 0,
                rotate: direction === 'left' ? -30 : direction === 'right' ? 30 : 0
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <div className="h-full rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-12 shadow-2xl border-4 border-white/20">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/70">
                      {currentIndex + 1} / {FEATURE_IDEAS.length}
                    </span>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {currentIdea.category}
                    </Badge>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / FEATURE_IDEAS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center justify-center text-center h-[calc(100%-180px)]">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-white/30 rounded-full blur-2xl" />
                      <div className="relative bg-white/20 backdrop-blur-md rounded-full p-6">
                        <TrendingUp className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-5xl font-black text-white mb-6">
                    {currentIdea.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xl text-white/90 max-w-lg leading-relaxed">
                    {currentIdea.description}
                  </p>

                  {/* NADA Cost */}
                  <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-bold">{currentIdea.nadaCost} NADA per vote</span>
                  </div>
                </div>

                {/* Voting Buttons */}
                <div className="flex items-center justify-center gap-6 mt-8">
                  <Button
                    onClick={() => handleVote('downvote')}
                    disabled={voting || nadaPoints < currentIdea.nadaCost}
                    className="w-20 h-20 rounded-full bg-red-500/80 hover:bg-red-600 text-white shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsDown className="w-8 h-8" />
                  </Button>

                  <Button
                    onClick={handleSkip}
                    disabled={voting}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Skip
                  </Button>

                  <Button
                    onClick={() => handleVote('upvote')}
                    disabled={voting || nadaPoints < currentIdea.nadaCost}
                    className="w-20 h-20 rounded-full bg-green-500/80 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className="w-8 h-8" />
                  </Button>
                </div>

                {/* NADA Balance */}
                <div className="text-center mt-6">
                  <p className="text-white/70 text-sm">
                    Your Balance: <span className="font-bold text-white">{nadaPoints} NADA</span>
                  </p>
                  {nadaPoints < currentIdea.nadaCost && (
                    <p className="text-red-300 text-sm mt-1">
                      Not enough NADA to vote
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="text-center mt-6 text-white/70">
          <p className="text-sm">
            👍 Upvote features you want • 👎 Downvote to pass • Skip to move on
          </p>
        </div>
      </motion.div>
    </div>
  )
}