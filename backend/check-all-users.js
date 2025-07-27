const { PrismaClient } = require('./src/prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking all users in the database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        provePoints: true,
        createdAt: true,
        _count: {
          select: {
            stakes: true
          }
        }
      },
      orderBy: {
        isAdmin: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.isAdmin ? 'ADMIN' : 'USER'}: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ProvePoints: ${user.provePoints}`);
      console.log(`   Stakes: ${user._count.stakes}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Summary
    const admins = users.filter(u => u.isAdmin);
    const regularUsers = users.filter(u => !u.isAdmin);
    
    console.log('Summary:');
    console.log(`   - Admin accounts: ${admins.length}`);
    console.log(`   - Regular users: ${regularUsers.length}`);
    console.log(`   - Total accounts: ${users.length}`);

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

