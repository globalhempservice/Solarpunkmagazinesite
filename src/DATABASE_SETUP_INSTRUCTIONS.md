# 🗄️ Database Setup Instructions for Place Relationships

## ⚠️ Important: Database Table Required

The **Place Relationships** feature requires the `organization_place_relationships` table to be created in your Supabase database.

---

## Quick Setup

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Migration
Copy the entire contents of the file:
```
/sql_migrations/organization_place_relationships.sql
```

Paste it into the SQL Editor and click **"Run"**.

### Step 3: Verify
Run this query to verify the table was created:
```sql
SELECT * FROM organization_place_relationships LIMIT 1;
```

If you see "Success. No rows returned" or a table structure, it worked! ✅

---

## What This Creates

### Table: `organization_place_relationships`
A junction table linking organizations to physical places with relationship types.

**Fields:**
- `id` - UUID primary key
- `organization_id` - Foreign key to companies
- `place_id` - Foreign key to places
- `relationship_type` - Type of relationship (owns, distributes_at, etc.)
- `status` - pending/verified/rejected
- `notes` - Optional context
- `verified_at`, `verified_by` - Admin verification tracking
- `created_at`, `updated_at` - Timestamps

**Relationship Types:**
- `owns` - Organization owns this place
- `distributed_at` - Products distributed here
- `supplies_from` - Organization sources from this place
- `manufactures_at` - Manufacturing facility
- `partner` - Business partner location
- `customer` - This place is a customer
- `supplier` - This place supplies to organization
- `retail_outlet` - Retail store/outlet
- `warehouse` - Storage facility
- `office` - Corporate/admin office

### Security (Row Level Security)
✅ **Automatic RLS policies:**
1. Anyone can view **verified** relationships
2. Organization members can view **all** their org's relationships
3. Admins/Owners can **create, update, delete** relationships
4. Service role can do anything (for backend)

### Indexes
✅ **Performance indexes on:**
- `organization_id`
- `place_id`
- `relationship_type`
- `status`

### Triggers
✅ **Auto-update `updated_at` timestamp**

---

## Prerequisites

Before running this migration, ensure you have:

### 1. `places` Table
The `places` table must exist. If it doesn't, run:
```
/sql_migrations/places_table.sql
```

### 2. `companies` Table
The `companies` table must exist (already created for organization system).

### 3. `auth.users`
Supabase auth must be enabled (default).

---

## Troubleshooting

### Error: "relation 'places' does not exist"
**Solution:** Run the places migration first:
```sql
-- Run /sql_migrations/places_table.sql first
```

### Error: "relation 'companies' does not exist"
**Solution:** This shouldn't happen if organizations are working. Check:
```sql
SELECT * FROM companies LIMIT 1;
```

### Error: "permission denied"
**Solution:** Make sure you're using the SQL Editor in Supabase dashboard (not API).

### Table exists but queries fail
**Solution:** Check RLS policies:
```sql
-- View existing policies
SELECT * FROM pg_policies 
WHERE tablename = 'organization_place_relationships';

-- If empty, re-run the migration
```

---

## Testing After Setup

### Test 1: Can you see the table?
```sql
SELECT * FROM organization_place_relationships;
```
Expected: Empty result or rows

### Test 2: Can you insert?
```sql
-- Replace UUIDs with real IDs from your database
INSERT INTO organization_place_relationships 
  (organization_id, place_id, relationship_type, status)
VALUES 
  ('YOUR_ORG_ID', 'YOUR_PLACE_ID', 'owns', 'pending');
```

### Test 3: Check RLS
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'organization_place_relationships';
```
Expected: 5 policies

### Test 4: Use the UI
1. Go to your organization manager
2. Click the "Places" tab
3. You should see "No Place Relationships Yet"
4. Click "Add Place" button
5. If you see the search modal → **Success!** ✅

---

## What Happens if You Don't Run This?

**Symptoms:**
- ❌ "Failed to fetch place relationships" error
- ❌ Places tab shows error
- ❌ Can't add place relationships
- ❌ Console shows: "relation 'organization_place_relationships' does not exist"

**Solution:**
Run the migration! Follow Step 1-3 above.

---

## Migration File Location

The full SQL migration is located at:
```
/sql_migrations/organization_place_relationships.sql
```

**File size:** ~165 lines  
**Includes:** Table creation, indexes, RLS policies, triggers, and helpful test queries

---

## Next Steps After Setup

Once the table is created:

1. ✅ **Test the UI** - Add your first place relationship
2. ✅ **Create places** - Use the "Create New Place" feature
3. ✅ **Build your network** - Map your supply chain
4. ✅ **Verify relationships** - Admins can approve pending items

---

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Check the Supabase logs (Logs > Postgres Logs)
3. Verify you're logged in and part of an organization
4. Ensure you're an admin/owner of the organization

---

## Summary

**Required:** Run `/sql_migrations/organization_place_relationships.sql` in Supabase SQL Editor

**Takes:** ~5 seconds

**Enables:** Full place relationships feature including:
- ✅ Viewing organization places
- ✅ Adding new relationships
- ✅ Creating new places
- ✅ Managing supply chain network

**Status:** Ready to use immediately after running migration! 🚀
