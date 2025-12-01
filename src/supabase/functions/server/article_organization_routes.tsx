import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// ARTICLE-ORGANIZATION-AUTHORS ROUTES
// ============================================================================
// Handles:
// 1. Publishing articles under organizations
// 2. Managing multiple co-authors per article
// 3. Querying articles by organization
// ============================================================================

export function setupArticleOrganizationRoutes(app: any, requireAuth: any) {
  
  // ============================================================================
  // 1. Create article with organization and co-authors
  // ============================================================================
  app.post('/make-server-053bcd80/articles/with-organization', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      const body = await c.req.json()
      
      console.log('📝 Creating article with organization and co-authors')
      
      const {
        title,
        content,
        excerpt,
        category,
        coverImage,
        readingTime,
        media,
        source,
        sourceUrl,
        publishDate,
        organizationId, // NEW: Which org is publishing this
        coAuthors // NEW: Array of co-author objects
      } = body
      
      if (!title || !content) {
        return c.json({ error: 'Title and content are required' }, 400)
      }
      
      // If organizationId provided, verify user owns the organization
      if (organizationId) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', organizationId)
          .single()
        
        if (companyError || !company) {
          return c.json({ error: 'Organization not found' }, 404)
        }
        
        if (company.owner_id !== userId) {
          return c.json({ 
            error: 'Unauthorized - Only organization owners can publish articles under the organization' 
          }, 403)
        }
      }
      
      // Create article
      const articleId = crypto.randomUUID()
      const now = new Date().toISOString()
      
      const article = {
        id: articleId,
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category: category || 'general',
        cover_image: coverImage || '',
        reading_time: readingTime || 5,
        author_id: userId, // System user who created it
        organization_id: organizationId || null, // Organization publishing it
        views: 0,
        likes: 0,
        created_at: now,
        updated_at: now,
        media: media || [],
        source: source || null,
        source_url: sourceUrl || null,
        publish_date: publishDate || now
      }
      
      const { data: savedArticle, error: articleError } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single()
      
      if (articleError) {
        console.error('❌ Error creating article:', articleError)
        return c.json({ error: 'Failed to create article', details: articleError.message }, 500)
      }
      
      console.log('✅ Article created:', articleId)
      
      // Add co-authors if provided
      if (coAuthors && Array.isArray(coAuthors) && coAuthors.length > 0) {
        const authorInserts = coAuthors.map((author: any, index: number) => ({
          article_id: articleId,
          user_id: author.userId || null,
          author_name: author.name,
          author_title: author.title || null,
          author_image_url: author.imageUrl || null,
          author_bio: author.bio || null,
          author_email: author.email || null,
          author_order: author.order !== undefined ? author.order : index,
          role: author.role || 'co-author',
          added_by: userId
        }))
        
        const { error: authorsError } = await supabase
          .from('article_authors')
          .insert(authorInserts)
        
        if (authorsError) {
          console.error('⚠️  Warning: Failed to add co-authors:', authorsError)
          // Don't fail the whole request, just log the warning
        } else {
          console.log('✅ Added', coAuthors.length, 'co-authors')
        }
      }
      
      // Update user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (progress) {
        await supabase
          .from('user_progress')
          .update({
            articles_created: (progress.articles_created || 0) + 1,
            points: (progress.points || 0) + 50,
            updated_at: now
          })
          .eq('user_id', userId)
      }
      
      // Transform response
      const responseArticle = {
        id: savedArticle.id,
        title: savedArticle.title,
        content: savedArticle.content,
        excerpt: savedArticle.excerpt,
        category: savedArticle.category,
        coverImage: savedArticle.cover_image,
        readingTime: savedArticle.reading_time,
        authorId: savedArticle.author_id,
        organizationId: savedArticle.organization_id,
        views: savedArticle.views,
        likes: savedArticle.likes,
        createdAt: savedArticle.created_at,
        updatedAt: savedArticle.updated_at,
        media: savedArticle.media || [],
        source: savedArticle.source,
        sourceUrl: savedArticle.source_url,
        publishDate: savedArticle.publish_date
      }
      
      return c.json({ article: responseArticle }, 201)
    } catch (error: any) {
      console.error('❌ Error in article creation:', error)
      return c.json({ error: 'Failed to create article', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 2. Get articles by organization
  // ============================================================================
  app.get('/make-server-053bcd80/organizations/:orgId/articles', async (c: any) => {
    try {
      const orgId = c.req.param('orgId')
      
      console.log('📰 Fetching articles for organization:', orgId)
      
      // Query articles published by this organization
      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          *,
          article_authors (
            id,
            author_name,
            author_title,
            author_image_url,
            author_bio,
            author_order,
            role,
            user_id
          )
        `)
        .eq('organization_id', orgId)
        .order('publish_date', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching articles:', error)
        return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
      }
      
      console.log('✅ Found', articles?.length || 0, 'articles')
      
      // Transform to frontend format
      const transformedArticles = (articles || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        coverImage: article.cover_image,
        readingTime: article.reading_time,
        authorId: article.author_id,
        organizationId: article.organization_id,
        views: article.views || 0,
        likes: article.likes || 0,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        publishDate: article.publish_date,
        media: article.media || [],
        source: article.source,
        sourceUrl: article.source_url,
        coAuthors: (article.article_authors || [])
          .sort((a: any, b: any) => a.author_order - b.author_order)
          .map((author: any) => ({
            id: author.id,
            userId: author.user_id,
            name: author.author_name,
            title: author.author_title,
            imageUrl: author.author_image_url,
            bio: author.author_bio,
            order: author.author_order,
            role: author.role
          }))
      }))
      
      return c.json({ articles: transformedArticles })
    } catch (error: any) {
      console.error('❌ Error fetching organization articles:', error)
      return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 3. Add co-author to existing article
  // ============================================================================
  app.post('/make-server-053bcd80/articles/:articleId/authors', requireAuth, async (c: any) => {
    try {
      const articleId = c.req.param('articleId')
      const userId = c.get('userId')
      const body = await c.req.json()
      
      console.log('👥 Adding co-author to article:', articleId)
      
      const {
        userId: authorUserId,
        name,
        title,
        imageUrl,
        bio,
        email,
        order,
        role
      } = body
      
      if (!name) {
        return c.json({ error: 'Author name is required' }, 400)
      }
      
      // Verify user owns the article or its organization
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('author_id, organization_id')
        .eq('id', articleId)
        .single()
      
      if (articleError || !article) {
        return c.json({ error: 'Article not found' }, 404)
      }
      
      let authorized = article.author_id === userId
      
      // Check if user owns the organization
      if (!authorized && article.organization_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', article.organization_id)
          .single()
        
        authorized = company?.owner_id === userId
      }
      
      if (!authorized) {
        return c.json({ 
          error: 'Unauthorized - Only article creators or organization owners can add co-authors' 
        }, 403)
      }
      
      // Add the co-author
      const { data: newAuthor, error: insertError } = await supabase
        .from('article_authors')
        .insert({
          article_id: articleId,
          user_id: authorUserId || null,
          author_name: name,
          author_title: title || null,
          author_image_url: imageUrl || null,
          author_bio: bio || null,
          author_email: email || null,
          author_order: order !== undefined ? order : 0,
          role: role || 'co-author',
          added_by: userId
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Error adding co-author:', insertError)
        return c.json({ error: 'Failed to add co-author', details: insertError.message }, 500)
      }
      
      console.log('✅ Co-author added:', newAuthor.id)
      
      return c.json({ author: {
        id: newAuthor.id,
        userId: newAuthor.user_id,
        name: newAuthor.author_name,
        title: newAuthor.author_title,
        imageUrl: newAuthor.author_image_url,
        bio: newAuthor.author_bio,
        email: newAuthor.author_email,
        order: newAuthor.author_order,
        role: newAuthor.role
      }}, 201)
    } catch (error: any) {
      console.error('❌ Error adding co-author:', error)
      return c.json({ error: 'Failed to add co-author', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 4. Remove co-author from article
  // ============================================================================
  app.delete('/make-server-053bcd80/articles/:articleId/authors/:authorId', requireAuth, async (c: any) => {
    try {
      const articleId = c.req.param('articleId')
      const authorId = c.req.param('authorId')
      const userId = c.get('userId')
      
      console.log('🗑️  Removing co-author:', authorId, 'from article:', articleId)
      
      // Verify user owns the article or its organization
      const { data: article } = await supabase
        .from('articles')
        .select('author_id, organization_id')
        .eq('id', articleId)
        .single()
      
      if (!article) {
        return c.json({ error: 'Article not found' }, 404)
      }
      
      let authorized = article.author_id === userId
      
      if (!authorized && article.organization_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', article.organization_id)
          .single()
        
        authorized = company?.owner_id === userId
      }
      
      if (!authorized) {
        return c.json({ error: 'Unauthorized' }, 403)
      }
      
      // Remove the co-author
      const { error: deleteError } = await supabase
        .from('article_authors')
        .delete()
        .eq('id', authorId)
        .eq('article_id', articleId)
      
      if (deleteError) {
        console.error('❌ Error removing co-author:', deleteError)
        return c.json({ error: 'Failed to remove co-author', details: deleteError.message }, 500)
      }
      
      console.log('✅ Co-author removed')
      
      return c.json({ success: true, message: 'Co-author removed successfully' })
    } catch (error: any) {
      console.error('❌ Error removing co-author:', error)
      return c.json({ error: 'Failed to remove co-author', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 5. Update article's organization
  // ============================================================================
  app.put('/make-server-053bcd80/articles/:articleId/organization', requireAuth, async (c: any) => {
    try {
      const articleId = c.req.param('articleId')
      const userId = c.get('userId')
      const { organizationId } = await c.req.json()
      
      console.log('🏢 Updating article organization:', articleId)
      
      // Verify user owns the article
      const { data: article } = await supabase
        .from('articles')
        .select('author_id')
        .eq('id', articleId)
        .single()
      
      if (!article) {
        return c.json({ error: 'Article not found' }, 404)
      }
      
      if (article.author_id !== userId) {
        return c.json({ error: 'Unauthorized - Only article creator can change organization' }, 403)
      }
      
      // If organizationId provided, verify user owns it
      if (organizationId) {
        const { data: company } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', organizationId)
          .single()
        
        if (!company) {
          return c.json({ error: 'Organization not found' }, 404)
        }
        
        if (company.owner_id !== userId) {
          return c.json({ 
            error: 'Unauthorized - Only organization owners can publish articles under their organization' 
          }, 403)
        }
      }
      
      // Update the article
      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          organization_id: organizationId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
      
      if (updateError) {
        console.error('❌ Error updating article organization:', updateError)
        return c.json({ error: 'Failed to update article', details: updateError.message }, 500)
      }
      
      console.log('✅ Article organization updated')
      
      return c.json({ success: true, message: 'Article organization updated successfully' })
    } catch (error: any) {
      console.error('❌ Error updating article organization:', error)
      return c.json({ error: 'Failed to update article', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 6. Get user's organizations (for article creation dropdown)
  // ============================================================================
  app.get('/make-server-053bcd80/user/organizations', requireAuth, async (c: any) => {
    try {
      const userId = c.get('userId')
      
      console.log('🏢 Fetching user organizations for:', userId)
      
      const { data: organizations, error } = await supabase
        .from('companies')
        .select('id, name, logo_url, website')
        .eq('owner_id', userId)
        .order('name')
      
      if (error) {
        console.error('❌ Error fetching organizations:', error)
        return c.json({ error: 'Failed to fetch organizations', details: error.message }, 500)
      }
      
      console.log('✅ Found', organizations?.length || 0, 'organizations')
      
      const transformedOrgs = (organizations || []).map((org: any) => ({
        id: org.id,
        name: org.name,
        logoUrl: org.logo_url,
        website: org.website
      }))
      
      return c.json({ organizations: transformedOrgs })
    } catch (error: any) {
      console.error('❌ Error fetching user organizations:', error)
      return c.json({ error: 'Failed to fetch organizations', details: error.message }, 500)
    }
  })
  
  // ============================================================================
  // 7. Get article with full details (including co-authors)
  // ============================================================================
  app.get('/make-server-053bcd80/articles/:articleId/full', async (c: any) => {
    try {
      const articleId = c.req.param('articleId')
      
      console.log('📖 Fetching full article details:', articleId)
      
      const { data: article, error } = await supabase
        .from('articles')
        .select(`
          *,
          article_authors (
            id,
            author_name,
            author_title,
            author_image_url,
            author_bio,
            author_email,
            author_order,
            role,
            user_id
          )
        `)
        .eq('id', articleId)
        .single()
      
      if (error || !article) {
        console.error('❌ Article not found:', error)
        return c.json({ error: 'Article not found' }, 404)
      }
      
      // Get organization details if article is published by an org
      let organization = null
      if (article.organization_id) {
        const { data: org } = await supabase
          .from('companies')
          .select('id, name, logo_url, website')
          .eq('id', article.organization_id)
          .single()
        
        if (org) {
          organization = {
            id: org.id,
            name: org.name,
            logoUrl: org.logo_url,
            website: org.website
          }
        }
      }
      
      // Transform response
      const transformedArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        coverImage: article.cover_image,
        readingTime: article.reading_time,
        authorId: article.author_id,
        organizationId: article.organization_id,
        organization: organization,
        views: article.views || 0,
        likes: article.likes || 0,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        publishDate: article.publish_date,
        media: article.media || [],
        source: article.source,
        sourceUrl: article.source_url,
        coAuthors: (article.article_authors || [])
          .sort((a: any, b: any) => a.author_order - b.author_order)
          .map((author: any) => ({
            id: author.id,
            userId: author.user_id,
            name: author.author_name,
            title: author.author_title,
            imageUrl: author.author_image_url,
            bio: author.author_bio,
            email: author.author_email,
            order: author.author_order,
            role: author.role
          }))
      }
      
      return c.json({ article: transformedArticle })
    } catch (error: any) {
      console.error('❌ Error fetching full article:', error)
      return c.json({ error: 'Failed to fetch article', details: error.message }, 500)
    }
  })
  
  console.log('✅ Article-Organization-Authors routes setup complete')
}
