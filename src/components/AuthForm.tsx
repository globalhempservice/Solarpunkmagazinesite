import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { BrandLogo } from "./BrandLogo"
import { PlaceholderArt } from "./PlaceholderArt"
import { Sparkles, BookOpen, Flame, Trophy, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDewiiAnimation, setShowDewiiAnimation] = useState(false)

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

  const getThemeGlow = () => {
    switch (theme) {
      case 'dark':
        return 'from-sky-500 via-purple-500 to-pink-500'
      case 'hempin':
        return 'from-amber-500 via-yellow-500 to-amber-500'
      default:
        return 'from-emerald-500 via-teal-500 to-emerald-500'
    }
  }

  const handleLogoClick = () => {
    // Trigger animations
    setIsAnimating(true)
    setShowDewiiAnimation(true)
    
    // Cycle theme
    const themeOrder: Theme[] = ['light', 'dark', 'hempin']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    applyTheme(themeOrder[nextIndex])
    
    // Reset animations
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
    
    setTimeout(() => {
      setShowDewiiAnimation(false)
    }, 2000)
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            {/* Logo - Navbar Style Button */}
            <button
              onClick={handleLogoClick}
              className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 mb-8"
              aria-label="Change theme"
            >
              {/* Animated glow background */}
              <div className={`absolute -inset-8 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-500 ${isAnimating ? 'opacity-60 animate-pulse' : ''}`} />
              
              {/* Outer ring - matching navbar */}
              <div className={`relative rounded-full p-2 transition-all group-hover:scale-110 ${
                isAnimating
                  ? 'bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 dark:from-sky-400 dark:via-purple-400 dark:to-pink-400 hempin:from-amber-500 hempin:via-yellow-500 hempin:to-amber-500 scale-110 shadow-2xl'
                  : 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm group-hover:from-white/30 group-hover:to-white/20'
              }`}>
                {/* Inner circle */}
                <div className={`rounded-full p-6 transition-all ${
                  isAnimating
                    ? 'bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-pink-500/30 dark:from-sky-400/20 dark:via-purple-400/15 dark:to-pink-400/20 hempin:from-amber-500/30 hempin:via-yellow-500/20 hempin:to-amber-500/30 backdrop-blur-sm'
                    : 'bg-black/20 backdrop-blur-sm'
                }`}>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <BrandLogo size="lg" showAnimation={true} />
                  </div>
                </div>
              </div>
              
              {/* Floating sparkles on animation */}
              {isAnimating && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-white animate-ping" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-white animate-ping" style={{ animationDelay: '150ms' }} />
                </>
              )}
            </button>
            
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
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-2xl" />
          
          {/* Logo above the card - Navbar Style Button */}
          <div className="flex justify-center mb-8 relative">
            <button
              onClick={handleLogoClick}
              className="group relative flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95"
              aria-label="Change theme"
            >
              {/* Animated glow background */}
              <div className={`absolute -inset-8 bg-gradient-to-r ${getThemeGlow()} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${isAnimating ? 'opacity-50 animate-pulse' : ''}`} />
              
              {/* Outer ring - matching navbar */}
              <div className={`relative rounded-full p-2 transition-all group-hover:scale-110 ${
                isAnimating
                  ? 'bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 dark:from-sky-400 dark:via-purple-400 dark:to-pink-400 hempin:from-amber-500 hempin:via-yellow-500 hempin:to-amber-500 scale-110 shadow-2xl'
                  : 'bg-gradient-to-br from-muted/50 to-muted group-hover:from-muted group-hover:to-muted/80'
              }`}>
                {/* Inner circle */}
                <div className={`rounded-full p-6 transition-all ${
                  isAnimating
                    ? 'bg-gradient-to-br from-sky-500/30 via-purple-500/20 to-pink-500/30 dark:from-sky-400/20 dark:via-purple-400/15 dark:to-pink-400/20 hempin:from-amber-500/30 hempin:via-yellow-500/20 hempin:to-amber-500/30 backdrop-blur-sm'
                    : 'bg-background'
                }`}>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <BrandLogo size="lg" showAnimation={true} />
                  </div>
                </div>
              </div>
              
              {/* Floating sparkles on animation */}
              {isAnimating && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-ping" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-primary animate-ping" style={{ animationDelay: '150ms' }} />
                </>
              )}
            </button>
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

      {/* Comic-style "DEWII" Animation */}
      <AnimatePresence>
        {showDewiiAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 12 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
          >
            {/* Comic book style container */}
            <div className="relative">
              {/* Background burst effect */}
              <div className="absolute inset-0 -m-8">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: i * 45 }}
                    animate={{ scale: 1.5, rotate: i * 45 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-t from-amber-400/60 to-transparent"
                    style={{ transformOrigin: 'center' }}
                  />
                ))}
              </div>
              
              {/* Main "DEWII" text */}
              <div className="relative bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-2xl px-8 py-4 border-4 border-foreground shadow-2xl transform rotate-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: 2,
                    repeatType: "reverse"
                  }}
                  className="text-5xl font-black tracking-wider"
                  style={{
                    textShadow: '4px 4px 0px rgba(0,0,0,0.3), -2px -2px 0px rgba(255,255,255,0.5)',
                    WebkitTextStroke: '2px black',
                    color: 'white'
                  }}
                >
                  DEWII
                </motion.div>
                
                {/* Comic sparkles around text */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 60],
                      y: [0, (Math.random() - 0.5) * 60],
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.1,
                      times: [0, 0.5, 1]
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white drop-shadow-lg" style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                    }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}