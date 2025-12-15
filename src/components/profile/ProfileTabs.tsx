import { useState } from 'react'
import { LayoutGrid, Package, Activity, Settings, Award, BookOpen, Flame, TrendingUp, Star, Zap } from 'lucide-react'
import { Badge } from '../ui/badge'

interface ProfileTabsProps {
  isOwnProfile: boolean
  userProgress?: {
    points?: number
    total_articles_read?: number
    current_streak?: number
    longest_streak?: number
    achievements?: string[]
    read_articles?: string[]
    last_read_date?: string | null
  } | null
  profile?: any
}

export function ProfileTabs({ isOwnProfile, userProgress, profile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: 'Soon'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      badge: 'Soon'
    }
  ]

  // Only show settings tab for own profile
  if (isOwnProfile) {
    tabs.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings
    })
  }

  return (
    <div className="px-4 md:px-6">
      {/* Tab buttons */}
      <div className="border-b border-border/50 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.badge && setActiveTab(tab.id)}
                disabled={!!tab.badge}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap
                  ${isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                  ${tab.badge ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Reading Stats Cards */}
            {userProgress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Articles Read */}
                <div className="bg-card border border-border/50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Articles Read</p>
                        <p className="text-3xl font-bold">{userProgress.total_articles_read || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>+{(userProgress.total_articles_read || 0) * 50} XP earned</span>
                  </div>
                </div>

                {/* Current Streak */}
                <div className="bg-card border border-border/50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-3xl font-bold">{userProgress.current_streak || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Longest: {userProgress.longest_streak || 0} days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {userProgress && userProgress.achievements && userProgress.achievements.length > 0 ? (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Achievements ({userProgress.achievements.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userProgress.achievements.map((achievement: string) => (
                    <div
                      key={achievement}
                      className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{formatAchievementName(achievement)}</p>
                        <p className="text-sm text-muted-foreground">Unlocked</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "Start reading articles to unlock achievements!"
                    : "No achievements yet."}
                </p>
              </div>
            )}

            {/* Coming Soon Preview */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Phase 1 Coming Soon</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Activity timeline with recent actions</li>
                    <li>• Inventory management for SWAP items</li>
                    <li>• Badge showcase and collections</li>
                    <li>• Detailed analytics and insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Inventory system coming in Phase 1</p>
            <p className="text-sm mt-2">List items for swap and manage your collection.</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Activity feed coming soon</p>
            <p className="text-sm mt-2">Track swaps, purchases, and contributions.</p>
          </div>
        )}

        {activeTab === 'settings' && isOwnProfile && (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Settings page coming soon</p>
            <p className="text-sm mt-2">Manage privacy, notifications, and preferences.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatAchievementName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}