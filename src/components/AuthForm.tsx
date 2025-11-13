import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader } from "./ui/card"
import { BrandLogo } from "./BrandLogo"
import { PlaceholderArt } from "./PlaceholderArt"
import {
  Sparkles,
  BookOpen,
  ExternalLink,
  Orbit,
  Zap,
  Menu,
  ScrollText,
  Command,
  Key,
  X
} from "lucide-react"

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
  const [isSecretMenuOpen, setIsSecretMenuOpen] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!isLogin) {
      nameInputRef.current?.focus()
    } else {
      setName('')
    }
  }, [isLogin])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        setIsSecretMenuOpen((prev) => !prev)
      }

      if (event.key === 'Escape') {
        setIsSecretMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isMacLike =
    typeof window !== 'undefined' && /mac|iphone|ipod|ipad/i.test(window.navigator.userAgent)
  const shortcutLabel = isMacLike ? '⌘⇧M' : 'Ctrl+Shift+M'

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
      <button
        type="button"
        onClick={() => setIsSecretMenuOpen((prev) => !prev)}
        className="group absolute top-6 left-6 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-emerald-400/10 text-white backdrop-blur-md transition-all hover:bg-emerald-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80"
        aria-label="Open hidden signal menu"
        aria-expanded={isSecretMenuOpen}
        aria-haspopup="true"
      >
        <Menu className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100" />
      </button>

      {isSecretMenuOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Hidden signal menu"
          onClick={() => setIsSecretMenuOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-emerald-950/90 via-emerald-900/90 to-emerald-800/90 p-8 text-emerald-100 shadow-[0_40px_120px_-20px_rgba(16,185,129,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.45em] text-emerald-200/70">Hidden console</p>
                <h2 className="text-2xl font-semibold text-white">Signal cache</h2>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Quick links and briefing intel for the orbital press keepers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSecretMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80"
                aria-label="Close hidden menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <a
                href="/about/version-1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSecretMenuOpen(false)}
                className="group/link flex items-center justify-between rounded-2xl border border-emerald-300/30 bg-white/5 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200/70 hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-white shadow-inner">
                    <ScrollText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">Briefing</p>
                    <p className="text-lg font-semibold text-white">Version 1 overview</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-emerald-200/80 transition group-hover/link:text-white" />
              </a>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                <div className="flex items-center gap-2">
                  <Command className="h-3.5 w-3.5" />
                  <span>Menu shortcut</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Key className="h-3.5 w-3.5" />
                  <span>{shortcutLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            showCategoryLabel={false}
          />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-emerald-950/70 to-black/75" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col p-12">
            <div className="flex-1 overflow-y-auto pr-2 sm:pr-4">
              <div className="flex flex-col gap-8 text-left text-white/90 pb-8">
              {/* Logo */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.55em] text-emerald-200/80">
                  <span className="hidden sm:inline">Dewii Orbital Press</span>
                  <span className="sm:hidden">D.O.P</span>
                </div>
                <div
                  className="shrink-0 rounded-full bg-white/10 p-3 hover:p-3.5 transition-all duration-300 cursor-pointer border border-white/20 shadow-[0_20px_45px_rgba(16,185,129,0.35)]"
                  onClick={cycleTheme}
                  title="Rotate the orb to explore each theme skin"
                >
                  <BrandLogo size="lg" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">Version 1 Field Briefing</p>
                <h1 className="text-4xl font-black leading-tight text-white drop-shadow-[0_25px_60px_rgba(13,148,136,0.45)]">
                  The regenerative magazine enters orbit
                </h1>
                <p className="text-base text-emerald-100/85 max-w-xl leading-relaxed">
                  Catch the state of our playable publication&mdash;from Supabase-powered rituals to exploration flows&mdash;and see how tonight&apos;s build invites contributors, readers, and stewards into the Solarpunk commons.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
                <div className="rounded-3xl bg-white/10 border border-white/20 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Rituals
                  </div>
                  <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
                    Seamless onboarding, streaks, and achievements track every luminous visit.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 border border-white/20 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <BookOpen className="w-4 h-4 text-emerald-200" />
                    Story Trails
                  </div>
                  <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
                    Curated feeds, category filters, and shareable deep links chart our narrative cosmos.
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 border border-white/20 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <Orbit className="w-4 h-4 text-emerald-200" />
                    Creator Core
                  </div>
                  <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
                    The editor, admin cockpit, and progress dashboards steward our contributors.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-white/10 via-emerald-500/10 to-cyan-400/20 border border-white/20 backdrop-blur-xl p-6 max-w-2xl shadow-[0_30px_80px_rgba(15,118,110,0.35)]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-xs uppercase tracking-[0.45em] text-emerald-200/90">Read the full dispatch</p>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/60">opens in new tab</span>
                  </div>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Dive into the Version 1 overview to review feature coverage, experience notes, and the design system ingredients guiding our next evolutions.
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full sm:w-auto bg-emerald-400/20 hover:bg-emerald-300/30 text-white border border-white/30 font-semibold tracking-wide shadow-lg"
                  >
                    <a href="/about/version-1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Launch Version 1 overview
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
              </div>
            </div>

            <div className="pt-6 text-white/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] uppercase tracking-[0.35em]">
                <span>Rotate the orb to sample light, dark, and hemp&apos;in palettes</span>
                <span className="text-white/40">Solarpunk login atrium lives to the right &rarr;</span>
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
                      ref={nameInputRef}
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
                    setIsLogin((prev) => !prev)
                    setError('')
                  }}
                  className="w-full p-3 rounded-lg border-2 border-primary/40 bg-card hover:border-primary hover:bg-primary/10 transition-all text-foreground font-medium shadow-sm"
                  aria-pressed={!isLogin}
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