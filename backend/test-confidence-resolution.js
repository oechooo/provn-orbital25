const { PrismaClient } = require('@prisma/client');
const { MarketService } = require('./dist/services/MarketService');
const { StakeService } = require('./dist/services/StakeService');

async function testConfidenceThresholdResolution() {
  const prisma = new PrismaClient();
  const marketService = new MarketService(prisma);
  const stakeService = new StakeService(prisma);
  
  try {
    // Find a market that's still active (resolveCount = 0)
    const activeMarket = await prisma.market.findFirst({
      where: {
        resolveCount: 0,
        closed: false
      },
      include: {
        article: true,
        stakes: true
      }
    });
    
    if (!activeMarket) {
      console.log('No active markets found');
      return;
    }
    
    console.log(`Testing with market ${activeMarket.id}: ${activeMarket.article.title}`);
    console.log(`Current probabilities: TRUE=${(activeMarket.probTrue * 100).toFixed(1)}%, FALSE=${(activeMarket.probFalse * 100).toFixed(1)}%`);
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log(`Admin user balance before: ${adminUser.provePoints} PP`);
    
    // Make a large stake on TRUE to push probability above 95%
    console.log('\nMaking large stake on TRUE to push above confidence threshold...');
    const stakeAmount = Math.min(5000, Math.floor(adminUser.provePoints * 0.9)); // Use 90% of available points
    console.log(`Using stake amount: ${stakeAmount} PP`);
    const largeStake = await stakeService.createStake(adminUser.id, activeMarket.id, true, stakeAmount);
    console.log(`Created stake ${largeStake.id}: ${stakeAmount} PP on TRUE`);
    
    // Check new probabilities
    const updatedMarket = await prisma.market.findUnique({
      where: { id: activeMarket.id }
    });
    console.log(`New probabilities: TRUE=${(updatedMarket.probTrue * 100).toFixed(1)}%, FALSE=${(updatedMarket.probFalse * 100).toFixed(1)}%`);
    
    // Check if it's above confidence threshold
    const isContentious = await marketService.isContentious(activeMarket.id);
    console.log(`Is contentious (below 95%): ${isContentious}`);
    
    if (!isContentious) {
      console.log('\nMarket is now above confidence threshold! Attempting resolution...');
      
      // Check stake before resolution
      const stakeBefore = await prisma.stake.findUnique({
        where: { id: largeStake.id },
        include: { user: { select: { provePoints: true } } }
      });
      console.log(`Stake before resolution: resolved=${stakeBefore.resolved}, won=${stakeBefore.won}`);
      console.log(`User balance before resolution: ${stakeBefore.user.provePoints} PP`);
      
      // Resolve the market
      await marketService.resolveMarket(activeMarket.id);
      console.log('Market resolved!');
      
      // Check stake after resolution
      const stakeAfter = await prisma.stake.findUnique({
        where: { id: largeStake.id },
        include: { user: { select: { provePoints: true } } }
      });
      console.log(`Stake after resolution: resolved=${stakeAfter.resolved}, won=${stakeAfter.won}`);
      console.log(`User balance after resolution: ${stakeAfter.user.provePoints} PP`);
      
      if (stakeAfter.won === true) {
        const winnings = largeStake.stakeAmount * largeStake.upside;
        console.log(`Expected winnings: ${winnings} PP`);
      }
    } else {
      console.log('Market is still contentious even after large stake');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConfidenceThresholdResolution();
