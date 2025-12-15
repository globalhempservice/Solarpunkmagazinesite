# 🔄 ProposeSWAPModal - Two-Tab System

## ✅ **COMPLETE!** Now supports two proposal types:

---

## 📦 **Tab 1: Trade an Item** (Item-to-Item)

**Visual:**
```
┌─────────────────────────────────────────┐
│ ✨ Make a SWAP                    [X]  │
│ Choose your offer type                 │
├─────────────────────────────────────────┤
│                                         │
│ ✨ What I Get                           │
│ ┌───────────────────────────────────┐   │
│ │ [Their Item Image]       LVL 7    │   │
│ │ Vintage Hemp Jacket               │   │
│ └───────────────────────────────────┘   │
│                                         │
│         ⬇️ [Swap Icon]                  │
│                                         │
│ 📦 What I Propose                       │
│ ┌───────────────────────────┐           │
│ │ [Trade Item] [Skills/Help]│ <- TABS  │
│ └───────────────────────────┘           │
│                                         │
│ [YOUR ITEM SELECTED OR SELECTOR BTN]    │
│                                         │
│ 💬 Personal Note (Optional)             │
│ ┌───────────────────────────────────┐   │
│ │ Add a friendly message...         │   │
│ └───────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel]        [✨ Send Proposal]      │
└─────────────────────────────────────────┘
```

**How it works:**
1. User clicks "Trade Item" tab (default)
2. Clicks "Select item from inventory" button
3. Modal opens showing all available items in grid
4. User selects one item → Shows in compact card
5. Optionally adds personal message
6. Hits "Send Proposal"

**API Call:**
```json
{
  "swap_item_id": "uuid-of-their-item",
  "proposal_type": "item",
  "proposer_item_id": "uuid-of-my-item",
  "message": "Hey! I love your jacket..."
}
```

---

## 🔧 **Tab 2: Skills/Help** (Service Offer)

**Visual:**
```
┌─────────────────────────────────────────┐
│ ✨ Make a SWAP                    [X]  │
│ Choose your offer type                 │
├─────────────────────────────────────────┤
│                                         │
│ ✨ What I Get                           │
│ ┌───────────────────────────────────┐   │
│ │ [Their Item Image]       LVL 7    │   │
│ │ Vintage Hemp Jacket               │   │
│ └───────────────────────────────────┘   │
│                                         │
│         ⬇️ [Swap Icon]                  │
│                                         │
│ 📦 What I Propose                       │
│ ┌───────────────────────────┐           │
│ │ [Trade Item] [Skills/Help]│ <- TABS  │
│ └───────────────────────────┘           │
│                                         │
│ ┌─ SERVICE FORM ──────────────────────┐ │
│ │ Service Title                       │ │
│ │ [Logo Design for Your Brand___]     │ │
│ │                                     │ │
│ │ Category (Optional)                 │ │
│ │ [🎨 Design ▼]                       │ │
│ │                                     │ │
│ │ What You'll Do                      │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ I'll create a professional logo │ │ │
│ │ │ with 3 revisions, delivered in  │ │ │
│ │ │ PNG/SVG. Timeline: 5 days.      │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ Be specific about deliverables 150/500│
│ └─────────────────────────────────────┘ │
│                                         │
│ 💬 Personal Note (Optional)             │
│ ┌───────────────────────────────────┐   │
│ │ I'm a graphic designer with...    │   │
│ └───────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ [Cancel]        [✨ Send Proposal]      │
└─────────────────────────────────────────┘
```

**How it works:**
1. User clicks "Skills/Help" tab
2. Tab content smoothly transitions (Motion animation)
3. Form appears with cyan/blue gradient theme
4. User fills in:
   - **Service Title** (required) - e.g., "Logo Design"
   - **Category** (optional) - dropdown with preset options
   - **What You'll Do** (required) - detailed description
5. Optionally adds personal message
6. Hits "Send Proposal"

**API Call:**
```json
{
  "swap_item_id": "uuid-of-their-item",
  "proposal_type": "service",
  "offer_title": "Logo Design for Your Brand",
  "offer_description": "I'll create a professional logo with 3 revisions...",
  "offer_category": "Design",
  "offer_condition": "One-time",
  "message": "I'm a graphic designer with..."
}
```

---

## 🎨 **Design Details**

### **Color Coding:**
- **Item Tab (Active):** Yellow → Orange gradient
- **Service Tab (Active):** Cyan → Blue gradient
- **Their Item Card:** Pink highlight
- **Your Item Card:** Yellow highlight
- **Service Form:** Cyan/blue theme

### **Animations:**
- Tab switch: Smooth fade + vertical slide (0.2s)
- Swap icon: Continuous 3D rotation
- Button shine effect on hover
- Scale animations on interactions

### **Validation:**
- **Item Tab:** Must select an item before sending
- **Service Tab:** Must fill title + description
- Character limits: Title (60), Description (500), Message (300)
- Real-time character counters

### **Categories for Services:**
```
🎨 Design
💻 Development
✍️ Writing
📢 Marketing
💡 Consulting
📸 Photography
🌐 Translation
🎓 Teaching
🔧 Other
```

---

## 🚀 **Usage Example**

```tsx
import { ProposeSwapModal } from './components/swap/ProposeSwapModal';

// In your component
const [showProposeModal, setShowProposeModal] = useState(false);

<ProposeSwapModal
  theirItem={selectedItem}
  userId={currentUser.id}
  accessToken={accessToken}
  onClose={() => setShowProposeModal(false)}
  onProposalSent={() => {
    setShowProposeModal(false);
    refetchData();
  }}
/>
```

---

## 📊 **Backend Integration**

The modal calls: `POST /swap/proposals`

**Backend handles:**
1. Validates proposal type
2. For `item`: Checks ownership of proposer_item_id
3. For `service`: Validates title + description
4. Creates conversation_id for messaging
5. Inserts into `swap_proposals` table
6. Updates `swap_likes` if user had liked the item
7. Tracks analytics event
8. Returns proposal ID + conversation_id

---

## ✨ **Key Features**

✅ **Two distinct paths:** Item trading vs Skills/Services  
✅ **Smooth tab transitions** with Motion animations  
✅ **Color-coded UI** for visual clarity  
✅ **Form validation** with helpful error messages  
✅ **Character counters** for input fields  
✅ **Optional personal message** for both types  
✅ **Responsive layout** that fits between navbars  
✅ **No scrolling needed** for either tab  
✅ **Ultra-compact design** with custom scrollbar  

---

## 🎯 **What's Next?**

Now that proposals can be sent, we need:

1. **SWAPDealsInbox** - View incoming/outgoing proposals
2. **Accept/Decline UI** - Item owners respond to proposals
3. **DealDetailModal** - Manage active swaps with logistics timeline

**Ready to build the inbox?** 🚀
