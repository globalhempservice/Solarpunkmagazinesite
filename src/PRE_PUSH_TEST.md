# 🧪 PRE-PUSH TEST - RUN THIS BEFORE PUSHING

**Before you push to GitHub, run these quick tests to ensure everything works:**

---

## ✅ 1. BUILD TEST

```bash
# Clean previous builds
rm -rf dist/

# Build the project
npm run build
```

**Expected Result:**
- ✅ Build completes without errors
- ✅ `dist/` folder is created
- ✅ `dist/index.html` exists
- ✅ `dist/assets/` contains JS and CSS files
- ✅ No TypeScript errors
- ✅ No missing module errors

**If errors occur:**
- Check the error message
- Verify all imports are correct
- Run `npm install` to ensure all dependencies are installed
- Check for missing files

---

## ✅ 2. PREVIEW TEST

```bash
# Preview the built site locally
npm run preview
```

**Expected Result:**
- ✅ Server starts (usually at http://localhost:4173)
- ✅ Site loads in browser
- ✅ No console errors
- ✅ Basic navigation works

**Test these pages:**
1. Homepage loads
2. Click on an article (if any)
3. Try to login/signup (modal appears)
4. Check mobile view (resize browser)

---

## ✅ 3. DEPENDENCY CHECK

```bash
# List installed packages
npm list --depth=0
```

**Verify key packages are installed:**
- ✅ react
- ✅ react-dom
- ✅ react-globe.gl
- ✅ three
- ✅ @supabase/supabase-js
- ✅ lucide-react
- ✅ motion (or framer-motion)

**If missing:**
```bash
npm install
```

---

## ✅ 4. GITIGNORE CHECK

```bash
# See what Git will track
git status --ignored
```

**Verify these are IGNORED (should NOT appear in untracked files):**
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `.env*` files
- ❌ `.DS_Store`

**Verify these WILL BE COMMITTED:**
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ All `/components/` files
- ✅ All `/utils/` files
- ✅ `/App.tsx`
- ✅ `/src/main.tsx`
- ✅ `README.md`

---

## ✅ 5. SENSITIVE DATA CHECK

Search for sensitive data that shouldn't be committed:

```bash
# Search for potential API keys
grep -r "sk_live" . --exclude-dir=node_modules
grep -r "SUPABASE_SERVICE_ROLE_KEY" . --exclude-dir=node_modules
grep -r "password" . --exclude-dir=node_modules --exclude="*.md"

# Should return minimal results (only in documentation)
```

**✅ SAFE if found only in:**
- Documentation files (.md)
- Backend server files (these use environment variables)

**❌ NOT SAFE if found in:**
- Frontend components
- Hardcoded strings in .tsx/.ts files

---

## ✅ 6. SIZE CHECK

```bash
# Check dist folder size
du -sh dist/
```

**Expected:**
- Total size: 2-5 MB (reasonable for a React app with 3D globe)
- If > 10 MB, check for:
  - Unused dependencies
  - Large images that could be optimized
  - Duplicate libraries

---

## ✅ 7. TYPESCRIPT CHECK

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

**Expected Result:**
- ✅ No errors (or only minor warnings)

**If errors:**
- Fix TypeScript errors before pushing
- Common issues:
  - Missing type definitions
  - Incorrect prop types
  - Unused imports

---

## ✅ 8. FILE COUNT CHECK

```bash
# Count files that will be committed
git add -A --dry-run | wc -l
```

**Expected:**
- Should be 200-300+ files
- Includes all components, utils, configs

**If very low (< 50):**
- Check .gitignore isn't excluding too much
- Verify files are in correct directories

---

## ✅ 9. PACKAGE.JSON VALIDATION

```bash
# Validate package.json
npm run build 2>&1 | grep -i "error"
```

**Verify:**
- ✅ No JSON syntax errors
- ✅ All scripts defined
- ✅ No conflicting dependencies
- ✅ Version numbers valid

---

## ✅ 10. FINAL VISUAL CHECK

Open these files and verify manually:

### **`.gitignore`**
- [ ] Contains `node_modules/`
- [ ] Contains `dist/`
- [ ] Contains `.env*`
- [ ] Contains `.DS_Store`

### **`package.json`**
- [ ] Name: "hempin-universe"
- [ ] Version: "1.1.0"
- [ ] All dependencies listed
- [ ] Build script: "vite build"

### **`netlify.toml`**
- [ ] Publish directory: "dist"
- [ ] Build command: "npm install && npm run build"
- [ ] Node version: 18

### **`vite.config.ts`**
- [ ] outDir: "dist"
- [ ] Includes react plugin
- [ ] Three.js optimization configured

### **`README.md`**
- [ ] Up to date
- [ ] No placeholder text you don't want public
- [ ] Links work (or marked as TODO)

---

## 🎯 QUICK TEST SCRIPT

Run all tests at once:

```bash
# Run all tests
echo "🧪 Starting pre-push tests..."
echo ""

echo "✅ 1. Cleaning previous builds..."
rm -rf dist/

echo "✅ 2. Building project..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed! Fix errors before pushing."
  exit 1
fi

echo "✅ 3. Checking dist folder..."
if [ -d "dist" ]; then
  echo "✅ dist/ folder exists"
  echo "Size: $(du -sh dist/ | cut -f1)"
else
  echo "❌ dist/ folder not created!"
  exit 1
fi

echo "✅ 4. Checking gitignore..."
if [ -f ".gitignore" ]; then
  echo "✅ .gitignore exists"
else
  echo "❌ .gitignore missing!"
  exit 1
fi

echo ""
echo "🎉 All tests passed! Ready to push to GitHub!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Initial commit - Hemp'in Universe v1.1.0'"
echo "3. git push origin main"
```

**Save as `pre-push-test.sh` and run:**
```bash
chmod +x pre-push-test.sh
./pre-push-test.sh
```

---

## 🚨 TROUBLESHOOTING

### **Build fails with "Module not found"**
```bash
npm install
npm run build
```

### **TypeScript errors**
```bash
npx tsc --noEmit
# Fix errors shown
```

### **Vite errors**
```bash
rm -rf node_modules
npm install
npm run build
```

### **Large bundle size**
- Check for duplicate dependencies
- Remove unused imports
- Verify tree-shaking is working

---

## ✅ FINAL CHECKLIST

Before pushing, confirm:

- [ ] `npm run build` completes successfully
- [ ] `npm run preview` works and site loads
- [ ] No sensitive data in code
- [ ] `.gitignore` is comprehensive
- [ ] `package.json` has all dependencies
- [ ] `README.md` is up to date
- [ ] TypeScript compiles without errors
- [ ] Bundle size is reasonable (< 10 MB)
- [ ] All key files will be committed

---

## 🎉 READY TO PUSH!

If all tests pass, you're ready to push to GitHub!

```bash
git add .
git commit -m "Initial commit - Hemp'in Universe v1.1.0"
git remote add origin https://github.com/YOUR_USERNAME/hempin-universe.git
git push -u origin main
```

---

**Good luck! 🚀**
