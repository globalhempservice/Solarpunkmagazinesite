# Hemp'in Button Design System
**Solarpunk Futuristic Gamified UI Components**

## 📋 Overview

This design system provides a comprehensive, production-ready button component library for the Hemp'in Universe navbar. Built on five core principles: **ORGANIC**, **DEPTH**, **LUMINOUS**, **RESPONSIVE**, and **CLEAR**.

---

## 🎨 Design Principles

### 1. ORGANIC 🌿
- Nature-inspired curves (squircle borders, organic shapes)
- Breathing animations (subtle scale pulsing on idle)
- Smooth, flowing transitions
- Gradient mesh backgrounds

### 2. DEPTH 📦
- Layered shadow system (ambient, interaction, active, intense)
- Inner shadows for engraved/embossed effects
- Multi-layer borders (outer glow + inner highlight)
- Z-depth hierarchy with elevation shadows

### 3. LUMINOUS ✨
- Dynamic glow effects responding to state
- Shimmer sweep animations
- Aurora flowing gradients
- Light source reflections (shine highlights)

### 4. RESPONSIVE ⚡
- Spring physics animations (bouncy, smooth, snappy)
- Magnetic hover (buttons pull toward cursor)
- Ripple effects on click
- Haptic feedback visual cues

### 5. CLEAR 🎯
- High contrast color palettes
- WCAG AA compliant
- Unified icon treatment (consistent stroke weights)
- Clear state differentiation

---

## 📦 Components Created

### Core Components

#### 1. **Design Tokens** (`/utils/buttonDesignTokens.ts`)
Central configuration for all button styling:
- Animation configs (spring, easing, durations)
- Glow & shadow system
- Border & radius system
- Icon styles
- Button size system
- Theme palettes (8 button types)
- Button state styles
- Special effects configs
- Accessibility standards
- Helper functions

#### 2. **HempButton** (`/components/ui/hemp-button.tsx`)
Base button component with all features:
- Magnetic hover effect
- Shimmer sweep animation
- Ripple effect on click
- Breathing idle animation
- Noise texture overlay
- Shine highlight
- Loading spinner
- Badge support
- Notification dot
- Focus ring (accessibility)

#### 3. **Navbar Buttons** (`/components/navbar/NavbarButtons.tsx`)
Specialized button components:
- `AdminButton` - Site/Market admin (red-orange / cyan-blue)
- `BackButton` - Navigation utility (emerald-teal)
- `LogoButton` - Brand/menu center button
- `WalletButton` - Currency/status (emerald-teal)
- `MessagesButton` - Communication (violet-purple)
- `HomeButton` - Primary navigation (emerald-teal)
- `MeButton` - Profile hub (sky-purple-pink)
- `ContextualPlusButton` - Dynamic action button (5 contexts)
- `StreakBadge` - Gamification element (orange-red)

#### 4. **Button Effects** (`/components/ui/button-effects.tsx`)
Micro-interaction components:
- `ParticleBurst` - Celebration/unlock effect
- `RippleEffect` - Click feedback
- `ShimmerSweep` - Idle state animation
- `AuroraGradient` - Flowing background
- `NoiseTexture` - Organic glass texture
- `GlowPulse` - Breathing glow
- `ShineHighlight` - Reflection effect
- `LoadingSpinner` - Loading state
- `MagneticCursor` - Cursor follower
- `Badge` - Count indicator
- `NotificationDot` - Alert indicator
- `FocusRing` - Accessibility indicator

#### 5. **Button Showcase** (`/components/dev/ButtonShowcase.tsx`)
Visual documentation and testing component

---

## 🎨 Button Hierarchy (8 Buttons)

### Top Navbar (4 buttons)

1. **Admin Buttons (Left)**
   - **Site Admin**: Red-orange gradient (#ef4444 → #fb923c)
   - **Market Admin**: Cyan-blue gradient (#06b6d4 → #3b82f6)
   - Crown icon indicator
   - Authority/warning aesthetic

2. **Back Button (Left)**
   - Emerald-teal gradient (#10b981 → #06b6d4)
   - Arrow icon with translation animation
   - Utility navigation

3. **Logo Button (Center)**
   - Glass style with hover glow
   - Brand identity
   - Menu/theme trigger

4. **Wallet + Messages (Right)**
   - **Wallet**: Emerald-teal (#10b981 → #0d9488)
   - **Messages**: Violet-purple (#8b5cf6 → #c084fc)
   - Badge/notification support

### Bottom Navbar (3 buttons)

5. **Home/Explore (Left)**
   - Emerald-teal gradient (#34d399 → #10b981)
   - Primary navigation
   - Size: XL (80x80px)

6. **ME/Profile (Center, Elevated)**
   - Multi-gradient (sky-purple-pink: #0ea5e9 → #a855f7 → #ec4899)
   - Largest button (96x96px)
   - Elevated -32px with dramatic shadow

7. **Contextual Plus (Right)**
   - **Article**: Emerald-teal-cyan (#34d399 → #06b6d4)
   - **Swap**: Amber-orange (#fbbf24 → #f97316)
   - **SWAG**: Purple-pink-rose (#c084fc → #f43f5e)
   - **Places**: Blue-cyan-teal (#60a5fa → #14b8a6)
   - **RFP**: Blue-indigo-violet (#3b82f6 → #8b5cf6)
   - Dynamic icon (morphing animation for swap)
   - Lock state with burst rays

8. **Streak Badge (Floating)**
   - Orange-red fire gradient
   - Flame icon + count
   - Appears in swipe mode

---

## 🎭 Button States

Each button supports 6 states with distinct visual feedback:

| State | Scale | Opacity | Glow | Shadow | Y-Offset |
|-------|-------|---------|------|--------|----------|
| **Idle** | 1.0 | 1.0 | 15% | 15% | 0 |
| **Hover** | 1.05 | 1.0 | 30% | 25% | -2px |
| **Active** | 1.0 | 1.0 | 50% | 40% | 0 |
| **Pressed** | 0.95 | 0.9 | 30% | 10% | +1px |
| **Disabled** | 1.0 | 0.4 | 0% | 5% | 0 |
| **Loading** | 1.0 | 0.7 | 15% | 15% | 0 |

---

## ✨ Special Effects

### Magnetic Hover
- Buttons subtly pull toward cursor (8px max)
- Spring physics with damping: 20
- Disabled when button is disabled

### Shimmer Sweep
- 3-second sweep across button
- 2-second delay between sweeps
- Linear gradient: transparent → white 20% → transparent

### Ripple Effect
- Triggers on click
- 0.6-second duration
- Scales from 0 to 2x
- Fades from 50% to 0%

### Breathing Animation
- Idle state only (disabled on hover/active)
- Scale: 1.0 → 1.02 → 1.0
- 4-second loop
- Ease-in-out

### Particle Burst
- 12 particles
- 60px spread
- 0.8-second duration
- Used for unlock/achievement moments

---

## 🎨 Color Palettes

### Theme Structure
Each theme includes:
```typescript
{
  gradient: { from, via, to },  // Button fill gradient
  glow: string,                 // Outer glow color (rgba)
  border: string,               // Border accent color
  text: string,                 // Icon/text color
  shadow: string,               // Drop shadow color
}
```

### 8 Button Themes
1. **Admin** - Red/Orange authority
2. **Market Admin** - Cyan/Blue professional
3. **Home** - Emerald/Teal primary
4. **ME** - Sky/Purple/Pink special
5. **Back** - Emerald/Teal utility
6. **Wallet** - Emerald/Teal status
7. **Messages** - Violet/Purple communication
8. **Locked** - Amber/Orange/Red warning

### 5 Plus Contexts
1. **Article** - Emerald/Teal/Cyan
2. **Swap** - Amber/Orange
3. **SWAG** - Purple/Pink/Rose
4. **Places** - Blue/Cyan/Teal
5. **RFP** - Blue/Indigo/Violet

---

## 🔧 Usage Examples

### Basic Usage
```tsx
import { HempButton } from '@/components/ui/hemp-button'
import { Heart } from 'lucide-react'

<HempButton
  icon={Heart}
  onClick={() => console.log('Liked')}
  theme="home"
  size="lg"
  enableMagnetic
  enableShimmer
  enableBreathing
/>
```

### Navbar Button
```tsx
import { HomeButton } from '@/components/navbar/NavbarButtons'

<HomeButton
  onClick={() => navigate('feed')}
  isActive={currentView === 'feed'}
/>
```

### Contextual Plus Button
```tsx
import { ContextualPlusButton } from '@/components/navbar/NavbarButtons'

<ContextualPlusButton
  onClick={() => createArticle()}
  context="article"
  isActive={currentView === 'editor'}
  isLocked={!isUnlocked}
  articlesNeeded={3}
/>
```

---

## 📐 Size System

| Size | Dimensions | Padding | Icon Size |
|------|------------|---------|-----------|
| **xs** | 32x32px | 8px | 12x12px |
| **sm** | 40x40px | 10px | 16x16px |
| **md** | 48x48px | 12px | 20x20px |
| **lg** | 64x64px | 16px | 24x24px |
| **xl** | 80x80px | 20px | 32x32px |
| **2xl** | 96x96px | 24px | 40x40px |

---

## ♿ Accessibility

### WCAG AA Compliance
- Minimum contrast ratio: 4.5:1 (normal text)
- Minimum contrast ratio: 3:1 (large text)
- Focus ring: 2px with 2px offset
- Minimum touch target: 44x44px (iOS/Android)

### Keyboard Support
- All buttons are keyboard navigable
- Focus ring visible on keyboard focus
- Aria-label support for screen readers
- Disabled state properly communicated

### Screen Reader Support
- All buttons have aria-label or label text
- State changes announced
- Badge counts announced
- Loading state communicated

---

## 🎬 Animation Performance

### Optimizations
- GPU-accelerated transforms (translateZ)
- Will-change hints for animated properties
- Reduced motion support (prefers-reduced-motion)
- Throttled mouse move events
- Cleanup on unmount

### Frame Rate Targets
- Idle animations: 60fps
- Interactions: 60fps
- Transitions: 60fps

---

## 🧪 Testing Component

View all buttons in action:
```tsx
import { ButtonShowcase } from '@/components/dev/ButtonShowcase'

// In your app
<ButtonShowcase />
```

Navigate to this component to see:
- All 8 navbar buttons
- All 5 contextual plus variants
- All button states (idle, hover, active, disabled, loading)
- Design principles visualization

---

## 🚀 Next Steps

### Recommended Enhancements
1. Add haptic feedback (Web Vibration API)
2. Implement theme-aware color shifting
3. Add sound effects on interactions
4. Create button group components
5. Add tooltip system
6. Implement long-press actions
7. Add gesture support (swipe, pinch)

### Integration Checklist
- [ ] Replace existing navbar buttons with new components
- [ ] Test on mobile devices
- [ ] Verify accessibility with screen readers
- [ ] Performance test on low-end devices
- [ ] A/B test with users
- [ ] Gather feedback and iterate

---

## 📚 File Structure

```
/utils/
  └── buttonDesignTokens.ts          # Design tokens & config

/components/
  ├── ui/
  │   ├── hemp-button.tsx            # Base button component
  │   └── button-effects.tsx         # Micro-interactions
  │
  ├── navbar/
  │   └── NavbarButtons.tsx          # Specialized navbar buttons
  │
  └── dev/
      └── ButtonShowcase.tsx         # Visual documentation
```

---

## 🎨 Design Philosophy

The Hemp'in button system embraces:
- **Gamification**: Visual rewards, progression feedback
- **Solarpunk**: Organic curves, nature-inspired animations
- **Futurism**: Advanced effects, cutting-edge interactions
- **Accessibility**: Inclusive design for all users
- **Performance**: Smooth 60fps animations

---

**Built with ❤️ for Hemp'in Universe (DEWII Magazine v1.1)**
