const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyRealArticles() {
  try {
    console.log('🔍 Checking all articles in the database...\n');
    
    const articles = await prisma.article.findMany({
      include: {
        market: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
    
    console.log(`📊 Total articles in database: ${articles.length}\n`);
    
    // Check for mock/test data indicators
    const mockIndicators = [
      'TechCrunch', // Only if it's the mock "OpenAI Announces GPT-5" we created
      'Mock', 
      'Test', 
      'Sample',
      'Example',
      'Lorem ipsum',
      'Revolutionary Reasoning Capabilities' // Our specific mock title
    ];
    
    let realArticles = 0;
    let suspiciousArticles = 0;
    
    articles.forEach((article, index) => {
      const isReal = article.url && 
                    article.url.startsWith('http') && 
                    !article.url.includes('example.com') &&
                    !article.url.includes('mock') &&
                    !article.url.includes('test');
      
      const isSuspicious = mockIndicators.some(indicator => 
        article.title.includes(indicator) || 
        article.description?.includes(indicator) ||
        article.content?.includes(indicator)
      );
      
      if (isReal && !isSuspicious) {
        realArticles++;
      } else {
        suspiciousArticles++;
        console.log(`⚠️ Suspicious Article #${index + 1}:`);
        console.log(`   Title: ${article.title}`);
        console.log(`   Source: ${article.sourceName}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Published: ${article.publishedAt}`);
        console.log(`   Reason: ${isSuspicious ? 'Contains mock indicators' : 'Invalid URL'}`);
        console.log('');
      }
    });
    
    // Show detailed analysis
    console.log('📈 ANALYSIS RESULTS:');
    console.log(`✅ Real News Articles: ${realArticles}`);
    console.log(`⚠️ Suspicious Articles: ${suspiciousArticles}`);
    console.log(`📊 Total Articles: ${articles.length}\n`);
    
    // Show sources breakdown
    const sources = {};
    articles.forEach(article => {
      sources[article.sourceName] = (sources[article.sourceName] || 0) + 1;
    });
    
    console.log('📰 SOURCES BREAKDOWN:');
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} articles`);
    });
    
    // Show categories breakdown
    const categories = {};
    articles.forEach(article => {
      categories[article.category] = (categories[article.category] || 0) + 1;
    });
    
    console.log('\n📂 CATEGORIES BREAKDOWN:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} articles`);
    });
    
    // Show recent articles (last 5)
    console.log('\n📋 RECENT ARTICLES (Last 5):');
    articles.slice(0, 5).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`   Source: ${article.sourceName} | Category: ${article.category}`);
      console.log(`   Published: ${article.publishedAt.toISOString().split('T')[0]}`);
      console.log(`   URL: ${article.url}`);
      console.log('');
    });
    
    // Final verification
    if (suspiciousArticles === 0) {
      console.log('🎉 SUCCESS: All articles appear to be real news from the API!');
    } else {
      console.log(`⚠️ WARNING: Found ${suspiciousArticles} suspicious articles that may be test data.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRealArticles();
