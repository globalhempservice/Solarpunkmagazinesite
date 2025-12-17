# Logo Theme & Plugin Store Link ✅

## Overview

This document explains:
1. Why the logo button shows a **Sun icon** (or other themes)
2. Where users can customize it (Plugin Store → Home Button Theme)
3. How to access the Plugin Store from the My Profile menu

---

## 1. Logo Button Theme System

### **What Controls the Logo Icon?**

The logo button in the top center navbar uses the **BrandLogo** component (`/components/BrandLogo.tsx`), which supports multiple theme options:

| Theme | Icon | Gradient | Description |
|-------|------|----------|-------------|
| `default` | Hemp Plant SVG | Emerald/Teal | Default Hemp'in brand icon |
| `solar` | ☀️ Sun | Amber/Orange | Solar/energy theme |
| `ocean` | 💧 Droplets | Blue/Cyan | Ocean/water theme |
| `forest` | 🌲 Trees | Emerald/Teal | Forest/nature theme |
| `sunset` | 🌅 Sunset SVG | Rose/Pink | Sunset/dusk theme |
| `aurora` | ✨ Sparkle | Purple/Indigo | Aurora/cosmic theme |

### **Where is the Theme Stored?**

The theme is stored in the **user's profile** in the database:

```typescript
// In user_progress or user_profiles table
interface UserProgress {
  homeButtonTheme?: string  // 'default' | 'solar' | 'ocean' | 'forest' | 'sunset' | 'aurora'
  // ... other fields
}
```

### **How is it Applied?**

1. User selects a theme in **Account Settings** → **Home Button Theme**
2. Theme is saved to database via API call
3. `userProgress.homeButtonTheme` is loaded on app start
4. Passed to BrandLogo component via props:

```tsx
// In AppNavigation.tsx
<BrandLogo 
  size="md" 
  theme={homeButtonTheme}  // From user's profile
/>
```

---

## 2. Home Button Theme Selection (Plugin Store)

### **Where Users Customize the Logo**

Users can change their logo theme in **Account Settings** under the **"Home Button Theme"** section:

**Path:** 
```
My Profile → Settings → Home Button Theme
```

### **Available Themes**

The AccountSettings component (`/components/AccountSettings.tsx`) displays all available themes:

```tsx
// In AccountSettings
const themes = [
  {
    id: 'default',
    name: 'Default (Hemp Plant)',
    icon: Leaf,
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600'
  },
  {
    id: 'solar',
    name: 'Solar Energy',
    icon: Sun,
    gradient: 'from-amber-400 via-orange-500 to-amber-600'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: Droplets,
    gradient: 'from-blue-400 via-cyan-500 to-blue-600'
  },
  {
    id: 'forest',
    name: 'Forest Grove',
    icon: Trees,
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    icon: SunsetIcon,
    gradient: 'from-rose-400 via-pink-500 to-rose-600'
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    icon: Sparkle,
    gradient: 'from-purple-400 via-indigo-500 to-purple-600'
  }
]
```

### **Gamification**

Selecting a theme earns the user **50 Hemp'in Points** (one-time reward):

```tsx
const themePoints = 50

// After selection:
toast.success(`🎨 Theme updated! +${themePoints} points earned!`)
```

---

## 3. Plugin Store Link in My Profile

### **New Menu Item Added**

A **"Plugin Store"** link has been added to the **MEButtonDrawer** (My Profile menu):

**Location:** My Profile → **Plugin Store** (6th item)

**Visual:**
- Icon: 🔌 `Plug` (from lucide-react)
- Gradient: `from-blue-500 via-indigo-500 to-violet-500`
- Positioned between "My Inventory" and "Settings"

### **What It Does**

When clicked, the Plugin Store link:

1. Opens the **Settings** page
2. Shows a toast notification:
   ```
   "Scroll down to 'Home Button Theme' to customize your logo!"
   ```
3. Guides the user to the theme customization section

### **Why It's Called "Plugin Store"**

The term "Plugin Store" is used as a **user-friendly metaphor** for customization options. In the future, this could expand to include:

- Additional logo themes (plugins)
- Logo animations
- Custom uploaded logos
- Theme packs
- Seasonal themes
- Premium unlocks

For now, it's a single-purpose link to the Home Button Theme selector.

---

## 4. Code Changes Summary

### **Files Modified**

#### **1. `/components/MEButtonDrawer.tsx`**

**Added:**
- Import: `Plug` icon from lucide-react
- Interface prop: `onPluginStoreClick?: () => void`
- New menu item:
  ```tsx
  {
    icon: Plug,
    label: 'Plugin Store',
    onClick: () => {
      onPluginStoreClick?.()
      onClose()
    },
    gradient: 'from-blue-500 via-indigo-500 to-violet-500'
  }
  ```

#### **2. `/App.tsx`**

**Added:**
- Handler for Plugin Store click:
  ```tsx
  onPluginStoreClick={() => {
    setCurrentView('settings')
    setMEDrawerOpen(false)
    setTimeout(() => {
      toast.info('Scroll down to "Home Button Theme" to customize your logo!')
    }, 500)
  }}
  ```

- Also added missing `onOrganizationsClick` handler

---

## 5. User Flow

### **Discovering the Plugin Store**

```
User clicks ME button (bottom right)
  ↓
MEButtonDrawer slides up
  ↓
User sees "Plugin Store" menu item
  ↓
User clicks "Plugin Store"
  ↓
Drawer closes
  ↓
Settings page opens
  ↓
Toast appears: "Scroll down to 'Home Button Theme'..."
  ↓
User scrolls to theme section
  ↓
User selects a new theme (e.g., "Solar Energy")
  ↓
Theme saved to database
  ↓
Logo icon changes to Sun ☀️
  ↓
User earns 50 points
  ↓
Success!
```

### **Why the Sun Icon Appears**

If you're seeing a **Sun icon** in the logo button, it means:

1. ✅ The user (or default profile) has `homeButtonTheme: 'solar'` set
2. ✅ This is coming from the database (user_progress table)
3. ✅ It's working as designed!

To change it:
- Go to: My Profile → Plugin Store → Home Button Theme
- Select "Default (Hemp Plant)" or any other theme

---

## 6. Future Enhancements

### **Planned Features**

1. **Dedicated Plugin Store Page**
   - Full-page modal or view
   - Categories: Themes, Animations, Effects, Badges
   - Preview mode for each option

2. **More Logo Themes**
   - Seasonal (winter snowflake, spring flower, etc.)
   - Brand partnerships
   - Community-created themes
   - Animated themes

3. **Custom Logo Upload**
   - Allow users to upload their own SVG/PNG
   - Moderation system
   - Premium feature (unlock with points)

4. **Logo Animations**
   - Pulse, rotate, bounce, glow
   - Triggered on events (new notification, points earned)
   - Customizable speed/intensity

5. **Theme Packs**
   - Bundle multiple themes
   - Unlock with achievements
   - Limited-edition releases

6. **Logo Effects Library**
   - Particle trails
   - Glow colors
   - Border styles
   - Hover behaviors

---

## 7. Database Schema

### **Current Structure**

The home button theme is stored in the user's profile:

```sql
-- In user_progress or user_profiles table
ALTER TABLE user_progress ADD COLUMN home_button_theme TEXT DEFAULT 'default';

-- Values: 'default' | 'solar' | 'ocean' | 'forest' | 'sunset' | 'aurora'
```

### **API Endpoint**

```typescript
// PUT /users/:userId/profile
{
  homeButtonTheme: 'solar'  // Changes logo to sun icon
}
```

---

## 8. Testing

### **How to Test Different Themes**

1. **Via UI:**
   - My Profile → Plugin Store
   - Select a theme
   - Observe logo change

2. **Via Database:**
   ```sql
   UPDATE user_progress 
   SET home_button_theme = 'solar' 
   WHERE user_id = 'your-user-id';
   ```

3. **Via API:**
   ```bash
   curl -X PUT https://your-project.supabase.co/functions/v1/make-server-053bcd80/users/USER_ID/profile \
     -H "Authorization: Bearer ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"homeButtonTheme": "solar"}'
   ```

### **Expected Results**

| Theme | Expected Logo | Color Scheme |
|-------|--------------|--------------|
| default | 🌿 Hemp plant | Green/Teal |
| solar | ☀️ Sun | Amber/Orange |
| ocean | 💧 Droplets | Blue/Cyan |
| forest | 🌲 Trees | Emerald/Teal |
| sunset | 🌅 Sunset | Rose/Pink |
| aurora | ✨ Sparkle | Purple/Indigo |

---

## 9. Troubleshooting

### **Logo Not Changing?**

1. Check user's profile in database:
   ```sql
   SELECT home_button_theme FROM user_progress WHERE user_id = 'xxx';
   ```

2. Verify API response:
   ```javascript
   console.log('homeButtonTheme:', userProgress?.homeButtonTheme)
   ```

3. Check BrandLogo props:
   ```tsx
   <BrandLogo theme={homeButtonTheme} />
   ```

4. Clear cache and reload

### **Theme Not Saving?**

1. Check browser console for errors
2. Verify access token is valid
3. Check server logs for PUT /users/:userId/profile
4. Ensure user has permission to update profile

---

## 10. Related Components

- **`/components/BrandLogo.tsx`** - Logo component with theme support
- **`/components/AccountSettings.tsx`** - Theme selection UI
- **`/components/MEButtonDrawer.tsx`** - Profile menu with Plugin Store link
- **`/components/AppNavigation.tsx`** - Navbar that renders the logo
- **`/App.tsx`** - Main app with user profile loading

---

## Summary

✅ **Logo theme** is controlled by `userProgress.homeButtonTheme` from the database  
✅ **Plugin Store link** added to My Profile menu  
✅ **Clicking Plugin Store** opens Settings with a helpful toast  
✅ **6 themes available:** default, solar, ocean, forest, sunset, aurora  
✅ **Gamified:** Earn 50 points for customizing your logo  
✅ **Future-ready:** Easy to add more themes, effects, and customization options  

The sun icon (☀️) in your screenshot means the user has selected the **"Solar Energy"** theme. To change it, go to: **My Profile → Plugin Store → Home Button Theme** and select a different option!
