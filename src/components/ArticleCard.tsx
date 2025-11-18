import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { Clock } from "lucide-react"
import { PlaceholderArt } from "./PlaceholderArt"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface ArticleCardProps {
  article: {
    id: string
    title: string
    excerpt: string
    category: string
    coverImage?: string
    readingTime: number
    views?: number
    createdAt: string
    source?: string
    sourceUrl?: string
    media?: Array<{
      type: 'youtube' | 'audio' | 'image' | 'pdf'
      url: string
      caption?: string
      title?: string
    }>
  }
  onClick: () => void
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  // Get cover image from article.coverImage or first media image
  const displayImage = article.coverImage || article.media?.find(m => m.type === 'image')?.url
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-card border-border"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden relative">
        {displayImage ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <ImageWithFallback
              src={displayImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <PlaceholderArt 
            articleId={article.id}
            category={article.category}
            title={article.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            useCategoryArt={true}
          />
        )}
        
        {/* LinkedIn Badge Overlay */}
        {article.source === 'linkedin' && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 rounded-lg shadow-lg">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-xs font-semibold text-white">LinkedIn</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            {article.category}
          </Badge>
        </div>
        
        <h3 className="line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
          <Clock className="w-4 h-4" />
          <span>{article.readingTime} min read</span>
        </div>
      </div>
    </Card>
  )
}