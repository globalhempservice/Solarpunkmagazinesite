import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Plus, Trash2, Youtube, Music, Image as ImageIcon, Sparkles, Target, Award, CheckCircle2, Circle, Link as LinkIcon, ExternalLink, Loader2, Star } from "lucide-react"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Alert, AlertDescription } from "./ui/alert"
import { toast } from "sonner"
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface MediaItem {
  type: 'youtube' | 'audio' | 'image'
  url: string
  caption?: string
}

interface ArticleEditorProps {
  onSave: (article: {
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media: MediaItem[]
    coverImage?: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
  }) => void
  onCancel: () => void
  onNavigateToLinkedIn?: () => void
  initialData?: {
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media: MediaItem[]
    coverImage?: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
  }
  article?: {
    id: string
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media?: MediaItem[]
    coverImage?: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
  }
  onUpdate?: (article: {
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media: MediaItem[]
    coverImage?: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
  }) => void
}

const categories = [
  'Renewable Energy',
  'Sustainable Tech',
  'Green Cities',
  'Eco Innovation',
  'Climate Action',
  'Community',
  'Future Vision'
]

export function ArticleEditor({ onSave, onCancel, onNavigateToLinkedIn, initialData, article, onUpdate }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || article?.title || '')
  const [content, setContent] = useState(initialData?.content || article?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || article?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || article?.category || categories[0])
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || article?.readingTime || 5)
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || article?.media || [])
  const [coverImage, setCoverImage] = useState<string | undefined>(initialData?.coverImage || article?.coverImage)
  
  // LinkedIn metadata state
  const [author, setAuthor] = useState(initialData?.author || article?.author || '')
  const [authorImage, setAuthorImage] = useState(initialData?.authorImage || article?.authorImage || '')
  const [authorTitle, setAuthorTitle] = useState(initialData?.authorTitle || article?.authorTitle || '')
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || article?.publishDate || '')
  
  const [newMediaType, setNewMediaType] = useState<'youtube' | 'audio' | 'image'>('youtube')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCaption, setNewMediaCaption] = useState('')

  // LinkedIn importer state
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [showLinkedInImporter, setShowLinkedInImporter] = useState(false)
  const [linkedInError, setLinkedInError] = useState('')

  // LinkedIn parsing handler
  const handleParseLinkedIn = async () => {
    if (!linkedInUrl.trim()) {
      setLinkedInError('Please enter a LinkedIn post URL')
      return
    }

    // Validate LinkedIn URL
    if (!linkedInUrl.includes('linkedin.com/posts/') && !linkedInUrl.includes('linkedin.com/feed/update/')) {
      setLinkedInError('Please enter a valid LinkedIn post URL')
      return
    }

    setLinkedInError('')
    setParsing(true)

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

      // Auto-fill form fields
      if (data.title) setTitle(data.title)
      if (data.content) setContent(data.content)
      if (data.content) setExcerpt(data.content.substring(0, 150))
      
      // LinkedIn metadata
      if (data.author) setAuthor(data.author)
      if (data.authorImage) setAuthorImage(data.authorImage)
      if (data.authorTitle) setAuthorTitle(data.authorTitle)
      if (data.publishDate) setPublishDate(data.publishDate)
      
      // Add images as media
      if (data.images && data.images.length > 0) {
        const imageMedia = data.images.map((url: string, index: number) => ({
          type: 'image' as const,
          url,
          caption: `Image ${index + 1} from LinkedIn post`
        }))
        setMedia([...media, ...imageMedia])
        toast.success(`✅ LinkedIn post imported! Found ${data.images.length} image(s)${data.author ? ` by ${data.author}` : ''}`)
      } else if (data.content && data.content !== 'Please copy the post content from LinkedIn and paste it here.') {
        toast.success(`✅ LinkedIn post imported!${data.author ? ` Author: ${data.author}` : ''}`)
      } else {
        toast.info('LinkedIn content ready - please paste post content manually')
      }

      // Collapse the importer after successful import
      setShowLinkedInImporter(false)
      setLinkedInUrl('')
    } catch (err: any) {
      console.error('Error parsing LinkedIn post:', err)
      setLinkedInError(err.message || 'Failed to parse LinkedIn post. Please try again.')
      toast.error('Failed to parse LinkedIn post')
    } finally {
      setParsing(false)
    }
  }

  // Calculate article quality score
  const calculateScore = () => {
    let score = 0
    const checks = []
    
    // Title (20%)
    if (title.trim().length > 0) {
      score += 20
      checks.push({ label: 'Title added', value: 20, completed: true })
    } else {
      checks.push({ label: 'Add a title', value: 20, completed: false })
    }
    
    // Content (30%)
    if (content.trim().length > 100) {
      score += 30
      checks.push({ label: 'Content written (100+ chars)', value: 30, completed: true })
    } else {
      checks.push({ label: 'Write content (100+ chars)', value: 30, completed: false })
    }
    
    // Category (15%)
    if (category) {
      score += 15
      checks.push({ label: 'Category selected', value: 15, completed: true })
    } else {
      checks.push({ label: 'Select a category', value: 15, completed: false })
    }
    
    // Excerpt (15%)
    if (excerpt.trim().length > 0) {
      score += 15
      checks.push({ label: 'Excerpt added', value: 15, completed: true })
    } else {
      checks.push({ label: 'Add an excerpt', value: 15, completed: false })
    }
    
    // Reading time (10%)
    if (readingTime > 0) {
      score += 10
      checks.push({ label: 'Reading time set', value: 10, completed: true })
    } else {
      checks.push({ label: 'Set reading time', value: 10, completed: false })
    }
    
    // Media (10%)
    if (media.length > 0) {
      score += 10
      checks.push({ label: 'Media attached', value: 10, completed: true })
    } else {
      checks.push({ label: 'Add media (optional)', value: 10, completed: false })
    }
    
    return { score, checks }
  }

  const { score, checks } = calculateScore()

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500'
    if (score >= 70) return 'from-blue-500 to-cyan-500'
    if (score >= 50) return 'from-amber-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return '🌟 Excellent! Your article is ready to publish!'
    if (score >= 70) return '✨ Great progress! Almost there!'
    if (score >= 50) return '💪 Good start! Keep going!'
    return '🚀 Let\'s create something amazing!'
  }

  const handleAddMedia = () => {
    if (!newMediaUrl) return
    
    setMedia([...media, {
      type: newMediaType,
      url: newMediaUrl,
      caption: newMediaCaption
    }])
    
    setNewMediaUrl('')
    setNewMediaCaption('')
  }

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !content) {
      alert('Please fill in title and content')
      return
    }
    
    const articleData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150),
      category,
      readingTime,
      media,
      coverImage,
      author,
      authorImage,
      authorTitle,
      publishDate
    }
    
    // If editing, use onUpdate, otherwise use onSave
    if (article && onUpdate) {
      onUpdate(articleData)
    } else {
      onSave(articleData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-32 md:pb-36">
      {/* Article Quality Score Card */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score)}/20 animate-gradient-xy`} />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-br ${getScoreColor(score)}/30 rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <Card className="relative backdrop-blur-xl bg-card/80 border-2 border-primary/30 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-6 flex-wrap mb-6">
              {/* Left: Score Badge */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className={`absolute -inset-4 bg-gradient-to-r ${getScoreColor(score)} rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-pulse`} />
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score)} blur-xl opacity-75`} />
                    <div className={`relative bg-gradient-to-br ${getScoreColor(score)} rounded-2xl p-5 transform group-hover:scale-105 transition-transform duration-300`}>
                      {score >= 90 ? (
                        <Award className="w-12 h-12 text-white drop-shadow-lg" />
                      ) : (
                        <Target className="w-12 h-12 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                      {score}%
                    </h3>
                    <Sparkles className={`w-5 h-5 text-primary ${score >= 90 ? 'animate-pulse' : ''}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">Article Quality Score</p>
                </div>
              </div>

              {/* Right: Message */}
              <div className="text-right">
                <p className="text-base md:text-lg font-medium text-foreground">
                  {getScoreMessage(score)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              <div 
                className={`relative h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${score}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    check.completed
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-muted/30 border-border/30'
                  }`}
                >
                  {check.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${check.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {check.label}
                    </p>
                  </div>
                  <Badge variant={check.completed ? "default" : "outline"} className="text-xs">
                    {check.value}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LinkedIn Post Importer Card */}
      <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-card/50 to-cyan-500/5 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-4 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                LinkedIn Post Importer
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                  Auto-fill
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Paste a LinkedIn post URL to automatically extract and fill content below
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
              ⚡ Auto-extract content
            </Badge>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-0">
              📝 Fill form fields
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
              🖼️ Import images
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Post URL</Label>
            <div className="flex gap-2">
              <Input
                id="linkedin-url"
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="flex-1 h-11 border-2"
                disabled={parsing}
              />
              <Button
                type="button"
                onClick={handleParseLinkedIn}
                disabled={parsing || !linkedInUrl.trim()}
                className="h-11 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>

          {linkedInError && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <Circle className="h-4 w-4 text-destructive" />
              <AlertDescription>{linkedInError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Media Attachments Card - MOVED UP */}
      <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
              <Sparkles className="relative w-5 h-5 text-purple-500" />
            </div>
            Media Attachments
            <Badge variant="outline" className="ml-auto bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400">
              Optional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select value={newMediaType} onValueChange={(value: any) => setNewMediaType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">📹 YouTube Video</SelectItem>
                    <SelectItem value="audio">🎵 Audio (MP3)</SelectItem>
                    <SelectItem value="image">🖼️ Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>URL</Label>
                <Input
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder={
                    newMediaType === 'youtube' ? 'https://youtube.com/watch?v=...' :
                    newMediaType === 'audio' ? 'https://example.com/audio.mp3' :
                    'https://example.com/image.jpg'
                  }
                  className="border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={newMediaCaption}
                onChange={(e) => setNewMediaCaption(e.target.value)}
                placeholder="Add a caption for this media..."
                className="border-2"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddMedia}
              variant="outline"
              className="w-full hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all border-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>

          {/* Media Library - Always Visible */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label>Media Library ({media.length})</Label>
              {coverImage && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  ✨ Cover Image Set
                </Badge>
              )}
            </div>
            
            {media.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No media attached yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add images, videos, or audio above
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {media.map((item, index) => {
                  const Icon = getMediaIcon(item.type)
                  const isYouTube = item.type === 'youtube'
                  const isAudio = item.type === 'audio'
                  const isImage = item.type === 'image'
                  const isCover = coverImage === item.url
                  
                  return (
                    <div
                      key={index}
                      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                        isCover 
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/20' 
                          : 'border-border/50 hover:border-primary/30 bg-gradient-to-br from-muted/50 to-muted/20'
                      }`}
                    >
                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                            <Star className="w-3 h-3 mr-1 fill-white" />
                            Cover Image
                          </Badge>
                        </div>
                      )}

                      {/* Media Preview */}
                      <div className="relative aspect-video bg-muted/50">
                        {isImage && (
                          <img 
                            src={item.url} 
                            alt={item.caption || 'Media preview'} 
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              console.log('Image loaded successfully:', item.url)
                            }}
                            onError={(e) => {
                              console.error('Failed to load image:', item.url)
                              console.log('Falling back to placeholder image')
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'
                            }}
                            crossOrigin="anonymous"
                          />
                        )}
                        
                        {isYouTube && (
                          <div className="relative w-full h-full">
                            <img 
                              src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/maxresdefault.jpg`}
                              alt="YouTube thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeId(item.url)}/0.jpg`
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="bg-red-600 rounded-full p-4">
                                <Youtube className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isAudio && (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Music className="w-16 h-16 text-purple-500 mb-2" />
                            <p className="text-sm text-muted-foreground">Audio File</p>
                          </div>
                        )}
                      </div>

                      {/* Media Info & Actions */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-0">
                              {item.type}
                            </Badge>
                            <p className="text-xs truncate text-foreground font-medium">{item.url}</p>
                            {item.caption && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {item.caption}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {isImage && (
                            <Button
                              type="button"
                              variant={isCover ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCoverImage(isCover ? undefined : item.url)}
                              className={`flex-1 ${
                                isCover 
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                  : 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400'
                              }`}
                            >
                              <Star className={`w-3 h-3 mr-1 ${isCover ? 'fill-white' : ''}`} />
                              {isCover ? 'Remove Cover' : 'Set as Cover'}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedia(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Generic Vibe Option */}
            {media.some(m => m.type === 'image') && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverImage(undefined)}
                  disabled={!coverImage}
                  className="w-full hover:bg-slate-500/10 hover:border-slate-500/30 transition-all"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  {coverImage ? 'Switch to Generic Vibe (No Cover Image)' : '✓ Using Generic Vibe'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Article Details Card */}
      <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Sparkles className="relative w-5 h-5 text-primary" />
            </div>
            Article Details
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title..."
              required
              className="text-base h-12 border-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readingTime" className="text-base">Reading Time (minutes) *</Label>
              <Input
                id="readingTime"
                type="number"
                value={readingTime}
                onChange={(e) => setReadingTime(parseInt(e.target.value) || 5)}
                min="1"
                max="60"
                className="h-12 border-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-base">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief, engaging summary..."
              rows={3}
              className="resize-none text-sm border-2"
            />
            <p className="text-xs text-muted-foreground">
              A good excerpt helps readers decide if they want to read more
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-base">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your story, insights, or knowledge..."
              rows={16}
              required
              className="resize-none text-sm sm:text-base font-mono border-2"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters • Aim for at least 100 for a quality article
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Author Metadata Card - NEW */}
      <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-card/50 to-cyan-500/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                Author & Source Information
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                  Optional
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Add author details and original source information (auto-filled from LinkedIn import)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-5">
          {/* Author Information Section */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h4 className="font-semibold text-sm">Author Details</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm">Author Name</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="John Doe"
                  className="h-11 border-2"
                />
                <p className="text-xs text-muted-foreground">
                  Name of the article author or LinkedIn post creator
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorTitle" className="text-sm">Author Title/Role</Label>
                <Input
                  id="authorTitle"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="Sustainability Expert at DEWII"
                  className="h-11 border-2"
                />
                <p className="text-xs text-muted-foreground">
                  Professional title or role of the author
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorImage" className="text-sm">Author Avatar URL</Label>
              <div className="flex gap-2">
                <Input
                  id="authorImage"
                  value={authorImage}
                  onChange={(e) => setAuthorImage(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-11 border-2 flex-1"
                />
                {authorImage && (
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                    <img 
                      src={authorImage} 
                      alt="Author avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Profile picture URL (LinkedIn profile image or other)
              </p>
            </div>
          </div>

          {/* Source Information Section */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <h4 className="font-semibold text-sm">Source Information</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm">Source Platform</Label>
                <Select value={author ? 'LinkedIn' : ''} onValueChange={(value) => {
                  // This is just for display, actual source will be set when parsing
                }}>
                  <SelectTrigger id="source" className="h-11 border-2">
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Original">Original Content</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Where this content was originally published
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishDate" className="text-sm">Original Publish Date</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={publishDate ? new Date(publishDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setPublishDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="h-11 border-2"
                />
                <p className="text-xs text-muted-foreground">
                  When the original content was published
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {(author || authorImage) && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Author Preview</h4>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                  <img 
                    src={authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} 
                    alt={author || 'Author'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{author || 'Author Name'}</p>
                  {authorTitle && (
                    <p className="text-xs text-muted-foreground truncate">{authorTitle}</p>
                  )}
                  {publishDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Published: {new Date(publishDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                  LinkedIn
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="fixed bottom-20 md:bottom-24 left-0 right-0 z-40 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient glow background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(score)}/20 blur-2xl`} />
            
            <div className="relative bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-3xl p-4 shadow-2xl">
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Article Quality</span>
                  <span className={`text-xs font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                    {score}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  <div 
                    className={`relative h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${score}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {/* Cancel Button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  className="relative h-14 px-8 rounded-2xl border-2 overflow-hidden group hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-base font-semibold">Cancel</span>
                </Button>
                
                {/* Publish/Update Button */}
                <Button 
                  type="submit" 
                  disabled={score < 50}
                  className={`relative h-14 px-10 rounded-2xl overflow-hidden group transition-all duration-300 ${
                    score >= 50 ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Animated gradient background */}
                  {score >= 50 && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(score)} opacity-100`} />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className={`absolute -inset-1 bg-gradient-to-r ${getScoreColor(score)} blur-xl opacity-50 group-hover:opacity-75 animate-pulse`} />
                    </>
                  )}
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center gap-2 text-base font-bold text-white drop-shadow-lg">
                    {score >= 50 ? (
                      <>
                        {score >= 90 && <Award className="w-5 h-5" />}
                        {score >= 70 && score < 90 && <Sparkles className="w-5 h-5" />}
                        {score >= 50 && score < 70 && <Target className="w-5 h-5" />}
                        {article ? 'Update Article' : 'Publish Article'}
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5" />
                        Complete {50 - score}% more to publish
                      </>
                    )}
                  </span>
                  
                  {/* Sparkle effects for high scores */}
                  {score >= 90 && (
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
        
        .animate-sparkle {
          animation: sparkle 1.5s infinite ease-in-out;
        }
      `}</style>
    </form>
  )
}

function getMediaIcon(type: 'youtube' | 'audio' | 'image') {
  switch (type) {
    case 'youtube':
      return Youtube
    case 'audio':
      return Music
    case 'image':
      return ImageIcon
  }
}

function getYouTubeId(url: string) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}