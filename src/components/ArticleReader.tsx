import { ArrowLeft, Clock, Eye, Share2, Award, TrendingUp, Sparkles, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { GenerativeBackground } from "./GenerativeBackground"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { ShareButton } from "./ShareButton"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface MediaItem {
  type: 'youtube' | 'audio' | 'image'
  url: string
  caption?: string
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
  media?: MediaItem[]
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
}

export function ArticleReader({ article, onBack, allArticles = [], userProgress, suggestedArticles, onArticleSelect }: ArticleReaderProps) {
  const [isSliding, setIsSliding] = useState(false)

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
        className="min-h-screen pb-32"
      >
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
          
          {/* Gamified Share & Points Card */}
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
                {/* Top Section: Points Display */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold">Reading Rewards</h3>
                    </div>
                    <p className="text-white/90 text-sm md:text-base">Complete this article to level up!</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Points to Earn */}
                    <div className="relative flex-1 sm:flex-none group">
                      <div className="absolute -inset-1 bg-white/40 rounded-2xl blur-md group-hover:blur-lg transition-all" />
                      <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-xl">
                        <div className="text-xs text-emerald-700 dark:text-emerald-800 hempin:text-amber-800 font-semibold mb-1">You'll Earn</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hempin:from-amber-600 hempin:to-orange-600 bg-clip-text text-transparent">+10</span>
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-600 hempin:text-amber-700">pts</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Points */}
                    <div className="relative flex-1 sm:flex-none">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                        <div className="text-xs text-white/80 font-semibold mb-1">Your Total</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">{userProgress.points}</span>
                          <span className="text-sm font-semibold text-white/80">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Share Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 text-white">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Share & Inspire Others</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1 shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      +5 bonus
                    </Badge>
                  </div>
                  <ShareButton article={article} compact={true} />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{userProgress.currentStreak}</div>
                    <div className="text-xs text-white/80 font-semibold">Day Streak</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{userProgress.totalArticlesRead}</div>
                    <div className="text-xs text-white/80 font-semibold">Articles Read</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{userProgress.longestStreak}</div>
                    <div className="text-xs text-white/80 font-semibold">Best Streak</div>
                  </div>
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
                {article.views !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} views</span>
                  </div>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl text-foreground">{article.title}</h1>
              
              {/* Content */}
              <div className="prose prose-base md:prose-lg max-w-none">
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
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
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="p-6">
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    onBack()
                  }}
                  className="flex-1 h-12 border-2 hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Feed
                </Button>
                <Button 
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  onClick={handleExploreMore}
                >
                  Explore More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {/* Next Article Suggestion */}
              {suggestedArticles && suggestedArticles.length > 0 && (
                <div className="pt-6 border-t border-border">
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
                </div>
              )}
            </CardContent>
          </Card>
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
          
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
          
          .animate-float {
            animation: float 5s infinite ease-in-out;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}