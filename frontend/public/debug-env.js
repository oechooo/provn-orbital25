// Debug frontend environment variables
console.log('Frontend Environment Debug');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api');
console.log('Mode:', import.meta.env.MODE);
console.log('Dev:', import.meta.env.DEV);
console.log('Prod:', import.meta.env.PROD);
console.log('All env vars:', import.meta.env);

// Test API call to verify what URL is actually being used
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('Testing API call with:', API_BASE_URL);

fetch(`${API_BASE_URL}/articles/2`)
  .then(response => {
    console.log('API Response status:', response.status);
    console.log('Actual URL called:', response.url);
    return response.json();
  })
  .then(data => {
    console.log('API Data received:', data);
  })
  .catch(error => {
    console.log('API Error:', error);
  });
