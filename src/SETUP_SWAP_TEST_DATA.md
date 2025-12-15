# 🌍 SWAP Shop Test Data Setup

## Overview
This will populate your SWAP shop with **50 diverse hemp items** from **50 cities** across **6 continents**!

---

## 📋 Setup Instructions

### **Step 1: Add Geolocation Support**
Run this SQL in your Supabase SQL Editor:

```sql
-- File: ADD_SWAP_GEOLOCATION.sql
-- Adds latitude/longitude columns for globe visualization
```

**What it does:**
- Adds `latitude` and `longitude` columns to `swap_items` table
- Creates spatial index for performance
- Enables items to appear as pins on the 3D Globe

---

### **Step 2: Populate Items**
Run this SQL in your Supabase SQL Editor:

```sql
-- File: POPULATE_SWAP_ITEMS.sql
-- Creates 50 diverse hemp items with global locations
```

**What it does:**
- Creates **50 swap items** with realistic hemp products
- Assigns them to your first user (or creates sample data)
- Spreads items across **50 cities worldwide**
- Includes geolocation data for globe pins

---

## 📊 Test Data Breakdown

### **Categories:**
- **Clothing** (15 items) - jackets, pants, shirts, dresses, hoodies
- **Accessories** (12 items) - backpacks, bags, wallets, belts, scarves
- **Home Goods** (10 items) - blankets, pillows, towels, hammocks, curtains
- **Wellness** (8 items) - meditation cushions, oils, soaps, lotions
- **Construction/Other** (5 items) - rope, insulation, twine, fabric

### **Conditions:**
- `like_new` - barely used, mint condition
- `good` - normal wear, fully functional
- `well_loved` - lots of character, still usable
- `vintage` - old but gold (50+ years!)

### **Global Distribution:**
Items from cities including:
- 🇺🇸 Portland, USA
- 🇨🇦 Vancouver, Canada
- 🇳🇱 Amsterdam, Netherlands
- 🇫🇷 Lyon, France
- 🇦🇺 Byron Bay, Australia
- 🇩🇪 Berlin, Germany
- 🇯🇵 Kyoto, Japan
- 🇬🇧 Bristol, UK
- 🇸🇪 Stockholm, Sweden
- 🇨🇷 Santa Teresa, Costa Rica
- 🇮🇪 Galway, Ireland
- 🇳🇿 Wellington, New Zealand
- 🇸🇬 Singapore
- 🇰🇷 Seoul, South Korea
- 🇹🇭 Chiang Mai, Thailand
- 🇳🇵 Kathmandu, Nepal
- 🇵🇹 Lisbon, Portugal
- 🇲🇽 Oaxaca, Mexico
- 🇲🇦 Marrakech, Morocco
- 🇮🇹 Florence, Italy
- 🇮🇸 Reykjavik, Iceland
- 🇮🇳 Goa, India
- 🇨🇭 Geneva, Switzerland
- 🇪🇸 Barcelona, Spain
- 🇩🇰 Copenhagen, Denmark
- 🇧🇷 São Paulo, Brazil
- 🇵🇱 Warsaw, Poland
- ...and 23 more!

---

## 🎯 What You'll See

### **SWAP Shop Homepage:**
- Infinite scrolling feed with 50 items
- Masonry grid layout with item cards
- Each card shows:
  - Item photo (placeholder)
  - Title & description
  - Category badge
  - Condition badge
  - Location (city, country)
  - Hemp percentage
  - "Years in use" story

### **3D Globe View (Future):**
- All 50 items will appear as pins on the globe
- Clustered by region
- Click a pin to see item details
- Level 5+ items only (need Power-Up Lab implementation)

---

## 🧪 Testing Features

After populating, you can test:

✅ **Infinite scroll** - scroll through 50 items smoothly
✅ **Category filtering** - filter by clothing, accessories, etc.
✅ **Condition filtering** - like_new, good, well_loved, vintage
✅ **Global distribution** - items from every continent
✅ **Item details** - click any item to see full story
✅ **Search** - search by title, description, location
✅ **Globe visualization** - see worldwide distribution (once integrated)

---

## 📝 Notes

- All items use the same `user_id` (your first user)
- Images are placeholders (empty array) - add real images later
- Stories are realistic and hemp-themed
- Hemp percentages vary from 50-100%
- Years in use range from 0-50 years
- Mix of willing/not willing to ship
- Diverse price points and conditions

---

## 🚀 Next Steps

After populating:

1. **Navigate to SWAP Shop** in your app
2. **Watch the navbar + button** morph between Package ↔ Plus icons
3. **Scroll the infinite feed** - should be smooth and endless
4. **Click an item** to see details
5. **Test the "List Item" flow** - click navbar + to add your own item
6. **Future:** Integrate globe view to see all 50 pins worldwide!

---

**Enjoy your global hemp marketplace!** 🌿✨
