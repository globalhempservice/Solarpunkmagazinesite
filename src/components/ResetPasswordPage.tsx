import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { BrandLogo } from './BrandLogo'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [validatingToken, setValidatingToken] = useState(true)

  useEffect(() => {
    // Extract access token from URL hash
    // Supabase sends the token as: #access_token=xxx&...
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1)) // Remove the # and parse
    const token = params.get('access_token')
    
    if (token) {
      setAccessToken(token)
      setValidatingToken(false)
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.')
      setValidatingToken(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!accessToken) {
      setError('Invalid or expired reset link')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      
      // Redirect to sign-in page after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-2xl" />
        
        {/* Logo above the card */}
        <div className="flex justify-center mb-8 relative">
          <div className="relative rounded-full p-2 bg-gradient-to-br from-muted/50 to-muted">
            <div className="rounded-full p-6 bg-background">
              <div className="w-16 h-16 flex items-center justify-center">
                <BrandLogo size="lg" showAnimation={true} />
              </div>
            </div>
          </div>
        </div>
        
        <Card className="relative w-full border-2 border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            {validatingToken ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
              </div>
            ) : success ? (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">Password Reset Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been updated successfully.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Redirecting you to sign in...
                    </p>
                  </div>
                </div>
              </div>
            ) : !accessToken ? (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 rounded-full bg-destructive/20">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">Invalid Reset Link</h3>
                    <p className="text-sm text-muted-foreground">
                      This password reset link is invalid or has expired.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please request a new password reset from the sign-in page.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/')}
                    className="mt-4"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="h-11 pr-10 border-2 border-muted focus-visible:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="h-11 pr-10 border-2 border-muted focus-visible:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="relative w-full rounded-xl p-[2px] shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-emerald-500/60 to-teal-500/60">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full p-4 rounded-xl bg-card overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15" />
                    
                    {/* Content */}
                    {loading ? (
                      <div className="relative flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="font-semibold text-muted-foreground">Resetting password...</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center gap-2.5">
                        <div className="p-2 rounded-lg transition-all group-hover:scale-110 bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        </div>
                        <span className="font-semibold transition-all bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                          Reset Password
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Back to Sign In */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="relative w-full border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-purple-500/10 backdrop-blur-xl shadow-2xl mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{' '}
              <a href="mailto:support@hempin.org" className="text-primary hover:underline font-medium">
                support@hempin.org
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
