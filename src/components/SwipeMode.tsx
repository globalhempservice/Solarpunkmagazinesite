import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { PreviewCard } from './PreviewCard'
import { Heart, X, Sparkles, RefreshCw, Clock, User, Grid, ExternalLink, Rss, BookOpen, Zap, ThumbsUp, ThumbsDown, Sun, Lightbulb, Sprout, Wind, Users, Eye, Grid3x3 } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  author?: string
  authorImage?: string
  authorTitle?: string
  media?: Array<{
    type: 'youtube' | 'audio' | 'image' | 'spotify'
    url: string
    caption?: string
  }>
  // External RSS article fields
  isExternal?: boolean
  source?: string
  sourceUrl?: string
}

interface SwipeModeProps {
  articles: Article[]
  onMatch: (article: Article) => void
  onReadArticle: (article: Article) => void
  onSwitchToGrid?: () => void
  onSkip?: () => void
  onReset?: () => void
  isAnimating?: boolean
  onRefReady?: () => void
  accessToken?: string
}

export interface SwipeModeRef {
  handleSkip: () => void
  handleMatch: () => void
  handleReset: () => void
  isAnimating: boolean
}

export const SwipeMode = forwardRef<SwipeModeRef, SwipeModeProps>(({ articles, onMatch, onReadArticle, onSwitchToGrid, onRefReady, accessToken }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedArticles, setMatchedArticles] = useState<Article[]>([])
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showComicFeedback, setShowComicFeedback] = useState<'match' | 'skip' | null>(null)
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  
  // Create indicator opacity transforms (must be before any early returns)
  const matchIndicatorOpacity = useTransform(x, [0, 100], [0, 1])
  const skipIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])

  const currentArticle = articles[currentIndex]
  
  // Calculate points based on article source
  const pointsToEarn = currentArticle?.source === 'rss' ? 5 : 10
  
  // Preload next 3 cards - filter out any articles without valid IDs
  const visibleCards = articles.slice(currentIndex, currentIndex + 3).filter(article => article && article.id)

  // Category config with icons and colors
  const getCategoryConfig = (categoryName: string) => {
    const categories: Record<string, { icon: any, color: string }> = {
      'Renewable Energy': { icon: Sun, color: 'from-amber-500 to-orange-500' },
      'Sustainable Tech': { icon: Lightbulb, color: 'from-blue-500 to-cyan-500' },
      'Green Cities': { icon: Sprout, color: 'from-emerald-500 to-teal-500' },
      'Eco Innovation': { icon: Sparkles, color: 'from-purple-500 to-pink-500' },
      'Climate Action': { icon: Wind, color: 'from-sky-500 to-blue-500' },
      'Community': { icon: Users, color: 'from-rose-500 to-red-500' },
      'Future Vision': { icon: Eye, color: 'from-violet-500 to-purple-500' },
    }
    return categories[categoryName] || { icon: Grid3x3, color: 'from-indigo-500 to-purple-500' }
  }

  // Get random comic words for feedback
  const getComicWord = (type: 'match' | 'skip') => {
    const matchWords = ['BOOM!', 'YEAH!', 'POW!', 'SWEET!', 'NICE!', 'WHAM!']
    const skipWords = ['NOPE!', 'PASS!', 'NEXT!', 'SKIP!', 'NAH!', 'BYE!']
    const words = type === 'match' ? matchWords : skipWords
    return words[Math.floor(Math.random() * words.length)]
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (isAnimating) return
    
    const threshold = 100
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        // Swiped right - MATCH!
        handleMatch()
      } else {
        // Swiped left - SKIP
        handleSkip()
      }
    }
  }

  const handleMatch = () => {
    if (!currentArticle || isAnimating) return
    
    setIsAnimating(true)
    setExitDirection('right')
    setShowComicFeedback('match')
    setMatchedArticles([...matchedArticles, currentArticle])
    onMatch(currentArticle)
    
    // Track the swipe with "liked" = true for matches
    if (accessToken) {
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-swipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ liked: true, articleId: currentArticle.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Points animation will be handled by the header
            console.log(`Swipe points earned: +${data.pointsEarned}`)
          }
        })
        .catch(error => {
          console.error('Failed to track swipe:', error)
        })
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setExitDirection(null)
      setShowComicFeedback(null)
      setIsAnimating(false)
      x.set(0)
    }, 800)
  }

  const handleSkip = () => {
    if (!currentArticle || isAnimating) return
    
    setIsAnimating(true)
    setExitDirection('left')
    setShowComicFeedback('skip')
    
    // Track the swipe with "liked" = false for skips
    if (accessToken) {
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-swipe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ liked: false, articleId: currentArticle.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Silent tracking for skips - no toast
            console.log(`Swipe tracked: ${data.articlesSwiped} total swipes`)
          }
        })
        .catch(error => {
          console.error('Failed to track swipe:', error)
        })
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setExitDirection(null)
      setShowComicFeedback(null)
      setIsAnimating(false)
      x.set(0)
    }, 800)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setMatchedArticles([])
    x.set(0)
    setExitDirection(null)
    setIsAnimating(false)
  }

  const handleReadNow = () => {
    if (currentArticle && !isAnimating) {
      onReadArticle(currentArticle)
    }
  }

  // IMPORTANT: useImperativeHandle must be before any early returns
  useImperativeHandle(ref, () => ({
    handleSkip,
    handleMatch,
    handleReset,
    isAnimating
  }))

  // Notify parent when ref is ready
  useEffect(() => {
    if (onRefReady) {
      onRefReady()
    }
  }, [onRefReady])

  // No more articles
  if (currentIndex >= articles.length) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-6 p-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="text-3xl font-bold mb-2">All Caught Up! 🎉</h3>
            <p className="text-muted-foreground">
              You've reviewed all available articles.
            </p>
          </div>

          {matchedArticles.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border-2 border-emerald-500/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                <h4 className="font-bold text-lg">Your Matches</h4>
              </div>
              <p className="text-3xl font-bold text-emerald-500 mb-2">
                {matchedArticles.length}
              </p>
              <p className="text-sm text-muted-foreground">
                article{matchedArticles.length !== 1 ? 's' : ''} matched
              </p>
            </div>
          )}

          <Button
            onClick={handleReset}
            className="w-full h-14 bg-gradient-to-r from-primary to-sky-500 hover:from-primary/90 hover:to-sky-500/90 text-lg font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col py-4 sm:py-6">
      {/* Comic Feedback Overlay - BIG and CENTERED */}
      <AnimatePresence>
        {showComicFeedback && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ 
              scale: [0, 1.3, 1.1],
              rotate: showComicFeedback === 'match' ? [0, -10, 5] : [0, 10, -5]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            <div className={`
              relative px-12 py-8 rounded-3xl
              ${showComicFeedback === 'match' 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                : 'bg-gradient-to-br from-red-400 to-rose-500'}
              border-6 border-white
              shadow-[0_20px_60px_rgba(0,0,0,0.4)]
            `}>
              {/* Comic-style burst glow */}
              <div className={`
                absolute inset-0 rounded-3xl blur-2xl opacity-80
                ${showComicFeedback === 'match' ? 'bg-green-300' : 'bg-red-300'}
              `} />
              
              {/* Comic word text */}
              <span 
                className="relative block text-6xl sm:text-7xl font-black text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]"
                style={{
                  textShadow: `
                    4px 4px 0 rgba(0,0,0,0.3),
                    -2px -2px 0 rgba(255,255,255,0.3),
                    0 0 20px ${showComicFeedback === 'match' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'}
                  `,
                  WebkitTextStroke: '3px rgba(0,0,0,0.2)'
                }}
              >
                {getComicWord(showComicFeedback)}
              </span>
              
              {/* Comic-style rays */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-8 ${showComicFeedback === 'match' ? 'bg-green-200' : 'bg-red-200'} rounded-full`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                    rotate: `${i * 45}deg`
                  }}
                  initial={{ scale: 0, x: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    x: [0, 50, 60]
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack - Takes up available space WITH PADDING FROM EDGES */}
      <div className="relative flex-1 min-h-0 px-6 sm:px-8 mb-6 sm:mb-8">
        {/* Background cards for depth - Show next 2 cards with PreviewCard component */}
        {visibleCards.slice(1, 3).map((article, index) => (
          <PreviewCard
            key={`preview-${article.id}`}
            article={article}
            scale={1 - (index + 1) * 0.05}
            translateY={(index + 1) * 10}
            zIndex={2 - index}
            opacity={0.6 - (index * 0.2)}
          />
        ))}

        {/* Active Card */}
        {currentArticle && (
          <motion.div
            key={currentArticle.id}
            className="absolute inset-6 sm:inset-8 cursor-grab active:cursor-grabbing"
            style={{
              x,
              rotate,
              opacity,
              zIndex: 10
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={exitDirection ? {
              x: exitDirection === 'right' ? 500 : -500,
              opacity: 0,
              transition: { duration: 0.3 }
            } : {
              scale: 1,
              opacity: 1,
              transition: { duration: 0.3, ease: 'easeOut' }
            }}
          >
            <div className="h-full rounded-3xl border-2 border-border bg-card shadow-2xl overflow-hidden flex flex-col">
              {/* Cover Image */}
              <div className="relative h-52 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 overflow-hidden flex-shrink-0">
                {currentArticle.coverImage ? (
                  <img
                    src={currentArticle.coverImage}
                    alt={currentArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
                    }}
                  />
                ) : currentArticle.media?.[0]?.type === 'image' ? (
                  <img
                    src={currentArticle.media[0].url}
                    alt={currentArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-24 h-24 text-primary/30" />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                
                {/* Category Icon Badge - Sexy and Playful */}
                {(() => {
                  const categoryConfig = getCategoryConfig(currentArticle.category)
                  const CategoryIcon = categoryConfig.icon
                  return (
                    <div className="absolute top-4 right-4">
                      <div className="relative group">
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.color} rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity`} />
                        {/* Icon container */}
                        <div className={`relative p-3 bg-gradient-to-br ${categoryConfig.color} rounded-2xl border-3 border-white/40 shadow-[0_4px_0_rgba(0,0,0,0.2)] backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                          <CategoryIcon className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  )
                })()}
                
                {/* External RSS Badge - Top Left */}
                {currentArticle.isExternal && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white border-2 border-white/30 backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                      <Rss className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span className="font-black" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>RSS FEED</span>
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-4 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3 line-clamp-2">
                    {currentArticle.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 text-base">
                    {currentArticle.excerpt}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {currentArticle.readingTime} min
                  </div>
                  {currentArticle.author && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {currentArticle.author}
                    </div>
                  )}
                </div>

                {/* Read Now Button */}
                {currentArticle.isExternal ? (
                  <Button
                    onClick={() => {
                      if (currentArticle.sourceUrl) {
                        window.open(currentArticle.sourceUrl, '_blank')
                        // Award points for reading external article
                        if (accessToken) {
                          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/external-article-read`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ articleId: currentArticle.id })
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                // Points awarded silently - no toast notification
                                console.log(`+${pointsToEarn} points earned for reading external article`)
                              }
                            })
                            .catch(error => {
                              console.error('Failed to award points:', error)
                            })
                        }
                      }
                    }}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    READ NOW
                    <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded-full font-black text-xs">+{pointsToEarn}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleReadNow}
                    variant="outline"
                    className="w-full h-12 border-2 border-primary/20 hover:bg-primary/5"
                  >
                    Read Full Article
                  </Button>
                )}
              </div>

              {/* Swipe Indicators */}
              <motion.div
                className="absolute top-24 sm:top-32 left-6 sm:left-8 rotate-[-25deg]"
                style={{
                  opacity: matchIndicatorOpacity
                }}
              >
                <div className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-4 border-emerald-500 bg-emerald-500/20 backdrop-blur-sm">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-500">MATCH</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-24 sm:top-32 right-6 sm:right-8 rotate-[25deg]"
                style={{
                  opacity: skipIndicatorOpacity
                }}
              >
                <div className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-4 border-red-500 bg-red-500/20 backdrop-blur-sm">
                  <span className="text-2xl sm:text-3xl font-black text-red-500">SKIP</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Action Buttons - Thumbs Style */}
      <div className="flex-shrink-0 pb-28">
        <div className="flex items-center justify-center gap-8 px-4">
          {/* Skip Button - Thumbs Down */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleSkip}
            disabled={isAnimating}
            className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
            animate={exitDirection === 'left' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-3 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-[0_10px_40px_rgba(239,68,68,0.5)] border-4 border-white/20 group-hover:scale-110 transition-all">
              <ThumbsDown className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </motion.button>

          {/* Match Button - Thumbs Up */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleMatch}
            disabled={isAnimating}
            className="group relative disabled:opacity-50 disabled:cursor-not-allowed"
            animate={exitDirection === 'right' ? { scale: [1, 1.2, 1] } : {}}
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
})

SwipeMode.displayName = 'SwipeMode'