// Test script to verify admin API security isolation
// Run this to ensure public customers cannot access admin features

const BASE_URL = 'http://localhost:3000';

async function testAdminSecurity() {
  console.log('🔒 Testing Admin API Security Isolation...\n');

  // Test 1: Try to access orders API without admin token (should fail)
  console.log('Test 1: Access orders API without admin token');
  try {
    const response = await fetch(`${BASE_URL}/api/orders`);
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ PASS: API correctly returns 401 Unauthorized');
      console.log('   Response:', data.error);
    } else {
      console.log('❌ FAIL: API should return 401 but got', response.status);
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to test API:', error.message);
  }

  console.log('');

  // Test 2: Try to access orders API with invalid admin token (should fail)
  console.log('Test 2: Access orders API with invalid admin token');
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        'x-admin-token': 'invalid-token'
      }
    });
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ PASS: API correctly returns 401 with invalid token');
      console.log('   Response:', data.error);
    } else {
      console.log('❌ FAIL: API should return 401 but got', response.status);
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to test API:', error.message);
  }

  console.log('');

  // Test 3: Try to access individual order API without admin token (should fail)
  console.log('Test 3: Access individual order API without admin token');
  try {
    const response = await fetch(`${BASE_URL}/api/orders/1`);
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ PASS: Individual order API correctly returns 401');
      console.log('   Response:', data.error);
    } else {
      console.log('❌ FAIL: API should return 401 but got', response.status);
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to test API:', error.message);
  }

  console.log('');

  // Test 4: Try to access supplier URLs API without admin token (should fail)
  console.log('Test 4: Access supplier URLs API without admin token');
  try {
    const response = await fetch(`${BASE_URL}/api/orders/1/supplier-urls`);
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ PASS: Supplier URLs API correctly returns 401');
      console.log('   Response:', data.error);
    } else {
      console.log('❌ FAIL: API should return 401 but got', response.status);
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to test API:', error.message);
  }

  console.log('');

  // Test 5: Verify public routes are still accessible
  console.log('Test 5: Verify public routes are accessible (no admin features)');
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.status === 200) {
      console.log('✅ PASS: Public homepage is accessible');
    } else {
      console.log('❌ FAIL: Public homepage should be accessible');
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to test public route:', error.message);
  }

  console.log('\n🔍 Security Test Summary:');
  console.log('✅ All admin APIs should return 401 without proper authentication');
  console.log('✅ Public routes should remain accessible');
  console.log('✅ No admin features should be visible to customers');
  console.log('✅ Supplier information is completely isolated to admin side');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Set ADMIN_API_TOKEN in your .env file');
  console.log('2. Test admin access with valid token');
  console.log('3. Verify Sanity Studio components work correctly');
  console.log('4. Confirm public storefront remains unchanged');
}

// Run the tests
testAdminSecurity().catch(console.error); 