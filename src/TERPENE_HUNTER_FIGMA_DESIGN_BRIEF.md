# 🧭 Terpene Hunter Mini-App — Figma Make Design Brief

**Version:** 1.0  
**For:** Figma Make Designer/Developer  
**Context:** You have the DEWII OS home launcher ready with app tiles. Now we're building the first "city-native game experience" — Terpene Hunter.

---

## 🎯 What You're Building

**Terpene Hunter** is a location-based discovery game (think Pokemon GO meets Untappd) where users:
1. Choose an **objective** (sleep, focus, mood, specific aromas)
2. Use a **compass/radar** to find nearby places/products with matching terpene profiles
3. **Check in** at locations and **log encounters** to earn XP/HEMP
4. Collect beautiful **specimens** (photos + terpene data) in a personal Herbarium
5. See **Trust Meters** showing how reliable the terpene claims are (lab COA, shop attestation, community votes)
6. Optionally link specimens to **verified batches** via QR "seal tokens" from partner shops

**User fantasy:** "I want to find citrus-forward strains for focus work. The compass points me to 3 nearby shops. I visit, scan a QR seal on my purchase, photograph the beautiful purple nugs, and add it to my Herbarium. +50 XP, +25 HEMP, achievement unlocked: 'Limonene Hunter'."

---

## 🔐 Access Rules (Terpene Hunter ONLY)

### This mini-app is locked unless:
- **(PRO user OR Adult-Verified)** AND
- **Bangkok geo-location**

**Important:** The rest of DEWII (MAG, Places, Shop, Forum, Globe) stays **globally accessible**. Only Terpene Hunter has these gates.

### Adult Verification UX (NO ID STORAGE!)
**How it works:**
1. User taps "Unlock Terpene Hunter"
2. App shows two options:
   - **"Upgrade to PRO"** → payment flow
   - **"Verify at Partner Shop"** → shows map of verification locations
3. User visits shop → shop staff checks ID (legal responsibility on shop)
4. Shop generates QR token → user scans in app
5. App unlocks Adult Mode for 30 days
6. We store ONLY: `adult_verified_until` timestamp + `verified_by_place_id`

**What to design:**
- 🔒 **Locked State Screen**
  - Visual: blurred/dimmed preview of compass
  - Headline: "Terpene Hunter — Bangkok Only"
  - Subtext: "Unlock with PRO or Adult Verification"
  - Two big CTAs:
    - "Upgrade to PRO" (premium yellow button)
    - "Verify at Shop" (glass button, opens map)
  
- ✅ **Unlocked Badge**
  - Small chip in header: "Adult Verified until Dec 31, 2025"
  - Green checkmark icon
  - Shows on Terpene Hunter screens only

---

## 📱 Core Screens to Design

### 1️⃣ **Terpene Hunter Home (Compass Dashboard)**

**Purpose:** Main navigation hub — choose objective, see radar, access features

**Layout:**
```
┌─────────────────────────────────┐
│  🧭 Terpene Hunter              │
│  ✅ Adult Verified • Bangkok    │
├─────────────────────────────────┤
│                                 │
│     ┌─────────────┐            │
│     │   COMPASS   │            │ ← Centerpiece (rotating wheel)
│     │    WHEEL    │            │
│     │  Citrus ⬆️  │            │ ← Direction indicator
│     └─────────────┘            │
│                                 │
│  Objective:                     │
│  [Sleep] [Focus] [Mood] [+]     │ ← Chip selector
│                                 │
│  🍊 Citrus Power    ████░░ 42%  │ ← Objective progress bars
│  🌲 Pine Power      ██░░░░ 15%  │
│  🌸 Floral Power    ███░░░ 28%  │
│                                 │
│  Quick Actions:                 │
│  [📍 Open Map] [✍️ Log] [🏛️ Herbarium] │
│                                 │
│  Today: +125 XP • +45 HEMP      │ ← Gamification widget
│  Daily Quest: Log 3 encounters ●●○ │
└─────────────────────────────────┘
```

**Design Notes:**
- **Compass Wheel:**
  - Circular wheel divided into terpene families (citrus/floral/pine/spice/earth/herbal)
  - Rotates subtly based on phone orientation (optional accelerometer)
  - Arrow points toward nearest matching place
  - Glows when near a strong match
  - Terpenes user has "collected" are filled/colored, uncollected are dimmed

- **Objective Chips:**
  - Horizontal scrolling chips
  - Primary objectives: Sleep, Calm, Focus, Social, Body Relief
  - Secondary (terpene-specific): Citrus, Floral, Pine, Spice, Earthy
  - Selected chip has glow/border
  - Tap to change objective → compass updates

- **Power Bars:**
  - Each objective has a meter (0-100%)
  - Fills as user logs encounters with matching terpenes
  - Visual: gradient fill (green → yellow → gold at 100%)
  - Tooltip: "15 limonene encounters logged"

- **Bangkok Mode Chip:**
  - Top-right: "Bangkok" with green dot (active) or gray (inactive if outside)
  - Tap to see explanation

---

### 2️⃣ **Terpene Map Layer (City Radar)**

**Purpose:** Show nearby terpene sources on a map

**Layout:**
```
┌─────────────────────────────────┐
│  🗺️ Terpene Atlas               │
│  Filters: [Citrus ▼] [Trust ▼]  │
├─────────────────────────────────┤
│                                 │
│         📍        📍            │ ← Map with pins
│     📍       📍                 │
│                  📍             │
│  📍                  📍         │
│                                 │
├─────────────────────────────────┤
│  📍 Hemp Haven Dispensary       │ ← Bottom sheet card (slide up)
│  🍊 Citrus  🌲 Pine             │
│  Trust: ⭐⭐⭐⭐ (Lab COA)        │
│  1.2 km • Open until 10pm       │
│  [View Details] [Navigate]      │
└─────────────────────────────────┘
```

**Design Notes:**
- **Map Pins:**
  - Custom pin design with terpene color coding
  - Pin icon shows dominant terpene (🍊 citrus, 🌲 pine, 🌸 floral)
  - Trust level indicated by pin brightness/glow
  - Tap pin → bottom sheet slides up

- **Filters:**
  - Objective filter (matches compass selection)
  - Terpene filter (specific: limonene, myrcene, pinene, etc.)
  - Trust filter: "Lab-tested only", "All sources"
  - Distance slider (0.5km / 1km / 2km / 5km)

- **Bottom Sheet Card:**
  - Place name + photo thumbnail
  - Top 3 terpenes (colorful chips)
  - Trust meter (see Trust UI section below)
  - Distance + hours
  - "View Details" → opens Place Detail Terpene Tab
  - "Navigate" → opens Apple/Google Maps

---

### 3️⃣ **Place Detail → Terpene Tab**

**Purpose:** Show terpene menu for this location (integrates with existing Places)

**Layout:**
```
┌─────────────────────────────────┐
│  Hemp Haven Dispensary          │
│  [Info] [Menu] [Terpenes] [Reviews] │ ← Tabs
├─────────────────────────────────┤
│  🔬 Terpene Menu                │
│                                 │
│  🌟 Top Batches                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Purple Haze Batch #042  │   │
│  │ Tested: Dec 15, 2025    │   │
│  │                         │   │
│  │ Limonene   ████████ 2.3%│   │ ← Terpene bars
│  │ Myrcene    ██████░░ 1.8%│   │
│  │ Pinene     ████░░░░ 1.2%│   │
│  │ Caryoph.   ███░░░░░ 0.9%│   │
│  │                         │   │
│  │ Trust: ⭐⭐⭐⭐ Lab COA  │   │ ← Trust meter
│  │ [View COA] [Log Encounter] │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Blue Dream Batch #128   │   │
│  │ ... (similar card)      │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Design Notes:**
- **Terpene Bars:**
  - Horizontal bars showing %/mg/g (if available)
  - Color-coded by terpene family:
    - 🍊 Limonene (citrus): Orange
    - 🌲 Myrcene (earthy): Green
    - 🌲 Pinene (pine): Teal
    - 🌶️ Caryophyllene (spicy): Red
    - 🌸 Linalool (floral): Purple
  - Animate bar fill on card appear
  - Tooltip shows exact value on tap

- **Batch Cards:**
  - Show batch code + test date
  - If batch has COA: show "View COA" button → opens PDF/image
  - If batch is "sealed": show special badge
  - Action: "Log Encounter" → opens encounter form

- **Trust Meter:**
  - See dedicated Trust UI section below
  - Shows source of data (Lab/Shop/Community/Unverified)

---

### 4️⃣ **Log Encounter (Quest Action)**

**Purpose:** Create gameplay moment — log a terpene experience

**Layout:**
```
┌─────────────────────────────────┐
│  ✍️ Log Encounter                │
│                                 │
│  📍 Location (auto-detected)    │
│  Hemp Haven Dispensary          │
│  [Change]                       │
│                                 │
│  🌿 Product (optional)          │
│  Purple Haze Batch #042         │
│  [Select from menu]             │
│                                 │
│  🎯 Objective                   │
│  [Sleep] [Focus] [Mood] [+]     │
│                                 │
│  📝 Notes (optional)            │
│  ┌─────────────────────────┐   │
│  │ Citrus smell, smooth,   │   │
│  │ felt relaxed after...   │   │
│  └─────────────────────────┘   │
│                                 │
│  🎭 Mood Tags (optional)        │
│  Before: [Stressed] [Tired]     │
│  After:  [Calm] [Focused]       │
│                                 │
│          [Submit]               │
└─────────────────────────────────┘
```

**After Submit → Reward Toast:**
```
┌─────────────────────────────────┐
│         ✨ REWARD ✨            │
│                                 │
│         +50 XP                  │
│         +25 HEMP                │
│                                 │
│  🍊 New Terpene Discovered!     │ ← If first time
│     Limonene                    │
│                                 │
│  🏆 Progress:                   │
│  Citrus Power: 42% → 48%        │
│                                 │
│         [Continue]              │
└─────────────────────────────────┘
```

**Design Notes:**
- **Auto-detect location** from GPS + current place context
- **Product selection** pulls from place's terpene menu
- **Objective chips** match compass selection but can be changed
- **Notes field** keeps it casual (not medical)
- **Mood tags** use emoji + words (playful, not clinical)
- **Submit button** should feel exciting (glow/pulse animation)

**Reward Toast:**
- Full-screen modal (briefly)
- Confetti/particle effects
- Show XP/HEMP earned
- Show progress bars animating up
- Show any new achievements/discoveries
- Auto-dismiss after 3 seconds or tap

---

### 5️⃣ **Herbarium (Collector Gallery)**

**Purpose:** Personal museum wall for collected specimens

**Layout:**
```
┌─────────────────────────────────┐
│  🏛️ My Herbarium                 │
│  32 specimens • 18 terpenes      │
│                                 │
│  Sort: [Newest] [Rarest] [Trust] │
│  Filter: [Citrus] [Floral] [All] │
├─────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐        │ ← Grid of cards
│  │ 🟣  │ │ 🌿  │ │ ⚪  │        │   (photos)
│  │ #042│ │ #128│ │ #003│        │
│  │ ⭐⭐⭐⭐│ │ ⭐⭐⭐│ │ ⭐⭐│      │   Trust stars
│  │ 🍊🌲│ │ 🌸🌲│ │ 🍊  │        │   Terpene chips
│  └─────┘ └─────┘ └─────┘        │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ ... │ │ ... │ │ ... │        │
│  └─────┘ └─────┘ └─────┘        │
└─────────────────────────────────┘
```

**Specimen Detail (tap card):**
```
┌─────────────────────────────────┐
│          ← Purple Haze          │
│                                 │
│  [  Photo Gallery  ]            │ ← Swipeable photos
│     (full-width image)          │
│                                 │
│  📅 Captured: Dec 17, 2025      │
│  📍 Hemp Haven Dispensary       │
│  🔖 Batch #042 (Sealed ✅)      │
│                                 │
│  🎨 Color Vibe:                 │
│  [Purple] [Frost] [Orange]      │
│                                 │
│  🧪 Terpene Profile:            │
│  ┌─────────────────────────┐   │
│  │    [Wheel Chart]        │   │ ← Mini wheel showing
│  │   Limonene 2.3%         │   │   terpene breakdown
│  │   Myrcene 1.8%          │   │
│  │   Pinene 1.2%           │   │
│  └─────────────────────────┘   │
│                                 │
│  🔬 Trust: ⭐⭐⭐⭐ Lab COA      │
│  [View Certificate]             │
│                                 │
│  📝 Notes:                      │
│  "Citrus smell, smooth smoke,   │
│   felt very relaxed after..."   │
│                                 │
│  [Share] [Edit] [Delete]        │
└─────────────────────────────────┘
```

**Design Notes:**
- **Grid Cards:**
  - Photo dominates (square aspect)
  - Batch number overlay (top-left)
  - Trust stars (bottom-left)
  - Top 2-3 terpene chips (bottom-right)
  - Subtle glow if "sealed" (verified)

- **Color Vibe Tags:**
  - Auto-detected or user-tagged: Purple, Frost, Orange Pistils, Green, Dark, etc.
  - Small colored pills

- **Terpene Profile Wheel:**
  - Donut chart or radar chart
  - Shows % of each terpene
  - Interactive (tap segment for details)

- **Sealed Badge:**
  - Special visual treatment (gold border, holographic shimmer)
  - Indicates physical batch was verified via QR seal token

- **Sorting:**
  - Newest: By capture date
  - Rarest: By trust level + terpene uniqueness
  - By Terpene: Group by dominant terpene

---

### 6️⃣ **Scan Token (Adult + Seal)**

**Purpose:** Redeem QR tokens from partner shops

**Layout:**
```
┌─────────────────────────────────┐
│  📷 Scan Token                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [Camera viewfinder]  │   │
│  │                         │   │
│  │    Frame QR code here   │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Center the QR code in frame    │
└─────────────────────────────────┘
```

**Success State (Adult Token):**
```
┌─────────────────────────────────┐
│          ✅ SUCCESS              │
│                                 │
│  Adult Mode Unlocked!           │
│  Valid until: Jan 16, 2026      │
│                                 │
│  Verified by:                   │
│  Hemp Haven Dispensary          │
│                                 │
│  You can now access all         │
│  Terpene Hunter features.       │
│                                 │
│         [Continue]              │
└─────────────────────────────────┘
```

**Success State (Seal Token):**
```
┌─────────────────────────────────┐
│          ✅ BATCH VERIFIED       │
│                                 │
│  Purple Haze Batch #042         │
│  Hemp Haven Dispensary          │
│                                 │
│  This batch is certified with   │
│  lab COA. Trust level: ⭐⭐⭐⭐   │
│                                 │
│  [Add to New Specimen]          │
│  [Link to Existing Specimen]    │
└─────────────────────────────────┘
```

**Design Notes:**
- **Camera UX:**
  - Full-screen camera view
  - Rounded square frame overlay
  - Auto-detect QR code
  - Haptic feedback on scan success

- **Adult Token Result:**
  - Shows unlock date
  - Shows verifying shop (builds trust)
  - One-time modal

- **Seal Token Result:**
  - Shows batch details
  - Prompts user to create new specimen OR link to existing
  - Badge automatically shows on specimen card

---

## 🎯 Trust & Evidence UI (VERY IMPORTANT)

**Purpose:** Show how reliable the terpene data is WITHOUT making medical claims

### Trust Meter Component

**Visual Design:**
```
┌─────────────────────────────────┐
│  Trust: ⭐⭐⭐⭐ Lab-Tested      │ ← Compact version
│  [?] Tap for details            │
└─────────────────────────────────┘
```

**Expanded Details (tap to reveal):**
```
┌─────────────────────────────────┐
│  🔬 Evidence Level              │
│                                 │
│  ⭐⭐⭐⭐ Lab-Tested (Highest)    │
│                                 │
│  ✅ COA from certified lab      │
│  ✅ Tested: Dec 15, 2025        │
│  ✅ 42 community confirmations  │
│  ✅ Shop-attested                │
│                                 │
│  [View Lab Certificate]         │
│                                 │
│  Why This Matters:              │
│  Higher trust = more reliable   │
│  terpene profile data.          │
└─────────────────────────────────┘
```

### Trust Levels (Design Hierarchy)

**1. ⭐⭐⭐⭐⭐ Lab COA (Gold/Highest)**
- Icon: Lab beaker + checkmark
- Color: Gold (#F59E0B)
- Label: "Lab-Tested COA"
- Shows: Test date, lab name, "View Certificate" button

**2. ⭐⭐⭐⭐ Shop Attested (Silver)**
- Icon: Shop + stamp
- Color: Silver (#9CA3AF)
- Label: "Shop-Verified"
- Shows: Shop name, staff who verified, date

**3. ⭐⭐⭐ Community Confirmed (Bronze)**
- Icon: Community + thumbs up
- Color: Bronze (#D97706)
- Label: "Community-Verified"
- Shows: Number of confirmations (e.g., "23 users confirmed")

**4. ⭐⭐ Unverified Claim (Gray)**
- Icon: Question mark
- Color: Gray (#6B7280)
- Label: "Unverified"
- Shows: Warning: "No independent verification"

**5. ⭐ Disputed/Outdated (Red)**
- Icon: Warning
- Color: Red (#EF4444)
- Label: "Disputed" or "Test Expired"
- Shows: Reason (e.g., "Test over 6 months old", "User reports mismatch")

### Additional Trust Indicators

**Consistency Badge:**
```
✅ Consistent Profile
└─ Last 3 tests match (±10%)
```

**Freshness Badge:**
```
🕒 Tested 2 weeks ago
└─ Recent test (good)

⚠️ Tested 8 months ago
└─ Outdated test (caution)
```

**Community Consensus:**
```
👥 42 confirmations
└─ High confidence

👥 2 confirmations
└─ Low sample size
```

---

## 🎮 How It Plugs Into Unified Gamification

**Simple Rule:** Every meaningful action calls the backend event logger.

### Event Tracking (You Just Need to Call One Function)

Every action in Terpene Hunter should trigger:
```javascript
await logActivityEvent(
  app_id: 'terpene_hunt',
  event_key: 'terpene.encounter.log',  // or other event key
  ref_id: placeId,                      // place/product/batch ID
  metadata: { objective: 'focus', terpenes: ['limonene'] }
)
```

This automatically:
1. Logs event to append-only ledger
2. Computes hash chain
3. Awards XP/HEMP/NADA (based on reward_rules)
4. Triggers achievements
5. Updates quest progress

### Starter Event Keys

**Core Gameplay:**
- `terpene.compass.open` → User opens compass (first-time bonus)
- `terpene.place.checkin` → User checks in at location (+10 XP, +5 HEMP)
- `terpene.encounter.log` → User logs encounter (+50 XP, +25 HEMP)
- `terpene.specimen.create` → User creates specimen (+100 XP, +50 HEMP)

**Discovery:**
- `terpene.discovery.first_terpene` → First time logging specific terpene (+25 XP)
- `terpene.discovery.all_citrus` → Logged all citrus terpenes (+100 XP)

**Verification:**
- `terpene.token.redeem.adult` → Adult token scanned (+0 XP, unlocks features)
- `terpene.token.redeem.seal` → Seal token scanned (+50 XP, trust boost)

**Social:**
- `terpene.specimen.share` → Share specimen (+10 XP)
- `terpene.trust.community_confirm` → Confirm someone's specimen (+5 XP)

### UI Feedback for Rewards

**Always show feedback when user earns points:**

**Small Toast (bottom):**
```
┌─────────────────┐
│ +50 XP • +25 HEMP │
└─────────────────┘
```

**Big Celebration (first-time achievement):**
```
┌─────────────────────────────────┐
│          🏆                      │
│   Achievement Unlocked!          │
│                                 │
│   Limonene Hunter               │
│   Logged 10 limonene encounters │
│                                 │
│   +250 XP • +100 HEMP            │
│                                 │
│         [Awesome!]              │
└─────────────────────────────────┘
```

**Progress Bar Updates:**
```
Citrus Power: ████████░░ 42% → 48%
             └─ Animate fill
```

---

## 🔐 Security & "Merkle-Ready" Audit (Designer-Friendly Explanation)

**Why This Matters:**
We need the game to be **hard to cheat** and **future-proof for audits** (if regulators or partners ask for proof later).

### The Simple Version

Think of it like a **tamper-evident receipt book**:

1. **Every action = receipt** (event log entry)
2. **Receipts are chained** (each references previous, like blockchain but in Postgres)
3. **Can't rewrite history** (append-only table, no edits/deletes)
4. **Daily summary hash** (Merkle root = one fingerprint for all day's activity)
5. **Future: Publish hash** (can anchor to blockchain/transparency log if needed)

### What You Need to Do

**DON'T:**
- ❌ Update user counters directly (e.g., `user.xp += 50`)
- ❌ Delete or edit logged events
- ❌ Store sensitive data in events (no IDs, no health info)

**DO:**
- ✅ Always call `logActivityEvent()` for actions
- ✅ Read user progress from `user_progress` table (cached state)
- ✅ Let backend handle XP/HEMP calculations
- ✅ Show event history from `activity_events` if user wants details

**Benefits:**
- Admin can export verified proofs without exposing personal data
- Shops can see aggregate trust metrics
- Future: Can prove "this user logged 1000 encounters" to partners
- Anti-cheat: Can detect suspicious patterns

---

## 🛠️ Admin & Partner Shop Tools (Minimal v1)

**Not building full admin yet, but design these for later:**

### Partner Shop Dashboard (Staff Mode)

**Issue Adult Token:**
```
┌─────────────────────────────────┐
│  Generate Adult Verification    │
│                                 │
│  Shop: Hemp Haven Dispensary    │
│  Staff: @john_doe               │
│                                 │
│  Valid for: [30 days ▼]         │
│                                 │
│  [Generate QR Code]             │
│                                 │
│  ┌───────────┐                  │
│  │ QR CODE   │ ← Show to customer
│  │           │   to scan
│  └───────────┘                  │
└─────────────────────────────────┘
```

**Issue Seal Token (Link to Batch):**
```
┌─────────────────────────────────┐
│  Generate Batch Seal            │
│                                 │
│  Select Batch:                  │
│  [Purple Haze #042 ▼]           │
│                                 │
│  Valid for: [7 days ▼]          │
│                                 │
│  [Generate QR Code]             │
│                                 │
│  ┌───────────┐                  │
│  │ QR CODE   │ ← Print on sticker
│  │ SEAL #042 │   for product
│  └───────────┘                  │
└─────────────────────────────────┘
```

**Upload COA (Lab Certificate):**
```
┌─────────────────────────────────┐
│  Upload Lab COA                 │
│                                 │
│  Batch: Purple Haze #042        │
│  Tested: [Dec 15, 2025]         │
│  Lab: [Select Lab ▼]            │
│                                 │
│  Certificate (PDF/Image):       │
│  [Upload File]                  │
│                                 │
│  Terpene Values:                │
│  Limonene: [2.3] %              │
│  Myrcene:  [1.8] %              │
│  Pinene:   [1.2] %              │
│  [+ Add Terpene]                │
│                                 │
│         [Submit]                │
└─────────────────────────────────┘
```

**Design Priority:** Low for v1. Just make sure user-facing QR scan works. Admin tools can be web-based.

---

## 🎨 Visual Design Direction

### Overall Aesthetic
**DEWII OS Style:**
- Glassy panels (frosted glass backgrounds)
- Solarpunk futuristic (sustainable tech vibes)
- Comic-book clarity (bold text, clear hierarchy)
- Transparent overlays (no heavy gradients)
- Cosmic touches (subtle star fields, orbs)

**Terpene Hunter Specific:**
- **Compass/Radar vibe** (navigation, discovery)
- **Museum vibe** (Herbarium = gallery)
- **Scientific-but-playful** (Trust meters, lab coats 🥼 + games 🎮)

### Motion & Animation

**Compass Wheel:**
- Subtle rotation based on phone orientation (gyroscope)
- Smooth spring animations when changing objective
- "Ping" pulse when near strong match

**Map Pins:**
- Bounce-in animation when appearing
- Glow pulse for high-trust locations
- Tap → scale up + show detail card

**Reward Toasts:**
- Slide up from bottom
- Confetti/particle burst
- Numbers count up (e.g., XP: 0 → 50)
- Progress bars animate smoothly

**Photo Cards (Herbarium):**
- Stagger-in animation (cascading)
- Lift-and-float on tap (3D transform)
- Shimmer on sealed specimens

### Color Palette (Terpene-Specific)

**Terpene Family Colors:**
- 🍊 **Citrus** (Limonene, Terpinolene): Orange (#FB923C)
- 🌲 **Pine** (Pinene): Teal (#14B8A6)
- 🌸 **Floral** (Linalool, Terpineol): Purple (#C084FC)
- 🌿 **Earthy** (Myrcene, Humulene): Green (#10B981)
- 🌶️ **Spicy** (Caryophyllene): Red (#F87171)
- 🍇 **Herbal** (Ocimene, Bisabolol): Lavender (#A78BFA)

**Trust Level Colors:**
- ⭐⭐⭐⭐⭐ Lab COA: Gold (#F59E0B)
- ⭐⭐⭐⭐ Shop Verified: Silver (#9CA3AF)
- ⭐⭐⭐ Community: Bronze (#D97706)
- ⭐⭐ Unverified: Gray (#6B7280)
- ⭐ Disputed: Red (#EF4444)

---

## 📦 Output Required

**Please deliver:**

1. **Full Terpene Hunter mini-app** with all 6 core screens
2. **Connected to existing DEWII data:**
   - Uses `places` table
   - Uses `products` table
   - Uses `user_progress` for XP/HEMP display
3. **Event tracking integrated:**
   - All actions call `logActivityEvent()`
   - Reward toasts show XP/HEMP earned
4. **Access gating:**
   - Locked state for non-PRO/non-adult users
   - Bangkok geo-check (can be client-side for now)
   - Adult verification QR flow
5. **Trust UI:**
   - Trust meters on all terpene data
   - COA view buttons (links)
   - Seal badges on verified specimens

---

## 🗂️ Data Schema Reference (Your Current Tables)

**If you have these tables, use them exactly:**
- `places` (id, name, city, country, lat, lng, ...)
- `products` (id, place_id, name, ...)
- `profiles` (id, display_name, ...)
- `user_progress` (user_id, user_level, current_xp, hemp_points, nada_points, ...)

**NEW tables for Terpene Hunter (will be created):**
- `terpenes` (reference data: limonene, myrcene, etc.)
- `product_batches` (batch_id, product_id, place_id, batch_code, tested_at, coa_url, ...)
- `batch_terpenes` (batch_id, terpene_id, amount, unit, ...)
- `specimens` (owner_id, place_id, batch_id, photos, notes, is_public, captured_at, ...)
- `encounters` (user_id, place_id, product_id, batch_id, objective, tags, mood_before, mood_after, created_at, ...)
- `issued_tokens` (code_hash, kind adult/seal, place_id, batch_id, expires_at, redeemed_by, ...)
- `user_age_gates` (user_id, adult_verified_until, verified_by_place_id, ...)

**Activity Events (unified system):**
- `activity_events` (user_id, app_id, event_key, ref_id, metadata, event_hash, prev_hash, ...)
- `reward_rules` (app_id, event_key, xp, hemp, nada, cooldown, daily_cap, requires_pro, requires_adult, requires_city, ...)

---

## 🚀 Let's Ship This!

**You have everything you need:**
- Clear screen designs
- Trust/security explanation
- Event tracking pattern
- Access gating rules

**If you need SQL table creation scripts or backend function details, those are ready too.** But for now, focus on **designing the beautiful UI** that makes terpene hunting feel like a game, not a spreadsheet.

**Questions? Clarifications?** Drop them and I'll help refine!

Let's create the first Pokemon GO for cannabis education 🧭🌿✨
