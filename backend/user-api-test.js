// User API Test Script
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/users';
const TEST_USER = {
  username: `testuser_${Date.now()}`, // Using timestamp to ensure unique username
  email: `testuser_${Date.now()}@example.com`,
  password: 'password123'
};

// Helper for logging
const logResult = (title, passed, details = '') => {
  const status = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`${status} - ${title}`);
  if (details) console.log(`      ${details}`);
};

// Test runner
async function runTests() {
  console.log('\n🔍 Starting User API Tests...\n');
  let userId = null;
  let createdUser = null;

  try {
    // Test 1: Get all users (initially should be empty or have existing users)
    console.log('\n📋 TEST: Get all users');
    try {
      const response = await axios.get(API_URL);
      logResult('GET /api/users', response.status === 200);
      console.log(`      Found ${response.data.length} users in the database`);
    } catch (error) {
      logResult('GET /api/users', false, `Error: ${error.message}`);
    }

    // Test 2: Create a new user
    console.log('\n📋 TEST: Create a new user');
    try {
      const response = await axios.post(API_URL, TEST_USER);
      createdUser = response.data;
      userId = response.data.id;
      const success = response.status === 201 && 
                      response.data.username === TEST_USER.username &&
                      response.data.email === TEST_USER.email;
      
      logResult('POST /api/users', success);
      console.log(`      Created user with ID: ${userId}`);
      
      // Check that password is not returned in response
      if (response.data.password) {
        logResult('Password security', false, 'Password was included in response!');
      } else {
        logResult('Password security', true, 'Password correctly excluded from response');
      }
      
    } catch (error) {
      logResult('POST /api/users', false, `Error: ${error.message}`);
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    // Test 3: Get user by ID
    console.log('\n📋 TEST: Get user by ID');
    if (userId) {
      try {
        const response = await axios.get(`${API_URL}/${userId}`);
        const success = response.status === 200 && 
                        response.data.id === userId &&
                        response.data.username === TEST_USER.username;
        
        logResult(`GET /api/users/${userId}`, success);
      } catch (error) {
        logResult(`GET /api/users/${userId}`, false, `Error: ${error.message}`);
      }

      // Test 3.1: Get user with invalid ID
      try {
        await axios.get(`${API_URL}/invalid`);
        logResult('GET /api/users/invalid (should fail)', false, 'Did not reject invalid ID');
      } catch (error) {
        const success = error.response && error.response.status === 400;
        logResult('GET /api/users/invalid', success, 'Correctly rejected invalid ID');
      }

      // Test 3.2: Get non-existent user
      try {
        await axios.get(`${API_URL}/9999`);
        logResult('GET /api/users/9999 (should fail)', false, 'Did not reject non-existent ID');
      } catch (error) {
        const success = error.response && error.response.status === 404;
        logResult('GET /api/users/9999', success, 'Correctly reported user not found');
      }
    }

    // Test 4: Update user
    console.log('\n📋 TEST: Update user');
    if (userId) {
      const updateData = {
        username: `updated_${TEST_USER.username}`,
        email: `updated_${TEST_USER.email}`
      };

      try {
        const response = await axios.put(`${API_URL}/${userId}`, updateData);
        const success = response.status === 200 && 
                        response.data.id === userId &&
                        response.data.username === updateData.username &&
                        response.data.email === updateData.email;
        
        logResult(`PUT /api/users/${userId}`, success);
        console.log(`      Updated username to: ${response.data.username}`);
      } catch (error) {
        logResult(`PUT /api/users/${userId}`, false, `Error: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }

      // Test 4.1: Update with invalid ID
      try {
        await axios.put(`${API_URL}/invalid`, { username: 'test' });
        logResult('PUT /api/users/invalid (should fail)', false, 'Did not reject invalid ID');
      } catch (error) {
        const success = error.response && error.response.status === 400;
        logResult('PUT /api/users/invalid', success, 'Correctly rejected invalid ID');
      }
    }

    // Test 5: Delete user
    console.log('\n📋 TEST: Delete user');
    if (userId) {
      try {
        const response = await axios.delete(`${API_URL}/${userId}`);
        const success = response.status === 204;
        
        logResult(`DELETE /api/users/${userId}`, success);
      } catch (error) {
        logResult(`DELETE /api/users/${userId}`, false, `Error: ${error.message}`);
      }

      // Test 5.1: Verify user is deleted by trying to fetch it again
      try {
        await axios.get(`${API_URL}/${userId}`);
        logResult(`Verify deletion of user ${userId} (should fail)`, false, 'User still exists after deletion');
      } catch (error) {
        const success = error.response && error.response.status === 404;
        logResult(`Verify deletion of user ${userId}`, success, 'User successfully deleted');
      }

      // Test 5.2: Delete with invalid ID
      try {
        await axios.delete(`${API_URL}/invalid`);
        logResult('DELETE /api/users/invalid (should fail)', false, 'Did not reject invalid ID');
      } catch (error) {
        const success = error.response && error.response.status === 400;
        logResult('DELETE /api/users/invalid', success, 'Correctly rejected invalid ID');
      }
    }

  } catch (error) {
    console.error('An unexpected error occurred during testing:', error.message);
  }

  console.log('\n✅ User API Tests Completed\n');
}

// Check if server is running
axios.get(API_URL)
  .then(() => {
    console.log('✅ Server is running. Starting tests...');
    runTests();
  })
  .catch(error => {
    console.error('❌ Error: Server is not running or API endpoint is not accessible.');
    console.error(`Details: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
  });
