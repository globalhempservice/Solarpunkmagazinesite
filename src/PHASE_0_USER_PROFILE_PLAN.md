# 🚀 Phase 0: User Profile Redesign - Action Plan

**Date:** December 6, 2024  
**Sprint:** Foundation (Week 1-2)  
**Focus:** User Profile V1.5 + ME Button Redesign

---

## ✅ STEP 1: RUN DATABASE SCHEMA FIRST

### **YES - Run the SQL Schema Now**

You have a real Supabase deployment, so you should run `/database_schemas/three_rails_schema.sql` in Supabase SQL Editor.

**What it will add:**
- ✅ User profile enhancements (avatar, bio, location, trust_score)
- ✅ `user_roles` table (consumer, professional, etc.)
- ✅ `user_interests` table (textiles, food, etc.)
- ✅ `user_saved_items` table (favorites)
- ✅ Future tables for SWAP, messaging, etc. (ready when you need them)

**How to run it:**
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents from `/database_schemas/three_rails_schema.sql`
4. Run query
5. Verify tables created

**Note:** The schema includes many tables for future features (SWAP, messaging, RFP). They won't hurt anything sitting there empty - we'll populate them in later phases.

---

## 📋 STEP 2: CURRENT STATE ANALYSIS

### **What You Have Now:**

**ME Button (Bottom Navbar):**
- Current location: Bottom navigation bar
- Current functionality: Opens user menu/profile
- Current issue: Inconsistent with ME Market / ME Mag buttons
- Needs: Unified UX across entire app

**User Profile (Current):**
```typescript
// From user_profiles table
{
  id: UUID
  email: string
  display_name: string
  power_points: number
  nada_balance: number
  achievements: JSON
  reading_history: JSON
  created_at: timestamp
}
```

### **What You Need:**

**Enhanced User Profile:**
```typescript
{
  // Existing fields (keep)
  id, email, display_name, power_points, nada_balance, achievements
  
  // NEW FIELDS (from schema)
  avatar_url: string | null
  banner_url: string | null (future)
  bio: string | null
  country: string | null  // ISO code
  region: string | null
  city: string | null
  phone_verified: boolean
  id_verified: boolean
  trust_score: number (default 0)
  professional_bio: string | null
  looking_for: string | null
  can_offer: string | null
  
  // NEW RELATED TABLES
  roles: user_roles[] (consumer, professional, etc.)
  interests: user_interests[] (textiles, food, etc.)
  saved_items: user_saved_items[]
}
```

---

## 🎯 STEP 3: DESIGN FOCUS FOR PHASE 0

### **What to Build This Week:**

#### **Priority 1: Enhanced Profile Page**
- ✅ Avatar upload & display
- ✅ Bio section
- ✅ Location display (city, country flag)
- ✅ Roles display (pills/chips)
- ✅ Trust score badge
- ✅ Stats cards (swaps, orgs supported, days on platform)

#### **Priority 2: Profile Edit Modal/Page**
- ✅ Avatar upload
- ✅ Display name edit
- ✅ Bio textarea (500 chars)
- ✅ Country dropdown
- ✅ Region/city inputs
- ✅ Roles multi-select
- ✅ Interests multi-select
- ✅ Privacy settings

#### **Priority 3: ME Button Redesign**
- ✅ Unified navigation experience
- ✅ Consistent with ME Market / ME Mag
- ✅ Quick access to profile, settings, logout

---

## 🎨 STEP 4: UX/UI CONSIDERATIONS

### **ME Button Navigation Strategy:**

**Option A: Unified Drawer/Menu**
```
ME Button → Opens side drawer with:
├─ Profile (new enhanced view)
├─ Settings
├─ My Organizations
├─ My Inventory (future SWAP)
├─ Messages (future)
├─ Logout
```

**Option B: Direct to Profile**
```
ME Button → Goes directly to profile page
Profile page has tabs:
├─ Overview (stats, badges)
├─ Inventory (future)
├─ Activity (future)
├─ Settings
```

**Option C: Context Menu**
```
ME Button → Small popup menu:
├─ View Profile
├─ Edit Profile
├─ Settings
├─ Organizations
├─ Logout
```

**Recommendation:** Start with **Option C** (simple menu) for Phase 0, evolve to Option A when messaging/inventory is added.

---

## 🛠️ STEP 5: IMPLEMENTATION CHECKLIST

### **Backend (Supabase):**
- [ ] Run `/database_schemas/three_rails_schema.sql`
- [ ] Verify tables created:
  - [ ] `user_profiles` columns added
  - [ ] `user_roles` table exists
  - [ ] `user_interests` table exists
  - [ ] `user_saved_items` table exists
- [ ] Test RLS policies working
- [ ] Create storage bucket for avatars (if not exists)

### **API Routes (if needed):**
- [ ] `GET /api/profile/:userId` - Fetch user profile
- [ ] `PUT /api/profile` - Update profile
- [ ] `POST /api/profile/avatar` - Upload avatar
- [ ] `GET /api/profile/roles` - Get user roles
- [ ] `PUT /api/profile/roles` - Update roles
- [ ] `GET /api/profile/interests` - Get interests
- [ ] `PUT /api/profile/interests` - Update interests

**OR** use Supabase client directly (simpler for Phase 0):
```typescript
// Direct Supabase queries
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*, user_roles(*), user_interests(*)')
  .eq('id', userId)
  .single()
```

### **Frontend Components:**

**New Components to Create:**
- [ ] `<UserProfile />` - Main profile page
- [ ] `<ProfileHeader />` - Banner, avatar, name, trust score
- [ ] `<ProfileStats />` - Stats cards
- [ ] `<ProfileBio />` - Bio section
- [ ] `<ProfileRoles />` - Role pills/chips
- [ ] `<EditProfileModal />` - Edit form
- [ ] `<AvatarUpload />` - Upload component
- [ ] `<RoleSelector />` - Multi-select for roles
- [ ] `<InterestSelector />` - Multi-select for interests
- [ ] `<TrustScoreBadge />` - Display trust score
- [ ] `<MEButtonMenu />` - New ME button menu

**Components to Update:**
- [ ] `<BottomNavbar />` - Update ME button behavior
- [ ] `<TopNavbar />` - Ensure consistency (if applicable)

---

## 📊 STEP 6: DATA FLOW

### **Profile View Flow:**
```
User clicks ME button
  ↓
Menu opens with "View Profile" option
  ↓
Navigate to /profile or /profile/:userId
  ↓
Fetch profile data from Supabase:
  - user_profiles (with new fields)
  - user_roles
  - user_interests
  - user_saved_items (future)
  ↓
Render ProfileHeader
  - Avatar (from avatar_url or default)
  - Display name
  - Location (city, country flag emoji)
  - Trust score badge
  - Roles (pills)
  ↓
Render ProfileStats
  - Power Points
  - NADA balance
  - Days on platform
  - Completed swaps (0 for now)
  ↓
Render ProfileBio
  - Bio text
  - Professional bio (if set)
  ↓
Render tabs (for future):
  - Overview (active by default)
  - Inventory (placeholder)
  - Activity (placeholder)
  - Settings
```

### **Profile Edit Flow:**
```
User clicks "Edit Profile" button
  ↓
Open EditProfileModal or navigate to /profile/edit
  ↓
Load current profile data into form
  ↓
User updates:
  - Avatar (upload to Supabase Storage)
  - Display name
  - Bio
  - Location (country, region, city)
  - Roles (multi-select)
  - Interests (multi-select)
  ↓
On save:
  1. Upload avatar if changed → get URL
  2. Update user_profiles table
  3. Delete + insert user_roles
  4. Delete + insert user_interests
  ↓
Show success message
  ↓
Close modal / navigate back to profile
  ↓
Profile page refreshes with new data
```

---

## 🎨 STEP 7: DESIGN SYSTEM ALIGNMENT

### **Colors for Roles:**
```typescript
const roleColors = {
  consumer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  professional: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  founder: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  designer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  researcher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  farmer: 'bg-green-500/20 text-green-400 border-green-500/30',
  buyer: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}
```

### **Trust Score Display:**
```typescript
const trustLevels = {
  0-25: { label: 'New User', color: 'text-gray-400', icon: '🌱' },
  25-50: { label: 'Trusted', color: 'text-emerald-400', icon: '✅' },
  50-100: { label: 'Verified', color: 'text-cyan-400', icon: '🔷' },
  100+: { label: 'Power User', color: 'text-purple-400', icon: '⭐' },
  200+: { label: 'Community Leader', color: 'text-yellow-400', icon: '👑' },
}
```

### **Avatar Defaults:**
- If no avatar: Use initials in gradient circle
- Gradient: Match user's primary role color
- Size: 120px on profile, 40px in navbar, 32px in comments

---

## 🚨 STEP 8: POTENTIAL CHALLENGES

### **Challenge 1: ME Button Unification**
**Issue:** Currently have ME, ME Market, ME Mag buttons in different places  
**Solution:** 
- Keep ME in bottom navbar as primary
- Phase out separate ME Market / ME Mag buttons
- Add "My Organizations" section in ME menu
- Add "My Inventory" section (future SWAP)

### **Challenge 2: Avatar Storage**
**Issue:** Need to store avatar images  
**Solution:**
- Use Supabase Storage
- Create bucket: `avatars` (if not exists)
- RLS policy: Users can upload their own avatar
- Max size: 2MB
- Allowed types: jpg, png, webp
- Auto-resize to 512x512

### **Challenge 3: Country/Flag Display**
**Issue:** Need country flags for location display  
**Solution:**
- Use country ISO codes (2-letter)
- Display flag emoji: `countryCodeToFlag(code)`
- Library: `country-flag-emoji` or use Unicode emoji

### **Challenge 4: Profile Visibility**
**Issue:** Privacy - who can see profile?  
**Solution (Phase 0):**
- All profiles public by default
- Show basic info only (name, avatar, trust score)
- Hide email, detailed stats unless it's your own profile
- Add privacy settings in later phase

---

## 📝 STEP 9: SAMPLE CODE STRUCTURE

### **Profile Page Component:**
```typescript
// /components/UserProfile.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ProfileHeader } from './profile/ProfileHeader'
import { ProfileStats } from './profile/ProfileStats'
import { ProfileBio } from './profile/ProfileBio'
import { ProfileTabs } from './profile/ProfileTabs'

export function UserProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadProfile()
  }, [userId])
  
  async function loadProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles (role),
        user_interests (interest)
      `)
      .eq('id', userId)
      .single()
    
    if (data) setProfile(data)
    setLoading(false)
  }
  
  if (loading) return <LoadingSpinner />
  if (!profile) return <NotFound />
  
  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader profile={profile} />
      <ProfileStats profile={profile} />
      <ProfileBio profile={profile} />
      <ProfileTabs profile={profile} />
    </div>
  )
}
```

### **Profile Header Component:**
```typescript
// /components/profile/ProfileHeader.tsx
import { Badge } from '@/components/ui/badge'
import { TrustScoreBadge } from './TrustScoreBadge'
import { RolePill } from './RolePill'

export function ProfileHeader({ profile }) {
  return (
    <div className="relative">
      {/* Banner (future) */}
      <div className="h-48 bg-gradient-to-r from-emerald-500 to-cyan-500" />
      
      {/* Avatar + Info */}
      <div className="relative px-6 pb-6">
        <div className="flex items-end gap-4 -mt-16">
          {/* Avatar */}
          <img 
            src={profile.avatar_url || getDefaultAvatar(profile.display_name)}
            alt={profile.display_name}
            className="w-32 h-32 rounded-full border-4 border-background"
          />
          
          {/* Info */}
          <div className="flex-1 mt-16">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.display_name}</h1>
              {profile.id_verified && <VerifiedBadge />}
            </div>
            
            {/* Location */}
            {profile.city && profile.country && (
              <p className="text-muted-foreground">
                📍 {profile.city}, {countryCodeToFlag(profile.country)} {profile.country}
              </p>
            )}
            
            {/* Roles */}
            <div className="flex gap-2 mt-2">
              {profile.user_roles.map(r => (
                <RolePill key={r.role} role={r.role} />
              ))}
            </div>
            
            {/* Trust Score */}
            <div className="mt-2">
              <TrustScoreBadge score={profile.trust_score} />
            </div>
          </div>
          
          {/* Edit Button (if own profile) */}
          {isOwnProfile && (
            <Button onClick={() => setEditModalOpen(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## ✅ STEP 10: SUCCESS CRITERIA

### **Phase 0 Complete When:**
- [ ] User can view their enhanced profile
- [ ] User can edit profile (avatar, bio, location, roles, interests)
- [ ] Avatar upload working
- [ ] Trust score displayed (even if 0)
- [ ] Roles displayed as pills
- [ ] Location displayed with flag emoji
- [ ] Stats cards showing (power points, NADA, days on platform)
- [ ] ME button provides quick access to profile
- [ ] Profile page has tabs ready for future content
- [ ] Mobile responsive
- [ ] Matches design system (solarpunk aesthetic)

### **Not Required for Phase 0:**
- ❌ Banner image upload (can be gradient for now)
- ❌ Inventory tab (Phase 1 - SWAP)
- ❌ Activity tab (Phase 1-2)
- ❌ Messaging inbox (Phase 0 separate task)
- ❌ Public/private profiles (all public for now)
- ❌ Profile search (later)
- ❌ Follow/friend system (later)

---

## 🎯 RECOMMENDED APPROACH

### **Day 1-2: Database + Basic Profile View**
1. ✅ Run SQL schema in Supabase
2. ✅ Verify tables created
3. ✅ Create avatar storage bucket
4. ✅ Build basic profile page component
5. ✅ Display existing user data (name, power points, NADA)
6. ✅ Add placeholder for avatar, bio, roles

### **Day 3-4: Profile Edit + Avatar Upload**
1. ✅ Build EditProfileModal component
2. ✅ Implement avatar upload to Supabase Storage
3. ✅ Build role selector (checkboxes)
4. ✅ Build interest selector (checkboxes)
5. ✅ Save functionality (update user_profiles, user_roles, user_interests)
6. ✅ Test create/update/delete roles and interests

### **Day 5-6: Enhanced Display + ME Button**
1. ✅ Add trust score badge component
2. ✅ Add role pills with colors
3. ✅ Add location with flag emoji
4. ✅ Add stats cards
5. ✅ Update ME button to open menu
6. ✅ Link menu to profile page
7. ✅ Mobile responsive testing

### **Day 7: Polish + Testing**
1. ✅ Visual polish (animations, hover states)
2. ✅ Error handling (failed uploads, network errors)
3. ✅ Loading states
4. ✅ Test on mobile
5. ✅ Test edge cases (no avatar, no bio, etc.)
6. ✅ Deploy to staging
7. ✅ User testing

---

## 🚀 NEXT STEPS AFTER PHASE 0

Once User Profile V1.5 is complete:
1. **Messaging System V0.1** (threads, inbox, messages)
2. **Discovery Match V1** (request form, admin dashboard)
3. Then proceed to Phase 1 (SWAP) with inventory management

---

## 📚 REFERENCE DOCUMENTS

- `/THREE_RAILS_MARKETPLACE_VISION.md` - Strategic overview
- `/FIGMA_DESIGN_BRIEF.md` - Design specifications
- `/database_schemas/three_rails_schema.sql` - Database schema
- `/THREE_RAILS_ARCHITECTURE_DIAGRAM.md` - Visual architecture (in Wiki)

---

**Created:** December 6, 2024  
**Status:** 🟢 Ready to Start  
**Next:** Run SQL schema, then build profile components

**Let's build the foundation! 🌿🚀**
