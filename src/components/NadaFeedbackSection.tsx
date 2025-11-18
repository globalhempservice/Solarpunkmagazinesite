import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { Lightbulb, ThumbsUp, ThumbsDown, Send, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner@2.0.3'

interface NadaFeedbackSectionProps {
  userId?: string
  accessToken?: string
  serverUrl?: string
}

const NADA_IDEAS = [
  {
    id: 'crypto-exchange',
    title: 'Exchange for Cryptocurrency',
    description: 'Convert NADA to Bitcoin, Ethereum, or other crypto'
  },
  {
    id: 'merchandise',
    title: 'Redeem for Merchandise',
    description: 'Get branded items, books, or physical products'
  },
  {
    id: 'premium-features',
    title: 'Unlock Premium Features',
    description: 'Access exclusive tools, early releases, and special content'
  },
  {
    id: 'gift-cards',
    title: 'Gift Cards & Vouchers',
    description: 'Redeem for Amazon, iTunes, or other gift cards'
  },
  {
    id: 'charity-donations',
    title: 'Donate to Charity',
    description: 'Use your NADA to support causes you care about'
  },
  {
    id: 'nft-access',
    title: 'NFT & Digital Collectibles',
    description: 'Get exclusive digital artwork or collectible NFTs'
  },
  {
    id: 'subscription-discounts',
    title: 'Subscription Discounts',
    description: 'Reduce your monthly subscription fees with NADA'
  },
  {
    id: 'event-tickets',
    title: 'Event Tickets & Access',
    description: 'Redeem for virtual or in-person event tickets'
  }
]

export function NadaFeedbackSection({ userId, accessToken, serverUrl }: NadaFeedbackSectionProps) {
  const [suggestion, setSuggestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0)
  const [votedIdeas, setVotedIdeas] = useState<Set<string>>(new Set())
  const [showVoteSuccess, setShowVoteSuccess] = useState(false)
  const [isLoadingVotes, setIsLoadingVotes] = useState(true)

  // Always initialize motion values (hooks must be called unconditionally)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  const yesOpacity = useTransform(x, [0, 100], [0, 1])
  const noOpacity = useTransform(x, [-100, 0], [1, 0])

  // Load user's previous votes
  useEffect(() => {
    const loadUserVotes = async () => {
      if (!userId || !serverUrl) {
        setIsLoadingVotes(false)
        return
      }

      try {
        const response = await fetch(`${serverUrl}/nada-ideas/user/${userId}/votes`)
        
        if (response.ok) {
          const data = await response.json()
          // votedIdeaIds now contains titles, not IDs
          setVotedIdeas(new Set(data.votedIdeaIds || []))
          
          // Find first unvoted idea by title
          const firstUnvotedIndex = NADA_IDEAS.findIndex(idea => !data.votedIdeaIds.includes(idea.title))
          if (firstUnvotedIndex !== -1) {
            setCurrentIdeaIndex(firstUnvotedIndex)
          }
          
          console.log('✅ Loaded user votes:', data.votedIdeaIds)
        }
      } catch (error) {
        console.error('Failed to load user votes:', error)
      } finally {
        setIsLoadingVotes(false)
      }
    }

    loadUserVotes()
  }, [userId, serverUrl])

  const currentIdea = NADA_IDEAS[currentIdeaIndex]
  const hasMoreIdeas = currentIdeaIndex < NADA_IDEAS.length - 1

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim() || !userId || !accessToken || !serverUrl) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${serverUrl}/nada-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          userId, 
          suggestion: suggestion.trim() 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit suggestion')
      }

      toast.success('💡 Suggestion submitted! Thanks for your input!')
      setSuggestion('')
    } catch (error) {
      console.error('Failed to submit suggestion:', error)
      toast.error('Failed to submit suggestion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!userId || !accessToken || !serverUrl) return
    
    try {
      const response = await fetch(`${serverUrl}/nada-ideas/${currentIdea.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          userId, 
          vote,
          ideaTitle: currentIdea.title,
          ideaDescription: currentIdea.description
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Vote submission failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || `Failed to submit vote (${response.status})`)
      }

      // Mark as voted
      setVotedIdeas(prev => new Set([...prev, currentIdea.title]))
      
      // Show success animation
      setShowVoteSuccess(true)
      setTimeout(() => setShowVoteSuccess(false), 500)

      // Move to next idea
      setTimeout(() => {
        if (hasMoreIdeas) {
          setCurrentIdeaIndex(prev => prev + 1)
        }
      }, 300)
    } catch (error) {
      console.error('Failed to submit vote:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit vote')
    }
  }

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      // Swiped right = YES
      handleVote('yes')
    } else if (info.offset.x < -threshold) {
      // Swiped left = NO
      handleVote('no')
    }
  }

  return (
    <div className="mt-8 space-y-6 border-t-2 border-border pt-6">
      {/* Question Header */}
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h3 className="font-black text-foreground text-lg">
          What would you like to do with these NADAs?
        </h3>
      </div>

      {/* Suggestion Box */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">
          Share your idea
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., Redeem for concert tickets..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSubmitting) {
                handleSubmitSuggestion()
              }
            }}
          />
          <Button
            onClick={handleSubmitSuggestion}
            disabled={!suggestion.trim() || isSubmitting}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Can't Decide? Swipe Game */}
      {userId && accessToken && serverUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              Can't decide? Vote on these ideas!
            </label>
            <span className="text-xs text-muted-foreground">
              {currentIdeaIndex + 1} / {NADA_IDEAS.length}
            </span>
          </div>

          {/* Swipe Card Area */}
          <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden border-2 border-border">
            {isLoadingVotes ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading your votes...</p>
                </div>
              </div>
            ) : votedIdeas.size >= NADA_IDEAS.length ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <div>
                  <Sparkles className="w-12 h-12 text-emerald-500 mb-4 mx-auto" />
                  <h4 className="text-xl font-black text-foreground mb-2">
                    All done! 🎉
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Thanks for sharing your feedback!
                  </p>
                </div>
              </div>
            ) : currentIdea && !votedIdeas.has(currentIdea.title) ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdea.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  style={{ x, rotate, opacity }}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-border cursor-grab active:cursor-grabbing"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <Sparkles className="w-12 h-12 text-emerald-500 mb-4" />
                    <h4 className="text-xl font-black text-foreground mb-2">
                      {currentIdea.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      {currentIdea.description}
                    </p>
                    
                    {/* Swipe Indicators */}
                    <div className="flex items-center gap-8 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Swipe left</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Swipe right</span>
                      </div>
                    </div>
                  </div>

                  {/* Vote overlays */}
                  <motion.div
                    style={{ opacity: yesOpacity }}
                    className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-black rotate-12"
                  >
                    YES!
                  </motion.div>
                  <motion.div
                    style={{ opacity: noOpacity }}
                    className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-black -rotate-12"
                  >
                    NO
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <div>
                  <Sparkles className="w-12 h-12 text-emerald-500 mb-4 mx-auto" />
                  <h4 className="text-xl font-black text-foreground mb-2">
                    All caught up! 🎉
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You've voted on all available ideas!
                  </p>
                </div>
              </div>
            )}

            {/* Success animation */}
            {showVoteSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <ThumbsUp className="w-20 h-20 text-emerald-500" />
              </motion.div>
            )}
          </div>

          {/* Button Controls (alternative to swiping) */}
          {!isLoadingVotes && currentIdea && !votedIdeas.has(currentIdea.title) && votedIdeas.size < NADA_IDEAS.length && (
            <div className="flex gap-3">
              <Button
                onClick={() => handleVote('no')}
                variant="outline"
                className="flex-1 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <ThumbsDown className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400 font-bold">Not Interested</span>
              </Button>
              <Button
                onClick={() => handleVote('yes')}
                variant="outline"
                className="flex-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <ThumbsUp className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Love It!</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}