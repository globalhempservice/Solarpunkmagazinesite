import { ArrowLeft, Clock, Eye } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { GenerativeBackground } from "./GenerativeBackground"
import { ImageWithFallback } from "./figma/ImageWithFallback"

interface MediaItem {
  type: 'youtube' | 'audio' | 'image'
  url: string
  caption?: string
}

interface Article {
  id: string
  title: string
  content: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  media?: MediaItem[]
}

interface ArticleReaderProps {
  article: Article
  onBack: () => void
}

export function ArticleReader({ article, onBack }: ArticleReaderProps) {
  const renderMedia = (mediaItem: MediaItem, index: number) => {
    switch (mediaItem.type) {
      case 'youtube':
        const videoId = extractYouTubeId(mediaItem.url)
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      case 'audio':
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <audio controls className="w-full">
                <source src={mediaItem.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      case 'image':
        return (
          <div key={index} className="my-6 space-y-2">
            <div className="rounded-lg overflow-hidden border border-border">
              <ImageWithFallback
                src={mediaItem.url}
                alt={mediaItem.caption || 'Article image'}
                className="w-full"
              />
            </div>
            {mediaItem.caption && (
              <p className="text-sm text-muted-foreground text-center italic">
                {mediaItem.caption}
              </p>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Button>
        
        <article className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="aspect-video overflow-hidden relative">
            <GenerativeBackground seed={article.title} className="w-full h-full" />
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-0">
                {article.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{article.readingTime} min read</span>
              </div>
              {article.views !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{article.views} views</span>
                </div>
              )}
            </div>
            
            <h1 className="text-4xl text-foreground">{article.title}</h1>
            
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {article.media && article.media.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-border">
                {article.media.map((mediaItem, index) => renderMedia(mediaItem, index))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : url
}