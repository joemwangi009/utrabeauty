// Clean up duplicate carts in the database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 5,
  connectionTimeoutMillis: 5000,
});

async function cleanupDuplicateCarts() {
  console.log('🧹 Cleaning up duplicate carts...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database!\n');
    
    // Check for duplicate carts
    const duplicateQuery = `
      SELECT id, COUNT(*) as count
      FROM "Cart"
      GROUP BY id
      HAVING COUNT(*) > 1
    `;
    
    const duplicates = await client.query(duplicateQuery);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicate carts found!');
    } else {
      console.log(`⚠️  Found ${duplicates.rows.length} duplicate cart IDs:`);
      duplicates.rows.forEach(dup => {
        console.log(`   - ID: ${dup.id} (${dup.count} instances)`);
      });
      
      console.log('\n🧹 Cleaning up duplicates...');
      
      // Clean up duplicates by keeping only the first instance
      for (const duplicate of duplicates.rows) {
        const deleteQuery = `
          DELETE FROM "Cart" 
          WHERE id = $1 
          AND ctid NOT IN (
            SELECT ctid FROM "Cart" WHERE id = $1 LIMIT 1
          )
        `;
        
        const result = await client.query(deleteQuery, [duplicate.id]);
        console.log(`   ✅ Cleaned up ${result.rowCount} duplicate instances of cart ${duplicate.id}`);
      }
      
      console.log('\n✅ Duplicate cleanup completed!');
    }
    
    // Verify cleanup
    const verifyQuery = `
      SELECT id, COUNT(*) as count
      FROM "Cart"
      GROUP BY id
      HAVING COUNT(*) > 1
    `;
    
    const verification = await client.query(verifyQuery);
    
    if (verification.rows.length === 0) {
      console.log('\n✅ Verification: No duplicate carts remain');
    } else {
      console.log('\n❌ Verification failed: Duplicates still exist');
      console.log(verification.rows);
    }
    
    // Show final cart count
    const cartCountQuery = 'SELECT COUNT(*) as total_carts FROM "Cart"';
    const cartCount = await client.query(cartCountQuery);
    console.log(`\n📊 Total carts in database: ${cartCount.rows[0].total_carts}`);
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Cleanup process completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('Full error:', error);
    
    await pool.end();
    process.exit(1);
  }
}

cleanupDuplicateCarts(); 