const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function testFixedResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    // Find a market with unresolved stakes that's above confidence threshold
    const marketsWithUnresolvedStakes = await prisma.market.findMany({
      where: {
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
          }
        },
        article: true
      },
      take: 3
    });
    
    console.log('Testing fixed resolution logic...\n');
    
    for (const market of marketsWithUnresolvedStakes) {
      console.log(`Market ${market.id}: ${market.article.title}`);
      console.log(`Probabilities: TRUE=${(market.probTrue * 100).toFixed(1)}%, FALSE=${(market.probFalse * 100).toFixed(1)}%`);
      
      const isContentious = await marketService.isContentious(market.id);
      console.log(`Contentious: ${isContentious}`);
      console.log(`Unresolved stakes: ${market.stakes.length}`);
      
      if (!isContentious && market.stakes.length > 0) {
        console.log('\n*** This market should resolve with winners/losers! Testing...***');
        
        // Show stakes before
        console.log('Stakes before resolution:');
        market.stakes.forEach(stake => {
          console.log(`- Stake ${stake.id}: ${stake.prediction ? 'TRUE' : 'FALSE'}, ${stake.stakeAmount} PP`);
        });
        
        // Get user balances before
        const usersBefore = await prisma.user.findMany({
          where: {
            id: { in: market.stakes.map(s => s.userId) }
          },
          select: { id: true, username: true, provePoints: true }
        });
        
        console.log('\nUser balances before:');
        usersBefore.forEach(user => {
          console.log(`- ${user.username}: ${user.provePoints.toFixed(2)} PP`);
        });
        
        // Resolve the market
        console.log('\nResolving market...');
        await marketService.resolveMarket(market.id);
        
        // Check results
        const resolvedStakes = await prisma.stake.findMany({
          where: {
            id: { in: market.stakes.map(s => s.id) }
          },
          include: {
            user: { select: { username: true, provePoints: true } }
          }
        });
        
        console.log('\nStakes after resolution:');
        resolvedStakes.forEach(stake => {
          const result = stake.won === true ? 'WON' : stake.won === false ? 'LOST' : 'REFUNDED';
          console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'} -> ${result}`);
        });
        
        console.log('\nUser balances after:');
        resolvedStakes.forEach(stake => {
          console.log(`- ${stake.user.username}: ${stake.user.provePoints.toFixed(2)} PP`);
        });
        
        break; // Test just one market
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedResolution();
