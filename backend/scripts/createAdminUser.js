const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', {
        id: existingAdmin.id,
        username: existingAdmin.username,
        email: existingAdmin.email,
        isAdmin: existingAdmin.isAdmin,
        provePoints: existingAdmin.provePoints
      });
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        provePoints: 10000, // 10000 PP as requested
        avatarSkinColor: 'fdbcb4',
        avatarHairColor: '724133',
        avatarHair: 'short01',
        avatarEyes: 'variant01',
        avatarMouth: 'variant01',
        avatarAccessories: 'none'
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      provePoints: adminUser.provePoints,
    });

    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error.code === 'P2002') {
      console.error('A user with this username or email already exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
