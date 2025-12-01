# DEWII Edge Functions

## 🚀 Quick Deployment

After making changes to any file in `/supabase/functions/server/`:

```bash
supabase functions deploy make-server-053bcd80
```

**That's it!** Your changes will be live in 30 seconds.

## 📁 Structure

```
/supabase/functions/
  ├── server/
  │   ├── index.tsx                          # Main server + article routes
  │   ├── article_organization_routes.tsx    # Multi-author & org publishing
  │   ├── company_routes.tsx                 # Hemp company directory API  
  │   ├── swag_routes.tsx                    # Swag shop + analytics
  │   ├── article_security.tsx               # Article read tokens
  │   ├── wallet_security.tsx                # Point system security
  │   ├── kv_store.tsx                       # Key-value database utils
  │   └── rss_parser.tsx                     # RSS feed parsing
  └── README.md                              # This file
```

## 🔌 API Endpoints

### Public Routes (No Auth)
- `GET /health` - Health check
- `GET /articles` - Fetch all articles
- `GET /articles/:id` - Get single article
- `GET /organizations/:orgId/articles` - Org articles
- `GET /articles/:articleId/full` - Article with co-authors

### Protected Routes (Requires Auth)
- `GET /my-articles` - User's own articles
- `POST /articles` - Create article
- `POST /articles/with-organization` - Create with co-authors
- `POST /articles/:articleId/authors` - Add co-author
- `GET /user/organizations` - User's organizations
- All company routes
- All swag shop routes

## 🧪 Testing After Deployment

1. Open `/TEST_EDGE_FUNCTION_DEPLOYMENT.html`
2. Click "Run All Tests"
3. Should see all ✅ SUCCESS

Or test manually:
```javascript
// Browser console
fetch('https://dhsqlszauibxintwziib.supabase.co/functions/v1/make-server-053bcd80/health')
  .then(r => r.json())
  .then(d => console.log('✅', d))
```

## 🐛 Troubleshooting

### Deploy fails with "not logged in"
```bash
supabase login
```

### Changes not reflecting after deploy
```bash
# Force redeploy
supabase functions delete make-server-053bcd80
supabase functions deploy make-server-053bcd80
```

### 401 errors on public routes
Old cached code is deployed. Redeploy to fix:
```bash
supabase functions deploy make-server-053bcd80
```

## 📚 More Info

See root directory files:
- `/FIX_SUMMARY.md` - Quick reference for common issues
- `/DEPLOYMENT_CHECKLIST.md` - Complete deployment guide
- `/CURRENT_ERRORS_AND_FIXES.md` - Detailed error explanations

## 🔒 Environment Variables

These are set in Supabase Dashboard → Settings → Edge Functions:

- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (bypasses RLS)
- `ADMIN_USER_ID` - Your superadmin user ID

**Never commit these to git!**

## 📝 Development Workflow

1. Edit code in `/supabase/functions/server/`
2. Deploy: `supabase functions deploy make-server-053bcd80`
3. Wait 30 seconds
4. Test with `/TEST_EDGE_FUNCTION_DEPLOYMENT.html`
5. Hard refresh your app: `Ctrl+Shift+R`

## 🎯 Remember

**Local changes ≠ Deployed changes**

You must deploy after every change!
```bash
supabase functions deploy make-server-053bcd80
```
