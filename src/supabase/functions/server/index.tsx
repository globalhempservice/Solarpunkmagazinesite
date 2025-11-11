import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

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
    
    let query = supabase
      .from('articles')
      .select(`
        *,
        article_media (
          id,
          type,
          url,
          caption,
          position
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (category) {
      query = query.eq('category', category)
      console.log('Filtering by category:', category)
    }
    
    const { data: articles, error } = await query
    
    if (error) {
      console.log('SQL Error fetching articles:', error)
      return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
    }
    
    console.log('Fetched', articles?.length || 0, 'articles from SQL')
    
    // Transform snake_case to camelCase for compatibility with frontend
    const transformedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.cover_image,
      readingTime: article.reading_time,
      authorId: article.author_id,
      views: article.views,
      likes: article.likes,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: article.article_media || []
    })) || []
    
    return c.json({ articles: transformedArticles })
  } catch (error) {
    console.log('Error fetching articles:', error)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})

// Get single article by ID
app.get('/make-server-053bcd80/articles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        article_media (
          id,
          type,
          url,
          caption,
          position
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !article) {
      console.log('Article not found:', id, error)
      return c.json({ error: 'Article not found' }, 404)
    }
    
    // Transform to camelCase
    const transformedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.cover_image,
      readingTime: article.reading_time,
      authorId: article.author_id,
      views: article.views,
      likes: article.likes,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      media: article.article_media || []
    }
    
    return c.json({ article: transformedArticle })
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
    
    console.log('Creating article for user:', userId)
    console.log('Article data received:', JSON.stringify(body, null, 2))
    
    const { title, content, excerpt, category, coverImage, readingTime, media } = body
    
    if (!title || !content) {
      console.log('Validation failed: missing title or content')
      return c.json({ error: 'Title and content are required' }, 400)
    }
    
    // Insert article into SQL
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert([{
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category: category || 'general',
        cover_image: coverImage || '',
        reading_time: readingTime || 5,
        author_id: userId
      }])
      .select()
      .single()
    
    if (articleError) {
      console.log('SQL Error creating article:', articleError)
      return c.json({ error: 'Failed to create article', details: articleError.message }, 500)
    }
    
    console.log('Article created successfully:', article.id)
    
    // Insert media if provided
    if (media && Array.isArray(media) && media.length > 0) {
      console.log('Inserting', media.length, 'media items')
      const mediaRecords = media.map((m: any, index: number) => ({
        article_id: article.id,
        type: m.type,
        url: m.url,
        caption: m.caption || '',
        position: index
      }))
      
      const { error: mediaError } = await supabase
        .from('article_media')
        .insert(mediaRecords)
      
      if (mediaError) {
        console.log('Warning: Failed to insert media:', mediaError)
        // Don't fail the whole request, article is already created
      }
    }
    
    // Fetch the complete article with media
    const { data: completeArticle } = await supabase
      .from('articles')
      .select(`
        *,
        article_media (
          id,
          type,
          url,
          caption,
          position
        )
      `)
      .eq('id', article.id)
      .single()
    
    // Transform to camelCase
    const transformedArticle = {
      id: completeArticle.id,
      title: completeArticle.title,
      content: completeArticle.content,
      excerpt: completeArticle.excerpt,
      category: completeArticle.category,
      coverImage: completeArticle.cover_image,
      readingTime: completeArticle.reading_time,
      authorId: completeArticle.author_id,
      views: completeArticle.views,
      likes: completeArticle.likes,
      createdAt: completeArticle.created_at,
      updatedAt: completeArticle.updated_at,
      media: completeArticle.article_media || []
    }
    
    return c.json({ article: transformedArticle }, 201)
  } catch (error) {
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
    
    // Check if article exists and user is the author
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingArticle) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    if (existingArticle.author_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const { title, content, excerpt, category, coverImage, readingTime, media } = body
    
    // Update article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        content,
        excerpt,
        category,
        cover_image: coverImage,
        reading_time: readingTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.log('SQL Error updating article:', updateError)
      return c.json({ error: 'Failed to update article', details: updateError.message }, 500)
    }
    
    // Update media if provided
    if (media !== undefined) {
      // Delete existing media
      await supabase
        .from('article_media')
        .delete()
        .eq('article_id', id)
      
      // Insert new media
      if (Array.isArray(media) && media.length > 0) {
        const mediaRecords = media.map((m: any, index: number) => ({
          article_id: id,
          type: m.type,
          url: m.url,
          caption: m.caption || '',
          position: index
        }))
        
        await supabase
          .from('article_media')
          .insert(mediaRecords)
      }
    }
    
    // Fetch complete article with media
    const { data: completeArticle } = await supabase
      .from('articles')
      .select(`
        *,
        article_media (
          id,
          type,
          url,
          caption,
          position
        )
      `)
      .eq('id', id)
      .single()
    
    // Transform to camelCase
    const transformedArticle = {
      id: completeArticle.id,
      title: completeArticle.title,
      content: completeArticle.content,
      excerpt: completeArticle.excerpt,
      category: completeArticle.category,
      coverImage: completeArticle.cover_image,
      readingTime: completeArticle.reading_time,
      authorId: completeArticle.author_id,
      views: completeArticle.views,
      likes: completeArticle.likes,
      createdAt: completeArticle.created_at,
      updatedAt: completeArticle.updated_at,
      media: completeArticle.article_media || []
    }
    
    return c.json({ article: transformedArticle })
  } catch (error) {
    console.log('Error updating article:', error)
    return c.json({ error: 'Failed to update article', details: error.message }, 500)
  }
})

// Delete article
app.delete('/make-server-053bcd80/articles/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.get('userId')
    
    // Check ownership (RLS will handle this, but good to double-check)
    const { data: article } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single()
    
    if (article && article.author_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.log('SQL Error deleting article:', error)
      return c.json({ error: 'Failed to delete article', details: error.message }, 500)
    }
    
    console.log('Article deleted:', id)
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

Deno.serve(app.fetch)