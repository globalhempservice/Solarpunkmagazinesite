# DEWII (Hemp'in Universe) - Design System Documentation

## Overview
This document defines the visual hierarchy, color systems, and UX principles for the DEWII platform, ensuring consistency across the three-rail marketplace operating system (C2C SWAP, B2C/B2B SWAG, B2B RFP).

---

## Design Hierarchy & Z-Index System

### Layer Architecture (Bottom to Top)

```
┌─────────────────────────────────────────────────────────┐
│ Layer 3: MODAL LAYER (z-index: 10000+)                 │
│ - BUD Helper Modals                                     │
│ - Messenger Modals                                      │
│ - Place Detail Modals                                   │
│ - Add Place Modals                                      │
│ OVERLAYS EVERYTHING INCLUDING NAVBARS                   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 2: MINI APP LAYER (z-index: 9990)                │
│ - MAG, SWIPE, PLACES, SWAP, FORUM, GLOBE, SWAG, HUNT   │
│ - Each app has its own color theme                      │
│ - Full-screen experience between navbars                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 1: APP SHELL (z-index: 50)                       │
│ - Top Navigation Bar (80px height)                      │
│ - Bottom Navigation Bar (80px height)                   │
│ - Always visible in content area                        │
│ - Hemp'in branding and global navigation                │
└─────────────────────────────────────────────────────────┘
```

### Z-Index Reference Table

| Layer | Component | Z-Index | Behavior |
|-------|-----------|---------|----------|
| App Shell | Top Navbar | 50 | Always visible in content |
| App Shell | Bottom Navbar | 50 | Always visible in content |
| Mini Apps | MiniAppContainer | 9990 | Full-screen, lives between navbars |
| Mini Apps | Loading Screen | 9999 | Temporarily covers app during load |
| Modals | Backdrop | 10000 | Covers everything including navbars |
| Modals | Content | 10001 | Above backdrop |
| BUD Modal | Backdrop | 80 | Only covers content (OLD - needs update) |
| BUD Modal | Content | 90 | Above backdrop (OLD - needs update) |

---

## Color System

### Hemp'in Canonical Colors (Global Theme)

```css
/* Primary Hemp'in Theme */
--background: #041F1A;           /* WETAS Carbon Mint - Deep green */
--foreground: #6EE7B7;           /* Mint green text */
--primary: #F59E0B;              /* Gold accents */
--secondary: #0F766E;            /* Teal */
--accent: #0E7490;               /* Deep cyan */
```

### Mini App Color Schemes

#### PLACES App - Emerald/Teal Gradient
```css
/* Background */
bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950

/* Accent Colors */
- Primary: Emerald (#10b981, #059669)
- Secondary: Teal (#14b8a6, #0d9488)
- Highlights: Cyan (#06b6d4, #0891b2)

/* Category-Specific Colors */
- Agriculture: from-green-500 to-emerald-600
- Processing: from-blue-500 to-cyan-600
- Storage: from-orange-500 to-amber-600
- Retail: from-pink-500 to-rose-600
- Medical: from-purple-500 to-indigo-600
- Other: from-slate-500 to-slate-600
```

#### BUD Character - Pink/Rose Theme
```css
/* BUD Character Colors */
- Face: from-pink-300 via-rose-300 to-pink-400
- Petals: from-pink-400 via-rose-400 to-pink-500
- Leaves: from-green-400 to-emerald-500
- Glow: from-green-400 via-emerald-400 to-green-400

/* BUD Modal Colors */
- Background: from-pink-50 via-rose-50 to-pink-100 (light)
            dark:from-pink-950/90 dark:via-rose-950/90 dark:to-pink-900/90
- Border: border-pink-300/70 dark:border-pink-600/50
- Button: from-pink-500 via-rose-500 to-pink-500
- Speech Bubble: Pink/Rose gradients with transparency
```

#### BUD Speech Bubble - Comic Style

**Comic Speech Bubble Design:**
```tsx
<div className="relative bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10
                dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-900/20
                backdrop-blur-xl border-3 border-pink-400/50 rounded-3xl p-5
                shadow-2xl shadow-pink-500/20">
  {/* Comic-style tail pointing to BUD */}
  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
    <div className="w-0 h-0 border-l-[14px] border-l-transparent 
                    border-r-[14px] border-r-transparent 
                    border-b-[16px] border-b-pink-400/50" />
  </div>
  
  {/* Sparkle decorations */}
  <motion.div
    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
    transition={{ duration: 3, repeat: Infinity }}
    className="absolute -top-2 -right-2 text-yellow-400"
  >
    ✨
  </motion.div>
  
  <p className="text-white text-center leading-relaxed font-bold text-lg tracking-wide">
    {message}
  </p>
</div>
```

**Interactive Speech Bubble Pattern:**
The speech bubble changes dynamically based on user hover over choice buttons:

```tsx
// State
const [hoveredButton, setHoveredButton] = useState<'option1' | 'option2' | null>(null)

// Dynamic message
const displayMessage = hoveredButton === 'option1'
  ? "Context-specific message for option 1"
  : hoveredButton === 'option2'
  ? "Context-specific message for option 2"
  : "Default welcome message"

// Speech bubble with key animation
<motion.div
  key={displayMessage}  // Re-animate on message change!
  initial={{ opacity: 0, y: -10, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ type: "spring", damping: 20, stiffness: 300 }}
>
  <div className="...speech-bubble-styles...">
    <p>{displayMessage}</p>
  </div>
</motion.div>

// Buttons with hover handlers
<button
  onHoverStart={() => setHoveredButton('option1')}
  onHoverEnd={() => setHoveredButton(null)}
  ...
>
  Option 1
</button>
```

**Why This Pattern Works:**
- ✅ BUD feels alive and responsive
- ✅ Gives immediate feedback before clicking
- ✅ Builds user confidence in their choice
- ✅ Creates delightful micro-interaction
- ✅ Speech bubble becomes part of the conversation

### Close Button Standards

**Mini App Navigation Header (All Screens Except Welcome):**

```tsx
{/* Navigation Header - Back & Close Buttons */}
<div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
  {/* Back Button - Top Left */}
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.1, x: -5 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => navigateToPreviousScreen()}
    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80 
               hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm
               shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all 
               flex items-center justify-center"
    title="Back"
  >
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  </motion.button>

  {/* Close Button - Top Right */}
  <motion.button
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.1, rotate: 90 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClose}
    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600/80 to-teal-600/80
               hover:from-emerald-500 hover:to-teal-500 border-2 border-emerald-400/40 backdrop-blur-sm
               shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transition-all 
               flex items-center justify-center"
    title="Close Places"
  >
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </motion.button>
</div>
```

**Design Rules:**
- **Back Button**: Top-left absolute position (top-6 left-6)
  - Chevron left arrow icon
  - Navigates to previous screen WITHIN the mini-app
  - Hover animation: slides 5px left
  - Present on all screens EXCEPT welcome screen
  
- **Close Button**: Top-right absolute position (top-6 right-6)
  - X icon
  - Closes mini-app entirely, returns to DEWII homepage
  - Hover animation: rotates 90°
  - Present on ALL screens including welcome

- **Size**: Both 40x40px (w-10 h-10)
- **Shape**: Rounded circle (rounded-full)
- **Color**: Matches mini-app theme (emerald/teal for Places)
- **Spacing**: 6 units from edge (24px)
- **z-index**: 50 (above content, below modals)

### BUD Expression Usage Guide

| Screen/Context | Expression | Mood | Rationale |
|----------------|-----------|------|-----------|
| Welcome Screen | `happy` | `default` | Friendly greeting |
| Category Selection | `thinking` | `default` | Helping user decide |
| Country Selection | `thinking` | `default` | Thoughtful guidance |
| Name Search | `thinking` | `default` | Searching mode |
| Results Screen | `excited` | `success` | Celebrating found places |
| Success Action | `celebrating` | `success` | Achievement moment |
| Tips/Info | `winking` | `info` | Friendly advice |

### BUD Modal Standards

```tsx
<BudModal
  isOpen={boolean}
  onClose={() => void}
  title="BUD's message title"
  subtitle="Optional subtitle"
  budExpression="happy"
  budMood="default"
  footerButton={{
    text: 'Got it, BUD!',
    onClick: handleAction
  }}
>
  {/* Content */}
</BudModal>
```

**Modal Behavior:**
- MUST use z-index 10000+ to overlay navbars
- Backdrop dims entire screen (including navbars)
- Speech bubble tail points to BUD character
- Pink/rose theme with sparkles animation
- Floating icons (Heart, Sparkles, Star) in background

---

## Places App Design Standards

### Screen Flow & Navigation

```
Welcome Screen (BUD asks initial question)
    ↓
Choice: Specific Search OR Nearby Search
    ↓                           ↓
Category Selection      Location Permission
    ↓                           ↓
Country Selection       Distance-Sorted Results
    ↓
Name Search (Optional)
    ↓
Results Screen
```

### Screen-by-Screen Design

#### 1. Welcome Screen
```tsx
<div className="flex-1 flex flex-col items-center justify-center">
  {/* BUD Character - XL size */}
  <BudCharacter size="xl" expression="happy" mood="default" />
  
  {/* Speech Bubble Below BUD */}
  <div className="mt-6 max-w-sm">
    <div className="bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10
                    backdrop-blur-xl border-2 border-pink-400/40 rounded-3xl p-5">
      <p className="text-white text-center">{budMessage}</p>
    </div>
  </div>
  
  {/* Large Touch-Friendly Choice Buttons */}
  <div className="w-full max-w-md space-y-4">
    {/* Specific Search Button - Cyan/Teal gradient */}
    {/* Nearby Search Button - Emerald/Green gradient */}
  </div>
</div>
```

**Design Rules:**
- NO scrolling on choice screens
- BUD character centered with speech bubble
- Large, colorful gradient buttons (min height: 64px)
- Icons + text + chevron for clear CTAs
- Smooth screen transitions with Motion

#### 2. Category/Country/Name Screens
```tsx
{/* Compact BUD Header */}
<div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10
                backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4">
  <BudCharacter size="md" expression="thinking" mood="default" />
  <p className="text-white">{budMessage}</p>
</div>

{/* Scrollable Grid of Options */}
<div className="flex-1 overflow-y-auto">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Option cards with hover effects */}
  </div>
</div>
```

**Design Rules:**
- BUD in compact header (not full screen)
- Scrollable content area below
- Grid layout for options (1 col mobile, 2 cols desktop)
- Hover effects and active states
- Back button always visible

#### 3. Results Screen
```tsx
{/* BUD Header with Results Count */}
<div className="flex-shrink-0 p-4 bg-gradient-to-r from-pink-100/10
                border-b-2 border-pink-400/30">
  <div className="flex items-center gap-3">
    <BudCharacter size="sm" expression="excited" mood="success" />
    <div>
      <p className="text-white text-sm">{budMessage}</p>
      <p className="text-emerald-300 text-xs">{filteredPlaces.length} places found</p>
    </div>
  </div>
</div>

{/* Scrollable Results List */}
<div className="flex-1 overflow-y-auto">
  {/* Place cards */}
</div>
```

**Design Rules:**
- BUD celebrates in compact header
- Results count visible
- Infinite scroll list below
- Place cards with category badges
- Tap card to open detail modal

### Button Styles

```tsx
// Primary Action (Continue/Submit)
className="bg-gradient-to-r from-cyan-600 to-teal-600 
           hover:from-cyan-500 hover:to-teal-500
           text-white shadow-xl hover:shadow-2xl
           hover:shadow-cyan-500/40 transition-all
           border-2 border-cyan-400/30"

// Secondary Action (Nearby/Alternative)
className="bg-gradient-to-r from-emerald-600 to-green-600
           hover:from-emerald-500 hover:to-green-500
           text-white shadow-xl hover:shadow-2xl
           hover:shadow-emerald-500/40 transition-all
           border-2 border-emerald-400/30"

// Back Button
className="border-2 border-emerald-400/40 text-emerald-300
           hover:bg-emerald-500/10 transition-all"
```

### Place Card Design

```tsx
<div className="bg-slate-800/40 backdrop-blur-sm border-2 
                border-emerald-400/30 rounded-xl p-4
                hover:border-emerald-400/60 hover:shadow-lg
                hover:shadow-emerald-500/20 transition-all
                cursor-pointer">
  {/* Header with category badge */}
  {/* Place name and description */}
  {/* Location and company info */}
  {/* Footer with actions */}
</div>
```

---

## Modal Design Standards

### Place Detail Modal

```tsx
// Overlays navbars - z-index 10000+
<motion.div className="fixed inset-0 bg-black z-[10000]" onClick={onClose} />
<motion.div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
  <div className="w-full max-w-2xl max-h-[90vh]
                  bg-gradient-to-br from-slate-900/95 to-slate-950/95
                  backdrop-blur-xl border border-cyan-500/30 rounded-2xl
                  overflow-hidden shadow-2xl shadow-cyan-500/20">
    {/* Modal content */}
  </div>
</motion.div>
```

### Add Place Modal

```tsx
// Same overlay structure as Place Detail
// Purple/Violet theme for creation actions
border border-purple-500/30
shadow-2xl shadow-purple-500/20
```

---

## Game-Like UX Principles

### 1. Screen-by-Screen Navigation
- NO infinite scrolling on decision screens
- Each screen has a clear purpose
- BUD guides user through each step
- Smooth transitions between screens

### 2. Conversational Flow
- BUD asks questions
- User makes choices
- BUD responds with encouragement
- Results celebrated together

### 3. Visual Feedback
- Hover effects on all interactive elements
- Active states for selected options
- Loading states with progress indicators
- Success animations with BUD celebrating

### 4. Mobile-First Design
- Large touch targets (min 44x44px)
- Thumb-friendly button placement
- Bottom sheet modals for mobile
- Swipe gestures where appropriate

### 5. Accessibility
- High contrast text on backgrounds
- Clear visual hierarchy
- Focus states for keyboard navigation
- Screen reader friendly labels

---

## Animation Standards

### Page Transitions

```tsx
// Screen enter
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}

// Screen slide
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
```

### BUD Animations

```tsx
// Floating animation
animate={{ y: [0, -8, 0] }}
transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}

// Blinking eyes
animate={{ scaleY: [1, 0.2, 1] }}
transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}

// Sparkle rotation
animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
```

### Button Hover Effects

```tsx
// Scale on hover
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
```

---

## Implementation Checklist

### For Each Mini App:

- [ ] Apply app-specific color gradient background
- [ ] Integrate BUD character with appropriate expressions
- [ ] Implement screen-by-screen navigation (no scrolling on choice screens)
- [ ] Add speech bubbles with proper theme colors
- [ ] Use large, touch-friendly buttons
- [ ] Add smooth page transitions
- [ ] Implement proper modal z-index (10000+)
- [ ] Test on mobile and desktop
- [ ] Ensure BUD messages are contextual and friendly
- [ ] Add loading states with BUD animations

### For BUD Interactions:

- [ ] Choose appropriate expression for context
- [ ] Choose appropriate mood for visual feedback
- [ ] Write friendly, conversational messages
- [ ] Use speech bubbles (not full modals) for quick tips
- [ ] Use full BUD modals for important information
- [ ] Add celebration animations for user achievements
- [ ] Ensure modals overlay navbars properly
- [ ] Test backdrop click to close functionality

---

## Code Examples

### Places App Structure

```tsx
export function PlacesApp({ onClose, ...props }: MiniAppProps) {
  return (
    <MiniAppContainer metadata={metadata} onClose={onClose} loadData={loadPlaces}>
      {/* Emerald/Teal Gradient Background */}
      <div className="h-full flex flex-col bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950">
        {renderScreen()}
        
        {/* Modals - z-index 10000+ */}
        <PlaceDetailModal {...modalProps} />
        <AddPlaceModal {...addProps} />
      </div>
    </MiniAppContainer>
  )
}
```

### BUD in Welcome Screen

```tsx
<div className="flex-1 flex flex-col items-center justify-center p-6">
  <BudCharacter size="xl" expression="happy" mood="default" animate={true} />
  
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mt-6 max-w-sm"
  >
    <div className="relative bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10
                    dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-900/20
                    backdrop-blur-xl border-2 border-pink-400/40 rounded-3xl p-5 shadow-2xl">
      {/* Speech bubble tail */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2
                      w-0 h-0 border-l-[12px] border-l-transparent
                      border-r-[12px] border-r-transparent
                      border-b-[14px] border-b-pink-400/40" />
      
      <p className="text-white text-center leading-relaxed font-medium">
        Hey there! 🌿 Ready to explore the hemp universe? Let's find some amazing places together!
      </p>
    </div>
  </motion.div>
  
  {/* Choice buttons... */}
</div>
```

### BUD in Compact Header

```tsx
<div className="mb-6">
  <div className="flex items-center gap-4 bg-gradient-to-br from-pink-100/10 via-rose-100/10 to-pink-100/10
                  dark:from-pink-900/20 dark:via-rose-900/20 dark:to-pink-900/20
                  backdrop-blur-xl border-2 border-pink-400/40 rounded-2xl p-4 shadow-xl">
    <BudCharacter size="md" expression="thinking" mood="default" animate={true} className="flex-shrink-0" />
    <p className="text-white font-medium">What type of place are you looking for?</p>
  </div>
</div>
```

---

## Future Considerations

### Expanding to Other Mini Apps

Each of the 8 mini-apps should follow this pattern:

1. **MAG** - Magazine/Purple theme (from-purple-900 via-violet-800 to-purple-950)
2. **SWIPE** - Dating/Pink theme (from-pink-900 via-rose-800 to-pink-950)
3. **PLACES** - Emerald/Teal theme ✅ IMPLEMENTED
4. **SWAP** - Trading/Orange theme (from-orange-900 via-amber-800 to-orange-950)
5. **FORUM** - Discussion/Blue theme (from-blue-900 via-cyan-800 to-blue-950)
6. **GLOBE** - Global/Green theme (from-green-900 via-emerald-800 to-green-950)
7. **SWAG** - Shopping/Red theme (from-red-900 via-rose-800 to-red-950)
8. **HUNT** - Job/Yellow theme (from-yellow-900 via-amber-800 to-yellow-950)

### BUD Personality Evolution

As the platform grows, BUD should:
- Learn from user interactions
- Adapt messages to user preferences
- Celebrate milestones with special animations
- Provide contextual tips based on user behavior
- Build rapport through consistent personality

---

## Version History

- **v1.0** (2025-12-19) - Initial design system documentation
  - Established 3-layer hierarchy
  - Defined Places app emerald/teal theme
  - Documented BUD character standards
  - Created modal overlay system

---

## Notes

- **NO EMOJIS in code** - Use custom SVG icons only (except in BUD messages where emojis add personality)
- **Country flags as styled pills** - Not emoji flags
- **Solarpunk futuristic comic aesthetic** - Bold gradients, high contrast, playful animations
- **Mobile-first** - Always design for touch and thumb reach zones
- **BUD is the companion** - Every interaction should feel guided and friendly
- **NO EMOJIS in BUD speech bubbles** - Keep text clean and icon-based
- **Each mini-app manages its own close button** - No universal "Back to Home" button in MiniAppContainer

---

**Last Updated:** December 19, 2025  
**Maintained By:** DEWII Design Team  
**Status:** Living Document - Update as design evolves