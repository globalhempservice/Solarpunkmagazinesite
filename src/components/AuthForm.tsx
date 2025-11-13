import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { BrandLogo } from "./BrandLogo"
import { PlaceholderArt } from "./PlaceholderArt"
import { Sparkles, BookOpen, Flame, Trophy, Zap, ExternalLink } from "lucide-react"

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string) => Promise<void>
}

type Theme = 'light' | 'dark' | 'hempin'

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<Theme>('light')

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'hempin'].includes(savedTheme)) {
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'hempin')
    
    // Apply new theme class
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme)
    }
  }

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'hempin']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    applyTheme(themeOrder[nextIndex])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await onLogin(email, password)
      } else {
        await onSignup(email, password, name)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Generative Art with DEWII Branding */}
        <div className="hidden lg:block relative h-[600px] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
          {/* Generative Art Background */}
          <PlaceholderArt
            articleId="dewii-welcome"
            category="innovation"
            title="Digital Eco Wisdom Innovation Insights Magazine"
            className="absolute inset-0 w-full h-full"
            useCategoryArt={true}
          />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-12">
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-8 transform hover:scale-110 transition-transform duration-300 cursor-pointer" onClick={cycleTheme}>
                <BrandLogo size="xl" />
              </div>

              {/* Brand Name */}
              <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                DEWII
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-white/90 mb-8 max-w-md leading-relaxed drop-shadow-lg">
                Digital Eco Wisdom & Innovation Insights
              </p>

              {/* Decorative divider */}
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mb-8 rounded-full" />

              {/* Tagline */}
              <p className="text-lg text-white/80 max-w-sm leading-relaxed">
                Your gamified magazine for sustainability, technology, and a brighter future
              </p>

              {/* Floating badges */}
              <div className="mt-12 flex flex-wrap gap-3 justify-center">
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg">
                  🌱 Eco-Focused
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg">
                  🎮 Gamified
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg">
                  📚 Knowledge
                </div>
              </div>
            </div>

            {/* About version overview */}
            <div className="mt-10 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-xl">
              <div className="flex items-start gap-4 text-left">
                <div className="p-3 rounded-full bg-emerald-400/20 border border-emerald-200/40">
                  <BookOpen className="w-6 h-6 text-emerald-100" />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Version 1 Overview</p>
                    <h2 className="text-2xl font-semibold text-white">See what's inside DEWII today</h2>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Explore the current feature set, gamified experience, and infrastructure powering our solar-punk magazine.
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-white/15 hover:bg-white/25 border border-white/30 text-white shadow-lg"
                  >
                    <a href="/about/version-1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Read the Version 1 overview
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-2xl" />
          
          {/* Logo above the card - clickable to cycle themes */}
          <div className="flex justify-center mb-8">
            <BrandLogo size="xl" onClick={cycleTheme} />
          </div>
          
          <Card className="relative w-full border-2 border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Removed mobile logo and social proof */}
            </CardHeader>
            
            <CardContent className="pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required={!isLogin}
                      className="h-11 border-2 border-muted focus-visible:border-primary transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 border-2 border-muted focus-visible:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 border-2 border-muted focus-visible:border-primary transition-colors"
                  />
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  )}
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Create Account
                        </>
                      )}
                    </div>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">
                      {isLogin ? 'New to DEWII?' : 'Already a member?'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                  }}
                  className="w-full p-3 rounded-lg border-2 border-primary/40 bg-card hover:border-primary hover:bg-primary/10 transition-all text-foreground font-medium shadow-sm"
                >
                  {isLogin ? '✨ Create New Account' : '🌱 Sign In Instead'}
                </button>
              </form>

              {/* Benefits reminder for signup */}
              {!isLogin && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground mb-3">What you'll get:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-500/30">
                      📚 Unlimited Reading
                    </div>
                    <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs border border-orange-500/30">
                      🔥 Streak Tracking
                    </div>
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs border border-purple-500/30">
                      🏆 Achievements
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs border border-amber-500/30">
                      ⚡ Level Up
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}