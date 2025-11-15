import { ArrowLeft, Search, Filter, Calendar, TrendingUp, Award, BookOpen, Clock, Eye, Target, Zap, CheckCircle2, Flame, Download, Share2, Trophy, Star, Medal, Crown, Rocket, Sparkles, Library, Bookmark, Link2, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { PlaceholderArt } from './PlaceholderArt'
import { toast } from 'sonner@2.0.3'
import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

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
  media?: Array<{
    type: 'youtube' | 'audio' | 'image'
    url: string
    caption?: string
  }>
}

interface ReadingHistoryProps {
  readArticleIds: string[]
  allArticles: Article[]
  totalArticlesRead: number
  points: number
  onBack: () => void
  onArticleClick?: (articleId: string) => void
}

export function ReadingHistory({ 
  readArticleIds, 
  allArticles, 
  totalArticlesRead, 
  points,
  onBack,
  onArticleClick 
}: ReadingHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMedal, setSelectedMedal] = useState<{
    title: string
    description: string
    milestone: number
    icon: string
    color: string
    isUnlocked: boolean
    progress: number
  } | null>(null)

  // Filter to get only read articles - Redesigned cards with emerald theme
  const readArticles = allArticles.filter(article => readArticleIds.includes(article.id))

  // Get all unique categories
  const categories = ['all', ...new Set(readArticles.map(a => a.category))]

  // Filter articles by search and category
  const filteredArticles = readArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate stats
  const totalReadingTime = readArticles.reduce((sum, article) => sum + article.readingTime, 0)
  const categoriesRead = new Set(readArticles.map(a => a.category)).size

  // Define medals
  const medals = [
    {
      title: 'Bronze Reader',
      description: 'First steps in knowledge',
      milestone: 10,
      icon: 'medal',
      color: 'from-orange-400 to-amber-500',
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-500',
      isUnlocked: totalArticlesRead >= 10,
      progress: Math.min((totalArticlesRead / 10) * 100, 100)
    },
    {
      title: 'Silver Scholar',
      description: 'Growing expertise',
      milestone: 25,
      icon: 'award',
      color: 'from-slate-400 to-zinc-400',
      textColor: 'text-slate-500',
      bgColor: 'bg-slate-500',
      isUnlocked: totalArticlesRead >= 25,
      progress: Math.min((totalArticlesRead / 25) * 100, 100)
    },
    {
      title: 'Gold Master',
      description: 'Impressive dedication',
      milestone: 50,
      icon: 'crown',
      color: 'from-yellow-400 to-amber-500',
      textColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      isUnlocked: totalArticlesRead >= 50,
      progress: Math.min((totalArticlesRead / 50) * 100, 100)
    },
    {
      title: 'Diamond Legend',
      description: 'Ultimate achievement',
      milestone: 100,
      icon: 'rocket',
      color: 'from-cyan-400 via-blue-500 to-purple-600',
      textColor: 'text-cyan-500',
      bgColor: 'bg-gradient-to-r from-cyan-500 to-purple-500',
      isUnlocked: totalArticlesRead >= 100,
      progress: Math.min((totalArticlesRead / 100) * 100, 100)
    }
  ]

  return (
    <div className="space-y-6">
      {/* Exciting Hero Header - Inspired by Swipe Mode Card */}
      <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 p-[2px] shadow-lg shadow-fuchsia-500/50">
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
             style={{ 
               backgroundSize: '200% 100%',
               animation: 'shimmer 3s infinite linear'
             }} 
        />
        
        <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-start gap-4">
            {/* Icon - with glow effect */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl p-4 shadow-xl group-hover:scale-110 transition-transform">
                <Library className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Title & Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                  📚 Reading Journey
                </h1>
                <Sparkles className="w-5 h-5 text-fuchsia-500 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Track your progress through knowledge ✨
              </p>
              
              {/* Stats inline with glowing icons */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BookOpen className="relative w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalArticlesRead}</span>
                  <span className="text-muted-foreground">read</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1.5 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Clock className="relative w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{totalReadingTime}</span>
                  <span className="text-muted-foreground">min</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1.5 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="relative w-4 h-4 text-amber-500" />
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{points}</span>
                  <span className="text-muted-foreground">pts</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1.5 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Target className="relative w-4 h-4 text-purple-500" />
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{categoriesRead}</span>
                  <span className="text-muted-foreground">categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>

      {/* Achievement Medals Collection */}
      <Card className="border-2 border-border/50 bg-card/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">Achievement Medals</h2>
            <Badge variant="outline" className="ml-auto text-xs">
              {medals.filter(m => m.isUnlocked).length}/{medals.length}
            </Badge>
          </div>

          {/* Medal avatars */}
          <div className="flex flex-wrap gap-4">
            {medals.map((medal, idx) => {
              const Icon = medal.icon === 'medal' ? Medal :
                          medal.icon === 'award' ? Award :
                          medal.icon === 'crown' ? Crown :
                          Rocket

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMedal(medal)}
                  className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 border-2 border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                >
                  {/* Medal icon */}
                  <div className="relative">
                    {medal.isUnlocked ? (
                      <>
                        <div className={`absolute -inset-3 bg-gradient-to-br ${medal.color} rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-all`} />
                        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${medal.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                        {/* Checkmark badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white fill-emerald-500" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-border/50 group-hover:border-border transition-all">
                          <span className="text-2xl text-muted-foreground/30">?</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className={`text-xs font-semibold ${medal.isUnlocked ? medal.textColor : 'text-muted-foreground/50'}`}>
                      {medal.milestone}
                    </div>
                    {!medal.isUnlocked && totalArticlesRead > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {medal.milestone - totalArticlesRead} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Medal Details Modal */}
      <Dialog open={selectedMedal !== null} onOpenChange={() => setSelectedMedal(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedMedal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative">
                    {selectedMedal.isUnlocked ? (
                      <>
                        <div className={`absolute -inset-4 bg-gradient-to-br ${selectedMedal.color} rounded-full blur-xl opacity-60 animate-pulse`} />
                        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${selectedMedal.color} flex items-center justify-center shadow-2xl`}>
                          {selectedMedal.icon === 'medal' && <Medal className="w-10 h-10 text-white drop-shadow-lg" />}
                          {selectedMedal.icon === 'award' && <Award className="w-10 h-10 text-white drop-shadow-lg" />}
                          {selectedMedal.icon === 'crown' && <Crown className="w-10 h-10 text-white drop-shadow-lg" />}
                          {selectedMedal.icon === 'rocket' && <Rocket className="w-10 h-10 text-white drop-shadow-lg" />}
                        </div>
                      </>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-border">
                        <span className="text-4xl text-muted-foreground/30">?</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className={selectedMedal.isUnlocked ? selectedMedal.textColor : 'text-muted-foreground'}>
                      {selectedMedal.title}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedMedal.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Progress */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {totalArticlesRead} / {selectedMedal.milestone} articles
                    </span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${selectedMedal.isUnlocked ? selectedMedal.bgColor : 'bg-muted-foreground'}`}
                      style={{ width: `${selectedMedal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Status</span>
                  {selectedMedal.isUnlocked ? (
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      <Star className="w-3 h-3 mr-1 fill-emerald-500" />
                      Unlocked!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {selectedMedal.milestone - totalArticlesRead} articles to go
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setSelectedMedal(null)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Search and Filter - Mobile Friendly */}
      <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all h-11"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Category Filter - Mobile Friendly Select */}
            <div className="flex items-center gap-2 w-full">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat === 'all' ? 'All Categories' : cat}
                      {cat !== 'all' && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({readArticles.filter(a => a.category === cat).length})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge 
                    variant="secondary" 
                    className="gap-1.5 text-xs"
                  >
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="gap-1.5 text-xs capitalize"
                  >
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="text-xs h-6 px-2 ml-auto"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results count */}
            <div className="text-xs text-muted-foreground">
              Showing {filteredArticles.length} of {readArticles.length} articles
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => {
            const handleCopyLink = async (e: React.MouseEvent) => {
              e.stopPropagation()
              const shareUrl = `${window.location.origin}/share/${article.id}`
              try {
                await navigator.clipboard.writeText(shareUrl)
                toast.success('Link copied to clipboard!')
              } catch (error) {
                toast.error('Failed to copy link')
              }
            }

            const handleNativeShare = async (e: React.MouseEvent) => {
              e.stopPropagation()
              const shareUrl = `${window.location.origin}/share/${article.id}`
              
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: article.title,
                    text: article.excerpt,
                    url: shareUrl
                  })
                  toast.success('Shared successfully!')
                } catch (error: any) {
                  if (error.name !== 'AbortError') {
                    toast.error('Failed to share')
                  }
                }
              } else {
                toast.error('Sharing not supported on this device')
              }
            }

            return (
              <div
                key={article.id}
                className="group relative"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Gradient border wrapper */}
                <div className="absolute -inset-[2px] bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
                
                <Card 
                  className="relative h-full border-2 border-border/50 bg-card/95 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => onArticleClick?.(article.id)}
                >
                  {/* Cover Image or Placeholder */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background">
                    {article.coverImage ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent z-10" />
                        <ImageWithFallback
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </>
                    ) : (
                      <PlaceholderArt 
                        articleId={article.id}
                        category={article.category}
                        title={article.title}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                        useCategoryArt={true}
                      />
                    )}
                    
                    {/* Read Badge - Redesigned */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-emerald-500/30 blur-md rounded-full" />
                        <Badge className="relative bg-emerald-500/95 backdrop-blur-md text-white border-0 shadow-lg px-3 py-1.5 gap-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-white" />
                          <span className="font-semibold text-xs">Read</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Share Actions - Redesigned */}
                    <div className="absolute bottom-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      {/* Copy Link Button */}
                      <div className="relative">
                        <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full" />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="relative h-9 w-9 p-0 rounded-full bg-background/95 backdrop-blur-xl border-2 border-primary/30 hover:border-primary/50 hover:bg-background shadow-lg hover:shadow-primary/30 transition-all hover:scale-110"
                          onClick={handleCopyLink}
                          title="Copy link"
                        >
                          <Link2 className="w-4 h-4 text-primary" />
                        </Button>
                      </div>

                      {/* Native Share Button */}
                      <div className="relative">
                        <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full" />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="relative h-9 w-9 p-0 rounded-full bg-background/95 backdrop-blur-xl border-2 border-primary/30 hover:border-primary/50 hover:bg-background shadow-lg hover:shadow-primary/30 transition-all hover:scale-110"
                          onClick={handleNativeShare}
                          title="Share"
                        >
                          <Share2 className="w-4 h-4 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="relative p-5 space-y-3">
                    {/* Category Badge - Moved to top */}
                    <Badge 
                      className="bg-primary/10 text-primary border-primary/20 px-2.5 py-1 gap-1.5 rounded-full font-medium text-xs"
                    >
                      <Bookmark className="w-3 h-3" />
                      {article.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readingTime} min</span>
                      </div>
                      <span className="text-muted-foreground/50">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
              <BookOpen className="relative w-16 h-16 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Start reading to build your library!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CSS for custom animations */}
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