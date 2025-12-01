import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Shield, Edit, Trash2, Crown, UserCheck, Settings } from 'lucide-react'
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

interface Member {
  id: string
  userId: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  title: string | null
  canEdit: boolean
  canManageBadges: boolean
  canManageMembers: boolean
  invitedBy: string | null
  joinedAt: string
}

interface OrganizationMembersTabProps {
  companyId: string
  companyName: string
  currentUserId: string | null
  isOwner: boolean
  userRole: 'owner' | 'admin' | 'member' | null
  canManageMembers: boolean
}

export default function OrganizationMembersTab({
  companyId,
  companyName,
  currentUserId,
  isOwner,
  userRole,
  canManageMembers
}: OrganizationMembersTabProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [inviteTitle, setInviteTitle] = useState('')
  const [invitePermissions, setInvitePermissions] = useState({
    canEdit: false,
    canManageBadges: false,
    canManageMembers: false
  })
  const [inviting, setInviting] = useState(false)
  
  // Edit form state
  const [editRole, setEditRole] = useState<'owner' | 'admin' | 'member'>('member')
  const [editTitle, setEditTitle] = useState('')
  const [editPermissions, setEditPermissions] = useState({
    canEdit: false,
    canManageBadges: false,
    canManageMembers: false
  })
  const [updating, setUpdating] = useState(false)

  const supabase = createClient(publicAnonKey)

  const getFreshToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  useEffect(() => {
    fetchMembers()
  }, [companyId])

  const fetchMembers = async () => {
    try {
      const url = `${serverUrl}/organizations/${companyId}/members`
      console.log('👥 Fetching organization members from:', url)

      const token = await getFreshToken()
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token || publicAnonKey}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Members fetched:', data)
        setMembers(data.members || [])
      } else {
        const error = await response.json()
        console.error('❌ Error fetching members:', error)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    setInviting(true)
    try {
      const token = await getFreshToken()
      
      const response = await fetch(`${serverUrl}/organizations/${companyId}/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          title: inviteTitle || null,
          permissions: invitePermissions
        })
      })

      if (response.ok) {
        alert(`✅ Successfully invited ${inviteEmail} to ${companyName}`)
        setShowInviteModal(false)
        setInviteEmail('')
        setInviteRole('member')
        setInviteTitle('')
        setInvitePermissions({ canEdit: false, canManageBadges: false, canManageMembers: false })
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to invite member')
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateMember = async () => {
    if (!selectedMember) return

    setUpdating(true)
    try {
      const token = await getFreshToken()

      // Update role
      if (editRole !== selectedMember.role) {
        const roleResponse = await fetch(
          `${serverUrl}/organizations/${companyId}/members/${selectedMember.id}/role`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: editRole })
          }
        )

        if (!roleResponse.ok) {
          const error = await roleResponse.json()
          throw new Error(error.error || 'Failed to update role')
        }
      }

      // Update permissions and title
      const permResponse = await fetch(
        `${serverUrl}/organizations/${companyId}/members/${selectedMember.id}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editTitle || null,
            canEdit: editPermissions.canEdit,
            canManageBadges: editPermissions.canManageBadges,
            canManageMembers: editPermissions.canManageMembers
          })
        }
      )

      if (permResponse.ok) {
        alert('✅ Member updated successfully')
        setShowEditModal(false)
        setSelectedMember(null)
        fetchMembers()
      } else {
        const error = await permResponse.json()
        alert(error.error || 'Failed to update permissions')
      }
    } catch (error: any) {
      console.error('Error updating member:', error)
      alert(error.message || 'Failed to update member')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveMember = async (member: Member) => {
    if (!confirm(`Remove ${member.name} from ${companyName}?`)) return

    try {
      const token = await getFreshToken()

      const response = await fetch(
        `${serverUrl}/organizations/${companyId}/members/${member.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        alert(`✅ ${member.name} removed from organization`)
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const openEditModal = (member: Member) => {
    setSelectedMember(member)
    setEditRole(member.role)
    setEditTitle(member.title || '')
    setEditPermissions({
      canEdit: member.canEdit,
      canManageBadges: member.canManageBadges,
      canManageMembers: member.canManageMembers
    })
    setShowEditModal(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3" />
      case 'admin': return <Shield className="w-3 h-3" />
      default: return <UserCheck className="w-3 h-3" />
    }
  }

  const canManage = isOwner || userRole === 'admin' || canManageMembers
  const canEditMember = (member: Member) => {
    // Owner can edit anyone except themselves
    if (isOwner && member.role !== 'owner') return true
    // Admins can edit members (not owner, not other admins)
    if (userRole === 'admin' && member.role === 'member') return true
    // Users with permission can edit members
    if (canManageMembers && member.role === 'member') return true
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-emerald-400 animate-pulse">Loading members...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg text-white">Team Members</h3>
          <p className="text-sm text-emerald-200/60">
            Manage your organization's team ({members.length} member{members.length !== 1 ? 's' : ''})
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
          >
            <Mail className="w-4 h-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members List */}
      {members.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-400/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-white">{member.name}</h4>
                      <Badge className={`gap-1 text-xs ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-200/70 mb-2">{member.email}</p>
                    {member.title && (
                      <p className="text-xs text-emerald-300/60 mb-2">
                        <span className="font-semibold">Title:</span> {member.title}
                      </p>
                    )}
                    
                    {/* Permissions */}
                    {(member.canEdit || member.canManageBadges || member.canManageMembers) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {member.canEdit && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-xs">
                            <Edit className="w-3 h-3 mr-1" />
                            Can Edit
                          </Badge>
                        )}
                        {member.canManageBadges && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Manage Badges
                          </Badge>
                        )}
                        {member.canManageMembers && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Manage Members
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-emerald-200/50 mt-2">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {canEditMember(member) && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEditModal(member)}
                        className="gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {member.role !== 'owner' && (
                        <Button
                          onClick={() => handleRemoveMember(member)}
                          className="gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
          <h3 className="font-black mb-2 text-white">No Members Yet</h3>
          <p className="text-sm text-emerald-200/60 mb-4">
            Start building your team by inviting members to your organization
          </p>
          {canManage && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              <Mail className="w-4 h-4" />
              Invite First Member
            </Button>
          )}
        </div>
      )}

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-emerald-950 border-emerald-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Invite Team Member</DialogTitle>
            <DialogDescription className="text-emerald-200/70">
              Add a new member to {companyName}. They must have a DEWII account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Email Address *
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Role *
              </label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'member' | 'admin')}>
                <SelectTrigger className="w-full bg-emerald-900/30 border-emerald-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-500/30 text-white">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Job Title (Optional)
              </label>
              <input
                type="text"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                placeholder="Marketing Director"
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invitePermissions.canEdit}
                    onChange={(e) => setInvitePermissions({ ...invitePermissions, canEdit: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can edit organization profile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invitePermissions.canManageBadges}
                    onChange={(e) => setInvitePermissions({ ...invitePermissions, canManageBadges: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can manage badges</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invitePermissions.canManageMembers}
                    onChange={(e) => setInvitePermissions({ ...invitePermissions, canManageMembers: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can manage team members</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/30"
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteMember}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                disabled={inviting}
              >
                {inviting ? 'Inviting...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-emerald-950 border-emerald-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Edit Member</DialogTitle>
            <DialogDescription className="text-emerald-200/70">
              Update {selectedMember?.name}'s role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Role */}
            {(isOwner || userRole === 'admin') && (
              <div>
                <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                  Role
                </label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as any)}>
                  <SelectTrigger className="w-full bg-emerald-900/30 border-emerald-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-emerald-950 border-emerald-500/30 text-white">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Job Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Marketing Director"
                className="w-full px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="text-sm font-semibold text-emerald-200 mb-2 block">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions.canEdit}
                    onChange={(e) => setEditPermissions({ ...editPermissions, canEdit: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can edit organization profile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions.canManageBadges}
                    onChange={(e) => setEditPermissions({ ...editPermissions, canManageBadges: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can manage badges</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions.canManageMembers}
                    onChange={(e) => setEditPermissions({ ...editPermissions, canManageMembers: e.target.checked })}
                    className="w-4 h-4 rounded border-emerald-500/30 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-emerald-200">Can manage team members</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/30"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMember}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Member'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
