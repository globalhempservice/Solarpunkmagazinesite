import { useState, useEffect } from 'react'
import { FileText, Plus, X, ExternalLink, Calendar, Eye, Tag, BookOpen, Sparkles, Award } from 'lucide-react'
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

interface CoAuthor {
  id: string
  userId: string | null
  name: string
  title: string | null
  imageUrl: string | null
  bio: string | null
  order: number
  role: string
}

interface Publication {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage: string | null
  readingTime: number
  authorId: string
  organizationId: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  publishDate: string | null
  media: any[]
  source: string | null
  sourceUrl: string | null
  coAuthors: CoAuthor[]
}

interface UserArticle {
  id: string
  title: string
  created_at: string
  publish_date: string | null
  category: string
  tags: string[]
  featured_image_url: string | null
  reading_time_minutes: number
}

interface OrganizationPublicationsTabProps {
  companyId: string
  userId: string
  accessToken: string
  serverUrl: string
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' // viewer = not a member
}

export function OrganizationPublicationsTab({
  companyId,
  userId,
  accessToken,
  serverUrl,
  userRole = 'viewer' // Default to viewer (no permissions)
}: OrganizationPublicationsTabProps) {
  const [publications, setPublications] = useState<Publication[]>([])
  const [userArticles, setUserArticles] = useState<UserArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('author')
  const [notes, setNotes] = useState<string>('')
  const [linking, setLinking] = useState(false)
  const supabase = createClient()

  // Helper to get fresh token
  const getFreshToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        console.error('Failed to get fresh token:', error)
        return accessToken // Fallback to provided token
      }
      return session.access_token
    } catch (err) {
      console.error('Error getting fresh token:', err)
      return accessToken // Fallback to provided token
    }
  }

  useEffect(() => {
    fetchPublications()
    fetchUserArticles()
  }, [companyId])

  const fetchPublications = async () => {
    try {
      const url = `${serverUrl}/organizations/${companyId}/articles`
      console.log('📰 Fetching organization articles from:', url)
      
      // Get fresh token
      const token = await getFreshToken()
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Organization articles fetched:', data)
        setPublications(data.articles || [])
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch articles:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserArticles = async () => {
    try {
      const url = `${serverUrl}/my-articles`
      console.log('📝 Fetching user articles from:', url)
      
      // Get fresh token
      const token = await getFreshToken()
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ User articles fetched:', data)
        // Transform to the expected format
        const articles = (data.articles || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          created_at: a.createdAt,
          publish_date: a.publishDate,
          category: a.category,
          tags: a.tags || [],
          featured_image_url: a.coverImage,
          reading_time_minutes: a.readingTime
        }))
        setUserArticles(articles)
      } else if (response.status === 401) {
        // Token expired - user needs to refresh the page or re-login
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Authentication failed:', errorData)
        console.log('⚠️  Your session may have expired. Please refresh the page.')
        alert('Your session has expired. Please refresh the page to continue.')
        // Set empty array so UI doesn't break
        setUserArticles([])
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch user articles:', response.status, errorText)
        setUserArticles([])
      }
    } catch (error) {
      console.error('❌ Error fetching user articles:', error)
      setUserArticles([])
    }
  }

  const handleLinkArticle = async () => {
    if (!selectedArticle) return
    
    setLinking(true)
    try {
      // Get fresh token
      const token = await getFreshToken()
      
      const response = await fetch(`${serverUrl}/articles/${selectedArticle}/organization`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId: companyId
        })
      })

      if (response.ok) {
        await fetchPublications()
        await fetchUserArticles() // Refresh to update available articles
        setShowLinkModal(false)
        setSelectedArticle('')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to publish article under organization')
      }
    } catch (error) {
      console.error('Error publishing article:', error)
      alert('Failed to publish article under organization')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlinkArticle = async (articleId: string) => {
    if (!confirm('Remove this article from your organization? It will become a personal article.')) return

    try {
      // Get fresh token
      const token = await getFreshToken()
      
      const response = await fetch(
        `${serverUrl}/articles/${articleId}/organization`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ organizationId: null }) // Set to null to make it personal
        }
      )

      if (response.ok) {
        await fetchPublications()
        await fetchUserArticles() // Refresh to update available articles
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to remove article from organization')
      }
    } catch (error) {
      console.error('Error removing article from organization:', error)
      alert('Failed to remove article from organization')
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'author':
        return 'bg-purple-500/20 border-purple-400/50 text-purple-300'
      case 'co-author':
        return 'bg-blue-500/20 border-blue-400/50 text-blue-300'
      case 'sponsor':
        return 'bg-amber-500/20 border-amber-400/50 text-amber-300'
      case 'featured':
        return 'bg-pink-500/20 border-pink-400/50 text-pink-300'
      default:
        return 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'author':
        return <FileText className="w-3 h-3" />
      case 'co-author':
        return <BookOpen className="w-3 h-3" />
      case 'sponsor':
        return <Award className="w-3 h-3" />
      case 'featured':
        return <Sparkles className="w-3 h-3" />
      default:
        return <FileText className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  // Get list of already published article IDs (articles that have this organization set)
  const publishedArticleIds = new Set(publications.map(p => p.id))
  // Available articles are user's articles that don't have an organization set (personal articles)
  const availableArticles = userArticles.filter(a => !publishedArticleIds.has(a.id))
  
  // Check if user has permission to link articles
  const canLinkArticles = userRole === 'owner' || userRole === 'admin'
  
  console.log('📊 Articles Debug:', {
    userArticlesCount: userArticles.length,
    publicationsCount: publications.length,
    availableArticlesCount: availableArticles.length,
    userRole,
    canLinkArticles,
    userArticles: userArticles.map(a => ({ id: a.id, title: a.title })),
    publications: publications.map(p => ({ id: p.id, title: p.title })),
    availableArticles: availableArticles.map(a => ({ id: a.id, title: a.title }))
  })

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg text-white">Publications</h3>
          <p className="text-sm text-emerald-200/60">
            Articles published by or featuring this organization ({publications.length})
          </p>
        </div>
        {canLinkArticles && availableArticles.length > 0 && (
          <Button
            onClick={() => {
              console.log('🔗 Opening Link Modal with', availableArticles.length, 'available articles')
              setShowLinkModal(true)
            }}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            Link Article
          </Button>
        )}
      </div>

      {/* Publications Grid */}
      {publications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {publications.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl overflow-hidden hover:border-emerald-400/40 transition-all group"
              >
                {/* Article Image */}
                {article.coverImage && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
                  </div>
                )}

                {/* Article Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-white line-clamp-2 flex-1">
                      {article.title}
                    </h4>
                    <button
                      onClick={() => handleUnlinkArticle(article.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                      title="Remove from organization"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Co-Authors */}
                  {article.coAuthors && article.coAuthors.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-emerald-300/70">By:</span>
                      {article.coAuthors.slice(0, 3).map((author) => (
                        <Badge key={author.id} variant="outline" className="text-emerald-300 border-emerald-400/30 text-xs">
                          {author.name}
                          {author.title && ` (${author.title})`}
                        </Badge>
                      ))}
                      {article.coAuthors.length > 3 && (
                        <span className="text-xs text-emerald-300/50">+{article.coAuthors.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-emerald-300 border-emerald-400/30">
                      <Tag className="w-3 h-3 mr-1" />
                      {article.category}
                    </Badge>
                    <Badge variant="outline" className="text-blue-300 border-blue-400/30">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {article.readingTime} min read
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-emerald-200/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishDate || article.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views} views
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 mt-2"
                    onClick={() => window.open(`/browse?article=${article.id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Article
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20">
          <FileText className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
          <h3 className="font-black mb-2 text-white">No Publications Yet</h3>
          <p className="text-sm text-emerald-200/60 mb-4">
            {canLinkArticles 
              ? "Link your articles to showcase your organization's content"
              : "This organization hasn't published any content yet"
            }
          </p>
          {canLinkArticles && (
            <>
              {availableArticles.length > 0 ? (
                <Button
                  onClick={() => setShowLinkModal(true)}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                >
                  <Plus className="w-4 h-4" />
                  Link Your First Article
                </Button>
              ) : (
                <p className="text-xs text-emerald-300/50 mt-2">
                  Write some articles first to link them here
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Link Article Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="bg-emerald-950 border-2 border-emerald-500/30 text-white max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-black text-xl text-white">
              Link Article to Organization
            </DialogTitle>
            <DialogDescription className="text-emerald-200/60">
              Choose an article from your published work to showcase with this organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 overflow-y-auto flex-1 pr-2 -mr-2">
            {/* Article Selector */}
            <div>
              <label className="text-sm font-black text-emerald-300 mb-2 block uppercase tracking-wide">
                Select Article
              </label>
              <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                <SelectTrigger className="bg-emerald-900/30 border-emerald-500/30 text-white">
                  <SelectValue placeholder="Choose an article..." />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-500/30 z-[10000]" position="popper" sideOffset={5}>
                  {availableArticles.map((article) => (
                    <SelectItem key={article.id} value={article.id} className="text-white">
                      <div className="flex flex-col">
                        <span className="font-bold">{article.title}</span>
                        <span className="text-xs text-emerald-300/60">
                          {article.category} • {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableArticles.length === 0 && userArticles.length > 0 && (
                <p className="text-xs text-amber-300 mt-2">
                  ✅ All your articles are already linked to this organization
                </p>
              )}
              {userArticles.length === 0 && (
                <p className="text-xs text-amber-300 mt-2">
                  📝 You haven't published any articles yet. Create your first article to link it here!
                </p>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <label className="text-sm font-black text-emerald-300 mb-2 block uppercase tracking-wide">
                Organization Role
              </label>
              <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                <SelectTrigger className="bg-emerald-900/30 border-emerald-500/30 text-white">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-500/30 z-[10000]" position="popper" sideOffset={5}>
                  <SelectItem value="author" className="text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <div className="font-bold">Author</div>
                        <div className="text-xs text-emerald-300/60">Primary creator of this content</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="co-author" className="text-white">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <div>
                        <div className="font-bold">Co-Author</div>
                        <div className="text-xs text-emerald-300/60">Collaborated on this content</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="sponsor" className="text-white">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <div>
                        <div className="font-bold">Sponsor</div>
                        <div className="text-xs text-emerald-300/60">Supported this content</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="featured" className="text-white">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <div>
                        <div className="font-bold">Featured</div>
                        <div className="text-xs text-emerald-300/60">Featured in this content</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-black text-emerald-300 mb-2 block uppercase tracking-wide">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context about this publication's connection to your organization..."
                className="w-full bg-emerald-900/30 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none resize-none"
                rows={3}
              />
            </div>

          </div>

          {/* Actions - Fixed Footer */}
          <div className="flex gap-3 pt-4 border-t border-emerald-500/20 mt-4 shrink-0">
            <Button
              onClick={() => setShowLinkModal(false)}
              variant="outline"
              className="flex-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              disabled={linking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkArticle}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              disabled={!selectedArticle || linking}
            >
                {linking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Linking...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Link Article
                  </>
                )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
