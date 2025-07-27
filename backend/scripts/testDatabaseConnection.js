const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('Testing direct database connection...');
    
    // Get articles directly from database
    const articles = await prisma.article.findMany({
      take: 3,
      orderBy: {
        publishedAt: 'desc'
      },
      include: {
        market: true
      }
    });
    
    console.log('\n Articles from database:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.sourceName}`);
      console.log(`   URL: ${article.url}`);
      console.log('');
    });
    
    // Now test the ArticleService
    const { ArticleService } = require('../dist/services/ArticleService');
    const articleService = new ArticleService(prisma);
    
    console.log('Testing ArticleService...');
    const serviceArticles = await articleService.getFilteredArticles({
      limit: 3
    });
    
    console.log('\n Articles from ArticleService:');
    serviceArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.sourceName}`);
      console.log(`   URL: ${article.url}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();

