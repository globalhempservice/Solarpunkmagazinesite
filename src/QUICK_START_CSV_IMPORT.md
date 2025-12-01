# 🚀 Quick Start: CSV Product Import

**5-Minute Guide to Bulk Import Products**

---

## 📥 Step 1: Download Template

1. Go to **Organization Dashboard**
2. Select your organization
3. Click **SWAG** tab
4. Click **Import Products** (blue button)
5. Click **Download CSV Template**

**Template includes 5 example products** - you can replace them or add more rows!

---

## ✏️ Step 2: Fill Your Products

Open the CSV in **Excel**, **Google Sheets**, or any spreadsheet app.

### Required Field:
- ✅ **name** - Product name (REQUIRED)

### Common Fields:
- **price** - Price in decimal format (29.99)
- **category** - apparel, accessories, food, wellness, seeds, education, other
- **external_shop_url** - Your Shopify/Lazada/Shopee product URL
- **inventory** - Stock count (leave empty for unlimited)
- **description** - Full product description

### Badge-Gating:
- **requires_badge** - true/false
- **required_badge_type** - founding-member, premium-member, etc.

### Boolean Fields Accept:
- ✅ `true` / `false`
- ✅ `yes` / `no`
- ✅ `1` / `0`

---

## 📤 Step 3: Upload CSV

1. **Save your CSV file**
2. Go back to **Import Products** modal
3. **Drag & drop** your CSV file
   - OR click **Browse Files**
4. Wait for preview to load

---

## 👀 Step 4: Review Preview

- ✅ Check products look correct
- ✅ Fix any validation errors
- ❌ If errors, edit CSV and re-upload

**Common Errors:**
- Missing product name
- Invalid price format
- Negative inventory

---

## 🚀 Step 5: Import!

1. Click **Import X Products**
2. Wait for progress bar
3. See success screen
4. Click **Done**

**Products imported as DRAFTS** - review and publish them!

---

## ✅ Step 6: Review & Publish

1. Products appear in **SWAG tab** (unpublished)
2. Click **Edit** to review
3. Make any adjustments
4. Click **Publish** to make live

---

## 📊 CSV Format Example

```csv
name,price,category,external_shop_url,requires_badge
Hemp T-Shirt,29.99,apparel,https://myshop.com/tshirt,false
CBD Oil 500mg,49.99,wellness,https://myshop.com/cbd,true
Hemp Seeds 1kg,24.99,food,,false
```

---

## 🎯 Pro Tips

### Export from Existing Platform

**Shopify:**
1. Products → Export
2. Select all products
3. Download CSV
4. Open and map to our template
5. Upload to DEWII!

**WooCommerce:**
1. Products → Export
2. Save as CSV
3. Map fields to our template
4. Import!

**Lazada/Shopee:**
1. Export product catalog
2. Reformat to match our template
3. Import!

### Bulk Operations

- Import 50+ products in minutes
- Update by re-importing with same names
- Add tags for filtering: "organic,sustainable,hemp"

### Badge-Gated Products

```csv
name,requires_badge,required_badge_type
Premium CBD Oil,true,premium-member
Founder's Hemp Kit,true,founding-member
```

Only users with the specified badge can purchase!

---

## 🔧 Troubleshooting

### "Invalid price"
- Use decimal format: `29.99` not `$29.99`
- No currency symbols
- No commas: `1299.99` not `1,299.99`

### "Invalid inventory"
- Use whole numbers: `50` not `50.5`
- No negative numbers
- Leave empty for unlimited

### "Name is required"
- Every product needs a name
- Check for empty rows
- Delete empty rows before uploading

### CSV not uploading?
- Make sure file extension is `.csv`
- Not `.xlsx` or `.xls`
- Save as CSV in Excel/Sheets

---

## 📁 Files

- **Template:** `/public/swag_products_template.csv`
- **Component:** `/components/SwagProductCSVImporter.tsx`
- **Documentation:** `/CSV_IMPORTER_IMPLEMENTATION.md`

---

## 🎉 That's It!

You can now import hundreds of products in minutes instead of hours!

**Questions?** Check `/CSV_IMPORTER_IMPLEMENTATION.md` for full documentation.
