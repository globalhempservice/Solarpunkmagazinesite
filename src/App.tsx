import { useState, useEffect, useRef } from 'react'
import { createClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from './utils/featureUnlocks'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { ArticleCard } from './components/ArticleCard'
import { ArticleReader } from './components/ArticleReader'
import { UserDashboard } from './components/UserDashboard'
import { ArticleEditor } from './components/ArticleEditor'
import { LinkedInImporter } from './components/LinkedInImporter'
import { AdminPanel } from './components/AdminPanel'
import { AdminDashboard } from './components/AdminDashboard'
import { BottomNavbar } from './components/BottomNavbar'
import { StreakBanner } from './components/StreakBanner'
import { ReadingHistory } from './components/ReadingHistory'
import { SwipeMode } from './components/SwipeMode'
import { MatchedArticles } from './components/MatchedArticles'
import { AchievementsPage } from './components/AchievementsPage'
import { BrowsePage } from './components/BrowsePage'
import { AccountSettings } from './components/AccountSettings'
import { PointsSystemPage } from './components/PointsSystemPage'
import { ResetPasswordPage } from './components/ResetPasswordPage'
import { ResetPasswordModal } from './components/ResetPasswordModal'
import { FeatureUnlockModal } from './components/FeatureUnlockModal'
import { ComicLockOverlay } from './components/ComicLockOverlay'
import { ReadingAnalytics } from './components/ReadingAnalytics'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Skeleton } from './components/ui/skeleton'
import { Sparkles, Search, X, Filter, Heart, Zap, BookOpen } from 'lucide-react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { toast } from 'sonner@2.0.3'

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
  nadaPoints?: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  readArticles: string[]
  lastReadDate: string | null
  nickname?: string
  homeButtonTheme?: string
  marketingOptIn?: boolean
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'linkedin-importer' | 'matched-articles' | 'achievements' | 'browse' | 'swipe' | 'settings' | 'points-system' | 'reset-password' | 'reading-analytics'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [userArticles, setUserArticles] = useState<Article[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [matchedArticles, setMatchedArticles] = useState<Article[]>([])
  const [swipeRefReady, setSwipeRefReady] = useState(false)
  const [previousView, setPreviousView] = useState<'feed' | 'swipe'>('feed')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [featureUnlockModal, setFeatureUnlockModal] = useState<{ featureId: 'swipe-mode' | 'article-sharing' | 'article-creation' | 'reading-analytics' | 'theme-customization'; isOpen: boolean } | null>(null)
  const swipeModeRef = useRef<{ handleSkip: () => void; handleMatch: () => void; handleReset: () => void; isAnimating: boolean } | null>(null)

  const supabase = createClient()
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

  const categories = ['all', 'Renewable Energy', 'Sustainable Tech', 'Green Cities', 'Eco Innovation', 'Climate Action', 'Community', 'Future Vision']

  // Reset swipeRefReady when switching away from swipe mode
  useEffect(() => {
    if (currentView !== 'swipe') {
      setSwipeRefReady(false)
      swipeModeRef.current = null
    }
  }, [currentView])

  // Load matched articles from localStorage on mount
  useEffect(() => {
    // Only load if user is authenticated
    if (!userId) return
    
    const savedMatches = localStorage.getItem(`matchedArticles_${userId}`)
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
          localStorage.setItem(`matchedArticles_${userId}`, JSON.stringify(uniqueMatches))
        }
      } catch (error) {
        console.error('Error loading matched articles:', error)
      }
    }
  }, [userId])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session check error:', error)
          setInitializing(false)
          return
        }
        
        if (session?.access_token) {
          console.log('✅ Session found, setting up auth state')
          console.log('🔑 Access token:', session.access_token.substring(0, 20) + '...')
          console.log('👤 User ID:', session.user.id)
          console.log('📧 Email:', session.user.email)
          console.log('⏰ Expires at:', new Date(session.expires_at! * 1000).toLocaleString())
          
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          setIsAuthenticated(true)
        } else {
          console.log('ℹ️ No active session found')
        }
      } catch (error) {
        console.error('❌ Error checking session:', error)
      } finally {
        setInitializing(false)
      }
    }
    
    // FIRST: Check if URL contains recovery token - do this BEFORE everything else
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get('access_token')
      const type = params.get('type')
      
      if (token && type === 'recovery') {
        console.log('🔑 Recovery token detected in URL - showing reset modal')
        setResetToken(token)
        setShowResetPasswordModal(true)
        setInitializing(false)
        // Don't proceed with normal session check - just show the modal
        return
      }
    }
    
    // Check if we're on the reset password page (legacy)
    if (window.location.pathname === '/reset-password') {
      setCurrentView('reset-password')
      setInitializing(false)
      return
    }
    
    checkSession()
    
    // Set up auth state change listener for automatic token refresh
    console.log('👂 Setting up auth state listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.access_token) {
          console.log('✅ Auth state: Token updated')
          console.log('🔑 New access token:', session.access_token.substring(0, 20) + '...')
          console.log('⏰ New expires at:', new Date(session.expires_at! * 1000).toLocaleString())
          
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          setIsAuthenticated(true)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Auth state: User signed out')
        setAccessToken(null)
        setUserId(null)
        setUserEmail(null)
        setIsAuthenticated(false)
      } else if (event === 'USER_UPDATED') {
        console.log('🔄 Auth state: User updated')
        if (session?.access_token) {
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
        }
      }
    })
    
    // Check if URL contains article parameter for sharing
    const urlParams = new URLSearchParams(window.location.search)
    const sharedArticleId = urlParams.get('article')
    if (sharedArticleId) {
      fetchSharedArticle(sharedArticleId)
    }
    
    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [])

  // Fetch articles and user progress when authenticated
  useEffect(() => {
    if (isAuthenticated && userId && accessToken) {
      fetchArticles()
      fetchUserProgress()
      fetchUserArticles()
    }
  }, [isAuthenticated, userId, accessToken])

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
      // Removed toast notification - errors shown in console only
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
    if (!userId || !accessToken) {
      console.log('⚠️ fetchUserArticles: Missing credentials', { 
        userId: userId ? 'present' : 'missing', 
        accessToken: accessToken ? 'present' : 'missing' 
      })
      return
    }

    try {
      console.log('📥 Fetching user articles for user:', userId)
      console.log('🔑 Using access token:', accessToken.substring(0, 20) + '...')
      console.log('🔑 Token length:', accessToken.length)
      
      const response = await fetch(`${serverUrl}/my-articles`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to fetch user articles. Status:', response.status, 'Error:', errorData)
        
        // If authentication failed, try to refresh the session
        if (response.status === 401) {
          console.log('🔄 Authentication failed, checking session validity...')
          
          // First, try to get the current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            console.error('❌ No valid session found, logging out user')
            alert('Your session has expired. Please log in again.')
            handleLogout()
            return
          }
          
          // If we have a session, try to refresh it
          console.log('🔄 Attempting to refresh session...')
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (newSession?.access_token && !refreshError) {
            console.log('✅ Session refreshed successfully')
            console.log('🔑 New token:', newSession.access_token.substring(0, 20) + '...')
            setAccessToken(newSession.access_token)
            // The fetch will retry automatically when accessToken updates
            return
          } else {
            console.error('❌ Failed to refresh session:', refreshError)
            alert('Your session has expired. Please log in again.')
            handleLogout()
            return
          }
        }
        
        setUserArticles([])
        return
      }

      const data = await response.json()
      console.log('✅ User articles fetched:', data.articles?.length || 0, 'articles')
      setUserArticles(data.articles || [])
    } catch (error: any) {
      console.error('❌ Error fetching user articles:', error)
      setUserArticles([])
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
        console.error('Article not found')
        return
      }

      const data = await response.json()
      setSelectedArticle(data.article)
      setCurrentView('article')
    } catch (error: any) {
      console.error('Error fetching shared article:', error)
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
      setUserEmail(data.user.email)
      setIsAuthenticated(true)
    }
  }

  const handleSignup = async (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => {
    try {
      const response = await fetch(`${serverUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name, acceptedTerms, marketingOptIn })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create account')
      }

      // After signup, sign in
      await handleLogin(email, password)
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
  }

  const handleArticleClick = async (article: Article) => {
    // Save current explore mode before switching to article view
    setPreviousView(currentView)
    
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
          // Achievement notifications removed - points shown in navbar
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
      
      setCurrentView('feed')
      await fetchArticles()
      await fetchUserArticles()
      await fetchUserProgress() // Refresh points after article creation
    } catch (error: any) {
      console.error('Error saving article:', error)
      // Error logged in console only
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

      await fetchUserArticles()
      await fetchArticles()
    } catch (error: any) {
      console.error('Error deleting article:', error)
      // Error logged in console only
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

      setEditingArticle(null)
      setCurrentView('dashboard')
      await fetchArticles()
      await fetchUserArticles()
    } catch (error: any) {
      console.error('Error updating article:', error)
      // Error logged in console only
    }
  }

  const handleUpdateProfile = async (nickname: string, theme: string) => {
    if (!userId || !accessToken) {
      console.error('Missing userId or accessToken:', { userId, accessToken: accessToken ? 'present' : 'missing' })
      throw new Error('Not authenticated')
    }

    try {
      console.log('=== FRONTEND: Sending profile update ===')
      console.log('URL:', `${serverUrl}/users/${userId}/profile`)
      console.log('Payload:', { nickname, homeButtonTheme: theme })
      console.log('User ID:', userId)
      console.log('Access Token:', accessToken ? 'present' : 'missing')
      
      const response = await fetch(`${serverUrl}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ nickname, homeButtonTheme: theme })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Profile update failed:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      console.log('Profile update response:', data)
      
      setUserProgress(data.progress)
      // Points notification removed - shown in navbar animation
      
      console.log('=== FRONTEND: Profile update successful ===')
    } catch (error: any) {
      console.error('=== FRONTEND: Profile update error ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      throw error
    }
  }

  const handleUpdateMarketingPreference = async (marketingOptIn: boolean) => {
    if (!userId || !accessToken) {
      console.error('User ID or access token not available')
      throw new Error('User not authenticated')
    }

    try {
      console.log('=== FRONTEND: Updating marketing preference ===')
      console.log('Marketing Opt-In:', marketingOptIn)

      const response = await fetch(`${serverUrl}/users/${userId}/marketing-preference`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ marketingOptIn })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error response:', errorData)
        throw new Error(errorData.error || 'Failed to update marketing preference')
      }

      const data = await response.json()
      console.log('Marketing preference update response:', data)
      
      // Update local state
      if (userProgress) {
        setUserProgress({
          ...userProgress,
          marketingOptIn
        })
      }
      
      console.log('=== FRONTEND: Marketing preference update successful ===')
    } catch (error: any) {
      console.error('=== FRONTEND: Marketing preference update error ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      throw error
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
        
        {/* Reset Password Modal - Shows even when not authenticated if recovery token is present */}
        {showResetPasswordModal && resetToken && (
          <ResetPasswordModal
            accessToken={resetToken}
            onSuccess={async () => {
              // Password updated successfully! User is now auto-logged in
              console.log('✅ Password reset successful')
              
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname)
              
              // Close the modal
              setShowResetPasswordModal(false)
              setResetToken(null)
              
              // Refresh the session to get the updated user data
              const { data: { session } } = await supabase.auth.getSession()
              if (session) {
                setAccessToken(session.access_token)
                setUserId(session.user.id)
                setUserEmail(session.user.email)
                setIsAuthenticated(true)
              }
            }}
            onClose={() => {
              // User cancelled - go back to login
              setShowResetPasswordModal(false)
              setResetToken(null)
              setIsAuthenticated(false)
              window.history.replaceState(null, '', window.location.pathname)
            }}
          />
        )}
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
        nadaPoints={userProgress?.nadaPoints || 0}
        exploreMode={currentView === 'swipe' ? 'swipe' : 'grid'}
        onSwitchToGrid={() => setCurrentView('feed')}
        currentStreak={currentView === 'swipe' ? userProgress?.currentStreak : undefined}
        homeButtonTheme={userProgress?.homeButtonTheme}
        accessToken={accessToken || undefined}
        serverUrl={serverUrl}
        onExchangePoints={async (pointsToExchange) => {
          if (!userId || !accessToken) return
          
          try {
            const response = await fetch(`${serverUrl}/users/${userId}/exchange-points`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ pointsToExchange })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              
              // Handle rate limiting with specific messages
              if (response.status === 429) {
                if (errorData.retryAfter) {
                  const minutes = Math.ceil(errorData.retryAfter / 60)
                  toast.error(`⏳ ${errorData.error} Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`)
                } else {
                  toast.error(`⏳ ${errorData.error}`)
                }
                throw new Error(errorData.error)
              }
              
              throw new Error(errorData.error || 'Failed to exchange points')
            }
            
            const data = await response.json()
            setUserProgress(data.progress)
            toast.success(`🎉 Exchanged successfully! You got ${data.nadaPointsGained} NADA points!`)
          } catch (error: any) {
            console.error('Exchange error:', error)
            if (!error.message.includes('⏳') && !error.message.includes('Rate limit') && !error.message.includes('Daily')) {
              toast.error(error.message || 'Failed to exchange points')
            }
            throw error
          }
        }}
        onBack={() => {
          if (currentView === 'article') {
            setCurrentView(previousView === 'swipe' ? 'swipe' : 'feed')
            setSelectedArticle(null)
          } else if (currentView === 'swipe') {
            setCurrentView('feed')
          } else if (currentView === 'admin') {
            setCurrentView('dashboard')
          } else {
            setCurrentView('dashboard')
          }
        }}
      />

      <main className={`container mx-auto px-4 ${currentView === 'swipe' ? 'py-0 h-[calc(100vh-64px)] overflow-hidden' : 'py-8 pb-32'}`}>
        {/* Increased pb-32 (128px) to account for bottom navbar height on all devices, but remove padding in swipe mode */}
        {currentView === 'feed' && (
          <div className="space-y-6">
            {/* Streak Banner - Only show in grid mode */}
            {userProgress && userProgress.currentStreak > 0 && (
              <StreakBanner
                currentStreak={userProgress.currentStreak}
                longestStreak={userProgress.longestStreak}
                points={userProgress.points}
                onNavigateToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {/* Action Cards - Horizontal on desktop, vertical on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Swipe Mode Card */}
              <div 
                onClick={() => {
                  const totalRead = userProgress?.totalArticlesRead || 0
                  const swipeUnlocked = isFeatureUnlocked('swipe-mode', totalRead)
                  
                  if (!swipeUnlocked) {
                    setFeatureUnlockModal({ featureId: 'swipe-mode', isOpen: true })
                    return
                  }
                  
                  setPreviousView('feed')
                  setCurrentView('swipe')
                }}
                className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/50 cursor-pointer group hover:shadow-xl hover:shadow-pink-500/60 transition-all"
              >
                {/* Comic Lock Overlay - Show when locked */}
                {!isFeatureUnlocked('swipe-mode', userProgress?.totalArticlesRead || 0) && (
                  <ComicLockOverlay 
                    articlesNeeded={FEATURE_UNLOCKS['swipe-mode'].requiredArticles - (userProgress?.totalArticlesRead || 0)} 
                  />
                )}
                
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                
                <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
                  {/* Icon */}
                  <div className="relative flex-shrink-0 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-md opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-full p-3 text-white group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                        💖 SWIPE MODE
                      </h3>
                      <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Swipe through articles and create your reading list
                    </p>
                  </div>

                  {/* Feature Pills Row */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {/* Match List Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-500/10 rounded-full text-xs font-medium text-pink-600 dark:text-pink-400">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 12L11 14L15 10" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
                      </svg>
                      <span className="hidden sm:inline">Match List</span>
                    </div>
                    
                    {/* Unlimited Rewind Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12C4 7.58172 7.58172 4 12 4C14.5264 4 16.7792 5.17107 18.2454 7M20 12C20 16.4183 16.4183 20 12 20C9.47362 20 7.22075 18.8289 5.75463 17M12 2V6M12 18V22" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 7L18 4L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="hidden sm:inline">Rewind</span>
                    </div>
                  </div>

                  {/* Action Button - Centered */}
                  <div className="pt-4 border-t border-border/50 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-xl border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-all shadow-lg shadow-pink-500/20 group-hover:shadow-xl group-hover:shadow-pink-500/30">
                      <Heart className="w-4 h-4 text-pink-500 fill-current" />
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">START</span>
                      <svg className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Create Article Card */}
              <div 
                onClick={() => {
                  const totalRead = userProgress?.totalArticlesRead || 0
                  const createUnlocked = isFeatureUnlocked('article-creation', totalRead)
                  
                  if (!createUnlocked) {
                    setFeatureUnlockModal({ featureId: 'article-creation', isOpen: true })
                    return
                  }
                  
                  setCurrentView('editor')
                }}
                className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-[2px] shadow-lg shadow-emerald-500/50 cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/60 transition-all"
              >
                {/* Comic Lock Overlay - Show when locked */}
                {!isFeatureUnlocked('article-creation', userProgress?.totalArticlesRead || 0) && (
                  <ComicLockOverlay 
                    articlesNeeded={FEATURE_UNLOCKS['article-creation'].requiredArticles - (userProgress?.totalArticlesRead || 0)} 
                  />
                )}
                
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                
                <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
                  {/* Icon */}
                  <div className="relative flex-shrink-0 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-600 blur-md opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-full p-3 text-white group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                        ✨ CREATE ARTICLE
                      </h3>
                      <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your knowledge and earn massive points
                    </p>
                  </div>

                  {/* Feature Pills Row */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {/* Points Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
                      </svg>
                      <span className="hidden sm:inline">+50 Points</span>
                    </div>
                    
                    {/* Rich Editor Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-500/10 rounded-full text-xs font-medium text-teal-600 dark:text-teal-400">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="hidden sm:inline">Rich Editor</span>
                    </div>
                  </div>

                  {/* Action Button - Centered */}
                  <div className="pt-4 border-t border-border/50 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/30 group-hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/20 group-hover:shadow-xl group-hover:shadow-emerald-500/30">
                      <Zap className="w-4 h-4 text-emerald-500 fill-current" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">START</span>
                      <svg className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Browse Articles Card */}
              <div 
                onClick={() => setCurrentView('browse')}
                className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 p-[2px] shadow-lg shadow-blue-500/50 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/60 transition-all"
              >
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                
                <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
                  {/* Icon */}
                  <div className="relative flex-shrink-0 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 blur-md opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-full p-3 text-white group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                        📚 BROWSE
                      </h3>
                      <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore all articles with categories and search
                    </p>
                  </div>

                  {/* Feature Pills Row */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {/* Categories Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Filter className="w-3 h-3" />
                      <span className="hidden sm:inline">Categories</span>
                    </div>
                    
                    {/* Search Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 rounded-full text-xs font-medium text-violet-600 dark:text-violet-400">
                      <Search className="w-3 h-3" />
                      <span className="hidden sm:inline">Search</span>
                    </div>
                  </div>

                  {/* Action Button - Centered */}
                  <div className="pt-4 border-t border-border/50 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border-2 border-blue-500/30 group-hover:border-blue-500/50 transition-all shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">START</span>
                      <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Swipe Mode - Standalone View */}
        {currentView === 'swipe' && (
          <SwipeMode 
            articles={filteredArticles}
            accessToken={accessToken}
            onMatch={(article) => {
              // Add to matched articles and save to localStorage (prevent duplicates) - user-specific
              const isDuplicate = matchedArticles.some(a => a.id === article.id)
              if (!isDuplicate && userId) {
                const updatedMatches = [...matchedArticles, article]
                setMatchedArticles(updatedMatches)
                localStorage.setItem(`matchedArticles_${userId}`, JSON.stringify(updatedMatches))
              }
            }}
            onReadArticle={handleArticleClick}
            onSwitchToGrid={() => setCurrentView('feed')}
            ref={swipeModeRef}
            onRefReady={() => setSwipeRefReady(true)}
          />
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
            onViewPointsSystem={() => setCurrentView('points-system')}
            onViewReadingAnalytics={() => setCurrentView('reading-analytics')}
            onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
            accessToken={accessToken || undefined}
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
            accessToken={accessToken}
            suggestedArticles={articles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 2)}
            onArticleSelect={(article) => {
              setSelectedArticle(article)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onBack={() => {
              setCurrentView('feed')
              setSelectedArticle(null)
              // Restore the previous explore mode (grid or swipe)
              setPreviousView('feed')
            }}
          />
        )}

        {currentView === 'admin' && accessToken && (
          <AdminDashboard
            accessToken={accessToken}
            serverUrl={serverUrl}
            onBack={() => setCurrentView('dashboard')}
          />
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

        {currentView === 'points-system' && (
          <PointsSystemPage
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'browse' && (
          <BrowsePage
            articles={articles}
            onArticleClick={handleArticleClick}
            loading={loading}
          />
        )}

        {currentView === 'settings' && (
          <AccountSettings
            userId={userId}
            userEmail={userEmail}
            userPoints={userProgress?.points}
            userNickname={userProgress?.nickname}
            homeButtonTheme={userProgress?.homeButtonTheme}
            marketingOptIn={userProgress?.marketingOptIn}
            totalArticlesRead={userProgress?.totalArticlesRead || 0}
            accessToken={accessToken || undefined}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onUpdateMarketingPreference={handleUpdateMarketingPreference}
            onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordPage 
            onBack={() => {
              setCurrentView('feed')
              setIsAuthenticated(false)
              // Clear URL hash if present
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname)
              }
            }}
          />
        )}

        {currentView === 'reading-analytics' && userProgress && (
          <ReadingAnalytics
            progress={userProgress}
            allArticles={articles}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      <BottomNavbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
        totalArticlesRead={userProgress?.totalArticlesRead || 0}
        onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
        exploreMode={currentView === 'swipe' ? 'swipe' : 'grid'}
        swipeControls={currentView === 'swipe' ? {
          onSkip: () => swipeModeRef.current?.handleSkip(),
          onMatch: () => swipeModeRef.current?.handleMatch(),
          onReset: () => swipeModeRef.current?.handleReset(),
          isAnimating: swipeModeRef.current?.isAnimating || false
        } : undefined}
      />

      {/* Feature Unlock Modal */}
      {featureUnlockModal && (
        <FeatureUnlockModal
          isOpen={featureUnlockModal.isOpen}
          onClose={() => setFeatureUnlockModal(null)}
          featureId={featureUnlockModal.featureId}
          currentProgress={userProgress?.totalArticlesRead || 0}
        />
      )}
    </div>
  )
}