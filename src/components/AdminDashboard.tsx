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
  Edit
} from 'lucide-react'
import { motion } from 'motion/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { WalletsTab } from './WalletsTab'
import { SecurityAudit } from './SecurityAudit'
import { MonitoringBot } from './MonitoringBot'

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
  totalArticlesRead: number
  currentStreak: number
  longestStreak: number
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
}

type TabType = 'overview' | 'users' | 'articles' | 'rankings' | 'gamification' | 'swipeStats' | 'views' | 'nadaFeedback' | 'wallets' | 'security' | 'bot'

export function AdminDashboard({ accessToken, serverUrl, onBack, onEditArticle }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [swipeStats, setSwipeStats] = useState<SwipeStat[]>([])
  const [viewsAnalytics, setViewsAnalytics] = useState<ViewsAnalytics | null>(null)
  const [nadaFeedback, setNadaFeedback] = useState<NadaFeedback | null>(null)
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshingWallets, setRefreshingWallets] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel for faster loading
      const [statsRes, usersRes, articlesRes, rankingsRes, swipeStatsRes, viewsAnalyticsRes, nadaFeedbackRes, walletStatsRes] = await Promise.all([
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
        <Button onClick={onBack} variant="outline">
          Exit Admin
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'articles', label: 'Articles' },
          { id: 'rankings', label: 'Rankings' },
          { id: 'gamification', label: 'Gamification' },
          { id: 'swipeStats', label: 'Swipe Stats' },
          { id: 'views', label: 'Views' },
          { id: 'nadaFeedback', label: 'Nada Feedback' },
          { id: 'wallets', label: 'Wallets' },
          { id: 'security', label: '🔒 Security' },
          { id: 'bot', label: '🤖 Bot' }
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

          {/* Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="p-6 border-2 border-emerald-500/20 bg-emerald-500/5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setActiveTab('articles')}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold">New Articles</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-500">{stats.articlesLast24h}</p>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </Card>

            <Card 
              className="p-6 border-2 border-blue-500/20 bg-blue-500/5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setActiveTab('articles')}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold">Weekly Articles</h3>
              </div>
              <p className="text-2xl font-bold text-blue-500">{stats.articlesLast7d}</p>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </Card>

            <Card 
              className="p-6 border-2 border-purple-500/20 bg-purple-500/5 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setActiveTab('gamification')}
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold">Reading Activity</h3>
              </div>
              <p className="text-2xl font-bold text-purple-500">{stats.totalArticlesRead}</p>
              <p className="text-sm text-muted-foreground">Articles read total</p>
            </Card>
          </div>

          {/* Top Swipe Stats Section */}
          {swipeStats.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Top Swipe Engagement</h3>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('swipeStats')}>
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {swipeStats.slice(0, 3).map((stat, index) => (
                  <Card 
                    key={stat.articleId} 
                    className={`p-4 cursor-pointer hover:scale-105 transition-all ${
                      stat.likeRate >= 80 ? 'bg-green-500/10 border-green-500/20' :
                      stat.likeRate >= 50 ? 'bg-yellow-500/10 border-yellow-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}
                    onClick={() => setActiveTab('swipeStats')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        stat.likeRate >= 80 ? 'bg-green-500 text-white' :
                        stat.likeRate >= 50 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        #{index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate mb-1">{stat.title}</p>
                        <Badge variant="secondary" className="text-xs mb-2">
                          {stat.category}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-green-500" />
                            {stat.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <X className="w-3 h-3 text-red-500" />
                            {stat.skips}
                          </span>
                          <span className="font-bold text-orange-500">
                            {stat.likeRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">User Rankings</h2>
            <p className="text-sm text-muted-foreground">Top performers</p>
          </div>

          <div className="space-y-3">
            {rankings.map((ranking) => (
              <Card key={ranking.userId} className={`p-4 ${
                ranking.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' :
                ranking.rank === 2 ? 'bg-gray-400/10 border-gray-400/20' :
                ranking.rank === 3 ? 'bg-orange-600/10 border-orange-600/20' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{ranking.nickname}</p>
                      {ranking.achievements.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          {ranking.achievements.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{ranking.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-bold text-orange-500">
                        <Zap className="w-3 h-3" />
                        {ranking.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {ranking.totalArticlesRead} read
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {ranking.currentStreak} streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {ranking.longestStreak} best
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

      {/* Nada Feedback Tab */}
      {activeTab === 'nadaFeedback' && nadaFeedback && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Nada Feedback</h2>
            <p className="text-sm text-muted-foreground">User suggestions and feedback</p>
          </div>

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

      {/* Bot Tab - Monitoring & Automation */}
      {activeTab === 'bot' && (
        <MonitoringBot
          accessToken={accessToken}
          serverUrl={serverUrl}
        />
      )}
    </motion.div>
  )
}