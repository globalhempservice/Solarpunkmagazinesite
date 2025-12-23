# ✅ Pre-Deploy Checklist

Run through this before pushing to GitHub:

## 1️⃣ Verify Changes
```bash
git status
```

**Expected to see:**
- `modified: App.tsx`
- `new file: components/BudPresentationPage.tsx`
- `new file: components/BudShowcase.tsx`
- `new file: components/BudIntroCard.tsx`
- Plus any documentation files

## 2️⃣ Test Locally (Optional but Recommended)
```bash
# Build
npm run build

# Preview
npm run preview
```

Then open: `http://localhost:4173/bud-presentation`

If it works locally → will work on Netlify!

## 3️⃣ Commit & Push
```bash
git add .
git commit -m "Add BUD presentation page with public access"
git push origin main
```

## 4️⃣ Monitor Netlify
1. Go to Netlify dashboard
2. Watch for new deploy
3. Wait for "Site is live" (~2-3 min)

## 5️⃣ Test Live Site
```bash
# Clear cache first!
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Then navigate to:
https://mag.hempin.org/bud-presentation
```

## ✅ Success = No 404, BUD page loads!

---

## 🚨 If You Get 404:

1. **Wait 5 minutes** - DNS/CDN cache might need time
2. **Clear browser cache again** - Try incognito
3. **Check Netlify logs** - Look for build errors
4. **Verify changes deployed** - Check Network tab in DevTools

---

## 💡 Remember:

**Your root `/index.html` is already perfect!**
- ✅ Has all meta tags
- ✅ Has favicon
- ✅ Points to `/src/main.tsx`
- ✅ No manual copying needed!

**Vite handles everything automatically:**
- Builds to `/dist`
- Bundles all assets
- Creates optimized HTML
- Netlify deploys `/dist`

---

**Ready? Run the commands above!** 🚀
