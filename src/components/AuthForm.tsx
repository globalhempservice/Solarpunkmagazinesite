import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { BrandLogo } from "./BrandLogo"
import { PlaceholderArt } from "./PlaceholderArt"
import { Sparkles, BookOpen, Flame, Trophy, Zap, ExternalLink, UserPlus, LogIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "./ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { projectId, publicAnonKey } from './utils/supabase/info'

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
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
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState('')

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
        await onSignup(email, password, name, acceptedTerms, marketingOptIn)
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
        {/* Left Side - Generative Art with DEWII Branding - HIDDEN ON ALL SCREENS (moved to bottom) */}
        <div className="hidden">
          {/* Content moved below */}
        </div>

        {/* Right Side - Auth Form */}
        <div className="relative lg:col-span-2 max-w-md mx-auto w-full">
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

                {/* Terms & Conditions and Marketing Newsletter - Only for Signup */}
                {!isLogin && (
                  <div className="space-y-3 pt-2">
                    {/* Terms & Conditions */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        required
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-tight cursor-pointer"
                      >
                        I accept the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-primary hover:underline font-medium"
                        >
                          Terms & Conditions
                        </button>
                        {' '}*
                      </label>
                    </div>

                    {/* Marketing Newsletter */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={marketingOptIn}
                        onCheckedChange={(checked) => setMarketingOptIn(checked as boolean)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="marketing"
                        className="text-sm text-muted-foreground leading-tight cursor-pointer"
                      >
                        Subscribe to{' '}
                        <button
                          type="button"
                          onClick={() => setShowMarketingModal(true)}
                          className="text-primary hover:underline font-medium"
                        >
                          Marketing Newsletter
                        </button>
                        {' '}(optional)
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                {/* Main Sign In / Create Account Button */}
                <div className={`relative w-full rounded-xl p-[2px] shadow-lg hover:shadow-xl transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-emerald-500/60 to-teal-500/60'
                    : 'bg-gradient-to-r from-amber-500/60 via-emerald-500/60 to-teal-500/60'
                }`}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full p-4 rounded-xl bg-card overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isLogin
                        ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15'
                        : 'bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15'
                    }`} />
                    
                    {/* Content */}
                    {loading ? (
                      <div className="relative flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                        <span className="font-semibold text-muted-foreground">Please wait...</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center gap-2.5">
                        <div className={`p-2 rounded-lg transition-all group-hover:scale-110 ${
                          isLogin
                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                            : 'bg-gradient-to-br from-amber-500/20 to-emerald-500/20'
                        }`}>
                          {isLogin ? (
                            <Sparkles className={`w-5 h-5 ${
                              isLogin 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-amber-600 dark:text-amber-400'
                            }`} strokeWidth={2.5} />
                          ) : (
                            <Zap className={`w-5 h-5 ${
                              isLogin 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-amber-600 dark:text-amber-400'
                            }`} strokeWidth={2.5} />
                          )}
                        </div>
                        <span className={`font-semibold transition-all ${
                          isLogin
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent'
                            : 'bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 dark:from-amber-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent'
                        }`}>
                          {isLogin ? 'Sign In' : 'Create Account'}
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Forgot Password Link - Only show when in login mode */}
                {isLogin && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          setForgotPasswordError('Please enter your email address first')
                          return
                        }
                        
                        setForgotPasswordError('')
                        setForgotPasswordSuccess(false)
                        setForgotPasswordLoading(true)

                        try {
                          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/auth/reset-password`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email })
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to send reset email')
                          }

                          setForgotPasswordSuccess(true)
                          setTimeout(() => {
                            setForgotPasswordSuccess(false)
                          }, 8000)
                        } catch (err) {
                          setForgotPasswordError(err instanceof Error ? err.message : 'An error occurred')
                        } finally {
                          setForgotPasswordLoading(false)
                        }
                      }}
                      disabled={forgotPasswordLoading || !email}
                      className="text-sm text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {forgotPasswordLoading ? 'Sending magic link...' : 'Forgot Password?'}
                    </button>
                    
                    {forgotPasswordSuccess && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        Magic link sent! Check your email to reset your password.
                      </p>
                    )}
                    
                    {forgotPasswordError && (
                      <p className="text-sm text-destructive mt-2">
                        {forgotPasswordError}
                      </p>
                    )}
                  </div>
                )}

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

                {/* Switch Button (Create New Account / Sign In Instead) */}
                <div className={`relative w-full rounded-xl p-[2px] shadow-lg hover:shadow-xl transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50'
                    : 'bg-gradient-to-r from-emerald-500/50 to-blue-500/50'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                    }}
                    className="group relative w-full p-4 rounded-xl bg-card overflow-hidden transition-all"
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isLogin
                        ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10'
                        : 'bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10'
                    }`} />
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center gap-2.5">
                      <div className={`p-2 rounded-lg transition-all group-hover:scale-110 ${
                        isLogin
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                          : 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20'
                      }`}>
                        {isLogin ? (
                          <UserPlus className={`w-5 h-5 transition-colors ${
                            isLogin 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`} strokeWidth={2.5} />
                        ) : (
                          <LogIn className={`w-5 h-5 transition-colors ${
                            isLogin 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`} strokeWidth={2.5} />
                        )}
                      </div>
                      <span className={`font-semibold transition-all ${
                        isLogin
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent'
                          : 'bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 dark:from-emerald-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent'
                      }`}>
                        {isLogin ? 'Create New Account' : 'Sign In Instead'}
                      </span>
                    </div>
                  </button>
                </div>
              </form>

              {/* Benefits reminder for signup - REMOVED */}
            </CardContent>
          </Card>

          {/* Welcome to DEWII Card - Visible on all screens, below auth form */}
          <Card className="relative w-full border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-purple-500/10 backdrop-blur-xl shadow-2xl mt-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            
            <CardContent className="relative p-8 text-center space-y-6">
              {/* Icon & Title */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleLogoClick}
                  className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all"
                  aria-label="Change theme"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 animate-pulse transition-all" 
                       style={{ animationDuration: '3s' }} />
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${isAnimating ? 'scale-110 shadow-2xl' : ''}`}>
                    <BrandLogo size="md" showAnimation={true} />
                  </div>
                </button>
                
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    Welcome to DEWII
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Digital Eco Wisdom & Innovation Insights
                  </p>
                </div>
              </div>

              {/* Decorative divider */}
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />

              {/* Exciting description */}
              <p className="text-base text-foreground/80 max-w-lg mx-auto leading-relaxed">
                Your gamified magazine for sustainability, technology, and a brighter future. Discover curated articles, earn achievements, and level up as you explore!
              </p>

              {/* Feature badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all group-hover:scale-105">
                    <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Curated Content</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 transition-all group-hover:scale-105">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">Reading Streaks</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 transition-all group-hover:scale-105">
                    <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">35 Achievements</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 transition-all group-hover:scale-105">
                    <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Earn & Level Up</p>
                  </div>
                </div>
              </div>

              {/* Call to action hint */}
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? (
                    <>Sign in above to continue your journey</>
                  ) : (
                    <>Create your account above and start your adventure</>
                  )}
                </p>
              </div>
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

      {/* Terms & Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Terms & Conditions
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-4 space-y-3 text-left">
                <div>
                  <strong>DEWII</strong> is the magazine feed branch of{' '}
                  <span className="text-primary font-semibold">Hemp'in.org</span>, dedicated to bringing you curated content on sustainability, technology, and innovation.
                </div>
                <div>
                  By creating an account, you agree to our content guidelines and community standards that promote respectful engagement and knowledge sharing.
                </div>
                <a 
                  href="https://hempin.org/trust" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  Visit Trust Center
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowTermsModal(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Marketing Newsletter Modal */}
      <Dialog open={showMarketingModal} onOpenChange={setShowMarketingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Marketing Newsletter
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-4 space-y-3 text-left">
                <div>
                  Our <strong>Marketing Newsletter</strong> is a monthly digest featuring:
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-sm">
                  <li>Featured articles and trending topics</li>
                  <li>Community highlights and achievements</li>
                  <li>Platform updates and new features</li>
                  <li>Exclusive sustainability insights</li>
                </ul>
                <div className="text-sm text-muted-foreground">
                  You can manage your newsletter preferences and notification settings anytime in your account settings.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowMarketingModal(false)}>
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}