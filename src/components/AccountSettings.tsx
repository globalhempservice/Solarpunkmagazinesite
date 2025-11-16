import { LogOut, User, Mail, Shield, Trash2, Crown, Zap, Sparkles, Save, CheckCircle2, Leaf, Sun, Droplets, Trees, Sunset as SunsetIcon, Sparkle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useState, useEffect, useRef } from 'react'
import { BrandLogo } from './BrandLogo'

interface AccountSettingsProps {
  userId: string | null
  userEmail?: string
  userPoints?: number
  userNickname?: string
  homeButtonTheme?: string
  onLogout: () => void
  onUpdateProfile?: (nickname: string, theme: string) => Promise<void>
}

export function AccountSettings({ 
  userId, 
  userEmail, 
  userPoints, 
  userNickname: initialNickname,
  homeButtonTheme: initialTheme,
  onLogout,
  onUpdateProfile 
}: AccountSettingsProps) {
  const level = userPoints ? Math.floor(userPoints / 100) + 1 : 1
  
  const [nickname, setNickname] = useState(initialNickname || '')
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'default')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  
  // Debounce timer for nickname auto-save
  const nicknameTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track if profile is complete for points
  const isNicknameSet = Boolean(initialNickname)
  const isThemeCustomized = Boolean(initialTheme && initialTheme !== 'default')

  // Creative icon-based themes (no emojis)
  const themes = [
    { 
      id: 'default', 
      name: 'Default', 
      gradient: 'from-primary to-primary/70', 
      icon: Leaf,
      description: 'Green eco'
    },
    { 
      id: 'solar', 
      name: 'Solar Power', 
      gradient: 'from-amber-500 to-orange-500', 
      icon: Sun,
      description: 'Bright energy'
    },
    { 
      id: 'ocean', 
      name: 'Ocean Blue', 
      gradient: 'from-blue-500 to-cyan-500', 
      icon: Droplets,
      description: 'Cool waters'
    },
    { 
      id: 'forest', 
      name: 'Forest Green', 
      gradient: 'from-emerald-500 to-teal-500', 
      icon: Trees,
      description: 'Deep woods'
    },
    { 
      id: 'sunset', 
      name: 'Sunset', 
      gradient: 'from-rose-500 to-pink-500', 
      icon: SunsetIcon,
      description: 'Warm glow'
    },
    { 
      id: 'aurora', 
      name: 'Aurora', 
      gradient: 'from-purple-500 to-indigo-500', 
      icon: Sparkle,
      description: 'Cosmic light'
    },
  ]

  // Auto-save nickname with debounce and validation
  useEffect(() => {
    // Clear existing timer
    if (nicknameTimerRef.current) {
      clearTimeout(nicknameTimerRef.current)
    }

    // Don't auto-save if nickname is empty or unchanged
    if (!nickname.trim() || nickname === initialNickname) {
      setNicknameError('')
      return
    }

    // Validate nickname (basic validation)
    if (nickname.length < 2) {
      setNicknameError('Nickname must be at least 2 characters')
      return
    }

    if (nickname.length > 20) {
      setNicknameError('Nickname must be 20 characters or less')
      return
    }

    // Set debounce timer (wait 1 second after user stops typing)
    nicknameTimerRef.current = setTimeout(async () => {
      if (onUpdateProfile && nickname !== initialNickname) {
        setIsSaving(true)
        setNicknameError('')
        try {
          console.log('Attempting to save nickname:', nickname, 'with theme:', selectedTheme)
          await onUpdateProfile(nickname, selectedTheme)
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 2000)
        } catch (error: any) {
          console.error('Error saving nickname:', error)
          setNicknameError(error.message || 'Failed to save nickname. Please try again.')
        } finally {
          setIsSaving(false)
        }
      }
    }, 1000)

    // Cleanup
    return () => {
      if (nicknameTimerRef.current) {
        clearTimeout(nicknameTimerRef.current)
      }
    }
  }, [nickname, initialNickname, selectedTheme, onUpdateProfile])

  // Auto-save theme immediately when changed
  useEffect(() => {
    const saveTheme = async () => {
      if (onUpdateProfile && selectedTheme !== initialTheme) {
        setIsSaving(true)
        try {
          console.log('Attempting to save theme:', selectedTheme, 'with nickname:', nickname || initialNickname || '')
          await onUpdateProfile(nickname || initialNickname || '', selectedTheme)
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 2000)
        } catch (error: any) {
          console.error('Error saving theme:', error)
          // Don't show error for theme changes, just log it
        } finally {
          setIsSaving(false)
        }
      }
    }

    saveTheme()
  }, [selectedTheme])

  const getLevelTitle = (lvl: number) => {
    if (lvl >= 20) return '🌟 Legendary Scholar'
    if (lvl >= 15) return '👑 Master Reader'
    if (lvl >= 10) return '⚡ Expert Explorer'
    if (lvl >= 5) return '📚 Avid Learner'
    return '✨ Knowledge Seeker'
  }

  const nicknamePoints = 50
  const themePoints = 30

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header - Minimalistic Icon Only */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary blur-2xl opacity-50 animate-pulse" />
            {/* Settings Icon */}
            <div className="relative">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary drop-shadow-2xl"
              >
                <path 
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path 
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Gamified Profile Customization */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-primary to-primary/70 rounded-xl p-3">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Personalize Your Profile
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                        Auto-Save
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Changes save automatically as you type
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">Saved!</p>
                    <p className="text-sm text-muted-foreground">Your changes have been saved automatically.</p>
                  </div>
                </div>
              )}

              {/* Nickname Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="nickname" className="text-base font-semibold">
                    Nickname
                  </Label>
                  <div className="flex items-center gap-2">
                    {isSaving && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Saving...
                      </div>
                    )}
                    <Badge 
                      variant={isNicknameSet ? "default" : "outline"} 
                      className={isNicknameSet ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary/10 border-primary/30"}
                    >
                      {isNicknameSet ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Earned {nicknamePoints} pts</>
                      ) : (
                        <><Zap className="w-3 h-3 mr-1" /> Earn {nicknamePoints} pts</>
                      )}
                    </Badge>
                  </div>
                </div>
                
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Choose a cool nickname..."
                  className={`h-12 border-2 ${nicknameError ? 'border-destructive' : ''}`}
                  maxLength={20}
                />
                {nicknameError ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="font-semibold">⚠️</span> {nicknameError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {nickname.length}/20 characters • {isNicknameSet ? 'Updates automatically!' : 'Type to save and earn points!'}
                  </p>
                )}
              </div>

              <Separator />

              {/* Home Button Theme Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Home Button Theme
                  </Label>
                  <Badge 
                    variant={isThemeCustomized ? "default" : "outline"}
                    className={isThemeCustomized ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary/10 border-primary/30"}
                  >
                    {isThemeCustomized ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Earned {themePoints} pts</>
                    ) : (
                      <><Zap className="w-3 h-3 mr-1" /> Earn {themePoints} pts</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize the color theme of your home feed icon (saves instantly)
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {themes.map((theme) => {
                    const IconComponent = theme.icon
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          selectedTheme === theme.id
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border/50 hover:border-primary/30 bg-card/50'
                        }`}
                      >
                        {/* Theme Preview */}
                        <div className="flex flex-col items-center gap-3">
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center transition-all group-hover:scale-110 shadow-lg`}>
                            <IconComponent className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                            {selectedTheme === theme.id && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-semibold ${
                              selectedTheme === theme.id ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {theme.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {theme.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Theme Preview - Always Show */}
                <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background flex items-center justify-center">
                      <BrandLogo size="sm" theme={selectedTheme as any} showAnimation={false} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Preview</p>
                      <p className="text-xs text-muted-foreground">
                        Your home button will look like this
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Points Summary */}
              {!isNicknameSet || !isThemeCustomized ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        Earn up to {(isNicknameSet ? 0 : nicknamePoints) + (isThemeCustomized ? 0 : themePoints)} more points!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {!isNicknameSet && !isThemeCustomized && `Set your nickname (+${nicknamePoints} pts) and customize your theme (+${themePoints} pts)`}
                        {!isNicknameSet && isThemeCustomized && `Set your nickname to earn ${nicknamePoints} more points`}
                        {isNicknameSet && !isThemeCustomized && `Customize your theme to earn ${themePoints} more points`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-start gap-2">
                    <Crown className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Profile Complete!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You've earned all available profile points ({nicknamePoints + themePoints} total)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and current progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              {userEmail && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                      </div>
                      <p className="text-sm bg-muted/50 px-3 py-2 rounded-lg">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Nickname Display */}
              {initialNickname && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Nickname</span>
                      </div>
                      <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent px-3 py-2 rounded-lg bg-muted/50">
                        {initialNickname}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Level & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-25 group-hover:opacity-50 transition-all" />
                  <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-muted-foreground">Level</span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">
                      {level}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getLevelTitle(level)}
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary/70 rounded-xl blur-lg opacity-25 group-hover:opacity-50 transition-all" />
                  <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Points</span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                      {userPoints || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-2 border-destructive/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="w-5 h-5" />
                Account Actions
              </CardTitle>
              <CardDescription>
                Manage your session and account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Logout</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="gap-2 border-destructive/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="mb-2">
                  Version 1.0.0
                </Badge>
                <p className="text-sm text-muted-foreground">
                  DEWII Magazine &copy; 2025
                </p>
                <p className="text-xs text-muted-foreground">
                  Built with ❤️ for sustainable reading
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hemp'in Trust Center Card */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-emerald-500/10 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
            <a 
              href="https://hempin.org/trust" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                    <div className="relative bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-3">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Hemp'in Trust Center
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                    <CardDescription>
                      Learn about privacy, security, and transparency
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  Your source for who we are, how we handle data, the terms that govern use, and how payments & refunds work.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="font-semibold text-sm mb-1">About Hemp'in</p>
                    <p className="text-xs text-muted-foreground">Who we are and why we exist</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="font-semibold text-sm mb-1">Privacy Policy</p>
                    <p className="text-xs text-muted-foreground">Data we collect and your rights</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="font-semibold text-sm mb-1">Terms of Service</p>
                    <p className="text-xs text-muted-foreground">Rules for using Hemp'in</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="font-semibold text-sm mb-1">Payments & Refunds</p>
                    <p className="text-xs text-muted-foreground">PayPal processing & receipts</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Questions? Email info@globalhempservice.com</span>
                </div>
              </CardContent>
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}