import React, { useState, useEffect, useRef } from 'react'
import { createClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { ReadingSecurityTracker } from './utils/readingSecurityTracker'
import { CommunityMarketLoader } from './components/CommunityMarketLoader'
import { AuthForm } from './components/AuthForm'
import { AppNavigation } from './components/AppNavigation'
import { ArticleCard } from './components/ArticleCard'
import { ArticleEditor } from './components/ArticleEditor'
import { UserDashboard } from './components/UserDashboard'
import { ArticleReader } from './components/ArticleReader'
import { AdminDashboard } from './components/AdminDashboard'
import { ReadingHistory } from './components/ReadingHistory'
import { LinkedInImporter } from './components/LinkedInImporter'
import { PlacesDirectory } from './components/PlacesDirectory'
import { SwapLoader } from './components/swap/SwapLoader'
import { MatchedArticles } from './components/MatchedArticles'
import { AccountSettings } from './components/AccountSettings'
import { PointsSystemPage } from './components/PointsSystemPage'
import { ResetPasswordPage } from './components/ResetPasswordPage'
import { ResetPasswordModal } from './components/ResetPasswordModal'
import { FeatureUnlockModal } from './components/FeatureUnlockModal'
import { LoadingScreen } from './components/LoadingScreen'
import { SwagShopAdmin } from './components/SwagShopAdmin'
import { ComicLockOverlay } from './components/ComicLockOverlay'
import { ReadingAnalytics } from './components/ReadingAnalytics'
import { HomeCards } from './components/HomeCards'
import { BrowsePage } from './components/BrowsePage'
import { AchievementsPage } from './components/AchievementsPage'
import { SwipeMode } from './components/SwipeMode'
import { ServerErrorBanner } from './components/ServerErrorBanner'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Skeleton } from './components/ui/skeleton'
import { Sparkles, Search, X, Filter, Heart, Zap, BookOpen, Loader } from 'lucide-react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { toast } from 'sonner@2.0.3'
import { Toaster } from './components/ui/sonner'
import { SwagShop } from './components/SwagShop'
import { SwagMarketplace } from './components/SwagMarketplace'
import { MEButtonDrawer } from './components/MEButtonDrawer'
import { UserProfile } from './components/UserProfile'
import { DiscoveryDashboard } from './components/discovery/DiscoveryDashboard'
import { MyInventory } from './components/swap/MyInventory'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  authorId: string
  authorName?: string
  createdAt: string
  source?: string
  feedId?: string
  linkedinPostUrl?: string
}

interface UserProgress {
  userId: string
  totalArticlesRead: number
  points: number
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  readArticles: string[]
  lastReadDate: string | null
  nickname?: string
  homeButtonTheme?: string
  selectedTheme?: string
  marketingOptIn?: boolean
  marketNewsletterOptIn?: boolean
  nadaPoints?: number
  marketUnlocked?: boolean
  selectedBadge?: string | null
  profileBannerUrl?: string | null
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'feed' | 'dashboard' | 'editor' | 'article' | 'admin' | 'reading-history' | 'linkedin-importer' | 'matched-articles' | 'achievements' | 'browse' | 'swipe' | 'settings' | 'points-system' | 'reset-password' | 'reading-analytics' | 'community-market' | 'swag-admin' | 'swag-shop' | 'swag-marketplace' | 'globe' | 'places-directory' | 'profile' | 'my-inventory' | 'swap-inbox'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const securityTrackerRef = useRef<ReadingSecurityTracker | null>(null)
  const isInitializingRef = useRef<boolean>(true)
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
  const [previousView, setPreviousView] = useState<'feed' | 'swipe' | 'browse'>('feed')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [featureUnlockModal, setFeatureUnlockModal] = useState<{ featureId: 'swipe-mode' | 'article-sharing' | 'article-creation' | 'reading-analytics' | 'theme-customization'; isOpen: boolean } | null>(null)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(true)
  const [meDrawerOpen, setMEDrawerOpen] = useState(false)
  const [discoveryMatchOpen, setDiscoveryMatchOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [hasNewDiscoveryMatches, setHasNewDiscoveryMatches] = useState(false)
  const [browseCategoryIndex, setBrowseCategoryIndex] = useState(() => {
    // Always start with "All Articles" (index 0) as the default view
    // User can navigate to other categories, and we'll remember their selection
    return 0
  })
  const swipeModeRef = useRef<{ handleSkip: () => void; handleMatch: () => void; handleReset: () => void; isAnimating: boolean } | null>(null)
  const [userBadges, setUserBadges] = useState<any[]>([])

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

  // Load user profile data when userId is available
  useEffect(() => {
    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  // Helper to mark initialization as complete
  const completeInitialization = () => {
    setInitializing(false)
    isInitializingRef.current = false
  }

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
            
            // Clear auth state IMMEDIATELY
            setIsAuthenticated(false)
            setAccessToken(null)
            setUserId(null)
            setUserEmail(null)
            setUserProgress(null)
            
            // Clear token from localStorage
            localStorage.removeItem('supabase_access_token')
            
            await supabase.auth.signOut()
          }
          completeInitialization()
          return
        }
        
        if (session?.access_token) {
          console.log('✅ Session found, checking if refresh needed...')
          console.log('🔑 Access token:', session.access_token.substring(0, 20) + '...')
          console.log('👤 User ID:', session.user.id)
          console.log('📧 Email:', session.user.email)
          console.log('⏰ Expires at:', new Date(session.expires_at! * 1000).toLocaleString())
          
          // Check if token is expired or about to expire
          const expiresAt = session.expires_at || 0
          const now = Math.floor(Date.now() / 1000)
          const fiveMinutes = 5 * 60
          
          let validToken = session.access_token
          
          if (expiresAt - now < fiveMinutes) {
            console.log('🔄 Token expired or expiring soon, attempting refresh...')
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
            
            if (refreshError || !newSession) {
              // Silently handle invalid refresh tokens - this is normal when tokens expire
              if (refreshError?.message?.includes('Invalid Refresh Token') || 
                  refreshError?.message?.includes('Refresh Token Not Found')) {
                console.log('ℹ️ Session expired, clearing auth state')
              } else {
                console.warn('⚠️ Session refresh failed:', refreshError?.message)
              }
              
              // Clear auth state IMMEDIATELY
              setIsAuthenticated(false)
              setAccessToken(null)
              setUserId(null)
              setUserEmail(null)
              setUserProgress(null)
              
              // Clear token from localStorage
              localStorage.removeItem('supabase_access_token')
              
              // Clear everything from Supabase
              await supabase.auth.signOut()
              
              // Clear localStorage
              const keysToRemove = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.includes('supabase')) {
                  keysToRemove.push(key)
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key))
              
              console.log('✅ Expired session cleared - user will see login screen')
              completeInitialization()
              return
            }
            
            console.log('✅ Token refreshed successfully')
            console.log('🔑 New access token:', newSession.access_token.substring(0, 20) + '...')
            console.log('⏰ New expires at:', new Date(newSession.expires_at! * 1000).toLocaleString())
            validToken = newSession.access_token
          }
          
          // ============================================
          // CRITICAL: Validate token with server before trusting it
          // ============================================
          try {
            console.log('🔍 Validating token with server...')
            const validationResponse = await fetch(`${serverUrl}/my-articles`, {
              headers: {
                'Authorization': `Bearer ${validToken}`
              }
            })
            
            if (!validationResponse.ok) {
              console.error('❌ Token validation failed - session is invalid')
              console.log('🧹 Clearing invalid session...')
              
              // Clear auth state IMMEDIATELY
              setIsAuthenticated(false)
              setAccessToken(null)
              setUserId(null)
              setUserEmail(null)
              setUserProgress(null)
              
              // Clear token from localStorage
              localStorage.removeItem('supabase_access_token')
              
              // Clear everything from Supabase
              await supabase.auth.signOut()
              
              // Clear localStorage
              const keysToRemove = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.includes('supabase')) {
                  keysToRemove.push(key)
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key))
              
              console.log('✅ Invalid session cleared - user will see login screen')
              completeInitialization()
              return
            }
            
            console.log('✅ Token validated successfully with server')
          } catch (validationError) {
            console.error('❌ Token validation request failed:', validationError)
            
            // Clear auth state IMMEDIATELY
            setIsAuthenticated(false)
            setAccessToken(null)
            setUserId(null)
            setUserEmail(null)
            setUserProgress(null)
            
            // Clear token from localStorage
            localStorage.removeItem('supabase_access_token')
            
            // Network error - clear session to be safe
            await supabase.auth.signOut()
            completeInitialization()
            return
          }
          
          // Token is valid - set auth state
          setAccessToken(validToken)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          setIsAuthenticated(true)
          
          // Store token in localStorage for components that need it
          localStorage.setItem('supabase_access_token', validToken)
        } else {
          console.log('ℹ️ No active session found')
        }
      } catch (error: any) {
        console.error('❌ Error checking session:', error.message)
        
        // Clear auth state IMMEDIATELY
        setIsAuthenticated(false)
        setAccessToken(null)
        setUserId(null)
        setUserEmail(null)
        setUserProgress(null)
        
        // Clear token from localStorage
        localStorage.removeItem('supabase_access_token')
        
        // Clear any corrupted session data
        await supabase.auth.signOut()
      } finally {
        completeInitialization()
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
        completeInitialization()
        // Don't proceed with normal session check - just show the modal
        return
      }
    }
    
    // Check if we're on the reset password page (legacy)
    if (window.location.pathname === '/reset-password') {
      setCurrentView('reset-password')
      completeInitialization()
      return
    }
    
    checkSession()
    
    // Set up auth state change listener for automatic token refresh
    console.log('👂 Setting up auth state listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event)
      
      // CRITICAL: Don't update auth state during initialization
      // The checkSession function handles auth state during init
      if (isInitializingRef.current) {
        console.log('⏳ Still initializing - skipping auth state update from listener')
        return
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.access_token) {
          console.log('✅ Auth state: Token updated')
          console.log('🔑 New access token:', session.access_token.substring(0, 20) + '...')
          console.log('⏰ New expires at:', new Date(session.expires_at! * 1000).toLocaleString())
          
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          setIsAuthenticated(true)
          
          // Store token in localStorage for components that need it
          localStorage.setItem('supabase_access_token', session.access_token)
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
        console.log('👋 Auth state:', event === 'SIGNED_OUT' ? 'User signed out' : 'Token refresh failed')
        setAccessToken(null)
        setUserId(null)
        setUserEmail(null)
        setIsAuthenticated(false)
        setUserProgress(null)
        
        // Clear token from localStorage
        localStorage.removeItem('supabase_access_token')
      } else if (event === 'USER_UPDATED') {
        console.log('🔄 Auth state: User updated')
        if (session?.access_token) {
          setAccessToken(session.access_token)
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          
          // Store token in localStorage for components that need it
          localStorage.setItem('supabase_access_token', session.access_token)
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

  // Fetch PUBLIC articles on mount (no auth required)
  useEffect(() => {
    console.log('🎬 Initial mount: Fetching public articles')
    fetchArticles()
  }, []) // Run once on mount

  // Fetch user-specific data when authenticated (but not during initialization)
  useEffect(() => {
    if (isAuthenticated && userId && accessToken && !initializing) {
      console.log('🔐 User authenticated: Fetching user-specific data')
      fetchUserProgress()
      fetchUserArticles()
      fetchUserBadges()
      checkForNewDiscoveryMatches()
      // Re-fetch articles to get user-specific data (like if they've read them)
      fetchArticles()
    }
  }, [isAuthenticated, userId, accessToken, initializing])

  // Poll for new discovery matches every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !userId || !accessToken) return

    const interval = setInterval(() => {
      checkForNewDiscoveryMatches()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
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
    setLoading(true)
    try {
      const fetchUrl = `${serverUrl}/articles?category=${selectedCategory}`
      console.log('🔍 Fetching articles from:', fetchUrl)
      console.log('🔍 Server URL base:', serverUrl)
      console.log('🔍 Access token available:', !!accessToken)
      
      // Include auth header if available (for logged-in users), but endpoint is public
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      } else {
        // Use anon key for public access
        headers['Authorization'] = `Bearer ${publicAnonKey}`
      }
      
      const response = await fetch(fetchUrl, { headers })
      
      console.log('📡 Response status:', response.status, response.statusText)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Fetch articles error:', errorData)
        console.error('❌ Full error response:', JSON.stringify(errorData, null, 2))
        
        // If 401 error, might be cached old edge function code or RLS policy
        if (response.status === 401) {
          console.warn('⚠️  401 Unauthorized - Debugging info:')
          console.warn('   1. Check health endpoint:', `${serverUrl}/health`)
          console.warn('   2. Error says:', errorData.error, errorData.details)
          console.warn('   3. This might be: Cached Edge Function / RLS / Wrong URL')
          
          // Try to fetch health endpoint to verify Edge Function is working
          fetch(`${serverUrl}/health`)
            .then(r => r.json())
            .then(health => console.log('✅ Health check:', health))
            .catch(e => console.error('❌ Health check failed:', e))
        }
        
        throw new Error(errorData.error || errorData.message || 'Failed to fetch articles')
      }

      const data = await response.json()
      console.log('✅ Articles fetched successfully:', data.articles?.length || 0, 'articles')
      console.log('✅ First 3 articles:', data.articles?.slice(0, 3))
      setArticles(data.articles || [])
    } catch (error: any) {
      console.error('Error fetching articles:', error)
      
      // Check if it's a network/deployment error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('🚨 SERVER NOT DEPLOYED OR UNREACHABLE:')
        console.error('   → Deploy via: supabase functions deploy make-server-053bcd80')
        console.error('   → Or use Supabase Dashboard → Edge Functions → Deploy')
      }
      
      // Set empty array to prevent UI breaking
      setArticles([])
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
      console.log('✅ User progress fetched:', data.progress)
      console.log('🔐 Market Unlocked Status:', data.progress?.marketUnlocked)
      console.log('🎨 Profile Banner URL:', data.progress?.profileBannerUrl)
      setUserProgress(data.progress)
    } catch (error: any) {
      console.error('Error fetching user progress:', error)
      
      // Check if it's a network/deployment error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('🚨 SERVER NOT DEPLOYED - Please deploy the edge function:')
        console.error('   supabase functions deploy make-server-053bcd80')
        console.error('   OR deploy via Supabase Dashboard → Edge Functions')
      }
    }
  }

  const loadUserProfile = async () => {
    if (!userId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows gracefully
      
      console.log('👤 loadUserProfile result:', { data, error, userId })
      
      if (error) {
        console.error('❌ Error loading user profile from DB:', error)
        // Fallback to email-based name if profile doesn't exist
        setDisplayName(userEmail?.split('@')[0] || 'User')
      } else if (data) {
        setDisplayName(data.display_name || userEmail?.split('@')[0] || 'User')
        setAvatarUrl(data.avatar_url)
        console.log('✅ User profile loaded:', { displayName: data.display_name, avatarUrl: data.avatar_url })
      } else {
        // No data and no error - profile might not exist yet (normal for new users)
        console.log('ℹ️ No user profile found, using email fallback (normal for new users)')
        setDisplayName(userEmail?.split('@')[0] || 'User')
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      // Fallback to email-based name
      setDisplayName(userEmail?.split('@')[0] || 'User')
    }
  }

  // NOTE: Message functionality now handled by AppNavigation component
  // Users can access messenger via the message icon in the top navbar
  const openMessagePanelWith = (params: {
    inboxType?: string
    recipientId?: string
    contextType?: string
    contextId?: string
    contextName?: string
  }) => {
    // TODO: Integrate with AppNavigation messenger to support initial params
    console.log('Message panel requested with params:', params)
    console.log('Use message icon in top navbar to access messenger')
  }

  const checkForNewDiscoveryMatches = async () => {
    if (!accessToken || !userId || !projectId) return
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/discovery/my-requests`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const hasNew = data.requests?.some((req: any) => req.hasNewRecommendations) || false
        setHasNewDiscoveryMatches(hasNew)
      } else {
        // Silently fail - endpoint might not be ready yet or user has no requests
        // This is normal behavior, not an error
      }
    } catch (err) {
      // Silently fail - don't show errors to user for optional features
      // Network issues, CORS, or endpoint not ready are all acceptable
    }
  }

  const fetchUserBadges = async () => {
    if (!userId) return

    try {
      console.log('🏅 Fetching user association badges...')
      
      // Get a valid token (will refresh if needed)
      const validToken = await getValidAccessToken()
      
      if (!validToken) {
        console.log('⚠️ No valid token available for fetching badges')
        return
      }
      
      const response = await fetch(`${serverUrl}/user-association-badges/${userId}`, {
        headers: {
          'Authorization': `Bearer ${validToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('⚠️  Failed to fetch badges:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch user badges')
      }

      const data = await response.json()
      console.log('✅ User badges fetched:', data.badges?.length || 0, 'badges')
      setUserBadges(data.badges || [])
    } catch (error: any) {
      console.error('Error fetching user badges:', error)
      
      // Check if it's a network/deployment error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('🚨 SERVER NOT DEPLOYED OR UNREACHABLE:')
        console.error('   → Deploy via: supabase functions deploy make-server-053bcd80')
        console.error('   → Or use Supabase Dashboard → Edge Functions → Deploy')
      }
      
      setUserBadges([]) // Set empty array on error to prevent UI breaking
    }
  }

  const handleThemeChange = (newTheme: string) => {
    console.log('🎨 Theme change requested:', newTheme)
    
    // Apply theme immediately to DOM
    document.documentElement.classList.remove('dark', 'hempin', 'solarpunk-dreams', 'midnight-hemp', 'golden-hour')
    document.documentElement.classList.add(newTheme)
    
    // Update user progress state
    if (userProgress) {
      setUserProgress({
        ...userProgress,
        selectedTheme: newTheme
      })
    }
    
    console.log('✅ Theme applied:', newTheme)
  }

  const fetchUserArticles = async () => {
    if (!userId) {
      console.log('⚠️ fetchUserArticles: Missing userId')
      return
    }

    try {
      console.log('📥 Fetching user articles for user:', userId)
      
      // Get a valid token (will refresh if needed)
      const validToken = await getValidAccessToken()
      
      if (!validToken) {
        console.log('⚠️ No valid token available - user needs to log in')
        toast.error('🔐 Your session has expired. Please log in again.', {
          duration: 5000,
        })
        return
      }
      
      console.log('🔑 Using access token:', validToken.substring(0, 20) + '...')
      console.log('🔑 Token length:', validToken.length)
      
      const response = await fetch(`${serverUrl}/my-articles`, {
        headers: {
          'Authorization': `Bearer ${validToken}`
        }
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to fetch user articles. Status:', response.status, 'Error:', errorData)
        
        // If authentication failed after refresh attempt, sign out
        if (response.status === 401) {
          console.log('⚠️ Session expired or invalid (401) - logging out')
          
          // Show notification to user
          toast.error('🔐 Your session has expired. Please log in again.', {
            duration: 5000,
          })
          
          // Clear the session
          await supabase.auth.signOut()
          setIsAuthenticated(false)
          setAccessToken(null)
          setUserId(null)
          setUserEmail(null)
          setUserProgress(null)
          setUserArticles([])
          
          // Clear localStorage auth data
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.includes('supabase')) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
          
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

  // Helper function to get a valid access token (refreshes if needed)
  const getValidAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting session:', error)
        return null
      }
      
      if (!session) {
        console.log('ℹ️ No active session found')
        return null
      }
      
      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = session.expires_at || 0
      const now = Math.floor(Date.now() / 1000)
      const fiveMinutes = 5 * 60
      
      if (expiresAt - now < fiveMinutes) {
        console.log('🔄 Token expired or expiring soon, refreshing...')
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !newSession) {
          // Silently handle invalid refresh tokens - this is normal when tokens expire
          if (refreshError?.message?.includes('Invalid Refresh Token') || 
              refreshError?.message?.includes('Refresh Token Not Found')) {
            console.log('ℹ️ Session expired, clearing auth state')
          } else {
            console.warn('⚠️ Token refresh failed:', refreshError?.message)
          }
          // Sign out if refresh fails
          await supabase.auth.signOut()
          setAccessToken(null)
          setUserId(null)
          setUserEmail(null)
          setIsAuthenticated(false)
          return null
        }
        
        console.log('✅ Token refreshed successfully')
        setAccessToken(newSession.access_token)
        
        // Store token in localStorage for components that need it
        localStorage.setItem('supabase_access_token', newSession.access_token)
        
        return newSession.access_token
      }
      
      // Token is still valid
      return session.access_token
    } catch (error) {
      console.error('❌ Error in getValidAccessToken:', error)
      return null
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
      
      // Store token in localStorage for components that need it
      localStorage.setItem('supabase_access_token', data.session.access_token)
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
    console.log('🚪 Logging out...')
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear ALL auth state
    setIsAuthenticated(false)
    setAccessToken(null)
    setUserId(null)
    setUserEmail(null)
    setUserProgress(null)
    setArticles([])
    setUserArticles([])
    setMatchedArticles([])
    
    // Clear localStorage auth data (but keep theme preferences)
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('matchedArticles') || key.includes('readArticles'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Reset view
    setCurrentView('feed')
    
    console.log('✅ Logout complete - all auth data cleared')
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
    return <LoadingScreen message="Initializing DEWII" variant="app" />
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
                
                // Store token in localStorage for components that need it
                localStorage.setItem('supabase_access_token', session.access_token)
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
        
        {/* Toaster for notifications */}
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Unified App Navigation - Always Present */}
      <AppNavigation
        currentView={currentView}
        onNavigate={setCurrentView}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userId={userId || undefined}
        accessToken={accessToken || undefined}
        userPoints={userProgress?.points}
        nadaPoints={userProgress?.nadaPoints || 0}
        totalArticlesRead={userProgress?.totalArticlesRead || 0}
        currentStreak={currentView === 'swipe' ? userProgress?.currentStreak : undefined}
        currentTheme={
          // Normalize theme to light/dark only
          // If user has premium theme or hempin, return undefined to use default (light)
          userProgress?.selectedTheme === 'light' || 
          userProgress?.selectedTheme === 'dark'
            ? userProgress.selectedTheme 
            : undefined
        }
        serverUrl={serverUrl}
        projectId={projectId}
        publicAnonKey={publicAnonKey}
        onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
        onThemeChange={handleThemeChange}
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
              console.error('Exchange failed:', errorData)
              
              if (response.status === 429) {
                if (errorData.retryAfter) {
                  const minutes = Math.ceil(errorData.retryAfter / 60)
                  throw new Error(`⏳ ${errorData.error} Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`)
                } else {
                  throw new Error(`⏳ ${errorData.error}`)
                }
              }
              
              const errorMsg = errorData.details ? 
                `${errorData.error}: ${errorData.details}` : 
                (errorData.error || 'Failed to exchange points')
              throw new Error(errorMsg)
            }
            
            const data = await response.json()
            setUserProgress(data.progress)
          } catch (error: any) {
            console.error('Exchange error:', error)
            throw error
          }
        }}
        exploreMode={currentView === 'swipe' ? 'swipe' : 'grid'}
        onSwitchToGrid={() => setCurrentView('feed')}
        homeButtonTheme={userProgress?.homeButtonTheme}
        swipeControls={currentView === 'swipe' ? {
          onSkip: () => swipeModeRef.current?.handleSkip(),
          onMatch: () => swipeModeRef.current?.handleMatch(),
          onReset: () => swipeModeRef.current?.handleReset(),
          isAnimating: swipeModeRef.current?.isAnimating || false
        } : undefined}
        onMEButtonClick={() => setMEDrawerOpen(!meDrawerOpen)}
        meDrawerOpen={meDrawerOpen}
        hasNewDiscoveryMatches={hasNewDiscoveryMatches}
        onContextualPlusClick={(action) => {
          console.log('🎯 Contextual + button clicked:', action)
          
          switch (action) {
            case 'create-article':
              setCurrentView('editor')
              break
            case 'list-swap-item':
              if ((window as any).__swapOpenAddModal) {
                (window as any).__swapOpenAddModal()
              }
              break
            case 'add-place':
              setShowAddPlaceModal(true)
              break
            case 'browse-swag':
              setCurrentView('swag-marketplace')
              break
            case 'submit-swag-product':
              if ((window as any).__swagMarketplaceOpenAddModal) {
                (window as any).__swagMarketplaceOpenAddModal()
              }
              break
            case 'create-rfp':
              console.log('💼 Create RFP triggered')
              break
            case 'quick-action':
              console.log('⚡ Quick action triggered')
              break
          }
        }}
        onToggleCategoryMenu={() => setCategoryMenuOpen(prev => !prev)}
        onNavigateToMarketAdmin={() => {
          // TODO: This will be for users who own organizations/places/shops to manage their entities
          toast.info('Market Admin feature coming soon! For now, use Site Admin > Market view to manage market content.')
        }}
        onBack={() => {
          if (currentView === 'article') {
            setCurrentView(previousView === 'swipe' ? 'swipe' : previousView === 'browse' ? 'browse' : 'feed')
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

      <main className={currentView === 'swipe' ? 'py-0 h-[calc(100vh-64px)] overflow-hidden' : currentView === 'community-market' || currentView === 'reading-analytics' || currentView === 'swag-shop' || currentView === 'swag-marketplace' || currentView === 'globe' || currentView === 'places-directory' || currentView === 'swap-shop' ? 'p-0 pt-20' : 'py-8 pb-32 pt-20'}>
        {/* Content with its own container for padding - pt-20 adds top padding to prevent content from going behind transparent navbar */}
        <div className={currentView === 'browse' || currentView === 'community-market' || currentView === 'reading-analytics' || currentView === 'swag-shop' || currentView === 'swag-marketplace' || currentView === 'globe' || currentView === 'places-directory' || currentView === 'swap-shop' ? '' : currentView === 'swipe' ? 'h-full' : 'container mx-auto px-4'}>
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
                onNavigateToPlaces={() => setCurrentView('places-directory')}
                onNavigateToSwap={() => setCurrentView('swap-shop')}
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
              accessToken={accessToken || undefined}
              onMatch={(article) => {
                // Add article to matched articles
                setMatchedArticles(prev => {
                  const newMatches = [...prev, article]
                  if (userId) {
                    localStorage.setItem(`matchedArticles_${userId}`, JSON.stringify(newMatches))
                  }
                  return newMatches
                })
                // Toast notification removed - comic feedback only
              }}
              onReadArticle={handleArticleClick}
              onSwitchToGrid={() => setCurrentView('feed')}
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
              equippedBadgeId={userProgress.selectedBadge || null}
              profileBannerUrl={userProgress.profileBannerUrl || null}
              userEmail={userEmail}
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
              userId={userId}
              onProgressUpdate={(progress) => setUserProgress(progress)}
              suggestedArticles={articles
                .filter(a => 
                  a.id !== selectedArticle.id && // Not the current article
                  !userProgress?.readArticles?.includes(a.id) // User hasn't claimed points yet
                )
                .slice(0, 1) // Only show 1 suggestion
              }
              onArticleSelect={(article) => {
                setSelectedArticle(article)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onBack={() => {
                // Always go back to Browse Magazine view from articles
                setCurrentView('browse')
                setSelectedArticle(null)
              }}
            />
          )}

          {currentView === 'admin' && accessToken && (
            <AdminDashboard
              accessToken={accessToken}
              serverUrl={serverUrl}
              onBack={() => {
                setCurrentView('dashboard')
              }}
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
              browseCategoryIndex={browseCategoryIndex}
              setBrowseCategoryIndex={setBrowseCategoryIndex}
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
              serverUrl={serverUrl}
              profileBannerUrl={userProgress?.profileBannerUrl}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              onUpdateMarketingPreference={handleUpdateMarketingPreference}
              onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
              onThemeChange={handleThemeChange}
              onBadgeEquipped={fetchUserProgress}
              onBannerUploaded={fetchUserProgress}
            />
          )}

          {currentView === 'profile' && (
            <UserProfile
              userId={userId || undefined}
              onClose={() => setCurrentView('feed')}
              onProfileUpdate={fetchUserProgress}
            />
          )}

          {currentView === 'my-inventory' && userId && accessToken && (
            <MyInventory
              userId={userId}
              accessToken={accessToken}
              onBack={() => setCurrentView('feed')}
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
            <CommunityMarketLoader
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              publicAnonKey={publicAnonKey}
              onBack={() => setCurrentView('dashboard')}
              onNavigateToBrowse={() => setCurrentView('browse')}
              onFeatureUnlock={(featureId) => setFeatureUnlockModal({ featureId, isOpen: true })}
              userEmail={userEmail}
              nadaPoints={userProgress?.nadaPoints || 0}
              userPoints={userProgress?.points || 0}
              equippedBadgeId={userProgress?.selectedBadge || null}
              profileBannerUrl={userProgress?.profileBannerUrl || null}
              marketUnlocked={userProgress?.marketUnlocked || false}
              onNadaUpdate={(newBalance) => {
                // Update user progress with new NADA balance
                if (userProgress) {
                  setUserProgress({ ...userProgress, nadaPoints: newBalance })
                }
              }}
              onNavigateToSwagShop={() => setCurrentView('swag-shop')}
              onNavigateToSwagMarketplace={() => setCurrentView('swag-marketplace')}
              onNavigateToSettings={() => setCurrentView('settings')}
              onNavigateToAdmin={() => setCurrentView('admin')}
            />
          )}

          {/* Places Directory */}
          {currentView === 'places-directory' && (
            <PlacesDirectory
              serverUrl={serverUrl}
              onBack={() => setCurrentView('feed')}
              onViewOnGlobe={() => setCurrentView('globe')}
              currentUserId={userId}
              currentUserName={displayName}
              currentUserAvatar={avatarUrl}
              accessToken={accessToken}
              onMessagePlace={(ownerId: string, placeId: string, placeName: string) => {
                openMessagePanelWith({
                  inboxType: 'place',  // FIXED: Place inbox, not 'personal'
                  recipientId: ownerId,
                  contextType: 'place',
                  contextId: placeId,
                  contextName: placeName  // Pass the place name
                })
              }}
            />
          )}

          {/* SWAP Shop - Infinite Feed */}
          {currentView === 'swap-shop' && (
            <SwapLoader
              userId={userId}
              accessToken={accessToken}
              onBack={() => setCurrentView('feed')}
              onPlusButtonTrigger={() => {}} // Enable global modal trigger
            />
          )}
          
          {/* Swag Shop - Full Page View */}
          {currentView === 'swag-shop' && userProgress && (
            <SwagShop
              onBack={() => setCurrentView('community-market')}
              userId={userId}
              accessToken={accessToken}
              serverUrl={serverUrl}
              nadaPoints={userProgress.nadaPoints || 0}
              onNadaUpdate={(newBalance) => {
                // Update user progress with new NADA balance
                if (userProgress) {
                  setUserProgress({ ...userProgress, nadaPoints: newBalance })
                }
              }}
            />
          )}
          
          {/* Swag Marketplace - Full Page View */}
          {currentView === 'swag-marketplace' && userProgress && accessToken && (
            <SwagMarketplace
              onBack={() => setCurrentView('community-market')}
              userId={userId || undefined}
              accessToken={accessToken}
              serverUrl={serverUrl}
              userBadges={userBadges}
              nadaPoints={userProgress.nadaPoints || 0}
              onNadaUpdate={(newBalance) => {
                // Update user progress with new NADA balance
                if (userProgress) {
                  setUserProgress({ ...userProgress, nadaPoints: newBalance })
                }
              }}
            />
          )}
        </div>
      </main>



      {/* ME Button Drawer */}
      {isAuthenticated && userId && (
        <MEButtonDrawer
          isOpen={meDrawerOpen}
          onClose={() => setMEDrawerOpen(false)}
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          onProfileClick={() => setCurrentView('profile')}
          onMyArticlesClick={() => {
            setCurrentView('dashboard')
            setMEDrawerOpen(false)
          }}
          onOrganizationsClick={() => {
            setCurrentView('my-organizations')
            setMEDrawerOpen(false)
          }}
          onInventoryClick={() => {
            setCurrentView('my-inventory')
            setMEDrawerOpen(false)
          }}
          onSettingsClick={() => setCurrentView('settings')}
          onDiscoveryMatchClick={() => setDiscoveryMatchOpen(true)}
          onPluginStoreClick={() => {
            setCurrentView('settings')
            setMEDrawerOpen(false)
            // Show a toast to guide user to the Home Button Theme section
            setTimeout(() => {
              toast.info('Scroll down to "Home Button Theme" to customize your logo!')
            }, 500)
          }}
        />
      )}

      {/* Discovery Dashboard */}
      {isAuthenticated && userId && accessToken && discoveryMatchOpen && (
        <DiscoveryDashboard
          userId={userId}
          accessToken={accessToken}
          onClose={() => {
            setDiscoveryMatchOpen(false)
            // Reload user profile to refresh notification state
            loadUserProfile()
          }}
          onOpenMessages={() => {
            // TODO: Integrate with AppNavigation messenger
            // For now, messenger can be accessed via top navbar icon
            console.log('Message functionality available via top navbar')
          }}
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
      
      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}