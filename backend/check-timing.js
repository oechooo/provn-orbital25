const { PrismaClient } = require('@prisma/client');

async function checkMarketTiming() {
  const prisma = new PrismaClient();
  
  try {
    const market = await prisma.market.findFirst({
      where: { id: 195 },
      include: {
        stakes: {
          orderBy: { id: 'desc' },
          take: 5
        }
      }
    });
    
    if (!market) {
      console.log('Market not found');
      return;
    }
    
    console.log('Market timing:');
    console.log(`- Created: ${market.createdAt}`);
    console.log(`- Last resolve: ${market.lastResolve}`);
    console.log(`- Next resolve: ${market.nextResolve}`);
    console.log(`- Resolve count: ${market.resolveCount}`);
    console.log(`- Outcome: ${market.outcome}`);
    
    console.log('\nRecent stakes:');
    market.stakes.forEach(stake => {
      const inPeriod = stake.createdAt >= market.lastResolve && stake.createdAt < market.nextResolve;
      console.log(`- Stake ${stake.id}: created ${stake.createdAt}, in period: ${inPeriod}, resolved: ${stake.resolved}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketTiming();

