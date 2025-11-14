import { Heart, Clock, User, Sparkles, BookOpen } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  author?: string
  authorImage?: string
  authorTitle?: string
  media?: Array<{
    type: 'youtube' | 'audio' | 'image' | 'spotify'
    url: string
    caption?: string
  }>
}

interface MatchedArticlesProps {
  articles: Article[]
  onArticleClick: (article: Article) => void
  onBack: () => void
}

export function MatchedArticles({ articles, onArticleClick, onBack }: MatchedArticlesProps) {
  if (articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={onBack}
          variant="outline"
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <div className="text-center py-16 space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full opacity-20 animate-pulse" />
            <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-pink-500" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2">No Reading Matches Yet</h2>
            <p className="text-muted-foreground text-lg">
              Start swiping in Explore mode to find articles you'll love!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-2 border-pink-500/20 max-w-md mx-auto">
            <h3 className="font-bold mb-2">💡 How it works</h3>
            <p className="text-sm text-muted-foreground">
              Switch to Swipe Mode in the Explore page and swipe right (💚) on articles you want to read later. 
              They'll appear here in your Reading Matches!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          ← Back to Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 bg-pink-500/10 text-pink-600 border-pink-500/20 px-4 py-2 text-base">
            <Heart className="w-4 h-4 fill-pink-500" />
            {articles.length} Reading {articles.length === 1 ? 'Match' : 'Matches'}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <div className="text-center pb-4">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          Your Reading Matches 💚
        </h1>
        <p className="text-muted-foreground">
          Articles you've matched with in Swipe Mode
        </p>
      </div>

      {/* Matched Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Card 
            key={article.id}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-pink-500/30 overflow-hidden"
            onClick={() => onArticleClick(article)}
          >
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-br from-pink-500/20 to-rose-500/20 overflow-hidden">
              {article.coverImage ? (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
                  }}
                />
              ) : article.media?.[0]?.type === 'image' ? (
                <img
                  src={article.media[0].url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-pink-500/30" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              
              {/* Matched Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-pink-500 text-white rounded-full p-2 shadow-lg">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
              </div>
              
              {/* Category Badge */}
              <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm border-2">
                {article.category}
              </Badge>
            </div>

            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-xl line-clamp-2 group-hover:text-pink-500 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-muted-foreground text-sm line-clamp-2">
                {article.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime} min
                </div>
                {article.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {article.author}
                  </div>
                )}
              </div>

              {/* Read Button */}
              <Button
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
                onClick={() => onArticleClick(article)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Read Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}