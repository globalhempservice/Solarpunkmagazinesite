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
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">Total Points</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{progress.points}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">Articles Read</CardTitle>
            <Book className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{progress.totalArticlesRead}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">Current Streak</CardTitle>
            <Flame className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{progress.currentStreak} days</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-foreground">Achievements</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{progress.achievements.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Next Milestone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">{progress.totalArticlesRead} articles</span>
            <span className="text-muted-foreground">{nextMilestone} articles</span>
          </div>
          <Progress value={progressToNext} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {nextMilestone - progress.totalArticlesRead} more articles to reach your next milestone!
          </p>
        </CardContent>
      </Card>

      {progress.achievements.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Achievements Unlocked</CardTitle>
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border"
                  >
                    <div className="p-2 rounded-full bg-primary/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground truncate">{achievement.name}</p>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
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
