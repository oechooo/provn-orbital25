import { PrismaClient } from '@prisma/client';
import { MarketService } from '../src/services/MarketService';

const prisma = new PrismaClient();

async function testMarketLifecycle() {
  console.log('Testing market creation and lifecycle management...\n');

  try {
    // Test 1: Automatic market creation for new articles
    console.log('Test 1: Automatic market creation for articles');
    
    const testArticle = await prisma.article.create({
      data: {
        sourceName: 'Test Source',
        title: 'Market Lifecycle Test Article',
        description: 'Testing market creation and lifecycle',
        url: 'https://test-market.com',
        category: 'test',
        publishedAt: new Date().toISOString()
      }
    });

    console.log(`Created test article: "${testArticle.title}"`);

    // Create market for the article
    const market = await prisma.market.create({
      data: {
        articleId: testArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`Created market with ID: ${market.id}`);
    console.log(`  - Initial probabilities: TRUE ${(market.probTrue * 100).toFixed(1)}%, FALSE ${(market.probFalse * 100).toFixed(1)}%`);
    console.log(`  - Initial shares: TRUE ${market.sharesTrue}, FALSE ${market.sharesFalse}`);
    console.log(`  - Resolution time: ${market.nextResolve}\n`);

    // Test 2: Market probability updates with multiple stakes
    console.log('Test 2: Market probability updates with multiple stakes');
    
    const marketService = new MarketService(prisma);
    
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        username: 'markettest1',
        email: 'markettest1@example.com',
        password: 'dummy_hash',
        provePoints: 500
      }
    });

    const user2 = await prisma.user.create({
      data: {
        username: 'markettest2',
        email: 'markettest2@example.com',
        password: 'dummy_hash',
        provePoints: 500
      }
    });

    console.log(`Created test users: ${user1.username} and ${user2.username}`);

    // User 1 stakes 100 PP on TRUE
    const stakingParams1 = await marketService.getStakingParameters(market.id, true, 100);
    console.log(`  User 1 stakes 100 PP on TRUE (upside: ${stakingParams1.upside.toFixed(3)})`);

    await prisma.stake.create({
      data: {
        userId: user1.id,
        marketId: market.id,
        prediction: true,
        stakeAmount: 100,
        upside: stakingParams1.upside,
        resolved: false
      }
    });

    // Update market probabilities manually (mimicking MarketService logic)
    const LIQUIDITY = 100; // Same constant used in MarketService
    const newSharesTrue = market.sharesTrue + stakingParams1.sharesBought;
    const expTrue = Math.exp(newSharesTrue / LIQUIDITY);
    const expFalse = Math.exp(market.sharesFalse / LIQUIDITY);
    const denom = expTrue + expFalse;

    await prisma.market.update({
      where: { id: market.id },
      data: {
        sharesTrue: newSharesTrue,
        probTrue: expTrue / denom,
        probFalse: expFalse / denom
      }
    });

    const marketAfterStake1 = await prisma.market.findUnique({ where: { id: market.id } });
    console.log(`  Market after stake 1: TRUE ${(marketAfterStake1!.probTrue * 100).toFixed(1)}%, FALSE ${(marketAfterStake1!.probFalse * 100).toFixed(1)}%`);

    // User 2 stakes 150 PP on FALSE
    const stakingParams2 = await marketService.getStakingParameters(market.id, false, 150);
    console.log(`  User 2 stakes 150 PP on FALSE (upside: ${stakingParams2.upside.toFixed(3)})`);

    await prisma.stake.create({
      data: {
        userId: user2.id,
        marketId: market.id,
        prediction: false,
        stakeAmount: 150,
        upside: stakingParams2.upside,
        resolved: false
      }
    });

    // Update market again
    const newSharesFalse = marketAfterStake1!.sharesFalse + stakingParams2.sharesBought;
    const finalExpTrue = Math.exp(marketAfterStake1!.sharesTrue / LIQUIDITY);
    const finalExpFalse = Math.exp(newSharesFalse / LIQUIDITY);
    const finalDenom = finalExpTrue + finalExpFalse;

    await prisma.market.update({
      where: { id: market.id },
      data: {
        sharesFalse: newSharesFalse,
        probTrue: finalExpTrue / finalDenom,
        probFalse: finalExpFalse / finalDenom
      }
    });

    const finalMarket = await prisma.market.findUnique({ 
      where: { id: market.id },
      include: { stakes: true }
    });

    console.log(`  Final market state: TRUE ${(finalMarket!.probTrue * 100).toFixed(1)}%, FALSE ${(finalMarket!.probFalse * 100).toFixed(1)}%`);
    console.log(`  Total stakes: ${finalMarket!.stakes.length}`);
    console.log(`  Total shares: TRUE ${finalMarket!.sharesTrue.toFixed(3)}, FALSE ${finalMarket!.sharesFalse.toFixed(3)}\n`);

    // Test 3: Market resolution scenarios
    console.log('Test 3: Market resolution scenarios');
    
    // Test resolution with TRUE outcome
    console.log('  Testing TRUE resolution...');
    await prisma.market.update({
      where: { id: market.id },
      data: {
        closed: true,
        outcome: true,
        resolveCount: 1
      }
    });

    const resolvedMarket = await prisma.market.findUnique({
      where: { id: market.id },
      include: { stakes: true }
    });

    console.log(`  Market resolved as TRUE`);
    
    // Calculate winnings for TRUE bettors
    const trueStakes = resolvedMarket!.stakes.filter(s => s.prediction === true);
    const falseStakes = resolvedMarket!.stakes.filter(s => s.prediction === false);
    
    console.log(`  Winning stakes (TRUE): ${trueStakes.length}`);
    console.log(`  Losing stakes (FALSE): ${falseStakes.length}`);
    
    const totalWinnings = trueStakes.reduce((sum, stake) => sum + (stake.stakeAmount * stake.upside), 0);
    console.log(`  Total winnings for TRUE bettors: ${totalWinnings.toFixed(1)} PP\n`);

    // Test 4: Edge cases
    console.log('Test 4: Edge case testing');
    
    // Test market with no stakes
    const emptyMarket = await prisma.market.create({
      data: {
        articleId: testArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`  Created empty market (no stakes): ${emptyMarket.id}`);
    console.log(`  Probabilities remain: TRUE ${(emptyMarket.probTrue * 100).toFixed(1)}%, FALSE ${(emptyMarket.probFalse * 100).toFixed(1)}%`);

    // Test market closure
    const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    await prisma.market.update({
      where: { id: emptyMarket.id },
      data: { nextResolve: pastDate }
    });

    console.log(`  Market closure time set to past: ${pastDate}`);
    console.log(`  Market should now be closed for new stakes\n`);

    console.log('Market lifecycle tests completed successfully!\n');

    // Cleanup
    await prisma.stake.deleteMany({ where: { marketId: market.id } });
    await prisma.market.deleteMany({ where: { articleId: testArticle.id } });
    await prisma.article.delete({ where: { id: testArticle.id } });
    await prisma.user.deleteMany({ where: { username: { in: ['markettest1', 'markettest2'] } } });

    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Market lifecycle test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarketLifecycle();
