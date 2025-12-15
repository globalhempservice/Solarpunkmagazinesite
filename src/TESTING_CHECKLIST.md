# ✅ Phase 0 Testing Checklist

## Pre-Flight Check

- [ ] **Avatars bucket created** in Supabase Storage
  - Name: `avatars`
  - Public: ✅ YES
  - File size limit: 2MB

---

## 1️⃣ ME Drawer Functionality

- [ ] Click ME button (center purple button in bottom nav)
- [ ] Drawer slides up from bottom smoothly
- [ ] Shows user avatar (or gradient with initials if no avatar)
- [ ] Shows display name
- [ ] Shows "Member" subtitle
- [ ] Online indicator (green dot) visible
- [ ] Menu items render:
  - [ ] My Profile (gradient icon)
  - [ ] My Organizations (gradient icon)
  - [ ] My Inventory (gradient icon + "Soon" badge)
  - [ ] Settings (gradient icon)
- [ ] Logout button at bottom (red gradient)
- [ ] Close button (X) works
- [ ] Click outside drawer to close
- [ ] Smooth close animation

**Animation Quality:**
- [ ] Backdrop blur effect visible
- [ ] Gradient glow on hover
- [ ] Icons have shine effects
- [ ] No layout jank or flicker

---

## 2️⃣ Profile Page Display

**Navigate:** ME Drawer → "My Profile"

### Header Section
- [ ] Banner displays (gradient if no image)
- [ ] Avatar displays correctly:
  - [ ] Shows uploaded image, OR
  - [ ] Shows gradient circle with initial letter
- [ ] Display name shows
- [ ] Location shows (if set):
  - [ ] City name
  - [ ] Country flag pill (not emoji!)
  - [ ] Correct country name
- [ ] Role pills display (if set):
  - [ ] Each role has correct color
  - [ ] Multiple roles wrap properly
- [ ] Trust score badge displays:
  - [ ] Shows "New User" (score 0) OR appropriate level
  - [ ] Custom SVG icon (no emoji!)
  - [ ] Score number visible
- [ ] Bio section shows (if set)
- [ ] "Edit Profile" button visible (own profile only)
- [ ] Verified badge (if id_verified is true)

### Stats Section
- [ ] 4 stat cards display in grid:
  - [ ] **Power Points** (yellow/amber gradient)
  - [ ] **NADA Balance** (emerald/teal gradient)
  - [ ] **Days Active** (cyan/blue gradient)
  - [ ] **Swaps Completed** (purple/pink gradient)
- [ ] Each card shows:
  - [ ] Gradient icon with shine
  - [ ] Number value
  - [ ] Label text
  - [ ] Hover effect works

### Tabs Section
- [ ] Tab bar displays:
  - [ ] Overview (active by default)
  - [ ] Inventory ("Soon" badge)
  - [ ] Activity ("Soon" badge)
  - [ ] Settings (if own profile)
- [ ] Active tab highlighted
- [ ] Click tab to switch
- [ ] Disabled tabs (with "Soon") can't be clicked

**Responsive Check:**
- [ ] Mobile: Stats stack 2x2
- [ ] Mobile: Header stacks vertically
- [ ] Desktop: Stats display 4 columns
- [ ] Desktop: Header horizontal layout

---

## 3️⃣ Edit Profile Modal

**Navigate:** Profile Page → "Edit Profile" button

### Modal Display
- [ ] Modal opens with smooth animation
- [ ] Centered on desktop
- [ ] Full screen on mobile
- [ ] Backdrop blur visible
- [ ] Header shows "Edit Profile"
- [ ] Close button (X) works
- [ ] Click outside to close

### Avatar Upload
- [ ] Current avatar preview shows
- [ ] "Change Avatar" button visible
- [ ] Click button opens file picker
- [ ] Select image file:
  - [ ] Preview updates immediately
  - [ ] Shows selected image
- [ ] Test validations:
  - [ ] File > 2MB shows error toast
  - [ ] Non-image file shows error toast
  - [ ] Valid image shows in preview

### Basic Info Fields
- [ ] Display Name field:
  - [ ] Pre-filled with current name
  - [ ] Can edit text
  - [ ] Required (can't save empty)
- [ ] Bio field:
  - [ ] Pre-filled if exists
  - [ ] Multiline textarea
  - [ ] Character counter shows (X/500)
  - [ ] Max 500 characters enforced
- [ ] Location fields:
  - [ ] Country (2-char code, uppercase)
  - [ ] Region/State
  - [ ] City
  - [ ] All optional

### Roles Selection
- [ ] 8 role options display in 2-column grid:
  - [ ] Consumer
  - [ ] Professional
  - [ ] Founder / Entrepreneur
  - [ ] Designer
  - [ ] Researcher
  - [ ] Farmer / Cultivator
  - [ ] Buyer / Procurement
  - [ ] Other
- [ ] Click to toggle selection:
  - [ ] Checkbox fills when selected
  - [ ] Border changes color
  - [ ] Background tints
- [ ] Can select multiple roles
- [ ] Pre-selected roles checked on open

### Interests Selection
- [ ] 8 interest options display in 2-column grid:
  - [ ] Textiles & Fashion
  - [ ] Construction Materials
  - [ ] Food & Nutrition
  - [ ] Personal Care & Wellness
  - [ ] Cultivation & Farming
  - [ ] Research & Education
  - [ ] Manufacturing
  - [ ] Sustainability
- [ ] Click to toggle selection:
  - [ ] Checkbox fills when selected
  - [ ] Border changes color
  - [ ] Background tints
- [ ] Can select multiple interests
- [ ] Pre-selected interests checked on open

### Professional Info (Collapsible)
- [ ] Section collapsed by default
- [ ] Click to expand/collapse
- [ ] Arrow icon rotates
- [ ] 3 fields inside:
  - [ ] Professional Bio (textarea)
  - [ ] What I'm Looking For (textarea)
  - [ ] What I Can Offer (textarea)
- [ ] All optional

### Save Functionality
- [ ] "Cancel" button closes modal (no save)
- [ ] "Save Changes" button:
  - [ ] Disabled while saving
  - [ ] Shows loading spinner
  - [ ] Text changes to "Saving..."
- [ ] After successful save:
  - [ ] Success toast appears
  - [ ] Modal closes automatically
  - [ ] Profile page refreshes
  - [ ] New data visible immediately

---

## 4️⃣ Data Persistence

**Test:** Make changes, save, then refresh page

- [ ] Avatar persists after page refresh
- [ ] Display name persists
- [ ] Bio persists
- [ ] Location persists (country, region, city)
- [ ] Roles persist (pills show on profile)
- [ ] Interests persist (can verify in edit modal)
- [ ] Professional info persists

**Database Verification (Optional):**
```sql
-- Check in Supabase SQL Editor
SELECT * FROM user_profiles WHERE id = auth.uid();
SELECT * FROM user_roles WHERE user_id = auth.uid();
SELECT * FROM user_interests WHERE user_id = auth.uid();
```

---

## 5️⃣ Trust Score Levels

**Manually test by updating trust_score in database:**

```sql
-- Test different trust levels
UPDATE user_profiles SET trust_score = 0 WHERE id = auth.uid(); -- New User (seedling icon)
UPDATE user_profiles SET trust_score = 30 WHERE id = auth.uid(); -- Trusted (check icon)
UPDATE user_profiles SET trust_score = 60 WHERE id = auth.uid(); -- Verified (shield icon)
UPDATE user_profiles SET trust_score = 120 WHERE id = auth.uid(); -- Power User (star icon)
UPDATE user_profiles SET trust_score = 220 WHERE id = auth.uid(); -- Community Leader (crown icon)
```

After each update, refresh profile page:
- [ ] Score 0-24: "New User" (gray, seedling icon)
- [ ] Score 25-49: "Trusted" (emerald, check icon)
- [ ] Score 50-99: "Verified" (cyan, shield icon)
- [ ] Score 100-199: "Power User" (purple, star icon)
- [ ] Score 200+: "Community Leader" (yellow, crown icon)

---

## 6️⃣ Mobile Responsiveness

**Open browser dev tools, switch to mobile view**

### ME Drawer (Mobile)
- [ ] Full width
- [ ] Touch-friendly buttons
- [ ] Smooth slide animation
- [ ] No horizontal scroll

### Profile Page (Mobile)
- [ ] Header stacks vertically
- [ ] Avatar appropriate size
- [ ] Stats stack 2x2
- [ ] Tabs scrollable horizontally
- [ ] No content cut off

### Edit Modal (Mobile)
- [ ] Full screen (not centered)
- [ ] Scroll works for long form
- [ ] Keyboard doesn't break layout
- [ ] Checkboxes easy to tap
- [ ] Text inputs full width

---

## 7️⃣ Error Handling

### Avatar Upload Errors
- [ ] File too large (>2MB) → Error toast
- [ ] Wrong file type → Error toast
- [ ] Network error → Error toast

### Save Errors
- [ ] Empty display name → Error toast
- [ ] Network disconnected → Error toast
- [ ] Database error → Error toast + console log

### Profile Loading Errors
- [ ] User not authenticated → Shows error state
- [ ] Profile not found → Shows error state
- [ ] Network error → Shows error state

---

## 8️⃣ Performance

- [ ] ME drawer opens instantly (<100ms)
- [ ] Profile page loads <2 seconds
- [ ] Edit modal opens instantly
- [ ] Avatar preview instant (before upload)
- [ ] Save completes <3 seconds
- [ ] No layout shift during loading
- [ ] Smooth 60fps animations

---

## 9️⃣ Design Quality

### No Emojis Rule
- [ ] ❌ NO emoji for trust badges (custom SVG ✅)
- [ ] ❌ NO emoji for country flags (styled pill ✅)
- [ ] ❌ NO emoji anywhere in UI

### Solarpunk Aesthetic
- [ ] Gradient backgrounds present
- [ ] Shine effects on icons
- [ ] Blur effects working
- [ ] Colors match Hemp'in system
- [ ] Rounded corners (xl, 2xl, 3xl)
- [ ] Border glows on hover

### Typography
- [ ] Display names readable
- [ ] Bio text has good contrast
- [ ] Labels clear and consistent
- [ ] No text overflow issues

---

## 🔟 Integration with Existing App

- [ ] ME drawer doesn't break existing nav
- [ ] Profile view doesn't conflict with dashboard
- [ ] Settings link still works from drawer
- [ ] Logout works correctly
- [ ] No console errors
- [ ] No broken imports
- [ ] Bottom navbar still works
- [ ] Other views unaffected (feed, editor, etc.)

---

## 🎯 Phase 0 Success Criteria

**All must pass:**

- [x] ✅ Code integrated into App.tsx
- [ ] ✅ Avatars bucket created in Supabase
- [ ] ✅ ME drawer works perfectly
- [ ] ✅ Profile page displays correctly
- [ ] ✅ Edit profile saves successfully
- [ ] ✅ Avatar upload works
- [ ] ✅ Roles and interests save
- [ ] ✅ Trust score displays with custom icons
- [ ] ✅ Location displays with flag pills
- [ ] ✅ Data persists after refresh
- [ ] ✅ Mobile fully responsive
- [ ] ✅ NO emojis used (custom SVG only)
- [ ] ✅ Matches solarpunk design system
- [ ] ✅ No breaking bugs
- [ ] ✅ Performance good

---

## 🐛 Known Limitations (Phase 0)

These are expected and will be fixed in Phase 1:

- ⚠️ "My Organizations" → Not implemented yet
- ⚠️ "My Inventory" → Phase 1 feature
- ⚠️ Inventory tab → Shows "Soon" placeholder
- ⚠️ Activity tab → Shows "Soon" placeholder
- ⚠️ Swaps Completed → Always 0 (Phase 1)
- ⚠️ Country flags → Styled pills (full SVGs later)
- ⚠️ Banner upload → Not in edit modal (future)

---

## 📝 Testing Notes

**Date:** _________________

**Tester:** _________________

**Issues Found:**
1. 
2. 
3. 

**Blockers:**
- 

**Nice to Have:**
- 

---

**Status:** [ ] All Tests Pass → Ready for Phase 1! 🚀

