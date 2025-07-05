const { PrismaClient } = require('./src/prisma/client');
const { StakeService } = require('./src/services/StakeService.ts');

const prisma = new PrismaClient();

async function testWonField() {
  console.log('🧪 Testing won field functionality...\n');

  try {
    // Get a market with stakes
    const market = await prisma.market.findFirst({
      include: {
        stakes: true,
        article: true
      }
    });

    if (!market || market.stakes.length === 0) {
      console.log('❌ No market with stakes found. Please create some stakes first.');
      return;
    }

    console.log(`📊 Testing with market: "${market.article.title}"`);
    console.log(`💰 Found ${market.stakes.length} stakes\n`);

    // Check current state of stakes
    console.log('📋 Current stake states:');
    market.stakes.forEach((stake, index) => {
      console.log(`   ${index + 1}. Stake ID ${stake.id}: resolved=${stake.resolved}, won=${stake.won}, prediction=${stake.prediction ? 'TRUE' : 'FALSE'}`);
    });

    // Test resolving individual stakes
    console.log('\n🎯 Testing individual stake resolution...');
    const stakeService = new StakeService(prisma);
    
    // Find an unresolved stake to test with
    const unresolvedStake = market.stakes.find(s => !s.resolved);
    if (unresolvedStake) {
      console.log(`📝 Resolving stake ${unresolvedStake.id} with outcome TRUE...`);
      await stakeService.resolveStake(unresolvedStake.id, true);
      
      // Check the updated stake
      const updatedStake = await prisma.stake.findUnique({
        where: { id: unresolvedStake.id }
      });
      
      console.log(`✅ Stake ${unresolvedStake.id} updated:`);
      console.log(`   - resolved: ${updatedStake.resolved}`);
      console.log(`   - won: ${updatedStake.won}`);
      console.log(`   - prediction was: ${unresolvedStake.prediction ? 'TRUE' : 'FALSE'}`);
      console.log(`   - outcome was: TRUE`);
      console.log(`   - ${updatedStake.won ? 'CORRECT PREDICTION!' : 'INCORRECT PREDICTION'}`);
    } else {
      console.log('ℹ️ No unresolved stakes found to test individual resolution.');
    }

    console.log('\n✨ Won field test completed!');

  } catch (error) {
    console.error('❌ Error testing won field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWonField();
