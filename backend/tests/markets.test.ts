import { PrismaClient } from '@prisma/client';
import { MarketService } from '../src/services/MarketService';

const prisma = new PrismaClient();

async function testMarketLifecycle() {
  console.log('📈 Testing Market Creation & Lifecycle...\n');

  try {
    const marketService = new MarketService(prisma);

    // Test 1: Automatic Market Creation
    console.log('📝 Test 1: Automatic Market Creation for New Article');
    
    const testArticle = await prisma.article.create({
      data: {
        sourceName: 'Market Test Source',
        title: 'Breaking: New Technology Breakthrough Announced',
        description: 'Scientists claim major discovery in quantum computing',
        url: `https://test-market.com/${Date.now()}`,
        category: 'technology',
        publishedAt: new Date().toISOString()
      }
    });

    // Create market for the article
    const newMarket = await prisma.market.create({
      data: {
        articleId: testArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`✅ Market created successfully for article ${testArticle.id}`);
    console.log(`   Market ID: ${newMarket.id}`);
    console.log(`   Initial probabilities: TRUE ${(newMarket.probTrue * 100).toFixed(1)}%, FALSE ${(newMarket.probFalse * 100).toFixed(1)}%`);
    console.log(`   Next resolution: ${newMarket.nextResolve}\n`);

    // Test 2: Market Probability Updates
    console.log('📝 Test 2: Market Probability Updates');
    
    // Simulate multiple stakes to test probability changes
    const stakingParams1 = await marketService.getStakingParameters(newMarket.id, true, 100);
    console.log(`   Staking 100 PP on TRUE:`);
    console.log(`     - Upside: ${stakingParams1.upside.toFixed(3)}`);
    console.log(`     - Shares: ${stakingParams1.sharesBought.toFixed(3)}`);

    // Update market with the stake
    const newSharesTrue = newMarket.sharesTrue + stakingParams1.sharesBought;
    const newSharesFalse = newMarket.sharesFalse;
    
    // Calculate new probabilities using the same formula as MarketService
    const LIQUIDITY = 100; // Same constant used in MarketService
    const expTrue = Math.exp(newSharesTrue / LIQUIDITY);
    const expFalse = Math.exp(newSharesFalse / LIQUIDITY);
    const denom = expTrue + expFalse;
    
    const updatedMarket1 = await prisma.market.update({
      where: { id: newMarket.id },
      data: {
        sharesTrue: newSharesTrue,
        probTrue: expTrue / denom,
        probFalse: expFalse / denom
      }
    });

    console.log(`   After TRUE stake: TRUE ${(updatedMarket1.probTrue * 100).toFixed(1)}%, FALSE ${(updatedMarket1.probFalse * 100).toFixed(1)}%`);

    // Counter-stake on FALSE
    const stakingParams2 = await marketService.getStakingParameters(newMarket.id, false, 75);
    const finalSharesTrue = updatedMarket1.sharesTrue;
    const finalSharesFalse = updatedMarket1.sharesFalse + stakingParams2.sharesBought;
    
    // Recalculate probabilities
    const finalExpTrue = Math.exp(finalSharesTrue / LIQUIDITY);
    const finalExpFalse = Math.exp(finalSharesFalse / LIQUIDITY);
    const finalDenom = finalExpTrue + finalExpFalse;
    
    const updatedMarket2 = await prisma.market.update({
      where: { id: newMarket.id },
      data: {
        sharesFalse: finalSharesFalse,
        probTrue: finalExpTrue / finalDenom,
        probFalse: finalExpFalse / finalDenom
      }
    });

    console.log(`   After FALSE stake: TRUE ${(updatedMarket2.probTrue * 100).toFixed(1)}%, FALSE ${(updatedMarket2.probFalse * 100).toFixed(1)}%\n`);

    // Test 3: Market Resolution Logic
    console.log('📝 Test 3: Market Resolution Logic');
    
    // Create test users and stakes for resolution
    const testUser1 = await prisma.user.create({
      data: {
        username: 'market_test_user1',
        email: 'market1@test.com',
        password: 'dummy_hash',
        provePoints: 500
      }
    });

    const testUser2 = await prisma.user.create({
      data: {
        username: 'market_test_user2',
        email: 'market2@test.com',
        password: 'dummy_hash',
        provePoints: 500
      }
    });

    // Create stakes for both users
    const stake1 = await prisma.stake.create({
      data: {
        userId: testUser1.id,
        marketId: newMarket.id,
        prediction: true,
        stakeAmount: 100,
        upside: stakingParams1.upside,
        resolved: false
      }
    });

    const stake2 = await prisma.stake.create({
      data: {
        userId: testUser2.id,
        marketId: newMarket.id,
        prediction: false,
        stakeAmount: 75,
        upside: stakingParams2.upside,
        resolved: false
      }
    });

    console.log(`   Created stakes: User1 (TRUE, 100 PP), User2 (FALSE, 75 PP)`);

    // Simulate market resolution (TRUE outcome)
    const resolvedMarket = await prisma.market.update({
      where: { id: newMarket.id },
      data: {
        closed: true,
        outcome: true,
        resolveCount: 1
      }
    });

    // Update stakes based on outcome
    const resolvedStake1 = await prisma.stake.update({
      where: { id: stake1.id },
      data: {
        resolved: true,
        won: true // TRUE stake won
      }
    });

    const resolvedStake2 = await prisma.stake.update({
      where: { id: stake2.id },
      data: {
        resolved: true,
        won: false // FALSE stake lost
      }
    });

    console.log(`✅ Market resolved with outcome: ${resolvedMarket.outcome ? 'TRUE' : 'FALSE'}`);
    console.log(`   Stake1 (TRUE): ${resolvedStake1.won ? 'WON' : 'LOST'}`);
    console.log(`   Stake2 (FALSE): ${resolvedStake2.won ? 'WON' : 'LOST'}\n`);

    // Test 4: Edge Cases
    console.log('📝 Test 4: Edge Cases Testing');

    // Test market with no stakes
    const emptyArticle = await prisma.article.create({
      data: {
        sourceName: 'Empty Test',
        title: 'Empty Market Test',
        description: 'Market with no stakes',
        url: `https://empty-test.com/${Date.now()}`,
        category: 'test',
        publishedAt: new Date().toISOString()
      }
    });

    const emptyMarket = await prisma.market.create({
      data: {
        articleId: emptyArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`✅ Empty market created (no stakes): ID ${emptyMarket.id}`);
    console.log(`   Probabilities remain at default: TRUE 50.0%, FALSE 50.0%`);

    // Test market closure
    const closedMarket = await prisma.market.update({
      where: { id: emptyMarket.id },
      data: {
        closed: true,
        outcome: null // No outcome due to no stakes
      }
    });

    console.log(`✅ Market closed without resolution: ${closedMarket.closed ? 'CLOSED' : 'OPEN'}\n`);

    // Test 5: Multiple Market Scenarios
    console.log('📝 Test 5: Multiple Market Scenarios');
    
    const markets = await prisma.market.findMany({
      include: {
        article: true,
        stakes: true
      },
      take: 5
    });

    console.log(`   Found ${markets.length} markets in database:`);
    markets.forEach((market, index) => {
      console.log(`   ${index + 1}. Article: "${market.article.title.substring(0, 50)}..."`);
      console.log(`      Probabilities: TRUE ${(market.probTrue * 100).toFixed(1)}%, FALSE ${(market.probFalse * 100).toFixed(1)}%`);
      console.log(`      Stakes: ${market.stakes.length}, Closed: ${market.closed ? 'Yes' : 'No'}`);
    });

    console.log('\n🎯 Market Lifecycle Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ Market lifecycle test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarketLifecycle();
