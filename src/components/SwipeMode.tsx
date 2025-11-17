import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { PreviewCard } from './PreviewCard'
import { Heart, X, Sparkles, RefreshCw, Clock, User, Grid } from 'lucide-react'
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
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  
  // Create indicator opacity transforms (must be before any early returns)
  const matchIndicatorOpacity = useTransform(x, [0, 100], [0, 1])
  const skipIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])

  const currentArticle = articles[currentIndex]
  
  // Preload next 3 cards
  const visibleCards = articles.slice(currentIndex, currentIndex + 3)

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
      setIsAnimating(false)
      x.set(0)
    }, 400)
  }

  const handleSkip = () => {
    if (!currentArticle || isAnimating) return
    
    setIsAnimating(true)
    setExitDirection('left')
    
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
      setIsAnimating(false)
      x.set(0)
    }, 400)
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
      {/* Stats Pills - Top Section */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 mb-4 sm:mb-6">
        <Badge variant="secondary" className="gap-1.5 text-xs sm:text-sm px-3 py-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold">{articles.length - currentIndex}</span>
          <span className="text-muted-foreground">left</span>
        </Badge>
        <Badge variant="secondary" className="gap-1.5 text-xs sm:text-sm px-3 py-2 shadow-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <Heart className="w-3.5 h-3.5 fill-emerald-500" />
          <span className="font-semibold">{matchedArticles.length}</span>
          <span className="text-emerald-600/70 dark:text-emerald-400/70">matches</span>
        </Badge>
      </div>

      {/* Card Stack - Takes up available space */}
      <div className="relative flex-1 min-h-0 px-4 mb-6 sm:mb-8">
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
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
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
              <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 overflow-hidden flex-shrink-0">
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
                
                {/* Category Badge */}
                <Badge className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border-2">
                  {currentArticle.category}
                </Badge>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2">
                    {currentArticle.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base">
                    {currentArticle.excerpt}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <Button
                  onClick={handleReadNow}
                  variant="outline"
                  className="w-full h-11 sm:h-12 border-2 border-primary/20 hover:bg-primary/5"
                >
                  Read Full Article
                </Button>
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

      {/* Control Panel - Gamified Design */}
      <div className="flex-shrink-0 pb-28">
        {/* Gamified Control Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 px-4">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={isAnimating}
            className="group relative flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Animated Glow Ring */}
            <div className="absolute -inset-3 bg-gradient-to-br from-red-500/30 to-rose-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Circle */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-hover:shadow-xl group-hover:shadow-red-500/60">
              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-400/50 to-transparent" />
              
              {/* Icon */}
              <X className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 transition-transform group-hover:rotate-90 duration-300" strokeWidth={3} />
              
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            
            {/* Label */}
            <span className="text-xs font-bold text-red-600 dark:text-red-400">SKIP</span>
          </button>

          {/* Match Button - Larger & Elevated */}
          <button
            onClick={handleMatch}
            disabled={isAnimating}
            className="group relative flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed -mt-4"
          >
            {/* Large Animated Glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-emerald-400/50 to-teal-500/50 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" style={{ animationDuration: '3s' }} />
            
            {/* Button Circle - Larger */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-2xl shadow-emerald-500/60 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-hover:shadow-emerald-500/80">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Inner glow */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-300/60 to-transparent" />
              
              {/* Icon */}
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white relative z-10 transition-transform group-hover:scale-110 duration-300" strokeWidth={2} />
              
              {/* Double Pulse Rings */}
              <div className="absolute inset-0 rounded-full border-3 border-emerald-300/60 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>
            
            {/* Label with glow */}
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 drop-shadow-lg">MATCH</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={isAnimating}
            className="group relative flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Animated Glow Ring */}
            <div className="absolute -inset-3 bg-gradient-to-br from-primary/30 to-sky-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Circle */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-sky-600 shadow-lg shadow-primary/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-hover:shadow-xl group-hover:shadow-primary/60">
              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-400/50 to-transparent" />
              
              {/* Icon */}
              <RefreshCw className="w-7 h-7 sm:w-9 sm:h-9 text-white relative z-10 transition-transform group-hover:rotate-180 duration-500" strokeWidth={2.5} />
              
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-sky-400/50 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            
            {/* Label */}
            <span className="text-xs font-bold text-primary">RESET</span>
          </button>
        </div>
      </div>
    </div>
  )
})

SwipeMode.displayName = 'SwipeMode'