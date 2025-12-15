# ⚡ QUICK FIX: Profile Page Stuck

## Problem
✅ ME drawer works  
❌ Profile page stuck loading

## Solution (2 minutes)

### 1. Copy This SQL
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, trust_score, id_verified, phone_verified)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)), 0, false, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (id, display_name, trust_score, id_verified, phone_verified)
SELECT au.id, COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)), 0, false, false
FROM auth.users au WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = au.id);
```

### 2. Run It
1. Supabase Dashboard → SQL Editor
2. Paste above
3. Click RUN
4. Wait for success

### 3. Test
1. Refresh your app
2. Click ME → My Profile
3. ✅ Should load now!

---

## Then: Create Avatars Bucket

1. Supabase → Storage → New bucket
2. Name: `avatars`
3. Public: ✅ YES
4. Create

---

## Phase 0 Complete When:
- [ ] Profile loads
- [ ] Edit modal works
- [ ] Avatar uploads
- [ ] Data saves
- [ ] Mobile responsive

**Time:** 30 minutes total

**Full Guide:** `/FIX_PROFILE_NOW.md`

---

🚀 **After this:** Phase 1 (SWAP + Messaging + Discovery Match)
