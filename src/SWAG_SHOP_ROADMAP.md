# 🛍️ DEWII SWAG SHOP - COMPLETE ROADMAP

## 📋 CURRENT STATE (✅ COMPLETED)

### Backend Infrastructure
- ✅ `wallets` table with NADA points tracking
- ✅ `user_swag_items` table for purchased items
- ✅ `nada_transactions` table for transaction history
- ✅ Purchase endpoint (`/purchase-swag-item`) with wallet integration
- ✅ Fetch owned items endpoint (`/user-swag-items/:userId`)
- ✅ Transaction recording for purchases
- ✅ Rollback on failure

### Frontend Shop UI
- ✅ Beautiful Swag Shop modal with hemp texture
- ✅ Category filtering (All, Merch, Themes, Badges, Features)
- ✅ NADA balance display
- ✅ Purchase confirmation modal with ripple animations
- ✅ "Owned" badges on purchased items
- ✅ Limited stock display
- ✅ Insufficient NADA warnings
- ✅ 10 initial items across 4 categories

### Items Available
**Merch (2 items):**
- DEWII Hemp Tee (500 NADA) - Limited 25
- Hemp Universe Hoodie (1000 NADA) - Limited 15

**Themes (3 items):**
- Solarpunk Dreams (150 NADA)
- Midnight Hemp (150 NADA)
- Golden Hour (150 NADA)

**Badges (3 items):**
- Founder Badge (250 NADA) - Limited 100
- Hemp Pioneer (200 NADA)
- NADA Whale (500 NADA)

**Features (2 items):**
- Custom Profile Banner (300 NADA)
- Priority Support (400 NADA)

---

## 🎯 PHASE 1: DIGITAL ITEMS ACTIVATION (IMMEDIATE)
**Goal:** Make purchased digital items actually work

### 1.1 Theme System Implementation
**Status:** 🔴 NOT STARTED
**Priority:** 🔥 IMMEDIATE (User just bought Midnight Hemp)

**Tasks:**
- [ ] Create theme definitions for Solarpunk Dreams, Midnight Hemp, Golden Hour
- [ ] Add theme storage to user profile (currently only has `homeButtonTheme`)
- [ ] Create theme selector UI in Account Settings
- [ ] Apply theme globally when selected
- [ ] Persist theme selection to backend
- [ ] Show "locked" state for unowned themes
- [ ] Preview themes before purchasing (in shop)

**Files to modify:**
- `/styles/globals.css` - Define new theme CSS variables
- `/components/AccountSettings.tsx` - Add theme selector
- `/components/SwagShop.tsx` - Add theme preview
- `/App.tsx` - Add theme state management
- `/supabase/functions/server/index.tsx` - Update profile endpoint

**Theme Definitions Needed:**

```css
/* Solarpunk Dreams */
--emerald-primary, --gold-accents, organic animations

/* Midnight Hemp */  
--dark-base, --bioluminescent-green, --purple-accents

/* Golden Hour */
--amber-primary, --orange-warm, --yellow-glow, sunset gradients
```

---

### 1.2 Badge System Implementation
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Create badge display component
- [ ] Add badges to user profile/dashboard
- [ ] Create badge collection page
- [ ] Add badge rarity indicators
- [ ] Show equipped badge on posts/comments
- [ ] Allow users to select primary badge
- [ ] Badge achievement notifications

**Files to create:**
- `/components/BadgeDisplay.tsx` - Badge UI component
- `/components/BadgeCollection.tsx` - Full collection page

**Files to modify:**
- `/components/UserDashboard.tsx` - Show badges
- `/components/ArticleCard.tsx` - Show author's badge (future)

---

### 1.3 Custom Profile Banner Feature
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM (User bought this)

**Tasks:**
- [ ] Create banner upload UI in Account Settings
- [ ] Integrate with Supabase Storage for banner images
- [ ] Create banner bucket (`make-053bcd80-profile-banners`)
- [ ] Add image validation (size, format, dimensions)
- [ ] Display banner in User Dashboard
- [ ] Add banner to profile views
- [ ] Default fallback banner for non-owners

**Backend Tasks:**
- [ ] Create storage bucket on server startup
- [ ] Add upload endpoint (`/upload-profile-banner`)
- [ ] Add banner URL to user profile table
- [ ] Generate signed URLs for private banners

**Files to create:**
- `/components/ProfileBannerUpload.tsx` - Upload UI

**Files to modify:**
- `/components/UserDashboard.tsx` - Display banner
- `/components/AccountSettings.tsx` - Add upload section
- `/supabase/functions/server/index.tsx` - Add upload endpoint

---

### 1.4 Priority Support Feature
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Add `priority_support` flag to user profile
- [ ] Create support request system
- [ ] Flag priority users in admin panel
- [ ] Add priority badge in support queue
- [ ] Email notifications for priority users

---

## 🎯 PHASE 2: PHYSICAL ITEMS & FULFILLMENT (CORE E-COMMERCE)
**Goal:** Enable actual physical merchandise sales with shipping

### 2.1 Shipping Address System
**Status:** 🔴 NOT STARTED
**Priority:** 🔥 HIGH

**Tasks:**
- [ ] Create `shipping_addresses` table
- [ ] Build address collection modal
- [ ] Add address validation
- [ ] Store multiple addresses per user
- [ ] Set default shipping address
- [ ] Address editing/deletion

**Database Schema:**
```sql
shipping_addresses:
- id (uuid, primary key)
- user_id (uuid, foreign key)
- full_name (text)
- address_line1 (text)
- address_line2 (text, nullable)
- city (text)
- state_province (text)
- postal_code (text)
- country (text)
- phone (text)
- is_default (boolean)
- created_at (timestamp)
```

**Files to create:**
- `/components/ShippingAddressModal.tsx` - Address form
- `/components/ShippingAddressList.tsx` - Manage addresses

---

### 2.2 Order Management System
**Status:** 🔴 NOT STARTED
**Priority:** 🔥 HIGH

**Tasks:**
- [ ] Create `orders` table
- [ ] Create `order_items` table  
- [ ] Generate unique order numbers
- [ ] Order status tracking (pending, processing, shipped, delivered)
- [ ] Order history page for users
- [ ] Order details view
- [ ] Packing slip generation

**Database Schema:**
```sql
orders:
- id (uuid, primary key)
- order_number (text, unique)
- user_id (uuid, foreign key)
- total_nada (integer)
- status (text: pending, processing, shipped, delivered, cancelled)
- shipping_address_id (uuid, foreign key)
- tracking_number (text, nullable)
- shipping_carrier (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
- shipped_at (timestamp, nullable)
- delivered_at (timestamp, nullable)

order_items:
- id (uuid, primary key)
- order_id (uuid, foreign key)
- item_id (text)
- item_name (text)
- item_type (text: physical, digital, feature)
- price_nada (integer)
- quantity (integer)
- size (text, nullable)
- color (text, nullable)
- metadata (jsonb, nullable)
```

**Files to create:**
- `/components/OrderHistory.tsx` - User's order list
- `/components/OrderDetails.tsx` - Single order view

---

### 2.3 Checkout Flow Enhancement
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Separate checkout for physical vs digital items
- [ ] Collect size/color for clothing
- [ ] Require shipping address for physical items
- [ ] Order confirmation modal
- [ ] Post-purchase redirect to order details
- [ ] Order confirmation email

**Purchase Flow (Physical Items):**
```
1. Click Purchase → 2. Select Size/Color → 3. Confirm/Add Shipping → 
4. Review Order → 5. Confirm Purchase → 6. Order Confirmation
```

**Files to modify:**
- `/components/SwagShop.tsx` - Add checkout steps

---

### 2.4 Inventory Management
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Create `inventory` table
- [ ] Track stock levels per item/variant
- [ ] Auto-decrement on purchase
- [ ] Show "Out of Stock" badges
- [ ] Low stock warnings in admin
- [ ] Restock notifications

**Database Schema:**
```sql
inventory:
- id (uuid, primary key)
- item_id (text)
- variant (text, nullable) // e.g., "black-medium", "white-large"
- stock_quantity (integer)
- low_stock_threshold (integer)
- updated_at (timestamp)
```

---

### 2.5 Size/Variant Selection
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Add size selector to merch items
- [ ] Add color selector to merch items
- [ ] Variant-specific images
- [ ] Size chart modal
- [ ] Inventory per variant

**Files to modify:**
- `/components/SwagShop.tsx` - Add variant selectors

---

## 🎯 PHASE 3: ADMIN & FULFILLMENT TOOLS
**Goal:** Manage shop from admin panel

### 3.1 Admin Shop Management
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Add "Shop Management" tab to Admin Panel
- [ ] View all items with inventory
- [ ] Add new items
- [ ] Edit existing items
- [ ] Toggle item visibility
- [ ] Manage limited stock items
- [ ] Upload item images

**Files to modify:**
- `/components/AdminPanel.tsx` - Add shop management section

---

### 3.2 Order Fulfillment Dashboard
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] View pending orders
- [ ] Mark orders as processing
- [ ] Add tracking numbers
- [ ] Mark as shipped
- [ ] Mark as delivered
- [ ] Export packing lists
- [ ] Filter by status/date
- [ ] Search orders

**Files to create:**
- `/components/AdminOrderFulfillment.tsx` - Order management

---

### 3.3 Inventory Dashboard
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] View stock levels
- [ ] Low stock alerts
- [ ] Restock items
- [ ] Inventory history
- [ ] Export inventory reports

---

## 🎯 PHASE 4: ENHANCED SHOPPING EXPERIENCE
**Goal:** Make shopping delightful and feature-rich

### 4.1 Shopping Cart System
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW (Nice to have)

**Tasks:**
- [ ] Add items to cart
- [ ] Cart icon in header with count
- [ ] View cart modal
- [ ] Edit quantities in cart
- [ ] Remove from cart
- [ ] Multi-item checkout
- [ ] Cart persistence across sessions
- [ ] Bundle discounts

**Files to create:**
- `/components/ShoppingCart.tsx` - Cart UI
- `/components/CartIcon.tsx` - Header icon

---

### 4.2 Item Detail Pages
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Dedicated page per item
- [ ] Multiple product images
- [ ] Image gallery/carousel
- [ ] Detailed descriptions
- [ ] Size charts
- [ ] Care instructions (for merch)
- [ ] Related items
- [ ] Reviews section

**Files to create:**
- `/components/ItemDetailPage.tsx` - Full item view

---

### 4.3 Wishlist System
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Add to wishlist button
- [ ] Wishlist page
- [ ] Share wishlist
- [ ] Notify when item on sale
- [ ] Move wishlist to cart

**Database Schema:**
```sql
wishlists:
- id (uuid, primary key)
- user_id (uuid, foreign key)
- item_id (text)
- added_at (timestamp)
```

---

### 4.4 Search & Filter Enhancements
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Search by item name
- [ ] Price range filter
- [ ] Sort by: newest, price, popularity
- [ ] "New" badges on recent items
- [ ] "Sale" badges on discounted items

---

### 4.5 Reviews & Ratings
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Leave reviews on purchased items
- [ ] Star ratings
- [ ] Photo reviews
- [ ] Verified purchase badges
- [ ] Helpful/unhelpful votes
- [ ] Sort reviews

**Database Schema:**
```sql
item_reviews:
- id (uuid, primary key)
- user_id (uuid, foreign key)
- item_id (text)
- order_id (uuid, foreign key)
- rating (integer, 1-5)
- review_text (text, nullable)
- photos (text[], nullable)
- helpful_count (integer)
- created_at (timestamp)
```

---

## 🎯 PHASE 5: NOTIFICATIONS & COMMUNICATIONS
**Goal:** Keep users informed about orders and items

### 5.1 Email System
**Status:** 🔴 NOT STARTED
**Priority:** 🟡 MEDIUM

**Tasks:**
- [ ] Order confirmation emails
- [ ] Shipping confirmation with tracking
- [ ] Delivery confirmation
- [ ] Low stock alerts (admin)
- [ ] New item announcements
- [ ] Sale notifications

**Integration:**
- Supabase doesn't have built-in email (need to document manual setup)

---

### 5.2 In-App Notifications
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Order status updates
- [ ] New items available
- [ ] Items back in stock
- [ ] Limited item alerts
- [ ] NADA balance low warnings

---

## 🎯 PHASE 6: ADVANCED FEATURES
**Goal:** Premium shop experience

### 6.1 Gift/Redeem Codes
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Generate gift codes
- [ ] Redeem codes for items
- [ ] Redeem codes for NADA
- [ ] One-time use codes
- [ ] Expiring codes
- [ ] Admin code management

**Database Schema:**
```sql
gift_codes:
- id (uuid, primary key)
- code (text, unique)
- type (text: item, nada, bundle)
- value (jsonb) // item_id or nada_amount
- max_uses (integer)
- current_uses (integer)
- expires_at (timestamp, nullable)
- created_by (uuid)
- created_at (timestamp)
```

---

### 6.2 Sales & Promotions
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Discount codes
- [ ] Flash sales
- [ ] Bundle deals
- [ ] First purchase discount
- [ ] Loyalty rewards
- [ ] Seasonal sales

---

### 6.3 Pre-orders
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Mark items as pre-order
- [ ] Estimated ship date
- [ ] Pre-order queue
- [ ] Notify when available
- [ ] Auto-fulfill pre-orders

---

## 🎯 PHASE 7: ANALYTICS & OPTIMIZATION
**Goal:** Understand shop performance

### 7.1 Shop Analytics
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Total revenue (in NADA)
- [ ] Best-selling items
- [ ] Conversion rates
- [ ] Cart abandonment tracking
- [ ] Popular categories
- [ ] User acquisition cost (NADA per user)

---

### 7.2 A/B Testing
**Status:** 🔴 NOT STARTED
**Priority:** 🟢 LOW

**Tasks:**
- [ ] Test different item descriptions
- [ ] Test pricing strategies
- [ ] Test UI layouts
- [ ] Track performance

---

## 📊 PRIORITY MATRIX

### 🔥 IMMEDIATE (Do First)
1. **Theme System** - User just bought Midnight Hemp!
2. **Shipping Address** - Required for physical items
3. **Order Management** - Required for physical items

### 🟡 MEDIUM (Do Soon)
4. **Badge System** - User bought badges
5. **Custom Profile Banner** - User bought this feature
6. **Checkout Flow** - Better UX for purchases
7. **Admin Shop Tools** - Manage inventory
8. **Email Notifications** - Keep users informed

### 🟢 LOW (Nice to Have)
9. **Shopping Cart** - Multi-item purchases
10. **Wishlist** - Save for later
11. **Reviews** - Social proof
12. **Gift Codes** - Marketing tool
13. **Analytics** - Business insights

---

## 🚀 SUGGESTED IMPLEMENTATION ORDER

### Sprint 1 (Week 1): Digital Items Activation
```
Day 1-2: Midnight Hemp + Solarpunk + Golden Hour themes
Day 3-4: Badge system + display
Day 5-7: Custom profile banner upload
```

### Sprint 2 (Week 2): Physical Items Foundation
```
Day 1-3: Shipping address system
Day 4-7: Order management + order history
```

### Sprint 3 (Week 3): Fulfillment & Admin
```
Day 1-4: Admin order fulfillment dashboard
Day 5-7: Inventory management + size/color selection
```

### Sprint 4 (Week 4): Polish & Communications
```
Day 1-3: Email notifications (document manual setup)
Day 4-5: Enhanced checkout flow
Day 6-7: Testing + bug fixes
```

### Future Sprints: Advanced Features
```
- Shopping cart
- Reviews & ratings
- Gift codes
- Analytics
- Sales/promotions
```

---

## 🎨 USER EXPERIENCE FLOW

### Current User Journey (Digital Items)
```
1. Browse Shop → 2. Click Purchase → 3. Confirm → 4. Item Added to Inventory
❌ PROBLEM: Items don't DO anything yet
```

### Target User Journey (Digital Items)
```
1. Browse Shop → 2. Preview Theme → 3. Purchase → 4. Theme Unlocked →
5. Go to Settings → 6. Select Theme → 7. Theme Applied! ✨
```

### Target User Journey (Physical Items)
```
1. Browse Shop → 2. Select Size/Color → 3. Add to Cart → 
4. Review Cart → 5. Enter Shipping → 6. Confirm Purchase → 
7. Receive Confirmation Email → 8. Track Shipment → 9. Receive Item! 📦
```

---

## 💾 DATABASE MIGRATIONS NEEDED

**New Tables:**
- `shipping_addresses` - User shipping info
- `orders` - Order records
- `order_items` - Items in each order
- `inventory` - Stock tracking
- `wishlists` - Saved items (future)
- `gift_codes` - Promo codes (future)
- `item_reviews` - Reviews/ratings (future)

**Updated Tables:**
- `user_progress` - Add `selected_theme`, `selected_badge`, `profile_banner_url`

**NOTE:** Since Make doesn't support migrations, these will need to be created via Supabase dashboard.

---

## 🔧 TECHNICAL CONSIDERATIONS

### Storage Requirements
- **Profile Banners:** ~1-3 MB per user (PNG/JPG)
- **Item Images:** ~500 KB per item
- **Review Photos:** ~500 KB per photo

### Bucket Setup
```tsx
// Create on server startup
const buckets = [
  'make-053bcd80-profile-banners',
  'make-053bcd80-item-images',
  'make-053bcd80-review-photos'
]
```

### Theme Architecture
```tsx
// User can switch between themes they own
type ThemeId = 'default' | 'solarpunk-dreams' | 'midnight-hemp' | 'golden-hour'

interface ThemeConfig {
  id: ThemeId
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    // ... all CSS variables
  }
  animations?: {
    // Optional motion enhancements
  }
}
```

---

## ✅ SUCCESS METRICS

### Phase 1 Success (Digital Items)
- ✅ Users can apply purchased themes
- ✅ Badges display on profile
- ✅ Custom banners upload and display
- ✅ 0 errors in purchase flow

### Phase 2 Success (Physical Items)
- ✅ Users can checkout with shipping
- ✅ Orders tracked in system
- ✅ Admin can fulfill orders
- ✅ Inventory auto-updates

### Phase 3 Success (Full E-Commerce)
- ✅ Shopping cart works
- ✅ Reviews visible on items
- ✅ Email notifications sent
- ✅ Gift codes redeemable
- ✅ Analytics dashboard live

---

## 🎯 NEXT IMMEDIATE ACTION

**START HERE: Implement Midnight Hemp Theme** 🌙
Since you just bought it, let's make it work!

**Task Breakdown:**
1. Define Midnight Hemp CSS variables
2. Add theme selector to Account Settings  
3. Connect to backend
4. Apply theme on selection
5. Persist theme choice

Would you like me to start with the Midnight Hemp theme implementation?
