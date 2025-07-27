const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPurchasedFields() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'tester1' },
      select: { 
        username: true, 
        provePoints: true,
        purchasedHair: true,
        purchasedEyes: true,
        purchasedMouth: true,
        purchasedAccessories: true
      }
    });
    console.log('User data:', user);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPurchasedFields();

