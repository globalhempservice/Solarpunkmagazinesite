# ⚡ Phase 0: Quick Start Guide

## 🎯 You Are Here
✅ SQL schema run  
✅ All components created  
⏭️ **Next: 10-minute integration**

---

## 🚀 Integration (Copy & Paste)

### 1. Create Avatars Bucket (Supabase Dashboard)
- Go to Storage → New bucket
- Name: `avatars`, Public: ✅ Yes
- Click Create

### 2. Add to App.tsx (Top, with other imports)
```typescript
import { MEButtonDrawer } from './components/MEButtonDrawer'
import { UserProfile } from './components/UserProfile'
```

### 3. Add State (Around line 83, with other useState)
```typescript
const [meDrawerOpen, setMEDrawerOpen] = useState(false)
const [displayName, setDisplayName] = useState<string>('')
const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
```

### 4. Add Function (After other fetch functions)
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

### 5. Add useEffect (With other useEffects)
```typescript
useEffect(() => {
  if (userId) {
    loadUserProfile()
  }
}, [userId])
```

### 6. Update BottomNavbar (Around line 1584)
Find:
```typescript
<BottomNavbar
  currentView={currentView}
  onNavigate={setCurrentView}
  isAuthenticated={isAuthenticated}
  totalArticlesRead={userProgress?.totalArticlesRead || 0}
  onFeatureUnlock={handleFeatureUnlock}
  closeWallet={closeWallet}
/>
```

Change to:
```typescript
<BottomNavbar
  currentView={currentView}
  onNavigate={setCurrentView}
  isAuthenticated={isAuthenticated}
  totalArticlesRead={userProgress?.totalArticlesRead || 0}
  onFeatureUnlock={handleFeatureUnlock}
  closeWallet={closeWallet}
  onMEButtonClick={() => setMEDrawerOpen(true)}
/>
```

### 7. Add MEButtonDrawer (Right after BottomNavbar)
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

---

## ✅ Done!

Now test:
1. Click ME button → Drawer slides up
2. Click "My Profile" → Profile page loads
3. Click "Edit Profile" → Edit modal opens
4. Change avatar, bio, roles, interests
5. Click "Save" → Changes persist

---

## 📁 Files Created

**Components (10):**
- `/components/MEButtonDrawer.tsx`
- `/components/UserProfile.tsx`
- `/components/profile/ProfileHeader.tsx`
- `/components/profile/ProfileStats.tsx`
- `/components/profile/ProfileTabs.tsx`
- `/components/profile/EditProfileModal.tsx`
- `/components/profile/TrustScoreBadge.tsx`
- `/components/profile/RolePill.tsx`
- `/components/profile/CountryFlag.tsx`
- `/components/BottomNavbar.tsx` (updated)

**Database:**
- `/database_schemas/phase_0_user_profile_schema.sql` (already run ✅)

**Docs:**
- `/PHASE_0_USER_PROFILE_PLAN.md` (detailed plan)
- `/PHASE_0_INTEGRATION_GUIDE.md` (step-by-step guide)
- `/PHASE_0_COMPLETE.md` (summary)
- `/PHASE_0_QUICK_START.md` (this file)

---

## 🎨 Features

✅ NO EMOJIS (custom SVG icons only)  
✅ PlayStation-style ME drawer  
✅ Enhanced user profiles  
✅ Avatar upload  
✅ Role & interest selection  
✅ Trust score system  
✅ Mobile responsive  
✅ Solarpunk aesthetic  

---

## 🚀 After Integration

Test checklist:
- [ ] ME drawer slides up
- [ ] Profile page loads
- [ ] Avatar upload works
- [ ] Roles save correctly
- [ ] Location displays with flag
- [ ] Trust score badge shows
- [ ] Mobile responsive

Then proceed to Phase 1:
- Messaging System
- Discovery Match
- SWAP inventory

---

**Ready to integrate! 🌿✨**
