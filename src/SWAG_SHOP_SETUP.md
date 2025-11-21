# 🛍️ DEWII Swag Shop Admin - Setup Guide

## 🎯 Overview
Complete admin system for managing your DEWII Swag Shop items with full CRUD operations, database integration, and beautiful UI.

---

## 📋 What Was Built

### Backend (Server)
**Location:** `/supabase/functions/server/index.tsx`

#### Admin Endpoints (Require Admin Auth):
- `GET /admin/swag-items` - Fetch all swag items
- `POST /admin/swag-items` - Create new swag item
- `PUT /admin/swag-items/:itemId` - Update existing item
- `DELETE /admin/swag-items/:itemId` - Delete item

#### Public Endpoint:
- `GET /swag-items` - Fetch active items for shop display

#### Digital Features Endpoints:
- `PUT /users/:userId/select-badge` - Badge selection
- `POST /users/:userId/profile-banner` - Profile banner upload
- `POST /users/:userId/enable-priority-support` - Priority support activation

### Frontend Components

#### SwagShopAdmin
**Location:** `/components/SwagShopAdmin.tsx`

Full admin interface with:
- ✅ Item list with gradient previews
- ✅ Create/Edit forms with live gradient preview
- ✅ Category badges (merch, theme, badge, feature)
- ✅ Active/inactive status toggle
- ✅ Limited edition stock management
- ✅ Delete with confirmation
- ✅ Beautiful Hemp'in neon styling

#### SwagShop (Updated)
**Location:** `/components/SwagShop.tsx`

Now fetches items from database instead of hardcoded array:
- ✅ Dynamic item loading
- ✅ Icon name mapping (string → component)
- ✅ Loading states
- ✅ Full purchase flow

#### AdminDashboard (Updated)
**Location:** `/components/AdminDashboard.tsx`

Added "Manage Swag Shop" button in Market tab

#### App.tsx (Updated)
Added `swag-admin` view and routing

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Migration

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard
   - Navigate to: **SQL Editor** (left sidebar)

2. **Copy the SQL file**
   - Open `/swag_items_migration.sql` in your project
   - Copy ALL the contents

3. **Run the Migration**
   - Paste into Supabase SQL Editor
   - Click **"Run"** button
   - Wait for success message: ✅ Migration complete!

4. **Verify Success**
   - You should see output like:
     ```
     ✅ Swag Items table created successfully!
     ✅ Initial items inserted!
     ✅ RLS policies enabled!
     🎉 Migration complete! Your Swag Shop is ready!
     ```

### Step 2: Verify Table Creation

In Supabase Dashboard, go to **Table Editor**:
- You should see a new table: `swag_items`
- It should contain 10 items:
  - 2 Merch items
  - 3 Theme items
  - 3 Badge items
  - 2 Feature items

### Step 3: Access Swag Shop Admin

1. **Log in as Admin**
   - Make sure you're logged in with your admin account
   - Your user ID should match `ADMIN_USER_ID` environment variable

2. **Navigate to Admin Dashboard**
   - Click the **ADMIN** button (top left, red button with shield icon)
   - Click the **"Market"** tab
   - Click **"Manage Swag Shop"** button (orange/pink gradient)

3. **Manage Items**
   - View all items with gradient previews
   - Click **"New Item"** to create
   - Click **"Edit"** on any item to modify
   - Toggle **Active** checkbox to enable/disable items
   - Click **Delete** (trash icon) to remove items

---

## 🗄️ Database Schema

### `swag_items` Table

```sql
CREATE TABLE swag_items (
  id TEXT PRIMARY KEY,                    -- Unique item ID (e.g., 'theme-solarpunk')
  name TEXT NOT NULL,                     -- Display name
  description TEXT NOT NULL,              -- Item description
  price INTEGER NOT NULL,                 -- NADA price
  category TEXT NOT NULL,                 -- 'merch' | 'theme' | 'badge' | 'feature'
  gradient TEXT NOT NULL,                 -- Tailwind gradient classes
  icon TEXT NOT NULL,                     -- Icon name ('Shirt', 'Palette', etc.)
  limited BOOLEAN DEFAULT false,          -- Is limited edition?
  stock INTEGER,                          -- Stock count (NULL = unlimited)
  active BOOLEAN DEFAULT true,            -- Is visible in shop?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

✅ **Public read access** - Anyone can view active items
✅ **Admin full access** - Admins can create/update/delete

---

## 🎨 Creating New Items

### Via Admin UI (Recommended)

1. Click **"New Item"** button
2. Fill in the form:
   - **Item ID**: Unique identifier (e.g., `theme-cyberpunk`)
   - **Name**: Display name (e.g., `Cyberpunk Nights`)
   - **Description**: What the item does
   - **Price**: NADA cost (integer)
   - **Category**: Select from dropdown
   - **Icon Name**: Choose from: `Shirt`, `Palette`, `Award`, `Sparkles`, `ShoppingBag`
   - **Gradient**: Tailwind classes (e.g., `from-pink-500 to-purple-500`)
   - **Limited Edition**: Check if limited
   - **Stock**: Set if limited (leave empty for unlimited)
   - **Active**: Check to make visible in shop

3. See live preview of gradient
4. Click **"Save Item"**

### Via SQL (Advanced)

```sql
INSERT INTO swag_items (id, name, description, price, category, gradient, icon, limited, stock, active)
VALUES (
  'theme-cyberpunk',
  'Cyberpunk Nights',
  'Neon pink and electric blue with glitch effects',
  150,
  'theme',
  'from-pink-500 via-purple-500 to-blue-500',
  'Palette',
  false,
  NULL,
  true
);
```

---

## 🔧 Item Categories

### Merch
Physical merchandise items
- **Icon**: `Shirt`
- **Examples**: T-shirts, hoodies, stickers
- **Usually**: Limited edition with stock

### Theme
Color scheme customization
- **Icon**: `Palette`
- **Examples**: Solarpunk Dreams, Midnight Hemp
- **Effect**: Applied globally to entire app

### Badge
Profile badges displayed next to username
- **Icon**: `Award`
- **Examples**: Founder, Hemp Pioneer, NADA Whale
- **Display**: Shows in Community Market next to name

### Feature
Digital features and upgrades
- **Icon**: `Sparkles`
- **Examples**: Custom profile banner, priority support
- **Effect**: Unlocks functionality in the app

---

## 🎯 Available Icons

When creating items, use these icon names (case-sensitive):

- `Shirt` - For merch items
- `Palette` - For themes
- `Award` - For badges
- `Sparkles` - For features
- `ShoppingBag` - Default/general items

---

## 🎨 Gradient Examples

Tailwind gradient classes for beautiful item cards:

```
Emerald/Green themes:
- from-emerald-500 to-teal-500
- from-green-500 to-emerald-600
- from-emerald-500 via-green-500 to-teal-500

Purple/Pink themes:
- from-purple-500 to-pink-600
- from-indigo-500 via-purple-500 to-pink-500
- from-violet-500 to-purple-600

Blue/Cyan themes:
- from-cyan-500 to-blue-600
- from-blue-500 to-cyan-600
- from-sky-500 to-blue-600

Warm themes:
- from-amber-500 via-orange-500 to-yellow-500
- from-orange-500 to-pink-500
- from-red-500 to-orange-500
```

---

## 🔐 Security

### Admin Authentication
All admin endpoints check:
1. Valid access token
2. User ID matches `ADMIN_USER_ID` environment variable
3. Returns 403 if not admin

### RLS Policies
- Public users: Can only **read** active items
- Admin users: Full CRUD access
- Authenticated via Supabase Auth

---

## 📊 Market Analytics

The Admin Dashboard's Market tab shows:
- Total NADA spent on swag
- Total purchases across all items
- Category breakdown (merch vs themes vs badges)
- Unique buyers count
- Recent purchases list
- Popular items

---

## 🐛 Troubleshooting

### Items not showing in shop?
✅ Check if `active = true` in database
✅ Verify RLS policies are enabled
✅ Check browser console for errors

### Can't access Swag Shop Admin?
✅ Verify you're logged in as admin
✅ Check `ADMIN_USER_ID` environment variable matches your user ID
✅ Look for red ADMIN button in top left

### Icons not displaying?
✅ Check icon name spelling (case-sensitive)
✅ Must be one of: `Shirt`, `Palette`, `Award`, `Sparkles`, `ShoppingBag`
✅ Check browser console for errors

### Purchase not working?
✅ Verify user has enough NADA points
✅ Check if item is already owned
✅ Verify stock count (if limited)
✅ Check server logs for errors

---

## 🚀 Next Steps

### Implement Digital Features

The backend endpoints are ready! Now implement the UI:

1. **Badge Selection**
   - Allow users to select their purchased badge
   - Display badge next to username in Community Market

2. **Custom Profile Banner**
   - Upload image to Supabase Storage
   - Display banner on user profile/dashboard

3. **Priority Support**
   - Mark user requests with priority flag
   - Show badge in support tickets

### Add More Items

Create new swag items:
- Seasonal themes
- Special event badges
- Premium features
- Limited edition merch drops

---

## 📝 Notes

- The old hardcoded swag items array in SwagShop has been replaced with database fetching
- Icon names are stored as strings and mapped to components at runtime
- The admin system is fully integrated with your existing auth
- All NADA transactions are tracked in the wallets table
- Purchase history is stored in `user_swag_items` table

---

## ✅ Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify table creation
- [ ] Test admin access
- [ ] Create a test item
- [ ] Edit an existing item
- [ ] Test purchase flow in shop
- [ ] Verify NADA deduction
- [ ] Check item ownership
- [ ] Review market analytics

---

🎉 **Your Swag Shop Admin is ready!** You can now manage all shop items directly from the admin panel with a beautiful, intuitive interface!
