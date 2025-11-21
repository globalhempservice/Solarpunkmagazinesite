import { useState } from 'react'
import { X, Sparkles, Zap, UserPlus, LogIn, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { BrandLogo } from './BrandLogo'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin, onSignup }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState('')

  // Reset mode when initialMode changes
  useState(() => {
    setIsLogin(initialMode === 'login')
  })

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
      onClose() // Close modal on success
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-2 border-border text-card-foreground">
          {/* Hemp texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }} />

          <DialogHeader className="relative">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/30 rounded-full blur-2xl" />
                <div className="relative bg-primary rounded-full p-3 shadow-xl">
                  <BrandLogo size="md" showAnimation={true} />
                </div>
              </div>
            </div>

            <DialogTitle className="text-center text-2xl font-black text-foreground">
              {isLogin ? 'Welcome Back!' : 'Join DEWII'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {isLogin ? 'Sign in to continue your journey' : 'Start earning NADA points today'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 relative mt-4">
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
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              )}
            </div>

            {/* Terms & Marketing - Only for Signup */}
            {!isLogin && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
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

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={marketingOptIn}
                    onCheckedChange={(checked) => setMarketingOptIn(checked as boolean)}
                  />
                  <label htmlFor="marketing" className="text-sm text-muted-foreground leading-tight cursor-pointer">
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
              <div className="p-4 rounded-lg bg-destructive/20 border-2 border-destructive/50">
                <p className="text-sm text-destructive-foreground font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/20 shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </Button>

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-center pt-2">
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
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        },
                        body: JSON.stringify({ email })
                      })

                      const data = await response.json()

                      if (!response.ok) {
                        throw new Error(data.error || 'Failed to send reset email')
                      }

                      setForgotPasswordSuccess(true)
                    } catch (err) {
                      setForgotPasswordError(err instanceof Error ? err.message : 'An error occurred')
                    } finally {
                      setForgotPasswordLoading(false)
                    }
                  }}
                  disabled={forgotPasswordLoading || !email}
                  className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Forgot Password?'}
                </button>
                
                {forgotPasswordSuccess && (
                  <p className="text-sm text-green-500 dark:text-green-400 hempin:text-green-400 mt-2">Magic link sent! Check your email.</p>
                )}
                
                {forgotPasswordError && (
                  <p className="text-sm text-destructive mt-2">{forgotPasswordError}</p>
                )}
              </div>
            )}

            {/* Switch Mode */}
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

            <Button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              variant="outline"
              className="w-full h-12 font-bold"
            >
              {isLogin ? 'Create New Account' : 'Sign In Instead'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
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
            <Button onClick={() => setShowTermsModal(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Marketing Modal */}
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
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowMarketingModal(false)}>Understood</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}