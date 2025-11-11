# SQL Developer Brief: Solarpunk Magazine Database Schema

## ⚠️ IMPORTANT NOTE

**This SQL schema is for migrating OUTSIDE of Figma Make to a production environment.**

The current Figma Make environment uses a Key-Value store that cannot be replaced with custom SQL tables. If you're planning to:
- Deploy to your own Supabase instance
- Migrate to a production database
- Build a custom backend

...then this brief will help you create the proper table structure.

---

## 🎯 Project Overview

**Solarpunk Magazine** is a gamified article reading platform with:
- Article publishing with rich media (YouTube, MP3, images)
- User authentication and profiles
- Reading progress tracking and streaks
- Points and achievements system
- Article categories and filtering
- View counting and engagement metrics

---

## 📊 Database Schema

### 1. Users Table (Extended from Supabase Auth)

Supabase Auth handles user authentication. Extend with a profiles table:

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Articles Table

```sql
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  cover_image TEXT,
  reading_time INTEGER DEFAULT 5,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT articles_title_length CHECK (char_length(title) >= 1),
  CONSTRAINT articles_reading_time_positive CHECK (reading_time > 0)
);

-- Indexes
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_created ON public.articles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id);
```

### 3. Article Media Table

```sql
CREATE TABLE public.article_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'youtube', 'audio', 'image'
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0, -- Order in the article
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT media_type_valid CHECK (type IN ('youtube', 'audio', 'image'))
);

-- Index
CREATE INDEX idx_media_article ON public.article_media(article_id);

-- Enable Row Level Security
ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Media is viewable by everyone"
  ON public.article_media FOR SELECT
  USING (true);

CREATE POLICY "Article authors can manage media"
  ON public.article_media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_media.article_id
      AND articles.author_id = auth.uid()
    )
  );
```

### 4. User Progress Table

```sql
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_articles_read INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT progress_positive_values CHECK (
    total_articles_read >= 0 AND
    points >= 0 AND
    current_streak >= 0 AND
    longest_streak >= 0
  )
);

-- Index
CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_progress_points ON public.user_progress(points DESC);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Progress is viewable by everyone (for leaderboard)"
  ON public.user_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can update own progress"
  ON public.user_progress
  FOR ALL
  USING (auth.uid() = user_id);
```

### 5. Read Articles (Junction Table)

```sql
CREATE TABLE public.read_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reads
  UNIQUE(user_id, article_id)
);

-- Indexes
CREATE INDEX idx_read_user ON public.read_articles(user_id);
CREATE INDEX idx_read_article ON public.read_articles(article_id);
CREATE INDEX idx_read_date ON public.read_articles(read_at DESC);

-- Enable Row Level Security
ALTER TABLE public.read_articles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own read articles"
  ON public.read_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark articles as read"
  ON public.read_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 6. Achievements Table

```sql
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY, -- e.g., 'first-read', 'streak-7'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT, -- Optional icon/emoji
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data for achievements
INSERT INTO public.achievements (id, name, description, points, icon) VALUES
  ('first-read', 'First Steps', 'Read your first article', 50, '🌱'),
  ('reader-10', 'Curious Mind', 'Read 10 articles', 100, '📚'),
  ('reader-50', 'Bookworm', 'Read 50 articles', 300, '🐛'),
  ('reader-100', 'Scholar', 'Read 100 articles', 500, '🎓'),
  ('streak-3', '3-Day Streak', 'Read for 3 consecutive days', 75, '🔥'),
  ('streak-7', 'Weekly Warrior', 'Read for 7 consecutive days', 150, '⚡'),
  ('streak-30', 'Monthly Master', 'Read for 30 consecutive days', 500, '🏆'),
  ('early-bird', 'Early Bird', 'Read an article before 8 AM', 25, '🌅'),
  ('night-owl', 'Night Owl', 'Read an article after 10 PM', 25, '🦉'),
  ('category-master', 'Category Master', 'Read articles from all categories', 200, '🌈');

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);
```

### 7. User Achievements (Junction Table)

```sql
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate achievements
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON public.user_achievements(earned_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can grant achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔧 Database Functions

### Update Article Views

```sql
CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET views = views + 1
  WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Calculate Streak

```sql
CREATE OR REPLACE FUNCTION update_reading_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
  last_read DATE;
  yesterday DATE;
  current_progress RECORD;
BEGIN
  -- Get current progress
  SELECT * INTO current_progress
  FROM public.user_progress
  WHERE user_id = user_uuid;
  
  -- Get last read date
  last_read := current_progress.last_read_date;
  yesterday := CURRENT_DATE - INTERVAL '1 day';
  
  -- Update streak
  IF last_read = CURRENT_DATE THEN
    -- Already read today, no change
    RETURN;
  ELSIF last_read = yesterday THEN
    -- Consecutive day
    UPDATE public.user_progress
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_read_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    -- Streak broken
    UPDATE public.user_progress
    SET 
      current_streak = 1,
      last_read_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 Category Reference

Valid article categories:
- `Renewable Energy`
- `Sustainable Tech`
- `Green Cities`
- `Eco Innovation`
- `Climate Action`
- `Community`
- `Future Vision`

---

## 🗂️ Storage Buckets

Create in Supabase Storage:

```
Bucket Name: magazine-media
Access: Private
Max File Size: 50MB
Allowed MIME types:
  - image/jpeg
  - image/png
  - image/webp
  - image/gif
  - audio/mpeg
  - audio/wav
  - video/* (for future use)
```

**Policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'magazine-media');

-- Allow authenticated users to update own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- Allow everyone to view
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'magazine-media');
```

---

## 🔍 Useful Queries

### Get articles with author info
```sql
SELECT 
  a.*,
  p.name as author_name,
  p.avatar_url as author_avatar
FROM articles a
LEFT JOIN profiles p ON a.author_id = p.id
ORDER BY a.created_at DESC;
```

### Get user stats
```sql
SELECT 
  p.name,
  up.points,
  up.current_streak,
  up.total_articles_read,
  COUNT(ua.id) as total_achievements
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
LEFT JOIN user_achievements ua ON p.id = ua.user_id
GROUP BY p.id, p.name, up.points, up.current_streak, up.total_articles_read
ORDER BY up.points DESC;
```

### Leaderboard
```sql
SELECT 
  p.name,
  up.points,
  up.current_streak,
  up.total_articles_read
FROM user_progress up
JOIN profiles p ON up.user_id = p.id
ORDER BY up.points DESC
LIMIT 10;
```

---

## 🚀 Migration Steps

1. **Create all tables** in the order listed (respects foreign keys)
2. **Set up Row Level Security** policies
3. **Create database functions** for common operations
4. **Create storage bucket** with policies
5. **Seed achievements** data
6. **Test authentication** flow
7. **Update backend code** to use SQL queries instead of KV store

---

## 📝 Backend Code Changes Required

After creating these tables, you'll need to update:

1. **Article routes** - Replace `kv.set()` with SQL INSERT/UPDATE
2. **User progress** - Replace KV with SQL queries
3. **Authentication** - Already uses Supabase Auth ✓
4. **Media handling** - Already uses Supabase Storage ✓

Example transformation:
```typescript
// OLD (KV Store)
await kv.set(`article:${id}`, article)

// NEW (SQL)
const { data, error } = await supabase
  .from('articles')
  .insert([article])
```

---

## 🎯 Benefits of SQL Tables vs KV Store

- ✅ Better query performance at scale
- ✅ Relational integrity with foreign keys
- ✅ Advanced filtering and joins
- ✅ Built-in full-text search
- ✅ Easier data analysis and reporting
- ✅ Standard SQL tooling

---

## 📞 Questions for Product Team

- [ ] Should we track article likes/favorites?
- [ ] Do we need article drafts vs published status?
- [ ] Should comments/discussions be added?
- [ ] Do we want article tags in addition to categories?
- [ ] Should we track reading time (time spent reading)?
- [ ] Do we need moderation/reporting features?

---

**Created for:** Solarpunk Magazine SQL Migration  
**Date:** November 11, 2024  
**Status:** Ready for Implementation (Outside Figma Make)
