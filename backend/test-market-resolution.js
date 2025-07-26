const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function testMarketResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    // Find a market with unresolved stakes to test
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
    
    // Check current probabilities
    const probabilities = await marketService.getImpliedProbability(market.id);
    console.log(`Current probabilities: TRUE=${(probabilities.probTrue * 100).toFixed(1)}%, FALSE=${(probabilities.probFalse * 100).toFixed(1)}%`);
    
    const isContentious = await marketService.isContentious(market.id);
    console.log(`Is contentious: ${isContentious}`);
    
    // Try to resolve the market
    console.log('Attempting to resolve market...');
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
    
    console.log('Recently resolved stakes:');
    updatedStakes.forEach(stake => {
      console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, won: ${stake.won}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMarketResolution();
