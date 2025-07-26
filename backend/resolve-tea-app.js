const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');

async function resolveTeaAppMarket() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  
  try {
    const marketId = 194;
    
    console.log('Before resolution:');
    const stakeBefore = await prisma.stake.findUnique({
      where: { id: 3839 },
      include: { user: { select: { username: true, provePoints: true } } }
    });
    console.log(`Stake 3839: ${stakeBefore.user.username}, ${stakeBefore.prediction ? 'TRUE' : 'FALSE'}, resolved: ${stakeBefore.resolved}, won: ${stakeBefore.won}`);
    console.log(`User balance before: ${stakeBefore.user.provePoints} PP`);
    
    // Try to resolve the market
    console.log('\nAttempting to resolve Tea App market...');
    await marketService.resolveMarket(marketId);
    console.log('Market resolved!');
    
    console.log('\nAfter resolution:');
    const stakeAfter = await prisma.stake.findUnique({
      where: { id: 3839 },
      include: { user: { select: { username: true, provePoints: true } } }
    });
    console.log(`Stake 3839: ${stakeAfter.user.username}, ${stakeAfter.prediction ? 'TRUE' : 'FALSE'}, resolved: ${stakeAfter.resolved}, won: ${stakeAfter.won}`);
    console.log(`User balance after: ${stakeAfter.user.provePoints} PP`);
    
    // Check market status
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: { resolveCount: true, closed: true, lastResolve: true, nextResolve: true }
    });
    console.log(`\nMarket status: resolveCount=${market.resolveCount}, closed=${market.closed}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resolveTeaAppMarket();
