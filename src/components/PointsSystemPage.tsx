import { ArrowLeft, Zap, BookOpen, PenTool, Share2, Flame, Heart, Trophy, Target, Sparkles, UserCircle, Palette, TrendingUp, Star, Clock, Award } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"

interface PointsSystemPageProps {
  onBack: () => void
}

const pointsCategories = [
  {
    id: 'reading',
    title: 'Reading & Learning',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    actions: [
      { 
        action: 'Read an Article', 
        points: 10, 
        frequency: 'Per article',
        icon: BookOpen,
        description: 'Complete an article to earn points and expand your knowledge'
      },
      { 
        action: 'Reading Streak (3 days)', 
        points: 30, 
        frequency: 'Achievement',
        icon: Flame,
        description: 'Read on 3 consecutive days'
      },
      { 
        action: 'Reading Streak (7 days)', 
        points: 75, 
        frequency: 'Achievement',
        icon: Flame,
        description: 'Read on 7 consecutive days'
      },
      { 
        action: 'Reading Streak (14 days)', 
        points: 200, 
        frequency: 'Achievement',
        icon: Flame,
        description: 'Read on 14 consecutive days'
      },
      { 
        action: 'Reading Streak (30 days)', 
        points: 500, 
        frequency: 'Achievement',
        icon: Flame,
        description: 'Read on 30 consecutive days - Legendary!'
      },
    ]
  },
  {
    id: 'creation',
    title: 'Content Creation',
    icon: PenTool,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    actions: [
      { 
        action: 'Create an Article', 
        points: 50, 
        frequency: 'Per article',
        icon: PenTool,
        description: 'Share your knowledge with the community'
      },
      { 
        action: 'First Article Published', 
        points: 100, 
        frequency: 'Achievement',
        icon: Trophy,
        description: 'Your journey as a creator begins'
      },
      { 
        action: '5 Articles Published', 
        points: 350, 
        frequency: 'Achievement',
        icon: Star,
        description: 'Rising Creator status unlocked'
      },
      { 
        action: '10 Articles Published', 
        points: 800, 
        frequency: 'Achievement',
        icon: Award,
        description: 'Master Creator status unlocked'
      },
    ]
  },
  {
    id: 'social',
    title: 'Community & Sharing',
    icon: Share2,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    actions: [
      { 
        action: 'Share an Article', 
        points: 5, 
        frequency: 'Per share',
        icon: Share2,
        description: 'Spread knowledge by sharing articles'
      },
      { 
        action: 'First Share', 
        points: 15, 
        frequency: 'Achievement',
        icon: Heart,
        description: 'Generous Soul achievement unlocked'
      },
      { 
        action: '10 Articles Shared', 
        points: 100, 
        frequency: 'Achievement',
        icon: Share2,
        description: 'Knowledge Spreader achievement'
      },
    ]
  },
  {
    id: 'exploration',
    title: 'Exploration & Discovery',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    actions: [
      { 
        action: 'Swipe Through Articles', 
        points: 0, 
        frequency: 'Free',
        icon: Heart,
        description: 'No points per swipe - discover what you love without pressure'
      },
      { 
        action: 'Match 10 Articles', 
        points: 60, 
        frequency: 'Achievement',
        icon: Heart,
        description: 'Good Taste achievement - build your reading list'
      },
      { 
        action: 'Swipe 10 Articles', 
        points: 20, 
        frequency: 'Achievement',
        icon: Target,
        description: 'Explorer Novice achievement'
      },
      { 
        action: 'Swipe 50 Articles', 
        points: 80, 
        frequency: 'Achievement',
        icon: Sparkles,
        description: 'Discovery Hunter achievement'
      },
    ]
  },
  {
    id: 'profile',
    title: 'Profile Customization',
    icon: UserCircle,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    actions: [
      { 
        action: 'Set Your Nickname', 
        points: 50, 
        frequency: 'One-time',
        icon: UserCircle,
        description: 'Personalize your profile'
      },
      { 
        action: 'Customize Home Theme', 
        points: 30, 
        frequency: 'One-time',
        icon: Palette,
        description: 'Make DEWII your own'
      },
    ]
  },
  {
    id: 'milestones',
    title: 'Point Milestones',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    actions: [
      { 
        action: 'Reach 500 Points', 
        points: 50, 
        frequency: 'Achievement',
        icon: Trophy,
        description: 'Point Collector achievement'
      },
      { 
        action: 'Reach 1,000 Points', 
        points: 150, 
        frequency: 'Achievement',
        icon: Star,
        description: 'Point Master achievement'
      },
      { 
        action: 'Reach 5,000 Points', 
        points: 500, 
        frequency: 'Achievement',
        icon: Award,
        description: 'Point Legend achievement'
      },
    ]
  },
]

export function PointsSystemPage({ onBack }: PointsSystemPageProps) {
  const totalPossibleOneTime = 50 + 30 + 15 // nickname, theme, first share
  const totalAchievements = pointsCategories.flatMap(cat => 
    cat.actions.filter(a => a.frequency === 'Achievement')
  ).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Points System
          </h1>
          <p className="text-muted-foreground mt-1">
            Earn points through reading, creating, and engaging with the community
          </p>
        </div>
      </div>

      {/* Hero Card - Key Philosophy */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <CardContent className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Our Philosophy</h3>
              <p className="text-muted-foreground mb-4">
                Points reward <strong>meaningful actions</strong> that benefit you and the community. We don't reward spam behavior like unlimited matching or swiping - instead, we celebrate <strong>quality over quantity</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-2">
                  <BookOpen className="w-3 h-3" />
                  Reading = Learning
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <PenTool className="w-3 h-3" />
                  Creating = Impact
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <Trophy className="w-3 h-3" />
                  Milestones = Recognition
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div className="text-2xl font-bold text-emerald-500">Unlimited</div>
            </div>
            <p className="text-sm text-muted-foreground">Repeatable Actions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <div className="text-2xl font-bold text-purple-500">{totalAchievements}</div>
            </div>
            <p className="text-sm text-muted-foreground">Achievement Bonuses</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <div className="text-2xl font-bold text-amber-500">{totalPossibleOneTime}</div>
            </div>
            <p className="text-sm text-muted-foreground">One-time Bonuses</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Points Categories */}
      <div className="space-y-6">
        {pointsCategories.map((category) => {
          const Icon = category.icon
          
          return (
            <Card 
              key={category.id}
              className={`relative overflow-hidden border-2 ${category.borderColor} ${category.bgColor}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${category.color} p-3 rounded-xl text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {category.actions.map((item, idx) => {
                  const ActionIcon = item.icon
                  const isZeroPoints = item.points === 0
                  
                  return (
                    <div 
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-border/50 hover:border-border transition-colors"
                    >
                      <div className={`${category.bgColor} p-2 rounded-lg`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{item.action}</h4>
                          <Badge 
                            variant={item.frequency === 'Achievement' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>

                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold ${
                        isZeroPoints 
                          ? 'bg-muted text-muted-foreground' 
                          : `bg-gradient-to-r ${category.color} text-white`
                      }`}>
                        {!isZeroPoints && <Zap className="w-4 h-4" />}
                        <span>{isZeroPoints ? 'FREE' : `+${item.points}`}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Important Notes */}
      <Card className="border-2 border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/10 p-3 rounded-2xl flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Important Notes</h3>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Reading Points:</strong> You earn 10 points each time you read a NEW article. Re-reading doesn't award additional points.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Swipe Mode:</strong> Swiping and matching are FREE - no points per action. This encourages authentic discovery without gaming the system. Points are awarded through achievements for milestones.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Creation Rewards:</strong> Creating content earns the MOST points (50 per article + achievements) because it adds value to the community.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Achievement Bonuses:</strong> When you unlock an achievement, you get bonus points on top of your regular points. These are one-time rewards.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Level System:</strong> Your level increases every 100 points. Higher levels unlock special titles and recognition.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <CardContent className="relative p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Start Earning Points!</h3>
          <p className="text-muted-foreground mb-4">
            Every action you take brings you closer to unlocking new achievements and climbing the leaderboard
          </p>
          <Button onClick={onBack} size="lg" className="gap-2">
            <Zap className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
