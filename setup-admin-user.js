// Setup script for creating admin user in Sanity Studio
// Run this after you've added the user schema to Sanity

const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: 'i10ney18',
  dataset: 'production',
  apiVersion: '2024-12-06',
  token: 'skjbY0rFoMPGkV3MulNRiAy7FU9HQcIQM0Ul0r7nPz8hY6iVAfe3TKcPXDz5mdBRB8tyDOWvbpCyw5zBj9X8ZIJrRrBVb8Bx7IwhOysi7Y3HIwl0kR41kVEyy4CgLK4F5gb5afGb9iIKGFyf18YFuzbhLCJAs2T1xrcvsYSrMLq7v1ql1HRM',
  useCdn: false
});

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user in Sanity Studio...');
    
    // Create admin user document
    const adminUser = await client.create({
      _type: 'user',
      name: 'Admin User',
      email: 'admin@utrabeauty.com',
      role: 'admin',
      isActive: true,
      permissions: [
        'manage_products',
        'manage_orders', 
        'import_alibaba',
        'view_supplier_info',
        'manage_users',
        'access_analytics'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 User Details:');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Permissions: ${adminUser.permissions.join(', ')}`);
    
    console.log('\n🔐 Next Steps:');
    console.log('1. Go to Sanity Studio at http://localhost:3000/studio');
    console.log('2. You should now see the "User" document type');
    console.log('3. The admin user will have access to all features');
    console.log('4. You can create additional users with different roles');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.message.includes('Unknown type')) {
      console.log('\n💡 Solution: Make sure you have:');
      console.log('1. Added the user schema to your Sanity schema index');
      console.log('2. Restarted your Sanity Studio');
      console.log('3. The user document type is visible in Studio');
    }
  }
}

// Run the setup
createAdminUser(); 