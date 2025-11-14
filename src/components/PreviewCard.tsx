import { useState } from 'react'
import { Skeleton } from './ui/skeleton'
import { Sparkles } from 'lucide-react'

interface Article {
  id: string
  title: string
  coverImage?: string
  media?: Array<{
    type: 'youtube' | 'audio' | 'image' | 'spotify'
    url: string
    caption?: string
  }>
}

interface PreviewCardProps {
  article: Article
  scale: number
  translateY: number
  zIndex: number
  opacity: number
}

export function PreviewCard({ article, scale, translateY, zIndex, opacity }: PreviewCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageUrl = article.coverImage || (article.media?.[0]?.type === 'image' ? article.media[0].url : null)

  return (
    <div
      className="absolute inset-0 rounded-3xl border-2 border-border bg-card shadow-lg overflow-hidden pointer-events-none"
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex,
        opacity
      }}
    >
      {/* Image Section */}
      <div className="relative h-72 bg-gradient-to-br from-muted/50 to-muted/30">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={imageUrl}
              alt=""
              className={`w-full h-full object-cover opacity-50 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-50' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
      </div>

      {/* Title Section */}
      <div className="p-6">
        <h3 className="font-bold text-lg line-clamp-2 opacity-70">
          {article.title}
        </h3>
      </div>
    </div>
  )
}
