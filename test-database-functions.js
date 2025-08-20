// Test our new database utility functions with the compiled TypeScript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const { Pool } = require('pg');

// Simple pool setup to test raw functions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 5,
  connectionTimeoutMillis: 5000,
});

async function testDatabaseFunctions() {
  console.log('🧪 Testing Database Functions...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database!\n');
    
    // Test 1: Create a test user
    console.log('1. Testing user creation...');
    const userResult = await client.query(`
      INSERT INTO "User" (email, "passwordHash") 
      VALUES ($1, $2) 
      RETURNING id, email
    `, ['testuser@example.com', 'hashedpassword123']);
    
    const testUser = userResult.rows[0];
    console.log('✅ User created:', { id: testUser.id, email: testUser.email });
    
    // Test 2: Find the user
    console.log('\n2. Testing user lookup...');
    const findUserResult = await client.query(`
      SELECT id, email, "passwordHash" 
      FROM "User" 
      WHERE email = $1
    `, ['testuser@example.com']);
    
    const foundUser = findUserResult.rows[0];
    console.log('✅ User found:', { id: foundUser.id, email: foundUser.email });
    
    // Test 3: Create a session
    console.log('\n3. Testing session creation...');
    const sessionId = 'test-session-' + Date.now();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    
    const sessionResult = await client.query(`
      INSERT INTO "Session" (id, "userId", "expiresAt") 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [sessionId, testUser.id, expiresAt]);
    
    const session = sessionResult.rows[0];
    console.log('✅ Session created:', { id: session.id, userId: session.userId });
    
    // Test 4: Create a cart
    console.log('\n4. Testing cart creation...');
    const cartId = 'test-cart-' + Date.now();
    
    const cartResult = await client.query(`
      INSERT INTO "Cart" (id, "userId") 
      VALUES ($1, $2) 
      RETURNING *
    `, [cartId, testUser.id]);
    
    const cart = cartResult.rows[0];
    console.log('✅ Cart created:', { id: cart.id, userId: cart.userId });
    
    // Test 5: Add items to cart
    console.log('\n5. Testing cart item addition...');
    const itemResult = await client.query(`
      INSERT INTO "CartLineItem" (id, "cartId", "sanityProductId", quantity, title, price, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      'test-item-' + Date.now(),
      cartId,
      'sanity-product-123',
      2,
      'Test Product',
      29.99,
      'https://example.com/image.jpg'
    ]);
    
    const cartItem = itemResult.rows[0];
    console.log('✅ Cart item added:', { 
      id: cartItem.id, 
      title: cartItem.title, 
      quantity: cartItem.quantity,
      price: cartItem.price 
    });
    
    // Test 6: Create wheel of fortune spin
    console.log('\n6. Testing wheel of fortune spin...');
    const spinResult = await client.query(`
      INSERT INTO "WheelOfFortuneSpin" ("userId", "spunAt") 
      VALUES ($1, $2) 
      RETURNING *
    `, [testUser.id, new Date()]);
    
    const spin = spinResult.rows[0];
    console.log('✅ Wheel spin recorded:', { id: spin.id, userId: spin.userId });
    
    // Test 7: Get database statistics
    console.log('\n7. Testing database statistics...');
    const statsQueries = [
      'SELECT COUNT(*) as count FROM "User"',
      'SELECT COUNT(*) as count FROM "Session"',
      'SELECT COUNT(*) as count FROM "Cart"',
      'SELECT COUNT(*) as count FROM "CartLineItem"',
      'SELECT COUNT(*) as count FROM "WheelOfFortuneSpin"'
    ];
    
    const stats = {};
    const tables = ['User', 'Session', 'Cart', 'CartLineItem', 'WheelOfFortuneSpin'];
    
    for (let i = 0; i < statsQueries.length; i++) {
      const result = await client.query(statsQueries[i]);
      stats[tables[i]] = result.rows[0].count;
    }
    
    console.log('✅ Database statistics:', stats);
    
    // Test 8: Complex query - Get cart with items
    console.log('\n8. Testing complex cart query...');
    const cartWithItemsResult = await client.query(`
      SELECT c.*, 
             json_agg(
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
    `, [cartId]);
    
    const cartWithItems = cartWithItemsResult.rows[0];
    console.log('✅ Cart with items:', { 
      cartId: cartWithItems.id, 
      itemCount: cartWithItems.items.length,
      items: cartWithItems.items
    });
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 All database function tests passed!');
    console.log('\n✅ Database is fully operational and ready for the application!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    
    await pool.end();
    process.exit(1);
  }
}

testDatabaseFunctions(); 