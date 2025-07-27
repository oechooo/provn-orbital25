const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showOnlyRealArticles() {
  try {
    console.log(' Showing ONLY real articles from News API...\n');
      const articles = await prisma.article.findMany({
      where: {
        // Only exclude obvious test/example URLs
        url: { 
          not: { contains: 'example.com' }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      include: {
        market: true
      }
    });
    
    console.log(` Real articles from News API: ${articles.length}\n`);
    
    articles.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.sourceName}`);
      console.log(`   Published: ${article.publishedAt.toDateString()}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Category: ${article.category || 'N/A'}`);
      console.log(`   Has Market: ${article.market ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check publication dates
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentArticles = articles.filter(a => new Date(a.publishedAt) >= yesterday);
    
    console.log(`📅 Articles from last 24 hours: ${recentArticles.length}`);
    console.log(`📅 Total real articles: ${articles.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showOnlyRealArticles();

