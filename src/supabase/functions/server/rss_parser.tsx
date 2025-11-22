// RSS Feed Parser Utility
import Parser from 'npm:rss-parser@3.13.0'

export interface RSSFeed {
  id: string
  url: string
  title: string
  description?: string
  link?: string
  // Enhanced metadata
  imageUrl?: string        // Feed logo/icon
  favicon?: string         // Site favicon
  language?: string        // Feed language (e.g., "en-US")
  copyright?: string       // Copyright info
  managingEditor?: string  // Editor email
  webMaster?: string       // Webmaster email
  lastBuildDate?: string   // When feed was last updated
  categories?: string[]    // Feed categories/tags
  generator?: string       // RSS generator software
  ttl?: number            // Time to live (minutes)
  addedAt: string
  lastFetchedAt?: string
  isActive: boolean
}

export interface RSSArticle {
  id: string
  feedId: string
  feedTitle: string
  feedUrl: string
  title: string
  link: string
  description?: string
  content?: string
  contentSnippet?: string  // Plain text excerpt
  author?: string
  publishedAt?: string
  imageUrl?: string
  category?: string
  // Enhanced metadata
  categories?: string[]    // Multiple categories/tags
  guid?: string           // Global unique identifier
  commentsUrl?: string    // Link to comments
  enclosures?: any[]      // Media attachments (audio, video, etc.)
  source?: string         // Original source if syndicated
  creator?: string        // Alternative author field
  isoDate?: string        // ISO date string
  // Site origin metadata
  siteDomain?: string     // The origin website domain
  siteTitle?: string      // The origin website title
  siteFavicon?: string    // The origin website favicon
  siteImage?: string      // The origin website image/logo
  status: 'pending' | 'published' | 'rejected'
  fetchedAt: string
  publishedToMagazineAt?: string
}

export async function parseRSSFeed(feedUrl: string): Promise<{
  feed: Partial<RSSFeed>
  articles: Partial<RSSArticle>[]
}> {
  try {
    console.log(`Fetching RSS feed from: ${feedUrl}`)
    
    const parser = new Parser({
      headers: {
        'User-Agent': 'DEWII Magazine RSS Reader/1.0'
      },
      timeout: 10000
    })

    const feedData = await parser.parseURL(feedUrl)

    const feed: Partial<RSSFeed> = {
      url: feedUrl,
      title: feedData.title || 'Untitled Feed',
      description: feedData.description,
      link: feedData.link,
      // Enhanced metadata
      imageUrl: feedData.image?.url,
      favicon: feedData.favicon || (feedData.link ? await fetchFavicon(feedData.link) : undefined),
      language: feedData.language,
      copyright: feedData.copyright,
      managingEditor: feedData.managingEditor,
      webMaster: feedData.webMaster,
      lastBuildDate: feedData.lastBuildDate,
      categories: feedData.categories,
      generator: feedData.generator,
      ttl: feedData.ttl,
    }

    const articles: Partial<RSSArticle>[] = (feedData.items || []).map((item: any) => {
      const title = item.title || 'Untitled Article'
      const link = item.link || ''
      const description = item.contentSnippet || item.description
      const content = item.content || item['content:encoded']
      const author = item.creator || item.author || item['dc:creator']
      const pubDate = item.pubDate || item.isoDate
      const category = item.categories?.[0] || item.category
      
      // Extract site metadata from article link
      let siteDomain: string | undefined
      let siteTitle: string | undefined
      
      if (link) {
        try {
          const linkUrl = new URL(link)
          siteDomain = linkUrl.hostname.replace(/^www\./, '')
          // Create a readable site title from domain
          siteTitle = siteDomain.split('.')[0]
            .split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        } catch (e) {
          console.warn('Could not parse article link URL:', link)
        }
      }
      
      // Try to find image from various sources
      let imageUrl: string | undefined
      
      // Try enclosure
      if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url
      }
      
      // Try media content
      if (!imageUrl && item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url
      }
      
      // Try media thumbnail
      if (!imageUrl && item['media:thumbnail']?.$?.url) {
        imageUrl = item['media:thumbnail'].$.url
      }
      
      // Try to extract from content
      if (!imageUrl && (content || description)) {
        const imgMatch = (content || description)?.match(/<img[^>]+src=[\"']([^\"'>]+)[\"']/i)
        if (imgMatch) {
          imageUrl = imgMatch[1]
        }
      }

      return {
        title,
        link,
        description: stripHtml(description),
        content: stripHtml(content),
        contentSnippet: item.contentSnippet,
        author,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
        imageUrl,
        category,
        // Enhanced metadata
        categories: item.categories || (item.category ? [item.category] : undefined),
        guid: item.guid || item.id,
        commentsUrl: item.comments,
        enclosures: item.enclosure ? [item.enclosure] : (item.enclosures || undefined),
        source: item.source?.title || item.source,
        creator: item.creator || item['dc:creator'],
        isoDate: item.isoDate,
        feedTitle: feed.title,
        feedUrl: feedUrl,
        // Site origin metadata
        siteDomain,
        siteTitle,
        siteFavicon: siteDomain ? `https://${siteDomain}/favicon.ico` : undefined,
        siteImage: imageUrl, // Use article image as site image if available
        status: 'pending' as const,
        fetchedAt: new Date().toISOString()
      }
    }).filter(article => article.link) // Only include articles with links

    return { feed, articles }
  } catch (error: any) {
    console.error('RSS parsing error:', error)
    throw new Error(`Failed to parse RSS feed: ${error.message}`)
  }
}

function stripHtml(html: string | undefined): string | undefined {
  if (!html) return undefined
  // Basic HTML stripping - remove tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export function generateFeedId(url: string): string {
  // Create a simple hash of the URL for the feed ID
  return `feed_${btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}_${Date.now()}`
}

export function generateArticleId(feedId: string, articleLink: string): string {
  // Create a deterministic ID based on feed and article link to avoid duplicates
  // Use crypto hash for better uniqueness
  const combinedString = `${feedId}_${articleLink}`
  const encoder = new TextEncoder()
  const data = encoder.encode(combinedString)
  
  // Simple hash function (djb2)
  let hash = 5381
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) + data[i]
  }
  
  // Convert to base36 for shorter string
  return `rss_${Math.abs(hash).toString(36)}_${btoa(articleLink.substring(0, 30)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`
}

async function fetchFavicon(url: string): Promise<string | undefined> {
  try {
    const urlObj = new URL(url)
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`
    
    // Try common favicon locations
    const faviconUrls = [
      `${baseUrl}/favicon.ico`,
      `${baseUrl}/favicon.png`,
      `${baseUrl}/apple-touch-icon.png`
    ]
    
    // Also try to parse from HTML
    try {
      const response = await fetch(url, { 
        headers: { 'User-Agent': 'DEWII Magazine RSS Reader/1.0' },
        signal: AbortSignal.timeout(3000)
      })
      const html = await response.text()
      
      // Look for favicon link tags
      const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
      if (iconMatch) {
        const iconUrl = iconMatch[1]
        // Make absolute URL if relative
        if (iconUrl.startsWith('http')) {
          return iconUrl
        } else if (iconUrl.startsWith('//')) {
          return `${urlObj.protocol}${iconUrl}`
        } else if (iconUrl.startsWith('/')) {
          return `${baseUrl}${iconUrl}`
        } else {
          return `${baseUrl}/${iconUrl}`
        }
      }
    } catch (htmlError) {
      console.warn('Could not parse HTML for favicon:', htmlError)
    }
    
    // Fallback to standard favicon.ico
    return `${baseUrl}/favicon.ico`
  } catch (error) {
    console.error('Failed to fetch favicon:', error)
    return undefined
  }
}