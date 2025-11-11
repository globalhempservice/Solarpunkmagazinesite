import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Plus, Trash2, Youtube, Music, Image as ImageIcon } from "lucide-react"
import { Badge } from "./ui/badge"

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

export function ArticleEditor({ onSave, onCancel, initialData }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || categories[0])
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || 5)
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || [])
  
  const [newMediaType, setNewMediaType] = useState<'youtube' | 'audio' | 'image'>('youtube')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCaption, setNewMediaCaption] = useState('')

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
    
    onSave({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150),
      category,
      readingTime,
      media
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
              required
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
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
              <Label htmlFor="readingTime">Reading Time (minutes)</Label>
              <Input
                id="readingTime"
                type="number"
                value={readingTime}
                onChange={(e) => setReadingTime(parseInt(e.target.value) || 5)}
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              rows={12}
              required
              className="resize-none text-sm sm:text-base font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Media Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select value={newMediaType} onValueChange={(value: any) => setNewMediaType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube Video</SelectItem>
                    <SelectItem value="audio">Audio (MP3)</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={newMediaCaption}
                onChange={(e) => setNewMediaCaption(e.target.value)}
                placeholder="Add a caption for this media..."
              />
            </div>

            <Button
              type="button"
              onClick={handleAddMedia}
              variant="outline"
              className="w-full hover:bg-accent"
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
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border"
                    >
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-1 bg-primary/10 text-primary border-0">
                          {item.type}
                        </Badge>
                        <p className="text-sm truncate text-foreground">{item.url}</p>
                        {item.caption && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.caption}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedia(index)}
                        className="hover:bg-red-50 hover:text-red-600"
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

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Article
        </Button>
      </div>
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