import { X, Palette, Award, Sparkles, Crown, Lock, CheckCircle2, Leaf } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useState, useEffect } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface MarketSettingsProps {
  isOpen: boolean
  userId: string | null
  accessToken: string | null
  serverUrl: string
  onClose: () => void
  onThemeUpdate: (theme: string) => void
}

interface OwnedItem {
  id: string
  name: string
  category: string
}

// Premium Market Themes (150 NADA each from Swag Shop)
const PREMIUM_THEMES = [
  {
    id: 'default',
    name: 'Default Light',
    description: 'Classic DEWII vibes',
    gradient: 'from-emerald-500 to-teal-500',
    bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950',
    price: 0,
    free: true
  },
  {
    id: 'solarpunk',
    name: 'Solarpunk Dreams',
    description: 'Emerald forests meet golden sun',
    gradient: 'from-emerald-400 via-green-500 to-amber-500',
    bgClass: 'bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900',
    price: 150,
    swagShopId: 'theme-solarpunk'
  },
  {
    id: 'midnight',
    name: 'Midnight Hemp',
    description: 'Bioluminescent purple glow',
    gradient: 'from-purple-500 via-indigo-600 to-violet-700',
    bgClass: 'bg-gradient-to-br from-purple-950 via-indigo-900 to-violet-950',
    price: 150,
    swagShopId: 'theme-midnight-hemp'
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Warm sunset energy',
    gradient: 'from-orange-400 via-amber-500 to-yellow-600',
    bgClass: 'bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900',
    price: 150,
    swagShopId: 'theme-golden-hour'
  }
]

// Premium Badges (coming soon)
const PREMIUM_BADGES = [
  {
    id: 'default',
    name: 'No Badge',
    description: 'Classic look',
    iconColor: 'text-muted-foreground',
    bgGradient: 'from-muted to-muted',
    free: true
  },
  {
    id: 'badge-founder',
    name: 'Founder Badge',
    description: 'Early community member',
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500 to-pink-600',
    icon: Crown,
    price: 250,
    swagShopId: 'badge-founder'
  },
  {
    id: 'badge-hemp-pioneer',
    name: 'Hemp Pioneer',
    description: 'Hemp movement dedication',
    iconColor: 'text-emerald-400',
    bgGradient: 'from-emerald-500 to-green-600',
    icon: Leaf,
    price: 200,
    swagShopId: 'badge-hemp-pioneer'
  },
  {
    id: 'badge-nada-whale',
    name: 'NADA Whale',
    description: 'True NADA collector',
    iconColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500 to-blue-600',
    icon: Sparkles,
    price: 500,
    swagShopId: 'badge-nada-whale'
  }
]

export function MarketSettings({
  isOpen,
  userId,
  accessToken,
  serverUrl,
  onClose,
  onThemeUpdate
}: MarketSettingsProps) {
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [currentTheme, setCurrentTheme] = useState('default')
  const [selectedBadge, setSelectedBadge] = useState('default')
  const [currentBadge, setCurrentBadge] = useState('default')
  const [isSavingTheme, setIsSavingTheme] = useState(false)
  const [isSavingBadge, setIsSavingBadge] = useState(false)
  const [savingThemeId, setSavingThemeId] = useState<string | null>(null)
  const [savingBadgeId, setSavingBadgeId] = useState<string | null>(null)

  // Fetch current theme and owned items from backend
  useEffect(() => {
    if (isOpen && userId && accessToken) {
      fetchUserData()
    }
  }, [isOpen, userId, accessToken])

  const fetchUserData = async () => {
    if (!userId || !accessToken) return

    setIsLoading(true)
    try {
      // Fetch user progress to get current theme
      const progressResponse = await fetch(
        `${serverUrl}/user-progress/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        const theme = progressData.selectedTheme || 'default'
        const badge = progressData.selectedBadge || 'default'
        setCurrentTheme(theme)
        setSelectedTheme(theme)
        setCurrentBadge(badge)
        setSelectedBadge(badge)
        console.log('Current market theme:', theme)
        console.log('Current badge:', badge)
      }

      // Fetch owned items from Swag Shop
      const itemsResponse = await fetch(
        `${serverUrl}/user-swag-items/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        const itemIds = itemsData.items || []
        console.log('Owned item IDs:', itemIds)
        // Convert to OwnedItem format for backward compatibility
        setOwnedItems(itemIds.map((id: string) => ({ id, name: '', category: '' })))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user owns a specific theme
  const ownsTheme = (themeId: string) => {
    const theme = PREMIUM_THEMES.find(t => t.id === themeId)
    if (!theme) return false
    if (theme.free) return true
    
    // Check if the item ID is in the owned items array
    return ownedItems.some(item => item.id === theme.swagShopId)
  }

  // Check if user owns a specific badge
  const ownsBadge = (badgeId: string) => {
    const badge = PREMIUM_BADGES.find(t => t.id === badgeId)
    if (!badge) return false
    if (badge.free) return true
    
    // Check if the item ID is in the owned items array
    return ownedItems.some(item => item.id === badge.swagShopId)
  }

  // Auto-save theme when selected
  const handleThemeSelect = async (themeId: string) => {
    if (!userId || !accessToken || themeId === currentTheme) return
    
    setSelectedTheme(themeId)
    setSavingThemeId(themeId)
    setIsSavingTheme(true)
    
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/select-theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ theme: themeId })
        }
      )

      if (response.ok) {
        setCurrentTheme(themeId)
        console.log('Theme saved successfully:', themeId)
        // Update theme instantly via callback (no reload)
        onThemeUpdate(themeId)
        // Clear loading state after showing success
        setTimeout(() => {
          setSavingThemeId(null)
          setIsSavingTheme(false)
        }, 800)
      } else {
        console.error('Failed to save theme:', await response.text())
        setSavingThemeId(null)
        setIsSavingTheme(false)
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      setSavingThemeId(null)
      setIsSavingTheme(false)
    }
  }

  // Auto-save badge when selected
  const handleBadgeSelect = async (badgeId: string) => {
    if (!userId || !accessToken || badgeId === currentBadge) return
    
    setSelectedBadge(badgeId)
    setSavingBadgeId(badgeId)
    setIsSavingBadge(true)
    
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/select-badge`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ badge: badgeId })
        }
      )

      if (response.ok) {
        setCurrentBadge(badgeId)
        console.log('Badge saved successfully:', badgeId)
        // Clear loading state after showing success
        setTimeout(() => {
          setSavingBadgeId(null)
          setIsSavingBadge(false)
        }, 1000)
      } else {
        console.error('Failed to save badge:', await response.text())
        setSavingBadgeId(null)
        setIsSavingBadge(false)
      }
    } catch (error) {
      console.error('Error saving badge:', error)
      setSavingBadgeId(null)
      setIsSavingBadge(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-2 border-primary/30 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-primary/70 rounded-xl p-2.5">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black">Market Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your Community Market experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {savingThemeId && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Theme Applied!</p>
                <p className="text-sm text-muted-foreground">Your market theme has been updated.</p>
              </div>
            </div>
          )}

          {/* Market Themes Section */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Market Themes</CardTitle>
              </div>
              <CardDescription>
                Change the visual style of the Community Market. Purchase premium themes in the Swag Shop!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PREMIUM_THEMES.map((theme) => {
                    const isOwned = ownsTheme(theme.id)
                    const isSelected = selectedTheme === theme.id

                    return (
                      <div
                        key={theme.id}
                        className="relative group"
                      >
                        {/* Lock Overlay */}
                        {!isOwned && (
                          <div className="absolute inset-0 z-[5] bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-destructive/30">
                            <Lock className="w-8 h-8 text-destructive" />
                            <p className="text-sm font-semibold text-white">Purchase in Swag Shop</p>
                            <Badge variant="outline" className="bg-destructive/20 border-destructive/50 text-destructive">
                              {theme.price} NADA
                            </Badge>
                          </div>
                        )}

                        <button
                          onClick={() => isOwned && handleThemeSelect(theme.id)}
                          disabled={!isOwned || isSavingTheme}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-lg scale-105'
                              : 'border-border/50 hover:border-primary/30 bg-card/50'
                          } ${!isOwned ? 'opacity-50' : 'hover:scale-105'}`}
                        >
                          {/* Loading Spinner Overlay */}
                          {savingThemeId === theme.id && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                          )}
                          
                          {/* Theme Preview */}
                          <div className="space-y-3">
                            {/* Gradient Preview */}
                            <div className={`relative h-24 rounded-xl bg-gradient-to-br ${theme.gradient} shadow-lg overflow-hidden`}>
                              {/* Hemp pattern overlay */}
                              <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0v40M0 20h40' stroke='white' stroke-width='1' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
                                backgroundSize: '40px 40px'
                              }} />
                              
                              {/* Selected Checkmark */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Theme Info */}
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`font-bold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {theme.name}
                                </p>
                                {theme.free && (
                                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {theme.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Info Footer */}
          <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border">
            <div className="flex items-start gap-2">
              <Crown className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">How to unlock more themes:</p>
                <p>Visit the <span className="font-semibold text-primary">Swag Shop</span> in the Community Market to purchase premium themes with NADA points. Once purchased, they'll appear here and you can apply them instantly!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}