import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { 
  ArrowLeft, 
  Clock, 
  Heart, 
  Share2, 
  Volume2, 
  VolumeX, 
  Linkedin,
  Instagram,
  Twitter,
  Copy,
  Check,
  X as XIcon,
  TrendingUp,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Award,
  Book,
  Trophy,
  Flame,
  Sparkles,
  Zap,
  ExternalLink,
  ArrowRight,
  Lock,
  FileText,
  Download,
  Image as ImageIcon,
  Rss,
  Globe
} from "lucide-react"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { PlaceholderArt } from "./PlaceholderArt"
import { ShareButton } from "./ShareButton"
import { isFeatureUnlocked, FEATURE_UNLOCKS } from "../utils/featureUnlocks"
import { FeatureUnlockModal } from "./FeatureUnlockModal"
import { ClaimPointsButton } from "./ClaimPointsButton"
import { projectId } from "../utils/supabase/info"
import { toast } from 'sonner@2.0.3'

interface MediaItem {
  type: 'youtube' | 'audio' | 'image' | 'pdf'
  url: string
  caption?: string
  title?: string
  previewUrl?: string
  isLinkedInDocument?: boolean
}

interface Article {
  id: string
  title: string
  content: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  source?: string
  sourceUrl?: string
  media?: MediaItem[]
  author?: string
  authorImage?: string
  authorTitle?: string
  publishDate?: string
  feedTitle?: string // RSS feed title
  feedUrl?: string // RSS feed URL
  siteDomain?: string // Origin website domain
  siteTitle?: string // Origin website title
  siteFavicon?: string // Origin website favicon
  siteImage?: string // Origin website image/logo
}

interface ArticleReaderProps {
  article: Article
  onBack: () => void
  allArticles?: Article[]
  userProgress?: {
    points: number
    currentStreak: number
    longestStreak: number
    totalArticlesRead: number
    readArticles?: string[]
  } | null
  suggestedArticles?: Article[]
  onArticleSelect?: (article: Article) => void
  accessToken?: string
  userId?: string | null
  onProgressUpdate?: (progress: any) => void
}

export function ArticleReader({ article, onBack, allArticles = [], userProgress, suggestedArticles, onArticleSelect, accessToken, userId, onProgressUpdate }: ArticleReaderProps) {
  const [isSliding, setIsSliding] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [claimingPoints, setClaimingPoints] = useState(false)
  const [pointsClaimed, setPointsClaimed] = useState(false)
  const [pointsEarned, setPointsEarned] = useState<number>(0)

  // Check if article is already read
  const isAlreadyRead = userProgress?.readArticles?.includes(article.id) || false
  
  // Determine if this is an RSS article to show correct points
  const isRssArticle = article.source === 'rss'
  const expectedPoints = isRssArticle ? 5 : 10

  // Reset points claimed state when article changes
  useEffect(() => {
    setPointsClaimed(false)
    setPointsEarned(0)
    setClaimingPoints(false)
  }, [article.id])

  // Debug: Log media to console
  console.log('📰 Article Media:', article.media)
  console.log('📄 PDF count:', article.media?.filter(m => m.type === 'pdf').length || 0)

  const handleExploreMore = () => {
    // Filter out the current article and select a random one
    const otherArticles = allArticles.filter(a => a.id !== article.id)
    if (otherArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherArticles.length)
      const randomArticle = otherArticles[randomIndex]
      if (onArticleSelect) {
        onArticleSelect(randomArticle)
      }
    } else {
      // If no other articles, just go back to feed
      window.scrollTo({ top: 0, behavior: 'smooth' })
      onBack()
    }
  }

  const handleSuggestedArticleClick = (suggestedArticle: Article) => {
    // Trigger slide animation
    setIsSliding(true)
    
    // After animation starts, change the article
    setTimeout(() => {
      if (onArticleSelect) {
        onArticleSelect(suggestedArticle)
      }
      setIsSliding(false)
    }, 300)
  }

  const handleClaimPoints = async () => {
    if (!userId || !accessToken || isAlreadyRead || claimingPoints || pointsClaimed) return

    setClaimingPoints(true)

    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`
      
      // Step 1: Start reading session to get a read token
      const startResponse = await fetch(`${serverUrl}/articles/${article.id}/start-reading`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!startResponse.ok) {
        throw new Error('Failed to start reading session')
      }

      const { readToken } = await startResponse.json()

      // Step 2: Wait 2 seconds (minimum required time)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 3: Mark as read with security metrics
      const response = await fetch(`${serverUrl}/users/${userId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          articleId: article.id,
          readToken,
          readingStartTime: Date.now() - 2500, // 2.5 seconds ago
          scrollDepth: 100, // Full scroll
          scrollEvents: 5,
          mouseMovements: 10,
          focusTime: 2500,
          fingerprint: 'web-reader'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPointsClaimed(true)
        
        // Save the points earned from the response
        if (data.pointsEarned) {
          setPointsEarned(data.pointsEarned)
        }
        
        // Update parent progress
        if (onProgressUpdate && data.progress) {
          onProgressUpdate(data.progress)
        }

        // Show achievement notifications if any were unlocked
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement: any) => {
            toast.success(`🎉 Achievement Unlocked: ${achievement.name || achievement.achievement_id}!`, {
              description: achievement.description ? `${achievement.description} (+${achievement.points} pts)` : `You earned ${achievement.points} bonus points!`,
              duration: 6000
            })
          })
        }

        console.log('✅ Points claimed successfully!', `Earned: ${data.pointsEarned} points`, data.newAchievements ? `Unlocked ${data.newAchievements.length} achievements!` : '')
      } else {
        const error = await response.json()
        console.error('Failed to claim points:', error)
        alert(`Could not claim points: ${error.details || error.error}`)
      }
    } catch (error: any) {
      console.error('Error claiming points:', error)
      alert('Failed to claim points. Please try again.')
    } finally {
      setClaimingPoints(false)
    }
  }

  const renderMedia = (mediaItem: MediaItem, index: number) => {
    switch (mediaItem.type) {
      case 'youtube':
        const videoId = extractYouTubeId(mediaItem.url)
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      case 'audio':
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <audio controls className="w-full">
                <source src={mediaItem.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      case 'image':
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="rounded-lg overflow-hidden border border-border">
              <ImageWithFallback
                src={mediaItem.url}
                alt={mediaItem.caption || 'Article image'}
                className="w-full"
              />
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      case 'pdf':
        const isLinkedInDoc = (mediaItem as any).isLinkedInDocument
        const previewUrl = (mediaItem as any).previewUrl
        
        return (
          <div key={index} className="my-6 space-y-3">
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg mb-1">
                    {mediaItem.title || 'Document'}
                  </h4>
                  {isLinkedInDoc && (
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mb-2">
                      LinkedIn Document (Preview Only)
                    </p>
                  )}
                  {mediaItem.caption && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {mediaItem.caption}
                    </p>
                  )}
                  
                  {/* Preview Image */}
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt={`Preview of ${mediaItem.title || 'document'}`}
                      className="w-full rounded-lg border-2 border-orange-500/20 mb-3"
                    />
                  )}
                  
                  {/* Action Button */}
                  {mediaItem.url && mediaItem.url.trim() !== '' ? (
                    <a
                      href={mediaItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  ) : article.sourceUrl ? (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Document on LinkedIn
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>This document requires authentication to download</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={article.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="min-h-screen pb-32 relative"
      >
        {/* Scroll Progress Indicator */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 hempin:from-amber-500 hempin:via-orange-500 hempin:to-teal-500 z-50 origin-left shadow-lg shadow-emerald-500/50"
          style={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        />

        {/* Fixed Background Art - matches the article card preview */}
        <motion.div
          key={`bg-${article.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-0"
        >
          <div className="absolute inset-0 opacity-35 dark:opacity-30 hempin:opacity-40">
            <PlaceholderArt 
              articleId={article.id}
              category={article.category}
              title={article.title}
              className="w-full h-full"
              useCategoryArt={true}
            />
          </div>
          {/* Subtle overlay to ensure readability */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        </motion.div>
        
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6 relative z-10">
          
          {/* Clean Points & Stats Card - SOLARPUNK GAME STYLE */}
          {userProgress && (
            <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
              {/* Comic-style neon gradient border */}
              <div className="absolute inset-0 rounded-3xl p-[4px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">
                <div className="w-full h-full bg-card rounded-[22px]" />
              </div>
              
              {/* Inner content container */}
              <div className="relative">
                {/* Halftone pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-3xl" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px'
                }} />
                
                <CardContent className="relative p-6 md:p-8 space-y-6">
                  {/* Header Section */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.2),0_0_20px_rgba(251,191,36,0.4)] border-2 border-white/30">
                        <Award className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent" style={{
                      textShadow: '0 0 30px rgba(16,185,129,0.3)'
                    }}>
                      READING REWARDS
                    </h3>
                    <p className="text-muted-foreground font-medium">Complete this article to level up!</p>
                  </div>
                  
                  {/* MEGA POINTS CARD - Comic Style */}
                  <div className="relative group">
                    {/* Outer glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-all animate-pulse" />
                    
                    {/* Main card with comic shadow */}
                    <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 shadow-[0_10px_0_rgba(0,0,0,0.25),0_0_40px_rgba(251,191,36,0.5)] group-hover:shadow-[0_12px_0_rgba(0,0,0,0.3),0_0_60px_rgba(251,191,36,0.6)] transition-all">
                      <div className="relative rounded-[14px] bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/90 dark:to-yellow-900/90 p-6 md:p-8 border-2 border-white/40">
                        {/* Halftone on points card */}
                        <div className="absolute inset-0 opacity-[0.06] rounded-[14px]" style={{
                          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.6) 2px, transparent 2px)',
                          backgroundSize: '20px 20px'
                        }} />
                        
                        <div className="relative text-center space-y-4">
                          <div className="text-xs md:text-sm font-black text-amber-700 dark:text-amber-300 tracking-widest uppercase">
                            You'll Earn
                          </div>
                          
                          {/* MASSIVE POINTS DISPLAY - Dynamic based on article source */}
                          <div className="flex items-center justify-center gap-3 md:gap-4">
                            <Zap className="w-10 h-10 md:w-14 md:h-14 text-amber-600 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse" strokeWidth={2.5} fill="currentColor" />
                            <div className="flex items-center">
                              <span className="text-6xl md:text-8xl font-black bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent drop-shadow-2xl" style={{
                                textShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                                WebkitTextStroke: '2px rgba(251,191,36,0.3)'
                              }}>
                                +{expectedPoints}
                              </span>
                            </div>
                            <Zap className="w-10 h-10 md:w-14 md:h-14 text-amber-600 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse" strokeWidth={2.5} fill="currentColor" />
                          </div>
                          
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-full border-2 border-amber-500/30">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                            <span className="text-sm md:text-base font-black text-amber-700 dark:text-amber-300 tracking-wide">
                              POINTS
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Grid - Each in its own COMIC CARD */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {/* Current Streak Card */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all" />
                      <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-orange-500 to-red-500 shadow-[0_6px_0_rgba(0,0,0,0.2),0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_0_rgba(0,0,0,0.25),0_0_30px_rgba(249,115,22,0.5)] transition-all">
                        <div className="rounded-[14px] bg-card p-4 md:p-5 border-2 border-white/20">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                              <Flame className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                                {userProgress.currentStreak}
                              </div>
                              <div className="text-xs font-black text-muted-foreground tracking-wide uppercase mt-1">
                                Streak
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Articles Card */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all" />
                      <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_6px_0_rgba(0,0,0,0.2),0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_0_rgba(0,0,0,0.25),0_0_30px_rgba(59,130,246,0.5)] transition-all">
                        <div className="rounded-[14px] bg-card p-4 md:p-5 border-2 border-white/20">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                              <Book className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                {userProgress.totalArticlesRead}
                              </div>
                              <div className="text-xs font-black text-muted-foreground tracking-wide uppercase mt-1">
                                Read
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Longest Streak Card */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-all" />
                      <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_6px_0_rgba(0,0,0,0.2),0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_8px_0_rgba(0,0,0,0.25),0_0_30px_rgba(251,191,36,0.5)] transition-all">
                        <div className="rounded-[14px] bg-card p-4 md:p-5 border-2 border-white/20">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                              <Trophy className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                {userProgress.longestStreak}
                              </div>
                              <div className="text-xs font-black text-muted-foreground tracking-wide uppercase mt-1">
                                Best
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}
          
          {/* Separate Share Card - Top */}
          {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
            <ShareButton 
              article={article} 
              accessToken={accessToken}
              onProgressUpdate={(progress) => {
                // Update user progress when share points are earned
                if (progress && onProgressUpdate) {
                  onProgressUpdate(progress)
                }
              }}
            >
              <button className="w-full text-left">
                <Card className="relative overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-600 via-pink-600 to-fuchsia-600 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl">
                  {/* Subtle shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  
                  <CardContent className="relative p-5 md:p-6">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="p-3 rounded-xl shadow-lg bg-white/20 backdrop-blur-sm">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">
                          Share to Inspire
                        </h3>
                      </div>
                      
                      {/* Bonus Badge */}
                      <Badge className="text-white border-0 px-4 py-2 shadow-lg bg-white/20 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        +5 pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </ShareButton>
          ) : (
            <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/20 shadow-lg opacity-70 cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setShowUnlockModal(true)}>
              {/* Subtle shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              <CardContent className="relative p-5 md:p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-gray-400 to-gray-500">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">
                      Unlock Sharing
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Read {FEATURE_UNLOCKS['article-sharing'].requiredArticles - (userProgress?.totalArticlesRead || 0)} more articles
                    </p>
                  </div>
                  
                  {/* Bonus Badge */}
                  <Badge className="text-white border-0 px-4 py-2 shadow-lg bg-gradient-to-r from-gray-400 to-gray-500">
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    Locked
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Article Content */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Category & Metadata */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-0">
                  {article.category}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl text-foreground">{article.title}</h1>
              
              {/* Author Info Box - Shows for both LinkedIn and RSS articles */}
              {(article.author || article.authorImage || (article.source === 'rss' && (article.siteDomain || article.siteImage))) && (
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    {/* Gradient Background - Different for RSS vs LinkedIn */}
                    <div className={`absolute inset-0 ${
                      article.source === 'rss'
                        ? 'bg-gradient-to-br from-purple-500/10 via-teal-500/5 to-cyan-500/10'
                        : 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10'
                    }`} />
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className={`absolute top-4 right-4 w-20 h-20 rounded-full blur-2xl animate-pulse ${
                        article.source === 'rss' ? 'bg-purple-400/10' : 'bg-blue-400/10'
                      }`} style={{ animationDuration: '3s' }} />
                      <div className={`absolute bottom-4 left-4 w-24 h-24 rounded-full blur-2xl animate-pulse ${
                        article.source === 'rss' ? 'bg-teal-400/10' : 'bg-cyan-400/10'
                      }`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    </div>
                    
                    <CardContent className="relative p-4 md:p-6">
                      {/* Header with Icon and Label */}
                      <div className="flex items-center gap-2 mb-4">
                        {article.source === 'rss' ? (
                          <>
                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-lg">
                              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Website Source
                            </span>
                            
                            {/* Website Badge - Desktop Only */}
                            <Badge className="hidden md:flex bg-gradient-to-r from-purple-600 to-teal-600 text-white border-0 px-3 py-1.5 shadow-lg ml-auto">
                              <Globe className="w-3 h-3 mr-1" />
                              Website
                            </Badge>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              LinkedIn Author
                            </span>
                            
                            {/* LinkedIn Badge - Desktop Only */}
                            <Badge className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 px-3 py-1.5 shadow-lg ml-auto">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              LinkedIn
                            </Badge>
                          </>
                        )}
                      </div>
                      
                      {/* Author Content - Responsive Layout */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Author Avatar */}
                        <div className="relative group mx-auto sm:mx-0">
                          <div className={`absolute -inset-1 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity ${
                            article.source === 'rss'
                              ? 'bg-gradient-to-br from-purple-500 to-teal-500'
                              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          }`} />
                          <div className={`relative w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 bg-muted flex-shrink-0 ${
                            article.source === 'rss'
                              ? 'border-purple-500/30'
                              : 'border-blue-500/30'
                          }`}>
                            {/* For RSS: Try siteImage, then siteFavicon, then Globe icon */}
                            {article.source === 'rss' ? (
                              article.siteImage || article.siteFavicon ? (
                                <img 
                                  src={article.siteImage || article.siteFavicon} 
                                  alt={article.siteTitle || article.siteDomain || 'Website'} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to Globe icon if image fails to load
                                    e.currentTarget.style.display = 'none'
                                    const parent = e.currentTarget.parentElement
                                    if (parent) {
                                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-teal-600"><svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>'
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-teal-600">
                                  <Globe className="w-10 h-10 text-white" />
                                </div>
                              )
                            ) : (
                              /* For LinkedIn: Use authorImage or initials */
                              article.authorImage ? (
                                <img 
                                  src={article.authorImage} 
                                  alt={article.author || 'Author'} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold">
                                  {article.author?.charAt(0).toUpperCase() || 'A'}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        
                        {/* Author Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left w-full sm:w-auto">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground mb-1">
                            {article.source === 'rss' 
                              ? (article.siteTitle || article.siteDomain || article.author || 'Website')
                              : (article.author || 'LinkedIn Author')
                            }
                          </h3>
                          {article.source === 'rss' && article.siteDomain && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              {article.siteDomain}
                            </p>
                          )}
                          {article.source !== 'rss' && article.authorTitle && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                              {article.authorTitle}
                            </p>
                          )}
                          {article.publishDate && (
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(article.publishDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                          
                          {/* Badge - Mobile Only */}
                          {article.source === 'rss' ? (
                            <Badge className="md:hidden inline-flex mt-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white border-0 px-3 py-1.5 shadow-lg">
                              <Globe className="w-3 h-3 mr-1" />
                              Website
                            </Badge>
                          ) : (
                            <Badge className="md:hidden inline-flex mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 px-3 py-1.5 shadow-lg">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              LinkedIn
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              )}
              
              {/* RSS Website Source Card - Shows for RSS articles */}
              {article.source === 'rss' && article.siteDomain && article.sourceUrl && (
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    {/* Gradient Background - Purple/Teal for Website Style */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-teal-500/5 to-cyan-500/10" />
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-4 right-4 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    </div>
                    
                    <CardContent className="relative p-4 md:p-6">
                      {/* Header with Globe Icon and Label */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-lg">
                            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            From the Web
                          </span>
                        </div>
                        
                        {/* View Original Button - Desktop */}
                        <a 
                          href={article.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-lg transition-all font-semibold text-sm shadow-lg"
                        >
                          View Original
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      
                      {/* Source Content - Responsive Layout */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Website Favicon/Logo */}
                        <div className="relative group mx-auto sm:mx-0">
                          <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                          <div className="relative w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-3 border-purple-500/30 bg-white dark:bg-muted flex-shrink-0 shadow-md">
                            {article.siteFavicon ? (
                              <img 
                                src={article.siteFavicon} 
                                alt={`${article.siteTitle || article.siteDomain} favicon`}
                                className="w-full h-full object-contain p-3"
                                onError={(e) => {
                                  // Fallback to Globe icon if favicon fails to load
                                  e.currentTarget.style.display = 'none'
                                  const parent = e.currentTarget.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-teal-600"><svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>'
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-teal-600">
                                <Globe className="w-10 h-10 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Website Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left w-full sm:w-auto">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground mb-1">
                            {article.siteTitle || article.siteDomain}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {article.siteDomain}
                          </p>
                          {article.publishDate && (
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(article.publishDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* View Original Button - Mobile */}
                      <a 
                        href={article.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="md:hidden flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-lg transition-all font-semibold text-sm shadow-lg w-full"
                      >
                        View Original Article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </CardContent>
                  </Card>
              )}
              
              {/* LinkedIn Source Link */}
              {article.source === 'linkedin' && article.sourceUrl && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground font-medium">Originally posted on LinkedIn</p>
                    </div>
                  </div>
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
                  >
                    View Original
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
              
              {/* RSS Source Link */}
              {article.source === 'rss' && article.sourceUrl && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-500/10 border-2 border-orange-500/30">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Rss className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground font-medium">View original article from RSS feed</p>
                    </div>
                  </div>
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold text-sm"
                  >
                    View Original
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Media Attachments Summary */}
              {article.media && article.media.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Attachments:
                  </div>
                  {article.media.filter(m => m.type === 'pdf').length > 0 && (
                    <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400">
                      <FileText className="w-3 h-3 mr-1" />
                      {article.media.filter(m => m.type === 'pdf').length} PDF
                    </Badge>
                  )}
                  {article.media.filter(m => m.type === 'image').length > 0 && (
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {article.media.filter(m => m.type === 'image').length} Image{article.media.filter(m => m.type === 'image').length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {article.media.filter(m => m.type === 'youtube').length > 0 && (
                    <Badge variant="outline" className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30 text-red-700 dark:text-red-400">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      {article.media.filter(m => m.type === 'youtube').length} Video{article.media.filter(m => m.type === 'youtube').length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {article.media.filter(m => m.type === 'audio').length > 0 && (
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400">
                      <Volume2 className="w-3 h-3 mr-1" />
                      {article.media.filter(m => m.type === 'audio').length} Audio
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="prose prose-base md:prose-lg max-w-none">
                {article.content.split('\n\n').map((paragraph, index) => {
                  // Handle horizontal rule (---)
                  if (paragraph.trim() === '---') {
                    return <hr key={index} className="my-8 border-border" />
                  }
                  
                  // Handle headers (##)
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl md:text-3xl font-bold text-foreground mt-8 mb-4">
                        {paragraph.replace(/^## /, '')}
                      </h2>
                    )
                  }
                  
                  // Handle links [text](url)
                  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
                  const hasLinks = linkRegex.test(paragraph)
                  
                  if (hasLinks) {
                    const parts = []
                    let lastIndex = 0
                    const regex = /\[([^\]]+)\]\(([^)]+)\)/g
                    let match
                    
                    while ((match = regex.exec(paragraph)) !== null) {
                      // Add text before the link
                      if (match.index > lastIndex) {
                        parts.push(paragraph.substring(lastIndex, match.index))
                      }
                      
                      // Add the link
                      parts.push(
                        <a
                          key={match.index}
                          href={match[2]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1"
                        >
                          {match[1]}
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )
                      
                      lastIndex = regex.lastIndex
                    }
                    
                    // Add remaining text
                    if (lastIndex < paragraph.length) {
                      parts.push(paragraph.substring(lastIndex))
                    }
                    
                    return (
                      <p key={index} className="mb-4 text-foreground leading-relaxed">
                        {parts}
                      </p>
                    )
                  }
                  
                  // Regular paragraph
                  return (
                    <p key={index} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
              
              {/* Media Attachments */}
              {article.media && article.media.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border">
                  {article.media.map((mediaItem, index) => renderMedia(mediaItem, index))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* BIG CLAIM POINTS BUTTON */}
          {userId && accessToken && (
            <ClaimPointsButton
              isAlreadyRead={isAlreadyRead}
              claimingPoints={claimingPoints}
              pointsClaimed={pointsClaimed}
              onClick={handleClaimPoints}
              points={pointsClaimed ? pointsEarned : expectedPoints}
            />
          )}
          
          {/* Navigation & Next Article Suggestions */}
          <div className="space-y-6">
            {/* Continue Reading - Single Suggestion for Unclaimed Articles */}
            {suggestedArticles && suggestedArticles.length > 0 && (
              <Card className="relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/10 dark:to-cyan-500/20 hempin:from-amber-500/10 hempin:via-orange-500/5 hempin:to-teal-500/10 shadow-xl">
                {/* Animated gradient shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                
                {/* Glowing border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50 dark:from-emerald-400/50 dark:via-teal-400/50 dark:to-cyan-400/50 hempin:from-amber-500/50 hempin:via-orange-500/50 hempin:to-teal-500/50 rounded-xl blur opacity-50 animate-pulse" />
                
                <CardContent className="relative p-6 space-y-4">
                  {/* Header with icon */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 hempin:from-amber-500 hempin:to-orange-600 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Continue Reading</h3>
                        <p className="text-xs text-muted-foreground">Earn more points</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 hempin:from-amber-500 hempin:to-orange-600 text-white border-0 px-3 py-1.5 shadow-lg">
                      <Zap className="w-3 h-3 mr-1 fill-white" />
                      Unclaimed
                    </Badge>
                  </div>
                  
                  {/* Single Article Card - Larger and more prominent */}
                  <div 
                    onClick={() => handleSuggestedArticleClick(suggestedArticles[0])}
                    className="group cursor-pointer p-5 rounded-xl bg-card/90 backdrop-blur-sm border-2 border-border hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hempin:hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Category & Reading Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hempin:bg-amber-500/10 hempin:text-amber-700 border-0">
                            {suggestedArticles[0].category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{suggestedArticles[0].readingTime} min read</span>
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h4 className="font-bold text-lg text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 hempin:group-hover:text-amber-600 transition-colors line-clamp-2">
                          {suggestedArticles[0].title}
                        </h4>
                        
                        {/* Excerpt if available */}
                        {(suggestedArticles[0] as any).excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {(suggestedArticles[0] as any).excerpt}
                          </p>
                        )}
                        
                        {/* CTA with arrow */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hempin:text-amber-600">
                          <span>Read Now & Claim Points</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                      
                      {/* Arrow icon on the right */}
                      <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/20 dark:to-teal-400/20 hempin:from-amber-500/20 hempin:to-orange-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 dark:group-hover:from-emerald-400/30 dark:group-hover:to-teal-400/30 hempin:group-hover:from-amber-500/30 hempin:group-hover:to-orange-500/30 transition-all">
                        <ArrowRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400 hempin:text-amber-600 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Card - Bottom (identical to top) */}
            {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
              <ShareButton 
                article={article} 
                accessToken={accessToken}
                onProgressUpdate={(progress) => {
                  // Update user progress when share points are earned
                  if (progress && onProgressUpdate) {
                    onProgressUpdate(progress)
                  }
                }}
              >
                <button className="w-full text-left">
                  <Card className="relative overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-600 via-pink-600 to-fuchsia-600 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl">
                    {/* Subtle shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    
                    <CardContent className="relative p-5 md:p-6">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="p-3 rounded-xl shadow-lg bg-white/20 backdrop-blur-sm">
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">
                            Share to Inspire
                          </h3>
                        </div>
                        
                        {/* Bonus Badge */}
                        <Badge className="text-white border-0 px-4 py-2 shadow-lg bg-white/20 backdrop-blur-sm">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          +5 pts
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </ShareButton>
            ) : (
              <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/20 shadow-lg opacity-70 cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setShowUnlockModal(true)}>
                {/* Subtle shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                
                <CardContent className="relative p-5 md:p-6">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-gray-400 to-gray-500">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">
                        Unlock Sharing
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Read {FEATURE_UNLOCKS['article-sharing'].requiredArticles - (userProgress?.totalArticlesRead || 0)} more articles
                      </p>
                    </div>
                    
                    {/* Bonus Badge */}
                    <Badge className="text-white border-0 px-4 py-2 shadow-lg bg-gradient-to-r from-gray-400 to-gray-500">
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      Locked
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* CSS for animations */}
        <style>{`
          @keyframes gradient-xy {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-100px); opacity: 0; }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
          
          .animate-float {
            animation: float 5s infinite ease-in-out;
          }
          
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 3s infinite linear;
          }
        `}</style>
      </motion.div>

      {/* Feature Unlock Modal */}
      {showUnlockModal && (
        <FeatureUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          featureId="article-sharing"
          currentProgress={userProgress?.totalArticlesRead || 0}
        />
      )}
    </AnimatePresence>
  )
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}