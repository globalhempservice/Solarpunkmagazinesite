# Message Notification System 🔴

## Overview

The message notification system uses a **glowing orb** indicator (no counter) to show when the user has unread messages. The orb features multi-layered animations with pulsing glows, breathing effects, and ping waves for maximum visibility and Hemp'in aesthetic appeal.

---

## Visual Design

### **Glowing Orb Structure**

The notification orb consists of 5 layers creating a cohesive 3D effect:

1. **Outer Glow (Pulsing)**
   - Radial gradient: `rgba(239, 68, 68, 0.8) → transparent`
   - Size: 5×5 (20px × 20px)
   - Animation: Scale 1 → 1.4 → 1, Opacity 0.6 → 0.9 → 0.6
   - Duration: 2s loop
   - Purpose: Draws attention from a distance

2. **Mid Glow (Breathing)**
   - Radial gradient: `rgba(248, 113, 113, 0.9) → transparent`
   - Size: 4×4 (16px × 16px)
   - Animation: Scale 1 → 1.2 → 1, Opacity 0.7 → 1 → 0.7
   - Duration: 1.5s loop
   - Purpose: Creates depth and breathing effect

3. **Orb Core**
   - Size: 3×3 (12px × 12px)
   - Gradient fill: `#fca5a5 → #ef4444 → #dc2626` (135deg)
   - Purpose: The solid notification indicator

4. **Shine Highlight**
   - Size: 1.5×1.5 (6px × 6px)
   - Position: Top-left with 20% offset
   - Radial gradient: `white 90% → transparent`
   - Purpose: Creates glossy, 3D orb effect

5. **Ping Effect**
   - Border: 2px solid `#ef4444`
   - Animation: Scale 1 → 2, Opacity 0.6 → 0
   - Duration: 1.5s loop
   - Purpose: Ripple effect for attention

### **Color Palette**

All colors follow Hemp'in's red notification scheme:
- Primary: `#ef4444` (red-500)
- Light: `#fca5a5` (red-300)
- Dark: `#dc2626` (red-600)
- Glow: `#f87171` (red-400)

---

## Implementation

### **1. HempButton Component** (`/components/ui/hemp-button.tsx`)

The notification orb is built into the HempButton component via the `showNotification` prop:

```tsx
interface HempButtonProps {
  // ... other props
  showNotification?: boolean  // Shows glowing orb when true
}
```

**Rendering Logic:**
```tsx
{showNotification && (
  <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 z-20">
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
      {/* Outer glow - pulsing */}
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.9, 0.6] }} />
      
      {/* Mid glow - breathing */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} />
      
      {/* Orb core with gradient */}
      <div style={{ background: 'linear-gradient(...)' }}>
        {/* Shine highlight */}
        {/* Border ring */}
        {/* Ping effect */}
      </div>
    </motion.div>
  </div>
)}
```

### **2. MessagesButton Component** (`/components/navbar/NavbarButtons.tsx`)

Wraps HempButton with message-specific props:

```tsx
interface MessagesButtonProps {
  onClick: () => void
  hasUnread?: boolean      // Controls notification visibility
  unreadCount?: number     // NOT USED (for future badge feature)
}

export function MessagesButton({ onClick, hasUnread }: MessagesButtonProps) {
  return (
    <HempButton
      icon={MessageCircle}
      onClick={onClick}
      theme="messages"
      size="md"
      enableBreathing={hasUnread ? true : false}  // Button breathes when unread
      showNotification={hasUnread}                // Shows glowing orb
    />
  )
}
```

**Key Features:**
- Button itself breathes when `hasUnread = true`
- Glowing orb appears in top-right corner
- No counter shown (pure visual indicator)

### **3. AppNavigation Component** (`/components/AppNavigation.tsx`)

Manages unread message state and passes to MessagesButton:

```tsx
// State management
const [hasUnreadMessages, setHasUnreadMessages] = useState(true)

// Clear notification when messenger is opened
useEffect(() => {
  if (isMessengerOpen) {
    setHasUnreadMessages(false)
  }
}, [isMessengerOpen])

// Render
<MessagesButton
  onClick={() => setIsMessengerOpen(true)}
  hasUnread={hasUnreadMessages}
/>
```

---

## User Flow

### **Scenario: User Receives New Message**

1. **Backend sends new message** (future implementation)
   - WebSocket/polling detects new message
   - `setHasUnreadMessages(true)` is called

2. **UI Updates Immediately**
   - MessagesButton starts breathing animation
   - Glowing red orb appears with spring animation
   - Outer glow pulses (2s cycle)
   - Mid glow breathes (1.5s cycle)
   - Ping effect ripples (1.5s cycle)

3. **User Notices & Clicks**
   - MessagesButton remains responsive
   - All animations continue smoothly

4. **Messenger Opens**
   - `setIsMessengerOpen(true)` triggers
   - `useEffect` automatically calls `setHasUnreadMessages(false)`
   - Glowing orb animates out (scale to 0)
   - Button stops breathing
   - User sees messages

5. **Notification Cleared**
   - Even if user closes messenger without reading, orb stays hidden
   - New messages would trigger notification again

---

## Technical Details

### **Animation Specifications**

| Layer | Animation | Duration | Easing | Repeat |
|-------|-----------|----------|--------|---------|
| Outer Glow | Scale + Opacity | 2s | easeInOut | ∞ |
| Mid Glow | Scale + Opacity | 1.5s | easeInOut | ∞ |
| Orb Core | (Static) | - | - | - |
| Shine | (Static) | - | - | - |
| Ping | Scale + Opacity | 1.5s | easeOut | ∞ |
| Mount | Scale 0 → 1 | 0.5s | spring | Once |

**Spring Config (Mount):**
- Stiffness: 300
- Damping: 15
- Creates bouncy entrance

### **Positioning**

The orb is positioned relative to the button:
```css
position: absolute;
top: 0;
right: 0;
transform: translate(25%, -25%);  /* Overlaps button edge */
z-index: 20;  /* Above button content */
```

### **Performance**

- **GPU Acceleration**: All animations use `transform` and `opacity`
- **Layer Promotion**: Fixed position elements create composite layers
- **Blur Optimization**: Radial gradients used instead of heavy blur filters
- **Efficient Loops**: Infinite loops use `repeat: Infinity` (no JS timers)

**Estimated GPU Load:**
- Idle (no notification): 0%
- Active notification: ~5% (3 concurrent animations)

---

## Future Backend Integration

### **TODO: Replace Mock State**

Current implementation uses a mock state for demonstration:

```tsx
// CURRENT (Mock)
const [hasUnreadMessages, setHasUnreadMessages] = useState(true)

// FUTURE (Real Backend)
const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
const [unreadCount, setUnreadCount] = useState(0)

useEffect(() => {
  if (!userId || !accessToken) return
  
  // Option 1: WebSocket subscription
  const ws = new WebSocket(`wss://${projectId}.supabase.co/realtime/v1`)
  ws.on('message', (data) => {
    if (data.type === 'new_message') {
      setHasUnreadMessages(true)
      setUnreadCount(prev => prev + 1)
    }
  })
  
  // Option 2: Polling
  const interval = setInterval(async () => {
    const response = await fetch(`${serverUrl}/messages/unread-count`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const { count } = await response.json()
    setHasUnreadMessages(count > 0)
    setUnreadCount(count)
  }, 30000) // Poll every 30s
  
  return () => {
    ws?.close()
    clearInterval(interval)
  }
}, [userId, accessToken])
```

### **Backend Endpoints Needed**

1. **GET `/messages/unread-count`**
   - Returns: `{ count: number }`
   - Used for polling/initial load

2. **WebSocket Channel: `user:${userId}:messages`**
   - Events: `new_message`, `message_read`
   - Used for real-time updates

3. **POST `/messages/mark-all-read`**
   - Called when messenger opens
   - Clears server-side unread count

---

## Testing Checklist

- [x] Glowing orb appears when `hasUnread = true`
- [x] Orb has 3 animated layers (outer pulse, mid breathe, ping)
- [x] Orb has glossy 3D appearance (gradient + highlight)
- [x] Orb animates in with spring bounce
- [x] Button breathes when notification is active
- [x] Clicking MessagesButton opens messenger
- [x] Notification clears when messenger opens
- [x] Notification stays cleared even if messenger closes
- [x] No counter shown (pure visual indicator)
- [x] Animations are smooth and performant
- [x] Colors match Hemp'in red theme

---

## Design Philosophy

### **Why No Counter?**

1. **Reduces Anxiety**: No numerical pressure to read messages
2. **Cleaner Aesthetic**: Orb is more elegant than badge
3. **Clear Binary State**: Either you have messages or you don't
4. **Focus on Presence**: Notification draws attention without specifics

### **Why Glowing Orb?**

1. **Solarpunk Futuristic**: Matches Hemp'in's comic aesthetic
2. **Attention-Grabbing**: Multi-layer glow is hard to miss
3. **Organic Feel**: Breathing/pulsing feels alive
4. **3D Depth**: Gradient + highlight creates tactile quality
5. **Animation Language**: Consistent with button system

---

## Related Documentation

- **Button System**: `/docs/BUTTON_SYSTEM_OVERVIEW.md`
- **Navbar Fixes**: `/docs/NAVBAR_FIXES_FINAL.md`
- **Design Tokens**: `/utils/buttonDesignTokens.tsx`
- **Hemp Button**: `/components/ui/hemp-button.tsx`
- **Navbar Buttons**: `/components/navbar/NavbarButtons.tsx`

---

**Status: COMPLETE & READY FOR BACKEND INTEGRATION ✅**

The notification system is fully designed, implemented, and tested with mock data. Ready to connect to real message tracking when backend endpoints are available.
