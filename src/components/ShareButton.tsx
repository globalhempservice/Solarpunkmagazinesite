import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Share2, Link2, Facebook, Linkedin, Mail, QrCode, Check, Copy, MessageCircle, Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'

// Custom X (Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Custom Reddit icon component
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  )
}

// Custom LINE icon component
function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  )
}

interface ShareButtonProps {
  article: {
    id: string
    title: string
    content: string
    excerpt?: string
  }
  compact?: boolean
  children?: React.ReactNode
  accessToken?: string
  onProgressUpdate?: (progress: any) => void
}

export function ShareButton({ article, compact = false, children, accessToken, onProgressUpdate }: ShareButtonProps) {
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
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  const redditUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
  const emailUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`

  // Track share action
  const trackShare = async () => {
    if (!accessToken) {
      console.log('No access token, skipping share tracking')
      return
    }
    
    console.log('Starting share tracking for article:', article.id)
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId: article.id })
      })
      
      const data = await response.json()
      console.log('Share tracking response:', data)
      
      if (!data.success) {
        // Share limit reached - show message to user
        if (data.error === 'Share limit reached') {
          alert(data.message || 'You can share each article up to 3 times per day')
        }
        return
      }
      
      // Points earned - update progress immediately for navbar animation
      console.log(`Share points earned: +${data.pointsEarned}, calling onProgressUpdate with:`, data.progress)
      
      // Show achievement notifications if any were unlocked
      if (data.newAchievements && data.newAchievements.length > 0) {
        data.newAchievements.forEach((achievement: any) => {
          toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
            description: `${achievement.description} (+${achievement.points} pts)`,
            duration: 6000
          })
        })
      }
      
      // Update progress if onProgressUpdate is provided - THIS TRIGGERS THE ANIMATION
      if (onProgressUpdate && data.progress) {
        onProgressUpdate(data.progress)
        console.log('onProgressUpdate called successfully')
      } else {
        console.warn('onProgressUpdate not available or no progress data')
      }
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  // Copy to clipboard with tracking
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      
      // Track the share and wait for state update
      await trackShare()
      
      // Small delay to ensure progress update triggers Header animation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Then show success and close
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setOpen(false)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  // Native Web Share API with tracking
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: articleExcerpt,
          url: shareUrl,
        })
        
        // Track the share and wait for state update
        await trackShare()
        
        // Small delay to ensure progress update triggers Header animation
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setOpen(false)
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  // Social media share handlers with tracking
  const handleSocialShare = async (url: string) => {
    // Track FIRST and wait for completion
    await trackShare()
    
    // Small delay to ensure progress update triggers Header animation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Then open share window and close modal
    window.open(url, '_blank', 'width=600,height=400')
    setOpen(false)
  }

  const handleEmailShare = async () => {
    // Track FIRST and wait for completion
    await trackShare()
    
    // Small delay to ensure progress update triggers Header animation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Then open email client and close modal
    window.location.href = emailUrl
    setOpen(false)
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
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 border-2 border-cyan-500/30 shadow-2xl overflow-y-auto max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="relative pb-4">
          {/* Solarpunk decorative elements */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-full blur-3xl" />
          
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 relative z-10">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            Share Article
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-cyan-300/70 relative z-10">
            Spread knowledge and earn +5 points (3 shares per article per day)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 pb-4 relative z-10">
          {/* Copy Link */}
          <div className="space-y-2 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
            <Label htmlFor="link" className="text-cyan-300">Article Link</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={shareUrl}
                readOnly
                className="flex-1 text-sm bg-black/30 border-cyan-500/30 text-cyan-100 focus:border-cyan-400"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopyLink}
                className={`gap-2 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500'} text-white border-0`}
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
              className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-0"
            >
              <Share2 className="w-4 h-4" />
              Share via...
            </Button>
          )}

          {/* Social Media Buttons */}
          <div className="space-y-3 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
            <Label className="text-cyan-300">Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-black hover:text-white hover:border-white transition-colors"
                onClick={() => handleSocialShare(xUrl)}
              >
                <XIcon className="w-4 h-4" />
                X
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
                onClick={() => handleSocialShare(facebookUrl)}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
                onClick={() => handleSocialShare(linkedinUrl)}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handleEmailShare}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                onClick={() => handleSocialShare(whatsappUrl)}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#FF4500] hover:text-white hover:border-[#FF4500] transition-colors"
                onClick={() => handleSocialShare(redditUrl)}
              >
                <RedditIcon className="w-4 h-4" />
                Reddit
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#0088CC] hover:text-white hover:border-[#0088CC] transition-colors"
                onClick={() => handleSocialShare(telegramUrl)}
              >
                <Send className="w-4 h-4" />
                Telegram
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-black/30 border-cyan-500/30 text-cyan-200 hover:bg-[#00C300] hover:text-white hover:border-[#00C300] transition-colors"
                onClick={() => handleSocialShare(lineUrl)}
              >
                <LineIcon className="w-4 h-4" />
                LINE
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-3 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
            <Button
              type="button"
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Button>
            
            {showQR && (
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-cyan-400">
                <div ref={qrRef} className="text-foreground"></div>
                <p className="text-sm text-gray-700">Scan to share this article</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}