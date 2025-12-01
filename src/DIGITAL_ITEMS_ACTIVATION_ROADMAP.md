# 🎨 DIGITAL ITEMS ACTIVATION - COMPLETE ROADMAP

**Sprint Goal:** Make purchased digital items (themes, badges, profile banners) actually work!  
**Priority:** 🔥🔥🔥 CRITICAL - Users have already purchased these items!  
**Timeline:** 2-3 days  
**Date:** November 28, 2024

---

## 🎯 OVERVIEW

Users can currently **purchase** digital items from the Swag Shop using NADA points:
- ✅ Themes (Solarpunk Dreams, Midnight Hemp, Golden Hour)
- ✅ Badges (Founder, Pioneer, Whale)
- ✅ Custom Profile Banner
- ✅ Priority Support

But these items **don't actually do anything yet!** This sprint activates them.

---

## 📊 CURRENT STATE

### ✅ What's Already Built
1. **Swag Shop UI** - Users can browse and purchase items ✅
2. **Purchase Flow** - NADA deduction + inventory tracking ✅
3. **Backend Table** - `user_swag_items` stores purchases ✅
4. **API Routes** - Purchase and fetch owned items ✅

### 🔴 What's Missing
1. **Theme System** - Themes don't apply to UI
2. **Badge Display** - Badges don't show on profiles
3. **Banner Upload** - No way to upload custom banners
4. **Settings UI** - No interface to activate purchased items

---

## 🏗️ ARCHITECTURE

### Database Schema (Already Exists)
```sql
-- User swag items (purchases)
user_swag_items:
  - id
  - user_id
  - item_id (e.g., "theme-midnight-hemp", "badge-founder")
  - item_name
  - price_paid
  - purchased_at

-- User profiles (needs extension)
user_profiles (KV Store):
  - selected_theme (NEW)
  - equipped_badge (NEW)
  - profile_banner_url (NEW)
```

### Component Flow
```
SwagShop → Purchase Item → user_swag_items table
  ↓
AccountSettings → Fetch Owned Items → Display Activation UI
  ↓
User Selects Theme/Badge → Update Profile → Apply Globally
  ↓
App.tsx → Load Theme/Badge → Render Throughout App
```

---

# 📋 IMPLEMENTATION ROADMAP

## 🎨 PART 1: THEME SYSTEM (Day 1)

**Goal:** Users can select and apply purchased themes (Solarpunk Dreams, Midnight Hemp, Golden Hour)

### **TOKEN 1.1: Define Theme CSS Variables** 🎨
**Time:** 30 minutes  
**Files:** `/styles/globals.css`

**Tasks:**
- [x] Define Solarpunk Dreams theme variables
- [x] Define Midnight Hemp theme variables
- [x] Define Golden Hour theme variables
- [x] Create theme switcher logic with CSS custom properties

**Theme Definitions:**

#### **Solarpunk Dreams** (Default - Current)
```css
[data-theme="solarpunk-dreams"] {
  --primary: 134 239 172; /* emerald-300 */
  --secondary: 251 191 36; /* amber-400 */
  --accent: 74 222 128; /* green-400 */
  --background-start: 6 78 59; /* emerald-950 */
  --background-end: 20 83 45; /* green-900 */
}
```

#### **Midnight Hemp** (Dark Bioluminescent)
```css
[data-theme="midnight-hemp"] {
  --primary: 167 139 250; /* purple-400 */
  --secondary: 74 222 128; /* green-400 - bioluminescent */
  --accent: 196 181 253; /* purple-300 */
  --background-start: 17 24 39; /* slate-900 */
  --background-end: 30 27 75; /* purple-950 */
}
```

#### **Golden Hour** (Sunset Warmth)
```css
[data-theme="golden-hour"] {
  --primary: 251 191 36; /* amber-400 */
  --secondary: 251 146 60; /* orange-400 */
  --accent: 250 204 21; /* yellow-400 */
  --background-start: 124 45 18; /* orange-950 */
  --background-end: 120 53 15; /* amber-950 */
}
```

**Implementation Strategy:**
- Use `data-theme` attribute on `<html>` or `<body>`
- CSS variables cascade throughout entire app
- No component-level changes needed (Tailwind classes stay the same)

---

### **TOKEN 1.2: Theme Storage Backend** 🔌
**Time:** 20 minutes  
**Files:** `/supabase/functions/server/index.tsx`

**Tasks:**
- [x] Create `GET /user-selected-theme/:userId` route
- [x] Create `POST /update-user-theme` route
- [x] Store theme in KV store under `user:{userId}` key
- [x] Return current theme on profile load

**API Routes:**

```typescript
// GET /make-server-053bcd80/user-selected-theme/:userId
app.get('/make-server-053bcd80/user-selected-theme/:userId', async (c) => {
  const userId = c.req.param('userId')
  const userData = await kv.get(`user:${userId}`)
  
  return c.json({
    selectedTheme: userData?.selected_theme || 'solarpunk-dreams'
  })
})

// POST /make-server-053bcd80/update-user-theme
app.post('/make-server-053bcd80/update-user-theme', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  
  const { theme } = await c.req.json()
  const userKey = `user:${user.id}`
  const userData = await kv.get(userKey)
  
  await kv.set(userKey, {
    ...userData,
    selected_theme: theme
  })
  
  return c.json({ success: true })
})
```

---

### **TOKEN 1.3: Theme Selector UI** 🎨
**Time:** 45 minutes  
**Files:** `/components/AccountSettings.tsx` or NEW `/components/ThemeSelector.tsx`

**Tasks:**
- [x] Fetch user's owned themes from `/owned-swag-items`
- [x] Display theme cards with preview
- [x] Show "locked" state for unowned themes
- [x] Apply theme on selection
- [x] Persist selection to backend
- [x] Show "Go to Swag Shop" button for locked themes

**UI Design:**

```tsx
interface ThemeOption {
  id: string
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    background: string
  }
  itemId: string // "theme-midnight-hemp"
}

const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'solarpunk-dreams',
    name: 'Solarpunk Dreams',
    description: 'Emerald forests and golden sunlight',
    preview: { primary: '#86efac', secondary: '#fbbf24', background: 'linear-gradient(...)' },
    itemId: 'theme-solarpunk-dreams'
  },
  {
    id: 'midnight-hemp',
    name: 'Midnight Hemp',
    description: 'Dark skies with bioluminescent glow',
    preview: { primary: '#a78bfa', secondary: '#4ade80', background: 'linear-gradient(...)' },
    itemId: 'theme-midnight-hemp'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm sunset hues and amber horizons',
    preview: { primary: '#fbbf24', secondary: '#fb923c', background: 'linear-gradient(...)' },
    itemId: 'theme-golden-hour'
  }
]

export function ThemeSelector({ ownedItems, onThemeChange }) {
  const [selectedTheme, setSelectedTheme] = useState('solarpunk-dreams')
  
  function isThemeOwned(itemId: string) {
    // Solarpunk Dreams is default/free
    if (itemId === 'theme-solarpunk-dreams') return true
    return ownedItems.some(item => item.item_id === itemId)
  }
  
  function handleSelectTheme(theme: ThemeOption) {
    if (!isThemeOwned(theme.itemId)) {
      alert('Purchase this theme in the Swag Shop first!')
      return
    }
    
    setSelectedTheme(theme.id)
    onThemeChange(theme.id)
  }
  
  return (
    <div className="theme-selector">
      {AVAILABLE_THEMES.map(theme => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          isOwned={isThemeOwned(theme.itemId)}
          isSelected={selectedTheme === theme.id}
          onClick={() => handleSelectTheme(theme)}
        />
      ))}
    </div>
  )
}
```

---

### **TOKEN 1.4: Global Theme Application** 🌍
**Time:** 30 minutes  
**Files:** `/App.tsx`, `/styles/globals.css`

**Tasks:**
- [x] Fetch user's selected theme on app load
- [x] Apply `data-theme` attribute to document root
- [x] Listen for theme changes
- [x] Persist theme selection across sessions

**Implementation:**

```tsx
// In App.tsx
const [currentTheme, setCurrentTheme] = useState('solarpunk-dreams')

useEffect(() => {
  if (userId) {
    fetchUserTheme()
  }
}, [userId])

async function fetchUserTheme() {
  const response = await fetch(`${serverUrl}/user-selected-theme/${userId}`)
  const data = await response.json()
  applyTheme(data.selectedTheme)
}

function applyTheme(themeId: string) {
  setCurrentTheme(themeId)
  document.documentElement.setAttribute('data-theme', themeId)
}

async function handleThemeChange(newTheme: string) {
  // Update backend
  await fetch(`${serverUrl}/update-user-theme`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ theme: newTheme })
  })
  
  // Apply immediately
  applyTheme(newTheme)
}
```

---

## 🏆 PART 2: BADGE DISPLAY SYSTEM (Day 2)

**Goal:** Show purchased badges on user profiles and allow equipping a primary badge

### **TOKEN 2.1: Badge Components** 🎨
**Time:** 45 minutes  
**Files:** NEW `/components/BadgeDisplay.tsx`, NEW `/components/BadgeCollection.tsx`

**Tasks:**
- [x] Create BadgeDisplay component (single badge render)
- [x] Create BadgeCollection component (grid of all badges)
- [x] Add rarity indicators (Common, Rare, Legendary)
- [x] Add "equipped" state indicator
- [x] Add badge tooltips with descriptions

**Badge Definitions:**

```typescript
interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  itemId: string // "badge-founder"
  color: string
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'founder',
    name: 'Founder',
    description: 'Early supporter of the Hemp\'in movement',
    icon: <Crown />,
    rarity: 'legendary',
    itemId: 'badge-founder',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'Trailblazer in sustainable hemp advocacy',
    icon: <Compass />,
    rarity: 'epic',
    itemId: 'badge-pioneer',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Generous contributor to the community',
    icon: <Gem />,
    rarity: 'rare',
    itemId: 'badge-whale',
    color: 'from-blue-500 to-cyan-600'
  }
]
```

**Component Structure:**

```tsx
// BadgeDisplay.tsx - Single badge
export function BadgeDisplay({ badge, size = 'md', equipped = false }) {
  return (
    <div className={`badge-display ${equipped ? 'equipped' : ''}`}>
      <div className={`badge-icon bg-gradient-to-br ${badge.color}`}>
        {badge.icon}
      </div>
      {equipped && <div className="equipped-indicator">★</div>}
    </div>
  )
}

// BadgeCollection.tsx - Full collection page
export function BadgeCollection({ ownedBadges, equippedBadge, onEquip }) {
  return (
    <div className="badge-collection">
      <h2>Your Badge Collection</h2>
      <div className="badge-grid">
        {AVAILABLE_BADGES.map(badge => {
          const isOwned = ownedBadges.some(b => b.item_id === badge.itemId)
          const isEquipped = equippedBadge === badge.id
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isOwned={isOwned}
              isEquipped={isEquipped}
              onEquip={() => onEquip(badge.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
```

---

### **TOKEN 2.2: Badge Storage Backend** 🔌
**Time:** 15 minutes  
**Files:** `/supabase/functions/server/index.tsx`

**Tasks:**
- [x] Create `POST /equip-badge` route
- [x] Store equipped badge in user profile KV
- [x] Return equipped badge on profile load

**API Route:**

```typescript
// POST /make-server-053bcd80/equip-badge
app.post('/make-server-053bcd80/equip-badge', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  
  const { badgeId } = await c.req.json()
  const userKey = `user:${user.id}`
  const userData = await kv.get(userKey)
  
  // Verify user owns the badge
  const ownedItems = await kv.getByPrefix(`swag_item:${user.id}:`)
  const ownsBadge = ownedItems.some(item => item.item_id === `badge-${badgeId}`)
  
  if (!ownsBadge && badgeId !== null) {
    return c.json({ error: 'You do not own this badge' }, 403)
  }
  
  await kv.set(userKey, {
    ...userData,
    equipped_badge: badgeId
  })
  
  return c.json({ success: true })
})
```

---

### **TOKEN 2.3: Badge Integration in UI** 🎨
**Time:** 45 minutes  
**Files:** `/components/UserDashboard.tsx`, `/components/AccountSettings.tsx`

**Tasks:**
- [x] Add badge section to Account Settings
- [x] Display equipped badge in User Dashboard header
- [x] Show badge collection grid
- [x] Add "Equip/Unequip" functionality
- [x] Show badge next to username in navbar (optional)

**User Dashboard Integration:**

```tsx
// In UserDashboard.tsx
export function UserDashboard({ userProgress, ownedItems }) {
  const equippedBadge = AVAILABLE_BADGES.find(
    b => b.id === userProgress.equipped_badge
  )
  
  return (
    <div className="user-dashboard">
      {/* Header with badge */}
      <div className="profile-header">
        <div className="user-info">
          <h1>{userName}</h1>
          {equippedBadge && (
            <BadgeDisplay badge={equippedBadge} size="lg" equipped />
          )}
        </div>
      </div>
      
      {/* Rest of dashboard */}
    </div>
  )
}
```

---

## 🖼️ PART 3: CUSTOM PROFILE BANNER (Day 2-3)

**Goal:** Users can upload custom banners that display in their profile/dashboard

### **TOKEN 3.1: Supabase Storage Setup** 🗄️
**Time:** 30 minutes  
**Files:** `/supabase/functions/server/index.tsx`

**Tasks:**
- [x] Create `make-053bcd80-profile-banners` bucket on startup
- [x] Set bucket to private (signed URLs only)
- [x] Configure bucket policies
- [x] Test file upload/retrieval

**Server Startup Code:**

```typescript
// In server index.tsx - startup function
async function initializeStorage() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )
  
  const bucketName = 'make-053bcd80-profile-banners'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 5242880 // 5MB
    })
    console.log('✅ Created profile banners bucket')
  }
}

// Call on server start
initializeStorage()
```

---

### **TOKEN 3.2: Banner Upload API** 🔌
**Time:** 45 minutes  
**Files:** `/supabase/functions/server/index.tsx`

**Tasks:**
- [x] Create `POST /upload-profile-banner` route
- [x] Validate image (type, size, dimensions)
- [x] Upload to Supabase Storage
- [x] Store banner URL in user profile
- [x] Create `GET /profile-banner/:userId` route for signed URLs

**API Routes:**

```typescript
// POST /make-server-053bcd80/upload-profile-banner
app.post('/make-server-053bcd80/upload-profile-banner', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  // Check if user owns custom banner item
  const ownedItems = await kv.getByPrefix(`swag_item:${user.id}:`)
  const ownsBanner = ownedItems.some(item => item.item_id === 'custom-profile-banner')
  
  if (!ownsBanner) {
    return c.json({ error: 'Purchase Custom Profile Banner in Swag Shop first!' }, 403)
  }
  
  // Get file from form data
  const formData = await c.req.formData()
  const file = formData.get('banner') as File
  
  // Validate
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'File must be an image' }, 400)
  }
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'File must be under 5MB' }, 400)
  }
  
  // Upload to storage
  const fileName = `${user.id}-${Date.now()}.${file.type.split('/')[1]}`
  const { data, error } = await supabase.storage
    .from('make-053bcd80-profile-banners')
    .upload(fileName, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: true
    })
  
  if (error) {
    return c.json({ error: 'Upload failed' }, 500)
  }
  
  // Save to user profile
  const userKey = `user:${user.id}`
  const userData = await kv.get(userKey)
  await kv.set(userKey, {
    ...userData,
    profile_banner_path: fileName
  })
  
  return c.json({ success: true, fileName })
})

// GET /make-server-053bcd80/profile-banner/:userId
app.get('/make-server-053bcd80/profile-banner/:userId', async (c) => {
  const userId = c.req.param('userId')
  const userData = await kv.get(`user:${userId}`)
  
  if (!userData?.profile_banner_path) {
    return c.json({ bannerUrl: null })
  }
  
  // Generate signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from('make-053bcd80-profile-banners')
    .createSignedUrl(userData.profile_banner_path, 3600)
  
  if (error) {
    return c.json({ bannerUrl: null })
  }
  
  return c.json({ bannerUrl: data.signedUrl })
})
```

---

### **TOKEN 3.3: Banner Upload UI** 🎨
**Time:** 45 minutes  
**Files:** NEW `/components/ProfileBannerUpload.tsx`

**Tasks:**
- [x] Create banner upload component
- [x] Drag & drop support
- [x] Image preview before upload
- [x] Crop/resize functionality (optional)
- [x] Upload progress indicator
- [x] Success/error messages

**Component:**

```tsx
export function ProfileBannerUpload({ userId, onUploadComplete }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  async function handleUpload(file: File) {
    setUploading(true)
    
    const formData = new FormData()
    formData.append('banner', file)
    
    try {
      const response = await fetch(`${serverUrl}/upload-profile-banner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Banner uploaded successfully! 🎉')
        onUploadComplete()
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="banner-upload">
      <div className="upload-zone" {...getRootProps()}>
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="placeholder">
            <Upload className="icon" />
            <p>Drop banner image here or click to browse</p>
            <p className="hint">Recommended: 1200x400px, max 5MB</p>
          </div>
        )}
      </div>
      
      {uploading && <ProgressBar />}
      
      <Button onClick={() => handleUpload(selectedFile)}>
        Upload Banner
      </Button>
    </div>
  )
}
```

---

### **TOKEN 3.4: Banner Display Integration** 🖼️
**Time:** 30 minutes  
**Files:** `/components/UserDashboard.tsx`

**Tasks:**
- [x] Fetch banner URL on dashboard load
- [x] Display banner at top of dashboard
- [x] Fallback to default gradient if no banner
- [x] Add "Change Banner" button for owners

**Integration:**

```tsx
export function UserDashboard({ userId }) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  
  useEffect(() => {
    fetchBanner()
  }, [userId])
  
  async function fetchBanner() {
    const response = await fetch(`${serverUrl}/profile-banner/${userId}`)
    const data = await response.json()
    setBannerUrl(data.bannerUrl)
  }
  
  return (
    <div className="user-dashboard">
      {/* Banner Header */}
      <div 
        className="profile-banner"
        style={{
          backgroundImage: bannerUrl 
            ? `url(${bannerUrl})`
            : 'linear-gradient(to right, var(--background-start), var(--background-end))'
        }}
      >
        {/* User info overlay */}
      </div>
      
      {/* Rest of dashboard */}
    </div>
  )
}
```

---

## ✅ TESTING CHECKLIST

### Theme System
- [ ] User can see owned themes in Account Settings
- [ ] Locked themes show purchase prompt
- [ ] Selected theme applies immediately
- [ ] Theme persists after refresh
- [ ] All 3 themes render correctly (Solarpunk, Midnight, Golden Hour)
- [ ] Theme variables cascade throughout app

### Badge System
- [ ] User can view badge collection
- [ ] Owned badges are unlocked, unowned are locked
- [ ] User can equip/unequip badge
- [ ] Equipped badge shows in User Dashboard
- [ ] Badge persists after refresh
- [ ] Badge rarity colors display correctly

### Profile Banner
- [ ] User with purchased banner can upload
- [ ] User without banner sees locked state
- [ ] Image validation works (type, size)
- [ ] Upload progress indicator shows
- [ ] Banner displays in User Dashboard
- [ ] Banner URL is signed and private
- [ ] Fallback gradient works for users without banner

---

## 📦 DELIVERABLES

### New Files Created
- `/components/ThemeSelector.tsx` - Theme selection UI
- `/components/BadgeDisplay.tsx` - Single badge render
- `/components/BadgeCollection.tsx` - Badge grid
- `/components/ProfileBannerUpload.tsx` - Banner upload UI
- `/DIGITAL_ITEMS_ACTIVATION_ROADMAP.md` - This file

### Modified Files
- `/App.tsx` - Theme loading & application
- `/styles/globals.css` - Theme CSS variables
- `/components/AccountSettings.tsx` - Theme/badge/banner sections
- `/components/UserDashboard.tsx` - Badge & banner display
- `/supabase/functions/server/index.tsx` - 5 new routes

### API Routes Added
- `GET /user-selected-theme/:userId` - Get current theme
- `POST /update-user-theme` - Save theme selection
- `POST /equip-badge` - Equip badge
- `POST /upload-profile-banner` - Upload banner
- `GET /profile-banner/:userId` - Get signed banner URL

---

## 🎯 SUCCESS METRICS

### User Engagement
- ✅ Users can activate all purchased items
- ✅ Theme changes apply instantly
- ✅ Badges display prominently
- ✅ Banners personalize profiles

### Technical Quality
- ✅ 0 errors in activation flow
- ✅ Images load < 2 seconds
- ✅ Theme switching < 100ms
- ✅ Proper ownership validation

### Business Impact
- ✅ Purchased items provide value
- ✅ Users see their NADA points working
- ✅ Increased perceived value of Swag Shop

---

## 🚀 NEXT STEPS AFTER COMPLETION

Once digital items are activated:

1. **Monitor Usage Analytics**
   - Track theme adoption rates
   - Track badge equip rates
   - Track banner upload rates

2. **Gather User Feedback**
   - Which themes are most popular?
   - Do users want more badge slots?
   - Do banners need better cropping tools?

3. **Plan Phase 2 Digital Items**
   - Animated themes
   - Profile borders/frames
   - Custom emoji reactions
   - Achievement badges (auto-earned)

4. **Move to Organization Features**
   - Organization Members Tab
   - Organization Publications Tab
   - Organization Analytics Dashboard

---

## 📊 IMPLEMENTATION ORDER

### **Day 1: Theme System** (2-3 hours)
1. ✅ TOKEN 1.1: Define CSS variables (30 min)
2. ✅ TOKEN 1.2: Backend storage (20 min)
3. ✅ TOKEN 1.3: Theme selector UI (45 min)
4. ✅ TOKEN 1.4: Global application (30 min)
5. ✅ Test theme switching (30 min)

### **Day 2: Badge System** (2-3 hours)
1. ✅ TOKEN 2.1: Badge components (45 min)
2. ✅ TOKEN 2.2: Backend storage (15 min)
3. ✅ TOKEN 2.3: UI integration (45 min)
4. ✅ Test badge display (30 min)

### **Day 2-3: Profile Banners** (2.5-3 hours)
1. ✅ TOKEN 3.1: Storage setup (30 min)
2. ✅ TOKEN 3.2: Upload API (45 min)
3. ✅ TOKEN 3.3: Upload UI (45 min)
4. ✅ TOKEN 3.4: Display integration (30 min)
5. ✅ Test banner upload (30 min)

---

## 🔥 LET'S GO!

**Total Time:** 2-3 days  
**Immediate Impact:** Users see value from their purchases  
**Business Value:** Increases Swag Shop appeal  

Ready to start? 🚀

**Recommendation:** Start with Theme System (Day 1) since it's the most visible change and users have already purchased Midnight Hemp!
