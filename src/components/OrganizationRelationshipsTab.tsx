import { useState, useEffect } from 'react'
import { Building2, Plus, Search, X, Edit2, Trash2, ArrowRight, ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'

interface OrganizationRelationshipsTabProps {
  organizationId: string
  accessToken: string | null
  serverUrl: string
  userRole: string // 'owner', 'admin', 'member'
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
}

interface OutgoingRelationship extends OrgRelationship {
  related_organization: {
    id: string
    name: string
    description?: string
    logo_url?: string
    location?: string
    country?: string
  }
}

interface IncomingRelationship extends OrgRelationship {
  organization: {
    id: string
    name: string
    description?: string
    logo_url?: string
    location?: string
    country?: string
  }
}

interface Organization {
  id: string
  name: string
  description?: string
  logo_url?: string
  location?: string
  country?: string
}

// Relationship type configurations
const RELATIONSHIP_TYPES = [
  { value: 'headquarter_of', label: 'Headquarter Of', icon: '🏢', color: 'blue', description: 'This org is HQ of target org' },
  { value: 'subsidiary_of', label: 'Subsidiary Of', icon: '🏛️', color: 'indigo', description: 'This org is subsidiary of target org' },
  { value: 'parent_company', label: 'Parent Company Of', icon: '👨\u200d👧', color: 'purple', description: 'Parent company relationship' },
  { value: 'supplies_to', label: 'Supplies To', icon: '📦', color: 'emerald', description: 'Supplies products/services to target' },
  { value: 'client_of', label: 'Client Of', icon: '🤝', color: 'amber', description: 'Is a client of target organization' },
  { value: 'partner', label: 'Partner With', icon: '💼', color: 'cyan', description: 'Business partnership' },
  { value: 'distributor_for', label: 'Distributor For', icon: '🚚', color: 'orange', description: 'Distributes for target organization' },
  { value: 'manufacturer_for', label: 'Manufacturer For', icon: '🏭', color: 'red', description: 'Manufactures for target organization' },
  { value: 'retailer_for', label: 'Retailer For', icon: '🏪', color: 'pink', description: 'Retails products of target organization' },
  { value: 'investor_in', label: 'Investor In', icon: '💰', color: 'yellow', description: 'Has invested in target organization' },
  { value: 'owns', label: 'Owns', icon: '👑', color: 'violet', description: 'Owns the target organization' },
]

export function OrganizationRelationshipsTab({ organizationId, accessToken, serverUrl, userRole }: OrganizationRelationshipsTabProps) {
  const [outgoingRelationships, setOutgoingRelationships] = useState<OutgoingRelationship[]>([])
  const [incomingRelationships, setIncomingRelationships] = useState<IncomingRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Organization[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedRelationType, setSelectedRelationType] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRelationships()
  }, [organizationId])

  const fetchRelationships = async () => {
    try {
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/org-relationships`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        
        // Handle connection errors with retry suggestion
        if (response.status === 503 && errorData.shouldRetry) {
          toast.error('Connection error. Please refresh the page to try again.')
        } else if (response.status === 401 && errorData.shouldRefresh) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error(errorData.details || 'Failed to fetch relationships')
        }
        
        throw new Error(errorData.error || 'Failed to fetch relationships')
      }

      const data = await response.json()
      setOutgoingRelationships(data.outgoing || [])
      setIncomingRelationships(data.incoming || [])
    } catch (error: any) {
      console.error('Error fetching org relationships:', error)
      
      // Only show error if we didn't already show one above
      if (!error.message?.includes('Failed to fetch relationships')) {
        toast.error('Network error. Please check your connection and try again.')
      }
      
      setOutgoingRelationships([])
      setIncomingRelationships([])
    } finally {
      setLoading(false)
    }
  }

  const searchOrganizations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/search-orgs?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.organizations || [])
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching organizations:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length >= 2) {
      searchOrganizations(value)
    } else {
      setSearchResults([])
    }
  }

  const handleAddRelationship = async () => {
    if (!selectedOrg || !selectedRelationType) {
      toast.error('Please select an organization and relationship type')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/org-relationships`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            related_organization_id: selectedOrg.id,
            relationship_type: selectedRelationType,
            notes: notes || null
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Create relationship error:', error)
        throw new Error(error.error || 'Failed to create relationship')
      }

      toast.success('✅ Relationship created! Pending admin verification.')
      setShowAddModal(false)
      resetForm()
      fetchRelationships()
    } catch (error: any) {
      console.error('Error creating relationship:', error)
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this relationship?')) {
      return
    }

    try {
      const response = await fetch(
        `${serverUrl}/organizations/${organizationId}/org-relationships/${relationshipId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete relationship')
      }

      toast.success('Relationship removed')
      fetchRelationships()
    } catch (error: any) {
      console.error('Error deleting relationship:', error)
      toast.error('Failed to delete relationship')
    }
  }

  const resetForm = () => {
    setSelectedOrg(null)
    setSelectedRelationType('')
    setNotes('')
    setSearchQuery('')
    setSearchResults([])
  }

  const getRelationshipTypeConfig = (type: string) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type) || RELATIONSHIP_TYPES[0]
  }

  const canManageRelationships = userRole === 'owner' || userRole === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Organization Relationships</h3>
          <p className="text-sm text-slate-400">Manage partnerships, supply chains, and corporate hierarchies</p>
        </div>
        {canManageRelationships && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Relationship
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-slate-400 mt-4">Loading relationships...</p>
        </div>
      ) : (
        <>
          {/* Outgoing Relationships */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-cyan-500" />
              Outgoing Relationships ({outgoingRelationships.length})
            </h4>
            {outgoingRelationships.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <p className="text-slate-400">No outgoing relationships yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingRelationships.map((rel) => {
                  const typeConfig = getRelationshipTypeConfig(rel.relationship_type)
                  return (
                    <motion.div
                      key={rel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Target Organization */}
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            {rel.related_organization.logo_url ? (
                              <img src={rel.related_organization.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              <Building2 className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{rel.related_organization.name}</p>
                            <p className="text-sm text-slate-400 truncate">{rel.related_organization.location || rel.related_organization.country}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className={`border-${typeConfig.color}-500/50 text-${typeConfig.color}-400`}>
                                {typeConfig.icon} {typeConfig.label}
                              </Badge>
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
                                {rel.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {rel.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {rel.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {rel.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {canManageRelationships && (
                          <Button
                            onClick={() => handleDeleteRelationship(rel.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {rel.notes && (
                        <p className="text-sm text-slate-400 mt-3 pl-16">{rel.notes}</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Incoming Relationships */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-purple-500" />
              Incoming Relationships ({incomingRelationships.length})
            </h4>
            {incomingRelationships.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <p className="text-slate-400">No incoming relationships yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRelationships.map((rel) => {
                  const typeConfig = getRelationshipTypeConfig(rel.relationship_type)
                  return (
                    <motion.div
                      key={rel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Source Organization */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          {rel.organization.logo_url ? (
                            <img src={rel.organization.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{rel.organization.name}</p>
                          <p className="text-sm text-slate-400 truncate">{rel.organization.location || rel.organization.country}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className={`border-${typeConfig.color}-500/50 text-${typeConfig.color}-400`}>
                              {typeConfig.icon} {typeConfig.label}
                            </Badge>
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
                              {rel.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {rel.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {rel.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {rel.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {rel.notes && (
                        <p className="text-sm text-slate-400 mt-3 pl-16">{rel.notes}</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Relationship Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !submitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add Organization Relationship</h2>
                    <p className="text-sm text-slate-400">Connect with partners, suppliers, or parent companies</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Search Organizations */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Search Organization *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by name..."
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                      disabled={submitting}
                    />
                  </div>

                  {/* Search Results */}
                  {searching && (
                    <div className="mt-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-500" />
                    </div>
                  )}
                  {!searching && searchResults.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                      {searchResults.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setSelectedOrg(org)
                            setSearchQuery(org.name)
                            setSearchResults([])
                          }}
                          className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                            selectedOrg?.id === org.id
                              ? 'bg-cyan-500/20 border-cyan-500'
                              : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {org.logo_url && (
                            <img src={org.logo_url} alt="" className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{org.name}</p>
                            <p className="text-xs text-slate-400 truncate">{org.location || org.country}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Organization Display */}
                {selectedOrg && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-xs text-cyan-400 uppercase tracking-wide mb-2">Selected Organization</p>
                    <div className="flex items-center gap-3">
                      {selectedOrg.logo_url && (
                        <img src={selectedOrg.logo_url} alt="" className="w-12 h-12 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-bold text-white">{selectedOrg.name}</p>
                        <p className="text-sm text-slate-400">{selectedOrg.location || selectedOrg.country}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Relationship Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Relationship Type *
                  </label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => setSelectedRelationType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                    disabled={submitting}
                  >
                    <option value="">Select relationship type...</option>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional information about this relationship..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="border-slate-700"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRelationship}
                  disabled={submitting || !selectedOrg || !selectedRelationType}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Relationship
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}