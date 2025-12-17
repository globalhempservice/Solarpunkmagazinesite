# ME Modal Customization - Supabase Migration

## 📊 SQL Migration

Run this SQL in your **Supabase SQL Editor** to add the customization column:

```sql
-- Add me_modal_config column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS me_modal_config JSONB DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN user_profiles.me_modal_config IS 'Stores user customization for ME modal: ordered array of enabled icon keys (max 9)';

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_user_profiles_me_modal_config 
ON user_profiles USING GIN (me_modal_config);
```

## 🎯 Data Structure

The `me_modal_config` column stores a JSONB array of icon keys in the user's preferred order:

```json
[
  "profile",
  "discovery",
  "articles",
  "organizations",
  "inventory",
  "settings",
  "plugin-store"
]
```

## 🔧 Default Configuration

If no customization is saved, the system uses this default:

```typescript
const DEFAULT_CONFIG = [
  'profile',       // My Profile
  'discovery',     // Discovery Match
  'articles',      // My Articles
  'organizations', // Organizations
  'inventory',     // My Inventory
  'settings',      // Settings
  'plugin-store'   // Plugin Store
]
```

## 📱 Available Icons

Users can choose from these icons (max 9 total):

### Core Icons (Default)
- `profile` - My Profile
- `discovery` - Discovery Match
- `articles` - My Articles
- `organizations` - Organizations
- `inventory` - My Inventory
- `settings` - Settings
- `plugin-store` - Plugin Store

### Additional Icons (Future Features)
- `gamification` - Gamification
- `analytics` - Analytics
- `messages` - Messages
- `notifications` - Notifications
- `favorites` - Favorites

## 💾 How It Works

1. **On Mount**: Component loads config from localStorage (instant) then Supabase (source of truth)
2. **On Edit**: User customizes icons in edit mode
3. **On Save**: Config saved to localStorage immediately, then Supabase after 1 second debounce
4. **On Reload**: User sees their personalized layout instantly

## 🚀 Features Implemented

✅ Edit/Done button toggle (top-right)  
✅ Wiggle animation in edit mode  
✅ Remove icons (X badge)  
✅ Add icons (+ slots → bottom sheet)  
✅ Drag & drop reordering (Motion Reorder)  
✅ localStorage + Supabase persistence  
✅ Debounced saves (1 second)  
✅ Avatar-only header (no name/status)  
✅ Logout button (locked, always centered bottom)  
✅ Max 9 icons enforcement  

## 🎨 User Experience

1. User opens ME modal → sees customized layout
2. Taps **Edit** button → icons start wiggling
3. **Remove**: Tap X badge → icon fades out
4. **Add**: Tap + slot → bottom sheet opens → select icon
5. **Reorder**: Drag icon to new position
6. Tap **Done** or click outside → saves customization
7. Layout persists across sessions! 🎉
