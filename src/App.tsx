import { useState, useEffect, useRef } from 'react'
import { createClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { ArticleCard } from './components/ArticleCard'
import { ArticleReader } from './components/ArticleReader'
import { UserDashboard } from './components/UserDashboard'
import { ArticleEditor } from './components/ArticleEditor'
import { LinkedInImporter } from './components/LinkedInImporter'
import { AdminPanel } from './components/AdminPanel'
import { BottomNavbar } from './components/BottomNavbar'
import { StreakBanner } from './components/StreakBanner'
import { ReadingHistory } from './components/ReadingHistory'
import { SwipeMode } from './components/SwipeMode'
import { MatchedArticles } from './components/MatchedArticles'
import { AchievementsPage } from './components/AchievementsPage'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import { Skeleton } from './components/ui/skeleton'
import { Alert, AlertDescription } from './components/ui/alert'
import { Sparkles, Search, X, Filter, Heart, Zap } from 'lucide-react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'

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
  source?: string
  sourceUrl?: string
  // LinkedIn metadata
  author?: string
  authorImage?: string
  authorTitle?: string
  publishDate?: string
  media?: Array<{
    type: 'youtube' | 'audio' | 'image'
    url: string
    caption?: string
  }>
}

interface UserProgress {
  userId: string
  totalArticlesRead: number
  points: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  readArticles: string[]
  lastReadDate: string | null
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'linkedin-importer' | 'matched-articles' | 'achievements'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [userArticles, setUserArticles] = useState<Article[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [exploreMode, setExploreMode] = useState<'grid' | 'swipe'>('grid')
  const [matchedArticles, setMatchedArticles] = useState<Article[]>([])
  const [swipeRefReady, setSwipeRefReady] = useState(false)
  const [previousExploreMode, setPreviousExploreMode] = useState<'grid' | 'swipe'>('grid')
  const swipeModeRef = useRef<{ handleSkip: () => void; handleMatch: () => void; handleReset: () => void; isAnimating: boolean } | null>(null)

  const supabase = createClient()
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

  const categories = ['all', 'Renewable Energy', 'Sustainable Tech', 'Green Cities', 'Eco Innovation', 'Climate Action', 'Community', 'Future Vision']

  // Reset swipeRefReady when switching away from swipe mode
  useEffect(() => {
    if (exploreMode !== 'swipe') {
      setSwipeRefReady(false)
      swipeModeRef.current = null
    }
  }, [exploreMode])

  // Load matched articles from localStorage on mount
  useEffect(() => {
    const savedMatches = localStorage.getItem('matchedArticles')
    if (savedMatches) {
      try {
        const parsedMatches = JSON.parse(savedMatches)
        // Remove duplicates by filtering unique article IDs
        const uniqueMatches = parsedMatches.filter((article: Article, index: number, self: Article[]) => 
          index === self.findIndex((a) => a.id === article.id)
        )
        setMatchedArticles(uniqueMatches)
        // Save back the deduplicated list
        if (uniqueMatches.length !== parsedMatches.length) {
          localStorage.setItem('matchedArticles', JSON.stringify(uniqueMatches))
        }
      } catch (error) {
        console.error('Error loading matched articles:', error)
      }
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session?.access_token && !error) {
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setInitializing(false)
      }
    }
    checkSession()
    
    // Check if URL contains article parameter for sharing
    const urlParams = new URLSearchParams(window.location.search)
    const sharedArticleId = urlParams.get('article')
    if (sharedArticleId) {
      fetchSharedArticle(sharedArticleId)
    }
  }, [])

  // Fetch articles and user progress when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchArticles()
      fetchUserProgress()
      fetchUserArticles()
    }
  }, [isAuthenticated, userId])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      console.log('Fetching articles from:', `${serverUrl}/articles`)
      const response = await fetch(`${serverUrl}/articles`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Fetch articles error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch articles')
      }

      const data = await response.json()
      console.log('Articles fetched:', data.articles?.length || 0, 'articles')
      setArticles(data.articles || [])
    } catch (error: any) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async () => {
    if (!userId) return

    try {
      const response = await fetch(`${serverUrl}/users/${userId}/progress`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user progress')
      }

      const data = await response.json()
      setUserProgress(data.progress)
    } catch (error: any) {
      console.error('Error fetching user progress:', error)
    }
  }

  const fetchUserArticles = async () => {
    if (!userId || !accessToken) return

    try {
      const response = await fetch(`${serverUrl}/my-articles`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch user articles. Status:', response.status, 'Error:', errorData)
        setUserArticles([]) // Set to empty array instead of throwing
        return
      }

      const data = await response.json()
      setUserArticles(data.articles || [])
    } catch (error: any) {
      console.error('Error fetching user articles:', error)
      setUserArticles([]) // Ensure we set empty array on error
    }
  }

  const fetchSharedArticle = async (articleId: string) => {
    try {
      const response = await fetch(`${serverUrl}/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      if (!response.ok) {
        toast.error('Article not found')
        return
      }

      const data = await response.json()
      setSelectedArticle(data.article)
      setCurrentView('article')
      toast.success('Shared article loaded!')
    } catch (error: any) {
      console.error('Error fetching shared article:', error)
      toast.error('Failed to load shared article')
    }
  }

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.session) {
      setAccessToken(data.session.access_token)
      setUserId(data.user.id)
      setIsAuthenticated(true)
      toast.success('Welcome back!')
    }
  }

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${serverUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create account')
      }

      // After signup, sign in
      await handleLogin(email, password)
      toast.success('Account created successfully!')
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setAccessToken(null)
    setUserId(null)
    setUserProgress(null)
    setArticles([])
    setCurrentView('feed')
    toast.success('Logged out successfully')
  }

  const handleArticleClick = async (article: Article) => {
    // Save current explore mode before switching to article view
    setPreviousExploreMode(exploreMode)
    
    setSelectedArticle(article)
    setCurrentView('article')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Increment view count
    try {
      await fetch(`${serverUrl}/articles/${article.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }

    // Mark as read and update progress
    if (userId && userProgress && !userProgress.readArticles.includes(article.id)) {
      try {
        const response = await fetch(`${serverUrl}/users/${userId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ articleId: article.id })
        })

        if (response.ok) {
          const data = await response.json()
          setUserProgress(data.progress)

          if (data.newAchievements && data.newAchievements.length > 0) {
            data.newAchievements.forEach((achievement: any) => {
              toast.success(`Achievement Unlocked: ${achievement.name}`, {
                description: achievement.description
              })
            })
          }
        }
      } catch (error) {
        console.error('Error updating reading progress:', error)
      }
    }
  }

  const handleSaveArticle = async (articleData: any) => {
    if (!accessToken) return

    try {
      const response = await fetch(`${serverUrl}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(articleData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Article save error response:', errorData)
        throw new Error(errorData.error || 'Failed to save article')
      }

      const result = await response.json()
      console.log('Article saved successfully:', result)
      
      toast.success('Article published successfully!')
      setCurrentView('feed')
      await fetchArticles()
    } catch (error: any) {
      console.error('Error saving article:', error)
      toast.error('Failed to save article: ' + error.message)
    }
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setCurrentView('editor')
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!accessToken) return
    
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`${serverUrl}/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Delete article error response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to delete article')
      }

      toast.success('Article deleted successfully')
      await fetchUserArticles()
      await fetchArticles()
    } catch (error: any) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article: ' + error.message)
    }
  }

  const handleUpdateArticle = async (articleData: any) => {
    if (!accessToken || !editingArticle) return

    try {
      const response = await fetch(`${serverUrl}/articles/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(articleData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update article')
      }

      toast.success('Article updated successfully!')
      setEditingArticle(null)
      setCurrentView('dashboard')
      await fetchArticles()
      await fetchUserArticles()
    } catch (error: any) {
      console.error('Error updating article:', error)
      toast.error('Failed to update article: ' + error.message)
    }
  }

  const filteredArticles = articles.filter(article => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthForm onLogin={handleLogin} onSignup={handleSignup} />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userPoints={userProgress?.points}
        exploreMode={currentView === 'feed' ? exploreMode : undefined}
        onSwitchToGrid={() => setExploreMode('grid')}
        currentStreak={currentView === 'feed' && exploreMode === 'swipe' ? userProgress?.currentStreak : undefined}
        onBack={() => {
          if (currentView === 'article') {
            setCurrentView('feed')
            setSelectedArticle(null)
            setExploreMode(previousExploreMode)
          } else {
            setCurrentView('dashboard')
          }
        }}
      />

      <main className={`container mx-auto px-4 ${currentView === 'feed' && exploreMode === 'swipe' ? 'py-8 h-[calc(100vh-64px)] overflow-hidden' : 'py-8 pb-32'}`}>
        {/* Increased pb-32 (128px) to account for bottom navbar height on all devices, but remove padding in swipe mode */}
        {currentView === 'feed' && (
          <div className={exploreMode === 'swipe' ? 'h-full' : 'space-y-6'}>
            {/* Streak Banner - Only show in grid mode */}
            {exploreMode === 'grid' && userProgress && userProgress.currentStreak > 0 && (
              <StreakBanner
                currentStreak={userProgress.currentStreak}
                longestStreak={userProgress.longestStreak}
                points={userProgress.points}
                onNavigateToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {/* Swipe Mode Card - Only show in grid mode */}
            {exploreMode === 'grid' && (
              <div 
                onClick={() => setExploreMode('swipe')}
                className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/50 cursor-pointer group hover:shadow-xl hover:shadow-pink-500/60 transition-all"
              >
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                
                <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4">
                  {/* Main Content Row */}
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-md opacity-50 animate-pulse" />
                      <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-full p-3 text-white group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6 fill-white" />
                      </div>
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                          💖 TRY SWIPE MODE!
                        </h3>
                        <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Swipe through articles and create your reading list for later
                      </p>
                    </div>
                  </div>

                  {/* Feature Pills Row */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {/* Match List Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 rounded-full text-xs font-medium text-pink-600 dark:text-pink-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 12L11 14L15 10" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
                      </svg>
                      Match List
                    </div>
                    
                    {/* Unlimited Rewind Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12C4 7.58172 7.58172 4 12 4C14.5264 4 16.7792 5.17107 18.2454 7M20 12C20 16.4183 16.4183 20 12 20C9.47362 20 7.22075 18.8289 5.75463 17M12 2V6M12 18V22" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 7L18 4L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Unlimited Rewind
                    </div>
                  </div>

                  {/* Action Button - Centered */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-center">
                    <div className="flex items-center gap-2.5 px-6 py-3 bg-pink-500/10 rounded-xl border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-all shadow-lg shadow-pink-500/20 group-hover:shadow-xl group-hover:shadow-pink-500/30">
                      <Heart className="w-5 h-5 text-pink-500 animate-bounce fill-current" />
                      <span className="text-base font-bold text-pink-600 dark:text-pink-400">START SWIPING</span>
                      <svg className="w-5 h-5 text-pink-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
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
            )}

            {/* Divider - Only show in grid mode */}
            {exploreMode === 'grid' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
              </div>
            )}

            {/* Search and Filter Section - Only show in grid mode */}
            {exploreMode === 'grid' && (
              <div className="space-y-4">
                {/* Browse Latest Title */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Browse Latest</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent"></div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles by title, content, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12 h-14 text-base border-2 border-border/50 focus:border-primary/50 rounded-2xl bg-muted/30 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                    {categories.map(category => {
                      const isActive = selectedCategory === category
                      const categoryCount = category === 'all' 
                        ? articles.length
                        : articles.filter(a => a.category === category).length
                      
                      return (
                        <Badge
                          key={category}
                          variant={isActive ? "default" : "outline"}
                          className={`cursor-pointer whitespace-nowrap px-4 py-2 transition-all hover:scale-105 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                              : 'hover:bg-muted/70 hover:border-primary/30'
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category} {categoryCount > 0 && `(${categoryCount})`}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Articles Display */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found. Be the first to write one!</p>
              </div>
            ) : exploreMode === 'swipe' ? (
              <SwipeMode 
                articles={filteredArticles}
                onMatch={(article) => {
                  // Add to matched articles and save to localStorage (prevent duplicates)
                  const isDuplicate = matchedArticles.some(a => a.id === article.id)
                  if (!isDuplicate) {
                    const updatedMatches = [...matchedArticles, article]
                    setMatchedArticles(updatedMatches)
                    localStorage.setItem('matchedArticles', JSON.stringify(updatedMatches))
                  }
                }}
                onReadArticle={handleArticleClick}
                onSwitchToGrid={() => setExploreMode('grid')}
                ref={swipeModeRef}
                onRefReady={() => setSwipeRefReady(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => handleArticleClick(article)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && userProgress && (
          <UserDashboard 
            progress={userProgress}
            userArticles={userArticles}
            onEditArticle={handleEditArticle}
            onDeleteArticle={handleDeleteArticle}
            onLogout={handleLogout}
            onViewReadingHistory={() => setCurrentView('reading-history')}
            onViewMatches={() => setCurrentView('matched-articles')}
            matchesCount={matchedArticles.length}
            onViewAchievements={() => setCurrentView('achievements')}
          />
        )}

        {currentView === 'editor' && (
          <ArticleEditor
            onSave={handleSaveArticle}
            onCancel={() => setCurrentView('feed')}
            article={editingArticle}
            onUpdate={handleUpdateArticle}
          />
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleReader
            article={selectedArticle}
            userProgress={userProgress}
            allArticles={articles}
            suggestedArticles={articles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 2)}
            onArticleSelect={(article) => {
              setSelectedArticle(article)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onBack={() => {
              setCurrentView('feed')
              setSelectedArticle(null)
              // Restore the previous explore mode (grid or swipe)
              setExploreMode(previousExploreMode)
            }}
          />
        )}

        {currentView === 'admin' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl">Admin Panel</h2>
              <p className="text-muted-foreground">Manage all articles and view system data</p>
            </div>
            <AdminPanel
              articles={articles}
              onRefresh={fetchArticles}
              onDeleteArticle={(id) => setArticles(articles.filter(a => a.id !== id))}
              serverUrl={serverUrl}
              accessToken={accessToken}
            />
          </div>
        )}

        {currentView === 'reading-history' && userProgress && (
          <ReadingHistory
            readArticleIds={userProgress.readArticles}
            allArticles={articles}
            totalArticlesRead={userProgress.totalArticlesRead}
            points={userProgress.points}
            onBack={() => setCurrentView('dashboard')}
            onArticleClick={(articleId) => {
              const article = articles.find(a => a.id === articleId)
              if (article) {
                handleArticleClick(article)
              }
            }}
          />
        )}

        {currentView === 'linkedin-importer' && accessToken && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl">LinkedIn Post Importer</h2>
              <p className="text-muted-foreground">Convert LinkedIn posts into DEWII articles</p>
            </div>
            <LinkedInImporter
              accessToken={accessToken}
              onArticleCreated={() => {
                fetchArticles()
                fetchUserArticles()
                setCurrentView('feed')
              }}
            />
          </div>
        )}

        {currentView === 'matched-articles' && (
          <MatchedArticles
            articles={matchedArticles}
            onArticleClick={handleArticleClick}
            onBack={() => setCurrentView('feed')}
          />
        )}

        {currentView === 'achievements' && userProgress && accessToken && (
          <AchievementsPage
            progress={userProgress}
            onBack={() => setCurrentView('dashboard')}
            onProgressUpdate={(updatedProgress) => setUserProgress(updatedProgress)}
            accessToken={accessToken}
          />
        )}
      </main>

      <Toaster />
      <BottomNavbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
        exploreMode={currentView === 'feed' ? exploreMode : undefined}
        swipeControls={currentView === 'feed' && exploreMode === 'swipe' ? {
          onSkip: () => swipeModeRef.current?.handleSkip(),
          onMatch: () => swipeModeRef.current?.handleMatch(),
          onReset: () => swipeModeRef.current?.handleReset(),
          isAnimating: swipeModeRef.current?.isAnimating || false
        } : undefined}
      />
    </div>
  )
}