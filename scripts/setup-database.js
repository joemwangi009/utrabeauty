const { testConnection, createTables, dropAllTables } = require('../src/lib/database');

async function setupDatabase() {
  console.log('🚀 Setting up database connection...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your DATABASE_URL in .env file.');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful!\n');
    
    // Ask user what they want to do
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('What would you like to do?\n1. Create tables\n2. Drop all tables (reset)\n3. Both (drop then create)\nEnter choice (1, 2, or 3): ', async (choice) => {
      try {
        switch (choice) {
          case '1':
            console.log('\n📋 Creating database tables...');
            await createTables();
            break;
            
          case '2':
            console.log('\n🗑️ Dropping all tables...');
            await dropAllTables();
            break;
            
          case '3':
            console.log('\n🔄 Resetting database...');
            await dropAllTables();
            console.log('\n📋 Creating fresh tables...');
            await createTables();
            break;
            
          default:
            console.log('Invalid choice. Exiting...');
        }
        
        console.log('\n🎉 Database setup completed successfully!');
        process.exit(0);
        
      } catch (error) {
        console.error('\n❌ Error during database setup:', error);
        process.exit(1);
      } finally {
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 