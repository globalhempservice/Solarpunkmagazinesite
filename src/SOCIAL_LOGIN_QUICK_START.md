# 🚀 Social Login - Quick Start Guide

**5-Minute Setup for Each Provider**

---

## ⚡ Google (Easiest - Start Here!)

1. **Go to:** https://console.cloud.google.com/
2. **Create OAuth Client**
   - Type: Web application
   - Redirect URI: `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`
3. **Copy:** Client ID + Client Secret
4. **Supabase:** Authentication → Providers → Google → Enable
5. **Paste:** Client ID + Secret → Save

**✅ Done! Test it now.**

---

## 📘 Meta/Facebook (5 Minutes)

1. **Go to:** https://developers.facebook.com/
2. **Create App** → Consumer type
3. **Add Product:** Facebook Login
4. **Settings:**
   - Redirect URI: `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`
   - Toggle "Web OAuth Login" ON
5. **Switch to Live Mode** (important!)
6. **Copy:** App ID (Client ID) + App Secret
7. **Supabase:** Authentication → Providers → Facebook → Enable
8. **Paste:** App ID + Secret → Save

**✅ Done! Test it now.**

---

## 💼 LinkedIn (B2B Power!)

1. **Go to:** https://www.linkedin.com/developers/apps
2. **Create App**
   - Need a LinkedIn Company Page first
   - Privacy Policy: `https://hempin.org/trust`
3. **Products Tab:** Request "Sign In with LinkedIn using OpenID Connect"
4. **Auth Tab:**
   - Redirect URI: `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback`
5. **Copy:** Client ID + Client Secret
6. **Supabase:** Authentication → Providers → LinkedIn (OIDC) → Enable
7. **Paste:** Client ID + Secret → Save

**✅ Done! Test it now.**

---

## 🎯 Your Redirect URL (Same for All)

```
https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback
```

**Find your Project ID:**
- Supabase Dashboard → Project Settings → General
- Or look at your project URL

**Example:**
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

---

## 🧪 Quick Test

1. Open Hemp'in Universe
2. Click "Sign In"
3. Click "Continue with Google" (or Meta/LinkedIn)
4. Authorize the app
5. You're logged in! ✅

**Check Supabase:**
- Dashboard → Authentication → Users
- You should see your new user!

---

## 🔥 Pro Tips

### Start with Google
- 90% of users have Google accounts
- Easiest to set up
- Test the whole flow first

### Meta Gotcha
- Must switch to "Live Mode"
- Add Privacy Policy URL
- Add Terms of Service URL

### LinkedIn Power
- Perfect for B2B hemp industry
- Collects professional info
- Great for company associations

---

## 🐛 Common Issues

**"Provider is not enabled"**
- ✅ Toggle ON in Supabase Dashboard

**"Redirect URI mismatch"**
- ✅ Check exact URL (no trailing slash!)
- ✅ Must match Supabase callback URL

**Facebook "App in Development Mode"**
- ✅ Switch to Live Mode in Facebook Dashboard

---

## 📱 What Happens?

```
User clicks social button
  ↓
Redirected to provider (Google/Meta/LinkedIn)
  ↓
User authorizes Hemp'in Universe
  ↓
Redirected back to your app
  ↓
User is logged in automatically!
```

**No password needed. No email verification needed. ✨**

---

## 🎉 You're Done!

Users can now sign in with:
- ✅ Google
- ✅ Meta/Facebook
- ✅ LinkedIn
- ✅ Email/Password (still works!)

---

**Need detailed setup?** See `/SOCIAL_LOGIN_SETUP.md`

**Built with 💚 for Hemp'in Universe**
