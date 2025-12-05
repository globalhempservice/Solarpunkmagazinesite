# 🗺️ Organization-Place Relationships System

## ✅ Implementation Complete!

This system allows organizations to claim relationships with physical places (farms, shops, factories, etc.), creating a rich network graph of the hemp industry supply chain.

---

## 📋 What Was Built

### 1. Database Schema ✅
**File:** `/sql_migrations/organization_place_relationships.sql`

- **New Table:** `organization_place_relationships`
- **Relationship Types:**
  - `owns` - Organization owns this place
  - `distributed_at` - Products distributed here
  - `supplies_from` - Organization sources supplies from here
  - `manufactures_at` - Manufacturing facility
  - `partner` - Business partner
  - `customer` - Customer location
  - `supplier` - Supplier location
  - `retail_outlet` - Retail store
  - `warehouse` - Storage facility
  - `office` - Corporate office

- **Verification System:**
  - Status: `pending`, `verified`, `rejected`
  - Admin verification workflow
  - Verification notes and timestamps

- **Row Level Security (RLS):**
  - Public can view verified relationships
  - Organization members can view all their relationships
  - Admins only can create/update/delete

### 2. Backend API Routes ✅
**File:** `/supabase/functions/server/company_routes.tsx`

**5 New Routes:**

1. **GET `/organizations/:id/places`**
   - Fetch all place relationships for an organization
   - Returns full place details with relationship metadata
   - Auth: Must be organization member

2. **POST `/organizations/:id/places`**
   - Create new place relationship
   - Auth: Must be admin or owner
   - Auto-sets status to 'pending'

3. **PUT `/organizations/:id/places/:relationshipId`**
   - Update relationship type, notes, or status
   - Auth: Must be admin or owner

4. **DELETE `/organizations/:id/places/:relationshipId`**
   - Remove place relationship
   - Auth: Must be admin or owner

5. **GET `/organizations/:id/places/search`**
   - Search places to add relationships
   - Supports filters: query, category, type
   - Returns max 50 results

### 3. Frontend Component ✅
**File:** `/components/OrganizationPlacesTab.tsx`

**Features:**
- ✅ List all claimed place relationships
- ✅ Beautiful relationship type badges with icons
- ✅ Status indicators (Pending/Verified/Rejected)
- ✅ Search places modal with live search
- ✅ Select relationship type (10 types with descriptions)
- ✅ Add notes to relationships
- ✅ Delete relationships
- ✅ Role-based permissions (admin/owner only can manage)
- ✅ Empty state with helpful CTA
- ✅ Fully responsive design
- ✅ Smooth animations with Motion

### 4. Integration ✅
**File:** `/components/CompanyManagerDrilldown.tsx`

- ✅ Added "Places" menu item (📍 MapPin icon)
- ✅ Integrated OrganizationPlacesTab component
- ✅ Added 'places' to navigation state types
- ✅ Role-based access (owner/admin)

---

## 🚀 How to Use

### For Organization Admins:

1. **Navigate to Organization Management**
   - MARKET → ME → Manage Organizations → Select Organization

2. **Open Places Tab**
   - Click "Places" in the left menu (📍 icon)

3. **Add a Place Relationship**
   - Click "+ Add Place" button
   - Search for the place by name, city, or country
   - Select the place from results
   - Choose relationship type (e.g., "Owns", "Distributed At")
   - Optionally add notes
   - Click "Add Relationship"

4. **View Relationships**
   - See all claimed places in a beautiful grid
   - Color-coded by relationship type
   - Shows verification status
   - Displays location and metadata

5. **Remove Relationships**
   - Click trash icon on any relationship card
   - Confirm deletion

---

## 🗄️ Database Setup

### Run this SQL in Supabase SQL Editor:

```sql
-- Execute the migration file
-- Copy contents from /sql_migrations/organization_place_relationships.sql
```

This will create:
- ✅ `organization_place_relationships` table
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers for `updated_at`
- ✅ All constraints and validations

---

## 🎨 Relationship Type Colors

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| Owns | Emerald | Building2 | Own this location |
| Distributed At | Blue | Store | Products sold here |
| Supplies From | Purple | Factory | Buy supplies from here |
| Manufactures At | Orange | Factory | Manufacturing facility |
| Partner | Amber | Building2 | Business partner |
| Retail Outlet | Pink | Store | Retail store/outlet |
| Warehouse | Gray | Warehouse | Storage facility |
| Office | Indigo | Building2 | Corporate office |
| Customer | Teal | Store | Customer location |
| Supplier | Cyan | Factory | Supplier location |

---

## 📊 Data Model

```
organizations (companies)
    ↕︎ [many-to-many via organization_place_relationships]
places

Example:
Hemp'in Organization
  ├─ owns → Manila Office (place)
  ├─ distributed_at → Green Leaf Dispensary (place)
  ├─ manufactures_at → Processing Facility (place)
  └─ supplies_from → Organic Hemp Farm (place)
```

---

## 🔐 Security & Permissions

### Who Can See Relationships?
- **Public:** Only verified relationships
- **Organization Members:** All relationships (any status)
- **Admins/Owners:** Can create, update, delete

### Verification Flow:
1. Organization admin creates relationship → Status: `pending`
2. (Future) Platform admin reviews → Status: `verified` or `rejected`
3. Verified relationships appear on public profiles

---

## 🎯 Next Steps & Future Enhancements

### Phase 1: ✅ COMPLETE
- [x] Database schema
- [x] Backend API routes
- [x] Frontend component
- [x] Integration with org manager

### Phase 2: 🔜 FUTURE
- [ ] **Admin Verification Dashboard** - Platform admins can approve/reject relationship claims
- [ ] **Relationship Visualization** - Network graph showing org-place connections
- [ ] **Place Profile Pages** - Show all organizations connected to a place
- [ ] **Relationship Analytics** - Track supply chain networks
- [ ] **Bulk Import** - CSV import for organizations with many locations
- [ ] **Relationship History** - Audit log of changes
- [ ] **Public Relationship Display** - Show on organization profile pages
- [ ] **Globe Integration** - Visualize relationships on 3D globe with connecting lines

---

## 🌐 Use Cases

### 1. **Hemp Distributor:**
```
Green Earth Distribution
  ├─ distributes_at → 15 dispensaries
  ├─ supplies_from → 8 organic farms  
  └─ warehouse → 3 storage facilities
```

### 2. **Hemp Farm:**
```
Sunshine Hemp Farm
  ├─ owns → Main Farm (100 hectares)
  ├─ owns → Secondary Plot (50 hectares)
  ├─ customer → 12 manufacturers
  └─ partner → Local Co-op
```

### 3. **Hemp Product Manufacturer:**
```
HempCraft Industries
  ├─ manufactures_at → Factory A
  ├─ office → Corporate HQ
  ├─ supplies_from → 20 farms
  └─ distributed_at → 50+ retail outlets
```

---

## 🔍 Testing Checklist

### Before Deployment:
- [ ] Run SQL migration in Supabase
- [ ] Test creating relationships as org admin
- [ ] Test search functionality
- [ ] Test deleting relationships
- [ ] Verify RLS policies (member vs public access)
- [ ] Test empty state display
- [ ] Test mobile responsiveness
- [ ] Check all relationship types display correctly

---

## 📝 API Examples

### Create Relationship:
```javascript
POST /make-server-053bcd80/organizations/123/places
{
  "place_id": "place-uuid-456",
  "relationship_type": "distributed_at",
  "notes": "Our flagship retail partner since 2020"
}
```

### Get All Relationships:
```javascript
GET /make-server-053bcd80/organizations/123/places

Response:
{
  "relationships": [
    {
      "id": "rel-uuid",
      "relationship_type": "owns",
      "status": "verified",
      "notes": "Main headquarters",
      "place": {
        "name": "Manila Office",
        "city": "Manila",
        "country": "Philippines"
      }
    }
  ]
}
```

### Search Places:
```javascript
GET /make-server-053bcd80/organizations/123/places/search?q=manila&category=retail

Response:
{
  "places": [
    {
      "id": "place-uuid",
      "name": "Green Leaf Manila",
      "type": "dispensary",
      "city": "Manila",
      "country": "Philippines"
    }
  ]
}
```

---

## 🎉 Summary

You now have a **complete organization-place relationship system** that:

✅ Allows organizations to claim connections to physical locations  
✅ Supports 10 different relationship types  
✅ Has proper verification workflow (pending → verified)  
✅ Includes role-based permissions  
✅ Features beautiful UI with search & filters  
✅ Is fully integrated into the organization manager  
✅ Has comprehensive RLS security  
✅ Is ready for deployment!

**Next:** Run the SQL migration and start mapping your hemp industry network! 🌿🗺️
