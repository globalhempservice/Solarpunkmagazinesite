# 📊 RSS vs Regular Article Points System

## Overview
DEWII now differentiates between RSS-imported articles and regular/LinkedIn articles in the points reward system.

---

## 🎯 Point Values

| Article Type | Points Awarded | Source Field Value |
|--------------|----------------|-------------------|
| **RSS Articles** | **+5 points** | `source: 'rss'` |
| **LinkedIn Articles** | **+10 points** | `source: 'linkedin'` |
| **Regular Articles** | **+10 points** | `source: null` or other |

---

## 🗄️ Database Storage

### Articles Table
All articles (RSS, LinkedIn, regular) are stored in the **Supabase `articles` table** with a `source` field:

```typescript
interface Article {
  id: string
  title: string
  content: string
  author: string
  source: 'rss' | 'linkedin' | null  // Determines point value
  sourceUrl?: string                  // Original article URL
  // ... other fields
}
```

### How to Identify Article Types:
- **RSS Article**: `article.source === 'rss'` 
- **LinkedIn Article**: `article.source === 'linkedin'`
- **Regular Article**: `article.source` is `null` or undefined

---

## ⚙️ Backend Implementation

### `/users/${userId}/read` Endpoint

**Location:** `/supabase/functions/server/index.tsx` (lines 1012-1028)

```typescript
// Fetch the article to determine if it's an RSS article
const { data: article, error: articleError } = await supabase
  .from('articles')
  .select('source')
  .eq('id', articleId)
  .single()

// Determine points based on article source
const isRssArticle = article?.source === 'rss'
const pointsForReading = isRssArticle ? 5 : 10

console.log(`📰 Article source: ${article?.source}, awarding ${pointsForReading} points`)
```

**Logic:**
1. Fetch article from database
2. Check `source` field
3. Award **5 points** if RSS, **10 points** otherwise
4. Update user progress with correct point value

---

## 🎨 Frontend Display

### ArticleReader Component

**Location:** `/components/ArticleReader.tsx` (lines 100-101)

```typescript
// Determine if this is an RSS article to show correct points
const isRssArticle = article.source === 'rss'
const expectedPoints = isRssArticle ? 5 : 10
```

### Dynamic Point Displays:

1. **Reward Preview Box** (line 449):
   ```tsx
   +{expectedPoints}  // Shows +5 or +10 dynamically
   ```

2. **ClaimPointsButton** (line 876):
   ```tsx
   <ClaimPointsButton
     points={pointsClaimed ? pointsEarned : expectedPoints}
   />
   ```
   - Shows "Claim +5 Points" for RSS articles
   - Shows "Claim +10 Points" for LinkedIn/regular articles

3. **Continue Reading Section** (line 900):
   - Changed from "Earn +10 more points" to "Earn more points" (generic)

---

## 🔄 How It Works End-to-End

### Reading an RSS Article:
1. User opens RSS article → `source: 'rss'`
2. Frontend detects: `expectedPoints = 5`
3. UI shows: **"+5"** in reward box
4. User clicks "Claim +5 Points" button
5. Backend fetches article, confirms `source === 'rss'`
6. Backend awards **5 points**
7. Success message: "+5 Points Earned! 🎉"

### Reading a LinkedIn Article:
1. User opens LinkedIn article → `source: 'linkedin'`
2. Frontend detects: `expectedPoints = 10`
3. UI shows: **"+10"** in reward box
4. User clicks "Claim +10 Points" button
5. Backend fetches article, confirms `source === 'linkedin'`
6. Backend awards **10 points**
7. Success message: "+10 Points Earned! 🎉"

---

## 📝 Key Files Modified

### Backend:
- ✅ `/supabase/functions/server/index.tsx` (lines 1012-1028)
  - Fetches article source
  - Calculates dynamic points (5 or 10)

### Frontend:
- ✅ `/components/ArticleReader.tsx` (lines 100-101, 449, 876)
  - Detects article source
  - Displays correct point value in all UI elements
  
- ✅ `/components/ClaimPointsButton.tsx` (line 12, 68, 130)
  - Accepts dynamic `points` prop
  - Displays correct value in all 3 states

---

## 🧪 Testing

### Test RSS Article Points:
1. Import article via RSS feed
2. Open article page
3. **Expected:** Reward box shows **"+5"**
4. Click "Claim +5 Points" button
5. **Expected:** Success shows "+5 Points Earned! 🎉"
6. Check dashboard: Points increased by **+5**

### Test LinkedIn Article Points:
1. Import LinkedIn post via URL
2. Open article page
3. **Expected:** Reward box shows **"+10"**
4. Click "Claim +10 Points" button
5. **Expected:** Success shows "+10 Points Earned! 🎉"
6. Check dashboard: Points increased by **+10**

---

## 💡 Why Different Point Values?

**Design Rationale:**
- **RSS articles (+5)**: Curated external content, lower engagement barrier
- **LinkedIn/Regular articles (+10)**: Original or user-created content, higher value

This encourages users to engage with both types of content while rewarding original content creation and curation more heavily.

---

## ✅ Summary

✨ **What Changed:**
1. Backend dynamically calculates points based on `article.source`
2. Frontend displays correct point value throughout UI
3. Users see accurate point rewards before claiming
4. No more hardcoded "+10" displays

🎯 **Result:**
- RSS articles: Consistent **+5 points** everywhere
- LinkedIn articles: Consistent **+10 points** everywhere
- Transparent, accurate point system!
