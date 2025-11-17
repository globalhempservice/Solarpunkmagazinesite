/**
 * Feature Unlock System
 * Features are unlocked by achieving reading milestones
 */

export type FeatureId = 
  | 'swipe-mode'
  | 'article-sharing'
  | 'article-creation'
  | 'reading-analytics'
  | 'theme-customization'

export interface FeatureUnlock {
  id: FeatureId
  name: string
  description: string
  icon: string
  requiredArticles: number
  achievementId: string
}

export const FEATURE_UNLOCKS: Record<FeatureId, FeatureUnlock> = {
  'swipe-mode': {
    id: 'swipe-mode',
    name: 'Swipe Mode',
    description: 'Discover articles Tinder-style',
    icon: '🎯',
    requiredArticles: 5,
    achievementId: 'reader-5'
  },
  'article-sharing': {
    id: 'article-sharing',
    name: 'Article Sharing',
    description: 'Share articles with friends',
    icon: '🔗',
    requiredArticles: 10,
    achievementId: 'reader-10'
  },
  'article-creation': {
    id: 'article-creation',
    name: 'Article Creation',
    description: 'Write & import your own articles',
    icon: '✍️',
    requiredArticles: 25,
    achievementId: 'reader-25'
  },
  'reading-analytics': {
    id: 'reading-analytics',
    name: 'Reading Analytics',
    description: 'View detailed stats & history',
    icon: '📊',
    requiredArticles: 50,
    achievementId: 'reader-50'
  },
  'theme-customization': {
    id: 'theme-customization',
    name: 'Theme Customization',
    description: 'Unlock all custom themes',
    icon: '🎨',
    requiredArticles: 100,
    achievementId: 'reader-100'
  }
}

/**
 * Check if a feature is unlocked based on user progress
 */
export function isFeatureUnlocked(
  featureId: FeatureId,
  totalArticlesRead: number
): boolean {
  const feature = FEATURE_UNLOCKS[featureId]
  return totalArticlesRead >= feature.requiredArticles
}

/**
 * Get all unlocked features
 */
export function getUnlockedFeatures(totalArticlesRead: number): FeatureId[] {
  return Object.keys(FEATURE_UNLOCKS).filter(id =>
    isFeatureUnlocked(id as FeatureId, totalArticlesRead)
  ) as FeatureId[]
}

/**
 * Get all locked features with progress
 */
export function getLockedFeatures(totalArticlesRead: number): Array<{
  feature: FeatureUnlock
  progress: number
  articlesNeeded: number
}> {
  return Object.values(FEATURE_UNLOCKS)
    .filter(feature => !isFeatureUnlocked(feature.id, totalArticlesRead))
    .map(feature => ({
      feature,
      progress: Math.min((totalArticlesRead / feature.requiredArticles) * 100, 100),
      articlesNeeded: feature.requiredArticles - totalArticlesRead
    }))
}

/**
 * Get the next feature to unlock
 */
export function getNextFeatureToUnlock(totalArticlesRead: number): {
  feature: FeatureUnlock
  progress: number
  articlesNeeded: number
} | null {
  const locked = getLockedFeatures(totalArticlesRead)
  if (locked.length === 0) return null
  
  // Return the closest locked feature
  return locked.reduce((closest, current) =>
    current.articlesNeeded < closest.articlesNeeded ? current : closest
  )
}
