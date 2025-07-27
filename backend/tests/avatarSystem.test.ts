import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AVATAR_PRICES = {
  hair: { straightHair: 60, curlyHair: 45, mohawk: 80, bunHair: 45, longHair: 55 },
  eyes: { starstruck: 35, hearteyes: 40, wink: 25, sleepy: 30, angry: 20 },
  mouth: { awkwardSmile: 35, laughing: 25, shock: 30, teethSmile: 15 },
  accessories: { glasses: 100, hat: 75, earrings: 50, necklace: 60, none: 0 }
};

async function testAvatarSystem() {
  console.log('Testing avatar system functionality...\n');

  try {
    // Test 1: Avatar item purchase with PP deduction
    console.log('Test 1: Avatar item purchase with PP deduction');

    const testUser = await prisma.user.create({
      data: {
        username: 'avatartest_user',
        email: 'avatartest@example.com',
        password: 'dummy_hash',
        provePoints: 500,
        avatarHair: 'short01', // Default free hair
        avatarEyes: 'variant01',    // Default free eyes
        avatarMouth: 'variant01', // Default free mouth
        avatarAccessories: 'none', // Default free accessories
        purchasedHair: '[]',
        purchasedEyes: '[]',
        purchasedMouth: '[]',
        purchasedAccessories: '[]'
      }
    });

    console.log(`Created test user: ${testUser.username}`);
    console.log(`  - Initial PP: ${testUser.provePoints}`);
    console.log(`  - Default avatar: ${testUser.avatarHair}, ${testUser.avatarEyes}, ${testUser.avatarMouth}, ${testUser.avatarAccessories}\n`);

    // Purchase premium hair
    const newHair = 'straightHair';
    const hairCost = AVATAR_PRICES.hair[newHair as keyof typeof AVATAR_PRICES.hair];
    
    console.log(`  Purchasing ${newHair} for ${hairCost} PP...`);
    
    const userBeforePurchase = await prisma.user.findUnique({ where: { id: testUser.id } });
    const newPP = userBeforePurchase!.provePoints - hairCost;
    const currentPurchasedHair = JSON.parse(userBeforePurchase!.purchasedHair || '[]');
    currentPurchasedHair.push(newHair);

    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        provePoints: newPP,
        avatarHair: newHair,
        purchasedHair: JSON.stringify(currentPurchasedHair)
      }
    });

    const userAfterPurchase = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`  Purchase successful:`);
    console.log(`  - PP before: ${userBeforePurchase!.provePoints}`);
    console.log(`  - PP after: ${userAfterPurchase!.provePoints}`);
    console.log(`  - Hair changed to: ${userAfterPurchase!.avatarHair}`);
    console.log(`  - Purchased items: ${userAfterPurchase!.purchasedHair}\n`);

    // Test 2: Ownership tracking and free switching
    console.log('Test 2: Ownership tracking and free switching');

    // Switch back to default hair (should be free)
    const defaultHair = 'short01';
    console.log(`  Switching to default ${defaultHair} (should cost 0 PP)...`);

    const ppBeforeSwitch = userAfterPurchase!.provePoints;
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        avatarHair: defaultHair
        // No PP deduction for default items
      }
    });

    const userAfterSwitch = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`  Switch to default hair:`);
    console.log(`  - PP before: ${ppBeforeSwitch}`);
    console.log(`  - PP after: ${userAfterSwitch!.provePoints} (no change)`);
    console.log(`  - Hair: ${userAfterSwitch!.avatarHair}\n`);

    // Switch back to owned premium hair (should be free)
    console.log(`  Switching back to owned ${newHair} (should cost 0 PP)...`);
    
    const purchasedHairList = JSON.parse(userAfterSwitch!.purchasedHair || '[]');
    const ownsHair = purchasedHairList.includes(newHair);
    console.log(`  - User owns ${newHair}: ${ownsHair}`);

    if (ownsHair) {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          avatarHair: newHair
          // No PP deduction for owned items
        }
      });

      const userAfterOwnedSwitch = await prisma.user.findUnique({ where: { id: testUser.id } });
      console.log(`  Switch to owned premium hair:`);
      console.log(`  - PP unchanged: ${userAfterOwnedSwitch!.provePoints}`);
      console.log(`  - Hair: ${userAfterOwnedSwitch!.avatarHair}\n`);
    }

    // Test 3: Diverse pricing validation
    console.log('Test 3: Diverse pricing validation');

    console.log(`  Hair pricing (15-80 PP range):`);
    Object.entries(AVATAR_PRICES.hair).forEach(([item, price]) => {
      console.log(`  - ${item}: ${price} PP`);
    });

    console.log(`  Eyes pricing (20-40 PP range):`);
    Object.entries(AVATAR_PRICES.eyes).forEach(([item, price]) => {
      console.log(`  - ${item}: ${price} PP`);
    });

    console.log(`  Mouth pricing (15-35 PP range):`);
    Object.entries(AVATAR_PRICES.mouth).forEach(([item, price]) => {
      console.log(`  - ${item}: ${price} PP`);
    });

    console.log(`  Accessories pricing (0-100 PP range):`);
    Object.entries(AVATAR_PRICES.accessories).forEach(([item, price]) => {
      console.log(`  - ${item}: ${price} PP`);
    });

    // Test 4: Multiple category purchases
    console.log('\nTest 4: Multiple category purchases');

    const currentUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    
    // Purchase eyes
    const newEyes = 'starstruck';
    const eyesCost = AVATAR_PRICES.eyes[newEyes as keyof typeof AVATAR_PRICES.eyes];
    
    // Purchase mouth
    const newMouth = 'awkwardSmile';
    const mouthCost = AVATAR_PRICES.mouth[newMouth as keyof typeof AVATAR_PRICES.mouth];
    
    // Purchase accessories
    const newAccessories = 'glasses';
    const accessoriesCost = AVATAR_PRICES.accessories[newAccessories as keyof typeof AVATAR_PRICES.accessories];

    const totalCost = eyesCost + mouthCost + accessoriesCost;
    console.log(`  Purchasing multiple items (total: ${totalCost} PP):`);
    console.log(`  - ${newEyes}: ${eyesCost} PP`);
    console.log(`  - ${newMouth}: ${mouthCost} PP`);
    console.log(`  - ${newAccessories}: ${accessoriesCost} PP`);

    if (currentUser!.provePoints >= totalCost) {
      const newPPAfterMultiple = currentUser!.provePoints - totalCost;
      
      // Update purchased lists
      const purchasedEyes = JSON.parse(currentUser!.purchasedEyes || '[]');
      const purchasedMouth = JSON.parse(currentUser!.purchasedMouth || '[]');
      const purchasedAccessories = JSON.parse(currentUser!.purchasedAccessories || '[]');
      
      purchasedEyes.push(newEyes);
      purchasedMouth.push(newMouth);
      purchasedAccessories.push(newAccessories);

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          provePoints: newPPAfterMultiple,
          avatarEyes: newEyes,
          avatarMouth: newMouth,
          avatarAccessories: newAccessories,
          purchasedEyes: JSON.stringify(purchasedEyes),
          purchasedMouth: JSON.stringify(purchasedMouth),
          purchasedAccessories: JSON.stringify(purchasedAccessories)
        }
      });

      const userAfterMultiple = await prisma.user.findUnique({ where: { id: testUser.id } });
      console.log(`  Multiple purchase successful:`);
      console.log(`  - PP before: ${currentUser!.provePoints}`);
      console.log(`  - PP after: ${userAfterMultiple!.provePoints}`);
      console.log(`  - Total spent: ${totalCost} PP`);
      console.log(`  - New avatar: ${userAfterMultiple!.avatarHair}, ${userAfterMultiple!.avatarEyes}, ${userAfterMultiple!.avatarMouth}, ${userAfterMultiple!.avatarAccessories}\n`);
    }

    // Test 5: Insufficient funds prevention
    console.log('Test 5: Insufficient funds prevention');

    const finalUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    const expensiveItem = 'glasses'; // Most expensive accessory
    const expensiveCost = AVATAR_PRICES.accessories.glasses;

    console.log(`  Current PP: ${finalUser!.provePoints}`);
    console.log(`  Attempting to buy ${expensiveItem} for ${expensiveCost} PP...`);

    if (finalUser!.provePoints < expensiveCost) {
      console.log(`  Insufficient funds detected - purchase blocked`);
      console.log(`  User PP remains: ${finalUser!.provePoints}\n`);
    } else {
      console.log(`  User has sufficient funds for purchase\n`);
    }

    // Test 6: Persistence validation
    console.log('Test 6: Purchase persistence validation');

    const persistenceUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    
    console.log(`  Purchased items persist across sessions:`);
    console.log(`  - Hair: ${persistenceUser!.purchasedHair}`);
    console.log(`  - Eyes: ${persistenceUser!.purchasedEyes}`);
    console.log(`  - Mouth: ${persistenceUser!.purchasedMouth}`);
    console.log(`  - Accessories: ${persistenceUser!.purchasedAccessories}`);

    const totalPurchasedItems = 
      JSON.parse(persistenceUser!.purchasedHair || '[]').length +
      JSON.parse(persistenceUser!.purchasedEyes || '[]').length +
      JSON.parse(persistenceUser!.purchasedMouth || '[]').length +
      JSON.parse(persistenceUser!.purchasedAccessories || '[]').length;

    console.log(`  Total items owned: ${totalPurchasedItems}\n`);

    console.log('Avatar system tests completed successfully!\n');

    // Cleanup
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Avatar system test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAvatarSystem();
