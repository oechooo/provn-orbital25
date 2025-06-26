const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStakeCreation() {
  console.log('🧪 Testing stake creation and market updates...\n');

  try {
    // First, get a market to test with
    const market = await prisma.market.findFirst({
      include: {
        article: true,
        stakes: true
      }
    });

    if (!market) {
      console.log('❌ No markets found. Creating a test market...');
      
      // Create test article first
      const article = await prisma.article.create({
        data: {
          sourceName: 'Test Source',
          title: 'Test Article for Stake Testing',
          description: 'This is a test article',
          url: 'https://test.com',
          category: 'test',
          publishedAt: new Date().toISOString()
        }
      });

      // Create market for the article
      const newMarket = await prisma.market.create({
        data: {
          articleId: article.id,
          probTrue: 0.5,
          probFalse: 0.5,
          sharesTrue: 0,
          sharesFalse: 0,
          nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }
      });

      console.log(`✅ Created test market with ID: ${newMarket.id}`);
      return;
    }

    console.log(`📊 Testing with market ID: ${market.id}`);
    console.log(`📰 Article: "${market.article.title}"`);
    console.log(`📈 Initial probabilities: TRUE ${(market.probTrue * 100).toFixed(1)}%, FALSE ${(market.probFalse * 100).toFixed(1)}%`);
    console.log(`📦 Initial shares: TRUE ${market.sharesTrue}, FALSE ${market.sharesFalse}`);
    console.log(`💰 Existing stakes: ${market.stakes.length}\n`);

    // Get a test user
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log('👤 No users found. Creating test user...');
      user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: 'dummy_hash',
          provePoints: 1000
        }
      });
      console.log(`✅ Created test user with ${user.provePoints} PP\n`);
    } else {
      console.log(`👤 Using user: ${user.username} (${user.provePoints} PP)\n`);
    }

    // Test stake creation via API endpoint simulation
    console.log('🎯 Testing stake creation...');
    
    const stakeAmount = 50;
    const prediction = true; // Betting TRUE
    
    console.log(`📝 Creating ${prediction ? 'TRUE' : 'FALSE'} stake of ${stakeAmount} PP...`);

    // Import the services directly to test
    const { MarketService } = require('../src/services/MarketService.ts');
    const { StakeService } = require('../src/services/StakeService.ts');
    
    const marketService = new MarketService(prisma);
    const stakeService = new StakeService(prisma);

    // Get staking parameters first
    const stakingParams = await marketService.getStakingParameters(market.id, prediction, stakeAmount);
    console.log(`📊 Staking parameters:`);
    console.log(`   - Upside multiplier: ${stakingParams.upside.toFixed(3)}`);
    console.log(`   - Shares to buy: ${stakingParams.sharesBought.toFixed(3)}`);
    console.log(`   - Potential winnings: ${(stakeAmount * stakingParams.upside).toFixed(1)} PP`);

    // Create the stake
    const stake = await stakeService.createStake(user.id, market.id, prediction, stakeAmount);
    console.log(`✅ Stake created with ID: ${stake.id}\n`);

    // Check updated market state
    const updatedMarket = await prisma.market.findUnique({
      where: { id: market.id },
      include: {
        stakes: true
      }
    });

    console.log('📊 Market state after stake:');
    console.log(`   - New probabilities: TRUE ${(updatedMarket.probTrue * 100).toFixed(1)}%, FALSE ${(updatedMarket.probFalse * 100).toFixed(1)}%`);
    console.log(`   - New shares: TRUE ${updatedMarket.sharesTrue.toFixed(3)}, FALSE ${updatedMarket.sharesFalse.toFixed(3)}`);
    console.log(`   - Total stakes: ${updatedMarket.stakes.length}`);

    // Check user points
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    console.log(`💰 User PP after stake: ${updatedUser.provePoints} (was ${user.provePoints})\n`);

    // Verify probability change
    const probChangeTrue = updatedMarket.probTrue - market.probTrue;
    const probChangeFalse = updatedMarket.probFalse - market.probFalse;
    
    if (prediction && probChangeTrue > 0) {
      console.log(`✅ TRUE probability increased by ${(probChangeTrue * 100).toFixed(2)}% as expected`);
    } else if (!prediction && probChangeFalse > 0) {
      console.log(`✅ FALSE probability increased by ${(probChangeFalse * 100).toFixed(2)}% as expected`);
    } else {
      console.log(`❌ Expected probability change not detected`);
    }

    // Verify shares were added
    const sharesChangeTrue = updatedMarket.sharesTrue - market.sharesTrue;
    const sharesChangeFalse = updatedMarket.sharesFalse - market.sharesFalse;
    
    if (prediction && sharesChangeTrue > 0) {
      console.log(`✅ TRUE shares increased by ${sharesChangeTrue.toFixed(3)} as expected`);
    } else if (!prediction && sharesChangeFalse > 0) {
      console.log(`✅ FALSE shares increased by ${sharesChangeFalse.toFixed(3)} as expected`);
    } else {
      console.log(`❌ Expected shares change not detected`);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStakeCreation();
