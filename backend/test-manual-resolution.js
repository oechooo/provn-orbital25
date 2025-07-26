const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function testClearMarketResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    // Find a market with unresolved stakes
    const marketsWithStakes = await prisma.market.findMany({
      include: {
        stakes: {
          where: {
            resolved: false
          }
        },
        article: true
      },
      where: {
        stakes: {
          some: {
            resolved: false
          }
        }
      },
      take: 1
    });
    
    if (marketsWithStakes.length === 0) {
      console.log('No markets with unresolved stakes found');
      return;
    }
    
    const market = marketsWithStakes[0];
    console.log(`Testing market ${market.id}: ${market.article.title}`);
    console.log(`Unresolved stakes: ${market.stakes.length}`);
    
    // Manually set outcome to TRUE (admin override)
    console.log('Setting manual outcome to TRUE...');
    await marketService.setMarketOutcome(market.id, true);
    
    // Now resolve the market
    console.log('Attempting to resolve market with manual outcome...');
    await marketService.resolveMarket(market.id);
    console.log('Market resolved successfully!');
    
    // Check results
    const updatedStakes = await prisma.stake.findMany({
      where: {
        marketId: market.id,
        resolved: true
      },
      include: {
        user: {
          select: { username: true, provePoints: true }
        }
      },
      orderBy: { id: 'desc' },
      take: 10
    });
    
    console.log('Recently resolved stakes with manual outcome:');
    updatedStakes.forEach(stake => {
      const winLoss = stake.won === true ? 'WON' : stake.won === false ? 'LOST' : 'REFUNDED';
      console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, ${winLoss}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testClearMarketResolution();
