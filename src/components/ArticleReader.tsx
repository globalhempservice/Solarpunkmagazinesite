import { ArrowLeft, Clock, Eye, Share2, Award, TrendingUp, Sparkles, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { GenerativeBackground } from "./GenerativeBackground"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { ShareButton } from "./ShareButton"

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
  userProgress?: {
    points: number
    currentStreak: number
    longestStreak: number
    totalArticlesRead: number
  } | null
  suggestedArticles?: Article[]
  onArticleSelect?: (article: Article) => void
}

export function ArticleReader({ article, onBack, userProgress, suggestedArticles, onArticleSelect }: ArticleReaderProps) {
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
    <div className="min-h-screen pb-32">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {/* Gamified Share & Points Card */}
        {userProgress && (
          <Card className="relative overflow-hidden border-2 border-primary/30 shadow-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-primary/10 to-purple-500/10 animate-gradient-xy" />
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>

            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span>Reading Rewards</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Complete this article to earn points!</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Points Earned */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-3 text-white">
                      <div className="text-xs opacity-90">Earn</div>
                      <div className="font-bold text-lg">+10 pts</div>
                    </div>
                  </div>
                  
                  {/* Current Points */}
                  <div className="bg-muted/80 rounded-xl p-3 border border-border">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-bold text-lg text-foreground">{userProgress.points} pts</div>
                  </div>
                </div>
              </div>
              
              {/* Share Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Share & Inspire</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400">
                    Bonus +5 pts
                  </Badge>
                </div>
                <ShareButton article={article} compact={true} />
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Streak</div>
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="font-bold">{userProgress.currentStreak}</span>
                  </div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-xs text-muted-foreground mb-1">Read</div>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">{userProgress.totalArticlesRead}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Best</div>
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-bold">{userProgress.longestStreak}</span>
                  </div>
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
                onClick={onBack}
                className="flex-1 h-12 border-2 hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
              </Button>
              <Button 
                className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={onBack}
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
                      onClick={() => onArticleSelect && onArticleSelect(suggestedArticle)}
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
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}