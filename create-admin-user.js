// Create admin user for Utrabeauty
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 5,
  connectionTimeoutMillis: 5000,
});

async function createAdminUser() {
  console.log('👑 Creating Admin User for Utrabeauty...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database!\n');
    
    // Check if admin user already exists
    const checkQuery = `
      SELECT id, email FROM "User" 
      WHERE email = $1
    `;
    
    const existingUser = await client.query(checkQuery, ['admin@utrabeauty.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   - ID: ${existingUser.rows[0].id}`);
      console.log(`   - Email: ${existingUser.rows[0].email}`);
      console.log('\n💡 If you need to reset the password, you can update it manually in the database.');
    } else {
      // Create admin user
      const adminEmail = 'admin@utrabeauty.com';
      const adminPassword = 'Transline254@'; // Admin password as requested
      const passwordHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
      
      const insertQuery = `
        INSERT INTO "User" (email, "passwordHash") 
        VALUES ($1, $2) 
        RETURNING id, email
      `;
      
      const result = await client.query(insertQuery, [adminEmail, passwordHash]);
      const newUser = result.rows[0];
      
      console.log('✅ Admin user created successfully!');
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Email: ${newUser.email}`);
      console.log(`   - Password: ${adminPassword}`);
      console.log('\n🔐 Login Credentials:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('\n⚠️  IMPORTANT: Change this password after first login for security!');
    }
    
    // Show all users in the database
    const allUsersQuery = 'SELECT id, email FROM "User" ORDER BY id';
    const allUsers = await client.query(allUsersQuery);
    
    console.log('\n📋 All users in database:');
    allUsers.rows.forEach((user, index) => {
      const isAdmin = user.email === 'admin@utrabeauty.com' ? ' (ADMIN)' : '';
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}${isAdmin}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Admin user setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Failed to create admin user:', error.message);
    console.error('Full error:', error);
    
    await pool.end();
    process.exit(1);
  }
}

createAdminUser(); 