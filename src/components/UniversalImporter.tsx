import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Sparkles, Loader2, Link as LinkIcon, CheckCircle2, Circle, Youtube, Image as ImageIcon, FileText, User, Calendar, MapPin, ExternalLink } from "lucide-react"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { toast } from "sonner"
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Checkbox } from "./ui/checkbox"

interface ExtractedContent {
  platform: 'linkedin' | 'instagram' | 'youtube' | 'unknown'
  platformName: string
  platformColor: string
  platformIcon: string
  
  // Content fields
  title?: string
  content?: string
  excerpt?: string
  
  // Author info
  author?: string
  authorImage?: string
  authorTitle?: string
  authorUsername?: string
  publishDate?: string
  location?: string
  
  // Media
  images?: string[]
  youtubeUrls?: string[]
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'carousel'
  
  // Metadata
  hashtags?: string[]
  error?: string
}

interface UniversalImporterProps {
  onImport?: (data: {
    title: string
    content: string
    excerpt: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
    media: Array<{
      type: 'youtube' | 'audio' | 'image'
      url: string
      caption?: string
    }>
  }) => void
}

export function UniversalImporter({ onImport }: UniversalImporterProps) {
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedContent | null>(null)
  
  // Selection state - all true by default
  const [selectedContent, setSelectedContent] = useState({
    title: true,
    content: true,
    excerpt: true,
    author: true,
    authorImage: true,
    authorTitle: true,
    publishDate: true,
    location: true,
    images: true,
    youtubeUrls: true,
    mediaUrl: true
  })

  // Detect platform from URL
  const detectPlatform = (url: string): 'linkedin' | 'instagram' | 'youtube' | 'unknown' => {
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    return 'unknown'
  }

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return {
          name: 'LinkedIn',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-500/5 via-card/50 to-cyan-500/5',
          borderColor: 'border-blue-500/30',
          badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
          icon: '💼'
        }
      case 'instagram':
        return {
          name: 'Instagram',
          color: 'from-purple-500 via-pink-500 to-orange-500',
          bgColor: 'from-purple-500/5 via-card/50 to-pink-500/5',
          borderColor: 'border-purple-500/30',
          badgeColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-0',
          icon: '📸'
        }
      case 'youtube':
        return {
          name: 'YouTube',
          color: 'from-red-500 to-red-600',
          bgColor: 'from-red-500/5 via-card/50 to-red-600/5',
          borderColor: 'border-red-500/30',
          badgeColor: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
          icon: '🎥'
        }
      default:
        return {
          name: 'Web',
          color: 'from-slate-500 to-slate-600',
          bgColor: 'from-slate-500/5 via-card/50 to-slate-600/5',
          borderColor: 'border-slate-500/30',
          badgeColor: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400',
          icon: '🌐'
        }
    }
  }

  const handleParse = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    const platform = detectPlatform(url)
    
    if (platform === 'unknown') {
      setError('Unsupported URL. Please use LinkedIn, Instagram, or YouTube links.')
      return
    }

    setError('')
    setParsing(true)
    setExtractedData(null)

    try {
      let endpoint = ''
      
      switch (platform) {
        case 'linkedin':
          endpoint = 'parse-linkedin'
          break
        case 'instagram':
          endpoint = 'parse-instagram'
          break
        case 'youtube':
          setError('Direct YouTube import coming soon! For now, paste the URL in Media Attachments.')
          setParsing(false)
          return
        default:
          throw new Error('Unsupported platform')
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/${endpoint}`,
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

      if (!response.ok && !data.platform) {
        throw new Error(data.error || 'Failed to parse URL')
      }

      console.log('=== EXTRACTED DATA ===')
      console.log('Platform:', platform)
      console.log('Data:', data)
      console.log('======================')

      const platformInfo = getPlatformInfo(platform)

      setExtractedData({
        platform,
        platformName: platformInfo.name,
        platformColor: platformInfo.color,
        platformIcon: platformInfo.icon,
        ...data
      })

      toast.success(`✨ Found content from ${platformInfo.name}! Review and import below.`)

    } catch (err: any) {
      console.error('Error parsing URL:', err)
      setError(err.message || 'Failed to parse URL. Please try again.')
      toast.error('Failed to parse URL')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = () => {
    if (!extractedData || !onImport) return

    // Build title
    let title = ''
    if (selectedContent.title && extractedData.title) {
      title = extractedData.title
    } else if (extractedData.content) {
      // Generate from content
      const firstLine = extractedData.content.split('\n')[0].split('.')[0]
      title = firstLine.substring(0, 100).trim()
    }

    // Build content
    let content = ''
    if (selectedContent.content && extractedData.content) {
      content = extractedData.content
    }

    // Build excerpt
    let excerpt = ''
    if (selectedContent.excerpt && extractedData.excerpt) {
      excerpt = extractedData.excerpt
    } else if (content) {
      excerpt = content.substring(0, 150).trim()
    }

    // Build media array
    const media: Array<{
      type: 'youtube' | 'audio' | 'image'
      url: string
      caption?: string
    }> = []

    // Add YouTube videos
    if (selectedContent.youtubeUrls && extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0) {
      extractedData.youtubeUrls.forEach((url, index) => {
        media.push({
          type: 'youtube',
          url,
          caption: `YouTube video ${index + 1} from ${extractedData.platformName}`
        })
      })
    }

    // Add images
    if (selectedContent.images && extractedData.images && extractedData.images.length > 0) {
      extractedData.images.forEach((url, index) => {
        media.push({
          type: 'image',
          url,
          caption: `Image ${index + 1} from ${extractedData.platformName}`
        })
      })
    }

    // Add Instagram media
    if (selectedContent.mediaUrl && extractedData.mediaUrl) {
      media.push({
        type: extractedData.mediaType === 'video' ? 'youtube' : 'image',
        url: extractedData.mediaUrl,
        caption: `${extractedData.mediaType === 'video' ? 'Video' : 'Image'} from ${extractedData.platformName}`
      })
    }

    onImport({
      title,
      content,
      excerpt,
      author: selectedContent.author ? extractedData.author : undefined,
      authorImage: selectedContent.authorImage ? extractedData.authorImage : undefined,
      authorTitle: selectedContent.authorTitle ? extractedData.authorTitle : (selectedContent.location && extractedData.location ? `📍 ${extractedData.location}` : undefined),
      publishDate: selectedContent.publishDate ? extractedData.publishDate : undefined,
      media
    })

    // Show success and clear
    const mediaCount = media.length
    toast.success(`🎉 Imported! Added ${mediaCount} media item(s) to your article.`)
    
    setExtractedData(null)
    setUrl('')
  }

  const platformInfo = extractedData ? getPlatformInfo(extractedData.platform) : getPlatformInfo('unknown')

  return (
    <div className="space-y-4">
      {/* URL Input Card */}
      <Card className={`border-2 ${extractedData ? platformInfo.borderColor : 'border-border/50'} bg-gradient-to-br ${extractedData ? platformInfo.bgColor : 'from-primary/5 via-card/50 to-primary/5'} backdrop-blur-sm relative overflow-hidden transition-all duration-300`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${extractedData ? platformInfo.color : 'from-primary/10 via-transparent to-primary/10'}/10`} />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${extractedData ? platformInfo.color : 'from-primary to-primary'} blur-xl rounded-full opacity-50`} />
              <div className={`relative bg-gradient-to-br ${extractedData ? platformInfo.color : 'from-primary to-primary'} rounded-xl p-3`}>
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                Universal Content Importer
                <Badge variant="outline" className={extractedData ? platformInfo.badgeColor : "bg-primary/10 border-primary/30"}>
                  {extractedData ? platformInfo.icon + ' ' + platformInfo.name : '✨ Auto-detect'}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Paste any LinkedIn, Instagram, or YouTube URL to auto-extract content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
              💼 LinkedIn Posts
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
              📸 Instagram Reels
            </Badge>
            <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-0">
              🎥 YouTube (soon)
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="universal-url">Content URL</Label>
            <div className="flex gap-2">
              <Input
                id="universal-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/posts/... or https://instagram.com/reel/..."
                className="flex-1 h-11 border-2"
                disabled={parsing}
              />
              <Button
                type="button"
                onClick={handleParse}
                disabled={parsing || !url.trim()}
                className={`h-11 px-6 bg-gradient-to-r ${extractedData ? platformInfo.color : 'from-primary to-primary'} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <Circle className="h-4 w-4 text-destructive" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview & Selection Card */}
      {extractedData && (
        <Card className={`border-2 ${platformInfo.borderColor} bg-gradient-to-br ${platformInfo.bgColor} backdrop-blur-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${platformInfo.color}/10`} />
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Extracted Content Preview
              </CardTitle>
              <Badge className={platformInfo.badgeColor}>
                {platformInfo.icon} {platformInfo.platformName}
              </Badge>
            </div>
            <CardDescription>
              Review what we found and select what to import (everything selected by default)
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Author Box */}
            {(extractedData.author || extractedData.authorImage) && (
              <div className="p-4 rounded-xl bg-card/50 border-2 border-border/50 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Author Information</h4>
                </div>

                <div className="flex items-start gap-4">
                  {extractedData.authorImage && (
                    <div className="relative">
                      <Checkbox
                        id="check-authorImage"
                        checked={selectedContent.authorImage}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, authorImage: checked as boolean })}
                        className="absolute -top-1 -left-1 z-10 bg-background"
                      />
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                        <img 
                          src={extractedData.authorImage} 
                          alt={extractedData.author || 'Author'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {extractedData.author && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="check-author"
                          checked={selectedContent.author}
                          onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, author: checked as boolean })}
                        />
                        <Label htmlFor="check-author" className="font-semibold cursor-pointer">
                          {extractedData.author}
                          {extractedData.authorUsername && (
                            <span className="text-muted-foreground ml-2">@{extractedData.authorUsername}</span>
                          )}
                        </Label>
                      </div>
                    )}

                    {extractedData.authorTitle && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="check-authorTitle"
                          checked={selectedContent.authorTitle}
                          onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, authorTitle: checked as boolean })}
                        />
                        <Label htmlFor="check-authorTitle" className="text-sm text-muted-foreground cursor-pointer">
                          {extractedData.authorTitle}
                        </Label>
                      </div>
                    )}

                    {extractedData.location && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="check-location"
                          checked={selectedContent.location}
                          onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, location: checked as boolean })}
                        />
                        <Label htmlFor="check-location" className="text-sm flex items-center gap-1 cursor-pointer">
                          <MapPin className="w-3 h-3" />
                          {extractedData.location}
                        </Label>
                      </div>
                    )}

                    {extractedData.publishDate && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="check-publishDate"
                          checked={selectedContent.publishDate}
                          onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, publishDate: checked as boolean })}
                        />
                        <Label htmlFor="check-publishDate" className="text-sm flex items-center gap-1 text-muted-foreground cursor-pointer">
                          <Calendar className="w-3 h-3" />
                          {new Date(extractedData.publishDate).toLocaleDateString()}
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Content</h4>
              </div>

              {extractedData.title && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="check-title"
                      checked={selectedContent.title}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, title: checked as boolean })}
                    />
                    <Label htmlFor="check-title" className="text-xs text-muted-foreground cursor-pointer">Title</Label>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                    <p className="font-semibold">{extractedData.title}</p>
                  </div>
                </div>
              )}

              {extractedData.content && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="check-content"
                      checked={selectedContent.content}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, content: checked as boolean })}
                    />
                    <Label htmlFor="check-content" className="text-xs text-muted-foreground cursor-pointer">
                      Content ({extractedData.content.length} characters)
                    </Label>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border/50 max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{extractedData.content}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Media Preview */}
            {((extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0) || 
              (extractedData.images && extractedData.images.length > 0) ||
              extractedData.mediaUrl) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Media</h4>
                </div>

                {/* YouTube Videos */}
                {extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="check-youtube"
                        checked={selectedContent.youtubeUrls}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, youtubeUrls: checked as boolean })}
                      />
                      <Label htmlFor="check-youtube" className="text-xs text-muted-foreground cursor-pointer">
                        <Youtube className="w-3 h-3 inline mr-1" />
                        YouTube Videos ({extractedData.youtubeUrls.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {extractedData.youtubeUrls.map((url, index) => (
                        <div key={index} className="p-2 rounded-lg bg-card/50 border border-border/50 flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-xs truncate">{url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {extractedData.images && extractedData.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="check-images"
                        checked={selectedContent.images}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, images: checked as boolean })}
                      />
                      <Label htmlFor="check-images" className="text-xs text-muted-foreground cursor-pointer">
                        <ImageIcon className="w-3 h-3 inline mr-1" />
                        Images ({extractedData.images.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {extractedData.images.map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border/50">
                          <img 
                            src={url} 
                            alt={`Image ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instagram Media */}
                {extractedData.mediaUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="check-mediaUrl"
                        checked={selectedContent.mediaUrl}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, mediaUrl: checked as boolean })}
                      />
                      <Label htmlFor="check-mediaUrl" className="text-xs text-muted-foreground cursor-pointer">
                        {extractedData.mediaType === 'video' ? '🎥' : '🖼️'} {extractedData.mediaType === 'video' ? 'Video' : 'Image'}
                      </Label>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
                      <img 
                        src={extractedData.mediaUrl} 
                        alt="Media" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Button */}
            <div className="pt-4 border-t border-border/50">
              <Button
                type="button"
                onClick={handleImport}
                className={`w-full h-12 bg-gradient-to-r ${platformInfo.color} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Import Selected Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
