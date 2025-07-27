const axios = require('axios');

async function testAPI() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'tester1',
      password: 'password123'
    });
    
    console.log('Login successful, token received');
    
    // Get profile with purchased items
    const profileResponse = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();

