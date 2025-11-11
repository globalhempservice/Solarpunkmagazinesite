import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { BrandLogo } from "./BrandLogo"
import { Sparkles, BookOpen, Flame, Trophy, Zap } from "lucide-react"

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string) => Promise<void>
}

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8 px-8">
          {/* Logo & Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" />
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  DEWII
                </h1>
                <p className="text-muted-foreground">Digital Eco Wisdom & Innovation Insights</p>
              </div>
            </div>
            
            <p className="text-xl text-foreground/80">
              Your gamified eco-futurist magazine for sustainable knowledge and green innovation
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border-2 border-emerald-500/30">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Curated Articles</h3>
                <p className="text-sm text-muted-foreground">Discover engaging stories about renewable energy, sustainable tech, and climate action</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border-2 border-orange-500/30">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-red-500">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Reading Streaks</h3>
                <p className="text-sm text-muted-foreground">Build daily reading habits and maintain your streak to unlock special rewards</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border-2 border-amber-500/30">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Achievements</h3>
                <p className="text-sm text-muted-foreground">Earn points, unlock badges, and level up your knowledge journey</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border-2 border-purple-500/30">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Rich Media</h3>
                <p className="text-sm text-muted-foreground">Experience articles with YouTube videos, audio files, and stunning imagery</p>
              </div>
            </div>
          </div>

          {/* Stats preview */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">100+</div>
              <div className="text-xs text-muted-foreground">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">50+</div>
              <div className="text-xs text-muted-foreground">Active Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">15+</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-2xl" />
          
          {/* Logo above the card */}
          <div className="flex justify-center mb-8">
            <BrandLogo size="xl" />
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