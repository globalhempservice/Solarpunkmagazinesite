import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent } from "./ui/card"
import { Loader2, Sparkles, CheckCircle2, Circle, AlertCircle, ExternalLink } from "lucide-react"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { toast } from "sonner"
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Checkbox } from "./ui/checkbox"

interface ExtractedContent {
  platform: 'linkedin' | 'instagram' | 'youtube' | 'medium' | 'x' | 'tiktok' | 'reddit' | 'unknown'
  platformName: string
  title?: string
  content?: string
  excerpt?: string
  author?: string
  authorImage?: string
  authorTitle?: string
  authorUsername?: string
  publishDate?: string
  location?: string
  images?: string[]
  youtubeUrls?: string[]
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'carousel'
  hashtags?: string[]
  error?: string
}

interface GamifiedImporterProps {
  onImport?: (data: {
    title: string
    content: string
    excerpt: string
    author?: string
    authorImage?: string
    authorTitle?: string
    publishDate?: string
    sourceUrl: string
    media: Array<{
      type: 'youtube' | 'audio' | 'image' | 'spotify'
      url: string
      caption?: string
    }>
  }) => void
}

// Custom SVG Icons
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const MagicWandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/>
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
)

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

export function GamifiedImporter({ onImport }: GamifiedImporterProps) {
  const [step, setStep] = useState<1 | 2>(1)
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
  const detectPlatform = (url: string): 'linkedin' | 'instagram' | 'youtube' | 'medium' | 'x' | 'tiktok' | 'reddit' | 'unknown' => {
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('medium.com')) return 'medium'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'x'
    if (url.includes('tiktok.com')) return 'tiktok'
    if (url.includes('reddit.com')) return 'reddit'
    return 'unknown'
  }

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return {
          name: 'LinkedIn',
          gradient: 'from-[#0077B5] via-[#00A0DC] to-[#00C4FF]',
          glow: 'from-[#0077B5]/20 via-[#00A0DC]/20 to-[#00C4FF]/20',
          border: 'border-[#0077B5]/40',
          bg: 'bg-[#0077B5]/5',
          icon: LinkedInIcon
        }
      case 'instagram':
        return {
          name: 'Instagram',
          gradient: 'from-[#833AB4] via-[#E1306C] to-[#FCAF45]',
          glow: 'from-[#833AB4]/20 via-[#E1306C]/20 to-[#FCAF45]/20',
          border: 'border-[#E1306C]/40',
          bg: 'bg-[#E1306C]/5',
          icon: InstagramIcon
        }
      case 'medium':
        return {
          name: 'Medium',
          gradient: 'from-[#000000] via-[#000000] to-[#000000]',
          glow: 'from-[#000000]/20 via-[#000000]/20 to-[#000000]/20',
          border: 'border-[#000000]/40',
          bg: 'bg-[#000000]/5',
          icon: MediumIcon
        }
      case 'x':
        return {
          name: 'X',
          gradient: 'from-[#1DA1F2] via-[#1DA1F2] to-[#1DA1F2]',
          glow: 'from-[#1DA1F2]/20 via-[#1DA1F2]/20 to-[#1DA1F2]/20',
          border: 'border-[#1DA1F2]/40',
          bg: 'bg-[#1DA1F2]/5',
          icon: XIcon
        }
      case 'tiktok':
        return {
          name: 'TikTok',
          gradient: 'from-[#FF0050] via-[#FF0050] to-[#FF0050]',
          glow: 'from-[#FF0050]/20 via-[#FF0050]/20 to-[#FF0050]/20',
          border: 'border-[#FF0050]/40',
          bg: 'bg-[#FF0050]/5',
          icon: TikTokIcon
        }
      case 'reddit':
        return {
          name: 'Reddit',
          gradient: 'from-[#FF4500] via-[#FF4500] to-[#FF4500]',
          glow: 'from-[#FF4500]/20 via-[#FF4500]/20 to-[#FF4500]/20',
          border: 'border-[#FF4500]/40',
          bg: 'bg-[#FF4500]/5',
          icon: RedditIcon
        }
      default:
        return {
          name: 'Web',
          gradient: 'from-slate-500 via-slate-600 to-slate-700',
          glow: 'from-slate-500/20 via-slate-600/20 to-slate-700/20',
          border: 'border-slate-500/40',
          bg: 'bg-slate-500/5',
          icon: TargetIcon
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
      setError('Unsupported URL. Please use a supported platform link.')
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
        case 'medium':
          endpoint = 'parse-medium'
          break
        case 'x':
          endpoint = 'parse-x'
          break
        case 'tiktok':
          endpoint = 'parse-tiktok'
          break
        case 'reddit':
          endpoint = 'parse-reddit'
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

      const platformInfo = getPlatformInfo(platform)

      setExtractedData({
        platform,
        platformName: platformInfo.name,
        ...data
      })

      toast.success(`Content extracted from ${platformInfo.name}!`)
      setStep(2)

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
      type: 'youtube' | 'audio' | 'image' | 'spotify'
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
      authorTitle: selectedContent.authorTitle ? extractedData.authorTitle : (selectedContent.location && extractedData.location ? `${extractedData.location}` : undefined),
      publishDate: selectedContent.publishDate ? extractedData.publishDate : undefined,
      sourceUrl: url,
      media
    })

    const mediaCount = media.length
    toast.success(`Imported! Added ${mediaCount} media item(s) to your article.`)
    
    setExtractedData(null)
    setUrl('')
    setStep(1)
  }

  const handleReset = () => {
    setStep(1)
    setExtractedData(null)
    setError('')
  }

  const platformInfo = extractedData ? getPlatformInfo(extractedData.platform) : getPlatformInfo('unknown')
  const Icon = platformInfo.icon

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <CardContent className="relative p-6 md:p-8 space-y-6">
        {/* Header with Steps */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Content Importer</h3>
            <p className="text-sm text-muted-foreground">Extract content from social media</p>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step === 1 
                  ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/50' 
                  : extractedData 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-muted'
              }`}>
                {extractedData && step === 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <MagicWandIcon />
                )}
              </div>
              <span className="text-xs mt-1 font-medium">Extract</span>
            </div>
            
            <div className={`h-0.5 w-8 transition-all ${extractedData ? 'bg-emerald-500' : 'bg-border'}`} />
            
            <div className="flex flex-col items-center">
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step === 2 && extractedData
                  ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/50'
                  : 'bg-muted'
              }`}>
                <TargetIcon />
              </div>
              <span className="text-xs mt-1 font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: URL Input */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Platform badges */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Supported Platforms:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-[#0077B5]/10 border-[#0077B5]/30 text-[#0077B5] dark:text-[#00A0DC]">
                  <div className="w-3 h-3 mr-1.5">
                    <LinkedInIcon />
                  </div>
                  LinkedIn
                </Badge>
                <Badge variant="outline" className="bg-[#E1306C]/10 border-[#E1306C]/30 text-[#E1306C] dark:text-[#FCAF45]">
                  <div className="w-3 h-3 mr-1.5">
                    <InstagramIcon />
                  </div>
                  Instagram
                </Badge>
                <Badge variant="outline" className="bg-[#000000]/10 border-[#000000]/30 text-[#000000] dark:text-[#ffffff]">
                  <div className="w-3 h-3 mr-1.5">
                    <MediumIcon />
                  </div>
                  Medium
                </Badge>
                <Badge variant="outline" className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2]">
                  <div className="w-3 h-3 mr-1.5">
                    <XIcon />
                  </div>
                  X
                </Badge>
                <Badge variant="outline" className="bg-[#FF0050]/10 border-[#FF0050]/30 text-[#FF0050]">
                  <div className="w-3 h-3 mr-1.5">
                    <TikTokIcon />
                  </div>
                  TikTok
                </Badge>
                <Badge variant="outline" className="bg-[#FF4500]/10 border-[#FF4500]/30 text-[#FF4500]">
                  <div className="w-3 h-3 mr-1.5">
                    <RedditIcon />
                  </div>
                  Reddit
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-url" className="text-base font-semibold">Paste Content URL</Label>
              <div className="flex gap-2">
                <Input
                  id="import-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !parsing && url.trim()) {
                      handleParse()
                    }
                  }}
                  placeholder="https://linkedin.com/posts/... or https://instagram.com/reel/..."
                  className="flex-1 h-12 border-2 text-base"
                  disabled={parsing}
                />
                <Button
                  type="button"
                  onClick={handleParse}
                  disabled={parsing || !url.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-primary via-primary/90 to-primary hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Extract
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a LinkedIn post or Instagram reel URL to automatically extract content, images, and videos
              </p>
              
              {/* Platform-specific notes */}
              {url && detectPlatform(url) === 'instagram' && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-xs">
                    <strong>Instagram Note:</strong> Due to Instagram's restrictions, automatic extraction may be limited. 
                    You can manually copy the caption and add media URLs if needed.
                  </AlertDescription>
                </Alert>
              )}
              
              {url && (detectPlatform(url) === 'x' || detectPlatform(url) === 'tiktok') && (
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-xs">
                    <strong>Tip:</strong> {detectPlatform(url) === 'x' ? 'X/Twitter' : 'TikTok'} content may require 
                    authentication. If extraction fails, you can manually copy and paste the content.
                  </AlertDescription>
                </Alert>
              )}
              
              {url && detectPlatform(url) === 'reddit' && (
                <Alert className="border-emerald-500/50 bg-emerald-500/10">
                  <AlertCircle className="h-4 w-4 text-emerald-500" />
                  <AlertDescription className="text-xs">
                    <strong>Reddit works great!</strong> We use Reddit's JSON API for reliable content extraction.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Preview & Selection */}
        {step === 2 && extractedData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Platform Header */}
            <div className={`relative overflow-hidden rounded-2xl border-2 ${platformInfo.border} ${platformInfo.bg} p-4`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${platformInfo.glow}`} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platformInfo.gradient} p-2.5 text-white shadow-lg`}>
                    <Icon />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{platformInfo.name}</h4>
                    <p className="text-xs text-muted-foreground">Content extracted successfully</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="hover:bg-background/50"
                >
                  Change URL
                </Button>
              </div>
            </div>

            {/* Author Box */}
            {(extractedData.author || extractedData.authorImage) && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h4 className="font-semibold">Author Information</h4>
                </div>

                <div className="flex items-start gap-4">
                  {extractedData.authorImage && (
                    <div className="relative">
                      <Checkbox
                        id="check-authorImage"
                        checked={selectedContent.authorImage}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, authorImage: checked as boolean })}
                        className="absolute -top-1 -left-1 z-10 bg-background shadow-md"
                      />
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border ring-2 ring-primary/20">
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
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
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
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
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
                <div className="w-1 h-4 rounded-full bg-primary" />
                <h4 className="font-semibold">Content</h4>
              </div>

              {extractedData.title && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="check-title"
                      checked={selectedContent.title}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, title: checked as boolean })}
                    />
                    <Label htmlFor="check-title" className="text-xs text-muted-foreground cursor-pointer font-medium">Title</Label>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
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
                    <Label htmlFor="check-content" className="text-xs text-muted-foreground cursor-pointer font-medium">
                      Content ({extractedData.content.length} characters)
                    </Label>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 max-h-48 overflow-y-auto">
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
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h4 className="font-semibold">Media</h4>
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
                      <Label htmlFor="check-youtube" className="text-xs text-muted-foreground cursor-pointer font-medium">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 inline mr-1 text-red-500">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube Videos ({extractedData.youtubeUrls.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {extractedData.youtubeUrls.map((url, index) => (
                        <div key={index} className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500 flex-shrink-0">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="text-xs truncate">Video {index + 1}</span>
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
                      <Label htmlFor="check-images" className="text-xs text-muted-foreground cursor-pointer font-medium">
                        Images ({extractedData.images.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {extractedData.images.map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-border/50 ring-2 ring-primary/10">
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
                      <Label htmlFor="check-mediaUrl" className="text-xs text-muted-foreground cursor-pointer font-medium">
                        {extractedData.mediaType === 'video' ? 'Video' : 'Image'}
                      </Label>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-border/50 ring-2 ring-primary/10">
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
            <div className="pt-4">
              <Button
                type="button"
                onClick={handleImport}
                className={`w-full h-14 bg-gradient-to-r ${platformInfo.gradient} hover:opacity-90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Import Selected Content
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}