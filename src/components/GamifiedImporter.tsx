import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2, Sparkles, CheckCircle2, AlertCircle, FileText, Download, Image as ImageIcon, Video, Lock } from "lucide-react"
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
  pdfUrls?: Array<{ url: string; title: string; previewUrl?: string }>
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
      type: 'youtube' | 'audio' | 'image' | 'spotify' | 'pdf'
      url: string
      caption?: string
      title?: string
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
    pdfUrls: true,
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
          icon: () => <div />
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
      setError('Unsupported URL. Please use LinkedIn, Instagram, Medium, X, TikTok, or Reddit.')
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

      toast.success(`Content ready from ${platformInfo.name}!`)
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
      type: 'youtube' | 'audio' | 'image' | 'spotify' | 'pdf'
      url: string
      caption?: string
      title?: string
    }> = []

    // Add YouTube videos
    if (selectedContent.youtubeUrls && extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0) {
      extractedData.youtubeUrls.forEach((url, index) => {
        media.push({
          type: 'youtube',
          url,
          caption: `Video ${index + 1} from ${extractedData.platformName}`
        })
      })
    }

    // Add PDFs
    if (selectedContent.pdfUrls && extractedData.pdfUrls && extractedData.pdfUrls.length > 0) {
      extractedData.pdfUrls.forEach((pdf) => {
        media.push({
          type: 'pdf',
          url: pdf.url,
          title: pdf.title,
          caption: `Document from ${extractedData.platformName}`
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

    const importData = {
      title,
      content,
      excerpt,
      author: selectedContent.author ? extractedData.author : undefined,
      authorImage: selectedContent.authorImage ? extractedData.authorImage : undefined,
      authorTitle: selectedContent.authorTitle ? extractedData.authorTitle : (selectedContent.location && extractedData.location ? `${extractedData.location}` : undefined),
      publishDate: selectedContent.publishDate ? extractedData.publishDate : undefined,
      sourceUrl: url,
      media
    }

    console.log('📦 Importing article data:', importData)
    console.log('📄 PDF count in media:', media.filter(m => m.type === 'pdf').length)
    console.log('📄 PDF details:', media.filter(m => m.type === 'pdf'))

    onImport(importData)

    const mediaCount = media.length
    const pdfCount = media.filter(m => m.type === 'pdf').length
    toast.success(`Imported! Added ${mediaCount} media item(s)${pdfCount > 0 ? ` (${pdfCount} PDF)` : ''}.`)
    
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
    <div className="space-y-4">
      {/* Step 1: Big Paste Field */}
      {step === 1 && (
        <div className="space-y-4">
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
            placeholder="Paste your link here..."
            className="flex-1 h-14 md:h-16 border-2 text-base md:text-lg px-4 md:px-6 rounded-2xl"
            disabled={parsing}
          />
          
          <Button
            type="button"
            onClick={handleParse}
            disabled={parsing || !url.trim()}
            className="w-full h-14 md:h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:opacity-90 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-2xl text-base md:text-lg"
          >
            {parsing ? (
              <>
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Create
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Step 2: Review & Import - Simplified version without extract/review indicators */}
      {step === 2 && extractedData && (
        <div className="space-y-6 p-6 md:p-8 rounded-3xl border-2 border-border bg-card/50 backdrop-blur-sm">
          {/* Platform Header */}
          <div className={`relative overflow-hidden rounded-2xl border-2 ${platformInfo.border} ${platformInfo.bg} p-4`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${platformInfo.glow}`} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platformInfo.gradient} p-2.5 text-white shadow-lg`}>
                  <Icon />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Ready to Import</h4>
                  <p className="text-xs text-muted-foreground">Review and customize what to include</p>
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

          {/* Content Preview - Simplified checkboxes */}
          <div className="space-y-3">
            {extractedData.title && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <Checkbox
                  id="check-title"
                  checked={selectedContent.title}
                  onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, title: checked as boolean })}
                />
                <Label htmlFor="check-title" className="cursor-pointer flex-1 font-semibold">{extractedData.title}</Label>
              </div>
            )}

            {extractedData.content && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <Checkbox
                  id="check-content"
                  checked={selectedContent.content}
                  onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, content: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="check-content" className="cursor-pointer flex-1">
                  <p className="text-sm whitespace-pre-wrap line-clamp-4">{extractedData.content}</p>
                </Label>
              </div>
            )}

            {extractedData.author && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <Checkbox
                  id="check-author"
                  checked={selectedContent.author}
                  onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, author: checked as boolean })}
                />
                <Label htmlFor="check-author" className="cursor-pointer text-sm">By {extractedData.author}</Label>
              </div>
            )}

            {/* Media Attachments Preview */}
            {((extractedData.images && extractedData.images.length > 0) || 
              (extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0) ||
              (extractedData.pdfUrls && extractedData.pdfUrls.length > 0)) && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Media Attachments
                </h4>
                
                {/* PDFs */}
                {extractedData.pdfUrls && extractedData.pdfUrls.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="check-pdfs"
                        checked={selectedContent.pdfUrls}
                        onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, pdfUrls: checked as boolean })}
                      />
                      <Label htmlFor="check-pdfs" className="cursor-pointer text-sm font-medium">
                        Documents ({extractedData.pdfUrls.length})
                      </Label>
                    </div>
                    <div className="ml-6 space-y-2">
                      {extractedData.pdfUrls.map((pdf, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="text-xs flex-1 truncate" title={pdf.title}>{pdf.title}</span>
                            {pdf.url && pdf.url.trim() !== '' ? (
                              <a 
                                href={pdf.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                onClick={(e) => e.stopPropagation()}
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            ) : pdf.isLinkedInDocument ? (
                              <span className="text-xs text-orange-600/70 dark:text-orange-400/70" title="LinkedIn hosted document">
                                LinkedIn
                              </span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-orange-600/50 dark:text-orange-400/50" title="Authentication required" />
                            )}
                          </div>
                          {pdf.previewUrl && (
                            <img 
                              src={pdf.previewUrl} 
                              alt={`Preview of ${pdf.title}`} 
                              className="w-full rounded-lg border border-orange-500/20"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Videos */}
                {extractedData.youtubeUrls && extractedData.youtubeUrls.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                    <Checkbox
                      id="check-youtube"
                      checked={selectedContent.youtubeUrls}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, youtubeUrls: checked as boolean })}
                    />
                    <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <Label htmlFor="check-youtube" className="cursor-pointer text-xs flex-1">
                      YouTube Videos ({extractedData.youtubeUrls.length})
                    </Label>
                  </div>
                )}

                {/* Images */}
                {extractedData.images && extractedData.images.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <Checkbox
                      id="check-images"
                      checked={selectedContent.images}
                      onCheckedChange={(checked) => setSelectedContent({ ...selectedContent, images: checked as boolean })}
                    />
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="check-images" className="cursor-pointer text-xs flex-1">
                      Images ({extractedData.images.length})
                    </Label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Import Button */}
          <Button
            type="button"
            onClick={handleImport}
            className={`w-full h-14 bg-gradient-to-r ${platformInfo.gradient} hover:opacity-90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Add to Article
          </Button>
        </div>
      )}
    </div>
  )
}