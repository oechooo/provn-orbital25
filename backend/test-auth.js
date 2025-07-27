// Test script to verify authentication fixes
const baseURL = 'http://localhost:3000/api/auth';

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');

  // Test 1: Try to login with invalid credentials (should fail)
  console.log('1. Testing invalid credentials (should fail):');
  try {
    const response = await fetch(`${baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'nonexistentuser', 
        password: 'wrongpassword' 
      })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${data.message}`);
    if (response.status === 401) {
      console.log('   PASS: Invalid credentials properly rejected\n');
    } else {
      console.log('   FAIL: Should have rejected invalid credentials\n');
    }
  } catch (error) {
    console.log(`   ERROR: ${error.message}\n`);
  }

  // Test 2: Try to register a new user (should succeed)
  console.log('2. Testing user registration:');
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'securepassword123'
  };

  try {
    const response = await fetch(`${baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${data.message}`);
    if (response.status === 201 && data.token) {
      console.log('   PASS: User registration successful');
      console.log(`   Token received: ${data.token.substring(0, 20)}...`);
      
      // Test 3: Login with the new user credentials (should succeed)
      console.log('\n3. Testing login with valid credentials:');
      const loginResponse = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password
        })
      });
      const loginData = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Message: ${loginData.message}`);
      if (loginResponse.status === 200 && loginData.token) {
        console.log('   PASS: Login successful');
        
        // Test 4: Access protected route with valid token (should succeed)
        console.log('\n4. Testing protected route access:');
        const profileResponse = await fetch(`${baseURL}/profile`, {
          headers: { 
            'Authorization': `Bearer ${loginData.token}` 
          }
        });
        const profileData = await profileResponse.json();
        console.log(`   Status: ${profileResponse.status}`);
        if (profileResponse.status === 200 && profileData.user) {
          console.log('   PASS: Protected route access successful');
          console.log(`   User: ${profileData.user.username} (${profileData.user.email})`);
        } else {
          console.log('   FAIL: Protected route access failed');
        }
      } else {
        console.log('   FAIL: Login failed');
      }
    } else {
      console.log('   FAIL: User registration failed');
    }
  } catch (error) {
    console.log(`   ERROR: ${error.message}`);
  }

  // Test 5: Try to access protected route without token (should fail)
  console.log('\n5. Testing protected route without token (should fail):');
  try {
    const response = await fetch(`${baseURL}/profile`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${data.message}`);
    if (response.status === 401) {
      console.log('   PASS: Protected route properly secured\n');
    } else {
      console.log('   FAIL: Protected route should require authentication\n');
    }
  } catch (error) {
    console.log(`   ERROR: ${error.message}\n`);
  }

  console.log('Authentication testing complete!');
}

// Run the tests
testAuthentication();

