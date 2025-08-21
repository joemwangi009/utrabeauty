# 🔒 Admin Security Guide - Feature Isolation

This guide ensures that all new admin features are properly isolated from the public-facing storefront.

## ⚡ **Critical Rule**

**All new features (Alibaba scraping, supplier tracking, admin order management) must ONLY exist on the admin/Sanity Studio side. The client-facing storefront must remain completely unchanged.**

## 🚫 **What Customers CANNOT Access**

### **API Endpoints (Protected)**
- `GET /api/orders` - ❌ Admin only
- `POST /api/orders` - ❌ Admin only  
- `GET /api/orders/[id]` - ❌ Admin only
- `PATCH /api/orders/[id]` - ❌ Admin only
- `GET /api/orders/[id]/supplier-urls` - ❌ Admin only

### **Admin Features (Sanity Studio Only)**
- Alibaba product import button
- Supplier URL tracking fields
- Go to Supplier button
- Enhanced order management
- Supplier analytics

## ✅ **What Customers CAN Access (Unchanged)**

### **Public Storefront (No Changes)**
- Product listings (`/product/[id]`)
- Shopping cart (`/cart`)
- Checkout process (`/checkout`)
- User authentication (`/auth/sign-in`, `/auth/sign-up`)
- Category pages (`/category/[slug]`)
- Search functionality (`/search`)

### **Public APIs (No Changes)**
- Product data from Sanity
- Cart management
- Stripe checkout
- User authentication

## 🔐 **Security Implementation**

### **1. Admin API Token Protection**

All order management APIs require an admin token:

```bash
# Add to your .env file
ADMIN_API_TOKEN=your-secure-admin-token-here
```

### **2. API Authentication**

```typescript
// All admin APIs check for this header
const adminToken = request.headers.get('x-admin-token');

if (!adminToken || adminToken !== process.env.ADMIN_API_TOKEN) {
  return NextResponse.json(
    { success: false, error: 'Admin access required' },
    { status: 401 }
  );
}
```

### **3. Frontend Route Protection**

The new features only exist in:
- `src/sanity/` - Sanity Studio components
- `src/app/api/orders/` - Admin-only API routes
- `src/lib/database.ts` - Database utilities (used by admin APIs)

## 🎯 **Feature Location Summary**

### **Admin Side (Sanity Studio)**
```
✅ Alibaba Import Button → src/sanity/components/ImportFromAlibaba.tsx
✅ Supplier URL Fields → src/sanity/schemaTypes/schemas/product.ts
✅ Go to Supplier Button → src/sanity/components/GoToSupplierButton.tsx
✅ Enhanced Order Schema → src/sanity/schemaTypes/schemas/order.ts
✅ Order Management APIs → src/app/api/orders/* (protected)
✅ Database Functions → src/lib/database.ts (used by admin APIs)
```

### **Public Side (Storefront) - NO CHANGES**
```
❌ Product pages → src/app/product/[id]/page.tsx (unchanged)
❌ Shopping cart → src/app/cart/page.tsx (unchanged)
❌ Checkout → src/app/checkout/* (unchanged)
❌ User auth → src/app/auth/* (unchanged)
❌ Category pages → src/app/category/[slug]/page.tsx (unchanged)
❌ Search → src/app/search/page.tsx (unchanged)
```

## 🛡️ **Additional Security Measures**

### **1. Environment Variable Protection**

```bash
# .env.local (not committed to git)
ADMIN_API_TOKEN=your-super-secure-token-here
NODE_ENV=production
```

### **2. Production Deployment**

```typescript
// In production, use proper admin authentication
if (process.env.NODE_ENV === 'production') {
  // Implement proper admin session management
  // Use JWT tokens, admin user database, etc.
}
```

### **3. Rate Limiting**

```typescript
// Add rate limiting to admin APIs
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
};
```

## 🔍 **Testing Security Isolation**

### **Test 1: Public API Access**
```bash
# This should return 401 Unauthorized
curl -X GET http://localhost:3000/api/orders
```

### **Test 2: Admin API Access**
```bash
# This should work with proper token
curl -X GET http://localhost:3000/api/orders \
  -H "x-admin-token: your-admin-token"
```

### **Test 3: Frontend Routes**
- Visit `/product/[id]` - Should show normal product page (no admin features)
- Visit `/cart` - Should show normal cart (no supplier info)
- Visit `/checkout` - Should show normal checkout (no admin features)

## 🚨 **Security Checklist**

- [ ] `ADMIN_API_TOKEN` environment variable set
- [ ] All order APIs return 401 without admin token
- [ ] No admin features visible in public storefront
- [ ] Sanity Studio components only accessible to admin users
- [ ] Database functions only called by admin APIs
- [ ] Public routes remain completely unchanged

## 📱 **Admin Access Workflow**

### **For Store Owners/Admins:**
1. **Access Sanity Studio** → `/studio`
2. **Import Alibaba Products** → Use import button
3. **Manage Orders** → View supplier information
4. **Click "Go to Supplier"** → Open Alibaba pages

### **For Customers:**
1. **Browse Products** → Normal shopping experience
2. **Add to Cart** → Standard cart functionality
3. **Checkout** → Standard Stripe checkout
4. **No Access** → Cannot see supplier URLs or admin features

## 🔄 **Data Flow Security**

```
Customer Order → Stripe → Supabase (basic order data)
                                    ↓
                              Admin Only APIs
                                    ↓
                              Sanity Studio
                                    ↓
                              Supplier Information
                                    ↓
                              Go to Supplier Button
```

**Key Point**: Supplier information flows TO admin tools, never FROM admin tools to customer-facing features.

## 🎉 **Result**

- ✅ **Admin Side**: Full supplier tracking, Alibaba integration, order management
- ✅ **Public Side**: Completely unchanged, normal e-commerce experience
- ✅ **Security**: Admin features properly isolated and protected
- ✅ **Functionality**: Store owners can manage supplier relationships without affecting customer experience

---

**Remember**: The goal is to give store owners powerful tools to manage their Alibaba supply chain while keeping the customer shopping experience exactly the same. 