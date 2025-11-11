// Utility for generating randomized computerized art placeholder images

const artQueries = [
  'digital abstract art',
  'geometric patterns',
  'colorful technology',
  'neon cyberpunk',
  'futuristic design',
  'gradient abstract',
  'tech minimalism',
  'data visualization',
  'modern architecture',
  'holographic art',
  'circuit board',
  'glitch art',
  'vaporwave aesthetic',
  'synthwave retro',
  'fractal patterns',
  'liquid colors',
  'chrome metallic',
  'low poly art',
  'pixel art',
  'digital landscape'
]

/**
 * Generate a consistent placeholder art query based on article seed
 * This ensures the same article always gets the same type of art
 */
export function getPlaceholderArtQuery(seed: string): string {
  // Generate hash from seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % artQueries.length
  return artQueries[index]
}

/**
 * Get category-specific art queries for more contextual images
 */
export function getCategoryArtQuery(category: string): string {
  const categoryMap: Record<string, string[]> = {
    sustainability: ['green technology', 'eco design', 'nature patterns', 'earth tones'],
    technology: ['digital innovation', 'tech circuit', 'futuristic tech', 'ai visualization'],
    culture: ['artistic patterns', 'cultural art', 'creative design', 'vibrant colors'],
    health: ['wellness design', 'organic patterns', 'calming colors', 'natural abstract'],
    innovation: ['future design', 'modern tech', 'innovation visual', 'sleek abstract'],
    community: ['colorful community', 'connected patterns', 'social network', 'unity design'],
    education: ['knowledge visual', 'learning patterns', 'bright education', 'colorful study'],
    lifestyle: ['modern lifestyle', 'aesthetic design', 'trendy patterns', 'stylish colors'],
    business: ['corporate design', 'business tech', 'professional patterns', 'sleek modern'],
    hemp: ['natural fibers', 'green innovation', 'sustainable design', 'organic technology']
  }
  
  const normalizedCategory = category.toLowerCase()
  const queries = categoryMap[normalizedCategory] || artQueries
  
  // Use category length to select from available queries
  const index = category.length % queries.length
  return queries[index]
}

/**
 * Generate a complete Unsplash URL with random art
 * Uses both the article seed and category for variety
 */
export function getPlaceholderArtUrl(articleId: string, category: string = 'general', useCategoryArt: boolean = false): string {
  const query = useCategoryArt 
    ? getCategoryArtQuery(category)
    : getPlaceholderArtQuery(articleId + category)
  
  // URL encode the query
  const encodedQuery = encodeURIComponent(query)
  
  // Return Unsplash URL - the seed ensures consistency for the same article
  // We use a combination of articleId to ensure unique but consistent images
  const seed = Math.abs(articleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
  
  return `https://source.unsplash.com/800x600/?${encodedQuery}&sig=${seed}`
}
