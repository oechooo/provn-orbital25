const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function giveTesterPP() {
  try {
    // First, check all users
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, predictionPoints: true }
    });
    console.log('Current users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}): ${user.predictionPoints} PP`);
    });
    
    // Find tester user
    const testerUser = users.find(user => 
      user.username.toLowerCase().includes('test') || 
      user.email.toLowerCase().includes('test')
    );
    
    if (testerUser) {
      console.log(`\nUpdating ${testerUser.username} PP to 10000...`);
      
      const updatedUser = await prisma.user.update({
        where: { id: testerUser.id },
        data: { predictionPoints: 10000 }
      });
      
      console.log(`Success! ${updatedUser.username} now has ${updatedUser.predictionPoints} PP`);
    } else {
      console.log('\nNo tester user found. Available users listed above.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

giveTesterPP();

