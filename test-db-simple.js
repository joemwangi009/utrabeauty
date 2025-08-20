// Set environment variable to bypass SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
require('dotenv').config();

// Simple connection without SSL verification
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 5,
  connectionTimeoutMillis: 5000,
});

async function createTables() {
  console.log('🚀 Creating database tables...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database!');
    
    // Create tables one by one
    const tables = [
      {
        name: 'User',
        sql: `CREATE TABLE IF NOT EXISTS "User" (
          "id" SERIAL PRIMARY KEY,
          "email" TEXT UNIQUE NOT NULL,
          "passwordHash" TEXT NOT NULL
        )`
      },
      {
        name: 'Session', 
        sql: `CREATE TABLE IF NOT EXISTS "Session" (
          "id" TEXT PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
          "expiresAt" TIMESTAMP NOT NULL
        )`
      },
      {
        name: 'Cart',
        sql: `CREATE TABLE IF NOT EXISTS "Cart" (
          "id" TEXT PRIMARY KEY,
          "userId" INTEGER UNIQUE REFERENCES "User"("id") ON DELETE CASCADE
        )`
      },
      {
        name: 'CartLineItem',
        sql: `CREATE TABLE IF NOT EXISTS "CartLineItem" (
          "id" TEXT PRIMARY KEY,
          "sanityProductId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "title" TEXT NOT NULL,
          "price" DECIMAL(10,2) NOT NULL,
          "image" TEXT NOT NULL,
          "cartId" TEXT NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE
        )`
      },
      {
        name: 'WheelOfFortuneSpin',
        sql: `CREATE TABLE IF NOT EXISTS "WheelOfFortuneSpin" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
          "spunAt" TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      }
    ];
    
    for (const table of tables) {
      console.log(`Creating ${table.name} table...`);
      await client.query(table.sql);
      console.log(`✅ ${table.name} table created!`);
    }
    
    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('certificate')) {
      console.log('\n💡 SSL Issue detected. Let\'s try a different approach...');
    }
    
    process.exit(1);
  }
}

createTables(); 