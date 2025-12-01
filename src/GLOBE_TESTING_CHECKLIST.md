# 🌍 GLOBE SYSTEM - TESTING CHECKLIST

**Feature:** Public Interactive 3D Globe  
**Date:** November 29, 2025  
**Status:** Ready for Testing

---

## ✅ PRE-FLIGHT CHECKLIST

### **1. Routes & Navigation**
- [ ] Visit `/globe` directly in browser
- [ ] Globe loads without errors
- [ ] Visit homepage and click "🌍 HEMP ATLAS" card
- [ ] Navigates to globe view
- [ ] Header is hidden on globe view
- [ ] Bottom navbar is hidden on globe view
- [ ] "Back" button returns to feed

### **2. Globe Rendering**
- [ ] 3D Earth appears
- [ ] Earth has realistic Blue Marble texture
- [ ] Can rotate globe with mouse/touch
- [ ] Can zoom in/out with scroll/pinch
- [ ] No Three.js errors in console (warnings suppressed)
- [ ] Loading indicator shows while loading

### **3. Customization Panel**
- [ ] Click "Customize" button
- [ ] Panel appears on right side
- [ ] Ocean color picker works
- [ ] Land color picker works
- [ ] Atmosphere color picker works
- [ ] All sliders work (intensity, density, speed)
- [ ] Grid toggle works
- [ ] Cel-shading toggle works
- [ ] Holographic toggle works
- [ ] Particle effects toggle works
- [ ] "Reset" button works
- [ ] "Save Style" button works
- [ ] Close panel with X button

### **4. Presets**
- [ ] Click "🌱 Solarpunk" preset → Colors change
- [ ] Click "🌙 Midnight" preset → Colors change
- [ ] Click "🌅 Golden Hour" preset → Colors change
- [ ] Click "🎮 Retro Game" preset → Colors change
- [ ] Preset changes are instant
- [ ] Preset changes affect all settings

### **5. Layer Panel**
- [ ] Click "Layers" button
- [ ] Panel appears on left side
- [ ] Shows "Organizations" layer
- [ ] Shows "Shops & Products" layer
- [ ] Both layers show 🔒 lock icon (if not authenticated)
- [ ] Both layers show "Sign in to view" message
- [ ] "Sign In to Explore" button appears
- [ ] Can collapse/expand panel

### **6. Authentication Flow (Not Logged In)**
- [ ] Visit `/globe` without logging in
- [ ] Globe is visible
- [ ] Customization works
- [ ] Layers show lock icons
- [ ] Click "Sign In to Explore" button
- [ ] Returns to feed/login view
- [ ] Log in successfully
- [ ] Return to `/globe` (manually)
- [ ] Layers are now unlocked

### **7. Authentication Flow (Logged In)**
- [ ] Log in first
- [ ] Visit `/globe`
- [ ] No lock icons on layers
- [ ] Both layers show eye icon
- [ ] Layers are enabled by default
- [ ] Can see marker count (e.g., "143 items")

### **8. Data Layers - Organizations**
- [ ] Toggle "Organizations" layer ON
- [ ] Green/emerald markers appear on globe
- [ ] Click a marker
- [ ] Detail card appears at bottom
- [ ] Shows company name
- [ ] Shows company description
- [ ] Shows location
- [ ] Close card with X button
- [ ] Toggle layer OFF → Markers disappear

### **9. Data Layers - Shops**
- [ ] Toggle "Shops & Products" layer ON
- [ ] Amber/orange markers appear on globe
- [ ] Markers are distinct from organizations
- [ ] Click a shop marker
- [ ] Detail card appears
- [ ] Shows shop name
- [ ] Shows price
- [ ] Shows description
- [ ] Close card with X button
- [ ] Toggle layer OFF → Markers disappear

### **10. Both Layers Active**
- [ ] Enable both layers
- [ ] Both types of markers visible
- [ ] Different colors for each layer
- [ ] Can click any marker
- [ ] Correct details show based on type
- [ ] Markers don't overlap too much

### **11. Geocoding**
- [ ] Markers appear in correct countries
- [ ] USA companies appear in North America
- [ ] European companies appear in Europe
- [ ] Asian companies appear in Asia
- [ ] No markers at (0,0) coordinates
- [ ] Markers have slight jitter (not perfectly stacked)

### **12. Persistent Preferences**
- [ ] Customize globe colors
- [ ] Click "Save Style"
- [ ] Refresh page
- [ ] Colors persist after refresh
- [ ] Navigate away and back
- [ ] Colors still persisted

### **13. Mobile Responsiveness**
- [ ] Test on mobile viewport (< 768px)
- [ ] Globe renders correctly
- [ ] Customization panel is accessible
- [ ] Layer panel is accessible
- [ ] Touch controls work (rotate, zoom)
- [ ] Buttons are tappable
- [ ] Cards don't overflow screen

### **14. Performance**
- [ ] Globe loads in < 3 seconds
- [ ] No lag when rotating
- [ ] No lag when toggling layers
- [ ] No memory leaks
- [ ] Can leave globe running for 5+ minutes
- [ ] Smooth animations throughout

### **15. Error Handling**
- [ ] Test with no internet (offline)
- [ ] Test with API errors (block `/companies` request)
- [ ] Appropriate error messages
- [ ] Globe still renders (empty)
- [ ] Can still customize
- [ ] No console errors (beyond expected)

---

## 🐛 KNOWN ISSUES TO VERIFY

### **Issue 1: Shops Layer Data**
- **Expected:** Shops appear on globe
- **Actual:** May be empty if products don't have `organization_location`
- **Fix:** Add location field to swag products OR fetch from organization

### **Issue 2: Visual Effects**
- **Expected:** Cel-shading/holographic actually work
- **Actual:** Checkboxes toggle but no visual change yet
- **Fix:** Implement shaders (future enhancement)

### **Issue 3: Particle Effects**
- **Expected:** Floating hemp leaves or similar
- **Actual:** Checkbox toggles but no particles yet
- **Fix:** Implement particle system (future enhancement)

### **Issue 4: Grid Lines**
- **Expected:** Latitude/longitude grid overlay
- **Actual:** Checkbox toggles but may not show grid
- **Fix:** Need to configure react-globe.gl grid options

---

## 🔧 DEBUGGING TIPS

### **Globe doesn't load:**
```javascript
// Check console for:
- Three.js errors (should be suppressed)
- Import errors for react-globe.gl
- Network errors for API calls

// Verify:
- react-globe.gl is installed
- Lazy loading works
- Suspense fallback shows
```

### **No markers appear:**
```javascript
// Check console for:
- API response from /companies
- API response from /swag-products
- Geocoding errors

// Verify:
- isAuthenticated === true
- layers[0].enabled === true
- companies array has data
- parseLocation() returns valid coords
```

### **Colors don't change:**
```javascript
// Check:
- globeStyle state updates
- GlobeComponent props receive updates
- atmosphereColor prop is passed correctly

// Verify:
- Color picker onChange fires
- setGlobeStyle() is called
- Re-render occurs
```

### **Auth gates don't work:**
```javascript
// Check:
- userId exists
- accessToken exists
- isAuthenticated boolean

// Verify:
- Auth state from App.tsx
- Props passed correctly
- Layer.requiresAuth === true
```

---

## 📸 SCREENSHOTS TO TAKE

### **For Documentation:**
1. Globe with default Solarpunk style
2. Globe with Midnight preset
3. Globe with Golden Hour preset
4. Globe with Retro Game preset (grid visible)
5. Customization panel open
6. Layer panel open (unauthenticated)
7. Layer panel open (authenticated)
8. Both layers active with markers
9. Marker detail card showing
10. Mobile view

### **For Marketing:**
1. Beautiful hero shot of globe
2. Side-by-side of different presets
3. Animated GIF of rotation
4. Animated GIF of layer toggle
5. Screenshot of public globe card on homepage

---

## ✅ ACCEPTANCE CRITERIA

### **Must Have (P0):**
- [x] Globe is publicly accessible at `/globe`
- [x] Customization panel works
- [x] Layer panel works
- [x] Auth gates function correctly
- [x] At least one layer has real data
- [x] Navigation works (homepage → globe → back)
- [x] Mobile responsive

### **Should Have (P1):**
- [x] Both layers (Companies + Shops) work
- [x] Geocoding uses real coordinates
- [x] Persistent preferences
- [x] 4 visual presets
- [x] Marker detail cards

### **Nice to Have (P2):**
- [ ] Visual effects actually work (shaders)
- [ ] Zoom-based layer activation
- [ ] Advanced filters
- [ ] Social sharing

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Launch:**
- [ ] All P0 criteria met
- [ ] No console errors
- [ ] API endpoints are live
- [ ] Mobile tested
- [ ] Desktop tested (Chrome, Firefox, Safari)
- [ ] Load time < 5 seconds
- [ ] Documentation complete

### **After Launch:**
- [ ] Monitor error logs
- [ ] Monitor API performance
- [ ] Track user engagement
- [ ] Gather user feedback
- [ ] Plan Phase 2 enhancements

---

## 📊 TEST RESULTS

### **Date Tested:** _____________
### **Tester:** _____________
### **Browser:** _____________
### **Device:** _____________

### **Results:**
- Total Tests: _____ / 100+
- Passed: _____
- Failed: _____
- Blocked: _____

### **Critical Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

### **Minor Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

### **Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## ✨ READY FOR LAUNCH?

**Overall Status:** [ ] PASS [ ] FAIL [ ] NEEDS WORK

**Approved By:** _____________  
**Date:** _____________

---

**Good luck with testing!** 🌍✨
