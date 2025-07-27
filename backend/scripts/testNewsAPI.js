const axios = require('axios');
require('dotenv').config();

async function testNewsAPI() {
  const API_KEY = process.env.NEWS_API_KEY;
  
  if (!API_KEY || API_KEY === 'your_actual_api_key_here') {
    console.log('Please set your real News API key in the .env file');
    console.log('1. Go to https://newsapi.org/register');
    console.log('2. Sign up for a free account');
    console.log('3. Get your API key');
    console.log('4. Replace NEWS_API_KEY=your_actual_api_key_here with your real key');
    return;
  }

  console.log(' Testing News API connection...');
  
  try {
    const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=technology&pageSize=1&language=en`;
    const response = await axios.get(url);
    
    if (response.data.status === 'ok') {
      console.log('News API is working!');
      console.log(` Sample article: ${response.data.articles[0]?.title || 'No articles found'}`);
      console.log('\nYou can now run: node scripts/fetchRealNews.js');
    } else {
      console.log('API returned an error:', response.data);
    }
    
  } catch (error) {
    console.error('API Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 API Key Error:');
      console.log('- Make sure you copied the key correctly from newsapi.org');
      console.log('- Check that your account is active');
      console.log('- Verify the key has not expired');
    } else if (error.response?.status === 429) {
      console.log('\n⏳ Rate Limit Error:');
      console.log('- You may have exceeded the free tier limits');
      console.log('- Wait a bit and try again');
    }
  }
}

testNewsAPI();

