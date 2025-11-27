# 🛍️ HEMPIN SWAG MARKETPLACE - Setup Instructions

## Phase 1 - Token 1.1: Database Schema & API Routes

This document explains how to set up the swag products database and API infrastructure.

---

## 📋 **Step 1: Apply SQL Migration to Supabase**

You need to create the `swag_products_053bcd80` table and set up the storage bucket.

**IMPORTANT NOTE**: The migration references your existing `companies` table (NOT `companies_053bcd80`). Make sure your companies table exists before running this migration.

### **Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/001_swag_products.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

The migration will create:
- ✅ `swag_products_053bcd80` table with all columns
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ `swag-images-053bcd80` storage bucket
- ✅ Storage policies for images
- ✅ Triggers for `updated_at` timestamp

### **Option B: Using Supabase CLI**

If you have the Supabase CLI installed:

```bash
# Make sure you're in your project directory
supabase migration new swag_products

# Copy the SQL from /supabase/migrations/001_swag_products.sql
# to the newly created migration file

# Apply the migration
supabase db push
```

---

## 🔍 **Step 2: Verify Database Setup**

After running the migration, verify in your Supabase dashboard:

### **Check Table**
1. Go to **Table Editor**
2. Look for `swag_products_053bcd80` table
3. Verify columns exist

### **Check Storage Bucket**
1. Go to **Storage**
2. Look for `swag-images-053bcd80` bucket
3. Verify it's set to **Public**

### **Check RLS Policies**
1. Go to **Authentication** → **Policies**
2. Look for `swag_products_053bcd80` table
3. Verify 5 policies exist:
   - Public can view published products
   - Company owners can view their products
   - Company owners can create products
   - Company owners can update their products
   - Company owners can delete their products

---

## 🚀 **Step 3: Deploy Backend Routes**

The backend routes are already integrated into your server!

### **Files Created:**
- ✅ `/supabase/functions/server/swag_routes.tsx` - All swag API routes
- ✅ Updated `/supabase/functions/server/index.tsx` - Routes registered

### **Deploy to Supabase:**

If you're using Supabase Edge Functions:

```bash
# Deploy the server function
supabase functions deploy server
```

Or if your server auto-deploys, just push your changes to your repository.

---

## 📡 **Step 4: Test API Endpoints**

Once deployed, test the endpoints:

### **Public Endpoints (No Auth Required):**

```bash
# Get all published products
GET https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products

# Get single product
GET https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/{productId}

# Get products by company
GET https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/by-company/{companyId}

# Get categories
GET https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/meta/categories
```

### **Authenticated Endpoints (Requires Access Token):**

```bash
# Get my company's products (including unpublished)
GET https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/my/{companyId}
Headers: Authorization: Bearer {accessToken}

# Create product
POST https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products
Headers: Authorization: Bearer {accessToken}
Body: {
  "company_id": "uuid",
  "name": "Hemp T-Shirt",
  "description": "Organic hemp t-shirt",
  "price": 29.99,
  "currency": "USD",
  "category": "apparel",
  "inventory": 100,
  "is_published": true
}

# Update product
PUT https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/{productId}
Headers: Authorization: Bearer {accessToken}
Body: { ... fields to update ... }

# Delete product
DELETE https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/{productId}
Headers: Authorization: Bearer {accessToken}

# Upload image
POST https://{projectId}.supabase.co/functions/v1/make-server-053bcd80/swag-products/upload-image
Headers: Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

---

## 🔐 **Security Features**

### **Row Level Security (RLS):**
- ✅ Anyone can view **published** products
- ✅ Only company **owners** can create/edit/delete their products
- ✅ Company owners can see their **unpublished** products
- ✅ Non-owners cannot see unpublished products

### **API Authentication:**
- ✅ Public endpoints (GET published products) - No auth required
- ✅ Management endpoints (Create/Update/Delete) - Access token required
- ✅ Ownership verification on all mutations
- ✅ Detailed error logging

### **Image Upload Security:**
- ✅ Max file size: 5MB
- ✅ Allowed types: JPEG, PNG, WebP, GIF
- ✅ Files stored with user ID prefix
- ✅ Users can only modify their own images

---

## 📊 **Database Schema Overview**

### **swag_products_053bcd80 Table**

```sql
Column                    Type           Description
------------------------  -------------  ----------------------------------
id                        UUID           Primary key
company_id                UUID           Foreign key to companies
name                      TEXT           Product name
description               TEXT           Full description
excerpt                   TEXT           Short description for cards
price                     DECIMAL(10,2)  Price (nullable)
currency                  TEXT           Currency code (default: USD)
primary_image_url         TEXT           Main product image
images                    TEXT[]         Array of additional images
inventory                 INTEGER        Stock count
in_stock                  BOOLEAN        Availability flag
category                  TEXT           Product category
tags                      TEXT[]         Search tags
external_shop_url         TEXT           External shop link
external_shop_platform    TEXT           Platform name
external_product_id       TEXT           External ID
requires_badge            BOOLEAN        Members-only flag
required_badge_id         UUID           Specific badge requirement
required_association_id   UUID           Association requirement
is_active                 BOOLEAN        Product is active
is_featured               BOOLEAN        Featured product
is_published              BOOLEAN        Public visibility
slug                      TEXT           URL-friendly identifier
created_at                TIMESTAMP      Creation timestamp
updated_at                TIMESTAMP      Update timestamp (auto)
created_by                UUID           Creator user ID
```

---

## 🎯 **Next Steps**

After confirming the database and API are working:

1. ✅ **Phase 1 Complete** - Database & API ✓
2. 🚀 **Move to Phase 2** - Build Organization Dashboard with Swag Management UI
3. 🛍️ **Then Phase 3** - Build Public SWAG Marketplace

---

## 🐛 **Troubleshooting**

### **Migration fails:**
- Make sure you're using the correct Supabase project
- Check that `companies` table exists (foreign key dependency)
- Try running migration statements one section at a time

### **Storage bucket not created:**
- Manually create bucket in Supabase Dashboard → Storage
- Name: `swag-images-053bcd80`
- Set to **Public**
- Apply the storage policies from the migration

### **API returns 404:**
- Verify server function is deployed
- Check logs in Supabase Functions dashboard
- Ensure routes are registered in `index.tsx`

### **RLS blocks all access:**
- Verify policies exist in Supabase dashboard
- Check user owns the company they're trying to modify
- Ensure products have `is_published = true` for public access

---

## 📞 **Support**

If you encounter issues:
1. Check Supabase Function logs
2. Check browser console for errors
3. Verify access tokens are valid
4. Test with simple curl commands first

---

**Ready to build the UI!** 🌱✨