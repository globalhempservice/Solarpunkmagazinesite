import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Sparkles, Award, Target, CheckCircle2, Circle, Plus, Trash2, Music, Youtube, ImageIcon, Star, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { SimplifiedURLImporter } from './SimplifiedURLImporter'

// Clean version - no old LinkedIn importer code

interface MediaItem {
  type: 'youtube' | 'audio' | 'image' | 'spotify'
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
  const [category, setCategory] = useState(initialData?.category || article?.category || '')
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || article?.readingTime || 5)
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || article?.media || [])
  const [coverImage, setCoverImage] = useState<string | undefined>(initialData?.coverImage || article?.coverImage)
  
  // Author & Source metadata state
  const [author, setAuthor] = useState(initialData?.author || article?.author || '')
  const [authorImage, setAuthorImage] = useState(initialData?.authorImage || article?.authorImage || '')
  const [authorTitle, setAuthorTitle] = useState(initialData?.authorTitle || article?.authorTitle || '')
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || article?.publishDate || '')
  const [sourceUrl, setSourceUrl] = useState('')
  
  const [newMediaType, setNewMediaType] = useState<'youtube' | 'audio' | 'image' | 'spotify'>('youtube')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCaption, setNewMediaCaption] = useState('')
  
  // UI state for collapsible manual entry
  const [showManualEntry, setShowManualEntry] = useState(false)

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
    if (score >= 90) return 'Excellent! Your article is ready to publish!'
    if (score >= 70) return 'Great progress! Almost there!'
    if (score >= 50) return 'Good start! Keep going!'
    return 'Let\'s create something amazing!'
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
      {/* HERO: Simplified URL Importer with Mini Tutorial */}
      <SimplifiedURLImporter 
        onImport={(data) => {
          // Auto-fill form fields from imported data
          if (data.title) setTitle(data.title)
          if (data.content) setContent(data.content)
          if (data.excerpt) setExcerpt(data.excerpt)
          
          // Author metadata
          if (data.author) setAuthor(data.author)
          if (data.authorImage) setAuthorImage(data.authorImage)
          if (data.authorTitle) setAuthorTitle(data.authorTitle)
          if (data.publishDate) setPublishDate(data.publishDate)
          
          // Capture source URL
          if (data.sourceUrl) setSourceUrl(data.sourceUrl)
          
          // Add all media from the data
          if (data.media && data.media.length > 0) {
            setMedia([...media, ...data.media])
          }
          
          // Show manual entry after import
          setShowManualEntry(true)
        }}
      />

      {/* Collapsible Manual Entry Toggle */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowManualEntry(!showManualEntry)}
        className="w-full h-14 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
      >
        <Plus className={`w-5 h-5 mr-2 transition-transform ${showManualEntry ? 'rotate-45' : ''}`} />
        <span className="text-base font-semibold">
          {showManualEntry ? 'Hide Manual Entry' : 'Or Create From Scratch'}
        </span>
        {showManualEntry ? (
          <ChevronUp className="w-5 h-5 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 ml-2" />
        )}
      </Button>

      {showManualEntry && (
        <div className="space-y-6">
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

      {/* Media Attachments Card */}
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
            {/* Media Type Selection - Logo Icons */}
            <div className="space-y-2">
              <Label>Select Media Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* YouTube */}
                <button
                  type="button"
                  onClick={() => setNewMediaType('youtube')}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 ${
                    newMediaType === 'youtube'
                      ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                      : 'border-border/50 hover:border-red-500/30 bg-card/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      newMediaType === 'youtube' 
                        ? 'bg-red-600' 
                        : 'bg-red-600/20 group-hover:bg-red-600/40'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${
                        newMediaType === 'youtube' ? 'text-white' : 'text-red-600'
                      }`}>
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${
                      newMediaType === 'youtube' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      YouTube
                    </span>
                  </div>
                </button>

                {/* Spotify */}
                <button
                  type="button"
                  onClick={() => setNewMediaType('spotify')}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 ${
                    newMediaType === 'spotify'
                      ? 'border-[#1DB954] bg-[#1DB954]/10 shadow-lg shadow-[#1DB954]/20'
                      : 'border-border/50 hover:border-[#1DB954]/30 bg-card/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      newMediaType === 'spotify' 
                        ? 'bg-[#1DB954]' 
                        : 'bg-[#1DB954]/20 group-hover:bg-[#1DB954]/40'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${
                        newMediaType === 'spotify' ? 'text-white' : 'text-[#1DB954]'
                      }`}>
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${
                      newMediaType === 'spotify' ? 'text-[#1DB954]' : 'text-muted-foreground'
                    }`}>
                      Spotify
                    </span>
                  </div>
                </button>

                {/* Audio/MP3 */}
                <button
                  type="button"
                  onClick={() => setNewMediaType('audio')}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 ${
                    newMediaType === 'audio'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                      : 'border-border/50 hover:border-purple-500/30 bg-card/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      newMediaType === 'audio' 
                        ? 'bg-purple-600' 
                        : 'bg-purple-600/20 group-hover:bg-purple-600/40'
                    }`}>
                      <Music className={`w-6 h-6 ${
                        newMediaType === 'audio' ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${
                      newMediaType === 'audio' ? 'text-purple-600' : 'text-muted-foreground'
                    }`}>
                      Audio
                    </span>
                  </div>
                </button>

                {/* Image */}
                <button
                  type="button"
                  onClick={() => setNewMediaType('image')}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-105 ${
                    newMediaType === 'image'
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-border/50 hover:border-blue-500/30 bg-card/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      newMediaType === 'image' 
                        ? 'bg-blue-600' 
                        : 'bg-blue-600/20 group-hover:bg-blue-600/40'
                    }`}>
                      <ImageIcon className={`w-6 h-6 ${
                        newMediaType === 'image' ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${
                      newMediaType === 'image' ? 'text-blue-600' : 'text-muted-foreground'
                    }`}>
                      Image
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder={
                  newMediaType === 'youtube' ? 'https://youtube.com/watch?v=...' :
                  newMediaType === 'spotify' ? 'https://open.spotify.com/episode/...' :
                  newMediaType === 'audio' ? 'https://example.com/audio.mp3' :
                  'https://example.com/image.jpg'
                }
                className="border-2"
              />
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

          {/* Media Library */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label>Media Library ({media.length})</Label>
              {coverImage && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  Cover Image Set
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
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'
                            }}
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
                  {coverImage ? 'Switch to Generic Vibe (No Cover Image)' : 'Using Generic Vibe'}
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
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="h-12 border-2">
                  <SelectValue placeholder="Select a category..." />
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

      {/* Author & Source Information Card */}
      <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-card/50 to-cyan-500/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M20 21a8 8 0 1 0-16 0"/>
                </svg>
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
                Add author details and original source information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-5">
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
          </div>

          {/* Author Preview */}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source URL Display at Bottom */}
      {sourceUrl && (
        <Card className="border-2 border-slate-500/30 bg-gradient-to-br from-slate-500/5 via-card/50 to-slate-600/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10">
                <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Original Source</p>
                <a 
                  href={sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {sourceUrl}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      )}

      {/* Action Buttons - Centered with narrower max-width to show sides */}
      <div className="fixed bottom-20 md:bottom-24 left-0 right-0 z-40 px-2 sm:px-4 flex justify-center">
        <div className="max-w-md md:max-w-2xl w-full">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient glow background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(score)}/20 blur-2xl`} />
            
            <div className="relative bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-3xl p-3 sm:p-4 shadow-2xl">
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

              <div className="flex flex-col gap-3">
                {/* Publish/Update Button - Center */}
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={score < 50}
                    className={`relative h-12 sm:h-14 px-8 sm:px-10 rounded-2xl overflow-hidden group transition-all duration-300 ${
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
                    <span className="relative z-10 flex items-center gap-2 text-sm sm:text-base font-bold text-white drop-shadow-lg">
                      {score >= 50 ? (
                        <>
                          {score >= 90 && <Award className="w-4 sm:w-5 h-4 sm:h-5" />}
                          {score >= 70 && score < 90 && <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />}
                          {score >= 50 && score < 70 && <Target className="w-4 sm:w-5 h-4 sm:h-5" />}
                          {article ? 'Update Article' : 'Publish Article'}
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 sm:w-5 h-4 sm:h-5" />
                          <span className="hidden sm:inline">Complete {50 - score}% more to publish</span>
                          <span className="sm:hidden">{50 - score}% to publish</span>
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
                
                {/* Cancel Button - Bottom & Smaller */}
                <div className="flex justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onCancel} 
                    className="relative h-8 px-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
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

function getMediaIcon(type: 'youtube' | 'audio' | 'image' | 'spotify') {
  switch (type) {
    case 'youtube':
      return Youtube
    case 'audio':
      return Music
    case 'image':
      return ImageIcon
    case 'spotify':
      return Music
  }
}

function getYouTubeId(url: string) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}