const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initializePurchasedItems() {
  console.log('Initializing purchased items for existing users...');
  
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      avatarHair: true, 
      avatarEyes: true, 
      avatarMouth: true, 
      avatarAccessories: true,
      purchasedHair: true,
      purchasedEyes: true,
      purchasedMouth: true,
      purchasedAccessories: true
    }
  });
  
  for (const user of users) {
    const updates = {};
    
    // If they have premium items equipped, add them to purchased lists
    if (user.purchasedHair === '[]' && user.avatarHair !== 'shortHair') {
      updates.purchasedHair = JSON.stringify([user.avatarHair]);
    }
    if (user.purchasedEyes === '[]' && user.avatarEyes !== 'normal') {
      updates.purchasedEyes = JSON.stringify([user.avatarEyes]);
    }
    if (user.purchasedMouth === '[]' && user.avatarMouth !== 'teethSmile') {
      updates.purchasedMouth = JSON.stringify([user.avatarMouth]);
    }
    if (user.purchasedAccessories === '[]' && user.avatarAccessories !== 'none') {
      updates.purchasedAccessories = JSON.stringify([user.avatarAccessories]);
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates
      });
      console.log(`Updated user ${user.id} with:`, updates);
    }
  }
  
  console.log('Migration complete!');
  await prisma.$disconnect();
}

async function giveTester1PP() {
  console.log('Giving tester1 10000 PP...');
  
  try {
    // First check if tester1 exists
    const tester1 = await prisma.user.findFirst({
      where: { username: 'tester1' }
    });
    
    if (tester1) {
      const updatedUser = await prisma.user.update({
        where: { username: 'tester1' },
        data: { provePoints: 10000 }
      });
      console.log(`Success! ${updatedUser.username} now has ${updatedUser.provePoints} PP`);
    } else {
      console.log('User "tester1" not found');
      
      // Show available users
      const users = await prisma.user.findMany({
        select: { username: true, provePoints: true }
      });
      console.log('Available users:');
      users.forEach(user => {
        console.log(`- ${user.username}: ${user.provePoints} PP`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the PP update instead of migration
giveTester1PP().catch(console.error);

