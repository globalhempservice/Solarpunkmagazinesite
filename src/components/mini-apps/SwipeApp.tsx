import { useState, useEffect } from 'react'
import { MiniAppContainer } from './MiniAppContainer'
import { getMiniAppMetadata } from '../../config/mini-apps-metadata'
import { SwipeMode } from '../SwipeMode'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

interface SwipeAppProps {
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
  isExternal?: boolean
  source?: string
  sourceUrl?: string
}

/**
 * SWIPE Mini-App Wrapper
 * Tinder-style article discovery
 */
export function SwipeApp({ userId, accessToken, onClose }: SwipeAppProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const metadata = getMiniAppMetadata('swipe')!

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
        console.log('Swipe app loaded articles:', data.articles?.length)
        setArticles(data.articles || [])
      } else {
        console.error('Failed to load articles, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error loading articles for swipe:', error)
      toast.error('Failed to load articles')
    }
  }

  const handleMatch = async (article: Article) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/articles/${article.id}/match`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      toast.success('Article saved!')
    } catch (error) {
      console.error('Error matching article:', error)
    }
  }

  const handleReadArticle = (article: Article) => {
    setSelectedArticle(article)
  }

  return (
    <MiniAppContainer
      metadata={metadata}
      onClose={onClose}
      loadData={loadArticles}
      showWelcomeFirst={false}
    >
      {articles.length > 0 ? (
        <SwipeMode
          articles={articles}
          onMatch={handleMatch}
          onReadArticle={handleReadArticle}
          accessToken={accessToken}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <p className="text-white/60 mb-4">No articles available</p>
            <button
              onClick={loadArticles}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #E8FF00, #b8cc00)',
                color: '#000',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </MiniAppContainer>
  )
}