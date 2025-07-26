const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function testTeslaMarketResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    const marketId = 197; // Tesla market
    
    console.log('=== Testing Tesla Market Resolution ===');
    
    // Check the problematic stake before resolution
    const stakeBefore = await prisma.stake.findUnique({
      where: { id: 3843 },
      include: { 
        user: { select: { username: true, provePoints: true } },
        market: { 
          select: { 
            probTrue: true, 
            probFalse: true,
            lastResolve: true,
            nextResolve: true,
            resolveCount: true
          } 
        }
      }
    });
    
    console.log('Stake 3843 before resolution:');
    console.log(`- User: ${stakeBefore.user.username}`);
    console.log(`- Prediction: ${stakeBefore.prediction ? 'TRUE' : 'FALSE'}`);
    console.log(`- Amount: ${stakeBefore.stakeAmount} PP`);
    console.log(`- Resolved: ${stakeBefore.resolved}`);
    console.log(`- Won: ${stakeBefore.won}`);
    console.log(`- Created: ${stakeBefore.createdAt}`);
    console.log(`- User balance: ${stakeBefore.user.provePoints} PP`);
    
    console.log('\nMarket timing:');
    console.log(`- Last resolve: ${stakeBefore.market.lastResolve}`);
    console.log(`- Next resolve: ${stakeBefore.market.nextResolve}`);
    console.log(`- Resolve count: ${stakeBefore.market.resolveCount}`);
    
    const inCurrentPeriod = stakeBefore.createdAt >= stakeBefore.market.lastResolve && 
                           stakeBefore.createdAt < stakeBefore.market.nextResolve;
    console.log(`- Stake in current period: ${inCurrentPeriod}`);
    
    console.log('\nMarket probabilities:');
    console.log(`- TRUE: ${(stakeBefore.market.probTrue * 100).toFixed(1)}%`);
    console.log(`- FALSE: ${(stakeBefore.market.probFalse * 100).toFixed(1)}%`);
    
    // Check if contentious
    const isContentious = await marketService.isContentious(marketId);
    console.log(`- Is contentious: ${isContentious}`);
    
    // Try to resolve the market
    console.log('\nAttempting to resolve Tesla market...');
    await marketService.resolveMarket(marketId);
    console.log('Market resolved!');
    
    // Check the stake after resolution
    const stakeAfter = await prisma.stake.findUnique({
      where: { id: 3843 },
      include: { user: { select: { provePoints: true } } }
    });
    
    console.log('\nStake 3843 after resolution:');
    console.log(`- Resolved: ${stakeAfter.resolved}`);
    console.log(`- Won: ${stakeAfter.won}`);
    console.log(`- User balance: ${stakeAfter.user.provePoints} PP`);
    
    if (stakeAfter.resolved === stakeBefore.resolved && stakeAfter.won === stakeBefore.won) {
      console.log('\n*** PROBLEM CONFIRMED: Stake was NOT processed during resolution! ***');
      console.log('This stake should have been resolved as a winner since:');
      console.log('- Market probability is 99.7% TRUE (above 95% confidence)');
      console.log('- Stake prediction is TRUE');
      console.log('- But it was created outside the current resolution period');
    } else {
      console.log('\nStake was successfully processed!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTeslaMarketResolution();
