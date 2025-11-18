import { useState } from "react"
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
  Image as ImageIcon
} from "lucide-react"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { PlaceholderArt } from "./PlaceholderArt"
import { ShareButton } from "./ShareButton"
import { isFeatureUnlocked, FEATURE_UNLOCKS } from "../utils/featureUnlocks"
import { FeatureUnlockModal } from "./FeatureUnlockModal"

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
  } | null
  suggestedArticles?: Article[]
  onArticleSelect?: (article: Article) => void
  accessToken?: string
}

export function ArticleReader({ article, onBack, allArticles = [], userProgress, suggestedArticles, onArticleSelect, accessToken }: ArticleReaderProps) {
  const [isSliding, setIsSliding] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)

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
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen pb-32 relative"
      >
        {/* Fixed Background Art - matches the article card preview */}
        <motion.div
          key={`bg-${article.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
          
          {/* Clean Points & Stats Card */}
          {userProgress && (
            <Card className="relative overflow-hidden border-0 shadow-2xl">
              {/* Multi-layer gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-500 dark:via-teal-600 dark:to-cyan-700 hempin:from-amber-500 hempin:via-orange-600 hempin:to-teal-600" />
              <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/40 via-transparent to-blue-500/40 animate-gradient-xy" />
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-500 dark:to-cyan-500 hempin:from-amber-600 hempin:via-orange-500 hempin:to-teal-500 blur-xl opacity-50 animate-pulse" />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${3 + Math.random() * 4}s`
                    }}
                  />
                ))}
              </div>

              <CardContent className="relative p-6 md:p-8">
                {/* Header with Points */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold">Reading Rewards</h3>
                    </div>
                    <p className="text-white/90 text-sm md:text-base">Complete this article to level up!</p>
                  </div>
                  
                  {/* Points to Earn - Compact with Bolt */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-white/40 rounded-2xl blur-md group-hover:blur-lg transition-all" />
                    <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-xl">
                      <div className="text-xs text-emerald-700 dark:text-emerald-800 hempin:text-amber-800 font-semibold mb-1">You'll Earn</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hempin:from-amber-600 hempin:to-orange-600 bg-clip-text text-transparent">+10</span>
                        <Zap className="w-5 h-5 fill-emerald-600 text-emerald-600 dark:fill-emerald-500 dark:text-emerald-500 hempin:fill-amber-600 hempin:text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid - Icon + Number Only - Matching UserDashboard */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {/* Current Streak with Flame */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                      <Flame className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{userProgress.currentStreak}</div>
                  </div>
                  
                  {/* Total Articles with Book */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg">
                      <Book className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{userProgress.totalArticlesRead}</div>
                  </div>
                  
                  {/* Longest Streak with Trophy */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/20 flex items-center justify-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg">
                      <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{userProgress.longestStreak}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Separate Share Card - Top */}
          <Card className={`relative overflow-hidden border-2 bg-gradient-to-br shadow-lg ${
            !isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
              ? 'border-amber-500/50 from-amber-500/20 via-orange-500/10 to-amber-500/20 opacity-70'
              : 'border-purple-500/30 from-purple-500/10 via-pink-500/5 to-fuchsia-500/10'
          }`}>
            {/* Subtle shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            
            <CardContent className="relative p-5 md:p-6">
              <div className="flex items-center gap-4">
                {/* Clickable Icon or Locked State */}
                {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
                  <ShareButton article={article} accessToken={accessToken}>
                    <button className="group relative p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      <Share2 className="w-6 h-6 text-white" />
                    </button>
                  </ShareButton>
                ) : (
                  <button 
                    onClick={() => setShowUnlockModal(true)}
                    className="group relative p-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg cursor-pointer"
                  >
                    <Lock className="w-6 h-6 text-white" />
                  </button>
                )}
                
                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">
                    {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
                      ? 'Share to Inspire'
                      : 'Unlock Sharing'}
                  </h3>
                  {!isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Read {FEATURE_UNLOCKS['article-sharing'].requiredArticles - (userProgress?.totalArticlesRead || 0)} more articles
                    </p>
                  )}
                </div>
                
                {/* Bonus Badge */}
                <Badge className={`text-white border-0 px-4 py-2 shadow-lg ${
                  isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      +5 pts
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      Locked
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
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
              
              {/* View Original Article Link - More prominent version */}
              {article.sourceUrl && (
                <div className="mt-4">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-500/40 hover:border-blue-500/60 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-blue-600 dark:text-blue-400">View Original Article</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
              
              {/* LinkedIn Author Info Box - Shows only if LinkedIn metadata exists */}
              {(article.author || article.authorImage) && (
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10" />
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-4 right-4 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    </div>
                    
                    <CardContent className="relative p-4 md:p-6">
                      {/* Header with LinkedIn Icon and Label */}
                      <div className="flex items-center gap-2 mb-4">
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
                      </div>
                      
                      {/* Author Content - Responsive Layout */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Author Avatar */}
                        <div className="relative group mx-auto sm:mx-0">
                          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity" />
                          <div className="relative w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-blue-500/30 bg-muted flex-shrink-0">
                            {article.authorImage ? (
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
                            )}
                          </div>
                        </div>
                        
                        {/* Author Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left w-full sm:w-auto">
                          <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground mb-1">
                            {article.author || 'LinkedIn Author'}
                          </h3>
                          {article.authorTitle && (
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
                          
                          {/* LinkedIn Badge - Mobile Only */}
                          <Badge className="md:hidden inline-flex mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 px-3 py-1.5 shadow-lg">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </Badge>
                        </div>
                      </div>
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
          
          {/* Navigation & Next Article Suggestions */}
          <div className="space-y-6">
            {/* Continue Reading - 2 Suggestions */}
            {suggestedArticles && suggestedArticles.length > 0 && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Continue Reading</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {suggestedArticles.slice(0, 2).map((suggestedArticle) => (
                      <div 
                        key={suggestedArticle.id} 
                        onClick={() => handleSuggestedArticleClick(suggestedArticle)}
                        className="group cursor-pointer p-4 rounded-xl bg-card/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                                {suggestedArticle.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{suggestedArticle.readingTime} min</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {suggestedArticle.title}
                            </h4>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Card - Bottom (identical to top) */}
            <Card className={`relative overflow-hidden border-2 bg-gradient-to-br shadow-lg ${
              !isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
                ? 'border-amber-500/50 from-amber-500/20 via-orange-500/10 to-amber-500/20 opacity-70'
                : 'border-purple-500/30 from-purple-500/10 via-pink-500/5 to-fuchsia-500/10'
            }`}>
              {/* Subtle shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              <CardContent className="relative p-5 md:p-6">
                <div className="flex items-center gap-4">
                  {/* Clickable Icon or Locked State */}
                  {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
                    <ShareButton article={article} accessToken={accessToken}>
                      <button className="group relative p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <Share2 className="w-6 h-6 text-white" />
                      </button>
                    </ShareButton>
                  ) : (
                    <button 
                      onClick={() => setShowUnlockModal(true)}
                      className="group relative p-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg cursor-pointer"
                    >
                      <Lock className="w-6 h-6 text-white" />
                    </button>
                  )}
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">
                      {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
                        ? 'Share to Inspire'
                        : 'Unlock Sharing'}
                    </h3>
                    {!isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Read {FEATURE_UNLOCKS['article-sharing'].requiredArticles - (userProgress?.totalArticlesRead || 0)} more articles
                      </p>
                    )}
                  </div>
                  
                  {/* Bonus Badge */}
                  <Badge className={`text-white border-0 px-4 py-2 shadow-lg ${
                    isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {isFeatureUnlocked('article-sharing', userProgress?.totalArticlesRead || 0) ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        +5 pts
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                        Locked
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
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