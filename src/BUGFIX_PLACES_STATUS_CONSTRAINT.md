# 🐛 Bug Fix: Places Status Constraint Error

## Problem
When creating a new place via the user submission form, the database was rejecting inserts with error:
```
new row for relation "places" violates check constraint "valid_status"
```

## Root Cause
The `places` table has a CHECK constraint named `valid_status` that restricts which status values are allowed. The backend code was attempting to insert status='active', but the database constraint was configured to only allow:
- `'pending'`
- `'verified'`
- `'rejected'`

This pattern matches the `organization_place_relationships` table, NOT the admin routes which mention 'active', 'planned', 'closed'.

## Solution
Changed the `/places/create` route (line 270 in `/supabase/functions/server/places_routes.tsx`) to use:
```typescript
status: 'pending'  // Changed from 'active'
```

This allows user-submitted places to be created with 'pending' status, which makes sense for a workflow where:
1. Users submit places → status = 'pending'
2. Admin reviews and approves → status = 'verified'
3. Admin can reject → status = 'rejected'

## Files Changed
- `/supabase/functions/server/places_routes.tsx` (line ~270)

## Next Steps
The Deno server will automatically pick up this change. Test by:
1. Go to Hemp Atlas
2. Click "Create New Place"
3. Fill out the form with Google Maps URL
4. Submit
5. Place should now be created successfully with status='pending'

## Note for Future
The database CHECK constraint and the admin route comments are inconsistent:
- **Constraint allows**: 'pending', 'verified', 'rejected'
- **Admin route comment says**: 'active', 'planned', 'closed'

This should be clarified in the database schema. For now, we're using the values that the constraint actually allows.
