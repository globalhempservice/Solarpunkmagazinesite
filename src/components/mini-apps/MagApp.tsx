import { useState, useEffect } from 'react'
import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { ArticleCard } from '../ArticleCard'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { BookOpen, Sparkles } from 'lucide-react'

interface MagAppProps {
  userId: string
  accessToken: string
  onClose: () => void
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

/**
 * MAG Mini-App Wrapper
 * Hemp Magazine with article browsing and reading
 */
export function MagApp({ userId, accessToken, onClose }: MagAppProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const metadata = getMiniAppMetadata('mag')!

  const loadArticles = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/articles`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('MAG app loaded articles:', data.articles?.length)
        setArticles(data.articles || [])
      } else {
        console.error('Failed to load articles, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error loading articles for MAG:', error)
      toast.error('Failed to load articles')
    }
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadArticles}
      showWelcomeFirst={false}
    >
      <div className="h-full overflow-auto bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BookOpen size={32} className="text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Hemp Magazine</h1>
            </div>
            <p className="text-purple-300">Discover stories from the Hemp Universe</p>
          </div>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-white/60">No articles available</p>
              <button
                onClick={loadArticles}
                className="mt-4 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #E8FF00, #b8cc00)',
                  color: '#000',
                }}
              >
                Reload
              </button>
            </div>
          )}
        </div>
      </div>
    </MiniAppContainer>
  )
}