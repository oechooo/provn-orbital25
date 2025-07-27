const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearMockData() {
  try {
    console.log('Clearing all existing data...');
    
    // Delete all markets first (due to foreign key constraints)
    const deletedMarkets = await prisma.market.deleteMany();
    console.log(`Deleted ${deletedMarkets.count} markets`);
    
    // Delete all articles
    const deletedArticles = await prisma.article.deleteMany();
    console.log(`Deleted ${deletedArticles.count} articles`);
    
    console.log('Database cleared successfully!');
    
    // Verify the database is empty
    const articleCount = await prisma.article.count();
    const marketCount = await prisma.market.count();
    
    console.log(`Verification: ${articleCount} articles, ${marketCount} markets remaining`);
    
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearMockData();

