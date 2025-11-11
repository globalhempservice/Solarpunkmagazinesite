import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { Clock, Eye } from "lucide-react"
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
  }
  onClick: () => void
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-card border-border"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden relative">
        {article.coverImage ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <ImageWithFallback
              src={article.coverImage}
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
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            {article.category}
          </Badge>
          {article.views !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              <span>{article.views}</span>
            </div>
          )}
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