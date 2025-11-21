import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { createClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { isFeatureUnlocked, FEATURE_UNLOCKS } from './utils/featureUnlocks'
import { ReadingSecurityTracker } from './utils/readingSecurityTracker'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { ArticleCard } from './components/ArticleCard'
import { ArticleReader } from './components/ArticleReader'
import { UserDashboard } from './components/UserDashboard'
import { ArticleEditor } from './components/ArticleEditor'
import { LinkedInImporter } from './components/LinkedInImporter'
import { AdminPanel } from './components/AdminPanel'
import { AdminDashboard } from './components/AdminDashboard'
import { SwagShopAdmin } from './components/SwagShopAdmin'
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
import { HomeCards } from './components/HomeCards'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Skeleton } from './components/ui/skeleton'
import { Sparkles, Search, X, Filter, Heart, Zap, BookOpen, Loader } from 'lucide-react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { toast } from 'sonner@2.0.3'

// 🏪 LAZY LOAD: Community Market (separate world - only loads when accessed)
const CommunityMarket = lazy(() => import('./components/CommunityMarket'))

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
    type: 'youtube' | 'audio' | 'image' | 'pdf'
    url: string
    caption?: string
    title?: string
    previewUrl?: string
    isLinkedInDocument?: boolean
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
  marketUnlocked?: boolean
  selectedTheme?: string
  selectedBadge?: string
  profileBannerUrl?: string
  prioritySupport?: boolean
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'linkedin-importer' | 'matched-articles' | 'achievements' | 'browse' | 'swipe' | 'settings' | 'points-system' | 'reset-password' | 'reading-analytics' | 'community-market' | 'swag-admin'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const securityTrackerRef = useRef<ReadingSecurityTracker | null>(null)
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
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(true)
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
          console.error('❌ Session check error:', error.message)
          // If it's a refresh token error, clear the session
          if (error.message.includes('Refresh Token')) {
            console.log('🧹 Clearing invalid session data')
            await supabase.auth.signOut()
          }
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
      } catch (error: any) {
        console.error('❌ Error checking session:', error.message)
        // Clear any corrupted session data
        await supabase.auth.signOut()
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
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
        console.log('👋 Auth state:', event === 'SIGNED_OUT' ? 'User signed out' : 'Token refresh failed')
        setAccessToken(null)
        setUserId(null)
        setUserEmail(null)
        setIsAuthenticated(false)
        setUserProgress(null)
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

  // Apply theme globally when user progress loads or theme changes
  useEffect(() => {
    if (userProgress?.selectedTheme) {
      // Remove all theme classes first
      document.documentElement.classList.remove('dark', 'hempin', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour')
      // Add the selected theme class
      document.documentElement.classList.add(userProgress.selectedTheme)
      console.log('🎨 Theme applied:', userProgress.selectedTheme)
    } else {
      // Default: no theme class (uses :root styles)
      document.documentElement.classList.remove('dark', 'hempin', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour')
      console.log('🎨 Theme applied: default')
    }
  }, [userProgress?.selectedTheme])

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
        
        // If authentication failed, handle gracefully
        if (response.status === 401) {
          console.log('⚠️ Session expired or invalid (401) - logging out silently')
          
          // Clear the session
          await supabase.auth.signOut()
          setIsAuthenticated(false)
          setAccessToken(null)
          setUserId(null)
          setUserProgress(null)
          setUserArticles([])
          
          console.log('👋 Logged out - user will see login screen')
          return
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
      const viewUrl = userId 
        ? `${serverUrl}/articles/${article.id}/view?userId=${userId}`
        : `${serverUrl}/articles/${article.id}/view`
      
      const response = await fetch(viewUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ View tracked:', data)
      } else {
        console.error('❌ View tracking failed:', await response.text())
      }
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }

    // ============================================
    // ADVANCED SECURITY: Initialize reading tracker
    // ============================================
    if (userId && accessToken && userProgress && !userProgress.readArticles.includes(article.id)) {
      // Clean up previous tracker if exists
      if (securityTrackerRef.current) {
        securityTrackerRef.current.cleanup()
      }
      
      // Create new tracker for this article
      const tracker = new ReadingSecurityTracker(article.id)
      securityTrackerRef.current = tracker
      
      // Start reading session (get token from server)
      await tracker.startReading(serverUrl, accessToken)
      
      // Wait minimum time before allowing mark as read
      const minReadingTimeMs = Math.max(3000, (article.readingTime || 5) * 60 * 1000 * 0.1)
      
      setTimeout(async () => {
        // Verify user is still viewing the article
        if (selectedArticle?.id === article.id && currentView === 'article' && securityTrackerRef.current) {
          try {
            // Get all security metrics from tracker
            const metrics = securityTrackerRef.current.getMetrics()
            
            const response = await fetch(`${serverUrl}/users/${userId}/read`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ 
                articleId: article.id,
                ...metrics  // Include all security metrics
              })
            })

            if (response.ok) {
              const data = await response.json()
              setUserProgress(data.progress)
              console.log('✅ Article marked as read successfully')
              
              // Cleanup tracker
              securityTrackerRef.current.cleanup()
              securityTrackerRef.current = null
            } else {
              const error = await response.json()
              console.error('🚫 Security check failed:', error)
              toast.error(error.details || 'Failed to mark article as read')
            }
          } catch (error) {
            console.error('Error updating reading progress:', error)
          }
        }
      }, minReadingTimeMs)
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
      {/* Hide Header when in Community Market - Market has its own navigation */}
      {currentView !== 'community-market' && (
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
          userId={userId || undefined}
          accessToken={accessToken || undefined}
          serverUrl={serverUrl}
          isWalletOpen={isWalletOpen}
          onWalletOpenChange={setIsWalletOpen}
          onToggleCategoryMenu={() => setCategoryMenuOpen(prev => !prev)}
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
                
                // Log the full error for debugging
                console.error('Exchange failed:', errorData)
                
                // Handle rate limiting with specific messages
                if (response.status === 429) {
                  if (errorData.retryAfter) {
                    const minutes = Math.ceil(errorData.retryAfter / 60)
                    throw new Error(`⏳ ${errorData.error} Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`)
                  } else {
                    throw new Error(`⏳ ${errorData.error}`)
                  }
                }
                
                // Include detailed error message if available
                const errorMsg = errorData.details ? 
                  `${errorData.error}: ${errorData.details}` : 
                  (errorData.error || 'Failed to exchange points')
                throw new Error(errorMsg)
              }
              
              const data = await response.json()
              setUserProgress(data.progress)
              // Success feedback is handled in WalletPanel
            } catch (error: any) {
              // Log error for debugging
              console.error('Exchange error:', error)
              
              // Re-throw so WalletPanel can handle the UI
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
      )}

      <main className={currentView === 'swipe' ? 'py-0 h-[calc(100vh-64px)] overflow-hidden' : currentView === 'community-market' ? 'p-0' : 'py-8 pb-32'}>
        {/* Content with its own container for padding */}
        <div className={currentView === 'browse' || currentView === 'community-market' ? '' : 'container mx-auto px-4'}>
          {/* Increased pb-32 (128px) to account for bottom navbar height on all devices, but remove padding in swipe mode */}
          {currentView === 'feed' && (
            <div className="space-y-6">
              {/* Action Cards - Modern Dashboard Style */}
              <HomeCards
                articles={articles}
                userProgress={userProgress}
                matchedArticles={matchedArticles}
                onNavigateToBrowse={() => setCurrentView('browse')}
                onNavigateToAchievements={() => setCurrentView('achievements')}
                onNavigateToSwipe={() => setCurrentView('swipe')}
                onNavigateToEditor={() => setCurrentView('editor')}
                onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
                setPreviousView={setPreviousView}
                nadaPoints={userProgress?.nadaPoints || 0}
                marketUnlocked={userProgress?.marketUnlocked || false}
                onNavigateToMarket={() => setCurrentView('community-market')}
                onMarketUnlock={async () => {
                  try {
                    // Call server to unlock market for 10 NADA
                    const response = await fetch(`${serverUrl}/unlock-market`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                      }
                    })
                    
                    if (!response.ok) {
                      const error = await response.text()
                      throw new Error(error || 'Failed to unlock market')
                    }
                    
                    const data = await response.json()
                    
                    // Update user progress with new NADA balance and unlocked status
                    setUserProgress(prev => prev ? {
                      ...prev,
                      nadaPoints: data.nadaPoints,
                      marketUnlocked: true
                    } : null)
                    
                    alert('🎉 Community Market unlocked! You can now vote and submit feature ideas.')
                  } catch (error) {
                    console.error('Market unlock error:', error)
                    alert(error instanceof Error ? error.message : 'Failed to unlock market')
                  }
                }}
              />
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
              accessToken={accessToken || undefined}
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
              onEditArticle={(articleId) => {
                const article = articles.find(a => a.id === articleId)
                if (article) {
                  handleEditArticle(article)
                }
              }}
              onNavigateToSwagAdmin={() => setCurrentView('swag-admin')}
            />
          )}

          {currentView === 'swag-admin' && accessToken && (
            <SwagShopAdmin
              accessToken={accessToken}
              onBack={() => setCurrentView('admin')}
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
              categoryMenuOpen={categoryMenuOpen}
            />
          )}

          {currentView === 'settings' && (
            <AccountSettings
              userId={userId}
              userEmail={userEmail}
              userPoints={userProgress?.points}
              userNickname={userProgress?.nickname}
              homeButtonTheme={userProgress?.homeButtonTheme}
              selectedTheme={userProgress?.selectedTheme}
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

          {/* Community Market - Lazy Loaded */}
          {currentView === 'community-market' && (
            <Suspense fallback={<div className="text-center py-16"><Loader className="w-10 h-10 animate-spin" /> Loading Community Market...</div>}>
              <CommunityMarket
                userId={userId}
                accessToken={accessToken}
                serverUrl={serverUrl}
                onBack={() => setCurrentView('dashboard')}
                onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
                userEmail={userEmail}
                nadaPoints={userProgress?.nadaPoints || 0}
                onNadaUpdate={(newBalance) => {
                  // Update user progress with new NADA balance
                  if (userProgress) {
                    setUserProgress({ ...userProgress, nadaPoints: newBalance })
                  }
                }}
              />
            </Suspense>
          )}
        </div>
      </main>

      {/* Hide BottomNavbar when in Community Market - Market has its own navigation */}
      {currentView !== 'community-market' && (
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
          closeWallet={() => setIsWalletOpen(false)}
        />
      )}

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