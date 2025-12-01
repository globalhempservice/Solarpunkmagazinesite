import { useState, useEffect, useRef } from 'react'
import { ArticleCard } from './ArticleCard'
import { Skeleton } from './ui/skeleton'
import { ChevronLeft, ChevronRight, Sun, Lightbulb, Users, Sprout, Eye, Wind, Sparkles, Grid3x3 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

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
  categoryMenuOpen?: boolean
  browseCategoryIndex?: number
  setBrowseCategoryIndex?: (index: number) => void
}

// Category definitions with icons
const categories = [
  { 
    name: 'All Articles', 
    icon: Grid3x3, 
    color: 'from-indigo-500 to-purple-500',
    description: 'Browse everything'
  },
  { 
    name: 'Renewable Energy', 
    icon: Sun, 
    color: 'from-amber-500 to-orange-500',
  },
  { 
    name: 'Sustainable Tech', 
    icon: Lightbulb, 
    color: 'from-blue-500 to-cyan-500',
  },
  { 
    name: 'Green Cities', 
    icon: Sprout, 
    color: 'from-emerald-500 to-teal-500',
  },
  { 
    name: 'Eco Innovation', 
    icon: Sparkles, 
    color: 'from-purple-500 to-pink-500',
  },
  { 
    name: 'Climate Action', 
    icon: Wind, 
    color: 'from-sky-500 to-blue-500',
  },
  { 
    name: 'Community', 
    icon: Users, 
    color: 'from-rose-500 to-red-500',
  },
  { 
    name: 'Future Vision', 
    icon: Eye, 
    color: 'from-violet-500 to-purple-500',
  },
]

export function BrowsePage({ articles, onArticleClick, loading = false, categoryMenuOpen = true, browseCategoryIndex, setBrowseCategoryIndex }: BrowsePageProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(browseCategoryIndex ?? 0)
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [showArticles, setShowArticles] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pageTopRef = useRef<HTMLDivElement>(null)

  const currentCategory = categories[currentCategoryIndex]
  const totalCategories = categories.length

  // Sync with parent state when browseCategoryIndex changes (e.g., returning from article)
  useEffect(() => {
    if (browseCategoryIndex !== undefined && browseCategoryIndex !== currentCategoryIndex) {
      setCurrentCategoryIndex(browseCategoryIndex)
    }
  }, [browseCategoryIndex])

  // Save category to parent state and localStorage when it changes
  useEffect(() => {
    if (setBrowseCategoryIndex) {
      setBrowseCategoryIndex(currentCategoryIndex)
    }
    localStorage.setItem('browseCategoryIndex', currentCategoryIndex.toString())
  }, [currentCategoryIndex, setBrowseCategoryIndex])

  // Helper function to get category metadata by name
  const getCategoryMetadata = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)
  }

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    pageTopRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  // Shuffle articles when category changes
  useEffect(() => {
    console.log('🔍 BrowsePage: Articles received:', articles.length)
    console.log('🔍 BrowsePage: First 3 articles:', articles.slice(0, 3))
    setShowArticles(false)

    if (articles.length === 0) {
      console.log('⚠️ BrowsePage: No articles to display')
      setDisplayedArticles([])
      setShowArticles(true)
      return
    }

    // Check if "All Articles" view is selected
    const isAllArticlesView = currentCategory.name === 'All Articles'
    
    // Get articles: either all or filtered by category
    const relevantArticles = isAllArticlesView 
      ? articles 
      : articles.filter(a => a.category === currentCategory.name)
    
    // Sort by date (latest first) - assuming createdAt is in ISO format
    const sortedByDate = [...relevantArticles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Latest first
    })
    
    // Display the sorted articles
    setDisplayedArticles(sortedByDate)

    // Show articles after brief delay
    const articlesTimer = setTimeout(() => {
      setShowArticles(true)
    }, 400)

    return () => clearTimeout(articlesTimer)
  }, [currentCategoryIndex, articles, currentCategory.name])

  const spinToNext = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setCurrentCategoryIndex((prev) => (prev + 1) % totalCategories)
    
    setTimeout(() => setIsSpinning(false), 400)
  }

  const spinToPrevious = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setCurrentCategoryIndex((prev) => (prev - 1 + totalCategories) % totalCategories)
    
    setTimeout(() => setIsSpinning(false), 400)
  }

  const jumpToCategory = (index: number) => {
    if (isSpinning || index === currentCategoryIndex) return
    
    setIsSpinning(true)
    setCurrentCategoryIndex(index)
    
    setTimeout(() => setIsSpinning(false), 400)
  }

  // Get categories to display: 2 before, current, 2 after (desktop) or 1 before, current, 1 after (mobile)
  const getVisibleCategories = () => {
    const visible = []
    // Show only 1 on each side for mobile (3 total), 2 on each side for desktop (5 total)
    const sideCount = isMobile ? 1 : 2
    
    for (let i = -sideCount; i <= sideCount; i++) {
      const index = (currentCategoryIndex + i + totalCategories) % totalCategories
      visible.push({ ...categories[index], offset: i, index })
    }
    return visible
  }

  const visibleCategories = getVisibleCategories()

  return (
    <div ref={pageTopRef} className="relative min-h-screen pb-24">
      {/* Sub-Navbar - Fixed carousel extending from top navbar */}
      <AnimatePresence>
        {categoryMenuOpen && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-20 left-0 right-0 z-40 w-full"
          >
            {/* Blurred background with gradient - strongest in center, fading at top/bottom */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-background/40"
                style={{
                  backdropFilter: 'blur(2px)',
                }}
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 80% 100% at center, rgba(0,0,0,0.15) 0%, transparent 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              />
            </div>
            
            {/* 5-column carousel - full width with mobile padding */}
            <div className="relative h-20 flex items-center justify-center px-2 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-6">
                {/* Left Arrow */}
                <button
                  onClick={spinToPrevious}
                  disabled={isSpinning}
                  className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-background/80 border border-border/50 hover:border-primary/50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Category Icons: 1-2 left + Center + 1-2 right (responsive) */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {visibleCategories.map(({ icon: Icon, color, offset, index, name }) => {
                    const isCenter = offset === 0
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => jumpToCategory(index)}
                        disabled={isSpinning || isCenter}
                        initial={false}
                        animate={{
                          scale: isCenter ? (isMobile ? 1 : 1.1) : (isMobile ? 0.65 : 0.75),
                          opacity: isCenter ? 1 : 0.4,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className={`flex-shrink-0 p-2.5 sm:p-4 rounded-full transition-all duration-500 ease-out ${
                          isCenter
                            ? `bg-gradient-to-br ${color} shadow-xl cursor-default`
                            : 'bg-muted/40 hover:bg-muted/60 hover:scale-90 cursor-pointer'
                        } ${isSpinning ? 'pointer-events-none' : ''}`}
                        title={name}
                      >
                        <Icon 
                          className={`w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-500 ${
                            isCenter 
                              ? 'text-white' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </motion.button>
                    )
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={spinToNext}
                  disabled={isSpinning}
                  className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-background/80 border border-border/50 hover:border-primary/50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles Grid */}
      <div className={`container mx-auto px-4 transition-all duration-300 ${categoryMenuOpen ? 'pt-28' : 'pt-8'}`}>
        <AnimatePresence mode="wait">
          {showArticles && (
            <>
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </motion.div>
              ) : displayedArticles.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center opacity-20`}>
                    <currentCategory.icon className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">No articles yet</h3>
                    <p className="text-muted-foreground">
                      Check back soon for {currentCategory.name} content
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`articles-${currentCategoryIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  {displayedArticles.map((article, index) => {
                    const categoryMeta = getCategoryMetadata(article.category)
                    return (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ArticleCard
                          article={article}
                          onClick={() => onArticleClick(article)}
                          categoryIcon={categoryMeta?.icon}
                          categoryColor={categoryMeta?.color}
                        />
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Category info hint */}
              {!loading && displayedArticles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-12 space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>{displayedArticles.length} article{displayedArticles.length !== 1 ? 's' : ''} • Latest first</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}