import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

// Database connection pool configuration
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: false, // Disable SSL for now since we know it works
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Add error handling to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing database connection with URL:', env.DATABASE_URL.substring(0, 50) + '...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Connection string (first 50 chars):', env.DATABASE_URL.substring(0, 50) + '...');
    return false;
  }
};

// Execute a query with automatic connection management
export const executeQuery = async <T extends QueryResultRow = any>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> => {
  const client = await pool.connect();
  try {
    const result = await client.query<T>(query, params);
    return result;
  } finally {
    client.release();
  }
};

// Execute multiple queries in a transaction
export const executeTransaction = async <T extends QueryResultRow = any>(
  queries: { query: string; params?: any[] }[]
): Promise<T[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results: T[] = [];
    
    for (const { query, params = [] } of queries) {
      const result = await client.query<T>(query, params);
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ===== USER MANAGEMENT FUNCTIONS =====

export const createUser = async (email: string, passwordHash: string) => {
  const query = `
    INSERT INTO "User" (email, "passwordHash") 
    VALUES ($1, $2) 
    RETURNING id, email
  `;
  const result = await executeQuery(query, [email, passwordHash]);
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const query = `
    SELECT id, email, "passwordHash" 
    FROM "User" 
    WHERE email = $1
  `;
  const result = await executeQuery(query, [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: number) => {
  const query = `
    SELECT id, email 
    FROM "User" 
    WHERE id = $1
  `;
  const result = await executeQuery(query, [id]);
  return result.rows[0] || null;
};

// ===== SESSION MANAGEMENT FUNCTIONS =====

export const createSession = async (sessionId: string, userId: number, expiresAt: Date) => {
  const query = `
    INSERT INTO "Session" (id, "userId", "expiresAt") 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  const result = await executeQuery(query, [sessionId, userId, expiresAt]);
  return result.rows[0];
};

export const findSessionById = async (sessionId: string) => {
  const query = `
    SELECT s.*, u.id as "userId", u.email 
    FROM "Session" s
    JOIN "User" u ON s."userId" = u.id
    WHERE s.id = $1
  `;
  const result = await executeQuery(query, [sessionId]);
  return result.rows[0] || null;
};

export const deleteSession = async (sessionId: string) => {
  const query = `DELETE FROM "Session" WHERE id = $1`;
  await executeQuery(query, [sessionId]);
};

export const deleteExpiredSessions = async () => {
  const query = `DELETE FROM "Session" WHERE "expiresAt" < NOW()`;
  await executeQuery(query);
};

// ===== CART MANAGEMENT FUNCTIONS =====

export const createCart = async (cartId: string, userId?: number) => {
  // First check if cart already exists
  const existingCart = await findCartById(cartId);
  if (existingCart) {
    return existingCart;
  }

  // If cart doesn't exist, create it
  const query = `
    INSERT INTO "Cart" (id, "userId") 
    VALUES ($1, $2) 
    RETURNING *
  `;
  const result = await executeQuery(query, [cartId, userId]);
  return result.rows[0];
};

export const findCartById = async (cartId: string) => {
  const query = `
    SELECT c.*, 
           array_agg(
             json_build_object(
               'id', cli.id,
               'sanityProductId', cli."sanityProductId",
               'quantity', cli.quantity,
               'title', cli.title,
               'price', cli.price,
               'image', cli.image
             )
           ) as items
    FROM "Cart" c
    LEFT JOIN "CartLineItem" cli ON c.id = cli."cartId"
    WHERE c.id = $1
    GROUP BY c.id, c."userId"
  `;
  const result = await executeQuery(query, [cartId]);
  return result.rows[0] || null;
};

export const findCartByUserId = async (userId: number) => {
  const query = `
    SELECT c.*, 
           array_agg(
             json_build_object(
               'id', cli.id,
               'sanityProductId', cli."sanityProductId",
               'quantity', cli.quantity,
               'title', cli.title,
               'price', cli.price,
               'image', cli.image
             )
           ) as items
    FROM "Cart" c
    LEFT JOIN "CartLineItem" cli ON c.id = cli."cartId"
    WHERE c."userId" = $1
    GROUP BY c.id, c."userId"
  `;
  const result = await executeQuery(query, [userId]);
  return result.rows[0] || null;
};

export const addCartItem = async (cartId: string, item: {
  sanityProductId: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
}) => {
  const query = `
    INSERT INTO "CartLineItem" (id, "cartId", "sanityProductId", quantity, title, price, image)
    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await executeQuery(query, [
    cartId, 
    item.sanityProductId, 
    item.quantity, 
    item.title, 
    item.price, 
    item.image
  ]);
  return result.rows[0];
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    const query = `DELETE FROM "CartLineItem" WHERE id = $1`;
    await executeQuery(query, [itemId]);
    return null;
  } else {
    const query = `
      UPDATE "CartLineItem" 
      SET quantity = $2 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await executeQuery(query, [itemId, quantity]);
    return result.rows[0];
  }
};

export const removeCartItem = async (itemId: string) => {
  const query = `DELETE FROM "CartLineItem" WHERE id = $1`;
  await executeQuery(query, [itemId]);
};

export const clearCart = async (cartId: string) => {
  const query = `DELETE FROM "CartLineItem" WHERE "cartId" = $1`;
  await executeQuery(query, [cartId]);
};

export const deleteCart = async (cartId: string) => {
  const query = `DELETE FROM "Cart" WHERE id = $1`;
  await executeQuery(query, [cartId]);
};

// Clean up duplicate carts and ensure data integrity
export const cleanupDuplicateCarts = async () => {
  // Find carts with duplicate IDs (shouldn't happen with proper constraints, but just in case)
  const duplicateQuery = `
    SELECT id, COUNT(*) as count
    FROM "Cart"
    GROUP BY id
    HAVING COUNT(*) > 1
  `;
  
  const duplicates = await executeQuery(duplicateQuery);
  
  if (duplicates.rows.length > 0) {
    console.warn('Found duplicate carts:', duplicates.rows);
    
    // Keep only the first cart for each ID and delete the rest
    for (const duplicate of duplicates.rows) {
      const deleteQuery = `
        DELETE FROM "Cart" 
        WHERE id = $1 
        AND ctid NOT IN (
          SELECT ctid FROM "Cart" WHERE id = $1 LIMIT 1
        )
      `;
      await executeQuery(deleteQuery, [duplicate.id]);
    }
  }
  
  return duplicates.rows.length;
};

// ===== WHEEL OF FORTUNE FUNCTIONS =====

export const createWheelOfFortuneSpin = async (userId: number, spunAt: Date) => {
  const query = `
    INSERT INTO "WheelOfFortuneSpin" ("userId", "spunAt") 
    VALUES ($1, $2) 
    RETURNING *
  `;
  const result = await executeQuery(query, [userId, spunAt]);
  return result.rows[0];
};

export const findUserSpinsToday = async (userId: number) => {
  const query = `
    SELECT * FROM "WheelOfFortuneSpin" 
    WHERE "userId" = $1 
    AND DATE("createdAt") = CURRENT_DATE
  `;
  const result = await executeQuery(query, [userId]);
  return result.rows;
};

// ===== ORDER MANAGEMENT FUNCTIONS =====

export interface OrderItem {
  id?: number;
  orderId: number;
  sanityProductId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  supplierUrl?: string;
  supplierName?: string;
  importedFromAlibaba?: boolean;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  id?: number;
  orderId: number;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id?: number;
  orderNumber: string;
  orderDate?: Date;
  customerId: string;
  customerName: string;
  customerEmail: string;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  totalPrice: number;
  status?: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderWithDetails extends Order {
  orderItems: OrderItem[];
  shippingAddress?: ShippingAddress;
}

export const createOrder = async (orderData: Order): Promise<Order> => {
  const query = `
    INSERT INTO "Order" (
      "orderNumber", "orderDate", "customerId", "customerName", "customerEmail",
      "stripeCustomerId", "stripeCheckoutSessionId", "stripePaymentIntentId",
      "totalPrice", "status"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  
  const params = [
    orderData.orderNumber,
    orderData.orderDate || new Date(),
    orderData.customerId,
    orderData.customerName,
    orderData.customerEmail,
    orderData.stripeCustomerId,
    orderData.stripeCheckoutSessionId,
    orderData.stripePaymentIntentId,
    orderData.totalPrice,
    orderData.status || 'PROCESSING'
  ];
  
  const result = await executeQuery(query, params);
  return result.rows[0];
};

export const createOrderItem = async (orderItem: OrderItem): Promise<OrderItem> => {
  const query = `
    INSERT INTO "OrderItem" (
      "orderId", "sanityProductId", "productTitle", "productPrice", "productImage",
      "supplierUrl", "supplierName", "importedFromAlibaba", "quantity", "lineTotal"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  
  const params = [
    orderItem.orderId,
    orderItem.sanityProductId,
    orderItem.productTitle,
    orderItem.productPrice,
    orderItem.productImage,
    orderItem.supplierUrl,
    orderItem.supplierName,
    orderItem.importedFromAlibaba || false,
    orderItem.quantity,
    orderItem.lineTotal
  ];
  
  const result = await executeQuery(query, params);
  return result.rows[0];
};

export const createShippingAddress = async (address: ShippingAddress): Promise<ShippingAddress> => {
  const query = `
    INSERT INTO "ShippingAddress" (
      "orderId", "name", "line1", "line2", "city", "state", "postalCode", "country"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const params = [
    address.orderId,
    address.name,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ];
  
  const result = await executeQuery(query, params);
  return result.rows[0];
};

export const getOrderById = async (orderId: number): Promise<OrderWithDetails | null> => {
  // Get order details
  const orderQuery = `SELECT * FROM "Order" WHERE id = $1`;
  const orderResult = await executeQuery(orderQuery, [orderId]);
  
  if (orderResult.rows.length === 0) {
    return null;
  }
  
  const order = orderResult.rows[0];
  
  // Get order items
  const itemsQuery = `SELECT * FROM "OrderItem" WHERE "orderId" = $1 ORDER BY id`;
  const itemsResult = await executeQuery(itemsQuery, [orderId]);
  
  // Get shipping address
  const addressQuery = `SELECT * FROM "ShippingAddress" WHERE "orderId" = $1 LIMIT 1`;
  const addressResult = await executeQuery(addressQuery, [orderId]);
  
  return {
    ...order,
    orderItems: itemsResult.rows,
    shippingAddress: addressResult.rows[0] || undefined
  };
};

export const getOrderByOrderNumber = async (orderNumber: string): Promise<OrderWithDetails | null> => {
  const orderQuery = `SELECT * FROM "Order" WHERE "orderNumber" = $1`;
  const orderResult = await executeQuery(orderQuery, [orderNumber]);
  
  if (orderResult.rows.length === 0) {
    return null;
  }
  
  const order = orderResult.rows[0];
  return getOrderById(order.id);
};

export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  const query = `
    SELECT * FROM "Order" 
    WHERE "customerId" = $1 
    ORDER BY "orderDate" DESC
  `;
  const result = await executeQuery(query, [customerId]);
  return result.rows;
};

export const getAllOrders = async (limit: number = 50, offset: number = 0): Promise<Order[]> => {
  const query = `
    SELECT * FROM "Order" 
    ORDER BY "orderDate" DESC 
    LIMIT $1 OFFSET $2
  `;
  const result = await executeQuery(query, [limit, offset]);
  return result.rows;
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const query = `
    UPDATE "Order" 
    SET "status" = $1, "updatedAt" = NOW() 
    WHERE id = $2 
    RETURNING *
  `;
  const result = await executeQuery(query, [status, orderId]);
  return result.rows[0];
};

export const getOrdersWithSupplierInfo = async (limit: number = 50, offset: number = 0): Promise<any[]> => {
  const query = `
    SELECT 
      o.*,
      oi."supplierUrl",
      oi."supplierName",
      oi."importedFromAlibaba",
      oi."productTitle",
      oi."productImage"
    FROM "Order" o
    LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
    ORDER BY o."orderDate" DESC 
    LIMIT $1 OFFSET $2
  `;
  const result = await executeQuery(query, [limit, offset]);
  return result.rows;
};

export const getOrderSupplierUrls = async (orderId: number): Promise<string[]> => {
  const query = `
    SELECT DISTINCT "supplierUrl" 
    FROM "OrderItem" 
    WHERE "orderId" = $1 AND "supplierUrl" IS NOT NULL
  `;
  const result = await executeQuery(query, [orderId]);
  return result.rows.map(row => row.supplierUrl).filter(Boolean);
};

// ===== UTILITY FUNCTIONS =====

export const getDatabaseStats = async () => {
  const queries = [
    { query: 'SELECT COUNT(*) as user_count FROM "User"' },
    { query: 'SELECT COUNT(*) as session_count FROM "Session"' },
    { query: 'SELECT COUNT(*) as cart_count FROM "Cart"' },
    { query: 'SELECT COUNT(*) as item_count FROM "CartLineItem"' },
    { query: 'SELECT COUNT(*) as spin_count FROM "WheelOfFortuneSpin"' }
  ];
  
  const results = await executeTransaction(queries);
  return {
    users: results[0]?.user_count || 0,
    sessions: results[1]?.session_count || 0,
    carts: results[2]?.cart_count || 0,
    cartItems: results[3]?.item_count || 0,
    spins: results[4]?.spin_count || 0
  };
};

// Create database tables based on the Prisma schema
export const createTables = async (): Promise<void> => {
  const createTablesQueries = [
    // Create User table
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL
    )`,
    
    // Create Session table
    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "expiresAt" TIMESTAMP NOT NULL
    )`,
    
    // Create Cart table
    `CREATE TABLE IF NOT EXISTS "Cart" (
      "id" TEXT PRIMARY KEY,
      "userId" INTEGER UNIQUE REFERENCES "User"("id") ON DELETE CASCADE
    )`,
    
    // Create CartLineItem table
    `CREATE TABLE IF NOT EXISTS "CartLineItem" (
      "id" TEXT PRIMARY KEY,
      "sanityProductId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "price" DECIMAL(10,2) NOT NULL,
      "image" TEXT NOT NULL,
      "cartId" TEXT NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE
    )`,
    
    // Create WheelOfFortuneSpin table
    `CREATE TABLE IF NOT EXISTS "WheelOfFortuneSpin" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "spunAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    console.log('Creating database tables...');
    
    for (const query of createTablesQueries) {
      await executeQuery(query);
      console.log('✓ Table created successfully');
    }
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Drop all tables (for reset)
export const dropAllTables = async (): Promise<void> => {
  const dropQueries = [
    'DROP TABLE IF EXISTS "WheelOfFortuneSpin" CASCADE',
    'DROP TABLE IF EXISTS "CartLineItem" CASCADE',
    'DROP TABLE IF EXISTS "Cart" CASCADE',
    'DROP TABLE IF EXISTS "Session" CASCADE',
    'DROP TABLE IF EXISTS "User" CASCADE'
  ];

  try {
    console.log('Dropping all tables...');
    
    for (const query of dropQueries) {
      await executeQuery(query);
      console.log('✓ Table dropped successfully');
    }
    
    console.log('All tables dropped successfully!');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

// Close the pool (call this when shutting down the app)
export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool; 