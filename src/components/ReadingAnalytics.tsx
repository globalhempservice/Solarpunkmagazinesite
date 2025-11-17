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
  Eye
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
  ResponsiveContainer 
} from 'recharts@2.15.2'

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
}

interface ReadingAnalyticsProps {
  progress: UserProgress
  allArticles: Article[]
  onBack: () => void
}

export function ReadingAnalytics({ progress, allArticles, onBack }: ReadingAnalyticsProps) {
  const [readingByCategory, setReadingByCategory] = useState<{ name: string; value: number }[]>([])
  const [readingByDay, setReadingByDay] = useState<{ day: string; articles: number }[]>([])
  const [avgReadingTime, setAvgReadingTime] = useState(0)
  const [totalMinutesRead, setTotalMinutesRead] = useState(0)
  const [favoriteCategory, setFavoriteCategory] = useState('')
  const [readingVelocity, setReadingVelocity] = useState(0)

  useEffect(() => {
    calculateAnalytics()
  }, [progress, allArticles])

  const calculateAnalytics = () => {
    const readArticles = allArticles.filter(article => 
      progress.readArticles.includes(article.id)
    )

    // Category breakdown
    const categoryCount: { [key: string]: number } = {}
    readArticles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1
    })

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }))
    setReadingByCategory(categoryData)

    // Find favorite category
    const maxCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
    if (maxCategory) {
      setFavoriteCategory(maxCategory[0])
    }

    // Reading by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const dayData = last7Days.map(dateStr => {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
      // For demo purposes, generate some activity
      const articlesReadOnDay = Math.floor(Math.random() * 3)
      return {
        day: dayName,
        articles: articlesReadOnDay
      }
    })
    setReadingByDay(dayData)

    // Calculate reading time
    const totalTime = readArticles.reduce((sum, article) => sum + (article.readingTime || 5), 0)
    setTotalMinutesRead(totalTime)
    setAvgReadingTime(readArticles.length > 0 ? Math.round(totalTime / readArticles.length) : 0)

    // Reading velocity (articles per week)
    const velocity = progress.currentStreak > 0 
      ? Math.round((progress.totalArticlesRead / Math.max(progress.currentStreak, 1)) * 7)
      : 0
    setReadingVelocity(velocity)
  }

  const COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#84cc16', // lime
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl">📊 Reading Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your reading habits</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles Read */}
        <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Articles Read</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {progress.totalArticlesRead}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Reading Time */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {totalMinutesRead}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {progress.currentStreak} 🔥
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {progress.points}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reading Activity Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <CardTitle>📈 Reading Activity (Last 7 Days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={readingByDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                className="text-sm"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="articles" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
                name="Articles Read"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              <CardTitle>📚 Reading by Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {readingByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartPie>
                  <Pie
                    data={readingByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {readingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start reading to see category breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <CardTitle>⚡ Reading Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Favorite Category */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favorite Category</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {favoriteCategory || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Avg Reading Time */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Reading Time</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {avgReadingTime} min/article
                  </p>
                </div>
              </div>
            </div>

            {/* Reading Velocity */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reading Velocity</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {readingVelocity} articles/week
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">
                    {progress.achievements.length} 🏆
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <CardTitle>🎯 Reading Milestones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { milestone: 10, label: 'Knowledge Seeker', color: 'emerald' },
            { milestone: 25, label: 'Avid Learner', color: 'blue' },
            { milestone: 50, label: 'Expert Explorer', color: 'purple' },
            { milestone: 100, label: 'Master Reader', color: 'amber' },
          ].map(({ milestone, label, color }) => {
            const progressPercent = Math.min((progress.totalArticlesRead / milestone) * 100, 100)
            const isComplete = progress.totalArticlesRead >= milestone
            
            return (
              <div key={milestone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <div className={`w-6 h-6 rounded-full bg-${color}-500 flex items-center justify-center`}>
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted" />
                    )}
                    <span className="font-medium">{label}</span>
                  </div>
                  <Badge variant={isComplete ? 'default' : 'outline'}>
                    {isComplete ? '✓ Complete' : `${milestone - progress.totalArticlesRead} to go`}
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
