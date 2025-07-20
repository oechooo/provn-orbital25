// scripts/clearAndRefreshNews.js
// This script clears all existing articles and forces fresh news population

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAndRefreshNews() {
  console.log('🗑️  Clearing existing articles and markets...');
  
  try {
    // Delete all stakes first (foreign key constraint)
    await prisma.stake.deleteMany({});
    console.log('✅ Cleared all stakes');
    
    // Delete all markets
    await prisma.market.deleteMany({});
    console.log('✅ Cleared all markets');
    
    // Delete all articles
    await prisma.article.deleteMany({});
    console.log('✅ Cleared all articles');
    
    console.log('🎉 Database cleared! Restart the server to fetch fresh news.');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndRefreshNews();
