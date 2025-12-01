# 🧪 SWAG PURCHASE FLOW - TESTING GUIDE

**Phase:** Phase 1 - External Redirect with Enhanced Provenance  
**Status:** Ready for Testing  
**Created:** November 28, 2024

---

## 📋 PRE-TESTING CHECKLIST

### 1. **Database Migrations** 🗄️

**CRITICAL: Run these SQL migrations in Supabase SQL Editor FIRST**

#### Step 1: Run Analytics Table Migration
**File:** `/supabase/migrations/003_purchase_analytics.sql`

```bash
# In Supabase Dashboard:
1. Go to SQL Editor
2. Create new query
3. Copy entire contents of 003_purchase_analytics.sql
4. Run the query
5. Verify table created: swag_purchase_analytics_053bcd80
```

**What it creates:**
- ✅ `swag_purchase_analytics_053bcd80` table
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ `swag_product_analytics_summary` view

#### Step 2: Run Provenance Schema Migration
**File:** `/supabase/migrations/004_product_provenance.sql`

```bash
# In Supabase Dashboard:
1. Go to SQL Editor
2. Create new query
3. Copy entire contents of 004_product_provenance.sql
4. Run the query
5. Verify columns added to swag_products_053bcd80
```

**What it adds:**
- ✅ Hemp provenance fields (14 columns)
- ✅ Conscious score auto-calculation function
- ✅ Trigger for score updates
- ✅ Indexes for filtering

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Basic External Shop Purchase** ✅

**Setup:**
1. Ensure you have at least one product with `is_external_link = true`
2. Product should have `external_shop_url` set (e.g., "https://store.shopify.com/product")

**Test Steps:**
1. Navigate to Swag Marketplace
2. Find an external shop product
3. Click on the product card
4. ProductDetailModal opens
5. Click "Purchase Product" button
6. **Expected:** PurchaseModal opens

**Verify:**
- ✅ Modal shows product summary
- ✅ Company name and logo display
- ✅ Price displays correctly
- ✅ Platform badge shows (Shopify, Lazada, etc.)
- ✅ NADA reward preview shows (minimum 50 points)
- ✅ "Continue to [Platform]" button enabled

---

### **Scenario 2: Purchase with Hemp Provenance** 🌱

**Setup:**
1. Add provenance data to a product (via Supabase or Organization Dashboard):

```sql
UPDATE swag_products_053bcd80
SET 
  hemp_source = 'Green Valley Hemp Co., Colorado',
  hemp_source_country = 'USA',
  certifications = ARRAY['USDA Organic', 'Regenerative'],
  carbon_footprint = -2.5,
  processing_method = 'mechanical',
  fair_trade_verified = true,
  provenance_verified = true
WHERE id = 'YOUR_PRODUCT_ID';
```

**Test Steps:**
1. Click product with provenance data
2. Click "Purchase Product"
3. PurchaseModal opens

**Verify:**
- ✅ Provenance Preview section displays
- ✅ Hemp Source shows correctly
- ✅ Certifications show as badges
- ✅ Carbon footprint displays (with "Carbon Negative!" badge if negative)
- ✅ Processing method displays
- ✅ Fair Trade badge shows
- ✅ Conscious Score displays (auto-calculated)
- ✅ "Verified" badge shows in provenance header

**Expected NADA Calculation:**
- Base: 50 points
- Provenance verified: +25 points
- Regenerative cert: +50 points
- **Total: 125 NADA**

---

### **Scenario 3: Analytics Tracking** 📊

**Setup:**
1. Open browser console (F12)
2. Watch for console logs

**Test Steps:**
1. Open PurchaseModal
2. Click "Continue to [Platform]" button

**Verify Console Logs:**
```
📊 Product view tracked
📊 Tracking analytics: {...}
✅ NADA awarded: 50 (or more with bonuses)
```

**Verify Database:**
```sql
-- Check analytics were recorded
SELECT * FROM swag_purchase_analytics_053bcd80
ORDER BY created_at DESC
LIMIT 10;

-- Check NADA was awarded (KV store)
-- This is stored in the kv_store table with key pattern: user:{userId}
```

**Verify UI:**
- ✅ Toast notification appears: "+X NADA earned! 🌱"
- ✅ External shop opens in new tab
- ✅ Modal closes after redirect

---

### **Scenario 4: Different Platforms** 🌐

**Test with different shop URLs:**

1. **Shopify:**
   - URL: `https://mystore.myshopify.com/products/hemp-tshirt`
   - Expected badge color: Green gradient

2. **Lazada:**
   - URL: `https://www.lazada.com/products/hemp-bag.html`
   - Expected badge color: Blue gradient

3. **Shopee:**
   - URL: `https://shopee.com/Hemp-Backpack-i.123456.789`
   - Expected badge color: Orange/Red gradient

4. **Custom:**
   - URL: `https://mycustomshop.com/product`
   - Expected badge: "External Shop" (Gray gradient)

**Verify:**
- ✅ Platform auto-detected from URL
- ✅ Correct platform name in badge
- ✅ Correct gradient colors
- ✅ "Continue to [Platform Name]" button text correct

---

### **Scenario 5: Conscious Score Display** 💯

**Test different score ranges:**

1. **High Score (90+):**
   - Shows emerald/teal colors
   - Gets +25 NADA bonus
   - Badge: "Exceptional Sustainability"

2. **Good Score (75-89):**
   - Shows green colors
   - No bonus

3. **Medium Score (60-74):**
   - Shows yellow colors
   - No bonus

**Verify:**
- ✅ Score displays correctly
- ✅ Color coding matches score
- ✅ Score breakdown bars animate
- ✅ Material, Labor, Environmental, Transparency scores show

---

### **Scenario 6: NADA Reward Calculation** 🏆

**Test all bonus combinations:**

| Condition | Points | Badge Text |
|-----------|--------|------------|
| Base (always) | +50 | "Supporting hemp business" |
| Provenance Verified | +25 | "Verified Provenance" |
| Conscious Score >= 90 | +25 | "Exceptional Sustainability" |
| Regenerative Cert | +50 | "Regenerative Agriculture" |
| **MAX TOTAL** | **150** | - |

**Create test product with max bonuses:**
```sql
UPDATE swag_products_053bcd80
SET 
  provenance_verified = true,
  conscious_score = 95,
  certifications = ARRAY['Regenerative']
WHERE id = 'YOUR_PRODUCT_ID';
```

**Verify:**
- ✅ Base 50 points show
- ✅ All applicable bonuses show
- ✅ Total calculates correctly
- ✅ Percentage bonus badge shows (e.g., "+200% bonus!")
- ✅ High-value purchase achievement hint shows (if >= 100 points)

---

### **Scenario 7: Error Handling** ⚠️

**Test error scenarios:**

1. **Missing External URL:**
   - Product has `is_external_link = true` but `external_shop_url = null`
   - Expected: Button disabled, toast error message

2. **Analytics Tracking Fails:**
   - Disconnect internet briefly
   - Expected: User can still redirect, toast shows "Failed to track analytics, but you can still visit the shop"

3. **Invalid Product Data:**
   - Product missing company data
   - Expected: Modal doesn't break, graceful fallback

---

### **Scenario 8: Mobile Responsiveness** 📱

**Test on mobile viewport (390px width):**

**Verify:**
- ✅ Modal fits screen
- ✅ Scrollable content
- ✅ Buttons stack vertically on small screens
- ✅ Images resize appropriately
- ✅ Text doesn't overflow
- ✅ Provenance cards are readable

---

### **Scenario 9: Animation & Polish** ✨

**Verify animations:**
- ✅ Modal slides up on open
- ✅ Provenance section fades in
- ✅ NADA reward section fades in with delay
- ✅ Coin icon spins on mount
- ✅ Shimmer effect on NADA card
- ✅ Score bars animate from 0 to value
- ✅ Button hover effects work
- ✅ Loading spinner on redirect

---

## 🔧 DEBUGGING TIPS

### Check if Migrations Ran Successfully

```sql
-- Verify analytics table exists
SELECT COUNT(*) FROM swag_purchase_analytics_053bcd80;

-- Verify provenance columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'swag_products_053bcd80'
  AND column_name LIKE 'hemp_%' OR column_name LIKE 'conscious_%';

-- Verify trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'trigger_update_conscious_score';
```

### Check Server Routes Working

```bash
# Test analytics tracking endpoint
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-053bcd80/analytics/track \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "test-product-id",
    "company_id": "test-company-id",
    "action_type": "product_view"
  }'

# Expected response:
# { "success": true, "nada_awarded": 0 }
```

### Common Issues

**1. Modal doesn't open:**
- Check console for errors
- Verify `userId` prop is passed to SwagMarketplace
- Verify product has `company` data

**2. Provenance doesn't show:**
- Product needs at least one of: hemp_source, certifications, or provenance_verified = true

**3. NADA not awarded:**
- Check user is authenticated
- Check analytics tracking succeeded (console logs)
- Verify KV store key: `user:{userId}` has nada_points field

**4. Conscious score is 0:**
- Run the migration (004_product_provenance.sql)
- Trigger recalculation:
```sql
UPDATE swag_products_053bcd80 
SET updated_at = NOW() 
WHERE hemp_source IS NOT NULL;
```

---

## ✅ COMPLETION CHECKLIST

Before marking Phase 1 complete:

- [ ] All migrations run successfully
- [ ] Analytics tracking works (check database)
- [ ] NADA points awarded correctly
- [ ] External redirect opens correct URL
- [ ] Provenance preview displays
- [ ] All platform badges work
- [ ] Conscious score calculates
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Error handling graceful
- [ ] Console has no errors
- [ ] Toast notifications work

---

## 🚀 READY FOR PHASE 2?

Once Phase 1 is complete and tested, you can begin Phase 2:

**Phase 2: Internal Checkout System**
- Shopping cart
- Stripe integration
- Order management
- Full provenance tracking
- Review system

See `/SWAG_PURCHASE_FLOW_ROADMAP.md` for Phase 2 details.

---

## 📊 TEST DATA GENERATOR

Use this SQL to create test products with various provenance configurations:

```sql
-- Product 1: Full provenance (MAX NADA)
INSERT INTO swag_products_053bcd80 (
  company_id, name, description, price, category,
  is_published, is_featured, is_external_link,
  external_shop_url, external_shop_platform,
  hemp_source, hemp_source_country, certifications,
  carbon_footprint, processing_method, fair_trade_verified,
  provenance_verified
) VALUES (
  'YOUR_COMPANY_ID',
  'Premium Hemp Backpack',
  'Sustainable backpack made from 100% hemp fiber',
  89.99, 'Bags',
  true, true, true,
  'https://mystore.myshopify.com/products/hemp-backpack', 'shopify',
  'Green Valley Hemp Co., Colorado', 'USA',
  ARRAY['USDA Organic', 'Regenerative', 'Fair Trade'],
  -3.2, 'mechanical', true, true
);

-- Product 2: Partial provenance
INSERT INTO swag_products_053bcd80 (
  company_id, name, description, price, category,
  is_published, is_external_link,
  external_shop_url,
  hemp_source, certifications
) VALUES (
  'YOUR_COMPANY_ID',
  'Hemp T-Shirt',
  'Comfortable hemp t-shirt',
  29.99, 'Clothing',
  true, true,
  'https://www.lazada.com/products/hemp-tshirt.html',
  'Oregon Hemp Farm', ARRAY['USDA Organic']
);

-- Product 3: No provenance (base NADA only)
INSERT INTO swag_products_053bcd80 (
  company_id, name, description, price, category,
  is_published, is_external_link,
  external_shop_url
) VALUES (
  'YOUR_COMPANY_ID',
  'Hemp Sticker Pack',
  'Cool hemp stickers',
  4.99, 'Accessories',
  true, true,
  'https://shopee.com/Hemp-Stickers-i.123.456'
);
```

---

**Happy Testing! 🌱**
