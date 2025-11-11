import { ArrowLeft, Search, Filter, Calendar, TrendingUp, Award, BookOpen, Clock, Eye, Target, Zap, CheckCircle2, Flame, Download, Share2, Trophy, Star, Medal, Crown, Rocket, Sparkles, Library, Bookmark, Link2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { PlaceholderArt } from './PlaceholderArt'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'

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

  // Filter to get only read articles
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

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 animate-gradient-xy" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative backdrop-blur-xl bg-card/80 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 gap-2 hover:bg-primary/10 hover:text-primary transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Book Icon */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-90 animate-pulse" />
              <div className="relative bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-3xl p-6 shadow-2xl">
                <Library className="w-14 h-14 text-white drop-shadow-2xl" />
              </div>
            </div>

            {/* Title & Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
                  Reading Journey
                </h1>
                <Sparkles className="w-7 h-7 text-fuchsia-500 animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Explore your path through knowledge and discovery ✨
              </p>
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Articles Stat */}
                <div className="relative group/stat">
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur opacity-25 group-hover/stat:opacity-50 transition" />
                  <div className="relative bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalArticlesRead}</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Articles Read</p>
                  </div>
                </div>

                {/* Time Stat */}
                <div className="relative group/stat">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl blur opacity-25 group-hover/stat:opacity-50 transition" />
                  <div className="relative bg-blue-500/10 border-2 border-blue-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalReadingTime}</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Minutes</p>
                  </div>
                </div>

                {/* Points Stat */}
                <div className="relative group/stat">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur opacity-25 group-hover/stat:opacity-50 transition" />
                  <div className="relative bg-amber-500/10 border-2 border-amber-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{points}</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Points</p>
                  </div>
                </div>

                {/* Categories Stat */}
                <div className="relative group/stat">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl blur opacity-25 group-hover/stat:opacity-50 transition" />
                  <div className="relative bg-purple-500/10 border-2 border-purple-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{categoriesRead}</span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Categories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      {totalArticlesRead > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full" />
              <Trophy className="relative w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Achievement Milestones
            </h2>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 10 Articles - Bronze */}
            {(() => {
              const milestone = 10
              const isCompleted = totalArticlesRead >= milestone
              const isCurrent = !isCompleted && totalArticlesRead >= 0
              const progress = isCurrent ? Math.min((totalArticlesRead / milestone) * 100, 100) : isCompleted ? 100 : 0
              
              return (
                <div className="relative group/milestone">
                  <div className={`absolute -inset-1 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl blur-lg transition-all ${isCompleted ? 'opacity-50' : isCurrent ? 'opacity-30 group-hover/milestone:opacity-50' : 'opacity-10'}`} />
                  
                  <Card className={`relative border-2 transition-all transform ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                      : isCurrent
                      ? 'bg-card/80 backdrop-blur-sm border-amber-400/40 group-hover/milestone:scale-105'
                      : 'bg-muted/30 border-border/30'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="relative">
                          <div className={`absolute -inset-2 rounded-full blur-md ${isCompleted ? 'bg-amber-400/40' : 'bg-amber-400/20'}`} />
                          <Medal className={`relative w-10 h-10 ${isCompleted ? 'text-amber-500 fill-amber-500/20' : 'text-amber-500/50'}`} />
                        </div>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-amber-500 fill-amber-500" />}
                      </div>
                      <CardTitle className="text-lg">Bronze Reader</CardTitle>
                      <p className="text-sm text-muted-foreground">First steps in knowledge</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-3xl font-bold ${isCompleted ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          {milestone}
                        </span>
                        <span className="text-sm text-muted-foreground">articles</span>
                      </div>
                      {!isCompleted && (
                        <>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {milestone - totalArticlesRead} more to go!
                          </p>
                        </>
                      )}
                      {isCompleted && (
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 mt-1">
                          <Star className="w-3 h-3 mr-1 fill-amber-500" />
                          Unlocked!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* 25 Articles - Silver */}
            {(() => {
              const milestone = 25
              const isCompleted = totalArticlesRead >= milestone
              const isCurrent = !isCompleted && totalArticlesRead >= 10
              const progress = isCurrent ? Math.min((totalArticlesRead / milestone) * 100, 100) : isCompleted ? 100 : 0
              
              return (
                <div className="relative group/milestone">
                  <div className={`absolute -inset-1 bg-gradient-to-br from-slate-400 to-zinc-400 rounded-2xl blur-lg transition-all ${isCompleted ? 'opacity-50' : isCurrent ? 'opacity-30 group-hover/milestone:opacity-50' : 'opacity-10'}`} />
                  
                  <Card className={`relative border-2 transition-all transform ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-slate-500/20 via-zinc-500/20 to-gray-500/20 border-slate-400/50 shadow-lg shadow-slate-400/20' 
                      : isCurrent
                      ? 'bg-card/80 backdrop-blur-sm border-slate-400/40 group-hover/milestone:scale-105'
                      : 'bg-muted/30 border-border/30'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="relative">
                          <div className={`absolute -inset-2 rounded-full blur-md ${isCompleted ? 'bg-slate-400/40' : 'bg-slate-400/20'}`} />
                          <Award className={`relative w-10 h-10 ${isCompleted ? 'text-slate-500 fill-slate-500/20' : 'text-slate-500/50'}`} />
                        </div>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-slate-500 fill-slate-500" />}
                      </div>
                      <CardTitle className="text-lg">Silver Scholar</CardTitle>
                      <p className="text-sm text-muted-foreground">Growing expertise</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-3xl font-bold ${isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-muted-foreground'}`}>
                          {milestone}
                        </span>
                        <span className="text-sm text-muted-foreground">articles</span>
                      </div>
                      {!isCompleted && (
                        <>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-gradient-to-r from-slate-500 to-zinc-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {milestone - totalArticlesRead} more to go!
                          </p>
                        </>
                      )}
                      {isCompleted && (
                        <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30 mt-1">
                          <Star className="w-3 h-3 mr-1 fill-slate-500" />
                          Unlocked!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* 50 Articles - Gold */}
            {(() => {
              const milestone = 50
              const isCompleted = totalArticlesRead >= milestone
              const isCurrent = !isCompleted && totalArticlesRead >= 25
              const progress = isCurrent ? Math.min((totalArticlesRead / milestone) * 100, 100) : isCompleted ? 100 : 0
              
              return (
                <div className="relative group/milestone">
                  <div className={`absolute -inset-1 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-lg transition-all ${isCompleted ? 'opacity-60' : isCurrent ? 'opacity-40 group-hover/milestone:opacity-60' : 'opacity-10'}`} />
                  
                  <Card className={`relative border-2 transition-all transform ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-yellow-500/50 shadow-xl shadow-yellow-500/30' 
                      : isCurrent
                      ? 'bg-card/80 backdrop-blur-sm border-yellow-400/40 group-hover/milestone:scale-105'
                      : 'bg-muted/30 border-border/30'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="relative">
                          <div className={`absolute -inset-2 rounded-full blur-md ${isCompleted ? 'bg-yellow-400/50 animate-pulse' : 'bg-yellow-400/20'}`} />
                          <Crown className={`relative w-10 h-10 ${isCompleted ? 'text-yellow-500 fill-yellow-500/20' : 'text-yellow-500/50'}`} />
                        </div>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-yellow-600 fill-yellow-600" />}
                      </div>
                      <CardTitle className="text-lg">Gold Master</CardTitle>
                      <p className="text-sm text-muted-foreground">Impressive dedication</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-3xl font-bold ${isCompleted ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                          {milestone}
                        </span>
                        <span className="text-sm text-muted-foreground">articles</span>
                      </div>
                      {!isCompleted && (
                        <>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {milestone - totalArticlesRead} more to go!
                          </p>
                        </>
                      )}
                      {isCompleted && (
                        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 mt-1">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          Unlocked!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* 100 Articles - Diamond */}
            {(() => {
              const milestone = 100
              const isCompleted = totalArticlesRead >= milestone
              const isCurrent = !isCompleted && totalArticlesRead >= 50
              const progress = isCurrent ? Math.min((totalArticlesRead / milestone) * 100, 100) : isCompleted ? 100 : 0
              
              return (
                <div className="relative group/milestone">
                  <div className={`absolute -inset-1 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-xl transition-all ${isCompleted ? 'opacity-70 animate-pulse' : isCurrent ? 'opacity-40 group-hover/milestone:opacity-60' : 'opacity-10'}`} />
                  
                  <Card className={`relative border-2 transition-all transform ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-500/60 shadow-2xl shadow-cyan-500/40' 
                      : isCurrent
                      ? 'bg-card/80 backdrop-blur-sm border-cyan-400/40 group-hover/milestone:scale-105'
                      : 'bg-muted/30 border-border/30'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="relative">
                          <div className={`absolute -inset-2 rounded-full blur-lg ${isCompleted ? 'bg-gradient-to-r from-cyan-400 to-purple-500 opacity-60 animate-pulse' : 'bg-cyan-400/20'}`} />
                          <Rocket className={`relative w-10 h-10 ${isCompleted ? 'text-cyan-500 fill-cyan-500/20' : 'text-cyan-500/50'}`} />
                        </div>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-cyan-500 fill-cyan-500" />}
                      </div>
                      <CardTitle className="text-lg bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                        Diamond Legend
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Ultimate achievement</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-3xl font-bold ${isCompleted ? 'bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent' : 'text-muted-foreground'}`}>
                          {milestone}
                        </span>
                        <span className="text-sm text-muted-foreground">articles</span>
                      </div>
                      {!isCompleted && (
                        <>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {milestone - totalArticlesRead} more to go!
                          </p>
                        </>
                      )}
                      {isCompleted && (
                        <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 mt-1">
                          <Star className="w-3 h-3 mr-1 fill-cyan-500" />
                          Legendary!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-2 sm:flex gap-1">
                  {categories.slice(0, 4).map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="capitalize text-xs sm:text-sm"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                  {categories.length > 4 && (
                    <Badge variant="outline" className="ml-2 hidden sm:flex">
                      +{categories.length - 4}
                    </Badge>
                  )}
                </TabsList>
              </Tabs>
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
                <Card 
                  className="h-full border-2 border-border/50 bg-card/90 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 transform hover:scale-102 cursor-pointer overflow-hidden group-hover:border-primary/60"
                  onClick={() => onArticleClick?.(article.id)}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Cover Image or Placeholder */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                    {article.coverImage ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                        <ImageWithFallback
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </>
                    ) : (
                      <PlaceholderArt 
                        articleId={article.id}
                        category={article.category}
                        title={article.title}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                        useCategoryArt={true}
                      />
                    )}
                    
                    {/* Read Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0 shadow-lg px-3 py-1 gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Read
                      </Badge>
                    </div>

                    {/* Quick Share Actions */}
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      {/* Copy Link Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 rounded-full bg-background/90 backdrop-blur-md border-2 border-primary/20 hover:border-primary/40 hover:bg-background shadow-lg hover:shadow-primary/20 transition-all"
                        onClick={handleCopyLink}
                        title="Copy link"
                      >
                        <Link2 className="w-4 h-4 text-primary" />
                      </Button>

                      {/* Native Share Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 rounded-full bg-background/90 backdrop-blur-md border-2 border-primary/20 hover:border-primary/40 hover:bg-background shadow-lg hover:shadow-primary/20 transition-all"
                        onClick={handleNativeShare}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="relative p-5 space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </CardTitle>
                    </div>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[4.5rem]">
                      {article.excerpt}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Badge 
                        className="bg-primary/10 text-primary border-primary/30 px-2.5 py-1 gap-1.5"
                      >
                        <Bookmark className="w-3 h-3" />
                        {article.category}
                      </Badge>
                      <Badge variant="outline" className="px-2.5 py-1 gap-1.5 bg-background/50">
                        <Clock className="w-3 h-3" />
                        {article.readingTime} min
                      </Badge>
                      <Badge variant="outline" className="px-2.5 py-1 gap-1.5 bg-background/50">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/10 via-primary/5 to-transparent rounded-tl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Bottom shine effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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