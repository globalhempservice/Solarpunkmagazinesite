import { useState } from 'react'
import { Rss, Loader, ExternalLink, Check, X, Eye, RefreshCw, Trash2, Globe, Calendar, User, Zap, BookOpen } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

interface RSSFeedManagerProps {
  accessToken: string
  serverUrl: string
  onClose?: () => void
}

interface RSSFeed {
  id: string
  url: string
  title: string
  description?: string
  link?: string
  addedAt: string
  lastFetchedAt?: string
  isActive: boolean
}

interface RSSArticle {
  id: string
  feedId: string
  feedTitle: string
  feedUrl: string
  title: string
  link: string
  description?: string
  content?: string
  author?: string
  publishedAt?: string
  imageUrl?: string
  category?: string
  status: 'pending' | 'published' | 'rejected'
  fetchedAt: string
  publishedToMagazineAt?: string // Added for published articles
}

export function RSSFeedManager({ accessToken, serverUrl, onClose }: RSSFeedManagerProps) {
  const [feedUrl, setFeedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<{
    feed: { title: string; description?: string; link?: string; url: string }
    articles: Partial<RSSArticle>[]
  } | null>(null)
  const [subscribedFeeds, setSubscribedFeeds] = useState<RSSFeed[]>([])
  const [pendingArticles, setPendingArticles] = useState<RSSArticle[]>([])
  const [publishedArticles, setPublishedArticles] = useState<RSSArticle[]>([]) // New state for published articles
  const [view, setView] = useState<'add' | 'feeds' | 'pending' | 'published'>('add') // Added 'published' view
  const [fetchingFeedId, setFetchingFeedId] = useState<string | null>(null)

  // Detect if URL looks like an RSS feed
  const isRSSUrl = (url: string): boolean => {
    const rssPatterns = [
      /\.xml$/i,
      /\/feed\/?$/i,
      /\/rss\/?$/i,
      /\/atom\/?$/i,
      /feeds?\./i,
      /rss\./i
    ]
    return rssPatterns.some(pattern => pattern.test(url))
  }

  const handlePreview = async () => {
    if (!feedUrl.trim()) {
      toast.error('Please enter a feed URL')
      return
    }

    console.log('🔍 RSS Preview - Starting preview for URL:', feedUrl)
    setPreviewLoading(true)
    setPreview(null)

    try {
      console.log('📡 Sending request to:', `${serverUrl}/rss-feeds/preview`)
      const response = await fetch(`${serverUrl}/rss-feeds/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ feedUrl: feedUrl.trim() })
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Preview error response:', error)
        throw new Error(error.error || 'Failed to preview feed')
      }

      const data = await response.json()
      console.log('✅ Preview data received:', data)
      setPreview(data)
      toast.success(`Preview loaded: ${data.feed.title}`)
    } catch (error: any) {
      console.error('❌ Preview error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        feedUrl: feedUrl
      })
      toast.error(error.message || 'Failed to preview RSS feed')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!feedUrl.trim()) {
      toast.error('Please enter a feed URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${serverUrl}/rss-feeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ feedUrl: feedUrl.trim() })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to subscribe to feed')
      }

      const data = await response.json()
      toast.success(`Subscribed to ${data.feed.title}!`, {
        description: `${data.articlesPreview.length} articles fetched`
      })
      
      setFeedUrl('')
      setPreview(null)
      loadSubscribedFeeds()
      loadPendingArticles()
      setView('pending')
    } catch (error: any) {
      console.error('Subscribe error:', error)
      toast.error(error.message || 'Failed to subscribe to feed')
    } finally {
      setLoading(false)
    }
  }

  const loadSubscribedFeeds = async () => {
    try {
      const response = await fetch(`${serverUrl}/rss-feeds`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to load feeds')

      const data = await response.json()
      setSubscribedFeeds(data.feeds)
    } catch (error: any) {
      console.error('Load feeds error:', error)
      toast.error('Failed to load subscribed feeds')
    }
  }

  const loadPendingArticles = async () => {
    try {
      const response = await fetch(`${serverUrl}/rss-articles/pending`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to load articles')

      const data = await response.json()
      setPendingArticles(data.articles)
    } catch (error: any) {
      console.error('Load articles error:', error)
      toast.error('Failed to load pending articles')
    }
  }

  const handleFetchArticles = async (feedId: string) => {
    setFetchingFeedId(feedId)
    
    try {
      const response = await fetch(`${serverUrl}/rss-feeds/${feedId}/fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch articles')
      }

      const data = await response.json()
      toast.success(`Fetched ${data.newArticlesCount} new articles`)
      loadPendingArticles()
      loadSubscribedFeeds()
    } catch (error: any) {
      console.error('Fetch articles error:', error)
      toast.error(error.message || 'Failed to fetch articles')
    } finally {
      setFetchingFeedId(null)
    }
  }

  const handlePublishArticle = async (articleId: string, category: string) => {
    try {
      const response = await fetch(`${serverUrl}/rss-articles/${articleId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ category })
      })

      if (!response.ok) {
        const error = await response.json()
        // Check if the article is already published - this is not an error, just inform the user
        if (error.error === 'Article already published') {
          toast.info('This article is already published')
          // Refresh both lists to update UI
          loadPendingArticles()
          loadPublishedArticles()
          return
        }
        throw new Error(error.error || 'Failed to publish article')
      }

      toast.success('Article published to magazine!')
      loadPendingArticles()
      loadPublishedArticles()
    } catch (error: any) {
      console.error('Publish error:', error)
      toast.error(error.message || 'Failed to publish article')
    }
  }

  const handleRejectArticle = async (articleId: string) => {
    try {
      const response = await fetch(`${serverUrl}/rss-articles/${articleId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject article')
      }

      toast.info('Article rejected')
      loadPendingArticles()
    } catch (error: any) {
      console.error('Reject error:', error)
      toast.error(error.message || 'Failed to reject article')
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to unsubscribe from this feed?')) return

    try {
      const response = await fetch(`${serverUrl}/rss-feeds/${feedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete feed')

      toast.success('Unsubscribed from feed')
      loadSubscribedFeeds()
    } catch (error: any) {
      console.error('Delete feed error:', error)
      toast.error('Failed to unsubscribe')
    }
  }

  const loadPublishedArticles = async () => {
    try {
      console.log('📰 Loading published RSS articles...')
      const response = await fetch(`${serverUrl}/rss-articles/published`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to load published articles')

      const data = await response.json()
      console.log('✅ Published articles loaded:', data.articles.length)
      setPublishedArticles(data.articles)
    } catch (error: any) {
      console.error('Load published articles error:', error)
      toast.error('Failed to load published articles')
    }
  }

  // Load data when switching views
  const handleViewChange = (newView: 'add' | 'feeds' | 'pending' | 'published') => {
    setView(newView)
    if (newView === 'feeds') loadSubscribedFeeds()
    if (newView === 'pending') loadPendingArticles()
    if (newView === 'published') loadPublishedArticles()
  }

  const categories = ['Renewable Energy', 'Sustainable Tech', 'Green Cities', 'Eco Innovation', 'Climate Action', 'Community', 'Future Vision']

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-400 via-teal-400 to-green-500 rounded-2xl">
            <Rss className="w-6 h-6 text-emerald-950" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-black">RSS Feed Manager</h2>
            <p className="text-sm text-muted-foreground">Populate magazine with curated news</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => handleViewChange('add')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'add'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Add Feed
        </button>
        <button
          onClick={() => handleViewChange('feeds')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'feeds'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Feeds ({subscribedFeeds.length})
        </button>
        <button
          onClick={() => handleViewChange('pending')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'pending'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending ({pendingArticles.length})
        </button>
        <button
          onClick={() => handleViewChange('published')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'published'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Published ({publishedArticles.length})
        </button>
      </div>

      {/* Add Feed View */}
      {view === 'add' && (
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">RSS Feed URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handlePreview}
                  disabled={previewLoading || !feedUrl.trim()}
                  variant="outline"
                >
                  {previewLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Preview
                </Button>
              </div>
              {feedUrl && isRSSUrl(feedUrl) && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Rss className="w-3 h-3" /> RSS feed detected
                </p>
              )}
            </div>

            {preview && (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <h3 className="font-bold text-lg">{preview.feed.title}</h3>
                  {preview.feed.description && (
                    <p className="text-sm text-muted-foreground">{preview.feed.description}</p>
                  )}
                  {preview.feed.link && (
                    <a
                      href={preview.feed.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      {preview.feed.link}
                    </a>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Latest Articles ({preview.articles.length})</p>
                  
                  {/* Detailed view of the FIRST article */}
                  {preview.articles[0] && (
                    <div className="mb-4 p-4 border-2 border-emerald-500/30 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                      <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Latest Article - Full Preview
                      </p>
                      
                      {preview.articles[0].imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={preview.articles[0].imageUrl} 
                            alt={preview.articles[0].title}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="font-bold text-base">{preview.articles[0].title}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          {preview.articles[0].author && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {preview.articles[0].author}
                            </Badge>
                          )}
                          {preview.articles[0].category && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              📁 {preview.articles[0].category}
                            </Badge>
                          )}
                          {preview.articles[0].publishedAt && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(preview.articles[0].publishedAt).toLocaleDateString()}
                            </Badge>
                          )}
                          {preview.articles[0].imageUrl && (
                            <Badge variant="outline" className="flex items-center gap-1 text-emerald-600">
                              ✓ Has Image
                            </Badge>
                          )}
                        </div>
                        
                        {preview.articles[0].description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{preview.articles[0].description}</p>
                        )}
                        
                        {preview.articles[0].content && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-primary hover:underline">Show full content preview</summary>
                            <p className="mt-2 text-muted-foreground line-clamp-6">{preview.articles[0].content}</p>
                          </details>
                        )}
                        
                        <a
                          href={preview.articles[0].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View original article
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Compact list of other articles */}
                  {preview.articles.length > 1 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <p className="text-xs font-semibold text-muted-foreground">Other Recent Articles:</p>
                      {preview.articles.slice(1).map((article, idx) => (
                        <div key={idx} className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors">
                          <div className="flex gap-3">
                            {article.imageUrl && (
                              <img 
                                src={article.imageUrl} 
                                alt={article.title}
                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold line-clamp-2">{article.title}</p>
                              {article.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{article.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {article.author && (
                                  <span className="text-xs text-muted-foreground">By {article.author}</span>
                                )}
                                {article.category && (
                                  <span className="text-xs text-emerald-600">• {article.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Subscribe to Feed
                    </>
                  )}
                </Button>
                
                {/* MAGAZINE CARD PREVIEW - Standardized External Article Card */}
                {preview.articles[0] && (
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        Magazine Card Preview - External Curated Content
                      </h4>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-lg">
                        <Zap className="w-4 h-4 text-amber-900" strokeWidth={2.5} fill="currentColor" />
                        <span className="font-black text-amber-900 text-sm">+5</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These cards appear in your feed and swipe mode. Clicking opens the original article in a new tab and rewards +5 points.
                    </p>
                    
                    {/* THE ACTUAL CARD PREVIEW - Standardized External Article Card */}
                    <div className="relative group cursor-pointer">
                      {/* Comic-style card with neon border and drop shadow */}
                      <div className="relative rounded-3xl p-[3px] bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 shadow-[0_8px_0_rgba(0,0,0,0.2),0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_0_rgba(0,0,0,0.25),0_0_50px_rgba(16,185,129,0.5)] active:shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 transition-all duration-300 border-2 border-white/20">
                        {/* Inner card with solarpunk styling */}
                        <div className="relative rounded-[22px] bg-card overflow-hidden h-full">
                          {/* Halftone pattern overlay */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{
                            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)',
                            backgroundSize: '12px 12px'
                          }} />
                          
                          {/* Ambient neon glow effect - base layer */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-600/10 transition-opacity duration-500 pointer-events-none z-10" />
                          
                          {/* HOVER OVERLAY - Attractive CTA with points and READ NOW button */}
                          <div className="absolute inset-0 z-30 bg-gradient-to-br from-emerald-500/95 via-teal-500/95 to-green-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 p-8 backdrop-blur-sm">
                            {/* Halftone on overlay */}
                            <div className="absolute inset-0 opacity-[0.08]" style={{
                              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.6) 1.5px, transparent 1.5px)',
                              backgroundSize: '16px 16px'
                            }} />
                            
                            {/* RSS Icon - Large and centered */}
                            <div className="relative">
                              <div className="absolute inset-0 blur-2xl opacity-50 bg-white rounded-full" />
                              <div className="relative p-6 bg-white/20 rounded-full border-4 border-white/40 shadow-[0_8px_0_rgba(0,0,0,0.2)]">
                                <Rss className="w-12 h-12 text-white drop-shadow-2xl" strokeWidth={2.5} />
                              </div>
                            </div>
                            
                            {/* Category Name */}
                            <div className="relative text-center">
                              <h3 className="font-black text-white drop-shadow-2xl tracking-wide" style={{
                                textShadow: '2px 2px 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)',
                                fontSize: '1.5rem'
                              }}>
                                {preview.articles[0].category || 'Eco Innovation'}
                              </h3>
                              <p className="text-white/90 font-bold mt-1">External Article</p>
                            </div>
                            
                            {/* Points Badge - Attractive and prominent */}
                            <div className="relative">
                              <div className="absolute inset-0 blur-xl opacity-60 bg-amber-400 rounded-full animate-pulse" />
                              <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full border-4 border-white/50 shadow-[0_6px_0_rgba(0,0,0,0.25)]">
                                <Zap className="w-6 h-6 text-amber-900 drop-shadow-lg" strokeWidth={3} fill="currentColor" />
                                <div className="flex flex-col items-center">
                                  <span className="font-black text-amber-900 drop-shadow-lg" style={{
                                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                                    fontSize: '1.25rem',
                                    lineHeight: 1
                                  }}>
                                    +5 POINTS
                                  </span>
                                </div>
                                <Zap className="w-6 h-6 text-amber-900 drop-shadow-lg" strokeWidth={3} fill="currentColor" />
                              </div>
                            </div>
                            
                            {/* READ NOW Button - Big and inviting */}
                            <div className="relative mt-2">
                              <div className="absolute inset-0 blur-xl opacity-60 bg-white rounded-2xl" />
                              <button 
                                onClick={() => window.open(preview.articles[0].link, '_blank')}
                                className="relative px-12 py-4 bg-white rounded-2xl border-4 border-white/60 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.35)] active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition-all duration-200 group/btn"
                              >
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg group-hover/btn:scale-110 transition-transform" strokeWidth={3} />
                                  <span className="font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg tracking-wider" style={{
                                    fontSize: '1.5rem'
                                  }}>
                                    READ NOW
                                  </span>
                                  <ExternalLink className="w-5 h-5 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-lg group-hover/btn:scale-110 transition-transform" strokeWidth={3} />
                                </div>
                              </button>
                            </div>
                            
                            {/* Source hint */}
                            <div className="relative flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border-2 border-white/20">
                              <Globe className="w-4 h-4 text-white" />
                              <span className="font-black text-white text-sm drop-shadow-lg">via {preview.feed.title}</span>
                            </div>
                          </div>
                          
                          {/* Image section with comic energy */}
                          <div className="aspect-video overflow-hidden relative">
                            {preview.articles[0].imageUrl ? (
                              <div className="relative w-full h-full">
                                {/* Dramatic gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                                
                                {/* Hemp fiber texture overlay */}
                                <div className="absolute inset-0 opacity-[0.08] z-10 mix-blend-overlay" style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                  backgroundSize: '30px 30px'
                                }} />
                                
                                <img
                                  src={preview.articles[0].imageUrl}
                                  alt={preview.articles[0].title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                              </div>
                            ) : (
                              <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Rss className="w-24 h-24 text-white/20" strokeWidth={1.5} />
                                </div>
                              </div>
                            )}
                            
                            {/* RSS badge - only visible when NOT hovering */}
                            <div className="absolute top-4 left-4 z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.3)] border-2 border-white/30 backdrop-blur-sm">
                                <Rss className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={2.5} />
                                <span className="font-black text-white drop-shadow-lg" style={{
                                  textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                                }}>RSS FEED</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content section - Hidden on hover */}
                          <div className="relative p-6 space-y-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                            {/* Title */}
                            <h3 className="font-black text-xl leading-tight line-clamp-2">
                              {preview.articles[0].title}
                            </h3>
                            
                            {/* Author info */}
                            {preview.articles[0].author && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
                                  {preview.articles[0].author.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{preview.articles[0].author}</p>
                                  <p className="text-xs text-muted-foreground">via {preview.feed.title}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Excerpt */}
                            {preview.articles[0].description && (
                              <p className="text-foreground/90 leading-relaxed line-clamp-2 text-sm">
                                {preview.articles[0].description}
                              </p>
                            )}
                            
                            {/* Bottom metadata bar with comic styling */}
                            <div className="flex items-center justify-between pt-3 border-t-2 border-border/30">
                              <div className="flex items-center gap-3">
                                {/* Date badge */}
                                {preview.articles[0].publishedAt && (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs font-black text-muted-foreground">
                                      {new Date(preview.articles[0].publishedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                
                                {/* External link indicator */}
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-xs font-black text-emerald-600">EXTERNAL</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* My Feeds View */}
      {view === 'feeds' && (
        <div className="space-y-3">
          {subscribedFeeds.length === 0 ? (
            <Card className="p-8 text-center">
              <Rss className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No RSS feeds subscribed yet</p>
              <Button onClick={() => setView('add')} className="mt-4" variant="outline">
                Add Your First Feed
              </Button>
            </Card>
          ) : (
            subscribedFeeds.map(feed => (
              <Card key={feed.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold">{feed.title}</h3>
                    {feed.description && (
                      <p className="text-sm text-muted-foreground mt-1">{feed.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <a href={feed.link || feed.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {feed.link || feed.url}
                        </a>
                      </span>
                      {feed.lastFetchedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last: {new Date(feed.lastFetchedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFetchArticles(feed.id)}
                      disabled={fetchingFeedId === feed.id}
                    >
                      {fetchingFeedId === feed.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteFeed(feed.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pending Articles View */}
      {view === 'pending' && (
        <div className="space-y-3">
          {pendingArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <Check className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No pending articles</p>
              <Button onClick={() => setView('feeds')} className="mt-4" variant="outline">
                Fetch from Feeds
              </Button>
            </Card>
          ) : (
            pendingArticles.map(article => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-4">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-bold">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {article.feedTitle}
                        </Badge>
                        {article.author && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {article.author}
                          </span>
                        )}
                      </div>
                    </div>
                    {article.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Original
                      </a>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <select
                        className="text-sm border rounded px-2 py-1"
                        defaultValue="Eco Innovation"
                        id={`category-${article.id}`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() => {
                          const select = document.getElementById(`category-${article.id}`) as HTMLSelectElement
                          handlePublishArticle(article.id, select.value)
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRejectArticle(article.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Published Articles View */}
      {view === 'published' && (
        <div className="space-y-3">
          {publishedArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No published RSS articles yet</p>
              <Button onClick={() => setView('pending')} className="mt-4" variant="outline">
                Review Pending Articles
              </Button>
            </Card>
          ) : (
            publishedArticles.map(article => (
              <Card key={article.id} className="p-4 border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                <div className="flex gap-4">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">
                          ✓ Published to Magazine
                        </Badge>
                      </div>
                      <h3 className="font-bold">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {article.feedTitle}
                        </Badge>
                        {article.author && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {article.author}
                          </span>
                        )}
                      </div>
                    </div>
                    {article.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {article.category && (
                        <Badge variant="outline" className="text-xs">
                          📁 {article.category}
                        </Badge>
                      )}
                      {article.publishedToMagazineAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.publishedToMagazineAt).toLocaleDateString()}
                        </span>
                      )}
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Original
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}