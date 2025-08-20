const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool configuration for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testDatabase() {
  console.log('🚀 Testing database connection...\n');
  console.log('Connection string:', process.env.DATABASE_URL ? 'Found' : 'Missing');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database!');
    
    // Test query
    console.log('2. Testing query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Create tables
    console.log('\n3. Creating database tables...');
    
    const createTablesQueries = [
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "expiresAt" TIMESTAMP NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS "Cart" (
        "id" TEXT PRIMARY KEY,
        "userId" INTEGER UNIQUE REFERENCES "User"("id") ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS "CartLineItem" (
        "id" TEXT PRIMARY KEY,
        "sanityProductId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "image" TEXT NOT NULL,
        "cartId" TEXT NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS "WheelOfFortuneSpin" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "spunAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    for (let i = 0; i < createTablesQueries.length; i++) {
      const query = createTablesQueries[i];
      console.log(`   Creating table ${i + 1}/5...`);
      await client.query(query);
      console.log(`   ✅ Table ${i + 1} created successfully`);
    }
    
    console.log('\n🎉 All tables created successfully!');
    
    // List tables
    console.log('\n4. Listing created tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Check if your database server is running and accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: Check your DATABASE_URL hostname and port');
    } else if (error.code === '28P01') {
      console.log('\n💡 Tip: Check your database username and password');
    } else if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
      console.log('\n💡 Tip: SSL certificate issue - trying to fix...');
    }
    
    process.exit(1);
  }
}

testDatabase(); 