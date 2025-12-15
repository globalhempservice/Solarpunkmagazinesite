# 🔄 Migrate Old Dashboard Features - Action Plan

## 📋 Overview

The old `UserDashboard` component has valuable features that should be migrated to the new `UserProfile` system. This document outlines what to migrate and where.

---

## 🎯 Features to Migrate

### **1. Article Management Section** 📝

**Current Location**: `UserDashboard.tsx` lines ~600-800

**What it has**:
- List of user's created articles
- Edit button (pencil icon) → Opens ArticleEditor
- Delete button (trash icon) → Confirms & deletes
- View count per article
- Article metadata (date, category, reading time)

**Where to migrate**: 
`/components/profile/ProfileTabs.tsx` → Add new "My Articles" tab

**Implementation**:
```tsx
// Add to tabs array (line 22-40)
{
  id: 'articles',
  label: 'My Articles',
  icon: Edit3, // or BookOpen, or FileText
  // Only show for own profile
}

// Add tab content (line 88+)
{activeTab === 'articles' && isOwnProfile && (
  <div className="space-y-4">
    {/* Article list here */}
    {userArticles.map(article => (
      <ArticleCard 
        key={article.id}
        article={article}
        showActions={true}
        onEdit={() => {/* open editor */}}
        onDelete={() => {/* confirm & delete */}}
      />
    ))}
  </div>
)}
```

**Props to add to ProfileTabs**:
```tsx
interface ProfileTabsProps {
  // ... existing props
  userArticles?: Article[]
  onEditArticle?: (article: Article) => void
  onDeleteArticle?: (articleId: string) => void
}
```

**Props to add to UserProfile**:
```tsx
interface UserProfileProps {
  // ... existing props
  userArticles?: Article[]
  onEditArticle?: (article: Article) => void
  onDeleteArticle?: (articleId: string) => void
}
```

**Props to add to MEButtonDrawer** (if articles in drawer):
Pass through from App.tsx when opening profile

---

### **2. Enhanced Level Display** 🎮

**Current Location**: `UserDashboard.tsx` lines 141-500

**What it has**:
- XP calculation system (articles × 50 + achievements × 100)
- Level titles (Knowledge Seeker, Expert Explorer, Master Reader, etc.)
- Animated level badges with gradient backgrounds
- Dynamic icons per level tier (Book, BookOpen, Compass, Medal, Crown, etc.)
- Rotating glow rings
- Floating particles
- Level progress bar
- XP to next level display
- Sparkle effects

**Where to migrate**:
`/components/profile/ProfileStats.tsx` → Enhance existing stats OR
`/components/profile/LevelCard.tsx` → Create new component

**Implementation Option 1** - Enhance ProfileStats:
```tsx
// Add to ProfileStats.tsx
<div className="col-span-full">
  <LevelProgressCard
    level={calculateLevel(userProgress)}
    xp={calculateXP(userProgress)}
    nextLevelXP={calculateNextLevelXP(userProgress)}
    levelTitle={getLevelTitle(level)}
    levelConfig={getLevelConfig(level)}
  />
</div>
```

**Implementation Option 2** - Add to Overview tab:
```tsx
// In ProfileTabs.tsx, Overview tab content
{activeTab === 'overview' && (
  <div className="space-y-6">
    {/* Level Card - Hero Badge */}
    <LevelDisplay 
      userProgress={userProgress}
      showAnimations={true}
    />
    
    {/* Existing stats */}
    <ReadingStatsCards />
    
    {/* Achievements */}
    <AchievementsSection />
  </div>
)}
```

**New Component**: `/components/profile/LevelDisplay.tsx`
- Copy level calculation logic
- Copy level config system (icons, colors, gradients)
- Copy animated badge rendering
- Simplify for modal context (maybe less particles)

---

### **3. Settings & Preferences** ⚙️

**Current Location**: `UserDashboard.tsx` lines 125-150

**What it has**:
- Password change form
  - Current password input (with show/hide toggle)
  - New password input (with show/hide toggle)
  - Confirm password input (with show/hide toggle)
  - Change button with loading state
  - Success/error messages
- Marketing newsletter toggle

**Where to migrate**:
`/components/profile/ProfileTabs.tsx` → Settings tab content

**Implementation**:
```tsx
{activeTab === 'settings' && isOwnProfile && (
  <div className="space-y-6">
    {/* Password Section */}
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <PasswordChangeForm />
      </CardContent>
    </Card>

    {/* Preferences Section */}
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and content
              </p>
            </div>
            <Switch 
              checked={marketingOptIn}
              onCheckedChange={handleToggleMarketing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Market Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about SWAP matches and SWAG drops
              </p>
            </div>
            <Switch 
              checked={marketNewsletterOptIn}
              onCheckedChange={handleToggleMarketNews}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

**New Component**: `/components/profile/PasswordChangeForm.tsx`
- Extract from UserDashboard
- Use existing pattern with show/hide toggles
- Call Supabase auth.updateUser()

---

### **4. Profile Banner Display** 🎨

**Current Location**: `UserDashboard.tsx` lines ~380-447

**What it has**:
- Large banner image at top
- Gradient overlay
- User info overlay (name, email, stats pills)
- Equipped badge display at bottom-right of avatar
- Level badge on avatar
- Stats pills (XP, articles, streak)

**Where to migrate**:
✅ **Already migrated!** → `/components/profile/ProfileHeader.tsx`

**Current implementation**:
- Banner from `user_profiles.banner_url` OR `user_progress.profileBannerUrl`
- Gradient overlay ✅
- Avatar display ✅
- Name and bio ✅
- Trust badges ✅
- Role pills ✅

**What's missing**:
- Equipped badge overlay on avatar (add to ProfileHeader)
- Stats pills in banner (could add or keep in ProfileStats)

---

## 🗂️ New File Structure After Migration

```
/components/profile/
├── ProfileHeader.tsx          ✅ Already exists
├── ProfileStats.tsx           ✅ Already exists
├── ProfileTabs.tsx            ✅ Already exists (enhance)
├── EditProfileModal.tsx       ✅ Already exists
├── LevelDisplay.tsx           🆕 Create for level badge
├── ArticleManagement.tsx      🆕 Create for My Articles tab
├── PasswordChangeForm.tsx     🆕 Extract from UserDashboard
└── SettingsPanel.tsx          🆕 Create for Settings tab
```

---

## 📦 Prop Flow After Migration

```
App.tsx
  └─ MEButtonDrawer
      └─ UserProfile
          ├─ ProfileHeader (banner, avatar, name, bio)
          ├─ ProfileStats (power points, NADA, days, swaps)
          └─ ProfileTabs
              ├─ Overview Tab
              │   ├─ LevelDisplay (XP, level badge)
              │   ├─ ReadingStats (articles, streak)
              │   └─ Achievements
              ├─ My Articles Tab
              │   └─ ArticleManagement (list, edit, delete)
              ├─ Inventory Tab (Phase 1)
              ├─ Activity Tab (Phase 1)
              └─ Settings Tab
                  ├─ PasswordChangeForm
                  ├─ EmailPreferences
                  └─ PrivacySettings
```

---

## 🚀 Migration Checklist

### **Phase 1A - Immediate (Critical)**
- [ ] Add "My Articles" tab to ProfileTabs
- [ ] Pass `userArticles` prop through chain
- [ ] Add edit/delete handlers
- [ ] Test article management in drawer

### **Phase 1B - Important (This Week)**
- [ ] Create LevelDisplay component
- [ ] Add to Overview tab
- [ ] Port level calculation logic
- [ ] Add animated badge rendering
- [ ] Test level progression

### **Phase 1C - Nice to Have (Next Sprint)**
- [ ] Enhance Settings tab
- [ ] Add PasswordChangeForm
- [ ] Add email preferences toggles
- [ ] Test password change flow

### **Phase 1D - Cleanup (After Full Migration)**
- [ ] Update all "back to dashboard" routes → "back to feed"
- [ ] Remove UserDashboard render block from App.tsx
- [ ] Archive UserDashboard.tsx
- [ ] Remove 'dashboard' from currentView type
- [ ] Update BottomNavbar types
- [ ] Test all navigation flows

---

## 🎯 Quick Wins (Do These First!)

### **1. Add "My Articles" Tab** (30 minutes)
This is the most important feature from old dashboard.

**Steps**:
1. Add tab to ProfileTabs.tsx
2. Pass userArticles prop from UserProfile → ProfileTabs
3. Pass userArticles from MEButtonDrawer → UserProfile
4. Fetch userArticles in App.tsx when opening ME drawer
5. Display article cards with edit/delete buttons

### **2. Port Level Badge to Overview** (1 hour)
Users love the level progression!

**Steps**:
1. Create `/components/profile/LevelDisplay.tsx`
2. Copy level calculation functions from UserDashboard
3. Copy level config (icons, colors) from UserDashboard
4. Simplify animations for modal context
5. Add to ProfileTabs Overview section
6. Test with different level values

### **3. Move Settings Content** (45 minutes)
Complete the Settings tab.

**Steps**:
1. Create `/components/profile/PasswordChangeForm.tsx`
2. Extract password change logic from UserDashboard
3. Add to ProfileTabs Settings tab
4. Add email preference toggles
5. Test password change flow

---

## 💡 Design Considerations

### **Drawer Context**
The new profile is shown in a drawer/modal, so:
- ✅ Use vertical scroll (drawer is full-height)
- ✅ Simplify animations (less CPU usage)
- ✅ Reduce particle effects (fewer floating elements)
- ✅ Maintain gradients and colors (brand consistency)
- ✅ Keep interactive elements large (touch-friendly)

### **Data Loading**
The old dashboard had direct access to App.tsx state. The new profile needs:
- ✅ Props passed through MEButtonDrawer
- ✅ Fresh data fetch when drawer opens
- ✅ Loading states for each section
- ✅ Error handling for failed fetches

### **Responsive Design**
The drawer should work on all screen sizes:
- ✅ Mobile: Full-screen drawer (like native app)
- ✅ Tablet: 80% width drawer with blur behind
- ✅ Desktop: 600px max-width drawer, centered

---

## 🎨 Visual Consistency

Keep the design language consistent:

| Element | Old Dashboard | New Profile | Status |
|---------|---------------|-------------|--------|
| **Gradients** | Purple/Pink hero | Sky/Purple/Pink | ✅ Match |
| **Borders** | Rounded-3xl cards | Rounded-xl cards | ✅ Match |
| **Typography** | Bold headlines | Font from globals.css | ✅ Match |
| **Icons** | Lucide icons | Lucide icons | ✅ Match |
| **Spacing** | p-8 cards | p-6 cards | ✅ Adjusted for drawer |
| **Animations** | Lots of motion | Subtle motion | ✅ Simplified |

---

## 📚 Reference Code Locations

If you need to copy code from the old dashboard:

- **Level Calculation**: Lines 141-236
- **Level Config**: Lines 239-356
- **Banner Section**: Lines 380-447
- **Level Card**: Lines 450-540
- **Article Management**: Lines 600-800
- **Password Form**: Lines 125-150 + password change handler

---

## ✅ Success Criteria

After migration is complete:

1. ✅ All old dashboard features available in new profile
2. ✅ No loss of functionality
3. ✅ Better UX (overlay instead of page navigation)
4. ✅ Faster access (drawer opens instantly)
5. ✅ Cleaner code (separated concerns)
6. ✅ Old UserDashboard archived (not deleted)
7. ✅ All tests passing
8. ✅ User feedback positive

---

## 🎉 Benefits After Migration

### **For Users**:
- ✅ Access profile from anywhere without losing context
- ✅ Faster profile loading (drawer vs full page)
- ✅ All features in one place
- ✅ Better mobile experience (native app feel)
- ✅ Cleaner navigation (no back-and-forth)

### **For Development**:
- ✅ Single source of truth for profile UI
- ✅ Easier to maintain (one component set)
- ✅ Better TypeScript types (clear prop flow)
- ✅ Reusable profile components
- ✅ Consistent design system

### **For Phase 1**:
- ✅ Ready for SWAP inventory integration
- ✅ Ready for activity feed
- ✅ Ready for badge collections
- ✅ Ready for organization profiles
- ✅ Scalable architecture

---

## 🚀 Let's Go!

Start with the Quick Wins, then work through Phase 1A → 1B → 1C → 1D.

The migration will give you a modern, scalable profile system that's ready for Phase 1 marketplace features! 💪

**Questions? Check the reference code in `/components/UserDashboard.tsx`** 
**Need help? Ping in Discord!** 🎮
