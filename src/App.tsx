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
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

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
  }, [])

  // Fetch articles and user progress when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchArticles()
      fetchUserProgress()
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
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-sky-50/20">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userPoints={userProgress?.points}
      />

      <main className="container mx-auto px-4 py-8">
        {currentView === 'feed' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl">Explore Articles</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Discover stories about our sustainable future</p>
              </div>
            </div>

            {userProgress && userProgress.currentStreak > 0 && (
              <Alert className="bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-sm">
                  🔥 You're on a {userProgress.currentStreak}-day reading streak! Keep it up!
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-emerald-50 border border-emerald-200 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
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
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl">Your Dashboard</h2>
              <p className="text-muted-foreground">Track your reading journey and achievements</p>
            </div>
            <UserDashboard progress={userProgress} />
          </div>
        )}

        {currentView === 'editor' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl">Write Article</h2>
              <p className="text-muted-foreground">Share your vision of a sustainable future</p>
            </div>
            <ArticleEditor
              onSave={handleSaveArticle}
              onCancel={() => setCurrentView('feed')}
            />
          </div>
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleReader
            article={selectedArticle}
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
      </main>

      <Toaster />
    </div>
  )
}