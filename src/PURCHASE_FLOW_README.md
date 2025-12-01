# 🛒 Swag Purchase Flow - Complete Guide

**Status:** ✅ Phase 1 Complete - Ready to Deploy  
**Built:** November 28, 2024  
**Time:** ~2.5 hours  

---

## 📖 WHAT IS THIS?

The **Swag Purchase Flow** allows users to purchase hemp products from external shops (Shopify, Lazada, Shopee, etc.) while:
- Viewing detailed hemp provenance information
- Earning NADA points (50-150 per purchase)
- Having all interactions tracked for analytics

---

## 🚀 QUICK START (5 minutes)

**Want to test it right now?**

👉 **Follow:** `/QUICK_START_PURCHASE_FLOW.md`

**Steps:**
1. Run 2 database migrations (2 min)
2. Add test data to 1 product (1 min)
3. Test purchase flow in app (2 min)
4. Done! ✅

---

## 📚 DOCUMENTATION INDEX

### **For First-Time Users**
Start here:
- 📄 **`/QUICK_START_PURCHASE_FLOW.md`** - Get running in 5 minutes
- 📄 **`/DEPLOYMENT_CHECKLIST.md`** - Step-by-step deployment

### **For Developers**
Technical details:
- 📄 **`/SWAG_PURCHASE_FLOW_ROADMAP.md`** - Complete roadmap (Phase 1 & 2)
- 📄 **`/PHASE_1_COMPLETION_SUMMARY.md`** - Full feature summary
- 📄 **`/BUILD_SESSION_SUMMARY.md`** - Build overview & stats

### **For Database/Backend**
Migrations and API:
- 📄 **`/DATABASE_MIGRATION_INSTRUCTIONS.md`** - Run migrations
- 📄 `/supabase/migrations/003_purchase_analytics.sql` - Analytics table
- 📄 `/supabase/migrations/004_product_provenance.sql` - Provenance schema
- 📄 `/supabase/functions/server/index.tsx` - API routes (lines 163-360)

### **For QA/Testing**
Test scenarios:
- 📄 **`/SWAG_PURCHASE_TESTING_GUIDE.md`** - 9 comprehensive test scenarios
- 📄 **`/DEPLOYMENT_CHECKLIST.md`** - Pre-deployment verification

### **For Progress Tracking**
Build history:
- 📄 **`/PURCHASE_FLOW_PROGRESS.md`** - Token-by-token progress
- 📄 **`/PENDING_ITEMS_ROADMAP.md`** - Overall project status

---

## 🏗️ ARCHITECTURE

### **Components Created**
```
/components/
  ├── PurchaseModal.tsx           ⭐ Main purchase modal
  ├── ProvenancePreview.tsx       🌱 Hemp provenance display
  ├── NadaRewardPreview.tsx       🏆 NADA rewards UI
  ├── SwagMarketplace.tsx         🛍️ Updated: integrated flow
  └── ProductDetailModal.tsx      📋 Updated: purchase button
```

### **Database Tables**
```
swag_purchase_analytics_053bcd80     📊 Analytics tracking
swag_products_053bcd80               🌱 +14 provenance columns
swag_product_analytics_summary       📈 Analytics view
```

### **API Routes**
```
POST   /make-server-053bcd80/analytics/track              Track actions + award NADA
GET    /make-server-053bcd80/analytics/product/:id       Product analytics
GET    /make-server-053bcd80/analytics/company/:id       Company analytics
```

---

## 🎯 KEY FEATURES

### **1. Hemp Provenance Tracking**
- Source farm/region
- Country of origin
- Certifications (USDA Organic, Regenerative, etc.)
- Environmental impact (carbon, water, pesticides)
- Processing methods
- Fair trade verification

### **2. Conscious Score (0-100)**
Auto-calculated from:
- Material quality
- Labor practices
- Environmental impact
- Transparency

### **3. NADA Rewards**
- **Base:** 50 points (always)
- **+25:** Verified provenance
- **+25:** Conscious score ≥ 90
- **+50:** Regenerative certification
- **Max:** 150 points per purchase

### **4. Analytics**
Track:
- Product views
- Click-throughs
- Platform preferences
- Conversion rates
- Organization insights

---

## 📊 USER FLOW

```
1. User browsing Swag Marketplace
   ↓
2. Clicks product card
   ↓
3. ProductDetailModal opens
   ↓
4. Clicks "Purchase Product" button
   ↓
5. PurchaseModal opens showing:
   - Product summary
   - Hemp provenance (if available)
   - NADA rewards preview
   - Platform badge
   ↓
6. Clicks "Continue to [Platform]"
   ↓
7. System:
   - Tracks click-through
   - Awards NADA points
   - Shows toast "+X NADA earned! 🌱"
   - Opens external shop in new tab
   - Closes modal
   ↓
8. User completes purchase on external shop
```

---

## 💻 CODE EXAMPLES

### **Using PurchaseModal**
```tsx
import { PurchaseModal } from './PurchaseModal'

<PurchaseModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  product={selectedProduct}
  company={productCompany}
  userId={currentUserId}
  accessToken={accessToken}
  serverUrl={serverUrl}
  onPurchaseComplete={() => {
    // Refresh data, update UI, etc.
  }}
/>
```

### **Adding Provenance Data (SQL)**
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
WHERE id = 'product-id';
```

### **Tracking Analytics (API)**
```typescript
// Track click-through
const response = await fetch(`${serverUrl}/analytics/track`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    product_id: 'product-id',
    company_id: 'company-id',
    action_type: 'click_through',
    external_shop_platform: 'shopify'
  })
})

const { nada_awarded } = await response.json()
// Returns: { success: true, nada_awarded: 150 }
```

---

## 🧪 TESTING

### **Quick Test (5 minutes)**
```bash
# 1. Run migrations (see DATABASE_MIGRATION_INSTRUCTIONS.md)
# 2. Add test data (see QUICK_START_PURCHASE_FLOW.md)
# 3. Test in app:
#    - Navigate to Swag Marketplace
#    - Click product with provenance data
#    - Click "Purchase Product"
#    - Verify modal displays correctly
#    - Click "Continue to [Platform]"
#    - Verify toast shows NADA earned
#    - Verify external shop opens
```

### **Full Test Suite**
See: `/SWAG_PURCHASE_TESTING_GUIDE.md`
- 9 comprehensive scenarios
- Error handling tests
- Mobile responsiveness
- Platform detection
- Analytics verification

---

## 🔧 TROUBLESHOOTING

### **Modal doesn't open?**
- Check console errors (F12)
- Verify `userId` prop
- Verify product has `company` data

### **Provenance doesn't show?**
- Product needs: `hemp_source` OR `certifications` OR `provenance_verified = true`

### **NADA not awarded?**
- Check user is authenticated
- Check analytics table for records
- Check console for API errors

### **Conscious score is 0/NULL?**
- Run migration 004
- Force recalculation: `UPDATE swag_products_053bcd80 SET updated_at = NOW() WHERE hemp_source IS NOT NULL;`

**More help:** Check `/SWAG_PURCHASE_TESTING_GUIDE.md` troubleshooting section

---

## 📈 ANALYTICS QUERIES

### **View Recent Activity**
```sql
SELECT * FROM swag_purchase_analytics_053bcd80
ORDER BY created_at DESC
LIMIT 20;
```

### **Product Performance**
```sql
SELECT * FROM swag_product_analytics_summary
WHERE product_id = 'your-product-id';
```

### **Company Analytics**
```sql
SELECT 
  SUM(total_views) as views,
  SUM(total_clicks) as clicks,
  ROUND(AVG(click_through_rate), 2) as avg_ctr,
  SUM(total_nada_awarded) as nada_awarded
FROM swag_product_analytics_summary
WHERE company_id = 'your-company-id';
```

---

## 🎨 DESIGN SYSTEM

### **Colors (Hemp'in Theme)**
- Primary: `emerald-500`, `emerald-950`
- Secondary: `teal-500`, `teal-950`
- Accent: `green-500`, `green-950`
- Rewards: `amber-500`, `yellow-500`
- Success: `emerald-400`

### **Gradients**
```css
/* Modal backgrounds */
from-emerald-950 via-teal-950 to-green-950

/* Buttons */
from-emerald-500 to-teal-600

/* Rewards */
from-amber-950/40 via-yellow-950/40 to-orange-950/40
```

### **Typography**
- Headers: `font-black` (900)
- Body: `font-bold` (700)
- Values: `font-black` with color emphasis

---

## 🔜 WHAT'S NEXT?

### **Phase 2: Internal Checkout** (Future)
When you're ready:
- Shopping cart
- Stripe payment integration
- Order management
- Shipping tracking
- Review system
- Full provenance timeline

See: `/SWAG_PURCHASE_FLOW_ROADMAP.md` Phase 2 section

---

## 📞 SUPPORT

### **Need Help?**
1. Check documentation (see index above)
2. Review troubleshooting guides
3. Check console logs
4. Query database tables
5. Review test scenarios

### **Found a Bug?**
Document:
- What you did
- Expected result
- Actual result
- Console errors
- Browser/device info

---

## 🎉 QUICK WINS

### **For Organizations**
Help customers earn max NADA (150 points):
1. Add `hemp_source` and `hemp_source_country`
2. Add `certifications` array (especially "Regenerative")
3. Set `provenance_verified = true` (after admin verification)
4. Track `carbon_footprint` (aim for negative!)
5. Set `fair_trade_verified = true`

### **For Users**
Look for products with:
- "Verified" badge ✅
- High conscious score (90+) 💯
- "Regenerative" certification 🌱
- "Carbon Negative!" badge ♻️

These earn 150 NADA!

---

## 📦 FILES OVERVIEW

**Total: 17 files created/updated**

### Backend (3)
- 003_purchase_analytics.sql
- 004_product_provenance.sql
- index.tsx (server routes added)

### Frontend (5)
- PurchaseModal.tsx
- ProvenancePreview.tsx
- NadaRewardPreview.tsx
- SwagMarketplace.tsx (updated)
- ProductDetailModal.tsx (updated)

### Documentation (9)
- SWAG_PURCHASE_FLOW_ROADMAP.md
- PURCHASE_FLOW_PROGRESS.md
- SWAG_PURCHASE_TESTING_GUIDE.md
- DATABASE_MIGRATION_INSTRUCTIONS.md
- PHASE_1_COMPLETION_SUMMARY.md
- QUICK_START_PURCHASE_FLOW.md
- BUILD_SESSION_SUMMARY.md
- DEPLOYMENT_CHECKLIST.md
- PURCHASE_FLOW_README.md (this file)

---

## ✅ STATUS

**Phase 1: Complete** ✅
- External redirect flow
- Hemp provenance display
- NADA rewards
- Analytics tracking

**Phase 2: Planned** 📅
- Internal checkout
- Stripe integration
- Full e-commerce

---

**Ready to deploy! Start with `/QUICK_START_PURCHASE_FLOW.md` 🚀**

**Built with 💚 for the hemp community**
