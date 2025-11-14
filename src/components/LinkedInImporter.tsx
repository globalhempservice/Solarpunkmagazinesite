import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, Link as LinkIcon, FileText, CheckCircle, AlertCircle, Sparkles, Info } from 'lucide-react'
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
}

export function LinkedInImporter({ accessToken, onArticleCreated }: LinkedInImporterProps) {
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null)
  const [error, setError] = useState('')
  
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
      
      // Pre-fill form fields
      setTitle(data.title || '')
      setContent(data.content || '')
      setCoverImage(data.images?.[0] || '')
      setTags(data.hashtags?.join(', ') || '')

      if (data.images && data.images.length > 0) {
        toast.success(`LinkedIn post parsed! Found ${data.images.length} image(s)`)
      } else if (data.content && data.content !== 'Please copy the post content from LinkedIn and paste it here.') {
        toast.success('LinkedIn post parsed! (Images were skipped - LinkedIn CDN is protected)')
      } else {
        toast.info('LinkedIn content ready - please paste your post content manually')
      }
    } catch (err: any) {
      console.error('Error parsing LinkedIn post:', err)
      setError(err.message || 'Failed to parse LinkedIn post. Please try again.')
      toast.error('Failed to parse LinkedIn post')
    } finally {
      setParsing(false)
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