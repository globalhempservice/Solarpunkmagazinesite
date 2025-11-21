# 🌿 DEWII Community Market - Profile System Guide

## 📋 Overview

This guide explains the complete profile system implementation, including badge persistence and the roadmap for public profiles with privacy controls.

---

## ✅ Current Implementation Status

### **Badge Persistence - ALREADY WORKING!** 

Your active badge **IS** persistent across sessions! Here's how it works:

#### Database Layer ✅
- **Table**: `user_progress`
- **Column**: `selected_badge` (VARCHAR)
- **Backend Endpoint**: `PUT /users/:userId/select-badge`
- **Storage**: Directly in Supabase PostgreSQL

#### Frontend Flow ✅
1. User clicks badge in Market Profile Panel
2. `handleEquipBadge()` calls API endpoint
3. Backend saves to `user_progress.selected_badge`
4. Local state updates immediately for instant feedback
5. Success toast shows: "Badge Equipped! Saved & will persist across sessions"

#### Session Persistence ✅
When you return:
1. Profile panel opens → `fetchUserData()` runs
2. Calls `GET /user-progress/${userId}`
3. Backend returns `selectedBadge` from database
4. UI displays your previously selected badge

---

## 🎯 How to Test Badge Persistence

1. **Open Market Profile** (click ME button)
2. **Click any badge** you own to equip it
3. **See success toast** confirming save
4. **Close the panel**
5. **Close the entire app** (refresh browser)
6. **Re-login and open Market**
7. **Open Profile again** → Badge is still active! ✨

---

## 🗄️ Database Schema

### Current Tables Used

#### `user_progress`
```sql
- user_id (UUID, PRIMARY KEY)
- selected_badge (VARCHAR) -- Currently used for badge persistence
- selected_theme (VARCHAR) -- Currently used for theme persistence
- nickname (VARCHAR)
- profile_banner_url (TEXT)
- home_button_theme (VARCHAR)
- total_articles_read (INTEGER)
- points (INTEGER)
- current_streak (INTEGER)
- longest_streak (INTEGER)
- last_read_date (TIMESTAMP)
- priority_support (BOOLEAN)
- market_unlocked (BOOLEAN)
```

#### `user_swag_purchases`
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- item_id (VARCHAR) -- e.g., "badge-founder"
- purchase_date (TIMESTAMP)
```

---

## 🚀 Future: Public Profile System

### Roadmap for Public Profiles

The SQL schema file `/sql_schema_for_public_profiles.sql` contains the complete implementation for:

#### New Features
1. **Public Profile Toggle** - Users can make profile public/private
2. **Privacy Controls** - Hide/show email, stats, badges, achievements
3. **Display Name** - Custom name instead of email
4. **Profile Bio** - Personal description
5. **Profile Views** - Track who viewed your profile
6. **Featured Achievement** - Pin a favorite achievement
7. **Public Profile URL** - Shareable link like `/profile/:userId`

#### Privacy Settings Available

```typescript
interface ProfilePrivacySettings {
  profile_public: boolean;        // Master toggle
  show_email: boolean;            // Show email address
  show_stats: boolean;            // Show articles read, points
  show_badges: boolean;           // Show owned badges
  show_achievements: boolean;     // Show unlocked achievements
  show_nada_balance: boolean;     // Show NADA points
  show_reading_history: boolean;  // Show recent articles
}
```

#### Implementation Options

**Option 1: Extend user_progress (Recommended)**
- Add columns directly to existing `user_progress` table
- Simpler queries, fewer joins
- Better performance
- Current approach: Add `profile_public`, `display_name`, `profile_bio`, etc.

**Option 2: New user_profiles table**
- Separate table for profile data
- Cleaner separation of concerns
- More complex queries with joins

---

## 🔧 Backend Endpoints

### Currently Implemented ✅

```typescript
// Get user progress (includes selectedBadge)
GET /user-progress/:userId

// Update selected badge
PUT /users/:userId/select-badge
Body: { badge: "badge-founder" }

// Get user's owned items (includes badges)
GET /user-swag-items/:userId

// Update theme
PUT /users/:userId/select-theme
Body: { theme: "solarpunk" }
```

### Future Endpoints Needed 🔮

```typescript
// Get public profile
GET /public-profile/:userId
Response: {
  userId, displayName, bio, avatar, banner,
  badges?, stats?, achievements?,
  // Respects privacy settings
}

// Update profile settings
PUT /profile/settings
Body: {
  display_name: "HempLover420",
  profile_bio: "Spreading solarpunk vibes 🌿",
  show_email: false,
  show_badges: true,
  // ... other privacy settings
}

// Get profile views analytics
GET /profile/views
Response: {
  total_views: 127,
  recent_views: [...],
  last_viewed_at: "2024-..."
}

// Record profile view
POST /profile/:userId/view
Body: { viewer_ip?: string }
```

---

## 🎨 UI Components

### Current Components ✅

- **MarketProfilePanel.tsx** - User's own profile view
  - Shows active badge with sparkle indicator
  - Badge grid with click-to-equip
  - Loading spinner during save
  - Success toast confirmation
  - NADA balance display

### Future Components 🔮

- **PublicProfileView.tsx** - View someone else's profile
- **ProfileSettingsPanel.tsx** - Edit privacy settings
- **ProfileShareButton.tsx** - Copy profile link
- **ProfileViewsPanel.tsx** - Analytics dashboard

---

## 🔐 Security & Privacy

### Row Level Security (RLS)

The SQL schema includes comprehensive RLS policies:

```sql
-- Users can view their own profile (private or public)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON user_profiles FOR SELECT
  USING (profile_public = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Privacy by Default

- All profiles are **private by default** (`profile_public = false`)
- Email is **hidden by default** (`show_email = false`)
- Users must **explicitly enable** public profile
- Badge selection is **always private** (only visible when profile is public AND show_badges = true)

---

## 📊 Data Flow Diagram

### Current Badge Persistence Flow

```
┌─────────────────┐
│ User clicks     │
│ badge in UI     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ handleEquipBadge()      │
│ calls API endpoint      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Backend: PUT /select-badge  │
│ Updates user_progress DB    │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Response: { success: true }  │
└────────┬─────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│ UI updates + Success toast    │
│ "Badge Equipped! Saved..."    │
└───────────────────────────────┘

On next session:
┌────────────────────────┐
│ fetchUserData()        │
│ GET /user-progress     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────┐
│ selectedBadge returned     │
│ from database              │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Badge displays as active   │
│ with sparkle indicator ✨  │
└────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Badge Not Persisting?

**Check these:**

1. **API Response** - Check browser console for errors
   ```javascript
   console.log('Badge equipped successfully:', badgeId)
   ```

2. **Database** - Verify in Supabase dashboard:
   ```sql
   SELECT user_id, selected_badge FROM user_progress WHERE user_id = 'your-user-id';
   ```

3. **API Returns Data** - Ensure `/user-progress/:userId` includes:
   ```json
   {
     "selectedBadge": "badge-founder",
     ...
   }
   ```

4. **Local Storage** - Clear browser cache if stale data exists

5. **Re-fetch on Open** - Profile panel should call `fetchUserData()` when opened

### Common Issues

❌ **Badge appears but disappears on refresh**
- Backend might not be saving correctly
- Check API response in Network tab

❌ **Badge doesn't update immediately**
- Local state might not be updating
- Check `setUserProgress()` call

❌ **Wrong badge shows**
- Multiple tabs open?
- Clear cache and hard refresh

✅ **Everything works!**
- Badge persists across sessions
- Success toast confirms save
- Database stores correctly

---

## 📝 Next Steps

### To Implement Public Profiles:

1. **Run SQL Migration**
   ```bash
   # Execute sql_schema_for_public_profiles.sql in Supabase SQL editor
   ```

2. **Create Backend Endpoints**
   - Add public profile GET endpoint
   - Add profile settings PUT endpoint
   - Add profile views tracking

3. **Create UI Components**
   - ProfileSettingsPanel for privacy controls
   - PublicProfileView for viewing others
   - ProfileShareButton for sharing

4. **Update MarketProfilePanel**
   - Add "Edit Profile" button
   - Add "Share Profile" button
   - Add "Public/Private" toggle

5. **Add Profile URL Routing**
   - Create `/profile/:userId` route
   - Handle public/private access
   - Show 404 for private profiles

---

## 🎉 Summary

**Current Status:**
- ✅ Badge persistence works perfectly
- ✅ Saves to database
- ✅ Persists across sessions
- ✅ Visual confirmation with toast
- ✅ Instant UI feedback

**Ready for Future:**
- 📋 Complete SQL schema provided
- 🔐 RLS policies defined
- 🎨 Privacy controls designed
- 🚀 Public profiles ready to implement

The badge system is **production-ready** and **fully persistent**! 🌿✨

---

## 🔗 Related Files

- `/components/MarketProfilePanel.tsx` - Profile UI component
- `/supabase/functions/server/index.tsx` - Backend API endpoints
- `/sql_schema_for_public_profiles.sql` - Complete SQL schema for future features
- `/components/SwagShop.tsx` - Where badges are purchased
- `/components/MarketSettings.tsx` - Theme selection (similar pattern)

---

**Made with 💚 for the DEWII community**
