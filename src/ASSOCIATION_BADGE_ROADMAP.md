# 🏅 Association Badge System - Complete Roadmap

**Last Updated:** After completing Hemp'in Swag Supermarket Phase 2

---

## 📋 Overview

The Association Badge System allows organizations (marked as associations) to issue verified badges to other companies in the hemp industry. These badges can then be used to gate premium swag products in the marketplace.

---

## ✅ CURRENT STATE (What's Already Built)

### Backend Infrastructure ✅
- ✅ **company_badges table** - Stores all badge data
- ✅ **badge_requests table** - Badge request workflow
- ✅ **Badge API endpoint** - `/user-association-badges/:userId` to fetch user's badges
- ✅ **Badge verification system** - `verified` flag on badges
- ✅ **Badge expiry** - Optional `expiry_date` field

### Database Schema ✅
```sql
company_badges:
- id (UUID, PK)
- company_id (UUID, FK → companies)
- badge_type (TEXT) - e.g., "member", "verified", "premium"
- badge_name (TEXT) - e.g., "Hemp Alliance Member"
- badge_description (TEXT)
- badge_icon (TEXT) - Icon type (Shield, Crown, Star, etc.)
- badge_color (TEXT) - Hex color
- issued_by_association_id (UUID, FK → companies)
- issued_by_association_name (TEXT)
- verified (BOOLEAN) - Must be true to use for gating
- verification_date (TIMESTAMPTZ)
- expiry_date (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Frontend Components ✅
- ✅ **OrganizationProfilePage** - Displays badges on company profiles
- ✅ **SwagMarketplace** - Has badge-gating logic built-in
- ✅ **ProductDetailModal** - Shows badge requirements
- ✅ **BadgeRequirementModal** - "Members Only" lock screen

---

## 🔥 IMMEDIATE TASKS (In Progress)

### 1. **Fetch User Association Badges in App.tsx**
**Status:** 🟡 IN PROGRESS  
**Priority:** 🔥 CRITICAL

**What to do:**
```tsx
// In App.tsx, add state for user badges
const [userBadges, setUserBadges] = useState<any[]>([])

// Fetch badges when user logs in
const fetchUserBadges = async () => {
  if (!userId || !accessToken) return
  
  try {
    const response = await fetch(
      `${serverUrl}/user-association-badges/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      setUserBadges(data.badges || [])
      console.log('✅ User badges fetched:', data.badges?.length || 0)
    }
  } catch (error) {
    console.error('Error fetching user badges:', error)
  }
}

// Call in useEffect
useEffect(() => {
  if (isAuthenticated && userId && accessToken) {
    fetchArticles()
    fetchUserProgress()
    fetchUserArticles()
    fetchUserBadges() // ADD THIS
  }
}, [isAuthenticated, userId, accessToken])

// Pass to SwagMarketplace
<SwagMarketplace
  userBadges={userBadges} // Change from [] to {userBadges}
  // ... other props
/>
```

---

### 2. **Create First Association Badge**
**Status:** 🟡 IN PROGRESS  
**Priority:** 🔥 CRITICAL

**Company ID:** `00ca05c2-3c0b-421d-a7a3-2f4c5629b8db`

**To create the badge, run this SQL in Supabase SQL Editor:**

```sql
-- First, make sure your company is marked as an association
UPDATE companies 
SET is_association = true 
WHERE id = '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db';

-- Create your first association badge
INSERT INTO company_badges (
  id,
  company_id,
  badge_type,
  badge_name,
  badge_description,
  badge_icon,
  badge_color,
  issued_by_association_id,
  issued_by_association_name,
  verified,
  verification_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db', -- Your company ID
  'founding-member', -- Badge type (used for product gating)
  'Founding Member', -- Display name
  'Charter member of the Hemp Alliance. Exclusive access to founding member products.', -- Description
  'Crown', -- Icon (Crown, Shield, Star, Award, Zap, etc.)
  '#9333ea', -- Purple color
  '00ca05c2-3c0b-421d-a7a3-2f4c5629b8db', -- Issued by your company
  'Hemp Alliance', -- Your company name
  true, -- Verified
  NOW(), -- Verification date
  NOW(),
  NOW()
);
```

**Badge Types to Consider:**
- `founding-member` - Charter members
- `premium-member` - Premium tier
- `verified-partner` - Verified partners
- `certified-grower` - Certified hemp growers
- `certified-processor` - Certified processors
- `industry-leader` - Industry leaders

---

### 3. **Create Badge-Gated Product**
**Status:** 🟢 READY (After badge is created)  
**Priority:** 🔥 HIGH

**To test badge-gating:**
1. Go to Organization Dashboard → SWAG tab
2. Create/edit a product
3. Enable "Badge Gated"
4. Select badge type: `founding-member`
5. Publish product
6. Test in marketplace - only users with that badge can purchase

---

## 🟡 MEDIUM PRIORITY (Build Next)

### 4. **Badge Request System (Frontend)**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟡 MEDIUM

**What it does:**
- Companies can request badges from associations
- Associations review and approve/reject requests
- Notification system for requests

**Tasks:**
- [ ] Create BadgeRequestForm component
- [ ] Create BadgeRequestList component (for associations)
- [ ] Add "Request Badge" button to company profiles
- [ ] Add "Badge Requests" tab to Organization Dashboard
- [ ] Email notifications for new requests (future)

**Files to create:**
- `/components/BadgeRequestForm.tsx`
- `/components/BadgeRequestList.tsx`
- `/components/BadgeRequestCard.tsx`

**API Endpoints:**
- `POST /badge-requests` - Submit request
- `GET /badge-requests/:associationId` - Get requests for association
- `PUT /badge-requests/:id/approve` - Approve request
- `PUT /badge-requests/:id/reject` - Reject request

---

### 5. **Badge Marketplace**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟡 MEDIUM

**What it does:**
- Browse all available badges
- See which associations issue which badges
- Filter by badge type, industry, etc.
- "How to Earn" info for each badge

**Tasks:**
- [ ] Create BadgeMarketplace component
- [ ] Badge catalog page
- [ ] Badge detail pages
- [ ] "How to Earn This Badge" modal
- [ ] Badge rarity indicators

---

### 6. **User Badge Collection Page**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟡 MEDIUM

**What it does:**
- Display all badges user has earned
- Badge collection showcase
- Share badge collection
- Track badge progress

**Tasks:**
- [ ] Create BadgeCollection component
- [ ] Badge showcase grid
- [ ] Badge filtering (by type, date, issuer)
- [ ] Badge sharing functionality
- [ ] Badge statistics (rarest, newest, etc.)

---

### 7. **Badge Display in Profile**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟡 MEDIUM

**What it does:**
- Show user's badges on their public profile
- Select featured badge
- Badge showcase section
- Badge tooltips with details

**Tasks:**
- [ ] Add badges section to UserDashboard
- [ ] Create BadgeShowcase component
- [ ] Badge selection UI
- [ ] Featured badge display

---

## 🟢 LOW PRIORITY (Future Enhancements)

### 8. **Badge Levels & Tiers**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟢 LOW

**What it does:**
- Bronze, Silver, Gold, Platinum tiers
- Badge progression system
- Upgrade requirements
- Tier benefits

---

### 9. **Badge Analytics**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟢 LOW

**What it does:**
- Badge distribution statistics
- Most sought-after badges
- Badge issuer leaderboard
- Badge expiry tracking

---

### 10. **Badge Trading/Gifting**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟢 LOW

**What it does:**
- Transfer badges between users
- Gift badges to team members
- Badge marketplace (trade/sell)

---

### 11. **Dynamic Badge Requirements**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟢 LOW

**What it does:**
- Auto-issue badges based on criteria
- NADA point thresholds
- Article read counts
- Streak milestones
- Community participation

---

### 12. **Badge Notifications**
**Status:** 🔴 NOT STARTED  
**Priority:** 🟢 LOW

**What it does:**
- Badge earned notifications
- Badge expiry reminders
- New badge available alerts
- Badge request status updates

---

## 🎯 BADGE TYPE TAXONOMY

### **Membership Badges**
- `founding-member` - Charter/founding members
- `premium-member` - Premium tier members
- `standard-member` - Standard members
- `trial-member` - Trial/guest members

### **Verification Badges**
- `verified-business` - Business verification
- `verified-grower` - Grower certification
- `verified-processor` - Processor certification
- `verified-retailer` - Retailer verification
- `verified-association` - Association verification

### **Achievement Badges**
- `industry-leader` - Top performers
- `innovation-award` - Innovation recognition
- `sustainability-champion` - Sustainability leaders
- `community-builder` - Community contributors

### **Specialty Badges**
- `organic-certified` - Organic certification
- `fair-trade` - Fair trade certified
- `climate-neutral` - Carbon neutral certified
- `b-corp` - B-Corp certified

### **Event Badges**
- `conference-2024` - Event attendance
- `expo-exhibitor` - Exhibition participation
- `speaker-2024` - Speaker badge
- `sponsor-2024` - Sponsor badge

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Badge Gating Logic**

```tsx
// In SwagMarketplace component
const hasRequiredBadge = (product: SwagProduct) => {
  if (!product.badge_gated) return true
  if (!userId || !product.required_badge_type) return false
  
  // Check if user has badge with matching badge_type
  return userBadges.some(badge => 
    badge.badge_type === product.required_badge_type &&
    badge.verified === true &&
    (!badge.expiry_date || new Date(badge.expiry_date) > new Date())
  )
}
```

### **Badge Display Component**

```tsx
interface BadgeProps {
  badge: {
    badge_type: string
    badge_name: string
    badge_description: string
    badge_icon: string
    badge_color: string
    issued_by_association_name: string
    verification_date: string
    expiry_date?: string
  }
}

function BadgeCard({ badge }: BadgeProps) {
  const Icon = BADGE_ICONS[badge.badge_icon] || Award
  
  return (
    <div className="badge-card">
      <div 
        className="badge-icon"
        style={{ backgroundColor: badge.badge_color }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3>{badge.badge_name}</h3>
      <p>{badge.badge_description}</p>
      <span className="issuer">
        Issued by {badge.issued_by_association_name}
      </span>
      <span className="date">
        {new Date(badge.verification_date).toLocaleDateString()}
      </span>
    </div>
  )
}
```

---

## 📊 BADGE WORKFLOW

### **Issuing a Badge (Manual)**
```
1. Association creates badge in Organization Dashboard → Badges Tab
2. Badge appears in company's profile
3. Badge is verified by association
4. Badge becomes active for product gating
```

### **Requesting a Badge**
```
1. Company views Association's profile
2. Clicks "Request Badge" button
3. Fills out request form
4. Submits with supporting documents
5. Association reviews request
6. Association approves/rejects
7. If approved, badge is issued automatically
8. Company receives notification
```

### **Using Badge for Product Gating**
```
1. Organization creates swag product
2. Enables "Badge Gated" option
3. Selects required badge_type
4. Publishes product
5. Product shows in marketplace
6. Users without badge see "Members Only" lock
7. Users with badge can purchase
```

---

## 🎨 BADGE ICON OPTIONS

Available icons (from lucide-react):
- `Shield` - Protection, verification
- `Crown` - Premium, elite
- `Star` - Excellence, featured
- `Award` - Achievement, recognition
- `Zap` - Power, energy
- `Sparkles` - Special, magical
- `Heart` - Community, support
- `Leaf` - Organic, natural
- `Trophy` - Competition, winner
- `Medal` - Accomplishment

---

## 🚀 IMMEDIATE NEXT STEPS

1. ✅ **Update App.tsx** - Add fetchUserBadges function
2. ✅ **Create your first badge** - Run SQL to create founding-member badge
3. ✅ **Test badge-gating** - Create a product with badge requirement
4. ✅ **Verify badge display** - Check if badge shows on company profile
5. ✅ **Test marketplace** - Verify "Members Only" lock works

---

## 📝 NOTES

- **Badge Types** should be consistent across the system (use lowercase-hyphenated format)
- **Verification** is required for badges to be used in product gating
- **Expiry Dates** are optional but recommended for time-limited badges
- **Badge Icons** should match the badge type/purpose
- **Badge Colors** should follow Hemp'in brand guidelines (emerald/teal/purple)

---

**🎯 Current Focus:** Fetch user badges + create first badge to test the system!
