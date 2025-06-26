const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user with avatar configuration
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        provePoints: 1000, // Give test user 1000 starting points
        avatarSkinColor: 'efcc9f',
        avatarHairColor: '71472d',
        avatarHair: 'shortHair',
        avatarEyes: 'normal',
        avatarMouth: 'teethSmile',
        avatarAccessories: 'glasses'
      }
    });

    console.log('Test user created successfully:', {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
      provePoints: testUser.provePoints,
    });

    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
