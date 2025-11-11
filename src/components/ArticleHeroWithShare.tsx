import { useState, useEffect, useRef } from 'react'
import { GenerativeBackground } from './GenerativeBackground'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Twitter, Facebook, Linkedin, Mail, QrCode, Check, Copy, Flame, Star, Trophy, Zap, Share2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ArticleHeroWithShareProps {
  article: {
    id: string
    title: string
    content: string
    excerpt?: string
  }
  userProgress?: {
    points: number
    currentStreak: number
    longestStreak: number
    totalArticlesRead: number
  } | null
  pointsToEarn?: number
}

export function ArticleHeroWithShare({ article, userProgress, pointsToEarn = 10 }: ArticleHeroWithShareProps) {
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
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        toast.error('Failed to copy link. Please copy manually.')
      }
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
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  // Generate QR Code using SVG format
  useEffect(() => {
    if (showQR && qrRef.current) {
      qrRef.current.innerHTML = ''
      
      // Create QR code using SVG format to avoid download issues
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&format=svg`
      
      const img = document.createElement('img')
      img.src = qrCodeUrl
      img.alt = 'QR Code'
      img.className = 'w-48 h-48'
      
      qrRef.current.appendChild(img)
    }
  }, [showQR, shareUrl])

  const canNativeShare = typeof navigator !== 'undefined' && navigator.share

  // Gamification display
  const getStreakColor = () => {
    if (!userProgress) return 'from-primary to-primary/70'
    if (userProgress.currentStreak >= 30) return 'from-amber-500 to-orange-600'
    if (userProgress.currentStreak >= 14) return 'from-orange-500 to-red-600'
    if (userProgress.currentStreak >= 7) return 'from-yellow-500 to-orange-500'
    if (userProgress.currentStreak >= 3) return 'from-emerald-500 to-teal-500'
    return 'from-primary to-primary/70'
  }

  return (
    <div className="aspect-video overflow-hidden relative">
      {/* Background */}
      <GenerativeBackground seed={article.title} className="w-full h-full" />
      
      {/* Overlay with all options */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-md flex flex-col justify-between p-4 md:p-6">
        
        {/* Top Section: Gamification Preview */}
        {userProgress && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Points to Earn */}
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <div className="text-xs">
                  <div className="text-muted-foreground">Earn</div>
                  <div className="font-bold text-foreground">+{pointsToEarn} pts</div>
                </div>
              </div>
              
              {/* Current Streak */}
              {userProgress.currentStreak > 0 && (
                <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${getStreakColor()} rounded-lg text-white`}>
                  <Flame className="w-4 h-4" />
                  <div className="text-xs">
                    <div className="opacity-90">Streak</div>
                    <div className="font-bold">{userProgress.currentStreak} day{userProgress.currentStreak !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {/* Total Points */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 rounded-lg border border-border">
                <Star className="w-4 h-4 text-amber-500" />
                <div className="text-xs">
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-bold text-foreground">{userProgress.points} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Middle Section: Share Title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h3 className="text-lg text-foreground opacity-90">Share This Article</h3>
            <p className="text-xs text-muted-foreground">Spread the knowledge 🌿</p>
          </div>
        </div>

        {/* Bottom Section: Sharing Options */}
        <div className="space-y-3">
          {/* Copy Link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-xs bg-background/80 backdrop-blur-sm h-9"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCopyLink}
              className={`gap-2 h-9 ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors bg-background/80 backdrop-blur-sm h-9 text-xs"
              onClick={() => window.open(twitterUrl, '_blank', 'width=600,height=400')}
            >
              <Twitter className="w-3 h-3" />
              <span className="hidden sm:inline">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors bg-background/80 backdrop-blur-sm h-9 text-xs"
              onClick={() => window.open(facebookUrl, '_blank', 'width=600,height=400')}
            >
              <Facebook className="w-3 h-3" />
              <span className="hidden sm:inline">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors bg-background/80 backdrop-blur-sm h-9 text-xs"
              onClick={() => window.open(linkedinUrl, '_blank', 'width=600,height=400')}
            >
              <Linkedin className="w-3 h-3" />
              <span className="hidden sm:inline">LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors bg-background/80 backdrop-blur-sm h-9 text-xs"
              onClick={() => window.location.href = emailUrl}
            >
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">Email</span>
            </Button>
          </div>

          {/* QR Code & Native Share */}
          <div className="flex gap-2">
            {canNativeShare && (
              <Button
                onClick={handleNativeShare}
                variant="outline"
                size="sm"
                className="flex-1 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors bg-background/80 backdrop-blur-sm h-9 text-xs"
              >
                <Share2 className="w-3 h-3" />
                Share via...
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`gap-2 hover:bg-accent bg-background/80 backdrop-blur-sm h-9 text-xs ${!canNativeShare ? 'flex-1' : ''}`}
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-3 h-3" />
              {showQR ? 'Hide QR' : 'Show QR'}
            </Button>
          </div>
          
          {/* QR Code Display */}
          {showQR && (
            <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-muted">
              <div ref={qrRef} className="text-foreground"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}