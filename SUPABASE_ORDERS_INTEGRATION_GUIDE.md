# 🚀 Supabase Orders Integration Guide with Supplier Information

> ⚠️ **IMPORTANT SECURITY NOTICE**: All features in this guide are **ADMIN-ONLY** and completely isolated from the public-facing storefront. Customers cannot access supplier information, order management APIs, or any admin features.

This guide shows you how to integrate the enhanced orders system with Supabase, including supplier URL tracking and the "Go to Supplier" functionality - **exclusively for admin use**.

## 🔒 **Security Isolation - Critical Rule**

### **✅ Admin Side (Sanity Studio) - NEW FEATURES**
- Alibaba product import button
- Supplier URL tracking fields  
- Go to Supplier button
- Enhanced order management
- Supplier analytics
- Order management APIs (protected)

### **❌ Public Side (Storefront) - NO CHANGES**
- Product listings remain unchanged
- Shopping cart functionality unchanged
- Checkout process unchanged
- Customer experience completely unaffected
- No supplier information visible to customers

### **🛡️ API Protection**
All new API endpoints require admin authentication:
```bash
# Required header for all admin APIs
x-admin-token: your-secure-admin-token
```

**Without this token, all admin APIs return 401 Unauthorized.**

## 📁 File Structure

```
src/
├── app/api/orders/                    # 🔒 ADMIN-ONLY APIs (protected)
│   ├── route.ts                       # GET/POST orders
│   ├── [id]/route.ts                 # GET/PATCH individual order
│   └── [id]/supplier-urls/route.ts   # GET supplier URLs
├── lib/
│   └── database.ts                    # Database utilities (admin APIs only)
├── sanity/                            # 🔒 ADMIN-ONLY (Sanity Studio)
│   ├── components/
│   │   ├── GoToSupplierButton.tsx    # Supplier button component
│   │   └── index.ts                  # Component exports
│   └── schemaTypes/schemas/
│       └── order.ts                  # Enhanced order schema
└── supabase-migration-orders.sql      # Database migration
```

## 🗄️ Database Setup

### 1. **Run the Migration**

Copy the contents of `supabase-migration-orders.sql` and run it in your Supabase SQL Editor:

```sql
-- Create enum for order status
CREATE TYPE order_status AS ENUM (
    'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
);

-- Create orders table with supplier tracking
CREATE TABLE IF NOT EXISTS "Order" (
    id SERIAL PRIMARY KEY,
    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
    "orderDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "customerId" VARCHAR(100) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "customerEmail" VARCHAR(255) NOT NULL,
    "stripeCustomerId" VARCHAR(100),
    "stripeCheckoutSessionId" VARCHAR(100),
    "stripePaymentIntentId" VARCHAR(100),
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" order_status DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table with supplier info
CREATE TABLE IF NOT EXISTS "OrderItem" (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
    "sanityProductId" VARCHAR(100) NOT NULL,
    "productTitle" VARCHAR(255) NOT NULL,
    "productPrice" DECIMAL(10,2) NOT NULL,
    "productImage" TEXT,
    "supplierUrl" TEXT, -- Alibaba/AliExpress product URL
    "supplierName" VARCHAR(255), -- Supplier name
    "importedFromAlibaba" BOOLEAN DEFAULT FALSE,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Verify Tables Created**

Check that the tables were created successfully:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%Order%';

-- Check table structure
\d "Order"
\d "OrderItem"
```

## 🔐 **Environment Setup**

### **Required Environment Variables**

```bash
# .env.local (not committed to git)
ADMIN_API_TOKEN=your-super-secure-admin-token-here
DATABASE_URL=your-supabase-connection-string
```

**⚠️ Security Note**: The `ADMIN_API_TOKEN` must be a strong, unique token that only admin users know.

## 🔧 API Endpoints (Admin-Only)

### **Orders API**

#### **GET /api/orders** (🔒 Admin Only)
Fetch all orders with optional supplier information:

```typescript
// Requires admin token
GET /api/orders
Headers: { "x-admin-token": "your-admin-token" }

// With supplier info
GET /api/orders?includeSupplierInfo=true
Headers: { "x-admin-token": "your-admin-token" }

// With pagination
GET /api/orders?limit=20&offset=0
Headers: { "x-admin-token": "your-admin-token" }
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "totalPrice": 99.99,
      "status": "PROCESSING",
      "supplierUrl": "https://alibaba.com/product/123",
      "supplierName": "Alibaba Supplier",
      "importedFromAlibaba": true
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### **POST /api/orders** (🔒 Admin Only)
Create a new order:

```typescript
POST /api/orders
Headers: { "x-admin-token": "your-admin-token" }
Content-Type: application/json

{
  "orderNumber": "ORD-002",
  "customerId": "cust_123",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "totalPrice": 149.99
}
```

#### **GET /api/orders/[id]** (🔒 Admin Only)
Get order details by ID:

```typescript
GET /api/orders/1
Headers: { "x-admin-token": "your-admin-token" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-001",
    "customerName": "John Doe",
    "orderItems": [
      {
        "id": 1,
        "productTitle": "Wireless Headphones",
        "supplierUrl": "https://alibaba.com/product/123",
        "supplierName": "Alibaba Supplier",
        "importedFromAlibaba": true,
        "quantity": 2,
        "lineTotal": 99.99
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY"
    }
  }
}
```

#### **PATCH /api/orders/[id]** (🔒 Admin Only)
Update order status:

```typescript
PATCH /api/orders/1
Headers: { "x-admin-token": "your-admin-token" }
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

#### **GET /api/orders/[id]/supplier-urls** (🔒 Admin Only)
Get all supplier URLs for an order:

```typescript
GET /api/orders/1/supplier-urls
Headers: { "x-admin-token": "your-admin-token" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "supplierUrls": [
      "https://alibaba.com/product/123",
      "https://aliexpress.com/product/456"
    ],
    "count": 2
  }
}
```

## 🎯 Usage Examples (Admin Only)

### **Creating an Order with Supplier Information**

```typescript
import { createOrder, createOrderItem } from '@/lib/database';

// Create the order
const order = await createOrder({
  orderNumber: 'ORD-003',
  customerId: 'cust_456',
  customerName: 'Alice Johnson',
  customerEmail: 'alice@example.com',
  totalPrice: 199.98
});

// Create order items with supplier info
await createOrderItem({
  orderId: order.id,
  sanityProductId: 'product_123',
  productTitle: 'Smart Watch',
  productPrice: 99.99,
  supplierUrl: 'https://alibaba.com/product/watch-123',
  supplierName: 'Alibaba Supplier',
  importedFromAlibaba: true,
  quantity: 2,
  lineTotal: 199.98
});
```

### **Fetching Orders with Supplier Info**

```typescript
import { getOrdersWithSupplierInfo } from '@/lib/database';

// Get orders with supplier information
const orders = await getOrdersWithSupplierInfo(20, 0);

// Filter Alibaba orders
const alibabaOrders = orders.filter(order => order.importedFromAlibaba);

// Get unique supplier URLs
const supplierUrls = [...new Set(orders.map(order => order.supplierUrl).filter(Boolean))];
```

### **Updating Order Status**

```typescript
import { updateOrderStatus } from '@/lib/database';

// Update order to shipped
const updatedOrder = await updateOrderStatus(1, 'SHIPPED');
```

## 🎨 Sanity Studio Integration (Admin Only)

### **Enhanced Order Schema**

The order schema now includes:

- **Supplier Information**: URL, name, and import flag
- **Go to Supplier Button**: Clickable button to open supplier pages
- **Enhanced Preview**: Shows supplier status in order lists
- **Smart Ordering**: Sort by Alibaba import status

### **Using the Go to Supplier Button**

1. **In Order Items**: Each order item shows supplier information
2. **Click "Go to Supplier"**: Opens supplier product page in new tab
3. **Supplier URL Display**: Shows the actual URL being linked to

### **Order Preview Features**

- **Alibaba Indicator**: 🔄 icon for orders with Alibaba products
- **Supplier Count**: Number of unique suppliers in the order
- **Status Tracking**: Complete order lifecycle management

## 🔄 Data Flow (Admin Side Only)

### **Order Creation Flow**

```
1. Customer places order → Stripe checkout (public)
2. Order created in Supabase → Basic order data (public)
3. Admin imports supplier info → Order items updated (admin only)
4. Sanity Studio shows → Supplier information (admin only)
5. Admin clicks "Go to Supplier" → Opens Alibaba pages (admin only)
```

### **Supplier Information Flow**

```
Product Import (Alibaba) → Product Schema → Order Creation → Order Items → Supplier Tracking
     ↓                           ↓              ↓            ↓            ↓
supplierUrl, supplierName → Stored in DB → Copied to Order → Visible in Studio → Clickable Button
```

**Key Point**: Supplier information flows TO admin tools, never FROM admin tools to customer-facing features.

## 🛠️ Customization Options (Admin Only)

### **Modify Supplier Button Behavior**

Edit `GoToSupplierButton.tsx`:

```typescript
const handleGoToSupplier = () => {
  if (supplierUrl) {
    // Custom behavior
    if (supplierUrl.includes('alibaba.com')) {
      // Special handling for Alibaba
      window.open(supplierUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Default behavior
      window.open(supplierUrl, '_blank');
    }
  }
};
```

### **Add Supplier Analytics**

```typescript
// Get supplier performance metrics
const getSupplierAnalytics = async () => {
  const query = `
    SELECT 
      "supplierName",
      COUNT(*) as order_count,
      AVG("totalPrice") as avg_order_value
    FROM "Order" o
    JOIN "OrderItem" oi ON o.id = oi."orderId"
    WHERE oi."supplierUrl" IS NOT NULL
    GROUP BY "supplierName"
    ORDER BY order_count DESC
  `;
  
  const result = await executeQuery(query);
  return result.rows;
};
```

### **Custom Order Statuses**

Modify the enum in the migration:

```sql
CREATE TYPE order_status AS ENUM (
    'PROCESSING',
    'CONFIRMED',
    'PREPARING',
    'SHIPPED', 
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);
```

## 🔒 Security Considerations

### **API Protection**
- All order endpoints require `x-admin-token` header
- Token must match `ADMIN_API_TOKEN` environment variable
- Unauthorized requests return 401 status

### **Data Validation**
- Sanitize supplier URLs
- Validate order amounts
- Check customer information

### **Access Control**
- Admin APIs only accessible with proper token
- No public access to supplier information
- Customer-facing features completely unchanged

## 🚨 Troubleshooting

### **Common Issues**

1. **"Table does not exist" error**
   - Run the migration in Supabase SQL Editor
   - Check table names match exactly

2. **Supplier URLs not showing**
   - Verify products have supplier information
   - Check order item creation includes supplier data

3. **Go to Supplier button not working**
   - Ensure supplierUrl field is populated
   - Check browser popup blockers

4. **API endpoints returning 401 errors**
   - Check `ADMIN_API_TOKEN` environment variable
   - Verify `x-admin-token` header is sent
   - Ensure token matches environment variable

5. **"Admin access required" errors**
   - Set `ADMIN_API_TOKEN` in your `.env` file
   - Include `x-admin-token` header in API requests
   - Verify token value is correct

### **Debug Steps**

1. **Check environment variables** for `ADMIN_API_TOKEN`
2. **Verify API headers** include `x-admin-token`
3. **Check Supabase logs** for SQL errors
4. **Test with valid admin token** to confirm functionality
5. **Verify public routes** remain accessible and unchanged

## 📊 Monitoring & Analytics (Admin Only)

### **Track Order Metrics**

```typescript
// Orders by supplier
const ordersBySupplier = await executeQuery(`
  SELECT 
    "supplierName",
    COUNT(*) as total_orders,
    SUM("totalPrice") as total_revenue
  FROM "Order" o
  JOIN "OrderItem" oi ON o.id = oi."orderId"
  WHERE oi."supplierUrl" IS NOT NULL
  GROUP BY "supplierName"
`);

// Alibaba import success rate
const alibabaSuccessRate = await executeQuery(`
  SELECT 
    COUNT(CASE WHEN oi."importedFromAlibaba" = true THEN 1 END) as alibaba_orders,
    COUNT(*) as total_orders
  FROM "OrderItem" oi
`);
```

### **Performance Monitoring**

- Track API response times
- Monitor database query performance
- Log supplier URL access patterns

## 🚀 Production Deployment

### **Environment Variables**

```bash
# Supabase configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Admin security (CRITICAL)
ADMIN_API_TOKEN=your-super-secure-production-token
NODE_ENV=production
```

### **Database Optimization**

```sql
-- Add additional indexes for performance
CREATE INDEX idx_order_supplier_url ON "OrderItem"("supplierUrl") WHERE "supplierUrl" IS NOT NULL;
CREATE INDEX idx_order_imported_alibaba ON "OrderItem"("importedFromAlibaba");
CREATE INDEX idx_order_customer_email ON "Order"("customerEmail");
```

### **API Rate Limiting**

```typescript
// Implement rate limiting for production
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
};
```

## 🔍 **Testing Security Isolation**

### **Test Admin API Protection**

```bash
# This should return 401 Unauthorized
curl -X GET http://localhost:3000/api/orders

# This should work with proper token
curl -X GET http://localhost:3000/api/orders \
  -H "x-admin-token: your-admin-token"
```

### **Test Public Route Access**

- Visit `/product/[id]` - Should show normal product page (no admin features)
- Visit `/cart` - Should show normal cart (no supplier info)
- Visit `/checkout` - Should show normal checkout (no admin features)

### **Run Security Test Script**

```bash
node test-admin-security.js
```

## 🤝 Support & Contributing

### **Getting Help**

1. Check this documentation
2. Review API endpoint responses
3. Check Supabase SQL Editor logs
4. Test with sample data
5. Verify environment variables are set

### **Contributing**

1. Fork the repository
2. Create feature branch
3. Make improvements
4. Submit pull request

---

## 🎉 Success!

You now have a fully integrated orders system with Supabase that includes:

**✅ Admin Side (Sanity Studio)**
- Complete supplier tracking
- Alibaba integration
- Order management with supplier info
- Go to Supplier functionality

**✅ Public Side (Storefront)**
- Completely unchanged
- Normal e-commerce experience
- No admin features visible
- No supplier information exposed

**✅ Security**
- Admin APIs properly protected
- Feature isolation maintained
- Customer experience unaffected

**Next Steps:**
1. Set `ADMIN_API_TOKEN` in your `.env` file
2. Run the Supabase migration
3. Test the admin APIs with proper authentication
4. Verify public storefront remains unchanged
5. Test the Go to Supplier functionality in Sanity Studio

**Remember**: All new features are admin-only and completely isolated from the customer-facing storefront! 🔒

Happy ordering! 🚀 