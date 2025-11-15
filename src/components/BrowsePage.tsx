import { useState } from 'react'
import { ArticleCard } from './ArticleCard'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Search, X, Filter } from 'lucide-react'

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

interface BrowsePageProps {
  articles: Article[]
  onArticleClick: (article: Article) => void
  loading?: boolean
}

const categories = ['all', 'Renewable Energy', 'Sustainable Tech', 'Green Cities', 'Eco Innovation', 'Climate Action', 'Community', 'Future Vision']

export function BrowsePage({ articles, onArticleClick, loading = false }: BrowsePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredArticles = articles.filter(article => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Browse Articles</h1>
        <p className="text-lg text-muted-foreground">
          Explore {articles.length} articles across sustainability and innovation
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search articles by title, content, or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-12 h-14 text-base border-2 border-border/50 focus:border-primary/50 rounded-2xl bg-muted/30 backdrop-blur-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {categories.map(category => {
            const isActive = selectedCategory === category
            const categoryCount = category === 'all' 
              ? articles.length
              : articles.filter(a => a.category === category).length
            
            return (
              <Badge
                key={category}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap px-4 py-2 transition-all hover:scale-105 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : 'hover:bg-muted/70 hover:border-primary/30'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category} {categoryCount > 0 && `(${categoryCount})`}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredArticles.length === articles.length 
            ? `Showing all ${filteredArticles.length} articles`
            : `Showing ${filteredArticles.length} of ${articles.length} articles`}
        </p>
        {(searchQuery || selectedCategory !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="text-primary hover:text-primary/80"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onArticleClick(article)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
