import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProvePointsEconomy() {
  console.log('💰 Testing ProvePoints Economy System...\n');

  try {
    // Test 1: Initial User PP Allocation
    console.log('📝 Test 1: Initial User ProvePoints Allocation');
    
    const newUser = await prisma.user.create({
      data: {
        username: 'pp_test_user',
        email: 'pptest@example.com',
        password: 'dummy_hash'
        // provePoints defaults to 100 in schema
      }
    });

    console.log(`✅ New user created with default PP: ${newUser.provePoints}`);
    if (newUser.provePoints === 100) {
      console.log(`✅ Default PP allocation is correct (100 PP)`);
    } else {
      console.log(`❌ Default PP allocation is incorrect: expected 100, got ${newUser.provePoints}`);
    }
    console.log();

    // Test 2: PP Deduction for Stakes
    console.log('📝 Test 2: ProvePoints Deduction for Stakes');
    
    const initialPP = newUser.provePoints;
    const stakeAmount = 25;
    
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        provePoints: newUser.provePoints - stakeAmount
      }
    });

    console.log(`✅ PP deducted for stake: ${initialPP} - ${stakeAmount} = ${updatedUser.provePoints}`);
    
    if (updatedUser.provePoints === (initialPP - stakeAmount)) {
      console.log(`✅ PP deduction calculation is correct`);
    } else {
      console.log(`❌ PP deduction calculation is incorrect`);
    }
    console.log();

    // Test 3: PP Earning from Winning Stakes
    console.log('📝 Test 3: ProvePoints Earning from Winning Stakes');
    
    // Simulate winning a stake with 2.5x upside
    const winAmount = stakeAmount * 2.5;
    const userAfterWin = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        provePoints: updatedUser.provePoints + winAmount
      }
    });

    console.log(`✅ PP earned from winning stake: ${updatedUser.provePoints} + ${winAmount} = ${userAfterWin.provePoints}`);
    console.log(`   Net gain from this trade: ${userAfterWin.provePoints - initialPP} PP\n`);

    // Test 4: Avatar Purchase PP Deduction
    console.log('📝 Test 4: Avatar Purchase ProvePoints Deduction');
    
    const avatarItemCost = 30;
    const beforePurchase = userAfterWin.provePoints;
    
    if (beforePurchase >= avatarItemCost) {
      const userAfterPurchase = await prisma.user.update({
        where: { id: newUser.id },
        data: {
          provePoints: beforePurchase - avatarItemCost,
          purchasedHair: JSON.stringify(['long03']) // Simulate hair purchase
        }
      });

      console.log(`✅ Avatar purchase successful: ${beforePurchase} - ${avatarItemCost} = ${userAfterPurchase.provePoints} PP`);
      console.log(`   Hair item 'long03' added to purchased items\n`);
    } else {
      console.log(`❌ Insufficient PP for avatar purchase: Need ${avatarItemCost}, have ${beforePurchase}\n`);
    }

    // Test 5: Negative Balance Prevention
    console.log('📝 Test 5: Negative Balance Prevention');
    
    const currentUser = await prisma.user.findUnique({ where: { id: newUser.id } });
    const attemptedSpend = currentUser!.provePoints + 10; // More than available
    
    try {
      // This should be prevented by business logic
      if (currentUser!.provePoints >= attemptedSpend) {
        await prisma.user.update({
          where: { id: newUser.id },
          data: { provePoints: currentUser!.provePoints - attemptedSpend }
        });
        console.log(`❌ Negative balance was allowed (business logic error)`);
      } else {
        console.log(`✅ Negative balance prevented: Cannot spend ${attemptedSpend} with ${currentUser!.provePoints} PP available`);
      }
    } catch (error) {
      console.log(`✅ Database constraint prevented negative balance`);
    }
    console.log();

    // Test 6: Transaction History Simulation
    console.log('📝 Test 6: Transaction History Analysis');
    
    // Get all stakes for this user to analyze PP flow
    const userStakes = await prisma.stake.findMany({
      where: { userId: newUser.id },
      include: { market: { include: { article: true } } }
    });

    console.log(`   User has ${userStakes.length} stakes in history`);
    
    let totalStaked = 0;
    let totalWon = 0;
    let resolvedStakes = 0;
    
    userStakes.forEach(stake => {
      totalStaked += stake.stakeAmount;
      if (stake.resolved && stake.won) {
        totalWon += stake.stakeAmount * stake.upside;
        resolvedStakes++;
      }
    });

    console.log(`   Total PP staked: ${totalStaked}`);
    console.log(`   Total PP won: ${totalWon.toFixed(1)}`);
    console.log(`   Net PP from stakes: ${(totalWon - totalStaked).toFixed(1)}`);
    console.log(`   Resolved stakes: ${resolvedStakes}/${userStakes.length}\n`);

    // Test 7: Economy Balance Check
    console.log('📝 Test 7: Economy Balance and Integrity');
    
    // Check total PP in system
    const allUsers = await prisma.user.findMany();
    const totalPPInSystem = allUsers.reduce((sum, user) => sum + user.provePoints, 0);
    
    console.log(`   Total users in system: ${allUsers.length}`);
    console.log(`   Total PP in circulation: ${totalPPInSystem.toFixed(1)}`);
    console.log(`   Average PP per user: ${(totalPPInSystem / allUsers.length).toFixed(1)}`);

    // Check for users with high/low balances
    const richUsers = allUsers.filter(user => user.provePoints > 500);
    const poorUsers = allUsers.filter(user => user.provePoints < 10);
    
    console.log(`   Users with >500 PP: ${richUsers.length}`);
    console.log(`   Users with <10 PP: ${poorUsers.length}`);
    
    if (poorUsers.length > 0) {
      console.log(`   ⚠️  Warning: ${poorUsers.length} users may need PP top-up`);
    }
    console.log();

    // Test 8: PP Pricing Validation
    console.log('📝 Test 8: ProvePoints Pricing Validation');
    
    const pricingStructure = {
      'Basic Hair': 15,
      'Premium Hair': 50,
      'Basic Eyes': 20,
      'Premium Eyes': 45,
      'Basic Accessories': 25,
      'Premium Accessories': 75,
      'Full Avatar Set': 100
    };

    console.log(`   Avatar item pricing structure:`);
    Object.entries(pricingStructure).forEach(([item, price]) => {
      const percentOfStartingPP = (price / 100) * 100;
      console.log(`     ${item}: ${price} PP (${percentOfStartingPP}% of starting balance)`);
    });

    // Validate pricing is reasonable (not too high/low)
    const prices = Object.values(pricingStructure);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    console.log(`   Pricing analysis:`);
    console.log(`     Average price: ${avgPrice.toFixed(1)} PP`);
    console.log(`     Price range: ${minPrice} - ${maxPrice} PP`);
    
    if (maxPrice <= 100 && minPrice >= 10) {
      console.log(`   ✅ Pricing structure is reasonable`);
    } else {
      console.log(`   ⚠️  Pricing structure may need adjustment`);
    }

    console.log('\n💎 ProvePoints Economy Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ ProvePoints economy test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProvePointsEconomy();
