import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Building2, Loader2, ArrowRight, Plus, Search, X } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'

interface OrgRelationshipsAdminViewProps {
  serverUrl: string
  accessToken: string | null
}

interface OrgRelationship {
  id: string
  organization_id: string
  related_organization_id: string
  relationship_type: string
  status: 'pending' | 'verified' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
  organization: {
    id: string
    name: string
    logo_url?: string
    location?: string
    country?: string
  }
  related_organization: {
    id: string
    name: string
    logo_url?: string
    location?: string
    country?: string
  }
}

const RELATIONSHIP_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  headquarter_of: { label: 'Headquarter Of', icon: '🏢', color: 'blue' },
  subsidiary_of: { label: 'Subsidiary Of', icon: '🏛️', color: 'indigo' },
  parent_company: { label: 'Parent Company Of', icon: '👨\u200d👧', color: 'purple' },
  supplies_to: { label: 'Supplies To', icon: '📦', color: 'emerald' },
  client_of: { label: 'Client Of', icon: '🤝', color: 'amber' },
  partner: { label: 'Partner With', icon: '💼', color: 'cyan' },
  distributor_for: { label: 'Distributor For', icon: '🚚', color: 'orange' },
  manufacturer_for: { label: 'Manufacturer For', icon: '🏭', color: 'red' },
  retailer_for: { label: 'Retailer For', icon: '🏪', color: 'pink' },
  investor_in: { label: 'Investor In', icon: '💰', color: 'yellow' },
  owns: { label: 'Owns', icon: '👑', color: 'violet' },
}

export function OrgRelationshipsAdminView({
  serverUrl,
  accessToken
}: OrgRelationshipsAdminViewProps) {
  const [relationships, setRelationships] = useState<OrgRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRelationships()
  }, [statusFilter])

  const fetchRelationships = async () => {
    setLoading(true)
    try {
      const url = statusFilter === 'all' 
        ? `${serverUrl}/admin/org-relationships`
        : `${serverUrl}/admin/org-relationships?status=${statusFilter}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRelationships(data.relationships || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle specific error cases
        if (response.status === 503 && errorData.shouldRetry) {
          toast.error('Connection error. Please refresh and try again.')
        } else if (response.status === 401 && errorData.shouldRefresh) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(errorData.details || 'Failed to load relationships')
        }
      }
    } catch (error) {
      console.error('Error fetching relationships:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const updateRelationshipStatus = async (relationshipId: string, newStatus: 'pending' | 'verified' | 'rejected') => {
    setUpdating(relationshipId)
    try {
      const response = await fetch(`${serverUrl}/admin/org-relationships/${relationshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(`Relationship ${newStatus}!`)
        fetchRelationships()
      } else {
        toast.error('Failed to update relationship')
      }
    } catch (error) {
      console.error('Error updating relationship:', error)
      toast.error('Failed to update relationship')
    } finally {
      setUpdating(null)
    }
  }

  const pendingCount = relationships.filter(r => r.status === 'pending').length
  const verifiedCount = relationships.filter(r => r.status === 'verified').length
  const rejectedCount = relationships.filter(r => r.status === 'rejected').length

  const getTypeConfig = (type: string) => {
    return RELATIONSHIP_TYPES[type] || { label: type, icon: '🔗', color: 'gray' }
  }

  const filteredRelationships = relationships.filter(rel => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      rel.organization.name.toLowerCase().includes(searchTermLower) ||
      rel.related_organization.name.toLowerCase().includes(searchTermLower) ||
      rel.relationship_type.toLowerCase().includes(searchTermLower) ||
      rel.status.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Status Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setStatusFilter('all')}
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={statusFilter === 'all' 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
            : 'border-slate-700'}
        >
          All ({relationships.length})
        </Button>
        <Button
          onClick={() => setStatusFilter('pending')}
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          className={statusFilter === 'pending' 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
            : 'border-slate-700'}
        >
          <Clock className="w-4 h-4 mr-1" />
          Pending ({pendingCount})
        </Button>
        <Button
          onClick={() => setStatusFilter('verified')}
          variant={statusFilter === 'verified' ? 'default' : 'outline'}
          size="sm"
          className={statusFilter === 'verified' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'border-slate-700'}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Verified ({verifiedCount})
        </Button>
        <Button
          onClick={() => setStatusFilter('rejected')}
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          className={statusFilter === 'rejected' 
            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
            : 'border-slate-700'}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Rejected ({rejectedCount})
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search relationships..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
        {searchTerm && (
          <X
            className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 cursor-pointer"
            onClick={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* Relationships List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-cyan-500" />
          <p className="text-slate-400 mt-4">Loading relationships...</p>
        </div>
      ) : filteredRelationships.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No {statusFilter === 'all' ? '' : statusFilter} relationships found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredRelationships.map((rel) => {
              const typeConfig = getTypeConfig(rel.relationship_type)
              return (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Organizations Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Source Organization */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            {rel.organization.logo_url ? (
                              <img src={rel.organization.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Source Org</p>
                            <p className="font-bold text-white truncate">{rel.organization.name}</p>
                            <p className="text-xs text-slate-400 truncate">{rel.organization.location || rel.organization.country}</p>
                          </div>
                        </div>

                        {/* Relationship Type */}
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700">
                            <span className="text-lg">{typeConfig.icon}</span>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-300">{typeConfig.label}</span>
                          </div>
                        </div>

                        {/* Target Organization */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            {rel.related_organization.logo_url ? (
                              <img src={rel.related_organization.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Target Org</p>
                            <p className="font-bold text-white truncate">{rel.related_organization.name}</p>
                            <p className="text-xs text-slate-400 truncate">{rel.related_organization.location || rel.related_organization.country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Details */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge 
                          variant="outline" 
                          className={
                            rel.status === 'verified'
                              ? 'border-green-500/50 text-green-400'
                              : rel.status === 'pending'
                              ? 'border-yellow-500/50 text-yellow-400'
                              : 'border-red-500/50 text-red-400'
                          }
                        >
                          {rel.status === 'verified' && '✅ VERIFIED'}
                          {rel.status === 'pending' && '⏳ PENDING'}
                          {rel.status === 'rejected' && '❌ REJECTED'}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-500">
                          Created {new Date(rel.created_at).toLocaleDateString()}
                        </Badge>
                      </div>

                      {/* Admin Metadata */}
                      <div className="p-2 bg-slate-950/50 rounded border border-slate-700/50">
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-500 font-semibold block mb-0.5">Relationship ID</span>
                            <code className="text-cyan-400 font-mono block truncate">{rel.id}</code>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block mb-0.5">Source Org ID</span>
                            <code className="text-emerald-400 font-mono block truncate">{rel.organization_id}</code>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block mb-0.5">Target Org ID</span>
                            <code className="text-cyan-400 font-mono block truncate">{rel.related_organization_id}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {rel.status !== 'verified' && (
                        <Button
                          onClick={() => updateRelationshipStatus(rel.id, 'verified')}
                          disabled={updating === rel.id}
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white whitespace-nowrap"
                        >
                          {updating === rel.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Verify
                        </Button>
                      )}
                      {rel.status !== 'rejected' && (
                        <Button
                          onClick={() => updateRelationshipStatus(rel.id, 'rejected')}
                          disabled={updating === rel.id}
                          size="sm"
                          variant="outline"
                          className="gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 whitespace-nowrap"
                        >
                          {updating === rel.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Reject
                        </Button>
                      )}
                      {rel.status !== 'pending' && (
                        <Button
                          onClick={() => updateRelationshipStatus(rel.id, 'pending')}
                          disabled={updating === rel.id}
                          size="sm"
                          variant="outline"
                          className="gap-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 whitespace-nowrap"
                        >
                          {updating === rel.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          Pending
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {rel.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-slate-300">{rel.notes}</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}