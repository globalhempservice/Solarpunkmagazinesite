import { useState, useEffect } from 'react'
import { Award, Plus, Shield, CheckCircle, Clock, X, AlertCircle, Sparkles, Trophy, Star, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80`

interface OrganizationBadge {
  id: string
  companyId: string
  badgeType: string
  name: string
  description: string | null
  icon: string | null
  evidenceUrl: string | null
  notes: string | null
  verified: boolean
  verifiedBy: string | null
  verifiedAt: string | null
  verificationNotes: string | null
  earnedAt: string
  issuedByAssociationId: string | null
}

interface OrganizationBadgesTabProps {
  companyId: string
  companyName: string
  currentUserId: string | null
  isOwner: boolean
  userRole: 'owner' | 'admin' | 'member' | null
  canManageBadges: boolean
}

// Badge type definitions
const BADGE_TYPES = [
  { value: 'verified_hemp_business', label: 'Verified Hemp Business', icon: <CheckCircle className="w-5 h-5" />, color: 'emerald' },
  { value: 'association_member', label: 'Industry Association Member', icon: <Shield className="w-5 h-5" />, color: 'blue' },
  { value: 'sustainability_certified', label: 'Sustainability Certified', icon: <Sparkles className="w-5 h-5" />, color: 'green' },
  { value: 'quality_assured', label: 'Quality Assured', icon: <Star className="w-5 h-5" />, color: 'amber' },
  { value: 'organic_certified', label: 'Organic Certified', icon: <Trophy className="w-5 h-5" />, color: 'purple' },
  { value: 'founding_member', label: 'DEWII Founding Member', icon: <Crown className="w-5 h-5" />, color: 'gold' },
  { value: 'verified_supplier', label: 'Verified Supplier', icon: <Award className="w-5 h-5" />, color: 'indigo' },
  { value: 'community_leader', label: 'Community Leader', icon: <Sparkles className="w-5 h-5" />, color: 'pink' }
]

export default function OrganizationBadgesTab({
  companyId,
  companyName,
  currentUserId,
  isOwner,
  userRole,
  canManageBadges
}: OrganizationBadgesTabProps) {
  const [badges, setBadges] = useState<OrganizationBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  
  // Request form state
  const [requestBadgeType, setRequestBadgeType] = useState('')
  const [requestName, setRequestName] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestEvidenceUrl, setRequestEvidenceUrl] = useState('')
  const [requestNotes, setRequestNotes] = useState('')
  const [requesting, setRequesting] = useState(false)

  const supabase = createClient(publicAnonKey)

  const getFreshToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  useEffect(() => {
    fetchBadges()
  }, [companyId])

  const fetchBadges = async () => {
    try {
      const url = `${serverUrl}/organizations/${companyId}/badges`
      console.log('🏅 Fetching organization badges from:', url)

      const token = await getFreshToken()
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token || publicAnonKey}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Badges fetched:', data)
        setBadges(data.badges || [])
      } else {
        const error = await response.json()
        console.error('❌ Error fetching badges:', error)
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestBadge = async () => {
    if (!requestBadgeType || !requestName.trim()) {
      alert('Please fill in badge type and name')
      return
    }

    setRequesting(true)
    try {
      const token = await getFreshToken()
      
      const response = await fetch(`${serverUrl}/organizations/${companyId}/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          badgeType: requestBadgeType,
          name: requestName,
          description: requestDescription || null,
          icon: getBadgeIcon(requestBadgeType),
          evidenceUrl: requestEvidenceUrl || null,
          notes: requestNotes || null
        })
      })

      if (response.ok) {
        alert('✅ Badge request submitted! Pending admin verification.')
        setShowRequestModal(false)
        setRequestBadgeType('')
        setRequestName('')
        setRequestDescription('')
        setRequestEvidenceUrl('')
        setRequestNotes('')
        fetchBadges()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to request badge')
      }
    } catch (error) {
      console.error('Error requesting badge:', error)
      alert('Failed to request badge')
    } finally {
      setRequesting(false)
    }
  }

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Remove this badge? This action cannot be undone.')) return

    try {
      const token = await getFreshToken()

      const response = await fetch(
        `${serverUrl}/organizations/${companyId}/badges/${badgeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        alert('✅ Badge removed')
        fetchBadges()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove badge')
      }
    } catch (error) {
      console.error('Error removing badge:', error)
      alert('Failed to remove badge')
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    return badge?.icon || <Award className="w-5 h-5" />
  }

  const getBadgeColor = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    const color = badge?.color || 'emerald'
    
    return {
      bg: `bg-${color}-500/20`,
      text: `text-${color}-300`,
      border: `border-${color}-500/40`
    }
  }

  const getBadgeLabel = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    return badge?.label || badgeType
  }

  const canManage = isOwner || userRole === 'admin' || canManageBadges
  const verifiedBadges = badges.filter(b => b.verified)
  const pendingBadges = badges.filter(b => !b.verified)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-emerald-400 animate-pulse">Loading badges...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Request Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg text-white">Organization Badges</h3>
          <p className="text-sm text-emerald-200/60">
            Showcase your organization's credentials and achievements
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setShowRequestModal(true)}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            Request Badge
          </Button>
        )}
      </div>

      {/* Verified Badges */}
      {verifiedBadges.length > 0 && (
        <div>
          <h4 className="font-black text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Verified Badges ({verifiedBadges.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {verifiedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/30 border-2 border-emerald-400/40 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-400/60 transition-all"
                >
                  {/* Verified Checkmark */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-emerald-500 text-white rounded-full p-1.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                      {getBadgeIcon(badge.badgeType)}
                    </div>
                    <div className="flex-1 pr-10">
                      <h5 className="font-black text-white mb-1">{badge.name}</h5>
                      <p className="text-xs text-emerald-300/70 mb-2">{getBadgeLabel(badge.badgeType)}</p>
                      {badge.description && (
                        <p className="text-sm text-emerald-200/70 mb-2">{badge.description}</p>
                      )}
                      <p className="text-xs text-emerald-200/50">
                        Verified {badge.verifiedAt ? new Date(badge.verifiedAt).toLocaleDateString() : 'recently'}
                      </p>
                    </div>
                  </div>

                  {/* Delete button (only for managers) */}
                  {canManage && (
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="absolute bottom-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Pending Badges */}
      {pendingBadges.length > 0 && (
        <div>
          <h4 className="font-black text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Verification ({pendingBadges.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {pendingBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-amber-400/50 transition-all"
                >
                  {/* Pending Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-400/30">
                      {getBadgeIcon(badge.badgeType)}
                    </div>
                    <div className="flex-1 pr-20">
                      <h5 className="font-black text-white mb-1">{badge.name}</h5>
                      <p className="text-xs text-amber-300/70 mb-2">{getBadgeLabel(badge.badgeType)}</p>
                      {badge.description && (
                        <p className="text-sm text-amber-200/70 mb-2">{badge.description}</p>
                      )}
                      {badge.evidenceUrl && (
                        <a
                          href={badge.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                        >
                          View Evidence →
                        </a>
                      )}
                      <p className="text-xs text-amber-200/50 mt-2">
                        Submitted {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Delete button */}
                  {canManage && (
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="absolute bottom-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
          <h3 className="font-black mb-2 text-white">No Badges Yet</h3>
          <p className="text-sm text-emerald-200/60 mb-4 max-w-md mx-auto">
            Start building your organization's credibility by requesting verification badges
          </p>
          {canManage && (
            <Button
              onClick={() => setShowRequestModal(true)}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              <Plus className="w-4 h-4" />
              Request First Badge
            </Button>
          )}
        </div>
      )}

      {/* Request Badge Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="bg-emerald-950 border-emerald-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Request Organization Badge</DialogTitle>
            <DialogDescription className="text-emerald-200/70">
              Submit a badge request for {companyName}. Our team will review and verify your submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Badge Type */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Badge Type *
              </label>
              <Select value={requestBadgeType} onValueChange={setRequestBadgeType}>
                <SelectTrigger className="w-full bg-emerald-900/30 border-emerald-500/30 text-white">
                  <SelectValue placeholder="Choose a badge type..." />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-500/30 text-white max-h-64">
                  {BADGE_TYPES.map((badge) => (
                    <SelectItem key={badge.value} value={badge.value}>
                      <div className="flex items-center gap-2">
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Badge Name */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Badge Display Name *
              </label>
              <input
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="e.g., USDA Organic Certified Hemp"
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Description (Optional)
              </label>
              <textarea
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="Provide details about this certification or achievement"
                rows={3}
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            {/* Evidence URL */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Evidence URL (Optional)
              </label>
              <input
                type="url"
                value={requestEvidenceUrl}
                onChange={(e) => setRequestEvidenceUrl(e.target.value)}
                placeholder="https://example.com/certificate.pdf"
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none"
              />
              <p className="text-xs text-emerald-200/50 mt-1">
                Link to certificate, license, or verification document
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Additional Notes (Optional)
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Any additional information for the verification team"
                rows={2}
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            {/* Info Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-200/80">
                <strong>Note:</strong> Badge requests are reviewed by DEWII admins. Verified badges will appear on your organization profile and in the Hemp Atlas.
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/30"
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestBadge}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                disabled={requesting}
              >
                {requesting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
