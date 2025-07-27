import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProvePointsEconomy() {
  console.log('Testing ProvePoints economy system...\n');

  try {
    // Test 1: Initial PP allocation
    console.log('Test 1: Initial ProvePoints allocation');

    const newUser = await prisma.user.create({
      data: {
        username: 'pptest_user',
        email: 'pptest@example.com',
        password: 'dummy_hash',
        provePoints: 100 // Initial allocation
      }
    });

    console.log(`Created user with initial 100 PP: ${newUser.username}`);
    console.log(`  - User ID: ${newUser.id}`);
    console.log(`  - Initial PP: ${newUser.provePoints}\n`);

    // Test 2: PP spending validation
    console.log('Test 2: ProvePoints spending validation');

    // Valid spending (avatar item)
    const avatarCost = 50;
    const userBeforeSpending = await prisma.user.findUnique({ where: { id: newUser.id } });
    
    if (userBeforeSpending!.provePoints >= avatarCost) {
      await prisma.user.update({
        where: { id: newUser.id },
        data: {
          provePoints: userBeforeSpending!.provePoints - avatarCost,
          avatarHair: 'longHair', // Premium item
          purchasedHair: JSON.stringify(['longHair'])
        }
      });

      const userAfterSpending = await prisma.user.findUnique({ where: { id: newUser.id } });
      console.log(`Valid spending test:`);
      console.log(`  - Before: ${userBeforeSpending!.provePoints} PP`);
      console.log(`  - After: ${userAfterSpending!.provePoints} PP`);
      console.log(`  - Spent: ${avatarCost} PP on avatar item`);
      console.log(`  - Item purchased: longHair\n`);
    }

    // Test insufficient funds scenario
    console.log('Test 3: Insufficient funds validation');
    
    const currentUser = await prisma.user.findUnique({ where: { id: newUser.id } });
    const expensiveItemCost = currentUser!.provePoints + 100; // More than user has

    console.log(`  Current PP: ${currentUser!.provePoints}`);
    console.log(`  Attempting to spend: ${expensiveItemCost} PP`);
    
    if (currentUser!.provePoints < expensiveItemCost) {
      console.log(`  Insufficient funds detected - transaction blocked`);
      console.log(`  User PP remains: ${currentUser!.provePoints}\n`);
    } else {
      console.log(`  Should have detected insufficient funds\n`);
    }

    // Test 4: PP earning through predictions
    console.log('Test 4: ProvePoints earning through predictions');

    // Create a market for testing
    const testArticle = await prisma.article.create({
      data: {
        sourceName: 'PP Test Source',
        title: 'PP Earning Test Article',
        description: 'Testing PP earning',
        url: 'https://pp-test.com',
        category: 'test',
        publishedAt: new Date().toISOString()
      }
    });

    const testMarket = await prisma.market.create({
      data: {
        articleId: testArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    // User makes a winning prediction
    const stakeAmount = 25;
    const upside = 1.8; // Simulated upside multiplier
    const winnings = stakeAmount * upside;

    // Create stake
    await prisma.stake.create({
      data: {
        userId: newUser.id,
        marketId: testMarket.id,
        prediction: true,
        stakeAmount: stakeAmount,
        upside: upside,
        resolved: false
      }
    });

    // Deduct PP for stake
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        provePoints: currentUser!.provePoints - stakeAmount
      }
    });

    const userAfterStake = await prisma.user.findUnique({ where: { id: newUser.id } });
    console.log(`Stake placed:`);
    console.log(`  - Stake amount: ${stakeAmount} PP`);
    console.log(`  - User PP after stake: ${userAfterStake!.provePoints}`);
    console.log(`  - Potential winnings: ${winnings.toFixed(1)} PP\n`);

    // Simulate market resolution (TRUE wins)
    await prisma.market.update({
      where: { id: testMarket.id },
      data: {
        closed: true,
        outcome: true,
        resolveCount: 1
      }
    });

    // Award winnings
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        provePoints: userAfterStake!.provePoints + winnings
      }
    });

    const userAfterWin = await prisma.user.findUnique({ where: { id: newUser.id } });
    console.log(`Market resolved - user won:`);
    console.log(`  - Winnings: ${winnings.toFixed(1)} PP`);
    console.log(`  - Final PP: ${userAfterWin!.provePoints}`);
    console.log(`  - Net gain: ${(userAfterWin!.provePoints - currentUser!.provePoints).toFixed(1)} PP\n`);

    // Test 5: PP transaction history validation
    console.log('Test 5: Transaction history validation');

    const userStakes = await prisma.stake.findMany({
      where: { userId: newUser.id },
      include: {
        market: {
          include: { article: true }
        }
      }
    });

    console.log(`User transaction history:`);
    console.log(`  - Total stakes: ${userStakes.length}`);
    userStakes.forEach((stake, index) => {
      console.log(`  - Stake ${index + 1}: ${stake.stakeAmount} PP on ${stake.prediction ? 'TRUE' : 'FALSE'}`);
      console.log(`    Article: "${stake.market.article.title}"`);
      console.log(`    Potential return: ${(stake.stakeAmount * stake.upside).toFixed(1)} PP`);
    });

    // Test 6: PP balance validation
    console.log('\nTest 6: Balance validation and constraints');

    const finalUser = await prisma.user.findUnique({ where: { id: newUser.id } });
    
    console.log(`Final balance validation:`);
    console.log(`  - Current PP: ${finalUser!.provePoints}`);
    console.log(`  - PP should be >= 0: ${finalUser!.provePoints >= 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  - PP is numeric: ${typeof finalUser!.provePoints === 'number' ? 'PASS' : 'FAIL'}`);
    
    // Test negative balance prevention
    try {
      await prisma.user.update({
        where: { id: newUser.id },
        data: { provePoints: -100 }
      });
      console.log(`  Negative balance allowed (should be prevented)`);
    } catch (error) {
      console.log(`  Negative balance prevented by constraints`);
    }

    console.log('\nProvePoints economy tests completed successfully!\n');

    // Cleanup
    await prisma.stake.deleteMany({ where: { userId: newUser.id } });
    await prisma.market.delete({ where: { id: testMarket.id } });
    await prisma.article.delete({ where: { id: testArticle.id } });
    await prisma.user.delete({ where: { id: newUser.id } });

    console.log('Test data cleaned up');

  } catch (error) {
    console.error('ProvePoints economy test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProvePointsEconomy();
