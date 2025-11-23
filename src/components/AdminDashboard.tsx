import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import {
  Users,
  FileText,
  Eye,
  Zap,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Trophy,
  Target,
  Flame,
  Heart,
  X,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Ban,
  Trash2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Edit,
  Coins,
  Sparkles,
  Bot,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Package,
  Palette,
  Leaf,
  Sprout,
  LayoutGrid,
  Layers,
  Star,
  PenTool,
  Share2
} from 'lucide-react'
import { motion } from 'motion/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { WalletsTab } from './WalletsTab'
import { SecurityAudit } from './SecurityAudit'
import { AdminNadaTracker } from './AdminNadaTracker'
import { MonitoringBot } from './MonitoringBot'
import { RSSFeedManager } from './RSSFeedManager'

interface DashboardStats {
  totalUsers: number
  totalArticles: number
  articlesLast24h: number
  articlesLast7d: number
  totalViews: number
  totalPoints: number
  totalArticlesRead: number
}

interface User {
  id: string
  email: string
  createdAt: string
  lastSignIn: string | null
  nickname: string | null
  points: number
  totalArticlesRead: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  banned: boolean
  bannedUntil: string | null
}

interface Ranking {
  rank: number
  userId: string
  email: string
  nickname: string
  points: number
  rankScore: number
  totalArticlesRead: number
  currentStreak: number
  longestStreak: number
  articlesCreated: number
  articlesShared: number
  achievements: string[]
}

interface SwipeStat {
  articleId: string
  title: string
  category: string
  coverImage: string | null
  author: string
  createdAt: string | null
  totalSwipes: number
  likes: number
  skips: number
  likeRate: number
}

interface ViewsAnalytics {
  totalViews: number
  avgViewsPerArticle: number
  viewsPerDay: Array<{ date: string; views: number }>
  topArticles: Array<{
    id: string
    title: string
    category: string
    coverImage: string | null
    author: string
    createdAt: string
    views: number
  }>
  growthRate: number
  last7DaysViews: number
  previous7DaysViews: number
}

interface NadaFeedback {
  suggestions: Array<{
    userId: string
    suggestion: string
    timestamp: string
  }>
  mostYes: Array<{
    ideaId: string
    ideaTitle: string
    ideaDescription: string
    yesVotes: number
    noVotes: number
    totalVotes: number
  }>
  mostNo: Array<{
    ideaId: string
    ideaTitle: string
    ideaDescription: string
    yesVotes: number
    noVotes: number
    totalVotes: number
  }>
}

interface WalletStats {
  totalWallets: number
  totalTransactions: number
  totalPointsExchanged: number
  totalNadaGenerated: number
  averageExchangeAmount: number
  exchangeRate: number
  last24hTransactions: number
  last24hVolume: number
  transactionsPerDay: Array<{ date: string; count: number; volume: number }>
  topExchangers: Array<{
    userId: string
    email: string
    nickname: string | null
    totalExchanges: number
    totalPointsExchanged: number
    totalNadaGenerated: number
    lastExchange: string
  }>
  recentTransactions: Array<{
    id: string
    userId: string
    email: string
    nickname: string | null
    pointsExchanged: number
    nadaReceived: number
    timestamp: string
    ipAddress: string
    riskScore: number
  }>
  dailyLimitHits: number
  fraudAlerts: number
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage: string
  readingTime: number
  authorId: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  media: any[]
  source: string | null
  sourceUrl: string | null
  author: string | null
  authorImage: string | null
  authorTitle: string | null
  publishDate: string | null
  hidden: boolean
}

interface AdminDashboardProps {
  accessToken: string
  serverUrl: string
  onBack: () => void
  onEditArticle?: (articleId: string) => void
  onNavigateToSwagAdmin?: () => void
}

type TabType = 'overview' | 'users' | 'articles' | 'rankings' | 'gamification' | 'swipeStats' | 'views' | 'nadaFeedback' | 'wallets' | 'security' | 'bot' | 'rss'
type ViewMode = 'classic' | 'feature'
type FeatureTab = 'content' | 'swipe' | 'users' | 'gamification' | 'security' | 'analytics'

export function AdminDashboard({ accessToken, serverUrl, onBack, onEditArticle, onNavigateToSwagAdmin }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [swipeStats, setSwipeStats] = useState<SwipeStat[]>([])
  const [viewsAnalytics, setViewsAnalytics] = useState<ViewsAnalytics | null>(null)
  const [nadaFeedback, setNadaFeedback] = useState<NadaFeedback | null>(null)
  const [marketAnalytics, setMarketAnalytics] = useState<any | null>(null)
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshingWallets, setRefreshingWallets] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [viewMode, setViewMode] = useState<ViewMode>('classic')
  const [featureTab, setFeatureTab] = useState<FeatureTab>('analytics')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel for faster loading
      const [statsRes, usersRes, articlesRes, rankingsRes, swipeStatsRes, viewsAnalyticsRes, nadaFeedbackRes, marketAnalyticsRes, walletStatsRes] = await Promise.all([
        fetch(`${serverUrl}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/users`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/articles`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/rankings`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/swipe-stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/views-analytics`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/nada-feedback`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/market-analytics`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`${serverUrl}/admin/wallet-stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ])

      // Process stats
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      // Process users
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }

      // Process articles
      if (articlesRes.ok) {
        const data = await articlesRes.json()
        setArticles(data.articles || [])
      }

      // Process rankings
      if (rankingsRes.ok) {
        const data = await rankingsRes.json()
        setRankings(data.rankings)
      }

      // Process swipe stats
      if (swipeStatsRes.ok) {
        const data = await swipeStatsRes.json()
        setSwipeStats(data.swipeStats)
      }

      // Process views analytics
      if (viewsAnalyticsRes.ok) {
        const data = await viewsAnalyticsRes.json()
        setViewsAnalytics(data.viewsAnalytics)
      }

      // Process nada feedback
      if (nadaFeedbackRes.ok) {
        const data = await nadaFeedbackRes.json()
        setNadaFeedback(data)
      }

      // Process market analytics
      if (marketAnalyticsRes.ok) {
        const data = await marketAnalyticsRes.json()
        setMarketAnalytics(data)
      }

      // Process wallet stats
      if (walletStatsRes.ok) {
        const data = await walletStatsRes.json()
        setWalletStats(data.walletStats)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshWalletStats = async () => {
    try {
      setRefreshingWallets(true)
      
      const walletStatsRes = await fetch(`${serverUrl}/admin/wallet-stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      
      if (walletStatsRes.ok) {
        const data = await walletStatsRes.json()
        setWalletStats(data.walletStats)
      }
    } catch (error) {
      console.error('Error refreshing wallet stats:', error)
    } finally {
      setRefreshingWallets(false)
    }
  }

  const handleBanUser = async (userId: string, banned: boolean) => {
    if (!confirm(banned ? 'Ban this user?' : 'Unban this user?')) return

    try {
      const response = await fetch(`${serverUrl}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ banned, duration: 24 * 365 }) // 1 year
      })

      if (response.ok) {
        await fetchAdminData()
      } else {
        const error = await response.json()
        alert(`Failed to ${banned ? 'ban' : 'unban'} user: ${error.details || error.error}`)
      }
    } catch (error: any) {
      console.error('Error banning user:', error)
      alert('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`PERMANENTLY DELETE user ${email}? This cannot be undone!`)) return

    try {
      const response = await fetch(`${serverUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      if (response.ok) {
        await fetchAdminData()
      } else {
        const error = await response.json()
        alert(`Failed to delete user: ${error.details || error.error}`)
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!confirm(`PERMANENTLY DELETE article "${title}"? This cannot be undone!`)) return

    try {
      const response = await fetch(`${serverUrl}/admin/articles/${articleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      if (response.ok) {
        await fetchAdminData()
      } else {
        const error = await response.json()
        alert(`Failed to delete article: ${error.details || error.error}`)
      }
    } catch (error: any) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    }
  }

  const StatCard = ({ icon: Icon, label, value, subValue, color, onClick }: any) => (
    <Card 
      className={`p-6 border-2 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 180 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage your magazine platform</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode(viewMode === 'classic' ? 'feature' : 'classic')}
            variant={viewMode === 'classic' ? 'outline' : 'default'}
            className="flex items-center gap-2"
          >
            {viewMode === 'classic' ? (
              <>
                <Layers className="w-4 h-4" />
                Feature View
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4" />
                Classic View
              </>
            )}
          </Button>
          <Button onClick={onBack} variant="outline">
            Exit Admin
          </Button>
        </div>
      </div>

      {/* CLASSIC VIEW TABS */}
      {viewMode === 'classic' && (
        <>
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'articles', label: 'Articles' },
          { id: 'rankings', label: 'Rankings' },
          { id: 'gamification', label: 'Gamification' },
          { id: 'swipeStats', label: 'Swipe Stats' },
          { id: 'views', label: 'Views' },
          { id: 'nadaFeedback', label: 'Market' },
          { id: 'wallets', label: 'Wallets' },
          { id: 'security', label: '🔒 Security' },
          { id: 'bot', label: '🤖 Bot' },
          { id: 'rss', label: '📡 RSS Feeds' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="text-blue-500"
              onClick={() => setActiveTab('users')}
            />
            <StatCard
              icon={FileText}
              label="Total Articles"
              value={stats.totalArticles}
              subValue={`+${stats.articlesLast24h} today, +${stats.articlesLast7d} this week`}
              color="text-emerald-500"
              onClick={() => setActiveTab('articles')}
            />
            <StatCard
              icon={Eye}
              label="Total Views"
              value={stats.totalViews.toLocaleString()}
              color="text-purple-500"
              onClick={() => setActiveTab('views')}
            />
            <StatCard
              icon={Zap}
              label="Total Points"
              value={stats.totalPoints.toLocaleString()}
              subValue={`${stats.totalArticlesRead} articles read`}
              color="text-orange-500"
              onClick={() => setActiveTab('gamification')}
            />
          </div>

          {/* Advanced Analytics Dashboard - Solarpunk Futures Vibes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <h3 className="font-bold">Advanced Analytics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Rankings Card - Solarpunk Gold */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 hover:shadow-xl hover:shadow-amber-500/20 transition-all group"
                  onClick={() => setActiveTab('rankings')}
                >
                  {/* Decorative organic pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Leaf className="w-full h-full rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-700 dark:text-amber-400">Rankings</h4>
                        <p className="text-xs text-muted-foreground">Leaderboard</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    {rankings.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-lg">🥇</span>
                          <span className="flex-1 truncate font-medium text-amber-700 dark:text-amber-400">
                            {rankings[0]?.nickname}
                          </span>
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
                            {rankings[0]?.points} pts
                          </Badge>
                        </div>
                        {rankings[1] && (
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <span>🥈</span>
                            <span className="flex-1 truncate">{rankings[1].nickname}</span>
                            <span className="text-muted-foreground">{rankings[1].points} pts</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Swipe Stats Card - Solarpunk Pink/Heart */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 hover:shadow-xl hover:shadow-pink-500/20 transition-all group"
                  onClick={() => setActiveTab('swipeStats')}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Sprout className="w-full h-full -rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-lg">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-pink-700 dark:text-pink-400">Swipe Stats</h4>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-pink-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    {swipeStats.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Avg Match Rate</span>
                              <span className="font-bold text-pink-600 dark:text-pink-400">
                                {(swipeStats.reduce((sum, s) => sum + s.likeRate, 0) / swipeStats.length).toFixed(0)}%
                              </span>
                            </div>
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full"
                                style={{ width: `${(swipeStats.reduce((sum, s) => sum + s.likeRate, 0) / swipeStats.length)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs mt-3">
                          <span className="flex items-center gap-1 text-green-500">
                            <Heart className="w-3 h-3" />
                            {swipeStats.reduce((sum, s) => sum + s.likes, 0)}
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <X className="w-3 h-3" />
                            {swipeStats.reduce((sum, s) => sum + s.skips, 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Views Analytics Card - Solarpunk Purple/Violet */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-indigo-500/10 hover:shadow-xl hover:shadow-violet-500/20 transition-all group"
                  onClick={() => setActiveTab('views')}
                >
                  <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5">
                    <Leaf className="w-full h-full" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-violet-700 dark:text-violet-400">Views Analytics</h4>
                        <p className="text-xs text-muted-foreground">Growth tracking</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-violet-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    {viewsAnalytics && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Growth Rate</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            viewsAnalytics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {viewsAnalytics.growthRate >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {viewsAnalytics.growthRate >= 0 ? '+' : ''}{viewsAnalytics.growthRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="bg-violet-500/10 rounded-lg p-2">
                            <p className="text-muted-foreground">Last 7d</p>
                            <p className="font-bold text-violet-600 dark:text-violet-400">
                              {viewsAnalytics.last7DaysViews.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-violet-500/10 rounded-lg p-2">
                            <p className="text-muted-foreground">Avg/Article</p>
                            <p className="font-bold text-violet-600 dark:text-violet-400">
                              {viewsAnalytics.avgViewsPerArticle.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Wallets/NADA Card - Solarpunk Teal/Emerald */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-green-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all group"
                  onClick={() => setActiveTab('wallets')}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Coins className="w-full h-full rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-teal-700 dark:text-teal-400">NADA Wallets</h4>
                        <p className="text-xs text-muted-foreground">Points economy</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    {walletStats && (
                      <div className="space-y-2 mt-4">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Transactions</p>
                            <p className="font-bold text-teal-600 dark:text-teal-400">
                              {walletStats.totalTransactions}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">NADA Generated</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              {walletStats.totalNadaGenerated}
                            </p>
                          </div>
                        </div>
                        {walletStats.fraudAlerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {walletStats.fraudAlerts} alerts
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* NADA Feedback Card - Solarpunk Yellow/Amber */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-400/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all group"
                  onClick={() => setActiveTab('nadaFeedback')}
                >
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                    <Sparkles className="w-full h-full" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-700 dark:text-yellow-400">Community Market</h4>
                        <p className="text-xs text-muted-foreground">Ideas & Votes</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    {nadaFeedback && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Suggestions</span>
                          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                            {nadaFeedback.suggestions.length}
                          </Badge>
                        </div>
                        {nadaFeedback.mostYes.length > 0 && (
                          <div className="bg-yellow-500/10 rounded-lg p-2 text-xs">
                            <p className="text-muted-foreground mb-1">Top Idea</p>
                            <p className="font-medium text-yellow-700 dark:text-yellow-400 truncate">
                              {nadaFeedback.mostYes[0].ideaTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-green-500">
                                <ThumbsUp className="w-3 h-3" />
                                {nadaFeedback.mostYes[0].yesVotes}
                              </span>
                              <span className="flex items-center gap-1 text-red-500">
                                <ThumbsDown className="w-3 h-3" />
                                {nadaFeedback.mostYes[0].noVotes}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Security Audit Card - Solarpunk Red/Security */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-rose-500/10 hover:shadow-xl hover:shadow-red-500/20 transition-all group"
                  onClick={() => setActiveTab('security')}
                >
                  <div className="absolute top-0 left-0 w-32 h-32 opacity-5">
                    <Shield className="w-full h-full -rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-700 dark:text-red-400">Security Audit</h4>
                        <p className="text-xs text-muted-foreground">Protection</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-muted-foreground">12-Layer Protection</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Read Sessions</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Rate Limiting</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>HMAC Signing</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Forensics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* NADA Tracker Card - Emerald/Teal/Cyan */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 hover:shadow-xl hover:shadow-emerald-500/20 transition-all group"
                  onClick={() => setActiveTab('nada')}
                >
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                    <Coins className="w-full h-full rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-emerald-700 dark:text-emerald-400">NADA Tracker</h4>
                        <p className="text-xs text-muted-foreground">Wallet activity</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-muted-foreground">Transaction History</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Exchanges</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Spending</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Market Unlocks</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CSV Export</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Bot Monitoring Card - Solarpunk Blue/Tech */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all group"
                  onClick={() => setActiveTab('bot')}
                >
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                    <Activity className="w-full h-full rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400">System Monitor</h4>
                        <p className="text-xs text-muted-foreground">Health checks</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-muted-foreground">8 Critical Systems</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Database</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>API</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Auth</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Performance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Gamification Card - Solarpunk Multi */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card 
                  className="relative overflow-hidden p-6 cursor-pointer border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all group"
                  onClick={() => setActiveTab('gamification')}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Award className="w-full h-full -rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-orange-700 dark:text-orange-400">Gamification</h4>
                        <p className="text-xs text-muted-foreground">Achievements</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Total Points</p>
                          <p className="font-bold text-orange-600 dark:text-orange-400">
                            {stats.totalPoints.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Achievements</p>
                          <p className="font-bold text-pink-600 dark:text-pink-400">
                            {users.reduce((sum, u) => sum + u.achievements.length, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          Longest streak: {Math.max(...users.map(u => u.longestStreak), 0)} days
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">{users.length} total users</p>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} className={`p-4 ${user.banned ? 'bg-red-500/5 border-red-500/20' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{user.nickname || user.email}</p>
                      {user.banned && (
                        <Badge variant="destructive" className="text-xs">
                          <Ban className="w-3 h-3 mr-1" />
                          Banned
                        </Badge>
                      )}
                      {user.achievements.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {user.achievements.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {user.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {user.totalArticlesRead} read
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {user.currentStreak} streak
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={user.banned ? "default" : "destructive"}
                      onClick={() => handleBanUser(user.id, !user.banned)}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      {user.banned ? 'Unban' : 'Ban'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && viewsAnalytics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Articles Management</h2>
            <p className="text-sm text-muted-foreground">{stats?.totalArticles} total articles</p>
          </div>

          {/* Article Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold">Total Articles</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-500">{stats?.totalArticles}</p>
              <p className="text-sm text-muted-foreground mt-1">Published content</p>
            </Card>

            <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold">Last 24 Hours</h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">{stats?.articlesLast24h}</p>
              <p className="text-sm text-muted-foreground mt-1">New articles today</p>
            </Card>

            <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold">Last 7 Days</h3>
              </div>
              <p className="text-3xl font-bold text-purple-500">{stats?.articlesLast7d}</p>
              <p className="text-sm text-muted-foreground mt-1">Weekly publications</p>
            </Card>
          </div>

          {/* All Articles List with Management Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">All Articles ({articles.length})</h3>
              <p className="text-xs text-muted-foreground">Click to edit • Delete permanently</p>
            </div>
            
            {articles.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No articles found</p>
              </Card>
            ) : (
              articles.map((article) => {
                const swipeStat = swipeStats.find(s => s.articleId === article.id)
                
                return (
                  <Card 
                    key={article.id} 
                    className="p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Cover Image Thumbnail */}
                      {article.coverImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img 
                            src={article.coverImage} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{article.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          by {article.author || 'Unknown'} • {article.readingTime} min read
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-blue-500 font-bold">
                            <Eye className="w-3 h-3" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-pink-500">
                            <Heart className="w-3 h-3" />
                            {article.likes}
                          </span>
                          {swipeStat && (
                            <>
                              <span className="flex items-center gap-1 text-green-500">
                                <ThumbsUp className="w-3 h-3" />
                                {swipeStat.likes}
                              </span>
                              <span className="flex items-center gap-1 text-red-500">
                                <ThumbsDown className="w-3 h-3" />
                                {swipeStat.skips}
                              </span>
                              <span className="flex items-center gap-1 text-orange-500 font-bold">
                                {swipeStat.likeRate.toFixed(0)}% match
                              </span>
                            </>
                          )}
                          <span className="text-muted-foreground ml-auto">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {onEditArticle && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditArticle(article.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit article"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete article permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">User Rankings</h2>
              <Badge variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Composite Rank Score
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Ranked by composite score: reads (100 pts), achievements (200 pts), streaks (50/30 pts), created (300 pts), shared (50 pts), + spendable points
            </p>
          </div>

          <div className="space-y-3">
            {rankings.map((ranking) => (
              <Card key={ranking.userId} className={`p-4 ${
                ranking.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' :
                ranking.rank === 2 ? 'bg-gray-400/10 border-gray-400/20' :
                ranking.rank === 3 ? 'bg-orange-600/10 border-orange-600/20' : ''
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    ranking.rank === 1 ? 'bg-yellow-500 text-white' :
                    ranking.rank === 2 ? 'bg-gray-400 text-white' :
                    ranking.rank === 3 ? 'bg-orange-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {ranking.rank === 1 ? '🥇' :
                     ranking.rank === 2 ? '🥈' :
                     ranking.rank === 3 ? '🥉' :
                     `#${ranking.rank}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium truncate">{ranking.nickname}</p>
                      {ranking.achievements.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          {ranking.achievements.length}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs font-bold bg-primary/5 border-primary/20">
                        <Star className="w-3 h-3 mr-1" />
                        {ranking.rankScore.toLocaleString()} score
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">{ranking.email}</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="font-semibold text-orange-500">{ranking.points}</span> pts
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-blue-500">{ranking.totalArticlesRead}</span> read
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Target className="w-3 h-3 text-red-500" />
                        <span className="font-semibold text-red-500">{ranking.currentStreak}</span> now
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Award className="w-3 h-3 text-purple-500" />
                        <span className="font-semibold text-purple-500">{ranking.longestStreak}</span> best
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <PenTool className="w-3 h-3 text-green-500" />
                        <span className="font-semibold text-green-500">{ranking.articlesCreated}</span> created
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Share2 className="w-3 h-3 text-pink-500" />
                        <span className="font-semibold text-pink-500">{ranking.articlesShared}</span> shared
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gamification Tab */}
      {activeTab === 'gamification' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Gamification Analytics</h2>
            <p className="text-sm text-muted-foreground">Engagement metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold">Total Points</h3>
              </div>
              <p className="text-3xl font-bold text-orange-500">{stats?.totalPoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg: {stats && users.length > 0 ? Math.round(stats.totalPoints / users.length) : 0} per user
              </p>
            </Card>

            <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold">Articles Read</h3>
              </div>
              <p className="text-3xl font-bold text-purple-500">{stats?.totalArticlesRead.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total completions</p>
            </Card>

            <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Total Achievements</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">
                {users.reduce((sum, u) => sum + u.achievements.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Unlocked badges</p>
            </Card>
          </div>

          {/* Streak Leaderboard */}
          <div className="space-y-4">
            <h3 className="font-bold">🔥 Streak Leaderboard</h3>
            <div className="space-y-3">
              {[...users]
                .sort((a, b) => b.currentStreak - a.currentStreak)
                .slice(0, 10)
                .map((user, index) => (
                  <Card key={user.id} className={`p-4 ${
                    index === 0 ? 'bg-orange-500/10 border-orange-500/20' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index === 0 ? '🔥' : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.nickname || user.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-bold text-orange-500">
                            <Flame className="w-3 h-3" />
                            {user.currentStreak} days
                          </span>
                          <span>Best: {user.longestStreak} days</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Achievement Distribution */}
          <div className="space-y-4">
            <h3 className="font-bold">🏆 Achievement Champions</h3>
            <div className="space-y-3">
              {[...users]
                .filter(u => u.achievements.length > 0)
                .sort((a, b) => b.achievements.length - a.achievements.length)
                .slice(0, 10)
                .map((user, index) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.nickname || user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            {user.achievements.length} achievements
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {user.points} ⚡
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Swipe Stats Tab */}
      {activeTab === 'swipeStats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Swipe Statistics</h2>
            <p className="text-sm text-muted-foreground">{swipeStats.length} articles analyzed</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Total Likes</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">
                {swipeStats.reduce((sum, s) => sum + s.likes, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Positive swipes</p>
            </Card>

            <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <X className="w-5 h-5 text-red-500" />
                <h3 className="font-bold">Total Skips</h3>
              </div>
              <p className="text-3xl font-bold text-red-500">
                {swipeStats.reduce((sum, s) => sum + s.skips, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Negative swipes</p>
            </Card>

            <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold">Avg Match Rate</h3>
              </div>
              <p className="text-3xl font-bold text-orange-500">
                {swipeStats.length > 0 
                  ? (swipeStats.reduce((sum, s) => sum + s.likeRate, 0) / swipeStats.length).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Average engagement</p>
            </Card>
          </div>

          {/* All Swipe Stats */}
          <div className="space-y-3">
            <h3 className="font-bold">All Articles</h3>
            {swipeStats.map((stat, index) => (
              <Card key={stat.articleId} className={`p-4 ${
                stat.likeRate >= 80 ? 'bg-green-500/10 border-green-500/20' :
                stat.likeRate >= 50 ? 'bg-yellow-500/10 border-yellow-500/20' :
                stat.likeRate < 30 ? 'bg-red-500/10 border-red-500/20' : ''
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    stat.likeRate >= 80 ? 'bg-green-500 text-white' :
                    stat.likeRate >= 50 ? 'bg-yellow-500 text-white' :
                    stat.likeRate < 30 ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{stat.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">by {stat.author}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-green-500 font-bold">
                        <Heart className="w-3 h-3" />
                        {stat.likes}
                      </span>
                      <span className="flex items-center gap-1 text-red-500 font-bold">
                        <X className="w-3 h-3" />
                        {stat.skips}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        Total: {stat.totalSwipes}
                      </span>
                      <span className="flex items-center gap-1 text-orange-500 font-bold ml-auto">
                        {stat.likeRate.toFixed(1)}% match
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Views Tab */}
      {activeTab === 'views' && viewsAnalytics && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Views Analytics</h2>
            <p className="text-sm text-muted-foreground">Article engagement metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold">Total Views</h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">{viewsAnalytics.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg: {viewsAnalytics.avgViewsPerArticle.toFixed(1)} per article
              </p>
            </Card>

            <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Last 7 Days</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">{viewsAnalytics.last7DaysViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Prev: {viewsAnalytics.previous7DaysViews.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold">Growth Rate</h3>
              </div>
              <p className={`text-3xl font-bold ${viewsAnalytics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {viewsAnalytics.growthRate >= 0 ? '+' : ''}{viewsAnalytics.growthRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Week over week</p>
            </Card>
          </div>

          {/* Views Per Day Chart */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Views Over Last 30 Days</h3>
            <div className="space-y-2">
              {viewsAnalytics.viewsPerDay.slice(-10).map((day, index) => {
                const maxViews = Math.max(...viewsAnalytics.viewsPerDay.map(d => d.views))
                const percentage = maxViews > 0 ? (day.views / maxViews) * 100 : 0
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end px-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        {day.views > 0 && (
                          <span className="text-xs text-white font-medium">{day.views}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Top Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Top Viewed Articles</h3>
              <p className="text-sm text-muted-foreground">{viewsAnalytics.topArticles.length} articles</p>
            </div>
            
            <div className="space-y-3">
              {viewsAnalytics.topArticles.map((article, index) => (
                <Card key={article.id} className={`p-4 ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/20' :
                  index === 1 ? 'bg-gray-400/10 border-gray-400/20' :
                  index === 2 ? 'bg-orange-600/10 border-orange-600/20' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? '🥇' :
                       index === 1 ? '🥈' :
                       index === 2 ? '🥉' :
                       `#${index + 1}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate mb-1">{article.title}</p>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold text-blue-500">
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()} views
                        </span>
                        <span className="text-muted-foreground">
                          by {article.author}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Community Market Tab */}
      {activeTab === 'nadaFeedback' && nadaFeedback && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Community Market</h2>
              <p className="text-sm text-muted-foreground">Swag Shop analytics & feature voting</p>
            </div>
            {onNavigateToSwagAdmin && (
              <Button
                onClick={onNavigateToSwagAdmin}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 font-bold gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Manage Swag Shop
              </Button>
            )}
          </div>

          {/* Market Analytics Stats */}
          {marketAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total NADA Spent */}
              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Coins className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-emerald-500">
                      {(marketAnalytics.totalNadaSpent || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Total NADA Spent</p>
                  </div>
                </div>
              </Card>

              {/* Total Purchases */}
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <ShoppingBag className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-purple-500">
                      {marketAnalytics.totalPurchases || 0}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Total Purchases</p>
                  </div>
                </div>
              </Card>

              {/* Unique Buyers */}
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-blue-500">
                      {marketAnalytics.uniqueBuyers || 0}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Unique Buyers</p>
                  </div>
                </div>
              </Card>

              {/* Category Breakdown */}
              <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Package className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-bold text-emerald-500">
                        {marketAnalytics.categoryBreakdown?.themes || 0}T
                      </span>
                      <span className="text-sm font-bold text-purple-500">
                        {marketAnalytics.categoryBreakdown?.badges || 0}B
                      </span>
                      <span className="text-sm font-bold text-blue-500">
                        {marketAnalytics.categoryBreakdown?.merch || 0}M
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Themes • Badges • Merch</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Top Items */}
          {marketAnalytics && marketAnalytics.topItems && marketAnalytics.topItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top Selling Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketAnalytics.topItems.map((item: any, index: number) => {
                  // Get item display name
                  const itemNames: Record<string, string> = {
                    'theme-solarpunk': 'Solarpunk Dreams',
                    'theme-midnight-hemp': 'Midnight Hemp',
                    'theme-golden-hour': 'Golden Hour',
                    'badge-founder': 'Founder Badge',
                    'badge-sustainability': 'Sustainability Badge',
                    'badge-community': 'Community Badge',
                    'tshirt-hemp': 'Hemp T-Shirt',
                    'hoodie-organic': 'Organic Hoodie',
                    'totebag-recycled': 'Recycled Tote',
                    'stickers-biodegradable': 'Bio Stickers'
                  }
                  
                  const displayName = itemNames[item.itemId] || item.itemId
                  const isTheme = item.itemId.startsWith('theme-')
                  const isBadge = item.itemId.startsWith('badge-')

                  return (
                    <Card key={item.itemId} className="p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isTheme ? 'bg-emerald-500/20' : 
                          isBadge ? 'bg-purple-500/20' : 
                          'bg-blue-500/20'
                        }`}>
                          {isTheme ? (
                            <Palette className="w-4 h-4 text-emerald-500" />
                          ) : isBadge ? (
                            <Award className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Package className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{displayName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{item.count} sold</span>
                            <span>•</span>
                            <span className="text-emerald-500 font-bold">{item.totalSpent} NADA</span>
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                            #1
                          </Badge>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="space-y-4">
            <h3 className="font-bold">User Suggestions</h3>
            <div className="space-y-3">
              {nadaFeedback.suggestions.map((suggestion, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">User {suggestion.userId}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{suggestion.suggestion}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(suggestion.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Most Yes Votes */}
          <div className="space-y-4">
            <h3 className="font-bold">Most Popular Ideas (Yes Votes)</h3>
            <div className="space-y-3">
              {nadaFeedback.mostYes.map((idea, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{idea.ideaTitle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{idea.ideaDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold text-green-500">
                          <ThumbsUp className="w-3 h-3" />
                          {idea.yesVotes} yes
                        </span>
                        <span className="flex items-center gap-1 font-bold text-red-500">
                          <ThumbsDown className="w-3 h-3" />
                          {idea.noVotes} no
                        </span>
                        <span className="flex items-center gap-1 font-bold text-orange-500">
                          {idea.totalVotes} total
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Most No Votes */}
          <div className="space-y-4">
            <h3 className="font-bold">Least Popular Ideas (No Votes)</h3>
            <div className="space-y-3">
              {nadaFeedback.mostNo.map((idea, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{idea.ideaTitle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{idea.ideaDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold text-green-500">
                          <ThumbsUp className="w-3 h-3" />
                          {idea.yesVotes} yes
                        </span>
                        <span className="flex items-center gap-1 font-bold text-red-500">
                          <ThumbsDown className="w-3 h-3" />
                          {idea.noVotes} no
                        </span>
                        <span className="flex items-center gap-1 font-bold text-orange-500">
                          {idea.totalVotes} total
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wallets Tab - Financial Analytics */}
      {activeTab === 'wallets' && walletStats && (
        <WalletsTab 
          walletStats={walletStats} 
          onRefresh={refreshWalletStats}
          isRefreshing={refreshingWallets}
        />
      )}

      {/* Security Tab - Fraud Detection & User Auditing */}
      {activeTab === 'security' && (
        <SecurityAudit
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}

      {/* NADA Tracker Tab - Transaction History & Analytics */}
      {activeTab === 'nada' && (
        <AdminNadaTracker
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}

      {/* Bot Tab - Monitoring & Automation */}
      {activeTab === 'bot' && (
        <MonitoringBot
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}

      {/* RSS Feed Manager Tab */}
      {activeTab === 'rss' && (
        <RSSFeedManager
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}
      </>
      )}

      {/* FEATURE VIEW MODE */}
      {viewMode === 'feature' && (
        <div className="space-y-6">
          {/* Feature Tabs */}
          <div className="flex gap-2 border-b overflow-x-auto">
            {[
              { id: 'analytics', label: '📊 Analytics', icon: Activity },
              { id: 'content', label: '📰 Content', icon: FileText },
              { id: 'swipe', label: '💫 Swipe', icon: Heart },
              { id: 'users', label: '👥 Users', icon: Users },
              { id: 'gamification', label: '🎮 Gamification', icon: Zap },
              { id: 'security', label: '🔒 Security', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFeatureTab(tab.id as FeatureTab)}
                className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  featureTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Analytics Tab */}
          {featureTab === 'analytics' && stats && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">📊 Platform Analytics</h2>
                <Badge variant="outline" className="text-xs">
                  Live Data
                </Badge>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">Total Users</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active community</p>
                </Card>

                <Card className="p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold">Total Articles</h3>
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">{stats.totalArticles}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    +{stats.articlesLast24h} today
                  </p>
                </Card>

                <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold">Total Views</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-500">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Content engagement</p>
                </Card>

                <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold">Total Points</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-500">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalArticlesRead} reads
                  </p>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('rankings')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-6 h-6 text-amber-500" />
                      <h3 className="font-bold">Top Rankings</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">View user leaderboards</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/10 hover:shadow-xl transition-all"
                    onClick={() => setFeatureTab('swipe')}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-6 h-6 text-pink-500" />
                      <h3 className="font-bold">Swipe Analytics</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Content performance</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('views')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-6 h-6 text-emerald-500" />
                      <h3 className="font-bold">Views Deep Dive</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Detailed analytics</p>
                  </Card>
                </motion.div>
              </div>

              {/* Market Analytics if available */}
              {marketAnalytics && (
                <Card className="p-6 border-2 border-purple-500/20">
                  <h3 className="font-bold mb-4">💰 Community Market</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total NADA Spent</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {(marketAnalytics.totalSpent || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Items Sold</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {marketAnalytics.totalSales || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Buyers</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {marketAnalytics.uniqueBuyers || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Content Tab */}
          {featureTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">📰 Content Management</h2>
                <Badge variant="outline" className="text-xs">
                  {articles.length} Articles
                </Badge>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold">Total Articles</h3>
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">{stats?.totalArticles}</p>
                  <p className="text-sm text-muted-foreground mt-1">Published content</p>
                </Card>

                <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">Last 24 Hours</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">{stats?.articlesLast24h}</p>
                  <p className="text-sm text-muted-foreground mt-1">New articles today</p>
                </Card>

                <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold">Last 7 Days</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-500">{stats?.articlesLast7d}</p>
                  <p className="text-sm text-muted-foreground mt-1">Weekly publications</p>
                </Card>
              </div>

              {/* RSS & Views Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('rss')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-6 h-6 text-orange-500" />
                      <h3 className="font-bold">RSS Feed Manager</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage content sources</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('articles')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Edit className="w-6 h-6 text-emerald-500" />
                      <h3 className="font-bold">Article Management</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Edit & delete articles</p>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Article List */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Recent Articles</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {articles.slice(0, 10).map(article => (
                    <div
                      key={article.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setViewMode('classic')
                        setActiveTab('articles')
                      }}
                    >
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{article.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{article.views} views</span>
                          {article.isRss && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">RSS</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Swipe Tab */}
          {featureTab === 'swipe' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">💫 Swipe Mode Analytics</h2>
                <Badge variant="outline" className="text-xs">
                  {swipeStats.length} Articles
                </Badge>
              </div>

              {/* Swipe Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold">Total Likes</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-500">
                    {swipeStats.reduce((sum, s) => sum + s.likes, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Positive engagement</p>
                </Card>

                <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <X className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold">Total Skips</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-500">
                    {swipeStats.reduce((sum, s) => sum + s.skips, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Passed content</p>
                </Card>

                <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold">Avg Match Rate</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-500">
                    {swipeStats.length > 0 
                      ? Math.round(swipeStats.reduce((sum, s) => sum + s.likeRate, 0) / swipeStats.length)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Overall performance</p>
                </Card>
              </div>

              {/* Top Performing Articles */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">🏆 Top Performing Articles</h3>
                <div className="space-y-3">
                  {swipeStats
                    .sort((a, b) => b.likeRate - a.likeRate)
                    .slice(0, 10)
                    .map((stat, index) => (
                      <div
                        key={stat.articleId}
                        className={`p-4 rounded-lg border-2 ${
                          stat.likeRate >= 80 ? 'bg-green-500/10 border-green-500/20' :
                          stat.likeRate >= 60 ? 'bg-blue-500/10 border-blue-500/20' :
                          stat.likeRate >= 40 ? 'bg-orange-500/10 border-orange-500/20' :
                          'bg-red-500/10 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {stat.coverImage && (
                            <img
                              src={stat.coverImage}
                              alt={stat.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-bold truncate">{stat.title}</p>
                              {index < 3 && (
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                                  #{index + 1}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-green-500">
                                <Heart className="w-4 h-4" />
                                {stat.likes}
                              </span>
                              <span className="flex items-center gap-1 text-red-500">
                                <X className="w-4 h-4" />
                                {stat.skips}
                              </span>
                              <span className="flex items-center gap-1 text-orange-500 font-bold">
                                <TrendingUp className="w-4 h-4" />
                                {Math.round(stat.likeRate)}%
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {stat.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>

              {/* View Full Stats Button */}
              <Button
                onClick={() => {
                  setViewMode('classic')
                  setActiveTab('swipeStats')
                }}
                className="w-full"
                variant="outline"
              >
                View Full Swipe Statistics
              </Button>
            </div>
          )}

          {/* Users Tab */}
          {featureTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">👥 User Management</h2>
                <Badge variant="outline" className="text-xs">
                  {users.length} Users
                </Badge>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold">Total Users</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">{users.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Registered members</p>
                </Card>

                <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold">Banned Users</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-500">
                    {users.filter(u => u.banned).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Moderation actions</p>
                </Card>

                <Card className="p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold">Active Members</h3>
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">
                    {users.filter(u => u.points > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">With activity</p>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('rankings')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-6 h-6 text-amber-500" />
                      <h3 className="font-bold">View Rankings</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">See leaderboards</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('users')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-blue-500" />
                      <h3 className="font-bold">Full User Management</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage & moderate</p>
                  </Card>
                </motion.div>
              </div>

              {/* Top Users */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">🏆 Top Users by Points</h3>
                <div className="space-y-3">
                  {users
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold">{user.nickname || user.email}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{user.totalArticlesRead} reads</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {user.currentStreak} day streak
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">{user.points} pts</p>
                          <p className="text-xs text-muted-foreground">
                            {user.achievements.length} achievements
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* Gamification Tab */}
          {featureTab === 'gamification' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🎮 Gamification System</h2>
                <Badge variant="outline" className="text-xs">
                  Engagement Metrics
                </Badge>
              </div>

              {/* Gamification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold">Total Points</h3>
                  </div>
                  <p className="text-3xl font-bold text-orange-500">{stats?.totalPoints.toLocaleString()}</p>
                </Card>

                <Card className="p-6 border-2 border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold">Articles Read</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-500">{stats?.totalArticlesRead.toLocaleString()}</p>
                </Card>

                <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold">Total Achievements</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-500">
                    {users.reduce((sum, u) => sum + u.achievements.length, 0)}
                  </p>
                </Card>

                <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold">Longest Streak</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-500">
                    {Math.max(...users.map(u => u.longestStreak))} days
                  </p>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('gamification')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-purple-500" />
                      <h3 className="font-bold">Full Gamification Dashboard</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Detailed analytics</p>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('wallets')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="w-6 h-6 text-emerald-500" />
                      <h3 className="font-bold">NADA Wallets</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Financial overview</p>
                  </Card>
                </motion.div>
              </div>

              {/* Top Streaks */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">🔥 Streak Leaderboard</h3>
                <div className="space-y-3">
                  {users
                    .sort((a, b) => b.currentStreak - a.currentStreak)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Flame className={`w-5 h-5 ${
                            user.currentStreak >= 7 ? 'text-red-500' :
                            user.currentStreak >= 3 ? 'text-orange-500' :
                            'text-yellow-500'
                          }`} />
                          <div>
                            <p className="font-bold">{user.nickname || user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Longest: {user.longestStreak} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-500">{user.currentStreak} days</p>
                          <p className="text-xs text-muted-foreground">{user.points} pts</p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {featureTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🔒 Security & Monitoring</h2>
                <Badge variant="outline" className="text-xs">
                  Admin Tools
                </Badge>
              </div>

              {/* Security Modules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('security')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-8 h-8 text-red-500" />
                      <h3 className="font-bold">Security Audit</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      View audit logs & fraud detection
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Full Access
                    </Badge>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:shadow-xl transition-all"
                    onClick={() => {
                      setViewMode('classic')
                      setActiveTab('bot')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Bot className="w-8 h-8 text-purple-500" />
                      <h3 className="font-bold">Monitoring Bot</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automated system monitoring
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </Card>
                </motion.div>

                <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-8 h-8 text-blue-500" />
                    <h3 className="font-bold">Ban Status</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-500 mb-2">
                    {users.filter(u => u.banned).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Currently banned users
                  </p>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        {users.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Users (with points)</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        {users.filter(u => u.points > 0).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Banned Users</span>
                      <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        {users.filter(u => u.banned).length}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold mb-4">Recent Bans</h3>
                  <div className="space-y-2">
                    {users
                      .filter(u => u.banned)
                      .slice(0, 5)
                      .map(user => (
                        <div key={user.id} className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                          <Ban className="w-4 h-4 text-red-500" />
                          <span className="text-sm truncate">{user.email}</span>
                        </div>
                      ))}
                    {users.filter(u => u.banned).length === 0 && (
                      <p className="text-sm text-muted-foreground">No banned users</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}