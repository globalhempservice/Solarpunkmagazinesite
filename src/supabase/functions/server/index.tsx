import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase client with SERVICE_ROLE_KEY for server operations
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
  c.set('user', user)
  await next()
}

// ===== ARTICLE ROUTES =====

// Get all articles (with optional filtering)
app.get('/make-server-053bcd80/articles', async (c) => {
  try {
    const category = c.req.query('category')
    const limit = parseInt(c.req.query('limit') || '50')
    
    console.log('Fetching articles from SQL database...')
    
    // Build query
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    const { data: articles, error } = await query
    
    if (error) {
      console.error('Error fetching articles from SQL:', error)
      throw error
    }
    
    console.log('Fetched', articles?.length || 0, 'articles from SQL database')
    
    // Transform SQL articles to frontend format (snake_case -> camelCase)
    const transformedArticles = (articles || []).map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.cover_image,
      readingTime: article.reading_time,
      authorId: article.author_id,
      views: article.views || 0,
      likes: article.likes || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: article.media || [],
      source: article.source,
      sourceUrl: article.source_url,
      author: article.author,
      authorImage: article.author_image,
      authorTitle: article.author_title,
      publishDate: article.publish_date
    }))
    
    return c.json({ articles: transformedArticles })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})

// Get single article by ID
app.get('/make-server-053bcd80/articles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    console.log('Fetching article by ID from SQL database:', id)
    
    // Get article from SQL database
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.log('Error fetching article:', error)
      return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
    }
    
    if (!article) {
      console.log('Article not found:', id)
      return c.json({ error: 'Article not found' }, 404)
    }
    
    console.log('Article found:', id)
    
    // Transform SQL article to frontend format (snake_case -> camelCase)
    const transformedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.cover_image,
      readingTime: article.reading_time,
      authorId: article.author_id,
      views: article.views || 0,
      likes: article.likes || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: article.media || [],
      source: article.source,
      sourceUrl: article.source_url,
      author: article.author,
      authorImage: article.author_image,
      authorTitle: article.author_title,
      publishDate: article.publish_date
    }
    
    return c.json({ article: transformedArticle })
  } catch (error: any) {
    console.log('Error fetching article:', error)
    return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
  }
})

// Get user's own articles (auth required)
app.get('/make-server-053bcd80/my-articles', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    
    console.log('Fetching articles for user:', userId)
    
    // Get articles from SQL database
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('Error fetching user articles:', error)
      return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
    }
    
    console.log('Fetched', articles?.length || 0, 'articles for user')
    
    // Transform SQL articles to frontend format (snake_case -> camelCase)
    const transformedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.cover_image,
      readingTime: article.reading_time,
      authorId: article.author_id,
      views: article.views || 0,
      likes: article.likes || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: article.media || [],
      source: article.source,
      sourceUrl: article.source_url,
      author: article.author,
      authorImage: article.author_image,
      authorTitle: article.author_title,
      publishDate: article.publish_date
    })) || []
    
    return c.json({ articles: transformedArticles })
  } catch (error: any) {
    console.log('Error fetching user articles:', error)
    console.log('Error stack:', error.stack)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})

// Create new article (auth required)
app.post('/make-server-053bcd80/articles', requireAuth, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('Creating article for user:', userId)
    console.log('Article data received:', JSON.stringify(body, null, 2))
    
    const { title, content, excerpt, category, coverImage, readingTime, media, source, sourceUrl, author, authorImage, authorTitle, publishDate } = body
    
    if (!title || !content) {
      console.log('Validation failed: missing title or content')
      return c.json({ error: 'Title and content are required' }, 400)
    }
    
    // Create article ID
    const articleId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // Create article object (snake_case for SQL) - now with all columns
    const article = {
      id: articleId,
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category || 'general',
      cover_image: coverImage || '',
      reading_time: readingTime || 5,
      author_id: userId,
      views: 0,
      likes: 0,
      created_at: now,
      updated_at: now,
      media: media || [],
      source: source || null,
      source_url: sourceUrl || null,
      author: author || null,
      author_image: authorImage || null,
      author_title: authorTitle || null,
      publish_date: publishDate || null
    }
    
    // Save to SQL database with all fields
    const { data: savedArticle, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single()
    
    if (error) {
      console.log('Error creating article:', error)
      return c.json({ error: 'Failed to create article', details: error.message }, 500)
    }
    
    console.log('Article created successfully:', articleId)
    
    // Transform to camelCase for frontend
    const responseArticle = {
      id: savedArticle.id,
      title: savedArticle.title,
      content: savedArticle.content,
      excerpt: savedArticle.excerpt,
      category: savedArticle.category,
      coverImage: savedArticle.cover_image,
      readingTime: savedArticle.reading_time,
      authorId: savedArticle.author_id,
      views: savedArticle.views,
      likes: savedArticle.likes,
      createdAt: savedArticle.created_at,
      updatedAt: savedArticle.updated_at,
      media: savedArticle.media || [],
      source: savedArticle.source,
      sourceUrl: savedArticle.source_url,
      author: savedArticle.author,
      authorImage: savedArticle.author_image,
      authorTitle: savedArticle.author_title,
      publishDate: savedArticle.publish_date
    }
    
    return c.json({ article: responseArticle }, 201)
  } catch (error: any) {
    console.log('Error creating article:', error)
    return c.json({ error: 'Failed to create article', details: error.message }, 500)
  }
})

// Update article
app.put('/make-server-053bcd80/articles/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    const body = await c.req.json()
    
    console.log('Updating article:', id, 'by user:', userId)
    
    // Get existing article from SQL database
    const { data: existingArticle, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.log('Error fetching article:', error)
      return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
    }
    
    if (!existingArticle) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    if (existingArticle.author_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const { title, content, excerpt, category, coverImage, readingTime, media, source, sourceUrl, author, authorImage, authorTitle, publishDate } = body
    
    // Update article (snake_case for SQL) - now with all columns
    const updatedArticle = {
      title,
      content,
      excerpt,
      category,
      cover_image: coverImage,
      reading_time: readingTime,
      media: media || [],
      source: source || null,
      source_url: sourceUrl || null,
      author: author || null,
      author_image: authorImage || null,
      author_title: authorTitle || null,
      publish_date: publishDate || null,
      updated_at: new Date().toISOString()
    }
    
    const { data: savedArticle, error: updateError } = await supabase
      .from('articles')
      .update(updatedArticle)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.log('Error updating article:', updateError)
      return c.json({ error: 'Failed to update article', details: updateError.message }, 500)
    }
    
    console.log('Article updated successfully:', id)
    
    // Transform to camelCase for frontend
    const responseArticle = {
      id: savedArticle.id,
      title: savedArticle.title,
      content: savedArticle.content,
      excerpt: savedArticle.excerpt,
      category: savedArticle.category,
      coverImage: savedArticle.cover_image,
      readingTime: savedArticle.reading_time,
      authorId: savedArticle.author_id,
      views: savedArticle.views,
      likes: savedArticle.likes,
      createdAt: savedArticle.created_at,
      updatedAt: savedArticle.updated_at,
      media: savedArticle.media || [],
      source: savedArticle.source,
      sourceUrl: savedArticle.source_url,
      author: savedArticle.author,
      authorImage: savedArticle.author_image,
      authorTitle: savedArticle.author_title,
      publishDate: savedArticle.publish_date
    }
    
    return c.json({ article: responseArticle })
  } catch (error: any) {
    console.log('Error updating article:', error)
    return c.json({ error: 'Failed to update article', details: error.message }, 500)
  }
})

// Delete article
app.delete('/make-server-053bcd80/articles/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    
    console.log('Delete article request - ID:', id, 'User:', userId)
    
    // Get article from SQL database to check ownership
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.log('Error fetching article for deletion:', error)
      return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
    }
    
    if (!article) {
      console.log('Article not found for deletion:', id)
      return c.json({ error: 'Article not found' }, 404)
    }
    
    console.log('Article found - Owner:', article.author_id, 'Requester:', userId)
    
    if (article.author_id !== userId) {
      console.log('Unauthorized delete attempt - Article owner:', article.author_id, 'User:', userId)
      return c.json({ error: 'Unauthorized - You can only delete your own articles' }, 403)
    }
    
    // Delete from SQL database
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.log('Error deleting article from database:', deleteError)
      return c.json({ error: 'Failed to delete article', details: deleteError.message }, 500)
    }
    
    console.log('Article deleted successfully:', id)
    return c.json({ success: true, message: 'Article deleted successfully' })
  } catch (error: any) {
    console.log('Exception while deleting article:', error)
    console.log('Error stack:', error.stack)
    return c.json({ error: 'Failed to delete article', details: error.message }, 500)
  }
})

// Increment article views
app.post('/make-server-053bcd80/articles/:id/view', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Use RPC to increment atomically
    const { data, error } = await supabase.rpc('increment', {
      table_name: 'articles',
      row_id: id,
      column_name: 'views'
    }).catch(async () => {
      // Fallback: manual increment if RPC doesn't exist
      const { data: article } = await supabase
        .from('articles')
        .select('views')
        .eq('id', id)
        .single()
      
      if (article) {
        const { data: updated, error: updateError } = await supabase
          .from('articles')
          .update({ views: (article.views || 0) + 1 })
          .eq('id', id)
          .select('views')
          .single()
        
        return { data: updated, error: updateError }
      }
      
      return { data: null, error: new Error('Article not found') }
    })
    
    if (error) {
      console.log('Error incrementing views:', error)
      return c.json({ error: 'Failed to increment views', details: error.message }, 500)
    }
    
    return c.json({ views: data?.views || 0 })
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
    
    console.log('Fetching progress for user:', userId)
    
    // Get or create user progress (simple query without joins)
    let { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // No progress found, create default
      console.log('Creating default progress for user:', userId)
      const { data: newProgress, error: insertError } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          total_articles_read: 0,
          points: 0,
          current_streak: 0,
          longest_streak: 0,
          last_read_date: null
        }])
        .select()
        .single()
      
      if (insertError) {
        console.log('Error creating progress:', insertError)
        return c.json({ error: 'Failed to initialize progress', details: insertError.message }, 500)
      }
      
      progress = newProgress
    } else if (error) {
      console.log('Error fetching progress:', error)
      return c.json({ error: 'Failed to fetch progress', details: error.message }, 500)
    }
    
    // Get user achievements separately
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
    
    // Get read articles
    const { data: readArticles } = await supabase
      .from('read_articles')
      .select('article_id')
      .eq('user_id', userId)
    
    // Transform to camelCase for frontend
    const transformedProgress = {
      userId: progress.user_id,
      totalArticlesRead: progress.total_articles_read,
      points: progress.points,
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      lastReadDate: progress.last_read_date,
      achievements: (userAchievements || []).map((ua: any) => ua.achievement_id),
      readArticles: (readArticles || []).map((ra: any) => ra.article_id)
    }
    
    return c.json({ progress: transformedProgress })
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
    
    console.log('Marking article', articleId, 'as read for user', userId)
    
    // Try to insert read_article (will fail if already read due to unique constraint)
    const { data: readArticle, error: readError } = await supabase
      .from('read_articles')
      .insert([{
        user_id: userId,
        article_id: articleId
      }])
      .select()
      .single()
    
    if (readError) {
      if (readError.code === '23505') {
        // Already read, just return current progress
        console.log('Article already read')
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        const transformedProgress = {
          userId: progress.user_id,
          totalArticlesRead: progress.total_articles_read,
          points: progress.points,
          currentStreak: progress.current_streak,
          longestStreak: progress.longest_streak,
          lastReadDate: progress.last_read_date,
          achievements: [],
          readArticles: []
        }
        
        return c.json({ progress: transformedProgress, newAchievements: [] })
      }
      
      console.log('Error marking article as read:', readError)
      return c.json({ error: 'Failed to mark article as read', details: readError.message }, 500)
    }
    
    // Get current progress
    let { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!progress) {
      // Create if doesn't exist
      const { data: newProgress } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          total_articles_read: 0,
          points: 0,
          current_streak: 0,
          longest_streak: 0
        }])
        .select()
        .single()
      
      progress = newProgress
    }
    
    // Update progress
    let newPoints = progress.points + 10 // 10 points per article
    let newStreak = progress.current_streak
    let newLongestStreak = progress.longest_streak
    
    // Calculate streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    const lastRead = progress.last_read_date ? new Date(progress.last_read_date) : null
    const lastReadStr = lastRead ? lastRead.toISOString().split('T')[0] : null
    
    if (lastReadStr !== todayStr) {
      // Different day
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastReadStr === yesterdayStr) {
        // Consecutive day
        newStreak = progress.current_streak + 1
      } else {
        // Streak broken
        newStreak = 1
      }
      
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }
    }
    
    const newTotalRead = progress.total_articles_read + 1
    
    // Update progress in DB
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        total_articles_read: newTotalRead,
        points: newPoints,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_read_date: todayStr,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.log('Error updating progress:', updateError)
    }
    
    // Check for new achievements
    const newAchievements = []
    
    // Get existing achievements
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
    
    const achievementIds = (existingAchievements || []).map((a: any) => a.achievement_id)
    
    // Check achievement conditions
    const achievementsToGrant: string[] = []
    
    if (newTotalRead === 1 && !achievementIds.includes('first-read')) {
      achievementsToGrant.push('first-read')
      newPoints += 50
    }
    
    if (newTotalRead === 10 && !achievementIds.includes('reader-10')) {
      achievementsToGrant.push('reader-10')
      newPoints += 100
    }
    
    if (newTotalRead === 50 && !achievementIds.includes('reader-50')) {
      achievementsToGrant.push('reader-50')
      newPoints += 300
    }
    
    if (newTotalRead === 100 && !achievementIds.includes('reader-100')) {
      achievementsToGrant.push('reader-100')
      newPoints += 500
    }
    
    if (newStreak === 3 && !achievementIds.includes('streak-3')) {
      achievementsToGrant.push('streak-3')
      newPoints += 75
    }
    
    if (newStreak === 7 && !achievementIds.includes('streak-7')) {
      achievementsToGrant.push('streak-7')
      newPoints += 150
    }
    
    if (newStreak === 30 && !achievementIds.includes('streak-30')) {
      achievementsToGrant.push('streak-30')
      newPoints += 500
    }
    
    // Grant new achievements
    if (achievementsToGrant.length > 0) {
      const achievementRecords = achievementsToGrant.map(aid => ({
        user_id: userId,
        achievement_id: aid
      }))
      
      await supabase
        .from('user_achievements')
        .insert(achievementRecords)
      
      // Update points
      await supabase
        .from('user_progress')
        .update({ points: newPoints })
        .eq('user_id', userId)
      
      // Get achievement details
      const { data: achievementDetails } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementsToGrant)
      
      newAchievements.push(...(achievementDetails || []))
    }
    
    // Get updated progress
    const { data: finalProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    const transformedProgress = {
      userId: finalProgress.user_id,
      totalArticlesRead: finalProgress.total_articles_read,
      points: finalProgress.points,
      currentStreak: finalProgress.current_streak,
      longestStreak: finalProgress.longest_streak,
      lastReadDate: finalProgress.last_read_date,
      achievements: achievementIds.concat(achievementsToGrant),
      readArticles: []
    }
    
    return c.json({ progress: transformedProgress, newAchievements })
  } catch (error) {
    console.log('Error updating user progress:', error)
    return c.json({ error: 'Failed to update user progress', details: error.message }, 500)
  }
})

// Get leaderboard
app.get('/make-server-053bcd80/leaderboard', async (c) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        points,
        current_streak,
        total_articles_read
      `)
      .order('points', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('Error fetching leaderboard:', error)
      return c.json({ error: 'Failed to fetch leaderboard', details: error.message }, 500)
    }
    
    // Transform to camelCase
    const transformedLeaderboard = (leaderboard || []).map(entry => ({
      userId: entry.user_id,
      points: entry.points,
      currentStreak: entry.current_streak,
      totalArticlesRead: entry.total_articles_read
    }))
    
    return c.json({ leaderboard: transformedLeaderboard })
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
    
    // Create profile
    await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        email: email,
        name: name || 'Reader'
      }])
    
    console.log('User created:', data.user.id)
    
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

// ===== LINKEDIN POST PARSER =====

// Upload external image URL to Supabase storage
async function uploadExternalImage(imageUrl: string, index: number): Promise<string | null> {
  try {
    console.log('Attempting to download image from:', imageUrl)
    
    // LinkedIn images are heavily protected and usually can't be downloaded server-side
    if (imageUrl.includes('linkedin.com') || imageUrl.includes('licdn.com')) {
      console.log('Skipping LinkedIn CDN image (protected by authentication):', imageUrl)
      return null
    }
    
    // Download the image with proper headers to avoid 403
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': imageUrl,
      }
    })
    
    if (!imageResponse.ok) {
      console.log('Failed to download image:', imageResponse.status, imageResponse.statusText)
      return null
    }
    
    const imageBlob = await imageResponse.blob()
    
    // Check if blob is valid
    if (imageBlob.size === 0) {
      console.log('Downloaded image is empty')
      return null
    }
    
    const arrayBuffer = await imageBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Generate unique filename
    const fileExtension = imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') ? 'jpg' : 'png'
    const fileName = `external-${crypto.randomUUID()}-${index}.${fileExtension}`
    const bucketName = 'make-053bcd80-magazine-media'
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: imageBlob.type || 'image/jpeg'
      })
    
    if (error) {
      console.log('Failed to upload image to storage:', error)
      return null
    }
    
    // Generate signed URL (valid for 10 years)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 315360000)
    
    console.log('Image uploaded successfully:', signedUrlData?.signedUrl)
    return signedUrlData?.signedUrl || null
  } catch (error) {
    console.log('Error uploading external image:', error)
    return null
  }
}

// Parse LinkedIn post and extract content
app.post('/make-server-053bcd80/parse-linkedin', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'LinkedIn URL is required' }, 400)
    }

    console.log('Parsing LinkedIn post:', url)

    // Validate it's a LinkedIn URL
    if (!url.includes('linkedin.com')) {
      return c.json({ error: 'Invalid LinkedIn URL' }, 400)
    }

    // Check if it's a post URL (various formats supported)
    const isPostUrl = url.includes('/posts/') || 
                      url.includes('/feed/update/') || 
                      url.includes('activity-') ||
                      url.includes('urn:li:activity:')
    
    if (!isPostUrl) {
      return c.json({ 
        error: 'Please provide a LinkedIn post URL (not a profile or company page)',
        title: '',
        content: 'Please copy the post content from LinkedIn and paste it here.',
        hashtags: []
      }, 200)
    }

    // Fetch the LinkedIn post content
    // Note: LinkedIn requires authentication and has strict scraping policies
    // This is a basic implementation that attempts to fetch public post data
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch LinkedIn post:', response.status)
        return c.json({ 
          error: 'Could not fetch LinkedIn post. The post may be private or require authentication.',
          title: '',
          content: 'Please manually copy and paste the content from the LinkedIn post.',
          hashtags: []
        }, 200) // Return 200 with empty data so user can manually enter
      }

      const html = await response.text()

      // Parse the HTML to extract content
      // This is a simplified parser - LinkedIn's HTML structure may change
      let title = ''
      let content = ''
      let author = ''
      let authorImage = ''
      let authorTitle = ''
      let publishDate = ''
      const hashtags: string[] = []
      const images: string[] = []

      // STEP 1: Extract author username from URL
      // URL format: /posts/username_text-activity-id or /posts/username/activity-id
      const usernameMatch = url.match(/\/posts\/([a-zA-Z0-9-]+)(?:_|\/)/)
      const authorUsername = usernameMatch ? usernameMatch[1] : null
      
      console.log('Extracted author username from URL:', authorUsername)

      // STEP 2: Extract post text (LinkedIn uses various meta tags)
      const descriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      if (descriptionMatch) {
        content = descriptionMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // STEP 3: Extract title (if available)
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .trim()
        console.log('Raw og:title content:', titleMatch[1])
        console.log('Cleaned og:title:', title)
      }
      
      // STEP 4: Extract author name from title (usually in format "Name on LinkedIn: Post content")
      if (titleMatch) {
        const authorNameMatch = titleMatch[1].match(/^([^:]+?)\s+(?:on LinkedIn|posted on|LinkedIn)/i)
        if (authorNameMatch) {
          author = authorNameMatch[1].trim()
          console.log('Extracted author from title:', author)
        }
      }
      
      // Alternative: Extract author from page title tag
      if (!author) {
        const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i)
        if (pageTitleMatch) {
          const pageTitleAuthor = pageTitleMatch[1].match(/^([^:]+?)\s+(?:on LinkedIn|posted on)/i)
          if (pageTitleAuthor) {
            author = pageTitleAuthor[1].trim()
            console.log('Extracted author from page title:', author)
          }
        }
      }
      
      // Try to extract author from other meta tags
      if (!author) {
        const authorMatch = html.match(/<meta\s+(?:property="article:author"|name="author")\s+content="([^"]+)"/i)
        if (authorMatch) {
          author = authorMatch[1].trim()
          console.log('Extracted author from meta tag:', author)
        }
      }
      
      // STEP 4.5: Extract author headline from page title
      // LinkedIn page titles often contain: "Name - Headline on LinkedIn: Post"
      let authorHeadlineFromTitle = ''
      if (titleMatch) {
        // Pattern: "Name - Headline on LinkedIn: Post"
        const nameHeadlineMatch = titleMatch[1].match(/^(.+?)\s*-\s*(.+?)\s+(?:on LinkedIn|posted on):/i)
        if (nameHeadlineMatch) {
          const extractedName = nameHeadlineMatch[1].trim()
          authorHeadlineFromTitle = nameHeadlineMatch[2].trim()
          
          // Update author if not already set
          if (!author) {
            author = extractedName
          }
          
          console.log('Extracted author headline from og:title - Name:', extractedName, 'Headline:', authorHeadlineFromTitle)
        }
      }
      
      // Also try from <title> tag
      if (!authorHeadlineFromTitle) {
        const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i)
        if (pageTitleMatch) {
          console.log('Full <title> tag content:', pageTitleMatch[1])
          
          const nameHeadlineMatch = pageTitleMatch[1].match(/^(.+?)\s*-\s*(.+?)\s+(?:on LinkedIn|posted)/i)
          if (nameHeadlineMatch) {
            const extractedName = nameHeadlineMatch[1].trim()
            authorHeadlineFromTitle = nameHeadlineMatch[2].trim()
            
            // Update author if not already set
            if (!author) {
              author = extractedName
            }
            
            console.log('Extracted author headline from <title> - Name:', extractedName, 'Headline:', authorHeadlineFromTitle)
          }
        }
      }
      
      // Third attempt: Try simpler pattern without "on LinkedIn"
      // Sometimes the title is: "Name - Headline: Post content"
      if (!authorHeadlineFromTitle && titleMatch) {
        const simpleMatch = titleMatch[1].match(/^(.+?)\s*-\s*(.+?):/i)
        if (simpleMatch) {
          const extractedName = simpleMatch[1].trim()
          const potentialHeadline = simpleMatch[2].trim()
          
          // Make sure it's not the post content by checking length and keywords
          if (potentialHeadline.length < 150 && (
            potentialHeadline.includes('@') || 
            potentialHeadline.includes('|') ||
            potentialHeadline.match(/\b(Founder|CEO|Director|Manager|Engineer|Designer|Developer|at|@)\b/i)
          )) {
            authorHeadlineFromTitle = potentialHeadline
            if (!author) {
              author = extractedName
            }
            console.log('Extracted author headline (simple pattern) - Name:', extractedName, 'Headline:', authorHeadlineFromTitle)
          }
        }
      }
      
      // STEP 5: Extract author headline/title from JSON-LD structured data
      const structuredDataMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is)
      if (structuredDataMatch) {
        try {
          const jsonData = JSON.parse(structuredDataMatch[1])
          
          // LinkedIn often uses nested author objects
          if (jsonData.author) {
            if (jsonData.author.name && !author) {
              author = jsonData.author.name
              console.log('Extracted author from JSON-LD:', author)
            }
            if (jsonData.author.jobTitle) {
              authorTitle = jsonData.author.jobTitle
              console.log('Extracted author title from JSON-LD:', authorTitle)
            }
            if (jsonData.author.image) {
              authorImage = typeof jsonData.author.image === 'string' 
                ? jsonData.author.image 
                : jsonData.author.image.url || jsonData.author.image.contentUrl
              console.log('Extracted author image from JSON-LD:', authorImage)
            }
          }
        } catch (e) {
          console.log('Failed to parse JSON-LD:', e)
        }
      }
      
      // STEP 6: Extract author profile image from meta tags
      if (!authorImage) {
        const authorImageMatch = html.match(/<meta\s+property="profile:image"\s+content="([^"]+)"/i)
        if (authorImageMatch) {
          authorImage = authorImageMatch[1]
          console.log('Extracted author image from profile:image meta:', authorImage)
        }
      }
      
      // Alternative: look for author image in various meta patterns
      if (!authorImage) {
        const imageMetaMatch = html.match(/"author"\s*:\s*{[^}]*"image"\s*:\s*"([^"]+)"/i)
        if (imageMetaMatch) {
          authorImage = imageMetaMatch[1]
          console.log('Extracted author image from author object:', authorImage)
        }
      }
      
      // Decode HTML entities in author image URL
      if (authorImage) {
        const decodeHtmlEntities = (text: string): string => {
          return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
        }
        authorImage = decodeHtmlEntities(authorImage)
        console.log('Decoded author image URL:', authorImage)
      }
      
      // STEP 7: Try to extract author headline from various locations
      if (!authorTitle) {
        // Look for headline in meta tags
        const headlineMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:profile:)?headline["'][^>]*content=["']([^"']+)["']/i)
        if (headlineMatch) {
          authorTitle = headlineMatch[1].trim()
          console.log('Extracted author title from headline meta:', authorTitle)
        }
      }
      
      // Try to parse author title from structured data in the page
      if (!authorTitle) {
        const titleInTextMatch = html.match(/class=["'][^"']*headline[^"']*["'][^>]*>([^<]+)</i)
        if (titleInTextMatch) {
          authorTitle = titleInTextMatch[1].trim()
          console.log('Extracted author title from headline class:', authorTitle)
        }
      }
      
      // Try to extract from description meta tag (sometimes contains "Name - Title")
      if (!authorTitle && titleMatch) {
        const titleWithHeadlineMatch = titleMatch[1].match(/^[^-]+-\s*(.+?)\s*:/i)
        if (titleWithHeadlineMatch) {
          authorTitle = titleWithHeadlineMatch[1].trim()
          console.log('Extracted author title from title meta:', authorTitle)
        }
      }
      
      // Look for author headline in multiple JSON-LD scripts
      if (!authorTitle) {
        const allScriptMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>.*?<\/script>/gis)
        if (allScriptMatches) {
          for (const scriptMatch of allScriptMatches) {
            try {
              const scriptContent = scriptMatch.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is)
              if (scriptContent) {
                const jsonData = JSON.parse(scriptContent[1])
                
                // Check various paths where headline might be stored
                if (jsonData.author?.jobTitle) {
                  authorTitle = jsonData.author.jobTitle
                  console.log('Extracted author title from JSON-LD author.jobTitle:', authorTitle)
                  break
                }
                if (jsonData.author?.headline) {
                  authorTitle = jsonData.author.headline
                  console.log('Extracted author title from JSON-LD author.headline:', authorTitle)
                  break
                }
                if (jsonData.headline) {
                  authorTitle = jsonData.headline
                  console.log('Extracted author title from JSON-LD headline:', authorTitle)
                  break
                }
              }
            } catch (e) {
              // Continue to next script
            }
          }
        }
      }
      
      // Look for headline in data attributes
      if (!authorTitle) {
        const dataHeadlineMatch = html.match(/data-headline=["']([^"']+)["']/i)
        if (dataHeadlineMatch) {
          authorTitle = dataHeadlineMatch[1]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .trim()
          console.log('Extracted author title from data-headline:', authorTitle)
        }
      }
      
      // Look for headline in aria-label or title attributes
      if (!authorTitle) {
        const ariaLabelMatch = html.match(/aria-label=["'][^"']*,\s*([^,"']+(?:@|at)[^"']+)["']/i)
        if (ariaLabelMatch) {
          authorTitle = ariaLabelMatch[1].trim()
          console.log('Extracted author title from aria-label:', authorTitle)
        }
      }
      
      // Try to find headline in nested span/div elements near author name
      if (!authorTitle && author) {
        const escapedAuthor = author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const contextMatch = html.match(new RegExp(`>${escapedAuthor}<.*?<[^>]*>([^<]+(?:@|at|\\||Founder|CEO|Director|Manager|Engineer|Designer)[^<]{10,150})<`, 'is'))
        if (contextMatch) {
          const potentialTitle = contextMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()
          if (potentialTitle.length < 200 && potentialTitle.length > 5) {
            authorTitle = potentialTitle
            console.log('Extracted author title from context near name:', authorTitle)
          }
        }
      }
      
      // STEP 7.5: Use headline extracted from page title as fallback
      if (!authorTitle && authorHeadlineFromTitle) {
        authorTitle = authorHeadlineFromTitle
        console.log('Using author headline from page title as fallback:', authorTitle)
      }
      
      // STEP 8: If we have username but no author name, format username nicely
      if (!author && authorUsername) {
        // Convert username to display name (capitalize, remove hyphens)
        author = authorUsername
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        console.log('Generated author name from username:', author)
      }
      
      // STEP 9: Construct profile image URL from username if not found
      if (!authorImage && authorUsername) {
        // LinkedIn profile images can sometimes be accessed via public profile
        // Format: https://www.linkedin.com/in/USERNAME/
        // But we can't directly get the image without being logged in
        // Instead, we'll leave it empty and let the user see the fallback
        console.log('Author image not found - will use fallback')
      }
      
      // STEP 10: Extract publish date
      const dateMatch = html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i)
      if (dateMatch) {
        publishDate = dateMatch[1]
        console.log('Extracted publish date:', publishDate)
      }
      
      // Try to extract from time tag
      if (!publishDate) {
        const timeMatch = html.match(/<time[^>]+datetime="([^"]+)"/i)
        if (timeMatch) {
          publishDate = timeMatch[1]
          console.log('Extracted publish date from time tag:', publishDate)
        }
      }
      
      // Try to extract from modified_time meta tag
      if (!publishDate) {
        const modifiedMatch = html.match(/<meta\s+property="article:modified_time"\s+content="([^"]+)"/i)
        if (modifiedMatch) {
          publishDate = modifiedMatch[1]
          console.log('Extracted publish date from modified_time:', publishDate)
        }
      }
      
      // Try to extract from datePublished in JSON-LD
      if (!publishDate) {
        const allScriptMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>.*?<\/script>/gis)
        if (allScriptMatches) {
          for (const scriptMatch of allScriptMatches) {
            try {
              const scriptContent = scriptMatch.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is)
              if (scriptContent) {
                const jsonData = JSON.parse(scriptContent[1])
                
                if (jsonData.datePublished) {
                  publishDate = jsonData.datePublished
                  console.log('Extracted publish date from JSON-LD datePublished:', publishDate)
                  break
                }
                if (jsonData.dateCreated) {
                  publishDate = jsonData.dateCreated
                  console.log('Extracted publish date from JSON-LD dateCreated:', publishDate)
                  break
                }
              }
            } catch (e) {
              // Continue to next script
            }
          }
        }
      }
      
      // Try to extract from data-date attributes
      if (!publishDate) {
        const dataDateMatch = html.match(/data-(?:date|time|published)=["']([^"']+)["']/i)
        if (dataDateMatch) {
          publishDate = dataDateMatch[1]
          console.log('Extracted publish date from data attribute:', publishDate)
        }
      }
      
      // Extract activity ID from URL and convert to approximate date
      // LinkedIn activity IDs contain timestamp information
      if (!publishDate) {
        const activityMatch = url.match(/activity-(\d+)/)
        if (activityMatch) {
          const activityId = activityMatch[1]
          // LinkedIn activity IDs are approximately milliseconds since epoch
          // But this is just a fallback approximation
          try {
            // The activity ID format changed over time, but we can try to extract
            // a rough timestamp from the first 13 digits
            if (activityId.length >= 13) {
              const timestamp = parseInt(activityId.substring(0, 13))
              if (!isNaN(timestamp) && timestamp > 1000000000000) {
                publishDate = new Date(timestamp).toISOString()
                console.log('Extracted approximate publish date from activity ID:', publishDate)
              }
            }
          } catch (e) {
            console.log('Could not parse activity ID for date')
          }
        }
      }
      
      // Log final extraction results
      console.log('=== EXTRACTION SUMMARY ===')
      console.log('Author:', author || 'NOT FOUND')
      console.log('Author Title:', authorTitle || 'NOT FOUND')
      console.log('Author Image:', authorImage || 'NOT FOUND')
      console.log('Publish Date:', publishDate || 'NOT FOUND')
      console.log('==========================')
      
      // Extract image
      const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      if (imageMatch) {
        images.push(imageMatch[1])
      }

      // Try to extract additional images from various meta tags
      const imageMatches = html.match(/<meta\s+property="og:image(?::secure_url)?"\s+content="([^"]+)"/gi)
      if (imageMatches && imageMatches.length > 1) {
        imageMatches.forEach(match => {
          const urlMatch = match.match(/content="([^"]+)"/)
          if (urlMatch && !images.includes(urlMatch[1])) {
            images.push(urlMatch[1])
          }
        })
      }

      // Also try to find images in the page content
      const contentImageMatches = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi)
      if (contentImageMatches) {
        contentImageMatches.slice(0, 3).forEach(match => {
          const urlMatch = match.match(/src="([^"]+)"/)
          if (urlMatch && urlMatch[1].includes('media') && !images.includes(urlMatch[1])) {
            images.push(urlMatch[1])
          }
        })
      }
      
      // Decode HTML entities in all image URLs
      const decodeHtmlEntities = (text: string): string => {
        return text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
      }
      
      // Decode all image URLs
      const decodedImages = images.map(url => decodeHtmlEntities(url))
      console.log('Decoded image URLs:', decodedImages)

      // Extract hashtags from content
      const hashtagMatches = content.match(/#[\w]+/g)
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches.map(tag => tag.substring(1)))
      }

      // Generate a title from content if not found
      if (!title && content) {
        // LinkedIn posts don't have titles, so create a meaningful one
        // Strategy: Use first meaningful sentence/phrase, but make it engaging
        
        // Remove hashtags from end for cleaner title extraction
        const contentWithoutHashtags = content.replace(/(#\w+\s*)+$/g, '').trim()
        
        // Split by sentences
        const sentences = contentWithoutHashtags.split(/[.!?]+/).filter(s => s.trim().length > 10)
        
        if (sentences.length > 0) {
          // Use the first substantial sentence
          let firstSentence = sentences[0].trim()
          
          // If it's too long, truncate at a word boundary
          if (firstSentence.length > 80) {
            const words = firstSentence.split(' ')
            let truncated = ''
            for (const word of words) {
              if ((truncated + word).length > 75) {
                break
              }
              truncated += (truncated ? ' ' : '') + word
            }
            title = truncated + '...'
          } else if (firstSentence.length > 15) {
            title = firstSentence
          } else {
            // First sentence too short, try combining with second
            if (sentences.length > 1) {
              const combined = `${sentences[0].trim()}. ${sentences[1].trim()}`
              if (combined.length <= 80) {
                title = combined
              } else {
                title = firstSentence + '...'
              }
            } else {
              title = firstSentence
            }
          }
        } else {
          // No sentences found, use first 75 characters
          title = content.substring(0, 75).trim() + '...'
        }
        
        // Clean up any leftover formatting
        title = title
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        console.log('Generated title from content:', title)
      }

      // Clean up content - remove hashtags at the end if they're redundant
      const contentLines = content.split('\n')
      const lastLines = contentLines.slice(-3).join('\n')
      if (lastLines.match(/^(#[\w]+\s*)+$/)) {
        content = contentLines.slice(0, -3).join('\n').trim()
      }

      // Extract YouTube URLs from content (direct links)
      const youtubeUrls: string[] = []
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
      let youtubeMatch
      while ((youtubeMatch = youtubeRegex.exec(content)) !== null) {
        const videoId = youtubeMatch[1]
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`
        if (!youtubeUrls.includes(fullUrl)) {
          youtubeUrls.push(fullUrl)
          console.log('Found direct YouTube video in content:', fullUrl)
        }
      }

      // Extract and resolve LinkedIn shortened URLs (lnkd.in)
      const lnkdRegex = /https?:\/\/lnkd\.in\/[a-zA-Z0-9_-]+/g
      const lnkdMatches = content.match(lnkdRegex)
      
      if (lnkdMatches && lnkdMatches.length > 0) {
        console.log(`Found ${lnkdMatches.length} LinkedIn shortened URL(s), resolving...`)
        
        for (const shortUrl of lnkdMatches) {
          try {
            console.log('Resolving shortened URL:', shortUrl)
            
            // Follow the redirect to get the real URL
            const redirectResponse = await fetch(shortUrl, {
              method: 'HEAD',
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            })
            
            const finalUrl = redirectResponse.url
            console.log('Resolved to:', finalUrl)
            
            // Check if the resolved URL is a YouTube URL
            const youtubeMatch = finalUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
            
            if (youtubeMatch) {
              const videoId = youtubeMatch[1]
              const fullYouTubeUrl = `https://www.youtube.com/watch?v=${videoId}`
              
              if (!youtubeUrls.includes(fullYouTubeUrl)) {
                youtubeUrls.push(fullYouTubeUrl)
                console.log('✅ Found YouTube video from shortened link:', fullYouTubeUrl)
              }
            } else {
              console.log('Shortened link does not point to YouTube:', finalUrl)
            }
          } catch (error) {
            console.error('Error resolving shortened URL:', shortUrl, error)
          }
        }
      }

      // For LinkedIn images with public CDN URLs (e=2147483647), return them directly
      // Otherwise attempt to upload to Supabase storage
      const finalImages: string[] = []
      for (let i = 0; i < decodedImages.length; i++) {
        const imageUrl = decodedImages[i]
        
        // Check if it's a LinkedIn CDN URL with public expiry parameter
        if ((imageUrl.includes('licdn.com') || imageUrl.includes('linkedin.com')) && imageUrl.includes('e=2147483647')) {
          console.log('Using LinkedIn CDN URL directly (public URL):', imageUrl)
          finalImages.push(imageUrl)
        } else {
          // Try to upload non-LinkedIn images to our storage
          const uploadedUrl = await uploadExternalImage(imageUrl, i + 1)
          if (uploadedUrl) {
            finalImages.push(uploadedUrl)
          }
        }
      }

      console.log('Successfully parsed LinkedIn post')
      console.log('Title:', title)
      console.log('Content length:', content.length)
      console.log('Images found:', images.length)
      console.log('Original Image URLs:', JSON.stringify(images))
      console.log('Final Image URLs:', JSON.stringify(finalImages))
      console.log('YouTube URLs found:', youtubeUrls.length)
      console.log('YouTube URLs:', JSON.stringify(youtubeUrls))
      console.log('Hashtags:', hashtags)
      console.log('=== FINAL RESPONSE DATA ===')
      console.log('author:', author)
      console.log('authorTitle:', authorTitle)
      console.log('authorImage:', authorImage)
      console.log('publishDate:', publishDate)
      console.log('==========================')

      return c.json({
        title,
        content,
        author,
        authorImage,
        authorTitle,
        publishDate,
        images: finalImages,
        youtubeUrls,
        hashtags,
        date: new Date().toISOString()
      })
    } catch (fetchError: any) {
      console.error('Error fetching LinkedIn post:', fetchError)
      
      // Return a helpful error message with empty fields
      return c.json({
        error: 'Could not automatically fetch LinkedIn post content. Please manually copy the content.',
        title: '',
        content: 'Please copy the post content from LinkedIn and paste it here.',
        hashtags: []
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing LinkedIn post:', error)
    return c.json({ 
      error: 'Failed to parse LinkedIn post', 
      details: error.message 
    }, 500)
  }
})

// Instagram Parser Route
app.post('/make-server-053bcd80/parse-instagram', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400)
    }

    console.log('Parsing Instagram URL:', url)

    try {
      // Fetch the Instagram post page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      console.log('Instagram HTML fetched, length:', html.length)

      // Initialize data
      let author = ''
      let authorUsername = ''
      let authorImage = ''
      let caption = ''
      let location = ''
      let timestamp = ''
      let mediaUrl = ''
      let thumbnailUrl = ''
      let mediaType: 'image' | 'video' | 'carousel' = 'image'
      let hasAudio = false

      // Try to extract data from JSON-LD structured data
      const scriptMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis)
      if (scriptMatches) {
        for (const scriptMatch of scriptMatches) {
          try {
            const scriptContent = scriptMatch.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/is)
            if (scriptContent) {
              const jsonData = JSON.parse(scriptContent[1])
              console.log('Found JSON-LD data:', JSON.stringify(jsonData, null, 2))

              // Extract author info
              if (jsonData.author) {
                if (jsonData.author.name) {
                  author = jsonData.author.name
                  console.log('Extracted author:', author)
                }
                if (jsonData.author.alternateName) {
                  authorUsername = jsonData.author.alternateName.replace('@', '')
                  console.log('Extracted username:', authorUsername)
                }
                if (jsonData.author.image) {
                  authorImage = typeof jsonData.author.image === 'string' 
                    ? jsonData.author.image 
                    : jsonData.author.image.url
                  console.log('Extracted author image:', authorImage)
                }
              }

              // Extract caption/description
              if (jsonData.articleBody) {
                caption = jsonData.articleBody
                console.log('Extracted caption from articleBody')
              } else if (jsonData.description) {
                caption = jsonData.description
                console.log('Extracted caption from description')
              }

              // Extract media
              if (jsonData.video) {
                mediaType = 'video'
                if (Array.isArray(jsonData.video)) {
                  mediaUrl = jsonData.video[0]?.contentUrl || jsonData.video[0]?.url
                  thumbnailUrl = jsonData.video[0]?.thumbnailUrl
                } else {
                  mediaUrl = jsonData.video.contentUrl || jsonData.video.url
                  thumbnailUrl = jsonData.video.thumbnailUrl
                }
                console.log('Extracted video URL:', mediaUrl)
              } else if (jsonData.image) {
                mediaType = 'image'
                if (Array.isArray(jsonData.image)) {
                  mediaUrl = jsonData.image[0]?.url || jsonData.image[0]
                } else {
                  mediaUrl = typeof jsonData.image === 'string' ? jsonData.image : jsonData.image.url
                }
                console.log('Extracted image URL:', mediaUrl)
              }

              // Extract timestamp
              if (jsonData.uploadDate || jsonData.datePublished) {
                timestamp = jsonData.uploadDate || jsonData.datePublished
                console.log('Extracted timestamp:', timestamp)
              }

              // Extract location
              if (jsonData.contentLocation) {
                location = typeof jsonData.contentLocation === 'string' 
                  ? jsonData.contentLocation 
                  : jsonData.contentLocation.name
                console.log('Extracted location:', location)
              }
            }
          } catch (e) {
            console.log('Failed to parse JSON-LD:', e)
          }
        }
      }

      // Try alternative extraction from meta tags
      if (!author) {
        const authorMatch = html.match(/<meta[^>]*property="instapp:owner"[^>]*content="([^"]+)"/i) ||
                           html.match(/<meta[^>]*property="al:ios:url"[^>]*content="instagram:\/\/user\?username=([^"]+)"/i)
        if (authorMatch) {
          authorUsername = authorMatch[1]
          console.log('Extracted username from meta:', authorUsername)
        }
      }

      // Extract from og:description (sometimes contains username)
      if (!caption) {
        const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)
        if (descMatch) {
          caption = descMatch[1]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .trim()
          console.log('Extracted caption from og:description')
        }
      }

      // Extract media from og:image and og:video
      if (!mediaUrl) {
        const videoMatch = html.match(/<meta[^>]*property="og:video"[^>]*content="([^"]+)"/i)
        if (videoMatch) {
          mediaUrl = videoMatch[1]
          mediaType = 'video'
          console.log('Extracted video from og:video:', mediaUrl)
        }
      }

      if (!mediaUrl) {
        const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
        if (imageMatch) {
          mediaUrl = imageMatch[1]
          thumbnailUrl = mediaUrl
          console.log('Extracted image from og:image:', mediaUrl)
        }
      }

      // Check if it's a Reel (video)
      if (url.includes('/reel/')) {
        mediaType = 'video'
        hasAudio = true // Reels typically have audio
        console.log('Detected as Reel (video with audio)')
      }

      // Extract shortcode from URL for fallback
      const shortcodeMatch = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
      const shortcode = shortcodeMatch ? shortcodeMatch[2] : ''
      console.log('Extracted shortcode:', shortcode)

      console.log('=== FINAL INSTAGRAM DATA ===')
      console.log('author:', author)
      console.log('authorUsername:', authorUsername)
      console.log('authorImage:', authorImage)
      console.log('caption:', caption?.substring(0, 100))
      console.log('location:', location)
      console.log('timestamp:', timestamp)
      console.log('mediaUrl:', mediaUrl)
      console.log('mediaType:', mediaType)
      console.log('hasAudio:', hasAudio)
      console.log('===========================')

      // Generate title from caption or use default
      let title = ''
      if (caption) {
        const sentences = caption.split(/[.!?]+/).filter(s => s.trim().length > 10)
        if (sentences.length > 0) {
          title = sentences[0].trim().substring(0, 100)
        } else {
          title = caption.substring(0, 100).trim()
        }
      } else {
        title = `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`
      }

      // Use caption as content
      const content = caption || 'Instagram content (login required to view full content)'

      return c.json({
        title,
        content,
        author,
        authorUsername,
        authorImage,
        publishDate: timestamp,
        location,
        images: mediaType === 'image' ? [mediaUrl].filter(Boolean) : [],
        mediaUrl: mediaUrl || thumbnailUrl,
        mediaType,
        hashtags: [],
        youtubeUrls: []
      })
    } catch (fetchError: any) {
      console.error('Error fetching Instagram post:', fetchError)
      
      return c.json({
        error: 'Could not automatically fetch Instagram post. Instagram requires authentication for most content.',
        title: 'Instagram Post',
        content: 'Instagram has strict content protection. You can manually copy the caption and paste it here, then add the image/video URL in Media Attachments.\n\nTip: Right-click on Instagram posts to copy text, or use Instagram\'s "Share" → "Copy Link" feature.',
        author: '',
        authorUsername: '',
        authorImage: '',
        images: [],
        hashtags: [],
        youtubeUrls: []
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing Instagram post:', error)
    return c.json({ 
      error: 'Failed to parse Instagram post', 
      details: error.message 
    }, 500)
  }
})

// Medium Parser Route
app.post('/make-server-053bcd80/parse-medium', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'Medium URL is required' }, 400)
    }

    console.log('Parsing Medium post:', url)

    // Validate it's a Medium URL
    if (!url.includes('medium.com')) {
      return c.json({ error: 'Invalid Medium URL' }, 400)
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch Medium post:', response.status)
        return c.json({ 
          error: 'Could not fetch Medium post. The post may be behind a paywall or require authentication.',
          title: '',
          content: 'Please manually copy and paste the content from the Medium post.',
        }, 200)
      }

      const html = await response.text()

      let title = ''
      let content = ''
      let author = ''
      let authorImage = ''
      let authorUsername = ''
      let publishDate = ''
      const images: string[] = []

      // Extract title
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // Extract description/excerpt as content
      const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      if (descMatch) {
        content = descMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // Try to extract full content from article body
      const articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/is)
      if (articleMatch) {
        const articleText = articleMatch[1]
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
        
        if (articleText.length > content.length) {
          content = articleText
        }
      }

      // Extract author from meta tag
      const authorMatch = html.match(/<meta\s+(?:property="article:author"|name="author")\s+content="([^"]+)"/i)
      if (authorMatch) {
        author = authorMatch[1].trim()
      }

      // Extract author from URL pattern (medium.com/@username/...)
      const usernameMatch = url.match(/\/@([a-zA-Z0-9_-]+)\//)
      if (usernameMatch) {
        authorUsername = usernameMatch[1]
        if (!author) {
          author = authorUsername.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
      }

      // Extract author image
      const authorImgMatch = html.match(/<meta\s+property="article:author:image"\s+content="([^"]+)"/i)
      if (authorImgMatch) {
        authorImage = authorImgMatch[1]
      }

      // Extract publish date
      const dateMatch = html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/i)
      if (dateMatch) {
        publishDate = dateMatch[1]
      }

      // Extract main image
      const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      if (imageMatch) {
        images.push(imageMatch[1])
      }

      console.log('Successfully parsed Medium post')
      console.log('Title:', title)
      console.log('Content length:', content.length)
      console.log('Author:', author)

      return c.json({
        title,
        content,
        author,
        authorImage,
        authorUsername,
        publishDate,
        images,
        hashtags: [],
        youtubeUrls: []
      })
    } catch (fetchError: any) {
      console.error('Error fetching Medium post:', fetchError)
      return c.json({
        error: 'Could not automatically fetch Medium post content. Please manually copy the content.',
        title: '',
        content: 'Please copy the post content from Medium and paste it here.',
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing Medium post:', error)
    return c.json({ 
      error: 'Failed to parse Medium post', 
      details: error.message 
    }, 500)
  }
})

// X/Twitter Parser Route
app.post('/make-server-053bcd80/parse-x', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'X/Twitter URL is required' }, 400)
    }

    console.log('Parsing X/Twitter post:', url)

    // Validate it's a Twitter/X URL
    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      return c.json({ error: 'Invalid X/Twitter URL' }, 400)
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch X/Twitter post:', response.status)
        return c.json({ 
          error: 'Could not fetch X/Twitter post. The post may be private or require authentication.',
          title: '',
          content: 'Please manually copy and paste the content from the post.',
        }, 200)
      }

      const html = await response.text()

      let title = ''
      let content = ''
      let author = ''
      let authorImage = ''
      let authorUsername = ''
      let publishDate = ''
      const images: string[] = []
      const hashtags: string[] = []

      // Extract content from description
      const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      if (descMatch) {
        content = descMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // Extract title
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
      if (titleMatch) {
        const fullTitle = titleMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
        
        // X titles are usually "Username on X: Tweet content"
        const authorMatch = fullTitle.match(/^([^:]+?)\s+on\s+(?:X|Twitter):/i)
        if (authorMatch) {
          author = authorMatch[1].trim()
        }
        
        title = fullTitle.split(':').slice(1).join(':').trim() || content.substring(0, 100)
      }

      // Extract author username from URL
      const usernameMatch = url.match(/\/([^\/]+)\/status\//)
      if (usernameMatch) {
        authorUsername = usernameMatch[1]
        if (!author) {
          author = authorUsername
        }
      }

      // Extract author image
      const authorImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      if (authorImgMatch) {
        authorImage = authorImgMatch[1]
      }

      // Extract images
      const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/gi)
      if (imageMatch) {
        imageMatch.forEach(match => {
          const urlMatch = match.match(/content="([^"]+)"/)
          if (urlMatch && !images.includes(urlMatch[1])) {
            images.push(urlMatch[1])
          }
        })
      }

      // Extract hashtags
      const hashtagMatches = content.match(/#[\w]+/g)
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches.map(tag => tag.substring(1)))
      }

      // Generate title from content if needed
      if (!title && content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        if (sentences.length > 0) {
          title = sentences[0].trim().substring(0, 100)
        } else {
          title = content.substring(0, 100).trim() + '...'
        }
      }

      console.log('Successfully parsed X/Twitter post')
      console.log('Title:', title)
      console.log('Content length:', content.length)
      console.log('Author:', author)

      return c.json({
        title,
        content,
        author,
        authorImage,
        authorUsername,
        publishDate,
        images,
        hashtags,
        youtubeUrls: []
      })
    } catch (fetchError: any) {
      console.error('Error fetching X/Twitter post:', fetchError)
      return c.json({
        error: 'Could not automatically fetch X/Twitter post content. Please manually copy the content.',
        title: '',
        content: 'Please copy the post content and paste it here.',
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing X/Twitter post:', error)
    return c.json({ 
      error: 'Failed to parse X/Twitter post', 
      details: error.message 
    }, 500)
  }
})

// TikTok Parser Route
app.post('/make-server-053bcd80/parse-tiktok', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'TikTok URL is required' }, 400)
    }

    console.log('Parsing TikTok post:', url)

    // Validate it's a TikTok URL
    if (!url.includes('tiktok.com')) {
      return c.json({ error: 'Invalid TikTok URL' }, 400)
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch TikTok post:', response.status)
        return c.json({ 
          error: 'Could not fetch TikTok post. The post may be private or require authentication.',
          title: '',
          content: 'Please manually copy and paste the content from the TikTok post.',
        }, 200)
      }

      const html = await response.text()

      let title = ''
      let content = ''
      let author = ''
      let authorImage = ''
      let authorUsername = ''
      let publishDate = ''
      const images: string[] = []
      const hashtags: string[] = []

      // Extract description/content
      const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      if (descMatch) {
        content = descMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // Extract title
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim()
      }

      // Extract author from URL pattern (@username/video/...)
      const usernameMatch = url.match(/\/@([a-zA-Z0-9._]+)\//)
      if (usernameMatch) {
        authorUsername = usernameMatch[1]
        author = authorUsername
      }

      // Extract author image
      const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      if (imageMatch) {
        images.push(imageMatch[1])
      }

      // Extract hashtags from content
      const hashtagMatches = content.match(/#[\w]+/g)
      if (hashtagMatches) {
        hashtags.push(...hashtagMatches.map(tag => tag.substring(1)))
      }

      // Generate title from content if needed
      if (!title && content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        if (sentences.length > 0) {
          title = sentences[0].trim().substring(0, 100)
        } else {
          title = content.substring(0, 100).trim() + '...'
        }
      }

      console.log('Successfully parsed TikTok post')
      console.log('Title:', title)
      console.log('Content length:', content.length)
      console.log('Author:', author)

      return c.json({
        title,
        content,
        author,
        authorImage,
        authorUsername,
        publishDate,
        images,
        hashtags,
        youtubeUrls: [],
        mediaUrl: images[0],
        mediaType: 'video'
      })
    } catch (fetchError: any) {
      console.error('Error fetching TikTok post:', fetchError)
      return c.json({
        error: 'Could not automatically fetch TikTok post content. Please manually copy the content.',
        title: '',
        content: 'Please copy the post content from TikTok and paste it here.',
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing TikTok post:', error)
    return c.json({ 
      error: 'Failed to parse TikTok post', 
      details: error.message 
    }, 500)
  }
})

// Reddit Parser Route
app.post('/make-server-053bcd80/parse-reddit', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: 'Reddit URL is required' }, 400)
    }

    console.log('Parsing Reddit post:', url)

    // Validate it's a Reddit URL
    if (!url.includes('reddit.com')) {
      return c.json({ error: 'Invalid Reddit URL' }, 400)
    }

    try {
      // Reddit has a JSON API - append .json to the URL
      const jsonUrl = url.replace(/\/$/, '') + '.json'
      
      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch Reddit post:', response.status)
        return c.json({ 
          error: 'Could not fetch Reddit post. The post may be private or deleted.',
          title: '',
          content: 'Please manually copy and paste the content from the Reddit post.',
        }, 200)
      }

      const data = await response.json()
      
      // Reddit JSON structure: data is array with [0] being the post
      const postData = data[0]?.data?.children?.[0]?.data
      
      if (!postData) {
        throw new Error('Could not parse Reddit post data')
      }

      const title = postData.title || ''
      const content = postData.selftext || postData.body || ''
      const author = postData.author || ''
      const authorUsername = postData.author || ''
      const publishDate = postData.created_utc ? new Date(postData.created_utc * 1000).toISOString() : ''
      const subreddit = postData.subreddit || ''
      const images: string[] = []

      // Extract image if it's an image post
      if (postData.url && (postData.url.includes('.jpg') || postData.url.includes('.png') || postData.url.includes('.gif'))) {
        images.push(postData.url)
      }

      // Check for preview images
      if (postData.preview?.images?.[0]?.source?.url) {
        const imgUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&')
        if (!images.includes(imgUrl)) {
          images.push(imgUrl)
        }
      }

      // Extract location (subreddit)
      const location = subreddit ? `r/${subreddit}` : ''

      console.log('Successfully parsed Reddit post')
      console.log('Title:', title)
      console.log('Content length:', content.length)
      console.log('Author:', author)
      console.log('Subreddit:', subreddit)

      return c.json({
        title,
        content,
        author,
        authorUsername,
        publishDate,
        location,
        images,
        hashtags: [],
        youtubeUrls: []
      })
    } catch (fetchError: any) {
      console.error('Error fetching Reddit post:', fetchError)
      return c.json({
        error: 'Could not automatically fetch Reddit post content. Please manually copy the content.',
        title: '',
        content: 'Please copy the post content from Reddit and paste it here.',
      }, 200)
    }
  } catch (error: any) {
    console.error('Error parsing Reddit post:', error)
    return c.json({ 
      error: 'Failed to parse Reddit post', 
      details: error.message 
    }, 500)
  }
})

Deno.serve(app.fetch)