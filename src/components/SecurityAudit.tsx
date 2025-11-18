import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Search, Users } from 'lucide-react'

interface SecurityAuditProps {
  accessToken: string
  serverUrl: string
}

interface AuditReport {
  userId: string
  email: string
  progress: {
    totalArticlesRead: number
    points: number
    currentStreak: number
  }
  readHistory: {
    total: number
    recent: Array<{
      articleId: string
      articleTitle: string
      timestamp: string
    }>
  }
  suspiciousPatterns: Array<{
    type: string
    severity: string
    description: string
    timestamp: string
    articleIds: string[]
  }>
  riskLevel: string
}

interface User {
  id: string
  email: string
  nickname: string | null
  points: number
  totalArticlesRead: number
  currentStreak: number
  banned: boolean
}

export function SecurityAudit({ accessToken, serverUrl }: SecurityAuditProps) {
  const [userId, setUserId] = useState('')
  const [audit, setAudit] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  
  // User list and search
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch(`${serverUrl}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = (users || []).filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectUser = (user: User) => {
    setUserId(user.id)
    setSearchQuery('') // Clear search after selection
  }

  const handleAudit = async () => {
    if (!userId.trim()) return
    
    setLoading(true)
    setMessage('')
    setAudit(null)
    
    try {
      const response = await fetch(`${serverUrl}/admin/security/audit/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAudit(data.audit)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error || 'Failed to audit user'}`)
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (resetType: 'full' | 'suspicious-reads') => {
    if (!userId.trim()) return
    
    if (!confirm(`Are you sure you want to ${resetType === 'full' ? 'FULLY RESET' : 'remove suspicious reads for'} this user? This cannot be undone!`)) {
      return
    }
    
    setResetting(true)
    setMessage('')
    
    try {
      const response = await fetch(`${serverUrl}/admin/security/reset-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userId, resetType })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage(`✅ ${data.message}`)
        // Re-audit to show updated state
        setTimeout(() => handleAudit(), 1000)
      } else {
        const error = await response.json()
        setMessage(`❌ Error: ${error.error || 'Failed to reset user'}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setResetting(false)
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      none: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    }
    
    return (
      <Badge className={`${colors[riskLevel as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {riskLevel.toUpperCase()}
      </Badge>
    )
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <XCircle className="w-5 h-5 text-red-500" />
    if (severity === 'high') return <AlertTriangle className="w-5 h-5 text-orange-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-black">Security Audit</h2>
            <p className="text-sm text-muted-foreground">Detect and fix fraudulent user activity</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter User ID to audit..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAudit}
              disabled={loading || !userId.trim()}
              className="font-black"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Audit User
                </>
              )}
            </Button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
              {message}
            </div>
          )}
        </div>
      </Card>

      {/* User Search & List */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-xl font-black">Select User to Audit</h3>
            <p className="text-sm text-muted-foreground">
              {loadingUsers ? 'Loading users...' : `${users.length} users registered`}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, nickname, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loadingUsers ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  userId === user.id ? 'border-2 border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                } ${user.banned ? 'opacity-60 border-red-300' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm truncate">
                        {user.nickname || user.email}
                      </p>
                      {user.banned && (
                        <Badge variant="destructive" className="text-xs">
                          BANNED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-bold text-orange-500">{user.points} pts</span>
                      <span>{user.totalArticlesRead} read</span>
                      <span>🔥 {user.currentStreak}</span>
                    </div>
                  </div>
                  {userId === user.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {!loadingUsers && users.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-lg font-black">{users.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Banned</p>
                <p className="text-lg font-black text-red-500">
                  {users.filter(u => u.banned).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-black text-green-500">
                  {users.filter(u => !u.banned).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {audit && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-xl font-black mb-4">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-bold">{audit.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{audit.userId}</p>
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div>
              <h3 className="text-xl font-black mb-4">Risk Assessment</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm">Risk Level:</span>
                {getRiskBadge(audit.riskLevel)}
                {audit.riskLevel === 'none' && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                )}
              </div>
            </div>

            {/* Progress Stats */}
            <div>
              <h3 className="text-xl font-black mb-4">User Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">Articles Read</p>
                  <p className="text-2xl font-black">{audit.progress.totalArticlesRead}</p>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-black">{audit.progress.points}</p>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-black">{audit.progress.currentStreak}</p>
                </Card>
              </div>
            </div>

            {/* Suspicious Patterns */}
            {audit.suspiciousPatterns && audit.suspiciousPatterns.length > 0 && (
              <div>
                <h3 className="text-xl font-black mb-4 text-red-600">
                  ⚠️ Suspicious Activity Detected
                </h3>
                <div className="space-y-3">
                  {audit.suspiciousPatterns.map((pattern, idx) => (
                    <Card key={idx} className="p-4 border-red-300 bg-red-50">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(pattern.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-sm uppercase">{pattern.type}</span>
                            <Badge className={`text-xs ${
                              pattern.severity === 'critical' ? 'bg-red-500' :
                              pattern.severity === 'high' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            } text-white`}>
                              {pattern.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{pattern.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(pattern.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Affected articles: {pattern.articleIds.length}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Read History */}
            <div>
              <h3 className="text-xl font-black mb-4">Recent Read History</h3>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Total reads: {audit.readHistory.total}
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {audit.readHistory.recent && audit.readHistory.recent.length > 0 ? (
                    audit.readHistory.recent.map((read, idx) => (
                      <div key={idx} className="flex justify-between items-start py-2 border-b border-border last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-bold truncate">{read.articleTitle}</p>
                          <p className="text-xs text-muted-foreground">{read.articleId}</p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {new Date(read.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent reading history
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleReset('suspicious-reads')}
                disabled={resetting || audit.suspiciousPatterns.length === 0}
                variant="outline"
                className="flex-1 font-black"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Remove Suspicious Reads Only
              </Button>
              <Button
                onClick={() => handleReset('full')}
                disabled={resetting}
                variant="destructive"
                className="flex-1 font-black"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Full Reset (Nuclear Option)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}