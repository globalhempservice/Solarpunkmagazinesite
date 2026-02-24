import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { ArticleReader } from '../ArticleReader'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  Search, 
  Filter, 
  Bookmark, 
  Clock,
  Rss,
  ArrowUp,
  ChevronRight
} from 'lucide-react'

interface MagAppProps {
  userId: string
  accessToken: string
  userProgress?: any
  onClose: () => void
  onProgressUpdate?: (progress: any) => void
}

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
}

// Article categories
const CATEGORIES = [
  { id: 'all', label: 'All Stories', color: '#a855f7' },
  { id: 'hemp', label: 'Hemp', color: '#10B981', dbCategory: 'Hemp' },
  { id: 'sustainability', label: 'Sustainability', color: '#14B8A6', dbCategory: 'Sustainability' },
  { id: 'innovation', label: 'Innovation', color: '#8b5cf6', dbCategory: 'Eco Innovation' },
  { id: 'lifestyle', label: 'Lifestyle', color: '#ec4899', dbCategory: 'Lifestyle' },
  { id: 'business', label: 'Business', color: '#f59e0b', dbCategory: 'Business' },
  { id: 'culture', label: 'Culture', color: '#06b6d4', dbCategory: 'Community' },
]

const ARTICLES_PER_PAGE = 12

/**
 * MAG Mini-App - Nebula Editorial Infinite Feed
 * Premium 2025 magazine experience with art direction
 */
export function MagApp({ userId, accessToken, userProgress, onClose, onProgressUpdate }: MagAppProps) {
  const [allArticles, setAllArticles] = useState<Article[]>([]) // All articles from server
  const [articles, setArticles] = useState<Article[]>([]) // Filtered articles for display
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldResetScrollRef = useRef(false) // Track intentional category changes
  const metadata = getMiniAppMetadata('mag')!

  // Fetch articles from server (no category filtering - we filter client-side)
  const fetchArticles = useCallback(async (offset: number, isLoadMore: boolean) => {
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)

    try {
      // Always fetch all articles - no category param (client-side filtering is faster)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/articles?limit=${ARTICLES_PER_PAGE}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const newArticles = data.articles || []
        
        if (isLoadMore) {
          setAllArticles(prev => [...prev, ...newArticles])
        } else {
          setAllArticles(newArticles)
          // Only reset scroll if this was an intentional category change
          if (shouldResetScrollRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
            shouldResetScrollRef.current = false
          }
        }
        
        setHasMore(newArticles.length === ARTICLES_PER_PAGE)
      } else {
        console.error('Failed to load articles, status:', response.status)
        toast.error('Failed to load articles')
      }
    } catch (error) {
      console.error('Error loading articles for MAG:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [accessToken])

  // Filter articles client-side based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setArticles(allArticles)
    } else {
      // Find the DB category name for the selected category
      const categoryConfig = CATEGORIES.find(c => c.id === selectedCategory)
      const dbCategory = categoryConfig?.dbCategory
      
      if (!dbCategory) {
        console.warn(`⚠️ MAG: No dbCategory mapping found for "${selectedCategory}"`)
        setArticles([])
        return
      }
      
      // Filter articles by DB category name
      const filtered = allArticles.filter(article => {
        const articleCat = article.category?.trim()
        const targetCat = dbCategory.trim()
        
        // Direct match
        if (articleCat === targetCat) return true
        // Case-insensitive match
        if (articleCat?.toLowerCase() === targetCat?.toLowerCase()) return true
        // Partial match (e.g., "Hemp" in "Industrial Hemp")
        if (articleCat?.toLowerCase().includes(targetCat.toLowerCase())) return true
        return false
      })
      
      console.log(`📊 MAG: Category "${selectedCategory}" (DB: "${dbCategory}")`)
      console.log(`   Found ${filtered.length}/${allArticles.length} articles`)
      console.log(`   Sample categories in DB:`, [...new Set(allArticles.slice(0, 10).map(a => a.category))])
      setArticles(filtered)
    }
  }, [allArticles, selectedCategory])

  // Initial load
  useEffect(() => {
    fetchArticles(0, false)
  }, [fetchArticles])

  // Infinite scroll + back to top visibility
  useEffect(() => {
    const scrollElement = scrollContainerRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)
      
      // Show back to top button
      setShowBackToTop(scrollTop > 500)
      
      // Load more when near bottom (within 300px) or scrolled 85% down
      if ((distanceFromBottom < 300 || scrolledPercentage > 0.85) && hasMore && !loadingMore && !loading) {
        console.log('🔄 MAG infinite scroll triggered - Distance from bottom:', distanceFromBottom, 'px - Loading next', ARTICLES_PER_PAGE, 'articles')
        fetchArticles(allArticles.length, true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [allArticles.length, hasMore, loadingMore, loading, fetchArticles])

  // Category change handler
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setArticles([])
    setHasMore(true)
    shouldResetScrollRef.current = true // Mark as intentional category change
  }

  // Scroll to top handler
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate NADA reward based on reading time
  const calculateNADA = (readingTime: number) => {
    if (readingTime <= 2) return 3
    if (readingTime <= 5) return 5
    if (readingTime <= 10) return 8
    return 10
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      skipLoading={false}
      showWelcomeFirst={false}
    >
      {/* Background Layer - Extends full screen behind navbars */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-950 via-[#1a0b2e] to-indigo-950" />

      {/* Content Layer - Padded to stay between navbars */}
      <div 
        className="relative h-full flex flex-col"
        style={{
          paddingTop: '80px',
          paddingBottom: '96px',
        }}
      >
        
        {/* Sticky Header */}
        <div className="shrink-0 sticky top-0 z-30 bg-gradient-to-b from-purple-950/98 via-purple-950/95 to-purple-950/90 backdrop-blur-xl border-b border-purple-500/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top Row: Logo + Actions */}
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <BookOpen size={28} className="text-purple-400" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Hemp Magazine</h1>
                  <p className="text-xs text-purple-300 hidden sm:block">Editorial Infinite Feed</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-400/50"
                  title="Search articles"
                >
                  <Search size={20} className="text-purple-300" />
                </button>
                <button 
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-400/50"
                  title="Filter articles"
                >
                  <Filter size={20} className="text-purple-300" />
                </button>
                <button 
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-400/50"
                  title="Saved articles"
                >
                  <Bookmark size={20} className="text-purple-300" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="pb-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                {CATEGORIES.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className="shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap"
                    style={{
                      background: selectedCategory === category.id 
                        ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                        : 'rgba(255, 255, 255, 0.05)',
                      color: selectedCategory === category.id ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                      border: selectedCategory === category.id 
                        ? `1px solid ${category.color}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: selectedCategory === category.id 
                        ? `0 0 20px ${category.color}40`
                        : 'none',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Feed */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            
            {/* Loading State */}
            {loading && articles.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-white/10 rounded w-16" />
                        <div className="h-6 bg-white/10 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                {/* Articles Grid - Nebula Editorial Style */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  key={selectedCategory}
                >
                  {articles.map((article, index) => {
                    const nadaReward = calculateNADA(article.readingTime)
                    const isFirstCard = index === 0
                    
                    return (
                      <motion.article
                        key={article.id}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          isFirstCard ? 'md:col-span-2 lg:col-span-3' : ''
                        }`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => setSelectedArticle(article)}
                        whileHover={{
                          boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)',
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                        }}
                      >
                        {/* Cover Image with Gradient Overlay */}
                        <div className={`relative ${isFirstCard ? 'aspect-[21/9]' : 'aspect-[4/3]'} overflow-hidden`}>
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div 
                              className="w-full h-full"
                              style={{
                                background: `linear-gradient(135deg, 
                                  ${CATEGORIES.find(c => c.id === article.category)?.color || '#a855f7'}40,
                                  ${CATEGORIES.find(c => c.id === article.category)?.color || '#a855f7'}10
                                )`,
                              }}
                            />
                          )}
                          
                          {/* Aurora Gradient Overlay */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                            style={{
                              background: `linear-gradient(to top, 
                                rgba(0, 0, 0, 0.9) 0%, 
                                rgba(0, 0, 0, 0.4) 50%, 
                                transparent 100%
                              )`,
                            }}
                          />

                          {/* Category Badge - Top Left */}
                          <div className="absolute top-3 left-3">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                              style={{
                                background: `${CATEGORIES.find(c => c.id === article.category)?.color}40`,
                                border: `1px solid ${CATEGORIES.find(c => c.id === article.category)?.color}80`,
                                color: '#fff',
                              }}
                            >
                              {article.category?.toUpperCase() || 'ARTICLE'}
                            </span>
                          </div>

                          {/* NADA Reward - Top Right */}
                          <div className="absolute top-3 right-3">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1.5"
                              style={{
                                background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                              }}
                            >
                              <Sparkles size={12} />
                              +{nadaReward} NADA
                            </span>
                          </div>
                        </div>

                        {/* Content Section - Platinum Glass Paper */}
                        <div className="p-4 sm:p-5">
                          {/* Source Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                              <Rss size={12} className="text-purple-300" />
                            </div>
                            <span className="text-xs text-purple-300 font-medium">
                              {article.author || 'Hemp Universe'}
                            </span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs text-white/40">
                              {new Date(article.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-white font-bold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors ${
                            isFirstCard ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                          }`}>
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          {article.excerpt && (
                            <p className={`text-white/60 line-clamp-2 mb-3 ${
                              isFirstCard ? 'text-base' : 'text-sm'
                            }`}>
                              {article.excerpt}
                            </p>
                          )}

                          {/* Meta Row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-purple-300">
                              <Clock size={14} />
                              <span>{article.readingTime} MIN</span>
                            </div>
                            
                            <span 
                              className="px-2.5 py-0.5 rounded-md text-xs font-medium"
                              style={{
                                background: 'rgba(249, 115, 22, 0.2)',
                                border: '1px solid rgba(249, 115, 22, 0.4)',
                                color: '#fb923c',
                              }}
                            >
                              RSS
                            </span>

                            <div className="flex-1" />

                            {/* Read CTA */}
                            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                              <span>Read</span>
                              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </motion.div>

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-white/60 font-medium">Loading more stories...</p>
                    </div>
                  </div>
                )}

                {/* Manual Load More Button - Fallback */}
                {!loadingMore && hasMore && articles.length > 0 && (
                  <div className="flex items-center justify-center py-8">
                    <button
                      onClick={() => fetchArticles(allArticles.length, true)}
                      className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                      }}
                    >
                      <Sparkles size={18} />
                      Load More Stories
                    </button>
                  </div>
                )}

                {/* End of Feed */}
                {!hasMore && articles.length > 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                    <p className="text-white/60 text-sm mb-6">Check back later for more stories</p>
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                      }}
                    >
                      Explore All Categories
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Sparkles size={64} className="mx-auto mb-6 text-purple-400 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-3">No articles in this category</h3>
                <p className="text-white/60 mb-6">Try exploring other categories</p>
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                  }}
                >
                  View All Stories
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back to Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp size={20} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            className="fixed inset-x-0 top-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            style={{ bottom: 'var(--nav-bottom)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              className="w-full h-full max-w-5xl max-h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ArticleReader
                article={selectedArticle}
                userProgress={userProgress}
                allArticles={articles}
                accessToken={accessToken}
                onBack={() => setSelectedArticle(null)}
                onProgressUpdate={onProgressUpdate}
                suggestedArticles={articles
                  .filter(a => 
                    a.id !== selectedArticle.id &&
                    !userProgress?.readArticles?.includes(a.id)
                  )
                  .slice(0, 3)
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniAppContainer>
  )
}