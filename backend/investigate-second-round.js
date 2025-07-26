const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function investigateSecondRoundResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    // Find markets in their 2nd resolution round
    const secondRoundMarkets = await prisma.market.findMany({
      where: {
        resolveCount: 1,
        closed: false
      },
      include: {
        article: true,
        stakes: {
          orderBy: { id: 'desc' },
          take: 10,
          include: {
            user: {
              select: { username: true, provePoints: true }
            }
          }
        }
      },
      take: 3
    });
    
    console.log(`Found ${secondRoundMarkets.length} markets in 2nd resolution round:`);
    
    for (const market of secondRoundMarkets) {
      console.log(`\n=== Market ${market.id}: ${market.article.title} ===`);
      console.log('Market Details:');
      console.log(`- Created: ${market.createdAt}`);
      console.log(`- Last resolve: ${market.lastResolve}`);
      console.log(`- Next resolve: ${market.nextResolve}`);
      console.log(`- Resolve count: ${market.resolveCount}`);
      console.log(`- Outcome: ${market.outcome}`);
      console.log(`- Probability TRUE: ${(market.probTrue * 100).toFixed(1)}%`);
      console.log(`- Probability FALSE: ${(market.probFalse * 100).toFixed(1)}%`);
      
      // Check if market is contentious
      const isContentious = await marketService.isContentious(market.id);
      console.log(`- Is contentious (below 95%): ${isContentious}`);
      
      // Analyze stakes in different periods
      const allStakes = market.stakes;
      const stakesInCurrentPeriod = allStakes.filter(stake => 
        stake.createdAt >= market.lastResolve && stake.createdAt < market.nextResolve
      );
      const unresolvedStakes = allStakes.filter(stake => !stake.resolved);
      const unresolvedInCurrentPeriod = stakesInCurrentPeriod.filter(stake => !stake.resolved);
      
      console.log(`\nStake Analysis:`);
      console.log(`- Total stakes: ${allStakes.length}`);
      console.log(`- Stakes in current period (${market.lastResolve.toISOString().split('T')[0]} to ${market.nextResolve.toISOString().split('T')[0]}): ${stakesInCurrentPeriod.length}`);
      console.log(`- Unresolved stakes total: ${unresolvedStakes.length}`);
      console.log(`- Unresolved stakes in current period: ${unresolvedInCurrentPeriod.length}`);
      
      if (unresolvedStakes.length > 0) {
        console.log('\nUnresolved Stakes:');
        unresolvedStakes.forEach(stake => {
          const inCurrentPeriod = stake.createdAt >= market.lastResolve && stake.createdAt < market.nextResolve;
          console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, ${stake.stakeAmount} PP`);
          console.log(`  Created: ${stake.createdAt.toISOString()}, In current period: ${inCurrentPeriod}`);
        });
      }
      
      // If there are unresolved stakes in current period and market isn't contentious, test resolution
      if (unresolvedInCurrentPeriod.length > 0 && !isContentious) {
        console.log(`\n*** This market has ${unresolvedInCurrentPeriod.length} unresolved stakes in current period and is NOT contentious ***`);
        console.log('This suggests these stakes should be resolvable with winners/losers!');
        
        // Show what would happen if we resolved
        const predictedOutcome = market.probTrue > market.probFalse;
        console.log(`Predicted outcome: ${predictedOutcome ? 'TRUE' : 'FALSE'}`);
        console.log('Stakes that would win:');
        unresolvedInCurrentPeriod.forEach(stake => {
          const wouldWin = stake.prediction === predictedOutcome;
          console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'} -> ${wouldWin ? 'WOULD WIN' : 'WOULD LOSE'}`);
        });
      }
      
      console.log('\n' + '='.repeat(80));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateSecondRoundResolution();
