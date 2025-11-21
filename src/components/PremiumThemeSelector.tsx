import { useState, useEffect } from 'react'
import { Palette, Moon, Sun, Sparkles, CheckCircle2, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface Theme {
  id: string
  swagItemId: string
  name: string
  description: string
  gradient: string
  icon: typeof Palette
  previewColors: {
    bg: string
    primary: string
    secondary: string
  }
}

interface PremiumThemeSelectorProps {
  userId: string
  accessToken: string
  currentTheme?: string
  onThemeChange: (theme: string) => void
}

export function PremiumThemeSelector({
  userId,
  accessToken,
  currentTheme = 'default',
  onThemeChange
}: PremiumThemeSelectorProps) {
  const [ownedThemes, setOwnedThemes] = useState<Set<string>>(new Set(['default']))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

  const themes: Theme[] = [
    {
      id: 'default',
      swagItemId: 'default',
      name: 'Default Light',
      description: 'Clean and minimal light theme',
      gradient: 'from-white to-gray-100',
      icon: Sun,
      previewColors: {
        bg: '#ffffff',
        primary: '#030213',
        secondary: '#e9ebef'
      }
    },
    {
      id: 'solarpunk-dreams',
      swagItemId: 'theme-solarpunk',
      name: 'Solarpunk Dreams',
      description: 'Emerald and gold with organic vibes',
      gradient: 'from-emerald-600 to-yellow-500',
      icon: Sparkles,
      previewColors: {
        bg: '#0a1f15',
        primary: '#fbbf24',
        secondary: '#10b981'
      }
    },
    {
      id: 'midnight-hemp',
      swagItemId: 'theme-midnight-hemp',
      name: 'Midnight Hemp',
      description: 'Dark mode with bioluminescent glow',
      gradient: 'from-purple-600 to-indigo-700',
      icon: Moon,
      previewColors: {
        bg: '#0c0a1f',
        primary: '#a855f7',
        secondary: '#10b981'
      }
    },
    {
      id: 'golden-hour',
      swagItemId: 'theme-golden-hour',
      name: 'Golden Hour',
      description: 'Warm sunset colors with ambient glow',
      gradient: 'from-amber-500 to-orange-600',
      icon: Sun,
      previewColors: {
        bg: '#1f1108',
        primary: '#f59e0b',
        secondary: '#fb923c'
      }
    }
  ]

  useEffect(() => {
    fetchOwnedThemes()
  }, [userId, accessToken])

  const fetchOwnedThemes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${serverUrl}/user-swag-items/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch owned items')
      }

      const data = await response.json()
      const owned = new Set<string>(['default']) // Default is always owned
      
      // Check which theme items the user owns
      data.items?.forEach((item: any) => {
        const theme = themes.find(t => t.swagItemId === item.item_id)
        if (theme) {
          owned.add(theme.id)
        }
      })

      setOwnedThemes(owned)
    } catch (error) {
      console.error('Error fetching owned themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeSelect = async (themeId: string) => {
    if (!ownedThemes.has(themeId)) {
      return // Can't select locked themes
    }

    try {
      setSaving(true)
      
      const response = await fetch(`${serverUrl}/users/${userId}/select-theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ theme: themeId })
      })

      if (!response.ok) {
        throw new Error('Failed to save theme selection')
      }

      onThemeChange(themeId)
    } catch (error) {
      console.error('Error saving theme:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premium Themes</CardTitle>
          <CardDescription>Loading themes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-gradient-to-br from-primary to-primary/70 rounded-xl p-3">
              <Palette className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <CardTitle>Premium Themes</CardTitle>
            <CardDescription>App-wide color themes from the Swag Shop</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const IconComponent = theme.icon
            const isOwned = ownedThemes.has(theme.id)
            const isSelected = currentTheme === theme.id
            const isLocked = !isOwned

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeSelect(theme.id)}
                disabled={isLocked || saving}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : isLocked
                    ? 'border-border/30 bg-card/30 opacity-60 cursor-not-allowed'
                    : 'border-border/50 hover:border-primary/30 bg-card/50 hover:scale-105'
                }`}
              >
                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      <p className="text-xs text-white/90 font-semibold">Purchase in Swag Shop</p>
                      <p className="text-xs text-white/70">150 NADA</p>
                    </div>
                  </div>
                )}

                {/* Theme Preview */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center flex-shrink-0 transition-all ${isOwned ? 'group-hover:scale-110' : ''} shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {theme.name}
                      </p>
                      {isOwned && !isLocked && (
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                          Owned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {theme.description}
                    </p>

                    {/* Color Preview */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.bg }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.secondary }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                Purchase Premium Themes in the Swag Shop!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Visit the Swag Shop to unlock more beautiful themes for your DEWII experience. Each theme costs 150 NADA points.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
