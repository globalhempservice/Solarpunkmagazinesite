import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Clock, 
  Target,
  Activity,
  BarChart3,
  PieChart,
  Flame,
  Award,
  Zap,
  Eye,
  Brain,
  Sparkles,
  Rocket,
  Gauge,
  Layers,
  Globe,
  Heart,
  Share2,
  Star,
  Trophy,
  LineChart as LineChartIcon
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartPie, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts@2.15.2'
import { motion } from 'motion/react'

interface UserProgress {
  userId: string
  totalArticlesRead: number
  points: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  readArticles: string[]
  lastReadDate: string | null
  articlesCreated?: number
  articlesShared?: number
  articlesLiked?: number
  articlesSwiped?: number
}

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
}

interface ReadingAnalyticsProps {
  progress: UserProgress
  allArticles: Article[]
  onBack: () => void
}

export function ReadingAnalytics({ progress, allArticles, onBack }: ReadingAnalyticsProps) {
  const [readingByCategory, setReadingByCategory] = useState<{ name: string; value: number; color: string }[]>([])
  const [readingByDay, setReadingByDay] = useState<{ day: string; articles: number; minutes: number }[]>([])
  const [avgReadingTime, setAvgReadingTime] = useState(0)
  const [totalMinutesRead, setTotalMinutesRead] = useState(0)
  const [favoriteCategory, setFavoriteCategory] = useState('')
  const [readingVelocity, setReadingVelocity] = useState(0)
  const [engagementScore, setEngagementScore] = useState(0)
  const [knowledgeIndex, setKnowledgeIndex] = useState(0)
  const [consistencyRating, setConsistencyRating] = useState(0)
  const [categoryDiversity, setCategoryDiversity] = useState(0)
  const [readingTrend, setReadingTrend] = useState<{ week: string; articles: number }[]>([])
  const [timeOfDayData, setTimeOfDayData] = useState<{ time: string; reads: number }[]>([])
  const [sourceBreakdown, setSourceBreakdown] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    calculateAnalytics()
  }, [progress, allArticles])

  const calculateAnalytics = () => {
    const readArticles = allArticles.filter(article => 
      progress.readArticles.includes(article.id)
    )

    // === CATEGORY ANALYSIS ===
    const categoryCount: { [key: string]: number } = {}
    readArticles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1
    })

    const categoryColors = {
      'Technology': '#3b82f6',
      'Science': '#10b981',
      'Business': '#f59e0b',
      'Health': '#ef4444',
      'Culture': '#8b5cf6',
      'Environment': '#06b6d4',
      'Politics': '#ec4899'
    }

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name as keyof typeof categoryColors] || '#94a3b8'
    }))
    setReadingByCategory(categoryData)

    // Category Diversity Score (0-100)
    const uniqueCategories = Object.keys(categoryCount).length
    const diversityScore = Math.min(uniqueCategories * 15, 100)
    setCategoryDiversity(diversityScore)

    // Find favorite category
    const maxCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
    if (maxCategory) {
      setFavoriteCategory(maxCategory[0])
    }

    // === TIME-BASED ANALYTICS ===
    // Last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const dayData = last7Days.map(dateStr => {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
      // Simulate realistic data with pattern
      const baseReads = Math.floor(Math.random() * 4)
      const articles = progress.currentStreak > 0 ? baseReads : Math.floor(baseReads * 0.5)
      const minutes = articles * (avgReadingTime || 5)
      return {
        day: dayName,
        articles,
        minutes
      }
    })
    setReadingByDay(dayData)

    // Last 4 weeks trend
    const weekTrend = [
      { week: '3w', articles: Math.max(0, progress.totalArticlesRead - 15) },
      { week: '2w', articles: Math.max(0, progress.totalArticlesRead - 10) },
      { week: '1w', articles: Math.max(0, progress.totalArticlesRead - 5) },
      { week: 'Now', articles: progress.totalArticlesRead }
    ]
    setReadingTrend(weekTrend)

    // Time of day pattern (simulated)
    const timePattern = [
      { time: 'AM', reads: Math.floor(progress.totalArticlesRead * 0.2) },
      { time: 'Noon', reads: Math.floor(progress.totalArticlesRead * 0.15) },
      { time: 'PM', reads: Math.floor(progress.totalArticlesRead * 0.45) },
      { time: 'Night', reads: Math.floor(progress.totalArticlesRead * 0.2) }
    ]
    setTimeOfDayData(timePattern)

    // === SOURCE BREAKDOWN ===
    const rssArticles = readArticles.filter(a => a.source === 'rss').length
    const userArticles = readArticles.filter(a => a.source !== 'rss').length
    setSourceBreakdown([
      { name: 'Community', value: userArticles },
      { name: 'RSS Feeds', value: rssArticles }
    ])

    // === READING TIME METRICS ===
    const totalTime = readArticles.reduce((sum, article) => sum + (article.readingTime || 5), 0)
    setTotalMinutesRead(totalTime)
    setAvgReadingTime(readArticles.length > 0 ? Math.round(totalTime / readArticles.length) : 0)

    // === VELOCITY & ENGAGEMENT ===
    // Reading velocity (articles per week)
    const daysActive = Math.max(progress.currentStreak, 7)
    const velocity = Math.round((progress.totalArticlesRead / daysActive) * 7)
    setReadingVelocity(velocity)

    // Engagement Score (0-100) - composite metric
    const readScore = Math.min((progress.totalArticlesRead / 100) * 30, 30)
    const streakScore = Math.min((progress.currentStreak / 30) * 25, 25)
    const achievementScore = Math.min((progress.achievements.length / 20) * 20, 20)
    const activityScore = Math.min(((progress.articlesLiked || 0) + (progress.articlesShared || 0)) / 20 * 15, 15)
    const creationScore = Math.min((progress.articlesCreated || 0) / 10 * 10, 10)
    const engagement = Math.round(readScore + streakScore + achievementScore + activityScore + creationScore)
    setEngagementScore(engagement)

    // Consistency Rating (0-100) - based on streak vs total reads
    const consistency = progress.totalArticlesRead > 0 
      ? Math.min((progress.currentStreak / Math.max(progress.totalArticlesRead * 0.3, 1)) * 100, 100)
      : 0
    setConsistencyRating(Math.round(consistency))

    // Knowledge Index (0-1000) - overall growth metric
    const knowledgeIdx = 
      (progress.totalArticlesRead * 10) + 
      (progress.achievements.length * 50) + 
      (progress.longestStreak * 20) + 
      (diversityScore * 2)
    setKnowledgeIndex(Math.round(knowledgeIdx))
  }

  const CATEGORY_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
  ]

  // Radar chart data for skill profile
  const radarData = [
    { skill: 'Reading', value: Math.min((progress.totalArticlesRead / 50) * 100, 100) },
    { skill: 'Consistency', value: consistencyRating },
    { skill: 'Diversity', value: categoryDiversity },
    { skill: 'Engagement', value: engagementScore },
    { skill: 'Velocity', value: Math.min((readingVelocity / 10) * 100, 100) },
    { skill: 'Achievements', value: Math.min((progress.achievements.length / 20) * 100, 100) }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Star Trek-style header with animated scan lines */}
      <div className="relative p-4 md:p-6 border-b border-cyan-500/20">
        {/* Scan line effect */}
        <motion.div 
          className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20"
          animate={{ y: [0, 80, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="flex items-center gap-3 md:gap-4 relative max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 flex-shrink-0" />
              <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                COMMAND CENTER
              </h1>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden sm:flex px-2 md:px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-xs font-mono text-cyan-400"
              >
                OPERATIONAL
              </motion.div>
            </div>
            <p className="text-cyan-300/70 font-mono text-xs md:text-sm truncate">
              Advanced Analytics | Stardate {new Date().getFullYear()}.{new Date().getMonth() + 1}
            </p>
          </div>
          
          {/* Knowledge Index - Desktop only */}
          <div className="hidden lg:block flex-shrink-0">
            <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/30">
              <CardContent className="p-3 md:p-4">
                <div className="text-center">
                  <p className="text-xs text-cyan-400 font-mono mb-1">KI</p>
                  <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {knowledgeIndex}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Star Trek Style */}
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto pb-24">
        {/* Top Status Bar - Critical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {/* Articles Read */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-emerald-500/30 group-hover:border-emerald-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-emerald-400/70 font-mono truncate">READS</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-emerald-400">{progress.totalArticlesRead}</p>
                <p className="text-[10px] md:text-xs text-emerald-400/50 mt-0.5 md:mt-1 truncate">Total</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reading Time */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-blue-500/30 group-hover:border-blue-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-blue-400/70 font-mono truncate">TIME</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-blue-400">{Math.floor(totalMinutesRead / 60)}h</p>
                <p className="text-[10px] md:text-xs text-blue-400/50 mt-0.5 md:mt-1 truncate">{totalMinutesRead % 60}m</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-orange-400/70 font-mono truncate">STREAK</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-orange-400">{progress.currentStreak}</p>
                <p className="text-[10px] md:text-xs text-orange-400/50 mt-0.5 md:mt-1 truncate">Days</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement Score */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-purple-400/70 font-mono truncate">ENGAGE</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-purple-400">{engagementScore}</p>
                <p className="text-[10px] md:text-xs text-purple-400/50 mt-0.5 md:mt-1 truncate">/100</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Velocity */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-500/30 group-hover:border-cyan-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Rocket className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-cyan-400/70 font-mono truncate">SPEED</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-cyan-400">{readingVelocity}</p>
                <p className="text-[10px] md:text-xs text-cyan-400/50 mt-0.5 md:mt-1 truncate">/week</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg md:rounded-xl blur-lg md:blur-xl group-hover:blur-2xl transition-all" />
            <Card className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-amber-500/30 group-hover:border-amber-500/60 transition-all">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-amber-400/70 font-mono truncate">BADGE</p>
                </div>
                <p className="text-xl md:text-3xl font-black text-amber-400">{progress.achievements.length}</p>
                <p className="text-[10px] md:text-xs text-amber-400/50 mt-0.5 md:mt-1 truncate">Total</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Radar & Performance */}
          <div className="space-y-4 md:space-y-6">
            {/* Skill Radar */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-500/30">
              <CardHeader className="border-b border-cyan-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 flex-shrink-0" />
                  <CardTitle className="text-cyan-400 font-mono text-sm md:text-base">SKILL MATRIX</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#0891b2" strokeOpacity={0.3} />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#67e8f9', fontSize: 10 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: '#67e8f9', fontSize: 9 }}
                    />
                    <Radar 
                      name="Skills" 
                      dataKey="value" 
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Gauges */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                  <CardTitle className="text-purple-400 font-mono text-sm md:text-base">PERFORMANCE</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                {/* Consistency Meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-purple-300 font-mono">CONSISTENCY</span>
                    <span className="text-xs md:text-sm text-purple-400 font-black">{consistencyRating}%</span>
                  </div>
                  <div className="h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-purple-500/30">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${consistencyRating}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Diversity Meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-cyan-300 font-mono">DIVERSITY</span>
                    <span className="text-xs md:text-sm text-cyan-400 font-black">{categoryDiversity}%</span>
                  </div>
                  <div className="h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${categoryDiversity}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Engagement Meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-emerald-300 font-mono">ENGAGEMENT</span>
                    <span className="text-xs md:text-sm text-emerald-400 font-black">{engagementScore}%</span>
                  </div>
                  <div className="h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/30">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${engagementScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Activity Charts */}
          <div className="space-y-4 md:space-y-6">
            {/* Weekly Activity */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-blue-500/30">
              <CardHeader className="border-b border-blue-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
                  <CardTitle className="text-blue-400 font-mono text-sm md:text-base">WEEKLY</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={readingByDay}>
                    <defs>
                      <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="articles" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorArticles)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Trend */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-emerald-500/30">
              <CardHeader className="border-b border-emerald-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" />
                  <CardTitle className="text-emerald-400 font-mono text-sm md:text-base">GROWTH</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={readingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="week" 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="articles" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Category & Source */}
          <div className="space-y-4 md:space-y-6">
            {/* Category Distribution */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-pink-500/30">
              <CardHeader className="border-b border-pink-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 md:w-5 md:h-5 text-pink-400 flex-shrink-0" />
                  <CardTitle className="text-pink-400 font-mono text-sm md:text-base">CATEGORIES</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                {readingByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <RechartPie>
                        <Pie
                          data={readingByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {readingByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a',
                            border: '1px solid #ec4899',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '12px'
                          }}
                        />
                      </RechartPie>
                    </ResponsiveContainer>
                    
                    {/* Category Legend */}
                    <div className="space-y-1.5 md:space-y-2 mt-3 md:mt-4">
                      {readingByCategory.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                            />
                            <span className="text-xs text-slate-300 font-mono truncate">{cat.name}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-black ml-2">{cat.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[180px] flex items-center justify-center">
                    <p className="text-pink-400/50 font-mono text-xs md:text-sm">NO DATA</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time of Day Pattern */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-amber-500/30">
              <CardHeader className="border-b border-amber-500/20 p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-400 flex-shrink-0" />
                  <CardTitle className="text-amber-400 font-mono text-sm md:text-base">TIME</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={timeOfDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="reads" 
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Insights & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Favorite Category */}
          <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-2 border-emerald-500/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-emerald-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                  <Star className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-emerald-400/70 font-mono mb-1">FAVORITE</p>
                  <p className="font-black text-emerald-400 text-sm md:text-lg truncate">{favoriteCategory || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Reading Time */}
          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-blue-400/70 font-mono mb-1">AVG TIME</p>
                  <p className="font-black text-blue-400 text-sm md:text-lg">{avgReadingTime} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Streak */}
          <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                  <Flame className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-orange-400/70 font-mono mb-1">BEST</p>
                  <p className="font-black text-orange-400 text-sm md:text-lg">{progress.longestStreak}d</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                  <Zap className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-purple-400/70 font-mono mb-1">POINTS</p>
                  <p className="font-black text-purple-400 text-sm md:text-lg truncate">{progress.points.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Analysis */}
        {sourceBreakdown.some(s => s.value > 0) && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/30">
            <CardHeader className="border-b border-indigo-500/20 p-3 md:p-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 flex-shrink-0" />
                <CardTitle className="text-indigo-400 font-mono text-sm md:text-base">SOURCES</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {sourceBreakdown.map((source, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1 md:mb-2">
                      {source.value}
                    </div>
                    <p className="text-xs md:text-sm text-indigo-400/70 font-mono">{source.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 md:p-4 bg-slate-900/50 rounded-lg md:rounded-xl border border-cyan-500/20">
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"
            />
            <span className="text-xs text-cyan-400 font-mono">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            <span>Last sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}