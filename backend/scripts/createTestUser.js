const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@provn.io' }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@provn.io',
        password: hashedPassword,
        provePoints: 1000, // Give test user 1000 starting points
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
