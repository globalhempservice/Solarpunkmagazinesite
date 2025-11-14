import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { PreviewCard } from './PreviewCard'
import { Heart, X, Sparkles, RefreshCw, Clock, User } from 'lucide-react'

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
}

export function SwipeMode({ articles, onMatch, onReadArticle }: SwipeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedArticles, setMatchedArticles] = useState<Article[]>([])
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

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
    <div className="max-w-md mx-auto space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="w-3 h-3" />
            {articles.length - currentIndex} left
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Heart className="w-3 h-3 fill-emerald-500" />
            {matchedArticles.length} matches
          </Badge>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[600px]">
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
            <div className="h-full rounded-3xl border-2 border-border bg-card shadow-2xl overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-72 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 overflow-hidden">
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

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                    {currentArticle.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 text-base">
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
                  className="w-full h-12 border-2 border-primary/20 hover:bg-primary/5"
                >
                  Read Full Article
                </Button>
              </div>

              {/* Swipe Indicators */}
              <motion.div
                className="absolute top-32 left-8 rotate-[-25deg]"
                style={{
                  opacity: useTransform(x, [0, 100], [0, 1])
                }}
              >
                <div className="px-8 py-4 rounded-2xl border-4 border-emerald-500 bg-emerald-500/20 backdrop-blur-sm">
                  <span className="text-3xl font-black text-emerald-500">MATCH</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-32 right-8 rotate-[25deg]"
                style={{
                  opacity: useTransform(x, [-100, 0], [1, 0])
                }}
              >
                <div className="px-8 py-4 rounded-2xl border-4 border-red-500 bg-red-500/20 backdrop-blur-sm">
                  <span className="text-3xl font-black text-red-500">SKIP</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 pb-4">
        {/* Skip Button */}
        <Button
          onClick={handleSkip}
          disabled={isAnimating}
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/10 p-0 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>

        {/* Match Button */}
        <Button
          onClick={handleMatch}
          disabled={isAnimating}
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 p-0 shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart className="w-10 h-10 text-white fill-white" />
        </Button>

        {/* Reset Button */}
        <Button
          onClick={handleReset}
          disabled={isAnimating}
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 hover:border-primary p-0 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}