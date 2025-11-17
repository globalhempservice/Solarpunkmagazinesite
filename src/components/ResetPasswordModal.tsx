import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '../utils/supabase/client'

interface ResetPasswordModalProps {
  accessToken: string
  onSuccess: () => void
  onClose: () => void
}

export function ResetPasswordModal({ accessToken, onSuccess, onClose }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Update the user's password using the access token
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      // Success! The user is now logged in with the new password
      onSuccess()
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-2 border-primary/40 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            Set New Password
          </CardTitle>
          <CardDescription>
            Welcome back! Please set a new password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 12 ? 'bg-emerald-500' : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-muted'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {newPassword.length < 8 && 'Weak'}
                  {newPassword.length >= 8 && newPassword.length < 12 && 'Good'}
                  {newPassword.length >= 12 && !/[A-Z]/.test(newPassword) && 'Good'}
                  {newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && 'Strong'}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Set Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
