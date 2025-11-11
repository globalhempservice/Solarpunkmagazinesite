import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Plus, Trash2, Youtube, Music, Image as ImageIcon, Sparkles, Target, Award, CheckCircle2, Circle } from "lucide-react"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"

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
  }) => void
  onCancel: () => void
  initialData?: {
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media: MediaItem[]
  }
  article?: {
    id: string
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media?: MediaItem[]
  }
  onUpdate?: (article: {
    title: string
    content: string
    excerpt: string
    category: string
    readingTime: number
    media: MediaItem[]
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

export function ArticleEditor({ onSave, onCancel, initialData, article, onUpdate }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || article?.title || '')
  const [content, setContent] = useState(initialData?.content || article?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || article?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || article?.category || categories[0])
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || article?.readingTime || 5)
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || article?.media || [])
  
  const [newMediaType, setNewMediaType] = useState<'youtube' | 'audio' | 'image'>('youtube')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCaption, setNewMediaCaption] = useState('')

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
      media
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

          {media.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-border">
              <Label>Added Media ({media.length})</Label>
              <div className="space-y-2">
                {media.map((item, index) => {
                  const Icon = getMediaIcon(item.type)
                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-0">
                          {item.type}
                        </Badge>
                        <p className="text-sm truncate text-foreground font-medium">{item.url}</p>
                        {item.caption && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {item.caption}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedia(index)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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

      {/* Action Buttons */}
      <div className="fixed bottom-20 md:bottom-24 left-0 right-0 z-40 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient glow background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(score)}/20 blur-2xl`} />
            
            <div className="relative bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-3xl p-4 shadow-2xl">
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