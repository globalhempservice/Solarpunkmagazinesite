import { LucideIcon } from "lucide-react"
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
  categoryIcon?: LucideIcon
  categoryColor?: string
}

export function ArticleCard({ article, onClick, categoryIcon, categoryColor }: ArticleCardProps) {
  // Get cover image from article.coverImage or first media image
  const displayImage = article.coverImage || article.media?.find(m => m.type === 'image')?.url
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Gradient border wrapper */}
      <div className={`relative rounded-xl p-[2px] bg-gradient-to-br ${categoryColor || 'from-border to-border'} hover:shadow-2xl transition-all duration-300`}>
        {/* Inner card with glass morphism */}
        <div className="relative rounded-[10px] bg-card/95 backdrop-blur-sm overflow-hidden h-full">
          {/* Image section */}
          <div className="aspect-video overflow-hidden relative">
            {displayImage ? (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <ImageWithFallback
                  src={displayImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
            ) : (
              <PlaceholderArt 
                articleId={article.id}
                category={article.category}
                title={article.title}
                className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                useCategoryArt={true}
              />
            )}
            
            {/* Category badge overlay on image */}
            {categoryIcon && categoryColor && (
              <div className="absolute top-3 left-3 z-20">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${categoryColor} rounded-full shadow-xl backdrop-blur-sm`}>
                  {(() => {
                    const Icon = categoryIcon
                    return <Icon className="w-3.5 h-3.5 text-white" />
                  })()}
                  <span className="text-xs font-semibold text-white">{article.category}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Content section with modern spacing */}
          <div className="relative p-5 space-y-3">
            {/* Title with better typography */}
            <h3 className="line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
              {article.title}
            </h3>
            
            {/* Excerpt with subtle styling */}
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
            
            {/* LinkedIn indicator at bottom if from LinkedIn */}
            {article.source === 'linkedin' && (
              <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs text-muted-foreground font-medium">From LinkedIn</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}