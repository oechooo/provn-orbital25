// Quick test to verify article-market integration
const axios = require('axios');

async function testArticleMarketIntegration() {
  try {
    console.log(' Testing article-market integration...');
    
    const response = await axios.get('http://localhost:3000/api/articles?limit=3');
    const data = response.data;
    
    console.log(` Found ${data.articles.length} articles`);
    
    data.articles.forEach((article, index) => {
      console.log(`\n Article ${index + 1}:`);
      console.log(`  ID: ${article.id}`);
      console.log(`  Title: ${article.title.substring(0, 60)}...`);
      console.log(`  Market: ${article.market ? 'YES' : 'NO'}`);
      
      if (article.market) {
        console.log(`  Market ID: ${article.market.id}`);
        console.log(`  Prob True: ${article.market.probTrue}`);
        console.log(`  Prob False: ${article.market.probFalse}`);
        console.log(`  Market Status: ${article.market.closed ? 'CLOSED' : 'OPEN'}`);
      }
    });
    
    const articlesWithMarkets = data.articles.filter(a => a.market !== null);
    const percentage = (articlesWithMarkets.length / data.articles.length * 100).toFixed(1);
    
    console.log(`\nSUCCESS: ${articlesWithMarkets.length}/${data.articles.length} (${percentage}%) articles have markets`);
    
    if (articlesWithMarkets.length === data.articles.length) {
      console.log(' ALL ARTICLES HAVE MARKETS - Frontend integration should work!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testArticleMarketIntegration();

