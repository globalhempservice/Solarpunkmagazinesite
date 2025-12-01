# 🗺️ DEWII Complete User Flow Map

**Last Updated:** November 29, 2024  
**Purpose:** Quick reference for all navigation paths in DEWII

---

## 🎯 Main Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEWII MAGAZINE                            │
│                      (Main Feed View)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Click Globe Icon (Header)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMMUNITY MARKET HOMEPAGE                     │
│                   (3 Main Feature Cards)                         │
└─────────────────────────────────────────────────────────────────┘
         │                   │                    │
         │                   │                    │
    Visit Magazine      SWAG MARKET         Hemp Atlas
         │                   │                    │
         ▼                   ▼                    ▼
    ┌─────────┐      ┌──────────────┐      ┌──────────┐
    │Magazine │      │ Organization │      │ 3D Globe │
    │Articles │      │   Products   │      │ Browser  │
    └─────────┘      └──────────────┘      └──────────┘
```

---

## 🌍 Hemp Atlas (3D Globe) Flows

### Starting Point: Market Homepage → Click "Hemp Atlas" Card

```
┌─────────────────────────────────────────────────────────────────┐
│                   HEMP ATLAS - 3D GLOBE VIEW                     │
│                                                                   │
│  🌍 Interactive globe with company markers                       │
│  🎯 Click countries to see stats                                 │
│  📍 Click markers to zoom into cities                            │
│                                                                   │
│  [Bottom Buttons]                                                │
│  ┌───────────────────┐  ┌────────────────────┐                 │
│  │ Add Organization  │  │  Manage My Org     │                 │
│  └─────────┬─────────┘  └──────────┬─────────┘                 │
└───────────┼────────────────────────┼───────────────────────────┘
            │                        │
            │                        │
            ▼                        ▼
    ┌───────────────┐      ┌─────────────────────┐
    │      Add      │      │    ME PANEL         │
    │ Organization  │      │   (Organizations    │
    │     Form      │      │    Management)      │
    └───────┬───────┘      └─────────────────────┘
            │
      Close button
            │
            ▼
    Return to Globe
```

### Click on Company Marker

```
3D Globe → Click Company → Organization Profile Page
                              │
                              ├─ About Tab
                              ├─ SWAG Tab (if org has products)
                              └─ Close → Return to Globe
```

---

## 👤 ME Panel (Profile & Management)

### Starting Point: Market Homepage → Click "ME" Button (Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│                         ME PANEL                                 │
│                   (Full Screen Profile)                          │
│                                                                   │
│  Profile Info + Badge + NADA Balance                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │         Quick Actions Grid (2x2)                 │            │
│  │  ┌──────────────┐  ┌──────────────┐            │            │
│  │  │  Vote on     │  │   Submit     │            │            │
│  │  │   Ideas      │  │    Idea      │            │            │
│  │  └──────────────┘  └──────────────┘            │            │
│  │  ┌──────────────┐  ┌──────────────┐            │            │
│  │  │Organizations │  │     Shop     │            │            │
│  │  │              │  │   Products   │            │            │
│  │  └──────┬───────┘  └──────┬───────┘            │            │
│  └─────────┼──────────────────┼────────────────────┘            │
│            │                  │                                  │
│  ┌─────────▼────────┐  ┌──────▼──────────┐                     │
│  │    PLUGINS       │  │   Settings      │                     │
│  │  (Themes/Badges) │  │                 │                     │
│  └──────────────────┘  └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────────┐   ┌─────────────────────┐
│ CompanyManagerWrapper│   │  SwagMarketplace   │
│  (Manage Your Orgs) │   │ (Browse Products)   │
└─────────────────────┘   └─────────────────────┘
```

---

## 🛍️ Shopping Experiences

### Two Separate Swag Systems

```
┌──────────────────────────────────────────────────────────────┐
│                    SWAG ECOSYSTEM                             │
└──────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
      PLUGINS SHOP                  SWAG MARKET
    (Personal Items)            (Organization Products)
           │                              │
           ▼                              ▼
┌────────────────────┐          ┌─────────────────────┐
│  - Themes          │          │  - Physical Merch   │
│  - Badges          │          │  - Digital Products │
│  - Profile Banners │          │  - Services         │
│  - Priority Support│          │  - Courses          │
│                    │          │                     │
│  Buy with NADA pts │          │  External checkout  │
└────────────────────┘          └─────────────────────┘
```

### Access Points

**PLUGINS SHOP (Personal):**
- ME Panel → PLUGINS button
- Uses NADA points
- Instant digital delivery
- Themes, badges, banners, support

**SWAG MARKET (Organizations):**
- Market Homepage → "SWAG MARKET" card
- ME Panel → "Shop Products" button
- Organization Profile → "SWAG" tab (if they have products)
- External links to organization shops
- Supports badge-gating (member-only products)

---

## 🏢 Organization Management

### All Paths Lead to CompanyManagerWrapper

```
Entry Points:
  1. ME Panel → Organizations button
  2. Hemp Atlas → Manage My Org button (navigates to ME Panel)
  3. Direct from any view that opens ME Panel

                    ▼
          ┌─────────────────────┐
          │CompanyManagerWrapper│
          └─────────┬───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐ ┌─────────┐ ┌─────────┐
   │ Mobile │ │ Desktop │ │  Drill  │
   │ Manager│ │ Manager │ │  down   │
   └────────┘ └─────────┘ └─────────┘
```

### Organization Dashboard Tabs

```
CompanyManager:
  ├─ PROFILE Tab
  │   └─ Edit org info, logo, location
  ├─ SWAG Tab
  │   ├─ Create products
  │   ├─ Manage catalog
  │   ├─ Publish to marketplace
  │   └─ CSV bulk import
  ├─ MEMBERS Tab (Coming Soon)
  └─ BADGES Tab (Coming Soon)
```

---

## 🎮 Gamification System

### NADA Points Economy

```
Earn NADA:
  ├─ Read articles (first time)
  ├─ Daily login streak
  ├─ Submit ideas
  ├─ Vote on community ideas
  └─ Complete achievements

Spend NADA:
  └─ PLUGINS SHOP only
      ├─ Themes (500 NADA)
      ├─ Badges (1000-2000 NADA)
      ├─ Profile Banners (750 NADA)
      └─ Priority Support (5000 NADA)
```

---

## 📱 Bottom Navigation (Market Views Only)

```
┌──────────────────────────────────────────────────────────────┐
│                   Bottom Nav Bar                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │  Home  │  │  NADA  │  │  BUD   │  │   ME   │  │Settings││
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
└──────────────────────────────────────────────────────────────┘
      │            │           │           │           │
      ▼            ▼           ▼           ▼           ▼
   Market      NADA Wallet   BUD       Profile    Settings
  Homepage      Panel       Helper      Panel       Panel
```

---

## 🔄 State Management Overview

### Critical States in CommunityMarket.tsx

```tsx
State Variables:
  - showWorldMap: boolean           // Hemp Atlas 3D globe
  - showProfilePanel: boolean       // ME panel
  - showNadaWallet: boolean        // NADA wallet
  - showMarketSettings: boolean    // Settings
  - showManageOrganization: boolean // ✅ Properly managed now!
  - showAddOrganization: boolean   // Add org form
  - selectedCompanyId: string      // Org profile view
  - previousView: 'list'|'map'     // Return navigation
```

### Flow Rules (After Nov 29 Fix)

1. **Opening Hemp Atlas:**
   - Reset `showManageOrganization` = false
   - Reset `showAddOrganization` = false
   - Set `showWorldMap` = true

2. **"Manage My Org" from Atlas:**
   - Close atlas: `showWorldMap` = false
   - Reset state: `showManageOrganization` = false
   - Open ME panel: `showProfilePanel` = true
   - Result: Single management interface

3. **"Add Organization" from Atlas:**
   - Close atlas: `showWorldMap` = false
   - Reset state: `showManageOrganization` = false
   - Open form: `showAddOrganization` = true

---

## 🎯 User Journey Examples

### "I want to manage my organization"

```
1. Open DEWII → Feed view
2. Click Globe icon → Market Homepage
3. Either:
   a) Click ME button → Organizations → Manage
   b) Click Hemp Atlas → Manage My Org → Auto-opens ME Panel
4. CompanyManagerWrapper opens
5. Manage profile, products, etc.
```

### "I want to browse hemp companies"

```
1. Open DEWII → Feed view
2. Click Globe icon → Market Homepage
3. Click "Hemp Atlas" card
4. 3D Globe loads with company markers
5. Click country → See stats
6. Click company → View profile
7. Browse their SWAG tab (if available)
```

### "I want to buy organization products"

```
1. Open DEWII → Feed view
2. Click Globe icon → Market Homepage
3. Either:
   a) Click "SWAG MARKET" card
   b) Click ME → Shop Products
   c) Click company in Atlas → View profile → SWAG tab
4. Browse products
5. Click product → External shop link
6. Purchase on organization's website
```

### "I want to customize my profile"

```
1. Open DEWII → Feed view
2. Click Globe icon → Market Homepage
3. Click ME button
4. Click PLUGINS button
5. Browse themes/badges/banners
6. Purchase with NADA points
7. Equip immediately
```

---

## 🚀 Entry Points Summary

### How to Access Each Feature

| Feature | Access Point 1 | Access Point 2 | Access Point 3 |
|---------|---------------|----------------|----------------|
| **Hemp Atlas** | Market → Hemp Atlas card | - | - |
| **Organization Management** | ME Panel → Organizations | Hemp Atlas → Manage My Org | - |
| **Add Organization** | Hemp Atlas → Add Org | ME Panel → Organizations → Add | - |
| **PLUGINS Shop** | ME Panel → PLUGINS | - | - |
| **Swag Marketplace** | Market → SWAG MARKET card | ME Panel → Shop Products | Org Profile → SWAG tab |
| **NADA Wallet** | Bottom Nav → NADA | - | - |
| **Vote/Ideas** | ME Panel → Vote/Submit | - | - |
| **Settings** | Bottom Nav → Settings | ME Panel → Settings | - |

---

## 💡 Design Philosophy

### Clear Separation of Concerns

1. **Hemp Atlas = Discover & Browse**
   - View companies on 3D globe
   - Explore by geography
   - Read company profiles
   - Browse organization products

2. **ME Panel = Manage Your Stuff**
   - Manage your organizations
   - Customize your profile
   - Shop for personal items
   - Track your NADA/achievements

3. **Market Homepage = Central Hub**
   - Gateway to all features
   - Clear call-to-actions
   - BUD helper guidance
   - Quick navigation

### Single Source of Truth Principle

- **Organization Management:** CompanyManagerWrapper (accessed via ME Panel)
- **Profile Customization:** MarketProfilePanel (ME Panel)
- **Personal Shopping:** PluginsShop (from ME Panel)
- **Org Shopping:** SwagMarketplace (multiple entry points, same component)

---

## 📚 Related Documentation

- `/HEMP_ATLAS_UX_FIX_COMPLETE.md` - Recent navigation bug fix
- `/PENDING_ITEMS_ROADMAP.md` - Feature roadmap and priorities
- `/SWAG_MARKETPLACE_WIRED_COMPLETE.md` - Swag marketplace implementation
- `/DIGITAL_ITEMS_COMPLETE.md` - PLUGINS shop items
- `/ASSOCIATION_BADGE_ROADMAP.md` - Badge system details

---

**Last Updated:** November 29, 2024  
**Status:** ✅ All flows working and documented  
**Next Review:** After next major feature addition
