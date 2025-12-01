import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  ExternalLink, 
  Building2,
  FileText,
  AlertCircle,
  Sparkles,
  Trophy,
  Star,
  Crown,
  Verified,
  Search,
  Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog'
import { toast } from 'sonner@2.0.3'

interface OrganizationBadgeRequest {
  id: string
  companyId: string
  companyName: string
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

interface BadgeVerificationTabProps {
  serverUrl: string
  accessToken: string
}

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

export function BadgeVerificationTab({ serverUrl, accessToken }: BadgeVerificationTabProps) {
  const [badges, setBadges] = useState<OrganizationBadgeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState<OrganizationBadgeRequest | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAllBadges()
  }, [])

  const fetchAllBadges = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${serverUrl}/admin/badges/all`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fetched all badges:', data)
        setBadges(data.badges || [])
      } else {
        const error = await response.json()
        console.error('❌ Error fetching badges:', error)
        toast.error('Failed to load badge requests')
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
      toast.error('Failed to load badge requests')
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (badge: OrganizationBadgeRequest) => {
    setSelectedBadge(badge)
    setVerificationNotes(badge.verificationNotes || '')
    setShowReviewModal(true)
  }

  const handleApproveBadge = async () => {
    if (!selectedBadge) return

    setProcessing(true)
    try {
      const response = await fetch(
        `${serverUrl}/admin/badges/${selectedBadge.id}/verify`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            verified: true,
            verificationNotes: verificationNotes || null
          })
        }
      )

      if (response.ok) {
        toast.success(`✅ Badge "${selectedBadge.name}" approved!`)
        setShowReviewModal(false)
        setSelectedBadge(null)
        setVerificationNotes('')
        fetchAllBadges()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to approve badge')
      }
    } catch (error) {
      console.error('Error approving badge:', error)
      toast.error('Failed to approve badge')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectBadge = async () => {
    if (!selectedBadge) return
    
    if (!confirm(`Reject badge request "${selectedBadge.name}"? This will permanently delete the request.`)) {
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(
        `${serverUrl}/admin/badges/${selectedBadge.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        toast.success(`❌ Badge request rejected`)
        setShowReviewModal(false)
        setSelectedBadge(null)
        setVerificationNotes('')
        fetchAllBadges()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject badge')
      }
    } catch (error) {
      console.error('Error rejecting badge:', error)
      toast.error('Failed to reject badge')
    } finally {
      setProcessing(false)
    }
  }

  const handleRevokeBadge = async (badge: OrganizationBadgeRequest) => {
    if (!confirm(`Revoke verified badge "${badge.name}"? This will remove it from the organization.`)) {
      return
    }

    try {
      const response = await fetch(
        `${serverUrl}/admin/badges/${badge.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        toast.success(`🗑️ Badge revoked`)
        fetchAllBadges()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to revoke badge')
      }
    } catch (error) {
      console.error('Error revoking badge:', error)
      toast.error('Failed to revoke badge')
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    return badge?.icon || <Award className="w-5 h-5" />
  }

  const getBadgeColor = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    return badge?.color || 'emerald'
  }

  const getBadgeLabel = (badgeType: string) => {
    const badge = BADGE_TYPES.find(b => b.value === badgeType)
    return badge?.label || badgeType
  }

  const filteredBadges = badges.filter(badge => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !badge.verified :
      filter === 'verified' ? badge.verified : true

    const matchesSearch = 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBadgeLabel(badge.badgeType).toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const pendingCount = badges.filter(b => !b.verified).length
  const verifiedCount = badges.filter(b => b.verified).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-emerald-400 animate-pulse text-lg">Loading badge verification system...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{pendingCount}</CardTitle>
                <CardDescription>Pending Review</CardDescription>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{verifiedCount}</CardTitle>
                <CardDescription>Verified</CardDescription>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{badges.length}</CardTitle>
                <CardDescription>Total Requests</CardDescription>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search badges, companies, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                All ({badges.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Pending ({pendingCount})
              </Button>
              <Button
                variant={filter === 'verified' ? 'default' : 'outline'}
                onClick={() => setFilter('verified')}
                className="gap-2"
              >
                <Verified className="w-4 h-4" />
                Verified ({verifiedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredBadges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No badges match your search' : 'No badge requests found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBadges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`hover:shadow-lg transition-all ${
                  badge.verified 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Badge Icon */}
                      <div className={`p-4 rounded-xl border-2 ${
                        badge.verified 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {getBadgeIcon(badge.badgeType)}
                      </div>

                      {/* Badge Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-black text-lg flex items-center gap-2">
                              {badge.name}
                              {badge.verified && (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getBadgeLabel(badge.badgeType)}
                            </p>
                          </div>
                          <Badge className={`${
                            badge.verified 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {badge.verified ? (
                              <><Verified className="w-3 h-3 mr-1" /> Verified</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span className="font-semibold">{badge.companyName}</span>
                          </div>

                          {badge.description && (
                            <p className="text-muted-foreground">{badge.description}</p>
                          )}

                          {badge.evidenceUrl && (
                            <a
                              href={badge.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Evidence
                            </a>
                          )}

                          {badge.notes && (
                            <div className="bg-muted/50 rounded-lg p-3 mt-2">
                              <p className="text-xs text-muted-foreground mb-1 font-semibold">Applicant Notes:</p>
                              <p className="text-sm">{badge.notes}</p>
                            </div>
                          )}

                          {badge.verificationNotes && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-2">
                              <p className="text-xs text-emerald-400 mb-1 font-semibold flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Verification Notes:
                              </p>
                              <p className="text-sm text-emerald-200">{badge.verificationNotes}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                            <span>Requested: {new Date(badge.earnedAt).toLocaleDateString()}</span>
                            {badge.verifiedAt && (
                              <span>Verified: {new Date(badge.verifiedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          {!badge.verified ? (
                            <>
                              <Button
                                onClick={() => openReviewModal(badge)}
                                className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Review & Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedBadge(badge)
                                  setShowReviewModal(true)
                                }}
                                variant="outline"
                                className="gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Details
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleRevokeBadge(badge)}
                              variant="outline"
                              className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4" />
                              Revoke Badge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              Badge Verification Review
            </DialogTitle>
            <DialogDescription>
              Review and verify this badge request for {selectedBadge?.companyName}
            </DialogDescription>
          </DialogHeader>

          {selectedBadge && (
            <div className="space-y-6">
              {/* Badge Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Badge Name</p>
                  <p className="font-black text-lg">{selectedBadge.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Badge Type</p>
                  <p className="font-semibold">{getBadgeLabel(selectedBadge.badgeType)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Organization</p>
                  <p className="font-semibold">{selectedBadge.companyName}</p>
                </div>
                {selectedBadge.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p>{selectedBadge.description}</p>
                  </div>
                )}
                {selectedBadge.evidenceUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Evidence URL</p>
                    <a
                      href={selectedBadge.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {selectedBadge.evidenceUrl}
                    </a>
                  </div>
                )}
                {selectedBadge.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Applicant Notes</p>
                    <p className="text-sm bg-background rounded-lg p-3">{selectedBadge.notes}</p>
                  </div>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about this verification (visible to organization owners)"
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Warning Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-amber-400">Important:</strong> Approving this badge will make it visible on the organization's profile and in the Hemp Atlas. Make sure all evidence is legitimate and accurate.
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedBadge(null)
                    setVerificationNotes('')
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectBadge}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={handleApproveBadge}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={processing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Approving...' : 'Approve Badge'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
