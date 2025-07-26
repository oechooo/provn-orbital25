const { PrismaClient } = require('@prisma/client');

async function investigateTeaAppMarket() {
  const prisma = new PrismaClient();
  
  try {
    // Find the Tea App article and its market
    const teaAppMarket = await prisma.market.findFirst({
      where: {
        article: {
          title: {
            contains: 'Tea app hacked'
          }
        }
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
      }
    });
    
    if (!teaAppMarket) {
      console.log('Tea App market not found');
      return;
    }
    
    console.log(`Tea App Market ${teaAppMarket.id}: ${teaAppMarket.article.title}`);
    console.log('\nMarket Details:');
    console.log(`- Created: ${teaAppMarket.createdAt}`);
    console.log(`- Last resolve: ${teaAppMarket.lastResolve}`);
    console.log(`- Next resolve: ${teaAppMarket.nextResolve}`);
    console.log(`- Resolve count: ${teaAppMarket.resolveCount}`);
    console.log(`- Outcome: ${teaAppMarket.outcome}`);
    console.log(`- Closed: ${teaAppMarket.closed}`);
    console.log(`- Probability TRUE: ${(teaAppMarket.probTrue * 100).toFixed(1)}%`);
    console.log(`- Probability FALSE: ${(teaAppMarket.probFalse * 100).toFixed(1)}%`);
    
    console.log('\nLatest Stakes:');
    teaAppMarket.stakes.forEach(stake => {
      const inCurrentPeriod = stake.createdAt >= teaAppMarket.lastResolve && stake.createdAt < teaAppMarket.nextResolve;
      const status = stake.resolved ? 
        (stake.won === true ? 'WON' : stake.won === false ? 'LOST' : 'REFUNDED') : 
        'PENDING';
      
      console.log(`- Stake ${stake.id}: ${stake.user.username}, ${stake.prediction ? 'TRUE' : 'FALSE'}, ${stake.stakeAmount} PP, ${status}`);
      console.log(`  Created: ${stake.createdAt}, In current period: ${inCurrentPeriod}`);
    });
    
    // Check if there are any unresolved stakes in the current resolution period
    const unresolvedInPeriod = teaAppMarket.stakes.filter(stake => 
      !stake.resolved && 
      stake.createdAt >= teaAppMarket.lastResolve && 
      stake.createdAt < teaAppMarket.nextResolve
    );
    
    console.log(`\nUnresolved stakes in current period: ${unresolvedInPeriod.length}`);
    
    // Check confidence threshold
    const { MarketService } = require('./dist/services/MarketService');
    const marketService = new MarketService(prisma);
    
    const isContentious = await marketService.isContentious(teaAppMarket.id);
    console.log(`\nIs market contentious (below 95% confidence): ${isContentious}`);
    
    if (teaAppMarket.probTrue >= 0.95 || teaAppMarket.probFalse >= 0.95) {
      console.log('Market has sufficient confidence for auto-resolution');
      const predictedOutcome = teaAppMarket.probTrue > teaAppMarket.probFalse;
      console.log(`Predicted outcome would be: ${predictedOutcome ? 'TRUE' : 'FALSE'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateTeaAppMarket();
