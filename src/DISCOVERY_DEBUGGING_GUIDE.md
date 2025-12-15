# DEWII Discovery System - Debugging Guide

## Problem Summary

You're experiencing two main issues:
1. **Foreign key constraint errors** between `discovery_requests` and `user_profiles` tables
2. **"Error searching: Error: Search failed"** messages when trying to search for entities

## Root Cause Analysis

### Issue 1: Foreign Key Constraints

The `discovery_requests` table has a foreign key constraint:
```sql
discovery_requests.user_id -> user_profiles.user_id
```

**The Problem:**
- When a user signs up, Supabase creates a record in `auth.users` table
- The `user_profiles` table is created **lazily** (only when user edits their profile)
- Discovery requests are created **before** user profiles exist
- This causes foreign key violations

**The Solution:**
- Foreign keys should reference `auth.users.id` (source of truth)
- NOT `user_profiles.user_id` (may not exist yet)

### Issue 2: Search Failures

The search routes are working correctly, but error details weren't being logged properly. We've now enhanced logging to show:
- Full error messages
- Error codes
- Postgres hints
- Stack traces

## Step-by-Step Fix

### Step 1: Run the SQL Fix Script

1. Open the Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `/SQL_FIX_DISCOVERY_FOREIGN_KEYS.sql`
3. Run the script section by section:
   - **STEP 1**: Diagnostic queries (see what's wrong)
   - **STEP 2**: Drop problematic foreign keys
   - **STEP 3**: Recreate with correct references
   - **STEP 4**: Fix discovery_recommendations table too
   - **STEP 5**: Verify the fixes
   - **STEP 6**: (Optional) Create missing user profiles

### Step 2: Test the Search Functionality

With the enhanced error logging now in place:

1. Open your browser console (F12)
2. Navigate to Admin → Discovery → Click on a request
3. Try searching for users
4. Look for these log messages:

**Success:**
```
✅ Search successful: {
  searchType: "user",
  resultsKey: "users",
  resultsCount: 5,
  data: {...}
}
```

**Error (with full details):**
```
❌ Search failed - Full error details: {
  status: 500,
  statusText: "Internal Server Error",
  searchType: "user",
  query: "test",
  errorData: {
    error: "Failed to search users",
    details: "relation \"user_profiles\" does not exist",
    code: "42P01"
  }
}
```

### Step 3: Monitor Server Logs

The backend now logs comprehensive error details:

```
❌ Error searching users - Full details: {
  errorMessage: "relation \"user_profiles\" does not exist",
  errorCode: "42P01",
  errorDetails: null,
  errorHint: null,
  query: "test"
}
```

## Common Postgres Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `42P01` | Table doesn't exist | Check table name, schema |
| `23503` | Foreign key violation | Fix FK constraints (see SQL script) |
| `42703` | Column doesn't exist | Check column name in query |
| `22P02` | Invalid text representation | Check data type conversion |

## Updated Backend Routes

We've enhanced error logging in:
- ✅ `AdminDiscoveryDetail.tsx` - Frontend component with full error context
- ✅ `admin_discovery_routes.tsx` - `/search/users` route with detailed logging
- ⚠️ Other search routes (companies, places, articles) - Need same enhancement if errors persist

## Testing Checklist

After running the SQL fixes:

- [ ] Can create discovery requests without FK errors
- [ ] Can search for users in admin discovery detail
- [ ] Can search for companies in admin discovery detail  
- [ ] Can search for places in admin discovery detail
- [ ] Can search for articles in admin discovery detail
- [ ] Can add recommendations to requests
- [ ] Can delete recommendations
- [ ] Can send recommendations to users
- [ ] Can update request status

## If Search Still Fails

1. **Check the browser console** for the enhanced error logs
2. **Check the Supabase logs** (Dashboard → Logs → Edge Functions)
3. **Verify tables exist:**
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('user_profiles', 'companies', 'places', 'articles');
   ```
4. **Verify auth is working:**
   - The search routes require admin auth
   - Make sure your access token is valid
   - Check the `ADMIN_USER_ID` environment variable matches your user ID

## Foreign Key Architecture Going Forward

**Correct Pattern:**
```
discovery_requests.user_id -> auth.users.id (✅)
discovery_recommendations.user_id -> auth.users.id (✅)
```

**Wrong Pattern (don't use):**
```
discovery_requests.user_id -> user_profiles.user_id (❌)
```

**When Querying:**
Always use LEFT JOIN for user_profiles:
```sql
SELECT dr.*, up.display_name, up.avatar_url
FROM discovery_requests dr
LEFT JOIN user_profiles up ON dr.user_id = up.user_id
```

This handles cases where profiles don't exist yet!

## Next Steps

1. Run the SQL fix script
2. Test search functionality  
3. Check browser console for detailed error logs
4. Report back with:
   - Error code (if any)
   - Full error message from console
   - Which search type is failing (user/company/place/article)

## Support

If you still see "Search failed" errors after running the SQL fix:
1. Copy the **full error object** from browser console
2. Copy the **full error log** from Supabase Edge Function logs
3. Share both so we can debug the specific issue
