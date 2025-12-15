# 🎨 FIGMA DESIGN BRIEF: Three Rails Marketplace

**Project:** Hemp'in Universe Marketplace Evolution  
**Date:** December 5, 2024  
**For:** Figma Design Team

---

## 📋 OVERVIEW

We're evolving Hemp'in Universe from a gamified magazine into a **three-rail marketplace operating system**:

1. **C2C SWAP Shop** - Barter/exchange marketplace
2. **B2C/B2B SWAG Market** - Product commerce
3. **B2B RFP/Discovery** - Professional matching

**Design Philosophy:** Maintain the solarpunk cosmic aesthetic while adding marketplace functionality.

---

## 🎯 DESIGN PRIORITIES

### **Phase 1: Foundation (Weeks 1-2)**
1. User Profile Redesign
2. Messaging/Inbox System
3. Discovery Match Form (already planned, refine)

### **Phase 2: SWAP Launch (Weeks 3-4)**
4. Inventory Management
5. SWAP Listings Browse
6. SWAP Proposal Flow

### **Phase 3: SWAG Enhancement (Weeks 5-6)**
7. Enhanced Product Pages
8. Quote Request System

---

## 🎨 DESIGN REQUESTS

### **1. USER PROFILE REDESIGN** ⭐ Priority 1

#### **Public Profile View**

**Layout:**
- Hero section with banner image + avatar (like org profiles)
- Display name, location (city, country flag), roles
- Bio section
- Trust score badge/indicator
- Tabs:
  - Overview (stats, badges, achievements)
  - Inventory (items for swap - if any)
  - Activity (recent swaps, purchases, etc.)
  - About

**Key Elements:**
- **Avatar:** Circular, 120px, upload functionality
- **Banner:** 1200x300px, optional gradient if none uploaded
- **Trust Score:** Display as badge or meter
  - "Trusted Swapper" badge if score > 100
  - "Verified" checkmark if ID verified
- **Roles:** Pills/chips showing their roles
  - "Consumer" "Professional" "Founder" etc.
  - Use different colors for different role types
- **Stats Cards:**
  - Completed swaps: X
  - Organizations supported: X
  - Days on platform: X
  - Trust score: X points

**Example Layout:**
```
┌────────────────────────────────────────────┐
│           BANNER IMAGE                      │
│  ┌─────┐                                   │
│  │ AVA │  Display Name    📍 City, Country│
│  │ TAR │  @username                        │
│  └─────┘  Roles: [Consumer] [Professional]│
│           ⭐ Trust Score: 95                │
├────────────────────────────────────────────┤
│  Bio: Short description about the user...  │
├────────────────────────────────────────────┤
│  [Overview] [Inventory] [Activity] [About] │
├────────────────────────────────────────────┤
│                                             │
│  CONTENT BASED ON ACTIVE TAB                │
│                                             │
└────────────────────────────────────────────┘
```

#### **Profile Edit View**

**Form Sections:**
1. **Basic Info**
   - Upload avatar
   - Upload banner
   - Display name
   - Username (if we add this)
   - Bio (textarea, 500 chars)

2. **Location**
   - Country dropdown
   - Region/state (text input)
   - City (text input)
   - Make location public? (toggle)

3. **Roles** (multi-select checkboxes)
   - □ Consumer
   - □ Professional
   - □ Founder/Entrepreneur
   - □ Designer
   - □ Researcher
   - □ Farmer/Cultivator
   - □ Buyer/Procurement
   - □ Other: ______

4. **Interests** (multi-select checkboxes)
   - □ Textiles & Fashion
   - □ Construction Materials
   - □ Food & Nutrition
   - □ Personal Care & Wellness
   - □ Cultivation & Farming
   - □ Research & Education
   - □ Other: ______

5. **Professional Info** (collapsible)
   - Professional bio (textarea)
   - What I'm looking for (textarea)
   - What I can offer (textarea)
   - Organization affiliations (select from owned orgs)

6. **Privacy**
   - Profile visibility: [Public / Private / Verified Only]
   - Show inventory publicly? (toggle)
   - Show activity publicly? (toggle)

**Design Notes:**
- Use accordion/tabs to avoid overwhelming users
- Save button should be sticky at bottom
- Show "Unsaved changes" warning if they navigate away

---

### **2. MESSAGING / INBOX SYSTEM** ⭐ Priority 1

#### **Inbox List View**

**Layout:** Two-column (desktop) or full-width (mobile)

**Left Column: Thread List**
- Search/filter threads
- Filter by type: [All] [SWAP] [SWAG] [RFP]
- Filter by status: [All] [Open] [In Progress] [Completed]
- Thread items show:
  - Avatar(s) of participant(s)
  - Subject line
  - Preview of last message (1 line)
  - Unread indicator (dot or count)
  - Timestamp
  - Type badge: [SWAP] [SWAG] [RFP]
  - Status indicator

**Right Column: Thread Detail**
- Header:
  - Participants (avatars + names)
  - Subject
  - Thread type badge
  - Status dropdown (open/in progress/completed)
  - Actions: [...] menu (archive, mute, report)
- Messages:
  - Sender avatar
  - Sender name
  - Message content
  - Timestamp
  - Read receipts (if enabled)
- Composer:
  - Text input
  - Attach image button
  - Send button
  - Character count

**Mobile Layout:**
- List view by default
- Tap thread → opens full-screen detail
- Back button returns to list

**Example Layout (Desktop):**
```
┌─────────────────┬───────────────────────────┐
│ 🔍 Search       │ Thread with Jane Doe      │
│ Filter: All ▼   │ Type: [SWAP] Status: Open │
├─────────────────┼───────────────────────────┤
│ 👤 Alice        │                           │
│ [SWAP] Re: Hemp │  👤 Alice: "I'm interested"│
│ 2h ago • 1 new  │  12:30 PM                 │
├─────────────────┤                           │
│ 👤 Bob          │  You: "Great! Here's..."  │
│ [RFP] Match...  │  12:45 PM                 │
│ 1d ago          │                           │
├─────────────────┤                           │
│ 👤 Org Name     │  👤 Alice: "Sounds good!" │
│ [SWAG] Quote... │  1:15 PM                  │
│ 3d ago          │                           │
├─────────────────┼───────────────────────────┤
│                 │ ┌─────────────────────┐  │
│                 │ │ Type message...      │  │
│                 │ └─────────────────────┘  │
│                 │ [📎] [Send]             │
└─────────────────┴───────────────────────────┘
```

**Design Notes:**
- Use different badge colors for thread types:
  - SWAP: Emerald/green
  - SWAG: Cyan/blue
  - RFP: Purple/indigo
- Unread messages: bold text + colored dot
- System messages (e.g., "Swap accepted"): different style, centered
- Support image attachments (show thumbnails inline)

---

### **3. INVENTORY MANAGEMENT** ⭐ Priority 2

#### **My Inventory Page**

**Header:**
- Title: "My Inventory"
- Stats: X items owned, Y available for swap
- CTA: [+ Add Item]

**Grid View:**
- Card layout (3-4 columns desktop, 2 mobile)
- Each card shows:
  - Main photo
  - Title
  - Condition badge (Mint, Excellent, Good, Fair, Poor)
  - "Available for swap" toggle
  - [Edit] [Delete] buttons (on hover)

**List View:** (alternative)
- Table format
- Columns: Photo, Title, Condition, Swap?, Actions

**Add/Edit Item Modal:**

**Form:**
1. **Photos**
   - Main photo upload (required)
   - Additional photos (up to 5)
   - Drag to reorder

2. **Basic Info**
   - Title (required)
   - Description
   - Link to original product? (search products)
   - Condition (dropdown):
     - Mint (like new, never used)
     - Excellent (barely used, no flaws)
     - Good (used, minor wear)
     - Fair (used, visible wear)
     - Poor (heavily used, functional)

3. **Story & Provenance**
   - How did you get it? (dropdown):
     - Purchased from DEWII
     - Purchased elsewhere
     - Received as gift
     - Previous swap
     - Other
   - Item story (textarea, optional):
     - "I bought this at... I love it because... Ready to swap because..."

4. **Swap Settings**
   - Available for swap? (toggle)
   - If yes:
     - Minimum trade value estimate ($)
     - Preferred swap categories (checkboxes)

**Design Notes:**
- Make photo upload drag-and-drop friendly
- Show character count for story (max 500)
- Preview how card will look in SWAP shop

---

### **4. SWAP SHOP BROWSE** ⭐ Priority 2

#### **Browse Listings Page**

**Header:**
- Title: "SWAP Shop"
- Subtitle: "Trade items you love with the community"
- CTA: [List an Item]

**Filters Sidebar (Desktop) or Drawer (Mobile):**
- Search by keyword
- Category (from product categories)
- Condition
  - □ Mint
  - □ Excellent
  - □ Good
  - □ Fair
  - □ Poor
- Location (nearby swaps)
- Sort by:
  - Newest first
  - Oldest first
  - Most popular
  - Nearest to me

**Grid View:**
- Card layout (3-4 columns)
- Each card:
  - Main photo
  - Title (truncated)
  - Condition badge
  - Owner avatar + name
  - Location (city, country)
  - "Popular" or "New" badge if applicable
  - ❤️ Save button

**Item Detail Page:**

**Layout:**
```
┌────────────────────┬──────────────────┐
│  Photo Gallery     │ Title            │
│  (main + thumbs)   │ Condition: Good  │
│                    │ Owner: @username │
│                    │ 📍 Location      │
│                    │                  │
│                    │ [💬 Propose Swap]│
│                    │ [❤️ Save]        │
├────────────────────┴──────────────────┤
│ Description                            │
│ Lorem ipsum dolor sit amet...          │
├────────────────────────────────────────┤
│ Item Story                             │
│ "I bought this at... I love it..."     │
├────────────────────────────────────────┤
│ Provenance                             │
│ • Purchased from Org Name (2023)       │
│ • Owned by @previous_user (2024)       │
│ • Current owner since May 2024         │
└────────────────────────────────────────┘
```

**Design Notes:**
- Photo gallery: main image + thumbnail strip (swipe on mobile)
- Condition badge: color-coded (green→yellow→red)
- Provenance: visual timeline (like a family tree)
- Owner profile: clickable, shows trust score

---

### **5. SWAP PROPOSAL FLOW** ⭐ Priority 2

#### **Propose Swap Modal**

**Triggered:** User clicks "Propose Swap" on item detail page

**Steps:**

**Step 1: Select Your Items**
- "What will you offer?"
- Grid of user's inventory items (available for swap)
- Multi-select (can offer multiple items)
- Show running "total value estimate"
- [Next]

**Step 2: Balance the Trade**
- Show:
  - Items you're offering: $X
  - Item you want: $Y
  - Difference: $Z
- Options:
  - Offer exact swap (if values match)
  - Add NADA to balance ($Z = Z NADA)
  - Propose as-is and negotiate
- [Next]

**Step 3: Add Message**
- "Tell them why you want to swap"
- Textarea (500 chars)
- Optional: Attach photo
- [Send Proposal]

**Confirmation:**
- "Proposal sent!"
- "You'll be notified when they respond"
- [Go to Inbox]

#### **Proposal Inbox View**

**Incoming Proposals:**
- List of proposals received
- Each shows:
  - Proposer avatar + name + trust score
  - Items they're offering (photos)
  - NADA they're adding (if any)
  - Their message
  - [Accept] [Decline] [Counter]

**Outgoing Proposals:**
- List of proposals sent
- Status: Pending / Accepted / Declined / Countered
- [View] [Cancel]

**Design Notes:**
- Make value comparison visual (bar chart?)
- Trust score prominently displayed
- Accept button should be prominent but require confirmation
- Counter-proposal: opens proposal flow pre-filled

---

### **6. ENHANCED PRODUCT PAGES** ⭐ Priority 3

**Add B2B Indicators:**

**Product Card:**
- Add badge: [B2C] or [B2B]
- B2B products show "Request Quote" instead of price

**Product Detail Page:**

**For B2B Products, add:**
- "Request Quote" button (prominent)
- Specifications section
- Minimum order quantity (MOQ)
- Lead time estimate
- Bulk pricing tiers (if available)

**Design Notes:**
- B2B products: more professional, less "shopp-y"
- Use table layout for specifications
- Quote button: different color than "Buy Now"

---

### **7. QUOTE REQUEST MODAL** ⭐ Priority 3

**Triggered:** User clicks "Request Quote" on B2B product

**Form:**
1. **Quantity**
   - Number input
   - Unit (dropdown: kg, pieces, meters, etc.)

2. **Specifications**
   - Textarea
   - "Describe specific requirements, certifications needed, etc."

3. **Timeline**
   - When do you need this by?
   - Date picker

4. **Budget Range** (optional)
   - Dropdown:
     - Under $1,000
     - $1,000 - $5,000
     - $5,000 - $25,000
     - $25,000 - $100,000
     - $100,000+
     - Prefer not to say

5. **Additional Info**
   - Textarea
   - "Any other details the supplier should know?"

**CTA:** [Submit Quote Request]

**Confirmation:**
- "Quote request sent to [Organization Name]!"
- "They'll respond via messaging"
- [Go to Inbox]

**Design Notes:**
- Keep form short and clear
- Show organization logo/name in modal header
- Link to their profile for more info

---

### **8. DISCOVERY MATCH FORM** (Already planned, just refine)

**Existing plan is good, but add:**
- Progress indicator (Step 1 of 3, etc.)
- Save draft functionality
- Preview before submission
- Estimated match timeline ("Matches typically sent within 2-3 business days")

---

## 🎨 DESIGN SYSTEM GUIDELINES

### **Colors (Maintain Existing)**
- **Primary:** Emerald gradients (#10b981 → #06b6d4)
- **SWAP:** Green/Emerald (#10b981)
- **SWAG:** Cyan/Blue (#06b6d4)
- **RFP:** Purple/Indigo (#8b5cf6)
- **Background:** Dark (#0f172a, #1e293b)

### **Typography**
- Use existing Inter font family
- Maintain cosmic/solarpunk feel

### **Components to Reuse**
- Badges
- Buttons
- Cards
- Modals
- Form inputs
- Avatars
- Organization profiles (as reference for user profiles)

### **New Components Needed**
- Thread list item
- Message bubble
- Inventory item card
- Swap proposal card
- Trust score badge
- Verification checkmark
- Provenance timeline

---

## 📱 RESPONSIVE CONSIDERATIONS

### **Mobile-First for:**
- SWAP shop (browsing on phone is common)
- Messaging (chat = mobile)
- Profile viewing

### **Desktop-Optimized for:**
- Inventory management (easier with keyboard/mouse)
- Quote requests (more detail needed)
- Admin dashboards

---

## ♿ ACCESSIBILITY

- All interactive elements keyboard navigable
- Color contrast WCAG AA minimum
- Alt text for all images
- ARIA labels for complex components
- Focus indicators visible
- Screen reader friendly

---

## 📐 DELIVERABLES REQUESTED

### **Phase 1 (Weeks 1-2):**
1. User profile redesign (public + edit views)
   - Desktop + Mobile
   - All tabs/states
2. Messaging system
   - Inbox list + detail
   - Desktop + Mobile
3. Discovery Match form refinements
   - Progress indicators
   - Confirmation screens

### **Phase 2 (Weeks 3-4):**
4. Inventory management
   - Grid view + Add/edit modal
5. SWAP shop browse
   - Listings grid + filters + item detail
6. Swap proposal flow
   - All steps + confirmations

### **Phase 3 (Weeks 5-6):**
7. Enhanced product pages (B2B indicators)
8. Quote request modal

---

## 🎯 SUCCESS CRITERIA

**Good Design Will:**
- ✅ Maintain solarpunk cosmic aesthetic
- ✅ Make marketplace functions feel native (not bolted-on)
- ✅ Build trust (show verification, reviews, provenance)
- ✅ Reduce friction (clear CTAs, simple flows)
- ✅ Work beautifully on mobile and desktop
- ✅ Be accessible to all users
- ✅ Excite early adopters about the vision

---

## 📞 QUESTIONS FOR DESIGNER

1. Should user profiles have customizable themes (like orgs do)?
2. How should we visualize trust scores? (badge, meter, number?)
3. Should SWAP items have a "make offer" chat before formal proposal?
4. Do we need video support in messaging?
5. Should there be a "Featured Swaps" section curated by admins?

---

**Prepared:** December 5, 2024  
**For:** Figma Design Team  
**Next:** Review + Design Kickoff

Let's build the hemp industry operating system! 🌿🚀
