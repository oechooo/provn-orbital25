// Test frontend API connection
const API_BASE_URL = 'http://localhost:3000/api';

async function testFrontendAPI() {
  console.log('Testing Frontend API Connection\n');
  
  try {
    // Test articles endpoint
    console.log('Testing articles endpoint...');
    const response = await fetch(`${API_BASE_URL}/articles?limit=3`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Response received: ${data.articles.length} articles`);
    
    // Check each article
    data.articles.forEach((article, index) => {
      console.log(`\nArticle ${index + 1}: ${article.title.substring(0, 40)}...`);
      console.log(`   Category: ${article.category || 'none'}`);
      console.log(`   Author: ${article.author || 'unknown'}`);
      
      if (article.market) {
        console.log(`   Market: TRUE ${Math.round(article.market.probTrue * 100)}% | FALSE ${Math.round(article.market.probFalse * 100)}%`);
      } else {
        console.log(`   No market data`);
      }
    });
    
    // Test categories endpoint
    console.log('\nTesting categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/articles/categories`);
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log(`Categories: ${categoriesData.categories.join(', ')}`);
    } else {
      console.log(`Categories endpoint failed`);
    }
    
    console.log('\nFrontend API connection test completed successfully!');
    console.log('The frontend should now display accurate probability bars.');
    
  } catch (error) {
    console.error('Frontend API test failed:', error.message);
  }
}

// Run the test
testFrontendAPI();
