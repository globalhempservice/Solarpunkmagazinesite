# 🔐 Social Login Setup Guide - Hemp'in Universe

This guide will walk you through setting up Google, Meta/Facebook, and LinkedIn OAuth authentication in your Supabase project.

---

## 📋 Prerequisites

Before you start, you'll need:
- ✅ Access to your Supabase Dashboard
- ✅ Your Supabase project URL: `https://${projectId}.supabase.co`
- ✅ Admin access to create OAuth apps on each provider

---

## 🎯 Step 1: Configure Supabase Redirect URL

### What is the Redirect URL?

The redirect URL is where users are sent after authenticating with a provider. Supabase handles this automatically.

### Your Redirect URL:
```
https://<your-project-id>.supabase.co/auth/v1/callback
```

Example:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**⚠️ Important:** You'll need this URL for EVERY provider setup below.

---

## 1️⃣ Google OAuth Setup

### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Select **Web application**

### Step 2: Configure OAuth Consent Screen

1. Click **Configure Consent Screen**
2. Select **External** (for public access)
3. Fill in:
   - **App name:** Hemp'in Universe
   - **User support email:** Your email
   - **Developer contact:** Your email
   - **Application home page:** https://mag.hempin.org
   - **Authorized domains:** 
     - `hempin.org`
     - `supabase.co`
4. Click **Save and Continue**
5. Add scopes:
   - `email`
   - `profile`
   - `openid`
6. Click **Save and Continue**

### Step 3: Create OAuth Client ID

1. Application type: **Web application**
2. Name: **Hemp'in Universe - Production**
3. **Authorized JavaScript origins:**
   ```
   https://mag.hempin.org
   http://localhost:5173
   ```
4. **Authorized redirect URIs:**
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. **Copy your Client ID and Client Secret** (you'll need these!)

### Step 4: Configure in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### Test Google Login ✅

- Your users can now sign in with Google!
- No email verification needed (Google already verified)

---

## 2️⃣ Meta/Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Click **Next**

### Step 2: Configure App Details

1. **Display Name:** Hemp'in Universe
2. **App Contact Email:** Your email
3. **Business Portfolio:** (Optional) Select or skip
4. Click **Create App**

### Step 3: Add Facebook Login Product

1. In your app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Select **Web** platform
4. **Site URL:** `https://mag.hempin.org`
5. Click **Save** → **Continue**

### Step 4: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings** (in left sidebar)
2. **Valid OAuth Redirect URIs:**
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
3. **Deauthorize Callback URL:** (Optional)
   ```
   https://mag.hempin.org/auth/callback
   ```
4. Toggle **Login with the JavaScript SDK:** ON
5. Toggle **Web OAuth Login:** ON
6. Click **Save Changes**

### Step 5: Get App Credentials

1. Go to **Settings** → **Basic** (in left sidebar)
2. Copy your **App ID** (this is your Client ID)
3. Click **Show** next to **App Secret** and copy it (this is your Client Secret)

### Step 6: Make App Public (IMPORTANT!)

1. At the top of the dashboard, you'll see **App Mode: Development**
2. Click the toggle to switch to **Live Mode**
3. You may need to verify your business/personal info
4. Fill in:
   - Privacy Policy URL: `https://hempin.org/trust`
   - Terms of Service URL: `https://hempin.org/trust`
   - Category: **Entertainment** or **News & Media**
5. Click **Switch to Live**

### Step 7: Configure in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Facebook** and click to expand
3. Toggle **Enable Sign in with Facebook**
4. Paste your **App ID** as **Facebook client ID**
5. Paste your **App Secret** as **Facebook client secret**
6. Click **Save**

### Test Meta Login ✅

- Users can now sign in with Facebook/Meta!
- Meta automatically verifies emails

---

## 3️⃣ LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in:
   - **App name:** Hemp'in Universe
   - **LinkedIn Page:** (Create a company page first if you don't have one)
   - **Privacy Policy URL:** `https://hempin.org/trust`
   - **App logo:** Upload Hemp'in logo (square, min 100x100px)
4. Check the agreement box
5. Click **Create App**

### Step 2: Request Access to Sign In with LinkedIn

1. In your app dashboard, go to **Products** tab
2. Find **Sign In with LinkedIn using OpenID Connect**
3. Click **Request Access**
4. It should be approved instantly (if not, wait a few minutes)

### Step 3: Configure OAuth Settings

1. Go to **Auth** tab
2. Under **OAuth 2.0 settings**:
3. **Redirect URLs:**
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
4. Click **Add redirect URL** if you want to add more (e.g., localhost for testing):
   ```
   http://localhost:5173/auth/callback
   ```
5. Click **Update**

### Step 4: Get App Credentials

1. Still in the **Auth** tab
2. Copy your **Client ID**
3. Copy your **Client Secret** (click "Show" if hidden)

### Step 5: Configure in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **LinkedIn (OIDC)** and click to expand
3. Toggle **Enable Sign in with LinkedIn**
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### Test LinkedIn Login ✅

- Users can now sign in with LinkedIn!
- Great for B2B hemp professionals

---

## 🧪 Testing Your Social Logins

### Test Checklist:

1. **Sign Up with Google**
   - Click "Sign up with Google" in auth modal
   - Redirected to Google login
   - Authorize Hemp'in Universe
   - Redirected back to app
   - User is logged in ✅

2. **Sign Up with Meta**
   - Click "Sign up with Meta" in auth modal
   - Redirected to Facebook login
   - Authorize Hemp'in Universe
   - Redirected back to app
   - User is logged in ✅

3. **Sign Up with LinkedIn**
   - Click "Sign up with LinkedIn" in auth modal
   - Redirected to LinkedIn login
   - Authorize Hemp'in Universe
   - Redirected back to app
   - User is logged in ✅

4. **Account Linking (Existing Email)**
   - User signs up with email: user@example.com
   - User tries to sign in with Google using same email
   - Supabase **automatically links accounts** ✅
   - User can use either method to log in

---

## 🔐 What Data You Receive

### From Google:
```json
{
  "email": "user@gmail.com",
  "email_verified": true,
  "full_name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "provider_id": "1234567890",
  "iss": "https://accounts.google.com"
}
```

### From Meta/Facebook:
```json
{
  "email": "user@example.com",
  "full_name": "Jane Smith",
  "avatar_url": "https://platform-lookaside.fbsbx.com/...",
  "provider_id": "1234567890"
}
```

### From LinkedIn:
```json
{
  "email": "professional@company.com",
  "full_name": "Alex Johnson",
  "picture": "https://media.licdn.com/...",
  "sub": "xyz789"
}
```

---

## 🗄️ How Supabase Stores Users

All OAuth users are stored in `auth.users` table:

```sql
SELECT 
  id,                    -- UUID (your internal user ID)
  email,                 -- from provider
  raw_user_meta_data,    -- JSON with full_name, avatar_url, etc.
  app_metadata,          -- provider info
  provider,              -- 'google', 'facebook', 'linkedin_oidc'
  created_at,
  last_sign_in_at
FROM auth.users;
```

### Example Query:
```sql
-- Get all users who signed up with Google
SELECT * FROM auth.users WHERE provider = 'google';

-- Get user's full name from metadata
SELECT 
  email,
  raw_user_meta_data->>'full_name' as name,
  raw_user_meta_data->>'avatar_url' as avatar
FROM auth.users;
```

---

## 🛠️ Troubleshooting

### "Provider is not enabled" Error
- ✅ Check that provider is enabled in Supabase Dashboard
- ✅ Verify Client ID and Secret are correct
- ✅ Ensure redirect URLs match exactly

### "Redirect URI Mismatch" Error
- ✅ Check redirect URL in provider console
- ✅ Must be: `https://<project-id>.supabase.co/auth/v1/callback`
- ✅ No trailing slash!

### "App Not Approved" Error (Facebook)
- ✅ Make sure app is in **Live Mode** (not Development)
- ✅ Add Privacy Policy URL
- ✅ Add Terms of Service URL
- ✅ Complete Business Verification if required

### User Signs Up with Email, Then Tries Google
- ✅ Supabase automatically links if emails match
- ✅ User can use both methods to log in
- ✅ Only one user record is created

### LinkedIn "Product Not Approved"
- ✅ Request access to "Sign In with LinkedIn using OpenID Connect"
- ✅ Usually approved instantly
- ✅ If not, wait 1-2 business days

---

## 📊 User Experience Flow

```
User clicks "Continue with Google"
  ↓
Redirected to Google login page
  ↓
User logs into Google (if not already)
  ↓
Google shows permission screen:
"Hemp'in Universe wants to access:
 - Your email address
 - Your basic profile info"
  ↓
User clicks "Allow"
  ↓
Redirected back to Hemp'in Universe
  ↓
Supabase creates user account automatically
  ↓
User is logged in and sees the app! ✅
```

---

## 🎉 Success Checklist

After setup, verify:

- ✅ Google button appears in auth modal
- ✅ Meta button appears in auth modal
- ✅ LinkedIn button appears in auth modal
- ✅ Clicking each button redirects to provider
- ✅ After authorizing, user is logged in
- ✅ User data appears in Supabase auth.users table
- ✅ Email/password login still works
- ✅ Users can switch between providers

---

## 🔮 Next Steps (Optional)

### Add More Providers:
- Apple (required for iOS App Store)
- Twitter/X (for hemp activists)
- Discord (for community gamification)
- GitHub (for developer community)

### Advanced Features:
- Collect additional user data during onboarding
- Auto-create organization from LinkedIn company
- Link multiple providers to one account
- Social sharing integration

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: **Dashboard → Logs → Auth Logs**
2. Check browser console for errors
3. Verify all URLs and credentials
4. Test in incognito mode (clear cookies)

---

**Built with 💚 for Hemp'in Universe**

🌿 Happy authenticating! Your users will love the one-click sign-in experience.
