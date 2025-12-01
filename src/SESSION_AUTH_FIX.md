# 🔒 Session Authentication Fix

## Problem
Users were experiencing authentication errors when using the Organization Publications Tab:
```
❌ Failed to fetch user articles. Status: 401
❌ Token validation failed - session is expired/invalid
```

## Root Cause
The `accessToken` prop being passed down from parent components could become stale if:
1. User keeps the app open for extended periods (tokens expire after ~1 hour)
2. Token refresh happens in the background but child components don't get updated token
3. Network latency causes token to expire between parent render and child API call

## Solution
Updated `OrganizationPublicationsTab` to always fetch a fresh token directly from Supabase before making API calls.

### Changes Made

**File:** `/components/OrganizationPublicationsTab.tsx`

1. **Import Supabase Client**
   ```tsx
   import { createClient } from '../utils/supabase/client'
   ```

2. **Added Fresh Token Helper**
   ```tsx
   const supabase = createClient()
   
   const getFreshToken = async () => {
     try {
       const { data: { session }, error } = await supabase.auth.getSession()
       if (error || !session) {
         return accessToken // Fallback to provided token
       }
       return session.access_token
     } catch (err) {
       return accessToken // Fallback to provided token
     }
   }
   ```

3. **Updated All API Calls**
   - `fetchUserArticles()` - Gets fresh token before fetching
   - `handleLinkArticle()` - Gets fresh token before linking
   - `handleUnlinkArticle()` - Gets fresh token before unlinking

### How It Works

```
Before:
Parent Component → accessToken (could be stale) → Child Component → API Call ❌

After:
Parent Component → Child Component → getFreshToken() → Supabase → Fresh Token → API Call ✅
```

### Benefits

✅ **Always Fresh** - Token is fetched immediately before each API call
✅ **Automatic Refresh** - Supabase handles token refresh automatically
✅ **Graceful Fallback** - Falls back to provided token if session fetch fails
✅ **User-Friendly** - Shows alert if session truly expired, prompting page refresh
✅ **No Breaking Changes** - Still accepts accessToken prop for compatibility

## Testing

### Test Case 1: Normal Operation
1. Open Organization Manager
2. Click Publications Tab
3. ✅ Should load articles without errors

### Test Case 2: Stale Token
1. Open Organization Manager
2. Wait for token to expire (~1 hour)
3. Click Publications Tab
4. ✅ Should fetch fresh token and work normally

### Test Case 3: Expired Session
1. Open app
2. Sign out in another tab
3. Try to use Publications Tab
4. ✅ Should show user-friendly error message asking to refresh page

## Future Improvements

### Option 1: Global Token Refresh Hook
Create a React hook to handle token refreshing across all components:
```tsx
function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  // Auto-refresh logic
  return token
}
```

### Option 2: API Client Wrapper
Create a wrapper that handles authentication automatically:
```tsx
const authenticatedFetch = async (url, options) => {
  const token = await getFreshToken()
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  })
}
```

### Option 3: Axios with Interceptors
Use Axios with request interceptors to automatically refresh tokens:
```tsx
axios.interceptors.request.use(async (config) => {
  const token = await getFreshToken()
  config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## Related Files

- `/components/OrganizationPublicationsTab.tsx` - Fixed component
- `/utils/supabase/client.tsx` - Supabase client with auto-refresh enabled
- `/App.tsx` - Auth state listener for token updates

## Notes

- Supabase automatically refreshes tokens when they're close to expiring
- The `autoRefreshToken: true` setting in client.tsx enables this
- Token lifetime is typically 3600 seconds (1 hour)
- Refresh happens automatically ~300 seconds (5 minutes) before expiry

---

**Status:** ✅ Fixed
**Testing Required:** Manual testing with extended session times
**Deployment:** No backend changes needed - frontend only
