import { useEffect, useState } from 'react'
import { createClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { ArticleCard } from './components/ArticleCard'
import { ArticleReader } from './components/ArticleReader'
import { UserDashboard } from './components/UserDashboard'
import { ArticleEditor } from './components/ArticleEditor'
import { AdminPanel } from './components/AdminPanel'
import { BottomNavbar } from './components/BottomNavbar'
import { StreakBanner } from './components/StreakBanner'
import { ReadingHistory } from './components/ReadingHistory'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import { Skeleton } from './components/ui/skeleton'
import { Alert, AlertDescription } from './components/ui/alert'
import { Sparkles, Search, X, Filter } from 'lucide-react'
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
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [userArticles, setUserArticles] = useState<Article[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  const supabase = createClient()
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

  const categories = ['all', 'Renewable Energy', 'Sustainable Tech', 'Green Cities', 'Eco Innovation', 'Climate Action', 'Community', 'Future Vision']

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
      console.log('Articles data:', data.articles)
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
        throw new Error('Failed to fetch user articles')
      }

      const data = await response.json()
      setUserArticles(data.articles || [])
    } catch (error: any) {
      console.error('Error fetching user articles:', error)
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
        throw new Error('Failed to delete article')
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
      />

      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Increased pb-32 (128px) to account for bottom navbar height on all devices */}
        {currentView === 'feed' && (
          <div className="space-y-6">
            {userProgress && userProgress.currentStreak > 0 && (
              <StreakBanner
                currentStreak={userProgress.currentStreak}
                longestStreak={userProgress.longestStreak}
                points={userProgress.points}
              />
            )}

            {/* Search and Filter Section */}
            <div className="space-y-4">
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
                        {category === 'all' ? '🌍 All' : category}
                        {categoryCount > 0 && (
                          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                          }`}>
                            {categoryCount}
                          </span>
                        )}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedCategory !== 'all') && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                  </span>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                      className="h-7 text-xs gap-1 hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>

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
      </main>

      <Toaster />
      <BottomNavbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}