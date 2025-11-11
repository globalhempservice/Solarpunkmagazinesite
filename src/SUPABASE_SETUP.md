# Supabase Setup for Solarpunk Magazine

## 📊 Current Database Structure (KV Store)

Your Solarpunk Magazine uses Supabase's **built-in Key-Value store** which is already configured and working. No additional SQL setup is needed!

### How It Works

The KV store uses a single flexible table (`kv_store_053bcd80`) that stores data as key-value pairs:

```
Key Format                    | Value (JSON)
------------------------------|----------------------------------
article:{uuid}                | { id, title, content, authorId, ... }
user:{userId}:progress        | { points, streak, achievements, ... }
```

## 🗄️ Data Stored

### Articles
**Key:** `article:{articleId}`
```json
{
  "id": "uuid",
  "title": "Article Title",
  "content": "Full article content...",
  "excerpt": "Short summary...",
  "category": "Renewable Energy",
  "coverImage": "https://...",
  "readingTime": 5,
  "media": [
    {
      "type": "youtube",
      "url": "https://youtube.com/...",
      "caption": "Video description"
    }
  ],
  "authorId": "user-uuid-from-supabase-auth",
  "createdAt": "2024-11-11T...",
  "updatedAt": "2024-11-11T...",
  "views": 0,
  "likes": 0
}
```

### User Progress
**Key:** `user:{userId}:progress`
```json
{
  "userId": "user-uuid",
  "totalArticlesRead": 10,
  "points": 250,
  "currentStreak": 3,
  "longestStreak": 7,
  "achievements": ["first-read", "streak-3"],
  "readArticles": ["article-id-1", "article-id-2"],
  "lastReadDate": "2024-11-11T..."
}
```

## 👤 User Authentication

Users are stored in **Supabase Auth** (not the KV store):
- Email/password authentication
- User metadata includes: name, email
- User IDs are automatically generated UUIDs
- Passwords are securely hashed by Supabase

Access via: **Supabase Dashboard → Authentication → Users**

## 📁 File Storage

Article media (images, audio files) are stored in **Supabase Storage**:
- Bucket: `make-053bcd80-magazine-media`
- Access: Private with signed URLs
- Auto-created on server startup

## 🔧 Debugging: Check Your Data

### View All Articles
```bash
# In Supabase SQL Editor or via API
# Articles are stored with keys like: article:xxxxx-xxxx-xxxx...
```

### Via Admin Panel
1. Log into your Netlify site
2. Click "Admin" in the navigation
3. See all articles in the table view
4. Check the "Debug Information" section for raw JSON

### Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" → `kv_store_053bcd80`
4. Look for keys starting with `article:`

## 🚀 Why KV Store Instead of SQL Tables?

### Advantages:
✅ **No migrations needed** - Works out of the box
✅ **Flexible schema** - Add fields anytime without ALTER TABLE
✅ **Perfect for prototyping** - Fast iteration
✅ **JSON-native** - Store complex nested data easily
✅ **Already configured** - No setup required

### When to Consider SQL Tables:
- Production app with 10,000+ articles
- Need complex relational queries
- Require foreign key constraints
- Want full-text search indexing

## 🔍 Current Logging

The server now logs extensively:

**When creating an article:**
```
Creating article for user: {userId}
Article data received: {full JSON}
Saving article to KV store with key: article:{id}
Article saved successfully: {id}
```

**When fetching articles:**
```
Fetching articles from KV store...
Raw articles data from KV: {count} items
Filtered articles: {count}
Returning {count} articles
```

Check these logs in:
- **Netlify Functions Logs**: Netlify Dashboard → Functions → Logs
- **Supabase Edge Functions Logs**: Supabase Dashboard → Edge Functions → Logs

## 🎯 Next Steps to Debug

1. **Check Netlify Function Logs** after publishing an article
2. **Open Admin Panel** to see if articles appear there
3. **Check browser console** for frontend errors
4. **Verify authentication** - make sure you're logged in when publishing

---

**Note:** Custom SQL tables and migrations cannot be created in Figma Make environment. The KV store is specifically designed to be flexible and work without additional configuration.
