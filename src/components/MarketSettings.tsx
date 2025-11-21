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
  onClose
}: MarketSettingsProps) {
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [currentTheme, setCurrentTheme] = useState('default')
  const [selectedBadge, setSelectedBadge] = useState('default')
  const [currentBadge, setCurrentBadge] = useState('default')
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingBadge, setIsSavingBadge] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [badgeSaveSuccess, setBadgeSaveSuccess] = useState(false)

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

  // Save selected theme
  const handleSaveTheme = async () => {
    if (!userId || !accessToken) return

    setIsSaving(true)
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/select-theme`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ theme: selectedTheme })
        }
      )

      if (response.ok) {
        setCurrentTheme(selectedTheme)
        setSaveSuccess(true)
        setTimeout(() => {
          setSaveSuccess(false)
          onClose()
          // Reload to apply theme
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Error saving theme:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Save selected badge
  const handleSaveBadge = async () => {
    if (!userId || !accessToken) return

    setIsSavingBadge(true)
    try {
      const response = await fetch(
        `${serverUrl}/users/${userId}/select-badge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ badge: selectedBadge })
        }
      )

      if (response.ok) {
        setCurrentBadge(selectedBadge)
        setBadgeSaveSuccess(true)
        setTimeout(() => {
          setBadgeSaveSuccess(false)
          onClose()
          // Reload to apply badge
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Error saving badge:', error)
    } finally {
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
          {saveSuccess && (
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
                          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-destructive/30">
                            <Lock className="w-8 h-8 text-destructive" />
                            <p className="text-sm font-semibold text-white">Purchase in Swag Shop</p>
                            <Badge variant="outline" className="bg-destructive/20 border-destructive/50 text-destructive">
                              {theme.price} NADA
                            </Badge>
                          </div>
                        )}

                        <button
                          onClick={() => isOwned && setSelectedTheme(theme.id)}
                          disabled={!isOwned}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-lg scale-105'
                              : 'border-border/50 hover:border-primary/30 bg-card/50'
                          } ${!isOwned ? 'opacity-50' : 'hover:scale-105'}`}
                        >
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

              {/* Save Button */}
              {selectedTheme !== currentTheme && (
                <div className="pt-4">
                  <Button
                    onClick={handleSaveTheme}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 font-bold py-6 text-base gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Applying Theme...
                      </>
                    ) : (
                      <>
                        <Palette className="w-5 h-5" />
                        Apply Theme
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Premium Badges Section - Coming Soon */}
          <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card/50 to-pink-500/5 opacity-60">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <CardTitle className="flex items-center gap-2">
                  Premium Badges
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600">
                    Coming Soon
                  </Badge>
                </CardTitle>
              </div>
              <CardDescription>
                Show off your achievements with exclusive profile badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PREMIUM_BADGES.map((badge) => {
                  const BadgeIcon = badge.icon || Award

                  return (
                    <div
                      key={badge.id}
                      className="relative group"
                    >
                      {/* Comic-style card with drop shadow */}
                      <div className="relative p-4 rounded-2xl border-4 border-border bg-card transition-all hover:translate-y-[-4px]" 
                        style={{
                          boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Halftone dot pattern overlay */}
                        <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)`,
                          backgroundSize: '8px 8px'
                        }} />
                        
                        {/* Icon container with neon glow and comic styling */}
                        <div className="mb-3 flex justify-center relative">
                          {/* Neon glow ring */}
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${badge.bgGradient} blur-md opacity-40 scale-110`} />
                          
                          {/* Badge icon with comic border */}
                          <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${badge.bgGradient} flex items-center justify-center shadow-lg border-4 border-background`}
                            style={{
                              boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.2)'
                            }}
                          >
                            <BadgeIcon className={`w-8 h-8 ${badge.iconColor} drop-shadow-lg`} strokeWidth={2.5} />
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                          </div>
                        </div>
                        
                        {/* Badge info with comic text styling */}
                        <div className="text-center relative">
                          <p className="text-sm font-black text-foreground mb-1 drop-shadow-md tracking-tight" 
                            style={{
                              textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                            }}
                          >
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground/90 line-clamp-2 font-medium">
                            {badge.description}
                          </p>
                        </div>

                        {/* Solarpunk accent corner */}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 animate-pulse" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

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