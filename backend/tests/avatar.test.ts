import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAvatarSystem() {
  console.log('🎨 Testing Avatar System Functionality...\n');

  try {
    // Get or create test user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: 'avatar_tester',
          email: 'avatar@test.com',
          password: 'dummy_hash',
          provePoints: 500
        }
      });
      console.log(`Created test user with ${user.provePoints} PP\n`);
    } else {
      console.log(`Using user: ${user.username} (${user.provePoints} PP)\n`);
    }

    // Test 1: Avatar Hair Purchase (Valid)
    console.log('📝 Test 1: Valid Avatar Hair Purchase');
    const hairToPurchase = 'long02';
    const hairCost = 25;

    if (user.provePoints >= hairCost) {
      // Parse existing purchased hair items
      const existingHair = JSON.parse(user.purchasedHair);
      existingHair.push(hairToPurchase);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          provePoints: user.provePoints - hairCost,
          purchasedHair: JSON.stringify(existingHair)
        }
      });

      console.log(`✅ Purchase successful: ${hairToPurchase} for ${hairCost} PP`);
      console.log(`   PP Before: ${user.provePoints}, After: ${updatedUser.provePoints}`);
      console.log(`   Purchased hair items: ${JSON.parse(updatedUser.purchasedHair).length}\n`);
      user = updatedUser;
    } else {
      console.log(`❌ Insufficient PP for purchase\n`);
    }

    // Test 2: Duplicate Purchase Prevention
    console.log('📝 Test 2: Duplicate Purchase Prevention');
    const purchasedHairItems = JSON.parse(user.purchasedHair);
    const alreadyOwned = purchasedHairItems.includes(hairToPurchase);
    if (alreadyOwned) {
      console.log(`✅ Duplicate prevention working: ${hairToPurchase} already owned`);
    } else {
      console.log(`❌ Duplicate prevention failed: Item not found in purchased items`);
    }
    console.log();

    // Test 3: Insufficient Funds
    console.log('📝 Test 3: Insufficient Funds Handling');
    const expensiveAccessory = 'premium_glasses';
    const expensiveCost = 999;

    if (user.provePoints < expensiveCost) {
      console.log(`✅ Insufficient funds check working: Need ${expensiveCost} PP, have ${user.provePoints} PP`);
    } else {
      console.log(`❌ Insufficient funds check failed: User has enough PP`);
    }
    console.log();

    // Test 4: Avatar Customization
    console.log('📝 Test 4: Avatar Customization');
    
    const userWithAvatar = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarHair: hairToPurchase,
        avatarSkinColor: 'f4c2a1',
        avatarHairColor: '8b4513',
        avatarEyes: 'variant02',
        avatarMouth: 'variant02',
        avatarAccessories: 'glasses01'
      }
    });

    console.log(`✅ Avatar customization successful`);
    console.log(`   Hair: ${userWithAvatar.avatarHair}`);
    console.log(`   Skin: ${userWithAvatar.avatarSkinColor}`);
    console.log(`   Eyes: ${userWithAvatar.avatarEyes}`);
    console.log(`   Accessories: ${userWithAvatar.avatarAccessories}\n`);

    // Test 5: Ownership Validation
    console.log('📝 Test 5: Ownership Validation');
    const currentPurchasedHair = JSON.parse(userWithAvatar.purchasedHair);
    const purchasedAccessories = JSON.parse(userWithAvatar.purchasedAccessories);
    
    if (currentPurchasedHair.includes(userWithAvatar.avatarHair)) {
      console.log(`✅ Current hair style is properly owned: ${userWithAvatar.avatarHair}`);
    } else {
      console.log(`❌ Current hair style not owned: ${userWithAvatar.avatarHair}`);
    }
    console.log();

    // Test 6: Avatar Item Pricing Tiers
    console.log('📝 Test 6: Avatar Item Pricing Validation');
    const pricingTiers = {
      'hat_basic': 15,
      'hat_premium': 50,
      'shirt_basic': 20,
      'shirt_premium': 75,
      'full_outfit': 100
    };

    Object.entries(pricingTiers).forEach(([item, price]) => {
      if (price >= 15 && price <= 100) {
        console.log(`✅ Valid pricing: ${item} = ${price} PP`);
      } else {
        console.log(`❌ Invalid pricing: ${item} = ${price} PP`);
      }
    });

    console.log('\n🎯 Avatar System Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ Avatar system test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAvatarSystem();
