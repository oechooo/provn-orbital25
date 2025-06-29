const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    console.log('Admin user found:', {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      isAdmin: user?.isAdmin,
      provePoints: user?.provePoints
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
