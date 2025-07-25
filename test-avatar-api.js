// Simple test to check if avatar API is working
const testAvatarAPI = async () => {
  console.log('Testing avatar update API...');
  
  try {
    // First, let's try to login to get a token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed, status:', loginResponse.status);
      const loginText = await loginResponse.text();
      console.log('Login response:', loginText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful!');
    console.log('User PP before:', loginData.user.provePoints);
    
    const token = loginData.token;
    
    // Now test avatar update
    const avatarResponse = await fetch('http://localhost:3000/api/auth/update-avatar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        avatarSkinColor: 'brown',
        avatarHairColor: 'brown',
        avatarHair: 'straightHair',  // Should cost 0 - user already owns this!
        avatarEyes: 'starstruck',  // This should cost PP (currently has 'angry')
        avatarMouth: 'teethSmile',
        avatarAccessories: 'none'
      })
    });
    
    if (!avatarResponse.ok) {
      console.log('Avatar update failed, status:', avatarResponse.status);
      const errorText = await avatarResponse.text();
      console.log('Avatar response:', errorText);
      return;
    }
    
    const avatarData = await avatarResponse.json();
    console.log('Avatar update successful!');
    console.log('Response:', avatarData);
    console.log('PP after update:', avatarData.provePoints);
    console.log('Cost deducted:', avatarData.costDeducted);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAvatarAPI();
