const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function testActiveMarketResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    const marketId = 196;
    
    console.log(`Testing active market ${marketId}`);
    
    // Set manual outcome to TRUE
    console.log('Setting manual outcome to TRUE...');
    await marketService.setMarketOutcome(marketId, true);
    
    // Get stakes before resolution
    const stakesBefore = await prisma.stake.findMany({
      where: { 
        marketId,
        resolved: false 
      },
      include: {
        user: { select: { username: true, provePoints: true } }
      },
      take: 5
    });
    
    console.log('Stakes before resolution:');
    stakesBefore.forEach(stake => {
      console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, ${stake.stakeAmount} PP`);
    });
    
    // Resolve the market
    console.log('\nResolving market...');
    await marketService.resolveMarket(marketId);
    console.log('Market resolved successfully!');
    
    // Check results
    const stakesAfter = await prisma.stake.findMany({
      where: { 
        marketId,
        id: { in: stakesBefore.map(s => s.id) }
      },
      include: {
        user: { select: { username: true, provePoints: true } }
      }
    });
    
    console.log('\nStakes after resolution:');
    stakesAfter.forEach(stake => {
      const result = stake.won === true ? 'WON' : stake.won === false ? 'LOST' : 'REFUNDED';
      console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, ${result}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testActiveMarketResolution();
