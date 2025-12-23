/**
 * Feature Unlock System
 * UPDATED: Features now unlock based on USER LEVEL (gamification system)
 * instead of raw article counts for better progression
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
  requiredLevel: number  // Changed from requiredArticles to requiredLevel
  achievementId: string
}

export const FEATURE_UNLOCKS: Record<FeatureId, FeatureUnlock> = {
  'swipe-mode': {
    id: 'swipe-mode',
    name: 'Swipe Mode',
    description: 'Discover articles Tinder-style',
    icon: '🎯',
    requiredLevel: 1,  // Unlocked at Level 1 (everyone has access)
    achievementId: 'reader-5'
  },
  'article-sharing': {
    id: 'article-sharing',
    name: 'Article Sharing',
    description: 'Share articles with friends',
    icon: '🔗',
    requiredLevel: 1,  // Unlocked at Level 1 (everyone has access)
    achievementId: 'reader-10'
  },
  'article-creation': {
    id: 'article-creation',
    name: 'Article Creation',
    description: 'Write & import your own articles',
    icon: '✍️',
    requiredLevel: 1,  // REMOVED: Now unlocked for everyone at Level 1
    achievementId: 'reader-25'
  },
  'reading-analytics': {
    id: 'reading-analytics',
    name: 'Reading Analytics',
    description: 'View detailed stats & history',
    icon: '📊',
    requiredLevel: 1,  // Unlocked at Level 1 (everyone has access)
    achievementId: 'reader-50'
  },
  'theme-customization': {
    id: 'theme-customization',
    name: 'Theme Customization',
    description: 'Unlock all custom themes',
    icon: '🎨',
    requiredLevel: 1,  // Unlocked at Level 1 (premium themes available in shop)
    achievementId: 'reader-100'
  }
}

/**
 * Check if a feature is unlocked based on user level
 * NEW: Uses level instead of article count
 */
export function isFeatureUnlocked(
  featureId: FeatureId,
  userLevel: number
): boolean {
  const feature = FEATURE_UNLOCKS[featureId]
  return userLevel >= feature.requiredLevel
}

/**
 * Get all unlocked features
 */
export function getUnlockedFeatures(userLevel: number): FeatureId[] {
  return Object.keys(FEATURE_UNLOCKS).filter(id =>
    isFeatureUnlocked(id as FeatureId, userLevel)
  ) as FeatureId[]
}

/**
 * Get all locked features with progress
 */
export function getLockedFeatures(userLevel: number): Array<{
  feature: FeatureUnlock
  progress: number
  levelsNeeded: number
}> {
  return Object.values(FEATURE_UNLOCKS)
    .filter(feature => !isFeatureUnlocked(feature.id, userLevel))
    .map(feature => ({
      feature,
      progress: Math.min((userLevel / feature.requiredLevel) * 100, 100),
      levelsNeeded: feature.requiredLevel - userLevel
    }))
}

/**
 * Get the next feature to unlock
 */
export function getNextFeatureToUnlock(userLevel: number): {
  feature: FeatureUnlock
  progress: number
  levelsNeeded: number
} | null {
  const locked = getLockedFeatures(userLevel)
  if (locked.length === 0) return null
  
  // Return the closest locked feature
  return locked.reduce((closest, current) =>
    current.levelsNeeded < closest.levelsNeeded ? current : closest
  )
}