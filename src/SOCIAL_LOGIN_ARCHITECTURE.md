# 🏗️ Social Login Architecture

**Component tree and data flow diagram**

---

## 📊 Component Hierarchy

```
App.tsx (Root)
  │
  ├─ LandingPage.tsx (when not authenticated)
  │    │
  │    └─ AuthModal.tsx
  │         │
  │         ├─ SocialLoginButtons.tsx ← NEW! 🌟
  │         │    ├─ Google Button
  │         │    ├─ Meta Button
  │         │    └─ LinkedIn Button
  │         │
  │         └─ Email/Password Form (existing)
  │              ├─ Email Input
  │              ├─ Password Input
  │              ├─ Name Input (signup only)
  │              └─ Terms Checkboxes (signup only)
  │
  └─ Main App (when authenticated)
       ├─ Header
       ├─ Browse
       ├─ Market
       └─ Dashboard
```

---

## 🔄 OAuth Data Flow

### Step-by-Step Flow:

```
1. USER CLICKS BUTTON
   ┌──────────────────────┐
   │ SocialLoginButtons   │
   │                      │
   │ "Continue with       │
   │  Google" [CLICK]     │
   └──────────────────────┘
            ↓
   supabase.auth.signInWithOAuth({
     provider: 'google',
     redirectTo: window.location.origin
   })

2. REDIRECT TO PROVIDER
            ↓
   ┌──────────────────────┐
   │ Google Login Page    │
   │                      │
   │ Email: _____________ │
   │ Password: __________ │
   │                      │
   │ [Sign In]            │
   └──────────────────────┘
            ↓
   User enters credentials

3. PROVIDER AUTHORIZATION
            ↓
   ┌──────────────────────┐
   │ Google Permission    │
   │                      │
   │ Hemp'in wants to:    │
   │ ✓ Know your email    │
   │ ✓ See your profile   │
   │                      │
   │ [Deny] [Allow]       │
   └──────────────────────┘
            ↓
   User clicks "Allow"

4. REDIRECT TO SUPABASE
            ↓
   https://<project-id>.supabase.co/auth/v1/callback
   ?code=xxx&state=yyy
            ↓
   Supabase validates OAuth token

5. SUPABASE CREATES USER
            ↓
   ┌──────────────────────┐
   │ Supabase Database    │
   │                      │
   │ INSERT INTO          │
   │ auth.users           │
   │ VALUES (...)         │
   └──────────────────────┘
            ↓
   User created/updated in database

6. REDIRECT TO APP
            ↓
   https://mag.hempin.org
   #access_token=xxx&refresh_token=yyy
            ↓
   User lands back on your app

7. AUTH STATE CHANGE
            ↓
   ┌──────────────────────┐
   │ App.tsx              │
   │                      │
   │ onAuthStateChange(() │
   │   setAccessToken()   │
   │   setUserId()        │
   │   setUserEmail()     │
   │   setIsAuthenticated │
   │ )                    │
   └──────────────────────┘
            ↓
   App state updated

8. USER IS LOGGED IN! ✅
            ↓
   ┌──────────────────────┐
   │ Main App             │
   │                      │
   │ Welcome, John!       │
   │ NADA: 0              │
   │ Power: 0             │
   └──────────────────────┘
```

---

## 🗄️ Data Storage

### Supabase `auth.users` Table:

```sql
auth.users
├─ id (UUID)                    -- Your internal user ID
├─ email (TEXT)                 -- From provider
├─ encrypted_password (TEXT)    -- NULL for OAuth users
├─ email_confirmed_at (TIMESTAMP) -- Auto-set for OAuth
├─ provider (TEXT)              -- 'google', 'facebook', 'linkedin_oidc'
├─ provider_id (TEXT)           -- User's ID on that platform
├─ raw_user_meta_data (JSONB)   -- Full profile data
│   ├─ email
│   ├─ email_verified
│   ├─ full_name
│   ├─ avatar_url
│   └─ provider_id
├─ app_metadata (JSONB)         -- Provider info
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ last_sign_in_at (TIMESTAMP)
```

### Your KV Store:

```
kv_store_053bcd80
├─ user_profile_{userId}
│   ├─ active_badge
│   ├─ selected_theme
│   ├─ display_name
│   └─ ...
├─ user_points_{userId}
│   ├─ power_points
│   ├─ nada_points
│   ├─ current_streak
│   └─ ...
└─ user_settings_{userId}
    ├─ marketing_opt_in
    ├─ ...
```

---

## 🔑 Authentication State Flow

### In App.tsx:

```typescript
// State variables
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [accessToken, setAccessToken] = useState<string | null>(null)
const [userId, setUserId] = useState<string | null>(null)
const [userEmail, setUserEmail] = useState<string | null>(null)

// On mount, check for existing session
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // User is logged in (via email OR social)
      setAccessToken(session.access_token)
      setUserId(session.user.id)
      setUserEmail(session.user.email)
      setIsAuthenticated(true)
    }
  }
  checkSession()
}, [])

// Listen for auth state changes
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // User just logged in (email OR social)
        setAccessToken(session.access_token)
        setUserId(session.user.id)
        setUserEmail(session.user.email)
        setIsAuthenticated(true)
      }
      
      if (event === 'SIGNED_OUT') {
        // User logged out
        setAccessToken(null)
        setUserId(null)
        setUserEmail(null)
        setIsAuthenticated(false)
      }
    }
  )
  
  return () => subscription.unsubscribe()
}, [])
```

---

## 🎨 Component Details

### SocialLoginButtons.tsx

**Props:**
```typescript
interface SocialLoginButtonsProps {
  mode?: 'login' | 'signup'    // Changes button text
  onError?: (error: string) => void  // Error callback
}
```

**State:**
```typescript
const [loading, setLoading] = useState<string | null>(null)
// 'google' | 'facebook' | 'linkedin_oidc' | null
```

**Methods:**
```typescript
const handleSocialLogin = async (provider) => {
  setLoading(provider)  // Show spinner on clicked button
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: window.location.origin,
      queryParams: { /* provider-specific */ }
    }
  })
  
  if (error) {
    onError?.(error.message)
    setLoading(null)
  }
  
  // If successful, browser redirects (loading stays active)
}
```

**Render:**
```jsx
<div className="space-y-3">
  {/* Google Button */}
  <Button onClick={() => handleSocialLogin('google')}>
    {loading === 'google' ? <Spinner /> : (
      <>
        <GoogleLogo />
        <span>{mode === 'signup' ? 'Sign up' : 'Continue'} with Google</span>
      </>
    )}
  </Button>
  
  {/* Meta Button */}
  <Button onClick={() => handleSocialLogin('facebook')}>
    {/* ... */}
  </Button>
  
  {/* LinkedIn Button */}
  <Button onClick={() => handleSocialLogin('linkedin_oidc')}>
    {/* ... */}
  </Button>
  
  {/* Divider */}
  <div>Or continue with email</div>
</div>
```

---

## 🔐 Security Architecture

### What's Secure:

```
┌─────────────────────────────────────────┐
│ Frontend (Your App)                     │
│                                         │
│ ✅ No Client Secrets                    │
│ ✅ No OAuth Tokens Stored               │
│ ✅ Only Access Tokens (short-lived)     │
│ ✅ HTTPS Only                            │
└─────────────────────────────────────────┘
            ↓ (Access Token)
┌─────────────────────────────────────────┐
│ Supabase (Auth Middleware)              │
│                                         │
│ ✅ Validates OAuth Tokens               │
│ ✅ Manages Refresh Tokens               │
│ ✅ Stores Client Secrets Securely       │
│ ✅ Rate Limiting                         │
│ ✅ CSRF Protection                       │
└─────────────────────────────────────────┘
            ↓ (Service Role Key)
┌─────────────────────────────────────────┐
│ Database (Postgres)                     │
│                                         │
│ ✅ Row Level Security (RLS)             │
│ ✅ Encrypted at Rest                    │
│ ✅ Encrypted in Transit                 │
└─────────────────────────────────────────┘
```

### Token Lifecycle:

```
1. OAuth Token (from provider)
   ↓
   Validated by Supabase → Converted to:

2. Access Token (1 hour lifespan)
   ↓
   Sent to frontend → Used for API calls
   ↓
   Expires after 1 hour → Auto-refreshed using:

3. Refresh Token (stored in httpOnly cookie)
   ↓
   Never exposed to JavaScript
   ↓
   Used to get new Access Token

4. Session persists until:
   - User logs out
   - Refresh token expires (30 days)
   - User revokes access
```

---

## 🎯 Account Linking Logic

### Scenario 1: Email First, Then Social

```
Day 1: User signs up with email
  ↓
auth.users:
  id: uuid-1
  email: john@example.com
  provider: email

Day 2: User tries "Continue with Google"
  ↓
Google returns: john@example.com
  ↓
Supabase checks: Email already exists?
  ↓
YES → Link accounts:

auth.users (UPDATED):
  id: uuid-1
  email: john@example.com
  provider: google  ← Changed!
  identities: [
    { provider: 'email', ... },
    { provider: 'google', ... }  ← Added!
  ]

Result: User can log in with EITHER email or Google
```

### Scenario 2: Social First, Then Email

```
Day 1: User signs up with Google
  ↓
auth.users:
  id: uuid-1
  email: john@example.com
  provider: google

Day 2: User tries to sign up with email
  ↓
Supabase checks: Email already exists?
  ↓
YES → Error: "Email already registered"
  ↓
User clicks "Sign in instead"
  ↓
User can log in with Google (original method)
```

---

## 📊 User Metadata Structure

### Example: User from Google

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@gmail.com",
  "phone": null,
  "provider": "google",
  "created_at": "2025-12-03T10:00:00Z",
  "last_sign_in_at": "2025-12-03T10:00:00Z",
  "role": "authenticated",
  
  "user_metadata": {
    "email": "john.doe@gmail.com",
    "email_verified": true,
    "full_name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/a/xxx",
    "provider_id": "1234567890",
    "iss": "https://accounts.google.com",
    "sub": "1234567890"
  },
  
  "app_metadata": {
    "provider": "google",
    "providers": ["google"]
  },
  
  "identities": [
    {
      "id": "1234567890",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "identity_data": {
        "email": "john.doe@gmail.com",
        "email_verified": true,
        "full_name": "John Doe",
        "avatar_url": "https://lh3.googleusercontent.com/a/xxx",
        "provider_id": "1234567890",
        "sub": "1234567890"
      },
      "provider": "google",
      "last_sign_in_at": "2025-12-03T10:00:00Z",
      "created_at": "2025-12-03T10:00:00Z",
      "updated_at": "2025-12-03T10:00:00Z"
    }
  ]
}
```

---

## 🔄 Error Handling Flow

### In SocialLoginButtons.tsx:

```typescript
try {
  const { data, error } = await supabase.auth.signInWithOAuth(...)
  
  if (error) {
    // Provider-specific error
    onError?.(error.message)
    // Examples:
    // - "Provider is not enabled"
    // - "Redirect URI mismatch"
    // - "Invalid client credentials"
  }
  
} catch (err) {
  // Network error or unexpected error
  onError?.(err.message || 'Failed to sign in')
}
```

### In AuthModal.tsx:

```typescript
const [error, setError] = useState('')

<SocialLoginButtons 
  onError={(err) => setError(err)}  // Display error in modal
/>

{error && (
  <div className="error-box">
    {error}
  </div>
)}
```

---

## 🎨 Visual Component Tree

```
AuthModal
├─ DialogHeader
│   ├─ Title: "Sign In" or "Join DEWII"
│   └─ Description
│
├─ SocialLoginButtons ← NEW SECTION
│   ├─ Google Button
│   │   ├─ Google Logo (SVG)
│   │   ├─ Text: "Continue with Google"
│   │   └─ Hover: Emerald glow
│   │
│   ├─ Meta Button
│   │   ├─ Facebook "f" (blue circle)
│   │   ├─ Text: "Continue with Meta"
│   │   └─ Hover: Emerald glow
│   │
│   ├─ LinkedIn Button
│   │   ├─ LinkedIn Logo (SVG)
│   │   ├─ Text: "Continue with LinkedIn"
│   │   └─ Hover: Emerald glow
│   │
│   └─ Divider: "Or continue with email"
│
└─ Email/Password Form (EXISTING)
    ├─ Name Input (signup only)
    ├─ Email Input
    ├─ Password Input
    ├─ Terms Checkboxes (signup only)
    ├─ Submit Button
    └─ Mode Toggle
```

---

## 📁 File Structure

```
/
├─ App.tsx                          (Auth state management)
├─ components/
│   ├─ AuthModal.tsx                (Updated with social login)
│   ├─ SocialLoginButtons.tsx       (NEW! Social login buttons)
│   ├─ LandingPage.tsx              (Shows AuthModal when not logged in)
│   └─ ...
├─ SOCIAL_LOGIN_INDEX.md            (Documentation index)
├─ SOCIAL_LOGIN_QUICK_START.md      (5-min setup guide)
├─ SOCIAL_LOGIN_SETUP.md            (Complete setup guide)
├─ SOCIAL_LOGIN_PREVIEW.md          (Visual mockups)
├─ SOCIAL_LOGIN_IMPLEMENTATION_SUMMARY.md  (Technical overview)
└─ SOCIAL_LOGIN_ARCHITECTURE.md     (This file)
```

---

## 🎉 Summary

You now have:
- ✅ **3 new social login options** (Google, Meta, LinkedIn)
- ✅ **Beautiful hybrid-styled buttons** (brand colors + Hemp'in glow)
- ✅ **Seamless integration** with existing email/password flow
- ✅ **Automatic account linking** (same email = one user)
- ✅ **Secure OAuth flow** (tokens managed by Supabase)
- ✅ **Mobile responsive** (works on all devices)
- ✅ **Theme compatible** (adapts to all 4 themes)

**Next step:** Configure providers in Supabase Dashboard → See `/SOCIAL_LOGIN_QUICK_START.md`

---

**Built with 💚 for Hemp'in Universe**
