# Article-Organization-Authors System Implementation

## 🎯 Overview

We've implemented a complete multi-author article system with organization publishing support for DEWII. This enables **academic/professional publishing workflows** where:

- **One article** is published by **one organization** (or personal)
- **Multiple human authors** can collaborate (co-authorship)
- **Only organization owners** can publish articles under their organization
- **Organization staff** (future) can edit articles

## 📊 Architecture

### Database Schema

```
┌─────────────────┐
│    articles     │
│─────────────────│
│ id              │
│ title           │
│ content         │
│ author_id       │ ← System user who created it
│ organization_id │ ← Which org published it (nullable)
│ ...             │
└─────────────────┘
         │
         │ 1:many
         ▼
┌─────────────────┐
│ article_authors │ ← Multiple human co-authors
│─────────────────│
│ id              │
│ article_id      │
│ user_id         │
│ author_name     │
│ author_title    │
│ author_order    │ ← First author, second author, etc.
│ role            │ ← lead-author, co-author, contributor
│ ...             │
└─────────────────┘
```

### Display Example

```
"Hemp Cultivation Research 2024"

By Dr. Jane Smith, Dr. John Doe & Dr. Maria Garcia
Published by Hemp Research Institute

Dr. Smith (Lead Researcher) - Order: 0
Dr. Doe (Senior Scientist) - Order: 1  
Dr. Garcia (Lab Director) - Order: 2
```

## 🗄️ Database Migrations

### Step 1: Run Article Authors Migration

```sql
-- Execute this in Supabase SQL Editor
-- File: /database/migrations/article_authors_system.sql
```

This creates:
- ✅ `article_authors` table
- ✅ `articles_with_authors` view
- ✅ Row Level Security policies
- ✅ Helper functions (get_article_authors_formatted, etc.)

### Step 2: Verify Organization ID Column

The `organization_id` column should already exist on `articles` table from the previous migration (`organization_publications.sql` lines 172-185).

Verify with:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'organization_id';
```

If it doesn't exist, add it:
```sql
ALTER TABLE articles ADD COLUMN organization_id UUID REFERENCES companies(id);
CREATE INDEX idx_articles_organization ON articles(organization_id);
```

## 🚀 Backend API Routes (NEW)

All implemented in `/supabase/functions/server/article_organization_routes.tsx`

### 1. Create Article with Organization & Co-Authors
```
POST /make-server-053bcd80/articles/with-organization
Authorization: Bearer {token}

Body:
{
  "title": "Research Findings 2024",
  "content": "Our comprehensive research...",
  "excerpt": "Summary...",
  "category": "Research",
  "organizationId": "uuid",  // Optional - for org publishing
  "coAuthors": [             // Optional - multi-author support
    {
      "name": "Dr. Jane Smith",
      "title": "Lead Researcher",
      "order": 0,
      "role": "lead-author"
    },
    {
      "name": "Dr. John Doe",
      "title": "Senior Scientist",
      "order": 1,
      "role": "co-author"
    }
  ]
}
```

### 2. Get Articles by Organization
```
GET /make-server-053bcd80/organizations/{orgId}/articles

Response:
{
  "articles": [
    {
      "id": "...",
      "title": "...",
      "organizationId": "...",
      "coAuthors": [
        {
          "name": "Dr. Smith",
          "title": "Lead Researcher",
          "order": 0
        }
      ]
    }
  ]
}
```

### 3. Add Co-Author to Article
```
POST /make-server-053bcd80/articles/{articleId}/authors
Authorization: Bearer {token}

Body:
{
  "name": "Dr. Alice Johnson",
  "title": "Contributing Researcher",
  "order": 2,
  "role": "contributor"
}
```

### 4. Remove Co-Author
```
DELETE /make-server-053bcd80/articles/{articleId}/authors/{authorId}
Authorization: Bearer {token}
```

### 5. Update Article's Organization
```
PUT /make-server-053bcd80/articles/{articleId}/organization
Authorization: Bearer {token}

Body:
{
  "organizationId": "uuid"  // or null for personal
}
```

### 6. Get User's Organizations (for dropdown)
```
GET /make-server-053bcd80/user/organizations
Authorization: Bearer {token}

Response:
{
  "organizations": [
    {
      "id": "...",
      "name": "Hemp Research Institute",
      "logoUrl": "..."
    }
  ]
}
```

### 7. Get Full Article Details (with co-authors & org)
```
GET /make-server-053bcd80/articles/{articleId}/full

Response:
{
  "article": {
    "id": "...",
    "title": "...",
    "organizationId": "...",
    "organization": {
      "id": "...",
      "name": "Hemp Research Institute"
    },
    "coAuthors": [...]
  }
}
```

## 🔒 Permissions & Security

### Publishing Under Organization
- ✅ **Owner-only** for now
- 🔜 **Admins** in future (when Members tab is complete)
- ❌ Regular members cannot publish (yet)

### Editing Articles
- ✅ Article creator can always edit
- ✅ Organization owner can edit their org's articles
- 🔜 Organization staff/admins (future)

### Managing Co-Authors
- ✅ Article creator can add/remove co-authors
- ✅ Organization owner can manage co-authors on their org's articles

## 📝 Frontend Components

### Updated: OrganizationPublicationsTab
**File:** `/components/OrganizationPublicationsTab.tsx`

**Changes:**
- ✅ Now queries articles by `organization_id` instead of junction table
- ✅ Displays co-authors for each article
- ✅ "Link Article" → "Publish Article" (sets organization_id)
- ✅ Shows co-author badges with names and titles
- ✅ Removed old "role" and "notes" fields (no longer needed)

**New API Endpoints Used:**
- `GET /organizations/{orgId}/articles` - fetch org's publications
- `PUT /articles/{articleId}/organization` - publish/unpublish

### TODO: Update ArticleEditor Component
**File:** `/components/ArticleEditor.tsx`

**Required Changes:**
1. Add **Organization Selector Dropdown**
   ```tsx
   <Select value={organizationId} onValueChange={setOrganizationId}>
     <SelectTrigger>
       <SelectValue placeholder="Personal Article (No Organization)" />
     </SelectTrigger>
     <SelectContent>
       <SelectItem value="">Personal Article</SelectItem>
       {userOrganizations.map(org => (
         <SelectItem key={org.id} value={org.id}>
           {org.name}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
   ```

2. Add **Co-Authors Manager**
   ```tsx
   <div className="co-authors-section">
     <Label>Co-Authors (Optional)</Label>
     {coAuthors.map((author, idx) => (
       <div key={idx} className="flex items-center gap-2">
         <Input 
           placeholder="Name" 
           value={author.name}
           onChange={(e) => updateCoAuthor(idx, 'name', e.target.value)}
         />
         <Input 
           placeholder="Title (e.g., PhD, Senior Researcher)" 
           value={author.title}
           onChange={(e) => updateCoAuthor(idx, 'title', e.target.value)}
         />
         <Button onClick={() => removeCoAuthor(idx)}>
           <X className="w-4 h-4" />
         </Button>
       </div>
     ))}
     <Button onClick={addCoAuthor}>
       <Plus className="w-4 h-4" /> Add Co-Author
     </Button>
   </div>
   ```

3. **Fetch User Organizations** on component mount:
   ```tsx
   useEffect(() => {
     const fetchOrgs = async () => {
       const response = await fetch(`${serverUrl}/user/organizations`, {
         headers: { 'Authorization': `Bearer ${accessToken}` }
       })
       const data = await response.json()
       setUserOrganizations(data.organizations)
     }
     fetchOrgs()
   }, [])
   ```

4. **Include in save/update**:
   ```tsx
   const handleSave = () => {
     onSave({
       ...articleData,
       organizationId,
       coAuthors: coAuthors.map((a, idx) => ({
         name: a.name,
         title: a.title,
         order: idx,
         role: idx === 0 ? 'lead-author' : 'co-author'
       }))
     })
   }
   ```

## 🔄 Migration from Old System

### Old Junction Table Approach
```sql
organization_publications (
  organization_id,
  article_id,
  role -- DEPRECATED
)
```

### New Direct Relationship
```sql
articles (
  organization_id -- Direct link
)
```

**Benefits:**
- ✅ Simpler queries (no joins needed)
- ✅ Clear ownership model
- ✅ Better matches academic publishing (1 article = 1 publisher)
- ✅ Co-authors stored separately (proper many-to-many for humans)

## 📋 Testing Checklist

### Backend Tests
- [ ] Deploy edge functions via Supabase dashboard
- [ ] Test creating personal article (no org)
- [ ] Test creating article with organization
- [ ] Test creating article with co-authors
- [ ] Test adding co-authors to existing article
- [ ] Test updating article's organization
- [ ] Test permission checks (non-owner tries to publish)

### Frontend Tests
- [ ] Publications tab shows organization's articles
- [ ] Co-authors display correctly
- [ ] "Link Article" publishes article under org
- [ ] "Remove" unpublishes (makes personal)
- [ ] Article editor has org selector (TODO)
- [ ] Article editor has co-author manager (TODO)

## 🚨 Important Notes

1. **Edge Functions Deployment Required**
   - The backend changes won't work until you **redeploy edge functions** via Supabase dashboard
   - Go to: Supabase → Edge Functions → Deploy

2. **Database Migration Required**
   - Run `/database/migrations/article_authors_system.sql` in Supabase SQL Editor
   - Verify `organization_id` column exists on `articles` table

3. **ArticleEditor Component Not Updated Yet**
   - Current article creation doesn't include org selector or co-author manager
   - Users can only publish articles under orgs via the Publications Tab for now
   - Full article creation flow needs ArticleEditor updates (see TODO section)

4. **Backward Compatibility**
   - Old junction table `organization_publications` still exists
   - Can be used for "featured" articles in future
   - New system uses direct `organization_id` for publishing

## 🎓 Use Cases

### Academic Research Paper
```json
{
  "title": "Industrial Hemp Cultivation Study 2024",
  "organizationId": "hemp-university-id",
  "coAuthors": [
    {"name": "Dr. Jane Smith", "title": "Lead Researcher", "order": 0},
    {"name": "Dr. John Doe", "title": "Co-Investigator", "order": 1},
    {"name": "Dr. Maria Garcia", "title": "Lab Director", "order": 2}
  ]
}
```

### Company White Paper
```json
{
  "title": "Hemp Industry Report Q4 2024",
  "organizationId": "hemp-corp-id",
  "coAuthors": [
    {"name": "Alice Johnson", "title": "VP of Research", "order": 0},
    {"name": "Bob Williams", "title": "Senior Analyst", "order": 1}
  ]
}
```

### Personal Blog Post
```json
{
  "title": "My Hemp Growing Experience",
  "organizationId": null,  // Personal, not under org
  "coAuthors": []          // Single author
}
```

## 📚 Next Steps

1. ✅ **Deploy Edge Functions** (Supabase Dashboard)
2. ✅ **Run Database Migration** (SQL Editor)
3. ⏳ **Update ArticleEditor Component** (add org selector + co-author manager)
4. ⏳ **Test Full Workflow** (create → publish → display)
5. 🔜 **Members Tab Implementation** (enable org staff editing)
6. 🔜 **Badges Tab Implementation** (author verification badges)

## 🐛 Troubleshooting

### "Failed to start reading session"
- This error is unrelated to the new system
- Caused by article security read token generation
- Check if KV store is accessible
- Check browser console for detailed error

### "Organization not found"
- Verify user owns the organization
- Check organization ID is correct
- Only owners can publish under their orgs

### Articles not showing in Publications Tab
- Ensure `organization_id` is set on the article
- Check edge functions are deployed
- Verify new API endpoint is being called

---

**Status:** ✅ Backend Complete | ⏳ Frontend Partial (Publications Tab done, ArticleEditor pending)

**Ready for:** Database migration + Edge function deployment + ArticleEditor updates
