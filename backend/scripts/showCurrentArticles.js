const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showCurrentArticles() {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        sourceName: true,
        url: true,
        category: true,
        publishedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 10
    });
    
    console.log('📰 Current articles in database:');
    console.log('================================');
    
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.sourceName}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Published: ${article.publishedAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCurrentArticles();
