import { Award, Book, Flame, TrendingUp, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"

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

interface UserDashboardProps {
  progress: UserProgress
}

const achievementData: Record<string, { name: string; description: string; icon: any }> = {
  'first-read': {
    name: 'First Steps',
    description: 'Read your first article',
    icon: Book
  },
  'reader-10': {
    name: 'Curious Mind',
    description: 'Read 10 articles',
    icon: Award
  },
  'streak-3': {
    name: '3-Day Streak',
    description: 'Read for 3 consecutive days',
    icon: Flame
  },
  'streak-7': {
    name: 'Weekly Warrior',
    description: 'Read for 7 consecutive days',
    icon: Trophy
  }
}

export function UserDashboard({ progress }: UserDashboardProps) {
  const nextMilestone = progress.totalArticlesRead < 10 ? 10 : 
                        progress.totalArticlesRead < 25 ? 25 : 
                        progress.totalArticlesRead < 50 ? 50 : 100
  
  const progressToNext = (progress.totalArticlesRead / nextMilestone) * 100

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Points</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{progress.points}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Articles Read</CardTitle>
            <Book className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{progress.totalArticlesRead}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Current Streak</CardTitle>
            <Flame className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{progress.currentStreak} days</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Achievements</CardTitle>
            <Trophy className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{progress.achievements.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle>Next Milestone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{progress.totalArticlesRead} articles</span>
            <span className="text-muted-foreground">{nextMilestone} articles</span>
          </div>
          <Progress value={progressToNext} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {nextMilestone - progress.totalArticlesRead} more articles to reach your next milestone!
          </p>
        </CardContent>
      </Card>

      {progress.achievements.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Achievements Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {progress.achievements.map((achievementId) => {
                const achievement = achievementData[achievementId]
                if (!achievement) return null
                
                const Icon = achievement.icon
                
                return (
                  <div
                    key={achievementId}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200"
                  >
                    <div className="p-2 rounded-full bg-emerald-100">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm truncate">{achievement.name}</p>
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                          Unlocked
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
