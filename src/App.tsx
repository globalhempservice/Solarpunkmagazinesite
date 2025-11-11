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
import { Sparkles } from 'lucide-react'

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

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

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

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-muted border border-border w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm whitespace-nowrap"
                  >
                    {category === 'all' ? 'All' : category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

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
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl">Write Article</h2>
              <p className="text-muted-foreground">Share your knowledge and ideas</p>
            </div>
            <ArticleEditor
              onSave={handleSaveArticle}
              onCancel={() => setCurrentView('feed')}
              article={editingArticle}
              onUpdate={handleUpdateArticle}
            />
          </div>
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleReader
            article={selectedArticle}
            userProgress={userProgress}
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