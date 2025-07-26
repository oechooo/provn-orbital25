const { PrismaClient } = require('@prisma/client');

async function testStakes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking existing stakes...');
    const stakes = await prisma.stake.findMany({
      include: {
        market: {
          include: {
            article: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            provePoints: true
          }
        }
      }
    });
    
    console.log(`Found ${stakes.length} stakes:`);
    stakes.forEach(stake => {
      console.log(`- Stake ${stake.id}: User ${stake.user.username} (${stake.user.provePoints} PP), ${stake.stakeAmount} PP on ${stake.prediction ? 'TRUE' : 'FALSE'}, resolved: ${stake.resolved}, won: ${stake.won}`);
    });
    
    console.log('\nChecking markets...');
    const markets = await prisma.market.findMany({
      include: {
        article: true
      }
    });
    
    markets.forEach(market => {
      console.log(`- Market ${market.id}: ${market.article.title}, outcome: ${market.outcome}, closed: ${market.closed}, resolveCount: ${market.resolveCount}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStakes();
