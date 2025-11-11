import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize storage bucket for article media
async function initStorage() {
  const bucketName = 'make-053bcd80-magazine-media'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false })
  }
}

initStorage()

// Auth middleware
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (!user || error) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('userId', user.id)
  await next()
}

// ===== ARTICLE ROUTES =====

// Get all articles (with optional filtering)
app.get('/make-server-053bcd80/articles', async (c) => {
  try {
    const category = c.req.query('category')
    const limit = parseInt(c.req.query('limit') || '50')
    
    let articlesData = await kv.getByPrefix('article:')
    
    let articles = articlesData
      .map(item => item.value)
      .filter(article => article && typeof article === 'object')
    
    if (category) {
      articles = articles.filter(article => article.category === category)
    }
    
    // Sort by date, newest first
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ articles: articles.slice(0, limit) })
  } catch (error) {
    console.log('Error fetching articles:', error)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})

// Get single article by ID
app.get('/make-server-053bcd80/articles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const article = await kv.get(`article:${id}`)
    
    if (!article) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    return c.json({ article })
  } catch (error) {
    console.log('Error fetching article:', error)
    return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
  }
})

// Create new article (auth required)
app.post('/make-server-053bcd80/articles', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    const { title, content, excerpt, category, coverImage, readingTime, media } = body
    
    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400)
    }
    
    const id = crypto.randomUUID()
    const article = {
      id,
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category || 'general',
      coverImage: coverImage || '',
      readingTime: readingTime || 5,
      media: media || [],
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0
    }
    
    await kv.set(`article:${id}`, article)
    
    return c.json({ article }, 201)
  } catch (error) {
    console.log('Error creating article:', error)
    return c.json({ error: 'Failed to create article', details: error.message }, 500)
  }
})

// Update article
app.put('/make-server-053bcd80/articles/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const existingArticle = await kv.get(`article:${id}`)
    if (!existingArticle) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    const updatedArticle = {
      ...existingArticle,
      ...body,
      id,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`article:${id}`, updatedArticle)
    
    return c.json({ article: updatedArticle })
  } catch (error) {
    console.log('Error updating article:', error)
    return c.json({ error: 'Failed to update article', details: error.message }, 500)
  }
})

// Delete article
app.delete('/make-server-053bcd80/articles/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    await kv.del(`article:${id}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting article:', error)
    return c.json({ error: 'Failed to delete article', details: error.message }, 500)
  }
})

// Increment article views
app.post('/make-server-053bcd80/articles/:id/view', async (c) => {
  try {
    const id = c.req.param('id')
    const article = await kv.get(`article:${id}`)
    
    if (!article) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    article.views = (article.views || 0) + 1
    await kv.set(`article:${id}`, article)
    
    return c.json({ views: article.views })
  } catch (error) {
    console.log('Error incrementing views:', error)
    return c.json({ error: 'Failed to increment views', details: error.message }, 500)
  }
})

// ===== USER PROGRESS & GAMIFICATION =====

// Get user progress
app.get('/make-server-053bcd80/users/:userId/progress', async (c) => {
  try {
    const userId = c.req.param('userId')
    const progress = await kv.get(`user:${userId}:progress`)
    
    if (!progress) {
      // Initialize default progress
      const defaultProgress = {
        userId,
        totalArticlesRead: 0,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        readArticles: [],
        lastReadDate: null
      }
      await kv.set(`user:${userId}:progress`, defaultProgress)
      return c.json({ progress: defaultProgress })
    }
    
    return c.json({ progress })
  } catch (error) {
    console.log('Error fetching user progress:', error)
    return c.json({ error: 'Failed to fetch user progress', details: error.message }, 500)
  }
})

// Mark article as read and update progress
app.post('/make-server-053bcd80/users/:userId/read', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { articleId } = await c.req.json()
    
    if (!articleId) {
      return c.json({ error: 'Article ID is required' }, 400)
    }
    
    let progress = await kv.get(`user:${userId}:progress`)
    
    if (!progress) {
      progress = {
        userId,
        totalArticlesRead: 0,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        readArticles: [],
        lastReadDate: null
      }
    }
    
    // Check if article already read
    if (!progress.readArticles.includes(articleId)) {
      progress.readArticles.push(articleId)
      progress.totalArticlesRead += 1
      progress.points += 10 // 10 points per article
      
      // Update streak
      const today = new Date().toDateString()
      const lastRead = progress.lastReadDate ? new Date(progress.lastReadDate).toDateString() : null
      
      if (lastRead === today) {
        // Same day, no change
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toDateString()
        
        if (lastRead === yesterdayStr) {
          // Consecutive day
          progress.currentStreak += 1
        } else {
          // Streak broken
          progress.currentStreak = 1
        }
        
        progress.lastReadDate = new Date().toISOString()
      }
      
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak
      }
      
      // Check for achievements
      const newAchievements = []
      
      if (progress.totalArticlesRead === 1 && !progress.achievements.includes('first-read')) {
        newAchievements.push({ id: 'first-read', name: 'First Steps', description: 'Read your first article', points: 50 })
        progress.achievements.push('first-read')
        progress.points += 50
      }
      
      if (progress.totalArticlesRead === 10 && !progress.achievements.includes('reader-10')) {
        newAchievements.push({ id: 'reader-10', name: 'Curious Mind', description: 'Read 10 articles', points: 100 })
        progress.achievements.push('reader-10')
        progress.points += 100
      }
      
      if (progress.currentStreak === 3 && !progress.achievements.includes('streak-3')) {
        newAchievements.push({ id: 'streak-3', name: '3-Day Streak', description: 'Read for 3 consecutive days', points: 75 })
        progress.achievements.push('streak-3')
        progress.points += 75
      }
      
      if (progress.currentStreak === 7 && !progress.achievements.includes('streak-7')) {
        newAchievements.push({ id: 'streak-7', name: 'Weekly Warrior', description: 'Read for 7 consecutive days', points: 150 })
        progress.achievements.push('streak-7')
        progress.points += 150
      }
      
      await kv.set(`user:${userId}:progress`, progress)
      
      return c.json({ progress, newAchievements })
    }
    
    return c.json({ progress, newAchievements: [] })
  } catch (error) {
    console.log('Error updating user progress:', error)
    return c.json({ error: 'Failed to update user progress', details: error.message }, 500)
  }
})

// Get leaderboard
app.get('/make-server-053bcd80/leaderboard', async (c) => {
  try {
    const allProgress = await kv.getByPrefix('user:')
    
    const leaderboard = allProgress
      .map(item => item.value)
      .filter(p => p && p.userId && p.points !== undefined)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
    
    return c.json({ leaderboard })
  } catch (error) {
    console.log('Error fetching leaderboard:', error)
    return c.json({ error: 'Failed to fetch leaderboard', details: error.message }, 500)
  }
})

// ===== AUTH ROUTES =====

// Sign up
app.post('/make-server-053bcd80/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Reader' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: 'Failed to create user', details: error.message }, 400)
    }
    
    return c.json({ user: data.user }, 201)
  } catch (error) {
    console.log('Error during signup:', error)
    return c.json({ error: 'Failed to sign up', details: error.message }, 500)
  }
})

// Upload media file
app.post('/make-server-053bcd80/upload', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file')
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const fileName = `${crypto.randomUUID()}-${file.name}`
    const bucketName = 'make-053bcd80-magazine-media'
    
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type
      })
    
    if (error) {
      console.log('Upload error:', error)
      return c.json({ error: 'Failed to upload file', details: error.message }, 500)
    }
    
    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000)
    
    return c.json({ url: signedUrlData?.signedUrl, fileName })
  } catch (error) {
    console.log('Error uploading file:', error)
    return c.json({ error: 'Failed to upload file', details: error.message }, 500)
  }
})

// Health check
app.get('/make-server-053bcd80/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

Deno.serve(app.fetch)
