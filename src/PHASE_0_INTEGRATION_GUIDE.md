# 🚀 Phase 0 Integration Guide

## ✅ Completed Components

All the following components have been created:

### Core Components
- ✅ `/components/MEButtonDrawer.tsx` - Slide-up drawer menu
- ✅ `/components/UserProfile.tsx` - Main profile page
- ✅ `/components/profile/ProfileHeader.tsx` - Avatar, trust score, roles
- ✅ `/components/profile/ProfileStats.tsx` - Stats cards
- ✅ `/components/profile/ProfileTabs.tsx` - Tab navigation
- ✅ `/components/profile/EditProfileModal.tsx` - Profile editing
- ✅ `/components/profile/TrustScoreBadge.tsx` - Custom SVG badge
- ✅ `/components/profile/RolePill.tsx` - Role display
- ✅ `/components/profile/CountryFlag.tsx` - Country flags
- ✅ `/components/BottomNavbar.tsx` - Updated with ME drawer trigger

### Database
- ✅ Phase 0 schema successfully run
- ✅ `user_profiles` enhanced with new columns
- ✅ `user_roles` table created
- ✅ `user_interests` table created
- ✅ `user_saved_items` table created
- ✅ RLS policies configured

## 📋 Integration Steps

### Step 1: Create Avatar Storage Bucket

Go to **Supabase Dashboard → Storage**:
1. Click "New bucket"
2. Name: `avatars`
3. Public: ✅ Yes
4. File size limit: 2MB
5. Click "Create"

### Step 2: Add Imports to App.tsx

Add these imports at the top of `/App.tsx`:

```typescript
import { MEButtonDrawer } from './components/MEButtonDrawer'
import { UserProfile } from './components/UserProfile'
```

### Step 3: Add State Variables

Add these state variables in the App component (around line 83):

```typescript
const [meDrawerOpen, setMEDrawerOpen] = useState(false)
const [displayName, setDisplayName] = useState<string>('')
const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
```

### Step 4: Load User Profile Data

Add this function after the other fetch functions:

```typescript
async function loadUserProfile() {
  if (!userId) return
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single()
    
    if (data) {
      setDisplayName(data.display_name || userEmail?.split('@')[0] || 'User')
      setAvatarUrl(data.avatar_url)
    }
  } catch (err) {
    console.error('Error loading user profile:', err)
  }
}
```

### Step 5: Call loadUserProfile

Add this useEffect to load profile when user logs in:

```typescript
useEffect(() => {
  if (userId) {
    loadUserProfile()
  }
}, [userId])
```

### Step 6: Update BottomNavbar

Find the `<BottomNavbar />` component (around line 1584) and add the `onMEButtonClick` prop:

```typescript
<BottomNavbar
  currentView={currentView}
  onNavigate={setCurrentView}
  isAuthenticated={isAuthenticated}
  totalArticlesRead={userProgress?.totalArticlesRead || 0}
  onFeatureUnlock={handleFeatureUnlock}
  closeWallet={closeWallet}
  onMEButtonClick={() => setMEDrawerOpen(true)} // Add this line
/>
```

### Step 7: Add MEButtonDrawer Component

Add this right after the `<BottomNavbar />` component (before the closing tag):

```typescript
{/* ME Button Drawer */}
{isAuthenticated && userId && (
  <MEButtonDrawer
    isOpen={meDrawerOpen}
    onClose={() => setMEDrawerOpen(false)}
    userId={userId}
    displayName={displayName}
    avatarUrl={avatarUrl}
  />
)}
```

### Step 8: Add Profile Route (Optional Future Enhancement)

For now, the ME drawer handles navigation. In the future, when user clicks "My Profile" in the drawer, it can navigate to a full profile page.

To support this, you could:
1. Add `'profile'` to the `currentView` type
2. Add a condition in the main content render to show `<UserProfile />`
3. Update MEButtonDrawer to call `navigate('/profile')` or `onNavigate('profile')`

But for Phase 0, the drawer is sufficient!

## 🎨 Testing Checklist

### ME Drawer
- [ ] Click ME button in bottom navbar
- [ ] Drawer slides up smoothly from bottom
- [ ] Shows avatar (or gradient with initials if no avatar)
- [ ] Shows display name
- [ ] Menu items visible with gradients
- [ ] Close by clicking backdrop
- [ ] Close by clicking X button
- [ ] Close by clicking handle bar

### Profile Page (via "My Profile" link)
- [ ] Opens profile page
- [ ] Shows header with avatar
- [ ] Shows location (if set)
- [ ] Shows roles (if set)
- [ ] Shows trust score badge (with custom SVG icon)
- [ ] Shows stats cards (power points, NADA, days active, swaps)
- [ ] Tabs visible (Overview, Inventory [Soon], Activity [Soon])
- [ ] "Edit Profile" button visible (own profile only)

### Edit Profile Modal
- [ ] Click "Edit Profile" button
- [ ] Modal opens
- [ ] Avatar preview visible
- [ ] Can change avatar (upload button works)
- [ ] Can edit display name
- [ ] Can edit bio (500 char limit)
- [ ] Can set country, region, city
- [ ] Can select multiple roles (checkboxes work)
- [ ] Can select multiple interests (checkboxes work)
- [ ] Professional info section collapses/expands
- [ ] Save button disabled while saving
- [ ] Shows success toast on save
- [ ] Modal closes after save
- [ ] Profile page refreshes with new data

### Data Persistence
- [ ] Profile changes saved to Supabase
- [ ] Avatar uploads to Storage bucket
- [ ] Roles saved to `user_roles` table
- [ ] Interests saved to `user_interests` table
- [ ] Trust score displays correctly (0 for new users)
- [ ] Location displays with country flag (no emoji)
- [ ] Roles display as colored pills

## 🐛 Common Issues & Solutions

### Issue: "avatars bucket does not exist"
**Solution:** Create the avatars bucket in Supabase Dashboard → Storage

### Issue: Avatar upload fails
**Solution:** Check RLS policies on avatars bucket. Users should be able to upload their own avatars.

### Issue: Trust score shows NaN or undefined
**Solution:** Make sure `trust_score` column has DEFAULT 0 in the database

### Issue: Country flag shows as text instead of visual
**Solution:** This is expected for Phase 0. We're showing country code in a styled pill. Full flag SVGs can be added later.

### Issue: ME drawer doesn't open
**Solution:** Check that `onMEButtonClick` prop is passed to BottomNavbar and state is being updated

### Issue: Profile page shows "Profile not found"
**Solution:** Make sure user_profiles row exists for the logged-in user

## 🚀 Next Steps (Phase 1)

After Phase 0 is complete and tested:

1. **Messaging System V0.1**
   - Create threads table
   - Build inbox UI
   - Message composer

2. **Discovery Match V1**
   - Request form
   - Admin dashboard
   - Match notifications

3. **Then Phase 1: SWAP**
   - User inventory
   - Swap listings
   - Proposals

## 📝 Notes

- Trust score starts at 0 for all users (will increase with activity)
- Swaps completed is 0 for now (Phase 1 feature)
- Inventory tab shows "Soon" badge (Phase 1 feature)
- Activity tab shows "Soon" badge (Phase 1-2 feature)
- Professional info is optional (for RFP/Discovery Match features)

---

**Created:** December 6, 2024  
**Status:** 🟢 Ready to Integrate  
**Estimated Time:** 30-45 minutes

Let's integrate and test! 🌿🚀
