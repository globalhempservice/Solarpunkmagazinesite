import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, Link as LinkIcon, FileText, CheckCircle, AlertCircle, Sparkles, ExternalLink, Search } from 'lucide-react'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface LinkedInImporterProps {
  accessToken: string
  onArticleCreated?: () => void
}

interface ParsedContent {
  title: string
  content: string
  author?: string
  date?: string
  images?: string[]
  hashtags?: string[]
  embeddedUrls?: string[]
}

interface EmbeddedContentData {
  url: string
  title: string
  description: string
  content: string
  image: string
  images: string[]
}

export function LinkedInImporter({ accessToken, onArticleCreated }: LinkedInImporterProps) {
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null)
  const [error, setError] = useState('')
  const [fetchingUrls, setFetchingUrls] = useState<Set<string>>(new Set())
  const [fetchedContent, setFetchedContent] = useState<Map<string, EmbeddedContentData>>(new Map())
  
  // Article form fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('sustainability')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')

  const categories = [
    'sustainability',
    'technology',
    'culture',
    'health',
    'innovation',
    'community',
    'hemp'
  ]

  const handleParseLinkedIn = async () => {
    if (!linkedInUrl.trim()) {
      setError('Please enter a LinkedIn post URL')
      return
    }

    // Validate LinkedIn URL
    if (!linkedInUrl.includes('linkedin.com/posts/') && !linkedInUrl.includes('linkedin.com/feed/update/')) {
      setError('Please enter a valid LinkedIn post URL')
      return
    }

    setError('')
    setParsing(true)
    setParsedContent(null)
    setFetchedContent(new Map())

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/parse-linkedin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: linkedInUrl }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse LinkedIn post')
      }

      setParsedContent(data)
      
      // Pre-fill form fields (without embedded content initially)
      setTitle(data.title || '')
      setContent(data.content || '')
      setCoverImage(data.images?.[0] || '')
      setTags(data.hashtags?.join(', ') || '')

      // Success toast
      let successMessage = 'LinkedIn post parsed!'
      if (data.images && data.images.length > 0) {
        successMessage += ` Found ${data.images.length} image(s).`
      }
      if (data.embeddedUrls && data.embeddedUrls.length > 0) {
        successMessage += ` Found ${data.embeddedUrls.length} embedded URL(s)!`
      }
      
      toast.success(successMessage)
    } catch (err: any) {
      console.error('Error parsing LinkedIn post:', err)
      setError(err.message || 'Failed to parse LinkedIn post. Please try again.')
      toast.error('Failed to parse LinkedIn post')
    } finally {
      setParsing(false)
    }
  }

  const handleDigDeeper = async (url: string) => {
    // Add to fetching set
    setFetchingUrls(prev => new Set(prev).add(url))

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/fetch-embedded-url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch embedded content')
      }

      // Store fetched content
      setFetchedContent(prev => {
        const newMap = new Map(prev)
        newMap.set(url, data)
        return newMap
      })

      // Append content to the textarea
      setContent(prevContent => {
        let newContent = prevContent

        // Add separator if not already there
        if (!newContent.endsWith('\n\n---\n\n') && !newContent.endsWith('\n\n')) {
          newContent += '\n\n---\n\n'
        } else if (!newContent.endsWith('\n\n---\n\n')) {
          newContent += '---\n\n'
        }

        // Add embedded article
        newContent += `## ${data.title}\n\n`
        
        if (data.description) {
          newContent += `${data.description}\n\n`
        }
        
        if (data.content) {
          newContent += `${data.content}\n\n`
        }
        
        newContent += `[Read original article](${url})\n\n`

        return newContent
      })

      toast.success(`Content from "${data.title}" added to article!`)
    } catch (err: any) {
      console.error('Error fetching embedded content:', err)
      toast.error(`Failed to fetch content from URL`)
    } finally {
      // Remove from fetching set
      setFetchingUrls(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }
  }

  const handleCreateArticle = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Convert parsed images to media attachments
      const mediaAttachments = parsedContent?.images?.map((imageUrl, index) => ({
        type: 'image',
        url: imageUrl,
        caption: `Image ${index + 1} from LinkedIn post`,
        position: index
      })) || []
      
      // Add embedded content images to media attachments
      let currentPosition = mediaAttachments.length
      for (const [url, embeddedData] of fetchedContent.entries()) {
        if (embeddedData.images && embeddedData.images.length > 0) {
          for (const img of embeddedData.images) {
            mediaAttachments.push({
              type: 'image',
              url: img,
              caption: `From: ${embeddedData.title}`,
              position: currentPosition++
            })
          }
        }
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/articles`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            category,
            content: content.trim(),
            coverImage: coverImage.trim() || undefined,
            media: mediaAttachments,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            source: 'linkedin',
            sourceUrl: linkedInUrl,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create article')
      }

      toast.success('Article created successfully!')
      
      // Reset form
      setLinkedInUrl('')
      setParsedContent(null)
      setFetchedContent(new Map())
      setTitle('')
      setContent('')
      setCoverImage('')
      setTags('')
      
      if (onArticleCreated) {
        onArticleCreated()
      }
    } catch (err: any) {
      console.error('Error creating article:', err)
      setError(err.message || 'Failed to create article. Please try again.')
      toast.error('Failed to create article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Parse LinkedIn URL */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            <CardTitle>Step 1: Import LinkedIn Post</CardTitle>
          </div>
          <CardDescription>
            Paste a LinkedIn post URL to automatically extract content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Post URL</Label>
            <div className="flex gap-2">
              <Input
                id="linkedin-url"
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="flex-1"
                disabled={parsing}
              />
              <Button
                onClick={handleParseLinkedIn}
                disabled={parsing || !linkedInUrl.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse
                  </>
                )}
              </Button>
            </div>
          </div>

          {parsedContent && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription>
                Successfully extracted content from LinkedIn post! Review and edit below.
                {parsedContent.images && parsedContent.images.length > 0 && (
                  <span className="block mt-2">
                    Found {parsedContent.images.length} image{parsedContent.images.length > 1 ? 's' : ''} that will be attached as media.
                  </span>
                )}
                {parsedContent.embeddedUrls && parsedContent.embeddedUrls.length > 0 && (
                  <span className="block mt-2 font-bold text-emerald-700 dark:text-emerald-300">
                    🔗 Found {parsedContent.embeddedUrls.length} embedded URL{parsedContent.embeddedUrls.length > 1 ? 's' : ''} - click "Dig Deeper" below to extract content!
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {error && !parsedContent && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 1.5: Dig Deeper - Embedded URLs */}
      {parsedContent && parsedContent.embeddedUrls && parsedContent.embeddedUrls.length > 0 && (
        <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Dig Deeper - Embedded Links</CardTitle>
            </div>
            <CardDescription>
              Click to extract full content from linked articles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {parsedContent.embeddedUrls.map((url, idx) => {
              const isFetching = fetchingUrls.has(url)
              const hasFetched = fetchedContent.has(url)
              const embeddedData = fetchedContent.get(url)

              return (
                <div key={idx} className="p-4 bg-card border-2 border-border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{url}</span>
                      </div>
                      {hasFetched && embeddedData && (
                        <div className="mt-2">
                          <h4 className="font-semibold text-foreground mb-1">{embeddedData.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{embeddedData.description}</p>
                          {embeddedData.images && embeddedData.images.length > 0 && (
                            <Badge variant="secondary" className="mt-2">
                              {embeddedData.images.length} image{embeddedData.images.length > 1 ? 's' : ''} found
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDigDeeper(url)}
                      disabled={isFetching || hasFetched}
                      size="sm"
                      className={hasFetched 
                        ? "bg-emerald-500 hover:bg-emerald-600" 
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      }
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : hasFetched ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Added
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Dig Deeper
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Edit and Create Article */}
      {parsedContent && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Step 2: Review and Create Article</CardTitle>
            </div>
            <CardDescription>
              Edit the extracted content and publish to DEWII
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="capitalize">{cat}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Article content..."
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                {content.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover-image">Cover Image URL</Label>
              <Input
                id="cover-image"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="sustainability, hemp, innovation"
              />
              {tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.split(',').map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleCreateArticle}
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Article...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Article
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}