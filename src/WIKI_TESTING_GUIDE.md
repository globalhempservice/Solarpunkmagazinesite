# 🧪 Wiki System Testing Guide

## Quick Test Checklist

### ✅ Landing Page (Logged Out)

1. **Navigate to DEWII** without logging in
2. **Find the Hemp'in leaf logo** in the center top of the page
3. **Click the logo**
   - ✅ Bubble controller should appear below the logo
   - ✅ Should show a gradient green/teal Wiki button
   - ✅ Label should say "Wiki"
4. **Click anywhere on backdrop**
   - ✅ Bubble controller should close
5. **Click logo again** to re-open bubble
6. **Click the Wiki button**
   - ✅ Bubble should close
   - ✅ Wiki page should open in fullscreen modal
   - ✅ Should show "Hemp'in Wiki" header
   - ✅ Should show "What's Coming Next" card
7. **Read the roadmap card**
   - ✅ Category badge should say "Roadmap" (purple)
   - ✅ Date should show "December 2, 2025"
   - ✅ Description should mention Thai farmer to Parisian boutique
8. **Click the roadmap card**
   - ✅ Should transition to document view
   - ✅ Should show "Back" button
   - ✅ Title should be "🌿 DEWII Future Roadmap - What's Coming Next"
   - ✅ Content should render with proper formatting
9. **Test markdown rendering:**
   - ✅ Headings (H1, H2, H3, H4) should be properly sized
   - ✅ Bold text (**text**) should be bold and primary colored
   - ✅ Lists should have bullets/numbers
   - ✅ Checkboxes (✅ ❌) should display
   - ✅ Horizontal rules (---) should show
10. **Click "Back" button**
    - ✅ Should return to wiki home
    - ✅ Card should still be visible
11. **Click X button**
    - ✅ Wiki should close
    - ✅ Should return to landing page

### ✅ Main App (Logged In)

1. **Log in to DEWII**
2. **Find the Hemp'in leaf logo** in the center top header
3. **Click the logo**
   - ✅ Bubble controller should appear below the logo
   - ✅ Should show Wiki button with gradient
4. **Repeat steps 4-11 from above**

### ✅ Mobile Testing

1. **Open on mobile device** (or use browser dev tools)
2. **Test landing page logo click**
   - ✅ Bubble should position correctly
   - ✅ Wiki button should be tap-friendly
3. **Open Wiki page**
   - ✅ Should be fullscreen
   - ✅ Should be scrollable
   - ✅ Text should be readable
   - ✅ Card should be tappable
4. **Test document view**
   - ✅ Content should be responsive
   - ✅ Back button should be accessible
   - ✅ Close button should be accessible

### ✅ Animation & Polish

1. **Click logo multiple times**
   - ✅ Bubble should smoothly appear/disappear
   - ✅ Spring animation should feel natural
2. **Hover over Wiki button** (desktop)
   - ✅ Should scale up slightly
   - ✅ Glow effect should intensify
3. **Click Wiki button**
   - ✅ Smooth scale-down animation
4. **Wiki page transitions**
   - ✅ Fade in/out on open/close
   - ✅ Slide animation between home and document view
5. **Card hover effects** (desktop)
   - ✅ Should scale slightly
   - ✅ Gradient overlay should appear
   - ✅ Arrow indicator should appear

### ✅ Edge Cases

1. **Click backdrop while bubble is open**
   - ✅ Should close bubble
   - ✅ Should NOT open wiki
2. **Open wiki, then click backdrop**
   - ✅ Should close wiki
   - ✅ Should return to previous view
3. **Rapid clicks on logo**
   - ✅ Should toggle bubble smoothly
   - ✅ No visual glitches
4. **Scroll document**
   - ✅ Content should scroll smoothly
   - ✅ Header and footer should stay fixed
5. **Resize browser window**
   - ✅ Wiki should remain responsive
   - ✅ Bubble position should update if logo moves

### ✅ Accessibility

1. **Tab navigation**
   - ✅ Logo should be focusable
   - ✅ Wiki button should be focusable
   - ✅ Back button should be focusable
   - ✅ Close button should be focusable
2. **Keyboard controls**
   - ✅ Enter/Space should activate buttons
   - ✅ Escape should close modals (if implemented)
3. **Screen reader**
   - ✅ Logo should announce "Open menu"
   - ✅ Buttons should have proper labels

## 🐛 Common Issues & Fixes

### Issue: Bubble appears in wrong position
**Fix:** Check if logoRef is properly attached to the button element

### Issue: Markdown not rendering
**Fix:** Check that `/public/roadmap.md` exists and is accessible

### Issue: Wiki doesn't open
**Fix:** Check console for errors, verify state management

### Issue: Animations are janky
**Fix:** Check that motion/react is properly installed

### Issue: Mobile overlay too small
**Fix:** Verify z-index values and fullscreen classes

## 📊 Performance Checks

- [ ] Logo click responds instantly (<100ms)
- [ ] Bubble animation is smooth (60fps)
- [ ] Wiki page loads quickly (<500ms)
- [ ] Document renders without lag
- [ ] Scroll performance is smooth
- [ ] No memory leaks on repeated open/close

## 🎉 Success Criteria

All tests above should pass ✅

The wiki system should feel:
- **Fast** - Instant response to clicks
- **Smooth** - Butter-smooth animations
- **Intuitive** - No confusion about what to click
- **Beautiful** - Gradient effects and polished UI
- **Accessible** - Works for everyone

---

**Happy Testing! 🌿**
