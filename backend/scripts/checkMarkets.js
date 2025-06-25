const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMarkets() {
  try {
    const markets = await prisma.market.findMany({
      include: {
        article: true,
        stakes: true,
      },
    });

    console.log(`Found ${markets.length} markets:`);
    markets.forEach(market => {
      console.log(`- Market ${market.id}: ${market.article.title}`);
      console.log(`  Source: ${market.article.sourceName}`);
      console.log(`  Probability True: ${(market.probTrue * 100).toFixed(1)}%`);
      console.log(`  Stakes: ${market.stakes.length}`);
      console.log('');
    });

    if (markets.length === 0) {
      console.log('No markets found. Creating sample markets...');
      
      // Import and run the sample markets creation
      require('./createSampleMarkets.js');
    }
  } catch (error) {
    console.error('Error checking markets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarkets();
