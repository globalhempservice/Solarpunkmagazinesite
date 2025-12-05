# 🚀 Quick Start: Organization-Places Relationship System

## Step-by-Step Setup (5 Minutes)

### Step 1: Run the SQL Migration ⚡

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click "+ New query"

3. **Copy & Paste SQL**
   - Open `/sql_migrations/organization_place_relationships.sql`
   - Copy the ENTIRE file contents
   - Paste into the SQL Editor

4. **Run Migration**
   - Click "Run" button (or press `Cmd/Ctrl + Enter`)
   - Wait for success message ✅

**Expected Output:**
```
Success. No rows returned.
```

This creates:
- ✅ `organization_place_relationships` table
- ✅ Indexes
- ✅ Row Level Security policies
- ✅ Triggers

---

### Step 2: Test the Feature 🧪

1. **Sign in to DEWII**
   - Log in with your account

2. **Navigate to Organizations**
   - Click **MARKET** (bottom nav)
   - Click your profile circle (bottom right)
   - Click **"Manage Organizations"**

3. **Select an Organization**
   - Click on one of your organizations

4. **Open Places Tab**
   - Look for **"Places"** in the left menu (📍 MapPin icon)
   - Click it

5. **Add Your First Relationship!**
   - Click **"+ Add Place"** button
   - Search for a place (e.g., type "manila" or any city)
   - Select a place from results
   - Choose relationship type (e.g., "Owns")
   - Add optional notes
   - Click **"Add Relationship"**

6. **Success!** 🎉
   - You should see your relationship card appear
   - Status: "Pending" (until admin verifies)

---

### Step 3: Verify It Works ✓

**Check these things:**

- [ ] Places tab appears in organization menu
- [ ] Search works and shows places
- [ ] Can select a place
- [ ] Can choose relationship type
- [ ] Relationship appears in the list
- [ ] Can delete a relationship
- [ ] Empty state shows when no relationships exist

---

## 🔧 Troubleshooting

### "Table does not exist" Error
**Solution:** Make sure you ran the SQL migration (Step 1)

### "Permission denied" Error
**Solution:** Check that RLS policies were created. Re-run the migration.

### "Cannot find Places tab"
**Solution:** Make sure you're viewing as admin/owner of the organization

### No places show in search
**Solution:** You need some places in the database first. Create places via Admin Dashboard → Places tab.

---

## 📋 Quick Reference

### Relationship Types:
- **Owns** - Organization owns this place
- **Distributed At** - Products sold/distributed here
- **Supplies From** - Organization sources materials from here
- **Manufactures At** - Manufacturing happens here
- **Partner** - Business partnership location
- **Customer** - This place is a customer
- **Supplier** - This place supplies to organization
- **Retail Outlet** - Retail store/shop
- **Warehouse** - Storage or distribution center
- **Office** - Corporate or administrative office

### API Endpoints:
```
GET    /organizations/:id/places - List relationships
POST   /organizations/:id/places - Create relationship
PUT    /organizations/:id/places/:relId - Update relationship
DELETE /organizations/:id/places/:relId - Remove relationship
GET    /organizations/:id/places/search?q=... - Search places
```

---

## 🎯 Next Actions

After setting up:

1. **Add Places to Database** (if you haven't already)
   - Use Admin Dashboard → Places tab
   - Or use the Places import feature

2. **Create Relationships**
   - Map out your organization's supply chain
   - Add all owned locations
   - Connect to partners, suppliers, customers

3. **Future: Admin Verification**
   - Platform admins will be able to verify relationship claims
   - Verified relationships will show with green checkmark
   - Can be displayed on public profiles

---

## 💡 Pro Tips

- **Start with "Owns"** - Claim locations your organization directly owns first
- **Use Notes** - Add context like "Since 2020" or "Main distribution partner"
- **Search is Smart** - Search by name, city, OR country
- **Color Coding** - Each relationship type has a unique color for easy identification
- **Mobile Friendly** - Fully responsive on all devices

---

## 🆘 Need Help?

Check these files for more info:
- `/ORGANIZATION_PLACES_IMPLEMENTATION.md` - Full technical documentation
- `/sql_migrations/organization_place_relationships.sql` - Database schema
- `/components/OrganizationPlacesTab.tsx` - Frontend component

---

**That's it! You're ready to start mapping the hemp industry network! 🌿🗺️✨**
