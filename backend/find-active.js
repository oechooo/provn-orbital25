const { PrismaClient } = require('@prisma/client');

async function findActiveMarket() {
  const prisma = new PrismaClient();
  
  try {
    // Find a market that's still in its first resolution period
    const activeMarkets = await prisma.market.findMany({
      where: {
        resolveCount: 0,
        stakes: {
          some: {
            resolved: false
          }
        }
      },
      include: {
        stakes: {
          where: {
            resolved: false
          },
          take: 3
        },
        article: true
      },
      take: 1
    });
    
    if (activeMarkets.length === 0) {
      console.log('No active markets in first resolution period found');
      return;
    }
    
    const market = activeMarkets[0];
    console.log(`Active market ${market.id}: ${market.article.title}`);
    console.log('Market timing:');
    console.log(`- Created: ${market.createdAt}`);
    console.log(`- Last resolve: ${market.lastResolve}`);
    console.log(`- Next resolve: ${market.nextResolve}`);
    console.log(`- Resolve count: ${market.resolveCount}`);
    
    console.log('\nUnresolved stakes:');
    market.stakes.forEach(stake => {
      const inPeriod = stake.createdAt >= market.lastResolve && stake.createdAt < market.nextResolve;
      console.log(`- Stake ${stake.id}: created ${stake.createdAt}, in period: ${inPeriod}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findActiveMarket();
