// Test our new database utility functions
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const { 
  testConnection, 
  createUser, 
  findUserByEmail,
  createCart,
  addCartItem,
  getDatabaseStats
} = require('./src/lib/database');

async function testDatabaseUtility() {
  console.log('🧪 Testing Database Utility Functions...\n');
  
  try {
    // Test connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Connection successful!\n');
    
    // Test user creation
    console.log('2. Testing user creation...');
    const testUser = await createUser('test@example.com', 'hashedpassword123');
    console.log('✅ User created:', { id: testUser.id, email: testUser.email });
    
    // Test user lookup
    console.log('\n3. Testing user lookup...');
    const foundUser = await findUserByEmail('test@example.com');
    console.log('✅ User found:', { id: foundUser.id, email: foundUser.email });
    
    // Test cart creation
    console.log('\n4. Testing cart creation...');
    const testCart = await createCart('test-cart-123', testUser.id);
    console.log('✅ Cart created:', { id: testCart.id, userId: testCart.userId });
    
    // Test adding cart item
    console.log('\n5. Testing cart item addition...');
    const cartItem = await addCartItem('test-cart-123', {
      sanityProductId: 'test-product-123',
      quantity: 2,
      title: 'Test Product',
      price: 29.99,
      image: 'https://example.com/image.jpg'
    });
    console.log('✅ Cart item added:', { id: cartItem.id, title: cartItem.title });
    
    // Test database stats
    console.log('\n6. Testing database stats...');
    const stats = await getDatabaseStats();
    console.log('✅ Database stats:', stats);
    
    console.log('\n🎉 All database utility tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testDatabaseUtility(); 