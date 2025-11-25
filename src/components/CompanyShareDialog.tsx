import { useState } from 'react'
import { QrCode, Copy, Check, Download, Share2, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

interface CompanyShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl: string
  companyName: string
  companyLogo?: string
}

export function CompanyShareDialog({ open, onOpenChange, shareUrl, companyName, companyLogo }: CompanyShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate QR code URL using QR Server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=10b981&margin=10`

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${companyName}-business-card-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-emerald-950/98 via-teal-900/98 to-green-950/98 backdrop-blur-xl border-2 border-hemp-primary text-white max-w-[95vw] sm:max-w-lg mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-hemp-primary to-hemp-secondary">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-white font-black text-lg sm:text-xl md:text-2xl">Share Business Card</DialogTitle>
              <DialogDescription className="text-white/70 text-xs sm:text-sm">
                Scannable QR code and shareable link
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Premium Business Card Preview */}
          <div className="relative bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-hemp-primary/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-amber-500/50 rounded-tl-xl sm:rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-amber-500/50 rounded-tr-xl sm:rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-hemp-primary/50 rounded-bl-xl sm:rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-hemp-primary/50 rounded-br-xl sm:rounded-br-2xl"></div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative text-center">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-hemp-primary" />
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-hemp-primary font-black">
                  Digital Business Card
                </span>
              </div>
              
              <h3 className="font-black text-xl sm:text-2xl text-white mb-4 sm:mb-6 px-2 break-words">{companyName}</h3>
              
              {/* QR Code */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl shadow-hemp-primary/30 border-2 sm:border-4 border-hemp-primary/20 w-fit">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code"
                    className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px]"
                  />
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-hemp-primary/90 font-bold mb-1 sm:mb-2">
                Scan to connect
              </p>
              <p className="text-[10px] sm:text-xs text-white/60">
                Point your camera at the QR code to visit the profile
              </p>
            </div>
          </div>

          {/* Download QR Button */}
          <Button
            onClick={handleDownloadQR}
            className="w-full gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-2 border-amber-500/50 hover:border-amber-500 text-white shadow-lg text-sm sm:text-base py-5 sm:py-6"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-black uppercase tracking-wider">Download QR Code</span>
          </Button>

          {/* Share URL Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-hemp-primary/50 to-transparent"></div>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-hemp-primary font-black">Or Share Link</span>
              <div className="h-px flex-1 bg-gradient-to-l from-hemp-primary/50 to-transparent"></div>
            </div>
            
            <div className="p-3 sm:p-4 bg-emerald-900/30 border border-hemp-primary/30 rounded-lg sm:rounded-xl">
              <p className="text-[10px] sm:text-xs md:text-sm font-mono break-all mb-2 sm:mb-3 text-white/90 leading-relaxed">{shareUrl}</p>
              <Button
                onClick={handleCopyLink}
                className={`w-full gap-2 transition-all text-sm sm:text-base py-5 sm:py-6 ${copied ? 'bg-gradient-to-r from-hemp-primary to-hemp-secondary' : 'bg-white/10 hover:bg-white/20 border-2 border-white/30'}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-white font-bold mb-1">
                  Public Landing Page
                </p>
                <p className="text-[10px] sm:text-xs text-white/70 leading-relaxed">
                  Visitors will see a beautiful landing page with your public info and a call-to-action to sign up for full access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}