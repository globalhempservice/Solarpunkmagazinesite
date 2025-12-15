# 🎨 ME Menu - Visual Guide

## 📱 Complete ME Drawer Menu

```
╔═══════════════════════════════════════╗
║   ME Drawer (PlayStation Style)       ║
╠═══════════════════════════════════════╣
║                                       ║
║   ━━━  (Handle - Swipe Down)          ║
║                                       ║
║   ┌─────────────────────────────┐    ║
║   │  👤 User Avatar              │    ║
║   │  John Hemp Pioneer           │    ║
║   │  🟢 Member                   │    ║
║   └─────────────────────────────┘    ║
║   ═══════════════════════════════    ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ 🔵  My Profile          →  ┃      ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Sky → Purple → Pink gradient        ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ 📄  My Articles        →  ┃  ✨  ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Blue → Indigo → Violet gradient     ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ 🏢  My Organizations   →  ┃      ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Emerald → Teal → Cyan gradient      ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ 📦  My Inventory   Soon   ┃      ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Amber → Orange → Red gradient       ║
║   (Disabled - Coming in Phase 1)      ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ ⚙️   Settings          →  ┃      ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Slate → Gray → Zinc gradient        ║
║                                       ║
║   ─────────────────────────────       ║
║                                       ║
║   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ║
║   ┃ 🚪  Log Out                ┃      ║
║   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      ║
║   Red → Rose gradient                 ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 🎨 Button Details

### **1. My Profile** 🔵
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 👤  │  My Profile          →  │
│  └─────┘                         │
└─────────────────────────────────┘
```
- **Icon**: User
- **Gradient**: from-sky-500 via-purple-500 to-pink-500
- **Action**: Opens full UserProfile view
- **Shows**: Profile header, stats, tabs, achievements

---

### **2. My Articles** 📄 ✨ NEW
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 📄  │  My Articles         →  │
│  └─────┘                         │
└─────────────────────────────────┘
```
- **Icon**: FileText (document)
- **Gradient**: from-blue-500 via-indigo-500 to-violet-500
- **Action**: Opens Dashboard (article management)
- **Shows**: 
  - List of created articles
  - Edit/Delete actions
  - Article stats (views, date)
  - Level badge & XP
  - Achievements

---

### **3. My Organizations** 🏢
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 🏢  │  My Organizations    →  │
│  └─────┘                         │
└─────────────────────────────────┘
```
- **Icon**: Building2
- **Gradient**: from-emerald-500 via-teal-500 to-cyan-500
- **Action**: Not implemented yet
- **Future**: Organization profiles, team management

---

### **4. My Inventory** 📦 (Soon)
```
┌─────────────────────────────────┐
│  ┌─────┐                 ┌────┐ │
│  │ 📦  │  My Inventory    │Soon│ │
│  └─────┘                 └────┘ │
└─────────────────────────────────┘
```
- **Icon**: Package
- **Gradient**: from-amber-500 via-orange-500 to-red-500
- **Badge**: "Soon"
- **Disabled**: true
- **Future**: SWAP items, collections, marketplace inventory

---

### **5. Settings** ⚙️
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ ⚙️   │  Settings            →  │
│  └─────┘                         │
└─────────────────────────────────┘
```
- **Icon**: Settings (gear)
- **Gradient**: from-slate-500 via-gray-500 to-zinc-500
- **Action**: Opens AccountSettings view
- **Shows**: 
  - Theme selector
  - Nickname customization
  - Privacy settings
  - Notification preferences

---

### **6. Log Out** 🚪
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 🚪  │  Log Out                │
│  └─────┘                         │
└─────────────────────────────────┘
```
- **Icon**: LogOut
- **Gradient**: from-red-500 to-rose-500
- **Action**: Signs out user, redirects to login
- **Style**: Red theme (destructive action)

---

## 🎨 Color Palette

### **Profile** (Sky/Purple/Pink)
```css
from-sky-500 via-purple-500 to-pink-500
```
- **Sky**: #0ea5e9
- **Purple**: #a855f7  
- **Pink**: #ec4899
- **Feel**: Creative, expressive, personal

---

### **Articles** (Blue/Indigo/Violet) ✨
```css
from-blue-500 via-indigo-500 to-violet-500
```
- **Blue**: #3b82f6
- **Indigo**: #6366f1
- **Violet**: #8b5cf6
- **Feel**: Professional, creative, content-focused

---

### **Organizations** (Emerald/Teal/Cyan)
```css
from-emerald-500 via-teal-500 to-cyan-500
```
- **Emerald**: #10b981
- **Teal**: #14b8a6
- **Cyan**: #06b6d4
- **Feel**: Growth, collaboration, eco-friendly

---

### **Inventory** (Amber/Orange/Red)
```css
from-amber-500 via-orange-500 to-red-500
```
- **Amber**: #f59e0b
- **Orange**: #f97316
- **Red**: #ef4444
- **Feel**: Valuable, trade, marketplace

---

### **Settings** (Slate/Gray/Zinc)
```css
from-slate-500 via-gray-500 to-zinc-500
```
- **Slate**: #64748b
- **Gray**: #6b7280
- **Zinc**: #71717a
- **Feel**: Neutral, utility, technical

---

### **Log Out** (Red/Rose)
```css
from-red-500 to-rose-500
```
- **Red**: #ef4444
- **Rose**: #f43f5e
- **Feel**: Warning, exit, destructive

---

## 🎭 Interaction States

### **Default State**
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 📄  │  My Articles         →  │  ← Gray arrow
│  └─────┘                         │
│  Border: border/50               │
│  Background: card/50             │
└─────────────────────────────────┘
```

### **Hover State**
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 📄  │  My Articles         →  │  ← White arrow
│  └─────┘                         │
│  Border: primary/30              │
│  Background: gradient opacity 10%│
│  Glow effect active              │
└─────────────────────────────────┘
```

### **Pressed State**
```
┌─────────────────────────────────┐
│  ┌─────┐                         │
│  │ 📄  │  My Articles         →  │
│  └─────┘                         │
│  Scale: 0.98 (slight press down) │
│  Opacity: 0.9                    │
└─────────────────────────────────┘
```

### **Disabled State** (Inventory)
```
┌─────────────────────────────────┐
│  ┌─────┐                 ┌────┐ │
│  │ 📦  │  My Inventory    │Soon│ │
│  └─────┘                 └────┘ │
│  Opacity: 0.5                    │
│  Cursor: not-allowed             │
│  No hover effect                 │
└─────────────────────────────────┘
```

---

## 📐 Dimensions

```
Button:
- Width: 100% (full container width)
- Height: auto
- Padding: 16px (p-4)
- Gap: 16px (between icon and text)
- Border radius: 12px (rounded-xl)

Icon Circle:
- Size: 48px × 48px (w-12 h-12)
- Border radius: 50% (rounded-full)
- Icon size: 24px × 24px (w-6 h-6)

Text:
- Font: medium (500 weight)
- Alignment: left
- Flex: 1 (takes remaining space)

Arrow:
- Size: 20px × 20px (w-5 h-5)
- Color: muted-foreground
- Hover: foreground

Badge (Soon):
- Padding: 8px 8px (px-2 py-1)
- Font size: 12px (text-xs)
- Background: muted
- Border radius: 9999px (rounded-full)
```

---

## 🎬 Animation Sequence

When ME drawer opens:

```
Frame 0ms:    Drawer at bottom (y: 100%)
              All buttons invisible (opacity: 0, y: 20px)

Frame 200ms:  Drawer slides up (spring animation)
              Drawer at final position (y: 0)

Frame 250ms:  My Profile appears
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 0ms

Frame 300ms:  My Articles appears  ✨
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 50ms

Frame 350ms:  My Organizations appears
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 100ms

Frame 400ms:  My Inventory appears
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 150ms

Frame 450ms:  Settings appears
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 200ms

Frame 500ms:  Log Out appears
              (opacity: 0 → 1, y: 20 → 0)
              Delay: 250ms

Frame 550ms:  All animations complete
              User can interact
```

**Stagger delay**: 50ms between each item
**Total animation time**: ~550ms
**Feel**: Smooth cascade effect, top-to-bottom reveal

---

## 🎯 Navigation Map

```
ME Button (Bottom Navbar)
   │
   ├─→ My Profile
   │     └─→ UserProfile component
   │          ├─ ProfileHeader
   │          ├─ ProfileStats
   │          └─ ProfileTabs
   │               ├─ Overview
   │               ├─ Inventory (Soon)
   │               ├─ Activity (Soon)
   │               └─ Settings
   │
   ├─→ My Articles  ✨ NEW
   │     └─→ Dashboard (currentView='dashboard')
   │          └─→ UserDashboard component
   │               ├─ Profile banner
   │               ├─ Level badge & XP
   │               ├─ Stats pills
   │               ├─ Article list
   │               │    ├─ Edit action
   │               │    ├─ Delete action
   │               │    └─ View action
   │               ├─ Achievements
   │               ├─ Password change
   │               └─ Newsletter prefs
   │
   ├─→ My Organizations
   │     └─→ (Not implemented)
   │
   ├─→ My Inventory
   │     └─→ (Disabled - Phase 1)
   │
   ├─→ Settings
   │     └─→ AccountSettings component
   │          ├─ Theme selector
   │          ├─ Nickname
   │          └─ Privacy settings
   │
   └─→ Log Out
         └─→ supabase.auth.signOut()
              └─→ Redirect to login
```

---

## 💡 Design Philosophy

### **Gradients Match Content**:
- **Profile** = Personal/Creative (Sky/Purple/Pink)
- **Articles** = Content/Writing (Blue/Indigo/Violet) ✨
- **Organizations** = Growth/Team (Emerald/Teal/Cyan)
- **Inventory** = Value/Trade (Amber/Orange/Red)
- **Settings** = Utility/Neutral (Slate/Gray/Zinc)
- **Log Out** = Warning (Red/Rose)

### **Hierarchy**:
1. **My Profile** - Most important (view yourself)
2. **My Articles** - Create & manage content ✨
3. **My Organizations** - Team features
4. **My Inventory** - Marketplace features
5. **Settings** - Configuration
6. **Log Out** - Exit (separated by divider)

### **Consistency**:
- All buttons same height
- All icons same size (24px)
- All gradients 3-color
- All have right arrow
- All use same spacing

---

## 🚀 Future Enhancements

### **Badge Counts**:
```
My Articles     →  [12]   ← Article count
My Inventory    →  [5]    ← Item count
Settings        →  [!]    ← Notification dot
```

### **Quick Actions**:
```
My Articles     →  [+]    ← Create new article button
My Inventory    →  [↑]    ← Upload item button
```

### **Sub-menus**:
```
My Articles     →
  ├─ Published (8)
  ├─ Drafts (4)
  └─ Analytics
```

---

## 🎉 Summary

The ME menu now provides quick access to:
- ✅ Profile overview
- ✅ **Article management** (NEW!)
- ✅ Future organization features
- ✅ Future inventory features
- ✅ App settings
- ✅ Logout function

**Beautiful gradient design, smooth animations, and intuitive navigation!** 🎨✨
