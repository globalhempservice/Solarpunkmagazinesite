import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Instagram, Loader2, Sparkles, Circle } from "lucide-react"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { toast } from "sonner"
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface InstagramImporterProps {
  onImport?: (data: {
    title: string
    content: string
    excerpt: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
    mediaUrl?: string
    mediaType?: 'image' | 'video' | 'carousel'
    location?: string
    authorUsername?: string
  }) => void
}

export function InstagramImporter({ onImport }: InstagramImporterProps) {
  const [instagramUrl, setInstagramUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')

  const handleParseInstagram = async () => {
    if (!instagramUrl.trim()) {
      setError('Please enter an Instagram URL')
      return
    }

    // Validate Instagram URL
    if (!instagramUrl.includes('instagram.com/')) {
      setError('Please enter a valid Instagram URL')
      return
    }

    setError('')
    setParsing(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/parse-instagram`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: instagramUrl }),
        }
      )

      const data = await response.json()

      if (!response.ok && data.error && !data.platform) {
        throw new Error(data.error || 'Failed to parse Instagram post')
      }

      console.log('=== RECEIVED INSTAGRAM DATA ===')
      console.log('Full response:', data)
      console.log('author:', data.author)
      console.log('authorUsername:', data.authorUsername)
      console.log('authorImage:', data.authorImage)
      console.log('caption:', data.caption)
      console.log('location:', data.location)
      console.log('timestamp:', data.timestamp)
      console.log('mediaUrl:', data.mediaUrl)
      console.log('mediaType:', data.mediaType)
      console.log('hasAudio:', data.hasAudio)
      console.log('===============================')

      // Generate article title from caption or username
      let title = ''
      if (data.caption) {
        // Take first line or first sentence as title
        const firstLine = data.caption.split('\n')[0].split('.')[0]
        title = firstLine.substring(0, 100).trim()
        if (title.length === 100) title += '...'
      }
      if (!title && data.authorUsername) {
        title = `${data.mediaType === 'video' ? 'Video' : 'Post'} by @${data.authorUsername}`
      }
      if (!title) {
        title = `Instagram ${data.mediaType === 'video' ? 'Reel' : 'Post'}`
      }

      // Use caption as content
      const content = data.caption || `Check out this Instagram ${data.mediaType === 'video' ? 'Reel' : 'post'}!`
      
      // Generate excerpt
      const excerpt = content.substring(0, 150).trim()

      // Call onImport if provided
      if (onImport) {
        onImport({
          title,
          content,
          excerpt,
          author: data.author || data.authorUsername,
          authorImage: data.authorImage,
          authorTitle: data.location ? `📍 ${data.location}` : undefined,
          publishDate: data.timestamp,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          location: data.location,
          authorUsername: data.authorUsername
        })
      }

      // Show success message
      if (data.mediaUrl) {
        toast.success(`✅ Instagram ${data.mediaType} imported!${data.authorUsername ? ` by @${data.authorUsername}` : ''}`)
      } else if (data.caption) {
        toast.success(`✅ Instagram content imported! Media may be limited.`)
      } else {
        toast.info('⚠️ Limited data extracted. Please fill in details manually.')
      }

      // Clear the URL field after successful import
      setInstagramUrl('')

    } catch (err: any) {
      console.error('Error parsing Instagram post:', err)
      setError(err.message || 'Failed to parse Instagram post. Instagram restricts automated access.')
      toast.error('Failed to parse Instagram post')
    } finally {
      setParsing(false)
    }
  }

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-card/50 to-pink-500/5 backdrop-blur-sm relative overflow-hidden transition-all duration-300">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 blur-xl rounded-full opacity-50" />
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl p-3">
              <Instagram className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              Instagram Importer
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-0">
                Auto-fill
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Paste an Instagram post or Reel URL to automatically extract and fill content below
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
            📹 Extract Reels
          </Badge>
          <Badge variant="secondary" className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-0">
            📝 Fill form fields
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0">
            🖼️ Import media
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram-url">Instagram URL</Label>
          <div className="flex gap-2">
            <Input
              id="instagram-url"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className="flex-1 h-11 border-2"
              disabled={parsing}
            />
            <Button
              type="button"
              onClick={handleParseInstagram}
              disabled={parsing || !instagramUrl.trim()}
              className="h-11 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
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

        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <Circle className="h-4 w-4 text-destructive" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}