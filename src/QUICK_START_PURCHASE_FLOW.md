# ⚡ QUICK START: Swag Purchase Flow

**Get the purchase flow running in 5 minutes!**

---

## 🚀 STEP 1: Run Database Migrations (2 min)

### Open Supabase SQL Editor
1. Go to your Supabase project
2. Click **SQL Editor** → **New query**

### Migration 1: Analytics Table
Copy entire file: `/supabase/migrations/003_purchase_analytics.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Should see: "Success. No rows returned."

### Migration 2: Provenance Schema
Copy entire file: `/supabase/migrations/004_product_provenance.sql`
- Paste into SQL Editor
- Click **Run**
- ✅ Should see: "Success. No rows returned."

---

## 🧪 STEP 2: Add Test Data (1 min)

Run this SQL to create a test product:

```sql
-- Update an existing product with provenance data
UPDATE swag_products_053bcd80
SET 
  hemp_source = 'Green Valley Hemp Co., Colorado',
  hemp_source_country = 'USA',
  certifications = ARRAY['USDA Organic', 'Regenerative'],
  carbon_footprint = -2.5,
  processing_method = 'mechanical',
  fair_trade_verified = true,
  provenance_verified = true,
  is_external_link = true,
  external_shop_url = 'https://mystore.myshopify.com/products/test'
WHERE id = (SELECT id FROM swag_products_053bcd80 LIMIT 1);

-- Check it worked
SELECT 
  name,
  hemp_source,
  certifications,
  conscious_score,
  external_shop_url
FROM swag_products_053bcd80
WHERE hemp_source IS NOT NULL;
```

✅ Should see conscious_score auto-calculated (likely 90+)

---

## 🎯 STEP 3: Test Purchase Flow (2 min)

### In Your App:
1. Navigate to **MARKET** → **Organizations** button → **Swag Marketplace**
2. Find the product you just updated
3. Click on the product card
4. Click **"Purchase Product"** button

### You Should See:
- ✅ Beautiful purchase modal opens
- ✅ Product summary displays
- ✅ Hemp Provenance section shows:
  - Source: Green Valley Hemp Co., Colorado
  - Country: USA
  - Certifications: USDA Organic, Regenerative badges
  - Carbon: -2.5 kg CO₂ (Carbon Negative!)
  - Processing: mechanical
  - Fair Trade badge
  - Conscious Score: ~90+ (with breakdown bars)
- ✅ NADA Rewards section shows:
  - Base: +50 NADA
  - Verified Provenance: +25 NADA
  - Exceptional Sustainability: +25 NADA
  - Regenerative Agriculture: +50 NADA
  - **Total: 150 NADA**
- ✅ Platform badge: "Sold on Shopify"
- ✅ "Continue to Shopify" button

### Click "Continue to Shopify":
- ✅ Toast appears: "+150 NADA earned! 🌱"
- ✅ External shop opens in new tab
- ✅ Modal closes

---

## ✅ STEP 4: Verify Analytics (1 min)

Check analytics were tracked:

```sql
-- Check recent analytics
SELECT 
  action_type,
  nada_points_awarded,
  created_at
FROM swag_purchase_analytics_053bcd80
ORDER BY created_at DESC
LIMIT 5;
```

✅ Should see:
- 1 row with `action_type = 'product_view'` (0 NADA)
- 1 row with `action_type = 'click_through'` (150 NADA)

---

## 🎉 SUCCESS!

Your purchase flow is working! You just:
- ✅ Opened a purchase modal
- ✅ Saw hemp provenance information
- ✅ Earned 150 NADA points
- ✅ Tracked analytics

---

## 🔧 TROUBLESHOOTING

### Modal doesn't open?
- Check console for errors (F12)
- Verify `userId` is set in SwagMarketplace props
- Verify product has `company` data

### Provenance doesn't show?
- Run the SQL UPDATE again (verify hemp_source set)
- Check conscious_score is not null

### NADA not awarded?
- Check user is logged in
- Check browser console for errors
- Check analytics table for records

### External link doesn't work?
- Verify `external_shop_url` is set
- Verify `is_external_link = true`

---

## 📚 NEXT STEPS

### Add More Test Data
Use different certifications:
```sql
UPDATE swag_products_053bcd80
SET certifications = ARRAY['USDA Organic', 'Fair Trade', 'Non-GMO']
WHERE id = 'YOUR_PRODUCT_ID';
```

### Test Different Platforms
```sql
-- Lazada
UPDATE swag_products_053bcd80
SET external_shop_url = 'https://www.lazada.com/products/hemp-bag.html'
WHERE id = 'YOUR_PRODUCT_ID';

-- Shopee
UPDATE swag_products_053bcd80
SET external_shop_url = 'https://shopee.com/Hemp-Hat-i.123.456'
WHERE id = 'YOUR_PRODUCT_ID';
```

### View Organization Analytics
```sql
-- Get analytics for your company
SELECT * FROM swag_product_analytics_summary
WHERE company_id = 'YOUR_COMPANY_ID';
```

---

## 📖 FULL DOCUMENTATION

- **Complete Testing Guide:** `/SWAG_PURCHASE_TESTING_GUIDE.md`
- **Migration Instructions:** `/DATABASE_MIGRATION_INSTRUCTIONS.md`
- **Complete Summary:** `/PHASE_1_COMPLETION_SUMMARY.md`
- **Full Roadmap:** `/SWAG_PURCHASE_FLOW_ROADMAP.md`

---

**That's it! You're ready to start purchasing! 🌱**
