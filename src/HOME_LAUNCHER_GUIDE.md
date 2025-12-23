# 🚀 DEWII Home Launcher - Complete Guide

## 📋 Overview

The DEWII Home Launcher transforms your homepage into an iOS/macOS-style app launcher with 6 core "worlds":
- **MAG** - Articles and hemp knowledge
- **SWIPE** - Tinder-style product discovery  
- **PLACES** - Location-based hemp spots
- **SWAP** - C2C marketplace for trading
- **FORUM** - Community discussions
- **GLOBE** - B2B global network

---

## 🎨 Features Implemented

### ✅ Core Features
- **96x96 app icons** with colored glass effect
- **Responsive grid**: 3 columns mobile, 4-5 desktop (macOS Launchpad style)
- **Drag & drop reordering** (enabled from day 1)
- **Full-width progress widget** with XP bar
- **Personalized greeting** based on time of day
- **Edit mode** with wiggle animations
- **LocalStorage + Supabase persistence**

### ✅ Design Elements
- **Glass morphism** over theme gradient background
- **Colored gradient glows** behind each icon (unique per app)
- **Smooth animations** (stagger, hover, click)
- **App descriptions** shown under each icon
- **Badge support** (for notifications, "NEW" labels)
- **Theme-aware** (works with all DEWII themes)

---

## 📊 Database Setup

### Run SQL Migration

Execute `/SUPABASE_HOME_LAUNCHER_MIGRATION.sql` in your Supabase SQL Editor. This creates:

#### **Tables**
1. `app_usage_logs` - Track which apps users open
2. `app_badges` - Notification badges per app
3. `xp_rewards` - XP reward configuration
4. `xp_history` - Complete XP transaction log

#### **Columns Added to `user_profiles`**
```sql
home_layout_config JSONB  -- App order, customization
user_level INTEGER         -- Current level (starts at 1)
current_xp INTEGER         -- XP towards next level
total_xp INTEGER           -- Total XP all-time
achievements JSONB         -- Array of achievement IDs
```

#### **Functions**
- `calculate_next_level_xp(level)` - Get XP needed for next level
- `award_xp(user_id, amount, reason, action_key)` - Award XP to user
- `update_app_badge(user_id, app_key, increment)` - Update badge count
- `clear_app_badge(user_id, app_key)` - Clear badge
- `handle_level_up()` - Auto-levels up user (trigger)

#### **Views**
- `user_progress` - User level with calculated progress %
- `user_app_stats` - Aggregated app usage per user

---

## 🎯 Data Structure

### home_layout_config (JSONB)
```json
{
  "appOrder": ["mag", "swipe", "places", "swap", "forum", "globe"],
  "hiddenApps": [],
  "favorites": [],
  "quickActions": [],
  "gridColumns": 3,
  "iconSize": "large",
  "showStats": true,
  "showRecentApps": false
}
```

### XP System
```typescript
Level 1: 0 → 100 XP
Level 2: 0 → 200 XP
Level 3: 0 → 300 XP
Level n: calculate_next_level_xp(n) = CEIL(100 * n^1.5 / 50) * 50
```

### XP Rewards (Default)
| Action | XP | Cooldown | Max/Day |
|--------|----|----|---------|
| Daily login | 10 | 24h | 1 |
| Create article | 50 | None | ∞ |
| Create swap | 25 | None | ∞ |
| Complete trade | 100 | None | ∞ |
| Forum post | 15 | 10min | 10 |
| Forum reply | 5 | 5min | 20 |
| Swipe match | 10 | 1min | ∞ |
| Add place | 30 | None | ∞ |
| Complete profile | 100 | Once | 1 |

---

## 🔧 Component API

### HomeAppLauncher Props
```typescript
interface HomeAppLauncherProps {
  userId: string              // Required
  displayName: string         // Required
  userLevel?: number          // Default: 1
  currentXP?: number          // Default: 0
  nextLevelXP?: number        // Default: 100
  onAppClick?: (appKey: string) => void  // Optional callback
}
```

### Usage Example
```tsx
import { HomeAppLauncher } from './components/home/HomeAppLauncher'

<HomeAppLauncher
  userId={user.id}
  displayName={user.displayName}
  userLevel={userData.user_level}
  currentXP={userData.current_xp}
  nextLevelXP={calculateNextLevelXP(userData.user_level)}
  onAppClick={(appKey) => {
    // Navigate to app
    if (appKey === 'mag') navigate('/mag')
    if (appKey === 'swipe') navigate('/swipe')
    // etc...
  }}
/>
```

---

## 🎨 App Configuration

Each app has these properties:

```typescript
interface AppItem {
  key: string           // Unique identifier ('mag', 'swipe', etc.)
  icon: LucideIcon      // Icon component
  label: string         // Display name
  description: string   // Short description (shown below icon)
  gradient: string      // Tailwind gradient ('from-blue-500 via-...')
  route?: string        // Navigation route
  category?: string     // 'Content', 'Discovery', etc.
  badge?: number        // Notification count (optional)
  isNew?: boolean       // Show "NEW" label (optional)
}
```

### Current Apps

| Key | Icon | Label | Gradient | Description |
|-----|------|-------|----------|-------------|
| `mag` | FileText | MAG | blue → indigo → violet | Articles, stories, and hemp knowledge |
| `swipe` | Heart | SWIPE | pink → rose → red | Discover products, match your vibe |
| `places` | MapPin | PLACES | emerald → teal → cyan | Find hemp spots near you |
| `swap` | RefreshCw | SWAP | amber → orange → red | Trade items with the community |
| `forum` | MessageSquare | FORUM | purple → fuchsia → pink | Join the conversation |
| `globe` | Globe | GLOBE | sky → blue → indigo | Connect worldwide, B2B opportunities |

---

## 🎮 User Experience Flow

### First Time User
1. Sees all 6 default apps in standard order
2. Progress widget shows Level 1, 0/100 XP
3. Greeting: "Good morning/afternoon/evening, {name}!"
4. Can immediately start using apps

### Customization Flow
1. User clicks **Edit** button (top-right)
2. Icons start **wiggling**
3. User **drags** to reorder apps
4. Changes **save automatically** to localStorage
5. After 1 second, saves to Supabase
6. Click **Done** or click outside to exit edit mode

### Navigation Flow
1. User clicks app icon
2. Smooth scale animation (1 → 0.95 → 1.1)
3. `onAppClick` callback fires with app key
4. Parent component navigates to app route
5. (Optional) Log app usage to `app_usage_logs`

---

## 🔐 Security & RLS Policies

All tables have Row Level Security (RLS) enabled:

### user_profiles
- Users can read/update their own profile ✅
- Admins can read all profiles ✅

### app_usage_logs
- Users can read their own logs ✅
- Users can insert their own logs ✅

### app_badges
- Users can read/update their own badges ✅
- System can manage all badges ✅

### xp_rewards
- Anyone can read active rewards ✅
- Only admins can modify ✅

### xp_history
- Users can read their own history ✅
- System can insert history ✅

---

## 🚀 Server Integration

### Award XP (from server)
```typescript
// In /supabase/functions/server/index.tsx

import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

// Award XP when user creates article
const { data, error } = await supabase.rpc('award_xp', {
  p_user_id: userId,
  p_xp_amount: 50,
  p_reason: 'Published article',
  p_action_key: 'create_article'
})

if (data) {
  console.log('XP awarded:', data)
  if (data.leveled_up) {
    console.log(`User leveled up to ${data.new_level}!`)
    // Send notification, etc.
  }
}
```

### Update App Badge
```typescript
// When user has new forum notification
await supabase.rpc('update_app_badge', {
  p_user_id: userId,
  p_app_key: 'forum',
  p_increment: 1  // Add 1 to badge
})

// When user views forum
await supabase.rpc('clear_app_badge', {
  p_user_id: userId,
  p_app_key: 'forum'
})
```

### Log App Usage
```typescript
// When user opens an app
await supabase
  .from('app_usage_logs')
  .insert({
    user_id: userId,
    app_key: 'mag',
    session_duration: null  // Will update on close
  })
```

---

## 📱 Responsive Behavior

### Mobile (<768px)
- **3 columns** (iOS home screen style)
- **96x96 icons** (optimized for touch)
- Progress widget full width
- Edit button top-right
- Smooth scroll

### Tablet (768px - 1024px)
- **4 columns**
- **96x96 icons**
- More breathing room
- Same features as mobile

### Desktop (>1024px)
- **4-5 columns** (macOS Launchpad style)
- **96x96 icons** (visible details)
- Hover effects enhanced
- Keyboard shortcuts (future)

---

## 🎭 Animations

### Page Load
```
1. Background gradient fades in (100ms)
2. Edit button slides in (150ms)
3. Greeting fades in (200ms)
4. Progress widget scales in (250ms)
5. Icons pop in sequentially (50ms stagger)
```

### Icon Hover
```
- Scale: 1 → 1.1
- Translate: 0 → -4px (float up)
- Glow opacity: 0.5 → 0.7
- Duration: 300ms cubic-bezier
```

### Edit Mode
```
- Icons rotate: -2° → 2° → -2° (infinite loop)
- Duration: 300ms
- Easing: easeInOut
```

### Drag & Drop
```
- Scale: 1 → 1.1 (while dragging)
- Shadow: enhanced
- Z-index: 1000
- Cursor: move
```

---

## 🎨 Theme Integration

The home launcher adapts to all DEWII themes:

### Solarpunk Dreams
```css
background: radial-gradient(circle, rgba(16,185,129,0.15), transparent),
            radial-gradient(circle, rgba(6,182,212,0.15), transparent),
            rgba(255,255,255,0.02)
```

### Midnight Hemp
```css
background: radial-gradient(circle, rgba(59,130,246,0.1), transparent),
            radial-gradient(circle, rgba(139,92,246,0.1), transparent),
            rgba(0,0,0,0.4)
```

### Dynamic Elements
- Icon glows match theme accent colors
- Glass blur intensity adjusts (40px base)
- Text opacity theme-aware
- Progress bar gradients match theme

---

## 🔮 Future Enhancements

### Phase 1 (Current) ✅
- 6 core apps with customization
- Progress widget with XP bar
- Drag & drop reordering
- LocalStorage + Supabase persistence

### Phase 2 (Planned)
- **Search bar** (Cmd/Ctrl + K)
- **Quick actions** row
- **Recent apps** tracking
- **Favorites** system (star apps)

### Phase 3 (Advanced)
- **Folders** (group related apps)
- **Widgets** (live data from apps)
- **App badges** (real-time notifications)
- **Keyboard shortcuts**

### Phase 4 (Pro)
- **Custom app creation** (user-defined)
- **App store** (install new apps)
- **Background customization** (upload image)
- **Icon packs** (alternative icon styles)

---

## 🐛 Troubleshooting

### Icons not saving order
- Check browser console for errors
- Verify Supabase connection
- Check `home_layout_config` column exists
- Verify RLS policies allow user to update

### XP not increasing
- Check `award_xp` function exists
- Verify user has permission to execute function
- Check `xp_history` table for logs
- Ensure trigger `handle_level_up` is active

### Progress bar not showing
- Verify `user_level`, `current_xp` columns exist
- Check `calculate_next_level_xp` function
- Ensure user has gamification data

### Edit mode not working
- Check localStorage is enabled
- Verify Motion/Reorder library loaded
- Check browser console for drag errors

---

## 📚 Related Files

```
/components/home/HomeAppLauncher.tsx          ← Main component
/components/MEButtonDrawer.tsx                ← Updated ME modal (has Progress icon)
/SUPABASE_HOME_LAUNCHER_MIGRATION.sql         ← SQL migration
/HOME_LAUNCHER_GUIDE.md                       ← This file
```

---

## 🎯 Quick Start Checklist

1. ✅ Run SQL migration in Supabase
2. ✅ Add `HomeAppLauncher` to your App.tsx
3. ✅ Pass user data (userId, displayName, level, XP)
4. ✅ Implement `onAppClick` handler for navigation
5. ✅ Test customization (drag & drop)
6. ✅ Test progress widget displays correctly
7. ✅ Verify persistence (refresh page)
8. ✅ Test on mobile, tablet, desktop
9. ✅ Integrate XP awards in your app features
10. ✅ Deploy and enjoy! 🚀

---

## 💡 Pro Tips

### Performance
- Icons use CSS transforms (GPU-accelerated)
- Debounced saves prevent excessive DB writes
- LocalStorage provides instant UX
- Supabase syncs in background

### UX Best Practices
- **Don't auto-save during drag** - wait for drop
- **Show visual feedback** - wiggle, glow, etc.
- **Persist immediately** - user expects it
- **Mobile-first** - 3 columns is optimal

### Gamification
- Award XP **generously** but fairly
- Make leveling feel **rewarding**
- Show **progress clearly**
- **Celebrate** level ups with animations

### Accessibility
- Use semantic HTML
- Add aria-labels to icons
- Ensure keyboard navigation works
- Test with screen readers

---

## 🎉 You're Ready!

The DEWII Home Launcher is now fully operational! Your users can:
- ✨ Customize their app layout
- 📈 Track their progress and XP
- 🚀 Navigate between app worlds seamlessly
- 🎨 Enjoy beautiful glass morphism design

**Next Steps:**
1. Run the SQL migration
2. Integrate the component
3. Connect app navigation
4. Add XP rewards to your features
5. Watch your users engage! 🔥

---

**Made with 💚 for the Hemp'in Universe**
