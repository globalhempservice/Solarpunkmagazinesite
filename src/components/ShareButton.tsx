import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Share2, Link2, Twitter, Facebook, Linkedin, Mail, QrCode, Check, Copy } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useEffect, useRef } from 'react'

interface ShareButtonProps {
  article: {
    id: string
    title: string
    content: string
    excerpt?: string
  }
  compact?: boolean
  children?: React.ReactNode
}

export function ShareButton({ article, compact = false, children }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  
  // Generate shareable URL
  const shareUrl = `${window.location.origin}?article=${article.id}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(article.title)
  const articleExcerpt = article.excerpt || article.content.substring(0, 150) + '...'
  const encodedText = encodeURIComponent(articleExcerpt)

  // Social share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  const emailUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: articleExcerpt,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  // Generate QR Code
  useEffect(() => {
    if (showQR && qrRef.current) {
      qrRef.current.innerHTML = ''
      
      // Create QR code using a simple API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=000000&margin=10&qzone=1&format=svg`
      
      const img = document.createElement('img')
      img.src = qrCodeUrl
      img.alt = 'QR Code'
      img.className = 'w-64 h-64'
      
      qrRef.current.appendChild(img)
    }
  }, [showQR, shareUrl])

  const canNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="w-5 h-5 text-primary" />
            Share Article
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share this article with your friends and community 🌿
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-foreground">Article Link</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopyLink}
                className={`gap-2 ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Native Share (Mobile) */}
          {canNativeShare && (
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share via...
            </Button>
          )}

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <Label className="text-foreground">Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
                onClick={() => window.open(twitterUrl, '_blank', 'width=600,height=400')}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
                onClick={() => window.open(facebookUrl, '_blank', 'width=600,height=400')}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
                onClick={() => window.open(linkedinUrl, '_blank', 'width=600,height=400')}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => window.location.href = emailUrl}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 hover:bg-accent"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Button>
            
            {showQR && (
              <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-border">
                <div ref={qrRef} className="text-foreground"></div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}