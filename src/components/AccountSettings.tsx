import { LogOut, Mail, Shield, Trash2, Lock, Eye, EyeOff, AlertCircle, ExternalLink, CheckCircle2, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { useState, useEffect } from 'react'
import { projectId } from '../utils/supabase/info'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'

interface AccountSettingsProps {
  userId: string | null
  userEmail?: string
  marketingOptIn?: boolean
  marketNewsletterOptIn?: boolean
  accessToken?: string
  onLogout: () => void
  onUpdateMarketingPreference?: (marketingOptIn: boolean) => Promise<void>
  onUpdateMarketNewsletterPreference?: (marketNewsletterOptIn: boolean) => Promise<void>
}

export function AccountSettings({
  userId,
  userEmail,
  marketingOptIn: initialMarketingOptIn,
  marketNewsletterOptIn: initialMarketNewsletterOptIn,
  accessToken,
  onLogout,
  onUpdateMarketingPreference,
  onUpdateMarketNewsletterPreference,
}: AccountSettingsProps) {
  // Newsletter preferences
  const [marketingNewsletter, setMarketingNewsletter] = useState(initialMarketingOptIn || false)
  const [marketNewsletter, setMarketNewsletter] = useState(initialMarketNewsletterOptIn || false)

  // Messages preferences
  const [allowSearch, setAllowSearch] = useState(true)
  const [allowSearchSaving, setAllowSearchSaving] = useState(false)

  // Change password modal
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)

  // Delete account modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState('')

  // Fetch messages preferences on mount
  useEffect(() => {
    if (!accessToken) return
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/preferences`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAllowSearch(data.allow_search ?? true) })
      .catch(() => {})
  }, [accessToken])

  // Auto-save allow_search preference when changed
  const handleAllowSearchChange = (value: boolean) => {
    setAllowSearch(value)
    setAllowSearchSaving(true)
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/messages/preferences`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ allow_search: value })
    })
      .catch(() => { setAllowSearch(!value) }) // revert on error
      .finally(() => setAllowSearchSaving(false))
  }

  // Auto-save marketing newsletter preference when changed
  useEffect(() => {
    if (marketingNewsletter === initialMarketingOptIn) return
    onUpdateMarketingPreference?.(marketingNewsletter).catch(() => {
      setMarketingNewsletter(initialMarketingOptIn || false)
    })
  }, [marketingNewsletter])

  // Auto-save market newsletter preference when changed
  useEffect(() => {
    if (marketNewsletter === initialMarketNewsletterOptIn) return
    onUpdateMarketNewsletterPreference?.(marketNewsletter).catch(() => {
      setMarketNewsletter(initialMarketNewsletterOptIn || false)
    })
  }, [marketNewsletter])

  const handleChangePassword = async () => {
    setChangePasswordError('')
    setChangePasswordSuccess(false)

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setChangePasswordError('Please fill in all fields')
      return
    }
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('New passwords do not match')
      return
    }

    setChangePasswordLoading(true)
    try {
      const { createClient } = await import('../utils/supabase/client')
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || '',
        password: oldPassword,
      })
      if (signInError) throw new Error('Current password is incorrect')

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to change password')

      setChangePasswordSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => {
        setShowChangePasswordModal(false)
        setChangePasswordSuccess(false)
      }, 2000)
    } catch (err) {
      setChangePasswordError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteAccountError('')
    if (deleteConfirmText !== 'FINISH DEWII') {
      setDeleteAccountError('Please type "FINISH DEWII" exactly to confirm')
      return
    }
    setDeleteAccountLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/auth/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete account')
      onLogout()
    } catch (err) {
      setDeleteAccountError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleteAccountLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">

        {/* Newsletter Preferences */}
        <Card className="border-2 border-blue-500/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Newsletter Preferences
            </CardTitle>
            <CardDescription>
              Manage your email subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex-1 pr-4">
                <h4 className="font-semibold text-foreground mb-1">Marketing Newsletter</h4>
                <p className="text-sm text-muted-foreground">
                  Monthly digest with featured articles, community highlights, and platform updates
                </p>
              </div>
              <Switch
                checked={marketingNewsletter}
                onCheckedChange={setMarketingNewsletter}
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex-1 pr-4">
                <h4 className="font-semibold text-foreground mb-1">Market Newsletter</h4>
                <p className="text-sm text-muted-foreground">
                  Weekly updates from Hemp'in Market with new listings, vendor spotlights, and deals
                </p>
              </div>
              <Switch
                checked={marketNewsletter}
                onCheckedChange={setMarketNewsletter}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages Preferences */}
        <Card className="border-2 border-violet-500/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-violet-500" />
              Messages Preferences
            </CardTitle>
            <CardDescription>
              Control how others can find and contact you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex-1 pr-4">
                <h4 className="font-semibold text-foreground mb-1">Allow others to find me</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, your name appears in user search results so others can message you directly
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {allowSearchSaving && (
                  <div className="w-4 h-4 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
                )}
                <Switch
                  checked={allowSearch}
                  onCheckedChange={handleAllowSearchChange}
                  disabled={allowSearchSaving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="border-2 border-destructive/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="w-5 h-5" />
              Account
            </CardTitle>
            <CardDescription>
              {userEmail && <span className="text-foreground font-medium">{userEmail}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Change Password */}
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Change Password</h4>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChangePasswordModal(true)}
                className="gap-2 border-border/50 hover:bg-muted hover:border-primary transition-all"
              >
                <Lock className="w-4 h-4" />
                Change
              </Button>
            </div>

            <Separator />

            {/* Logout */}
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 transition-all">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Logout</h4>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
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

            <Separator />

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all">
              <div>
                <h4 className="font-semibold text-destructive mb-1">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccountModal(true)}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hemp'in Trust Center */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-emerald-500/10 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
          <a href="https://hempin.org/trust" target="_blank" rel="noopener noreferrer" className="block">
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
                  <CardDescription>Privacy, security, and transparency</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
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

        {/* App Info */}
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="mb-2">Version 1.0.0</Badge>
              <p className="text-sm text-muted-foreground">DEWII Magazine &copy; 2025</p>
              <p className="text-xs text-muted-foreground">Built with ❤️ for sustainable reading</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {changePasswordSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">Password Changed!</p>
                  <p className="text-sm text-muted-foreground mt-1">Your password has been successfully updated.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {changePasswordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{changePasswordError}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            {!changePasswordSuccess && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowChangePasswordModal(false)
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmNewPassword('')
                    setChangePasswordError('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={changePasswordLoading} className="gap-2">
                  {changePasswordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-destructive">All your data will be permanently deleted:</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• All your points and achievements</li>
                <li>• Your complete reading history</li>
                <li>• Your profile and preferences</li>
                <li>• Your email address from our database</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3 ml-7">
                Deletion may take up to 24 hours to propagate across all servers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirm">
                Type <span className="font-mono font-bold">FINISH DEWII</span> to confirm:
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="FINISH DEWII"
                className="font-mono"
              />
            </div>

            {deleteAccountError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{deleteAccountError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteAccountModal(false)
                setDeleteConfirmText('')
                setDeleteAccountError('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading || deleteConfirmText !== 'FINISH DEWII'}
              className="gap-2"
            >
              {deleteAccountLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirm Deletion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
