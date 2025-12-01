# 🏢 ORGANIZATION TABS - COMPLETE IMPLEMENTATION ROADMAP

**Goal:** Build out the 3 empty organization tabs (Publications, Members, Badges) to enable complete team collaboration and content management.

**Priority:** 🔥🔥🔥 IMMEDIATE - Tabs are visible but empty (bad UX)  
**Timeline:** 5-7 days  
**Date Started:** November 28, 2024

---

## 📊 CURRENT STATE

### ✅ What Already Exists
- ✅ Organization CRUD system (create, edit, delete)
- ✅ Organization dashboard with tab navigation
- ✅ 3D globe company directory
- ✅ Association badge system (different from org badges)
- ✅ Swag Shop tab (fully functional)
- ✅ Backend company routes (`/supabase/functions/server/company_routes.tsx`)

### 🔴 What's Empty (Needs Implementation)
1. **Publications Tab** - Shows placeholder message
2. **Members Tab** - Shows placeholder message  
3. **Badges Tab** - Shows placeholder message (org badges, not association badges)

### 📍 File Locations
- **Frontend:** `/components/CompanyManager.tsx` (lines 490-673)
- **Backend:** `/supabase/functions/server/company_routes.tsx`
- **Database:** Supabase PostgreSQL

---

## 🎯 IMPLEMENTATION STRATEGY

We'll implement these tabs in order of impact:

1. **Publications Tab** (Days 1-2) - Most requested, links content to orgs
2. **Members Tab** (Days 3-4) - Core collaboration feature
3. **Badges Tab** (Days 5-6) - Recognition & verification system
4. **Testing & Polish** (Day 7) - End-to-end testing

---

# 📋 PART 1: PUBLICATIONS TAB (Days 1-2)

## 🎯 Goal
Enable organizations to:
- Link existing articles to their organization
- Submit new articles as organization
- Display organization's published content
- Co-author with organization credit

---

## TOKEN 1.1: Database Schema for Organization Publications 🗄️
**Time:** 30 minutes  
**Priority:** 🔥 CRITICAL

### Tasks
- [ ] Create `organization_publications` table
- [ ] Create junction table for article-organization relationships
- [ ] Add RLS policies
- [ ] Create database indexes

### SQL Schema

```sql
-- Organization Publications Table
CREATE TABLE IF NOT EXISTS organization_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('author', 'co-author', 'sponsor', 'featured')),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(organization_id, article_id)
);

-- Indexes for performance
CREATE INDEX idx_org_publications_org_id ON organization_publications(organization_id);
CREATE INDEX idx_org_publications_article_id ON organization_publications(article_id);
CREATE INDEX idx_org_publications_approved ON organization_publications(is_approved);

-- RLS Policies
ALTER TABLE organization_publications ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved publications
CREATE POLICY "Anyone can view approved publications"
  ON organization_publications FOR SELECT
  USING (is_approved = true);

-- Organization members can view all publications
CREATE POLICY "Organization members can view all publications"
  ON organization_publications FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM companies 
      WHERE owner_id = auth.uid()
      -- Future: OR auth.uid() = ANY(members)
    )
  );

-- Organization owners can insert publications
CREATE POLICY "Organization owners can insert publications"
  ON organization_publications FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Organization owners can update/delete their publications
CREATE POLICY "Organization owners can update publications"
  ON organization_publications FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can delete publications"
  ON organization_publications FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Add organization_id to articles table (optional - for direct linking)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES companies(id);
CREATE INDEX IF NOT EXISTS idx_articles_organization ON articles(organization_id);
```

---

## TOKEN 1.2: Backend API Routes for Publications 🔌
**Time:** 1 hour  
**Priority:** 🔥 CRITICAL

### Tasks
- [ ] Create GET route to fetch organization's publications
- [ ] Create POST route to link article to organization
- [ ] Create DELETE route to unlink article
- [ ] Create PUT route to update publication metadata

### API Routes

```typescript
// In /supabase/functions/server/company_routes.tsx

// Get all publications for an organization
app.get('/make-server-053bcd80/companies/:companyId/publications', async (c) => {
  try {
    const companyId = c.req.param('companyId')
    console.log(`📰 Fetching publications for organization: ${companyId}`)
    
    const { data: publications, error } = await supabase
      .from('organization_publications')
      .select(`
        *,
        article:articles(
          id,
          title,
          content,
          author_id,
          created_at,
          published_at,
          featured_image_url,
          category,
          tags,
          reading_time_minutes,
          view_count
        )
      `)
      .eq('organization_id', companyId)
      .eq('is_approved', true)
      .order('display_order', { ascending: true })
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching publications:', error)
      return c.json({ error: 'Failed to fetch publications' }, 500)
    }
    
    console.log(`✅ Fetched ${publications.length} publications`)
    return c.json(publications)
  } catch (error: any) {
    console.error('❌ Error in publications route:', error)
    return c.json({ error: 'Failed to fetch publications', details: error.message }, 500)
  }
})

// Link an article to organization (requires auth + ownership)
app.post('/make-server-053bcd80/companies/:companyId/publications', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const { article_id, role = 'author', notes } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`📰 Linking article ${article_id} to organization ${companyId}`)
    
    // Verify user owns the organization
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      return c.json({ error: 'You do not own this organization' }, 403)
    }
    
    // Verify article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title')
      .eq('id', article_id)
      .single()
    
    if (articleError || !article) {
      return c.json({ error: 'Article not found' }, 404)
    }
    
    // Create the publication link
    const { data: publication, error } = await supabase
      .from('organization_publications')
      .insert({
        organization_id: companyId,
        article_id,
        role,
        notes,
        added_by: userId,
        is_approved: true, // Auto-approve for now
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return c.json({ error: 'Article is already linked to this organization' }, 400)
      }
      console.error('❌ Error linking article:', error)
      return c.json({ error: 'Failed to link article', details: error.message }, 500)
    }
    
    console.log(`✅ Article linked successfully`)
    return c.json(publication)
  } catch (error: any) {
    console.error('❌ Error in link article route:', error)
    return c.json({ error: 'Failed to link article', details: error.message }, 500)
  }
})

// Unlink article from organization
app.delete('/make-server-053bcd80/companies/:companyId/publications/:publicationId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const publicationId = c.req.param('publicationId')
    const userId = c.get('userId')
    
    console.log(`📰 Unlinking publication ${publicationId} from organization ${companyId}`)
    
    // Verify user owns the organization
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      return c.json({ error: 'Organization not found' }, 404)
    }
    
    if (company.owner_id !== userId) {
      return c.json({ error: 'You do not own this organization' }, 403)
    }
    
    // Delete the publication link
    const { error } = await supabase
      .from('organization_publications')
      .delete()
      .eq('id', publicationId)
      .eq('organization_id', companyId)
    
    if (error) {
      console.error('❌ Error unlinking article:', error)
      return c.json({ error: 'Failed to unlink article' }, 500)
    }
    
    console.log(`✅ Article unlinked successfully`)
    return c.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in unlink article route:', error)
    return c.json({ error: 'Failed to unlink article', details: error.message }, 500)
  }
})

// Update publication metadata (role, notes, display order)
app.put('/make-server-053bcd80/companies/:companyId/publications/:publicationId', requireAuth, async (c) => {
  try {
    const companyId = c.req.param('companyId')
    const publicationId = c.req.param('publicationId')
    const { role, notes, display_order } = await c.req.json()
    const userId = c.get('userId')
    
    console.log(`📰 Updating publication ${publicationId}`)
    
    // Verify ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company || company.owner_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    // Update publication
    const updateData: any = {}
    if (role) updateData.role = role
    if (notes !== undefined) updateData.notes = notes
    if (display_order !== undefined) updateData.display_order = display_order
    
    const { data: publication, error } = await supabase
      .from('organization_publications')
      .update(updateData)
      .eq('id', publicationId)
      .eq('organization_id', companyId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating publication:', error)
      return c.json({ error: 'Failed to update publication' }, 500)
    }
    
    console.log(`✅ Publication updated successfully`)
    return c.json(publication)
  } catch (error: any) {
    console.error('❌ Error in update publication route:', error)
    return c.json({ error: 'Failed to update publication', details: error.message }, 500)
  }
})

// Get user's articles (for linking dropdown)
app.get('/make-server-053bcd80/users/:userId/articles', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId')
    const requestingUserId = c.get('userId')
    
    // Users can only fetch their own articles
    if (userId !== requestingUserId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    console.log(`📰 Fetching articles for user: ${userId}`)
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, created_at, published_at, category, tags')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching user articles:', error)
      return c.json({ error: 'Failed to fetch articles' }, 500)
    }
    
    console.log(`✅ Fetched ${articles.length} articles`)
    return c.json(articles)
  } catch (error: any) {
    console.error('❌ Error in user articles route:', error)
    return c.json({ error: 'Failed to fetch articles', details: error.message }, 500)
  }
})
```

---

## TOKEN 1.3: Publications Tab Frontend Component 🎨
**Time:** 2-3 hours  
**Priority:** 🔥 HIGH

### Tasks
- [ ] Create `OrganizationPublicationsTab` component
- [ ] Display linked articles in a grid
- [ ] Add "Link Article" button with modal
- [ ] Article selection dropdown
- [ ] Role selector (Author, Co-author, Sponsor, Featured)
- [ ] Unlink article functionality
- [ ] Empty state UI

### Component Structure

```tsx
// NEW FILE: /components/OrganizationPublicationsTab.tsx

import { useState, useEffect } from 'react'
import { FileText, Plus, X, ExternalLink, Calendar, Eye, Tag } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Publication {
  id: string
  organization_id: string
  article_id: string
  role: 'author' | 'co-author' | 'sponsor' | 'featured'
  added_at: string
  notes: string | null
  article: {
    id: string
    title: string
    content: string
    created_at: string
    published_at: string | null
    featured_image_url: string | null
    category: string
    tags: string[]
    reading_time_minutes: number
    view_count: number
  }
}

interface UserArticle {
  id: string
  title: string
  created_at: string
  published_at: string | null
  category: string
  tags: string[]
}

interface OrganizationPublicationsTabProps {
  companyId: string
  userId: string
  accessToken: string
  serverUrl: string
}

export function OrganizationPublicationsTab({
  companyId,
  userId,
  accessToken,
  serverUrl
}: OrganizationPublicationsTabProps) {
  const [publications, setPublications] = useState<Publication[]>([])
  const [userArticles, setUserArticles] = useState<UserArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'author' | 'co-author' | 'sponsor' | 'featured'>('author')
  const [notes, setNotes] = useState('')
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    fetchPublications()
    fetchUserArticles()
  }, [companyId])

  const fetchPublications = async () => {
    try {
      const response = await fetch(`${serverUrl}/companies/${companyId}/publications`)
      if (response.ok) {
        const data = await response.json()
        setPublications(data)
      }
    } catch (error) {
      console.error('Error fetching publications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserArticles = async () => {
    try {
      const response = await fetch(`${serverUrl}/users/${userId}/articles`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserArticles(data)
      }
    } catch (error) {
      console.error('Error fetching user articles:', error)
    }
  }

  const handleLinkArticle = async () => {
    if (!selectedArticle) return
    
    setLinking(true)
    try {
      const response = await fetch(`${serverUrl}/companies/${companyId}/publications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article_id: selectedArticle,
          role: selectedRole,
          notes: notes || null
        })
      })

      if (response.ok) {
        await fetchPublications()
        setShowLinkModal(false)
        setSelectedArticle('')
        setNotes('')
        setSelectedRole('author')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to link article')
      }
    } catch (error) {
      console.error('Error linking article:', error)
      alert('Failed to link article')
    } finally {
      setLinking(false)
    }
  }

  const handleUnlinkArticle = async (publicationId: string) => {
    if (!confirm('Remove this article from your organization?')) return

    try {
      const response = await fetch(
        `${serverUrl}/companies/${companyId}/publications/${publicationId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )

      if (response.ok) {
        await fetchPublications()
      } else {
        alert('Failed to unlink article')
      }
    } catch (error) {
      console.error('Error unlinking article:', error)
      alert('Failed to unlink article')
    }
  }

  if (loading) {
    return (
      <div className=\"flex items-center justify-center py-12\">
        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400\"></div>
      </div>
    )
  }

  return (
    <div className=\"space-y-4\">
      {/* Header with Add Button */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h3 className=\"font-black text-lg text-white\">Publications</h3>
          <p className=\"text-sm text-emerald-200/60\">
            Articles published by or featuring this organization
          </p>
        </div>
        <Button
          onClick={() => setShowLinkModal(true)}
          className=\"gap-2 bg-emerald-500 hover:bg-emerald-600\"
        >
          <Plus className=\"w-4 h-4\" />
          Link Article
        </Button>
      </div>

      {/* Publications Grid */}
      {publications.length > 0 ? (
        <div className=\"grid gap-4 md:grid-cols-2\">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className=\"bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-400/40 transition-all\"
            >
              {/* Article Image */}
              {pub.article.featured_image_url && (
                <img
                  src={pub.article.featured_image_url}
                  alt={pub.article.title}
                  className=\"w-full h-32 object-cover rounded-lg mb-3\"
                />
              )}

              {/* Article Info */}
              <div className=\"space-y-2\">
                <div className=\"flex items-start justify-between gap-2\">
                  <h4 className=\"font-black text-white line-clamp-2\">
                    {pub.article.title}
                  </h4>
                  <button
                    onClick={() => handleUnlinkArticle(pub.id)}
                    className=\"text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10\"
                  >
                    <X className=\"w-4 h-4\" />
                  </button>
                </div>

                <div className=\"flex items-center gap-2 flex-wrap\">
                  <Badge className=\"bg-purple-500/20 border-purple-400/50 text-purple-300\">
                    {pub.role}
                  </Badge>
                  <Badge variant=\"outline\" className=\"text-emerald-300\">
                    {pub.article.category}
                  </Badge>
                </div>

                <div className=\"flex items-center gap-4 text-xs text-emerald-200/60\">
                  <div className=\"flex items-center gap-1\">
                    <Calendar className=\"w-3 h-3\" />
                    {new Date(pub.article.created_at).toLocaleDateString()}
                  </div>
                  <div className=\"flex items-center gap-1\">
                    <Eye className=\"w-3 h-3\" />
                    {pub.article.view_count} views
                  </div>
                </div>

                {pub.notes && (
                  <p className=\"text-xs text-emerald-200/70 italic\">
                    Note: {pub.notes}
                  </p>
                )}

                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  className=\"w-full gap-2 text-emerald-300 hover:bg-emerald-500/20\"
                  onClick={() => window.open(`/article/${pub.article.id}`, '_blank')}
                >
                  <ExternalLink className=\"w-3 h-3\" />
                  View Article
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className=\"text-center py-12 bg-emerald-900/20 rounded-2xl border-2 border-dashed border-emerald-500/20\">
          <FileText className=\"w-12 h-12 mx-auto mb-3 text-emerald-400/50\" />
          <h3 className=\"font-black mb-2 text-white\">No Publications Yet</h3>
          <p className=\"text-sm text-emerald-200/60 mb-4\">
            Link your articles to showcase your organization's content
          </p>
          <Button
            onClick={() => setShowLinkModal(true)}
            className=\"gap-2 bg-emerald-500 hover:bg-emerald-600\"
          >
            <Plus className=\"w-4 h-4\" />
            Link Your First Article
          </Button>
        </div>
      )}

      {/* Link Article Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className=\"bg-emerald-950 border-emerald-500/30 text-white\">
          <DialogHeader>
            <DialogTitle className=\"font-black text-xl\">Link Article to Organization</DialogTitle>
          </DialogHeader>

          <div className=\"space-y-4 mt-4\">
            {/* Article Selector */}
            <div>
              <label className=\"text-sm font-bold text-emerald-300 mb-2 block\">
                Select Article
              </label>
              <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                <SelectTrigger className=\"bg-emerald-900/30 border-emerald-500/30\">
                  <SelectValue placeholder=\"Choose an article...\" />
                </SelectTrigger>
                <SelectContent>
                  {userArticles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selector */}
            <div>
              <label className=\"text-sm font-bold text-emerald-300 mb-2 block\">
                Organization Role
              </label>
              <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                <SelectTrigger className=\"bg-emerald-900/30 border-emerald-500/30\">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"author\">Author</SelectItem>
                  <SelectItem value=\"co-author\">Co-Author</SelectItem>
                  <SelectItem value=\"sponsor\">Sponsor</SelectItem>
                  <SelectItem value=\"featured\">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className=\"text-sm font-bold text-emerald-300 mb-2 block\">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder=\"Add any additional context...\"
                className=\"w-full bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-3 py-2 text-white placeholder:text-emerald-400/40 focus:border-emerald-400 focus:outline-none\"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className=\"flex gap-2 pt-4\">
              <Button
                onClick={() => setShowLinkModal(false)}
                variant=\"outline\"
                className=\"flex-1\"
                disabled={linking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkArticle}
                className=\"flex-1 bg-emerald-500 hover:bg-emerald-600\"
                disabled={!selectedArticle || linking}
              >
                {linking ? 'Linking...' : 'Link Article'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## TOKEN 1.4: Integrate Publications Tab into CompanyManager 🔗
**Time:** 15 minutes  
**Priority:** 🔥 HIGH

### Tasks
- [ ] Import `OrganizationPublicationsTab` component
- [ ] Replace placeholder in publications tab
- [ ] Pass required props

### Implementation

```tsx
// In /components/CompanyManager.tsx

// Add import at top
import { OrganizationPublicationsTab } from './OrganizationPublicationsTab'

// Replace lines 659-673 (publications tab placeholder) with:
{activeTab === 'publications' && (
  <div className=\"space-y-4\">
    <OrganizationPublicationsTab
      companyId={selectedCompany.id}
      userId={userId}
      accessToken={accessToken}
      serverUrl={serverUrl}
    />
  </div>
)}
```

---

## ✅ PUBLICATIONS TAB TESTING CHECKLIST

- [ ] Can view organization's linked articles
- [ ] Can link user's article to organization
- [ ] Can select article role (author, co-author, etc.)
- [ ] Can add notes to publication
- [ ] Can unlink article from organization
- [ ] Articles display with correct metadata
- [ ] Empty state shows when no publications
- [ ] Modal opens/closes correctly
- [ ] Error handling works (duplicate links, etc.)
- [ ] Only organization owner can link/unlink

---

# 📋 PART 2: MEMBERS TAB (Days 3-4)

## 🎯 Goal
Enable organizations to:
- Invite members by email
- Assign roles (Owner, Admin, Member)
- Set member permissions
- Remove members
- View member activity

[Detailed implementation continues in next section...]

---

# 📋 PART 3: BADGES TAB (Days 5-6)

## 🎯 Goal
Enable organizations to:
- Create custom organization badges (different from association badges)
- Request badge approval from admins
- Display organization badges on company profile
- Badge verification UI

[Detailed implementation continues in next section...]

---

## 🎯 IMPLEMENTATION ORDER

### **Day 1: Publications Backend** (3-4 hours)
- TOKEN 1.1: Database schema ✅
- TOKEN 1.2: Backend API routes ✅
- Test routes with Postman/curl

### **Day 2: Publications Frontend** (4-5 hours)
- TOKEN 1.3: Publications tab component ✅
- TOKEN 1.4: Integration into CompanyManager ✅
- Testing & bug fixes

### **Day 3-4: Members Tab** (8 hours)
- Database schema
- Backend routes
- Frontend component
- Testing

### **Day 5-6: Badges Tab** (8 hours)
- Database schema
- Backend routes
- Frontend component
- Testing

### **Day 7: Polish & Integration** (4 hours)
- End-to-end testing
- Bug fixes
- Documentation
- Deployment

---

## 📦 DELIVERABLES

### New Files
- `/components/OrganizationPublicationsTab.tsx`
- `/components/OrganizationMembersTab.tsx` (Day 3)
- `/components/OrganizationBadgesTab.tsx` (Day 5)
- `/ORGANIZATION_TABS_IMPLEMENTATION_ROADMAP.md` (this file)

### Modified Files
- `/components/CompanyManager.tsx` (tab integration)
- `/supabase/functions/server/company_routes.tsx` (new routes)

### Database Migrations
- `organization_publications` table
- `organization_members` table (Day 3)
- `organization_badges` table (Day 5)

---

## 🚀 READY TO START?

**Recommendation:** Start with Publications Tab TOKEN 1.1 (Database Schema)

Let's build these collaboration features! 🌱💚

---

*Last Updated: November 28, 2024*  
*Status: Ready to implement*  
*Priority: 🔥🔥🔥 IMMEDIATE*
