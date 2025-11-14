import { ExternalLink, Instagram, Video, MapPin, Calendar, Music } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface LinkPreviewProps {
  platform: 'instagram' | 'linkedin' | 'generic'
  url: string
  author?: string
  authorImage?: string
  authorUsername?: string
  caption?: string
  location?: string
  timestamp?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'carousel'
  hasAudio?: boolean
  thumbnailUrl?: string
}

export function LinkPreview({
  platform,
  url,
  author,
  authorImage,
  authorUsername,
  caption,
  location,
  timestamp,
  mediaUrl,
  mediaType = 'image',
  hasAudio = false,
  thumbnailUrl
}: LinkPreviewProps) {
  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      default:
        return <ExternalLink className="w-5 h-5" />
    }
  }

  const getPlatformColor = () => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 via-pink-500 to-orange-500'
      case 'linkedin':
        return 'from-blue-600 to-blue-700'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const getPlatformBadgeColor = () => {
    switch (platform) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-0'
      case 'linkedin':
        return 'bg-blue-600 text-white border-0'
      default:
        return 'bg-slate-600 text-white border-0'
    }
  }

  return (
    <Card className="overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group">
      {/* Platform Header */}
      <div className={`relative h-2 bg-gradient-to-r ${getPlatformColor()}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>

      <CardContent className="p-0">
        {/* Author Info */}
        {(author || authorUsername) && (
          <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/20">
            {authorImage && (
              <div className="relative">
                <div className={`absolute -inset-1 bg-gradient-to-r ${getPlatformColor()} rounded-full blur-sm opacity-50`} />
                <img
                  src={authorImage}
                  alt={author || authorUsername}
                  className="relative w-10 h-10 rounded-full object-cover border-2 border-background"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {author && (
                  <p className="font-semibold text-sm truncate">{author}</p>
                )}
                <Badge className={getPlatformBadgeColor()}>
                  {getPlatformIcon()}
                  <span className="ml-1 capitalize">{platform}</span>
                </Badge>
              </div>
              {authorUsername && (
                <p className="text-xs text-muted-foreground">@{authorUsername}</p>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                  </div>
                )}
                {timestamp && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(timestamp).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Preview */}
        {(mediaUrl || thumbnailUrl) && (
          <div className="relative aspect-square bg-muted/50 overflow-hidden">
            {mediaType === 'video' ? (
              <>
                <video
                  src={mediaUrl}
                  poster={thumbnailUrl}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                {hasAudio && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full p-2">
                  <Video className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <img
                src={mediaUrl || thumbnailUrl}
                alt="Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop'
                }}
              />
            )}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div className="p-4 border-t border-border/50">
            <p className="text-sm text-foreground line-clamp-3">{caption}</p>
          </div>
        )}

        {/* View Original Button */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
          <Button
            asChild
            variant="outline"
            className={`w-full group-hover:bg-gradient-to-r group-hover:${getPlatformColor()} group-hover:text-white group-hover:border-transparent transition-all`}
          >
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <span>View on {platform === 'instagram' ? 'Instagram' : platform === 'linkedin' ? 'LinkedIn' : 'Original Site'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </Card>
  )
}
