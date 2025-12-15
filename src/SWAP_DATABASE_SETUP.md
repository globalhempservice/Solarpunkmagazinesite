# 🔄 SWAP Database Setup Guide

## Overview
The SWAP (Consumer-to-Consumer Barter) system requires a Postgres table in your Supabase database. This guide will help you create the necessary table structure.

---

## 📊 Database Table Required

### Table: `swap_items`

Navigate to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create SWAP Items Table
CREATE TABLE IF NOT EXISTS swap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  hemp_inside BOOLEAN DEFAULT FALSE,
  hemp_percentage INTEGER,
  images TEXT[] DEFAULT '{}',
  country TEXT,
  city TEXT,
  willing_to_ship BOOLEAN DEFAULT FALSE,
  story TEXT,
  years_in_use INTEGER,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'swapped', 'removed')),
  power_level INTEGER DEFAULT 1 CHECK (power_level >= 1 AND power_level <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swap_items_user_id ON swap_items(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_items_status ON swap_items(status);
CREATE INDEX IF NOT EXISTS idx_swap_items_category ON swap_items(category);
CREATE INDEX IF NOT EXISTS idx_swap_items_country ON swap_items(country);
CREATE INDEX IF NOT EXISTS idx_swap_items_created_at ON swap_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE swap_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available items
CREATE POLICY "Anyone can view available swap items"
  ON swap_items FOR SELECT
  USING (status = 'available');

-- Policy: Users can view their own items (any status)
CREATE POLICY "Users can view their own swap items"
  ON swap_items FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own items
CREATE POLICY "Users can insert their own swap items"
  ON swap_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own items
CREATE POLICY "Users can update their own swap items"
  ON swap_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete their own swap items"
  ON swap_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_swap_items_updated_at BEFORE UPDATE ON swap_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🗂️ Data Stored in KV Store

The following data is stored in the existing `kv_store_053bcd80` table (no additional tables needed):

### 1. **Swap Likes** (24-hour expiry)
- **Key Pattern**: `swap_likes:{user_id}`
- **Value**: JSON array of liked items with expiry timestamps
- **Example**:
```json
[
  {
    "item_id": "uuid-here",
    "liked_at": "2025-01-01T12:00:00Z",
    "expires_at": "2025-01-02T12:00:00Z"
  }
]
```

### 2. **Swap Proposals** (48-hour expiry)
- **Key Pattern**: `swap_proposals:{user_id}`
- **Value**: JSON array of proposals (stored for both sender and receiver)
- **Example**:
```json
[
  {
    "id": "proposal-uuid",
    "my_item_id": "uuid-1",
    "their_item_id": "uuid-2",
    "status": "pending",
    "created_at": "2025-01-01T12:00:00Z",
    "expires_at": "2025-01-03T12:00:00Z"
  }
]
```

---

## 🎮 Item Categories

Valid categories for `category` field:
- `electronics`
- `clothing`
- `books`
- `furniture`
- `toys`
- `sports`
- `tools`
- `art`
- `music`
- `other`

---

## 🏷️ Item Conditions

Valid conditions for `condition` field:
- `new`
- `like-new`
- `good`
- `fair`
- `worn`

---

## 🎯 Item Status

Valid statuses for `status` field:
- `available` - Item is available for swapping
- `swapped` - Item has been successfully swapped
- `removed` - Item removed by owner

---

## ⚡ Power Level System

Items have a `power_level` (1-10) that increases when users:
1. **Quick Drop** (Level 1): Photo + Title only
2. **Power-Up Lab**: Add details through accordion upgrades:
   - Description → +1 level
   - Condition → +1 level
   - Location → +1 level
   - Hemp info → +1 level
   - Shipping → +1 level
   - Story → +1 level
   - Additional images → +levels

Higher power levels = better visibility in the SWAP feed!

---

## ✅ Verification Steps

After running the SQL, verify:

1. **Table exists**:
```sql
SELECT * FROM swap_items LIMIT 1;
```

2. **RLS is enabled**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'swap_items';
```

3. **Policies are active**:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'swap_items';
```

---

## 🚀 You're All Set!

Once the table is created:
- Navigate to "ME" → "My Inventory" to see your SWAP items
- Add items using the "Quick Drop" flow
- Like items in the SWAP feed (24-hour timer starts)
- Propose swaps from your inventory
- Track proposals in "To Swap" and "Deals" tabs

---

## 🔐 Security Notes

- ✅ Row Level Security (RLS) is enabled
- ✅ Users can only modify their own items
- ✅ Everyone can view available items
- ✅ User authentication required for write operations
- ✅ Foreign key cascades handle user deletion
