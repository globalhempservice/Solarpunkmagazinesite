import { useState, useEffect, useRef } from 'react'
import { ArticleCard } from './ArticleCard'
import { Skeleton } from './ui/skeleton'
import { ChevronLeft, ChevronRight, Sun, Lightbulb, Users, Sprout, Eye, Wind, Sparkles, Grid3x3, Flame, Trophy, Target, Star, Zap, ShoppingBag } from 'lucide-react'
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
    description: 'Solar, wind & clean power'
  },
  { 
    name: 'Sustainable Tech', 
    icon: Lightbulb, 
    color: 'from-blue-500 to-cyan-500',
    description: 'Innovation for tomorrow'
  },
  { 
    name: 'Green Cities', 
    icon: Sprout, 
    color: 'from-emerald-500 to-teal-500',
    description: 'Urban sustainability'
  },
  { 
    name: 'Eco Innovation', 
    icon: Sparkles, 
    color: 'from-purple-500 to-pink-500',
    description: 'Creative solutions'
  },
  { 
    name: 'Climate Action', 
    icon: Wind, 
    color: 'from-sky-500 to-blue-500',
    description: 'Fighting climate change'
  },
  { 
    name: 'Community', 
    icon: Users, 
    color: 'from-rose-500 to-red-500',
    description: 'Together we grow'
  },
  { 
    name: 'Future Vision', 
    icon: Eye, 
    color: 'from-violet-500 to-purple-500',
    description: 'Tomorrow\'s world'
  },
]

// Gamification features
const features = [
  { icon: Flame, label: 'Daily Streaks', color: 'from-orange-500 to-red-500' },
  { icon: Trophy, label: '35+ Achievements', color: 'from-yellow-500 to-amber-500' },
  { icon: Target, label: 'NADA Points', color: 'from-emerald-500 to-teal-500' },
  { icon: Star, label: 'Unlock Rewards', color: 'from-purple-500 to-pink-500' },
]

export function BrowsePage({ articles, onArticleClick, loading = false, categoryMenuOpen = true, browseCategoryIndex, setBrowseCategoryIndex }: BrowsePageProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(browseCategoryIndex ?? 0)
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [showArticles, setShowArticles] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pageTopRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<number | null>(null)

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

  // AUTO-SCROLL ANIMATION - Works on both desktop and mobile
  useEffect(() => {
    if (displayedArticles.length === 0) return;

    let frameCount = 0;
    // Increase scroll speed on mobile for better visibility
    const scrollSpeed = isMobile ? 1.0 : 0.5; // 60px/sec on mobile, 30px/sec on desktop

    const autoScroll = () => {
      const { scrollY, innerHeight, document: doc } = window;
      const { scrollHeight } = doc.documentElement;
      
      // Direct window scroll manipulation (more reliable on mobile)
      window.scrollTo(0, window.scrollY + scrollSpeed);
      
      // Debug log every 120 frames (every 2 seconds)
      frameCount++;
      if (frameCount === 120) {
        console.log('🎵 Magazine Auto-scroll active -', isMobile ? 'MOBILE' : 'DESKTOP', '- scrollY:', Math.round(window.scrollY));
        frameCount = 0;
      }
      
      // Loop back to top when reaching the end
      if (window.scrollY + innerHeight >= scrollHeight - 100) {
        window.scrollTo(0, 0);
        console.log('🎵 Auto-scroll looped back to top (vinyl style - Magazine)');
      }
      
      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);
    console.log('🎵 Auto-scroll started for Magazine feed -', isMobile ? 'MOBILE' : 'DESKTOP');

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        console.log('🎵 Auto-scroll stopped for Magazine feed');
      }
    };
  }, [displayedArticles.length, isMobile]);

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
      {/* Category Circle Icons Navigation - Sticky below header */}
      <AnimatePresence>
        {categoryMenuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="sticky top-20 z-40 w-full bg-background/95 backdrop-blur-lg border-b border-border"
          >
            {/* Category Circle Icons Carousel - Active in Center */}
            <div className="relative flex items-start justify-center gap-3 sm:gap-4 px-4 py-5">
              {visibleCategories.map(({ icon: Icon, color, offset, index, name }) => {
                const isCenter = offset === 0
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => jumpToCategory(index)}
                    disabled={isSpinning || isCenter}
                    initial={false}
                    animate={{
                      scale: isCenter ? 1 : 0.75,
                      opacity: isCenter ? 1 : 0.4,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className={`flex flex-col items-center gap-2 min-w-[60px] ${
                      isSpinning ? 'pointer-events-none' : ''
                    } ${!isCenter ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Circle Icon */}
                    <div 
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCenter
                          ? `bg-gradient-to-br ${color} shadow-lg`
                          : 'bg-muted/40 hover:bg-muted/60'
                      }`}
                    >
                      <Icon 
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-500 ${
                          isCenter 
                            ? 'text-white' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </div>
                    
                    {/* Category Name - Only show for center/selected */}
                    <AnimatePresence>
                      {isCenter && (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="text-xs font-medium whitespace-nowrap"
                        >
                          {name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 pt-28">
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