# 🎮 DEWII Gamification Integration Guide

## ✅ Backend Complete!

All database fields and backend endpoints are now ready. Here's how to integrate the tracking into your frontend.

---

## 📊 Point System Summary

### **Per-Action Points:**
- 📖 **Read Article**: 10 points
- 🎨 **Create Article**: 50 points (BIG reward!)
- 🔄 **Share Article**: 5 points
- 👆 **Swipe Article**: 1 point
- ❤️ **Like Article** (in swipe mode): 3 points (1 swipe + 2 bonus)

### **Achievement Points:**
Varies from 10 points (common) to 2500 points (mythic)!

---

## 🔌 New Backend Endpoints

### 1. Track Article Share
**Endpoint**: `POST /make-server-053bcd80/track-share`

**When to call**: When user clicks any share button

```typescript
// Call this when user shares an article
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-share`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})

const data = await response.json()
// Returns: { success: true, articlesShared: 5, pointsEarned: 5, totalPoints: 145 }
```

### 2. Track Swipe/Like
**Endpoint**: `POST /make-server-053bcd80/track-swipe`

**When to call**: Every time user swipes an article in Explore page

```typescript
// Call this on every swipe
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-swipe`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    liked: true  // true if swiped right/liked, false if swiped left/skipped
  })
})

const data = await response.json()
// Returns: { success: true, articlesSwiped: 23, articlesLiked: 15, pointsEarned: 3, totalPoints: 250 }
```

### 3. Track Article Creation
**Endpoint**: `POST /make-server-053bcd80/track-creation`

**When to call**: When user successfully publishes a new article

```typescript
// Call this after article is saved to database
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-creation`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})

const data = await response.json()
// Returns: { success: true, articlesCreated: 3, pointsEarned: 50, totalPoints: 450 }
```

---

## 🎯 Where to Add These Calls

### 1. **SwipeMode Component** (`/components/SwipeMode.tsx`)
Add tracking in the swipe handler:

```typescript
const handleSwipe = async (direction: 'left' | 'right') => {
  // ... existing swipe logic ...
  
  // Track the swipe
  try {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-swipe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        liked: direction === 'right'
      })
    })
  } catch (error) {
    console.error('Failed to track swipe:', error)
  }
}
```

### 2. **Article Sharing** (wherever share buttons exist)
Look for components with share functionality and add:

```typescript
const handleShare = async (platform: string) => {
  // ... existing share logic ...
  
  // Track the share
  try {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    toast.success('Shared! +5 points 🎉')
  } catch (error) {
    console.error('Failed to track share:', error)
  }
}
```

### 3. **Article Editor** (where articles are created)
Add tracking after successful save:

```typescript
const handlePublish = async () => {
  // ... save article to database ...
  
  // Track the creation
  try {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-053bcd80/track-creation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    toast.success('Article published! +50 points 🎨')
  } catch (error) {
    console.error('Failed to track creation:', error)
  }
}
```

---

## 🏆 Complete Achievement List (35 Total)

### 📚 Reading (6)
- First Steps (1) - 10pts
- Getting Started (5) - 25pts
- Curious Mind (10) - 50pts
- Knowledge Seeker (25) - 150pts
- Voracious Reader (50) - 300pts
- Scholar Supreme (100) - 750pts

### 🔥 Streaks (5)
- Hot Start (3 days) - 30pts
- Weekly Warrior (7 days) - 75pts
- Two Week Champion (14 days) - 200pts
- Monthly Legend (30 days) - 500pts
- Unstoppable Force (100 days) - 2000pts

### 🎁 Social (4)
- Generous Soul (1 share) - 15pts
- Knowledge Spreader (10 shares) - 100pts
- Community Champion (25 shares) - 250pts
- Influence Master (50 shares) - 600pts

### 🎯 Explorer (4)
- Explorer Novice (10 swipes) - 20pts
- Discovery Hunter (50 swipes) - 80pts
- Swipe Master (100 swipes) - 200pts
- Good Taste (10 likes) - 60pts

### ✨ Creation (4) - **HIGHEST REWARDS!**
- Creator Awakened (1 article) - 100pts
- Rising Creator (5 articles) - 350pts
- Master Creator (10 articles) - 800pts
- Content Titan (25 articles) - 2500pts

### 👑 Special (4)
- Point Collector (500pts) - 50pts
- Point Master (1000pts) - 150pts
- Point Legend (5000pts) - 500pts
- The Completionist (all achievements) - 5000pts

**Total possible points from achievements alone: ~10,000+**

---

## 🎨 Optional: Add Toast Notifications

Show users when they earn points for actions:

```typescript
import { toast } from 'sonner@2.0.3'

// After successful tracking
toast.success(`+${pointsEarned} points! 🎉`, {
  description: `You now have ${totalPoints} total points`
})
```

---

## ✅ Testing Checklist

1. ✅ Database columns added
2. ✅ Backend endpoints created
3. ⏳ Integrate swipe tracking in SwipeMode component
4. ⏳ Integrate share tracking in share buttons
5. ⏳ Integrate creation tracking in article editor
6. ⏳ Test "Claim Eligible Achievements" button
7. ⏳ Verify achievements unlock correctly

---

## 🚀 Ready to Go!

The backend is complete and waiting for frontend integration. Once you add the tracking calls to your components, users will automatically earn points and unlock achievements as they interact with your magazine! 

Let me know which component you'd like me to integrate first! 🎮
