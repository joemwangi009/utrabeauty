-- Supabase Migration: Create Orders Table with Supplier Information
-- Run this in your Supabase SQL Editor

-- Create enum for order status
CREATE TYPE order_status AS ENUM (
    'PROCESSING',
    'SHIPPED', 
    'DELIVERED',
    'CANCELLED'
);

-- Create orders table
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

-- Create order items table
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

-- Create shipping address table
CREATE TABLE IF NOT EXISTS "ShippingAddress" (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "line1" VARCHAR(255) NOT NULL,
    "line2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS idx_order_order_number ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"("status");
CREATE INDEX IF NOT EXISTS idx_order_date ON "Order"("orderDate");
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_item_sanity_product_id ON "OrderItem"("sanityProductId");
CREATE INDEX IF NOT EXISTS idx_order_item_supplier_url ON "OrderItem"("supplierUrl");
CREATE INDEX IF NOT EXISTS idx_shipping_address_order_id ON "ShippingAddress"("orderId");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_order_updated_at 
    BEFORE UPDATE ON "Order" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO "Order" ("orderNumber", "customerId", "customerName", "customerEmail", "totalPrice") 
-- VALUES ('ORD-001', 'cust_123', 'John Doe', 'john@example.com', 99.99);

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT ALL ON "Order" TO authenticated;
-- GRANT ALL ON "OrderItem" TO authenticated;
-- GRANT ALL ON "ShippingAddress" TO authenticated;
-- GRANT USAGE ON SEQUENCE "Order_id_seq" TO authenticated;
-- GRANT USAGE ON SEQUENCE "OrderItem_id_seq" TO authenticated;
-- GRANT USAGE ON SEQUENCE "ShippingAddress_id_seq" TO authenticated; 