// src/setupTests.ts
import { execSync } from 'child_process';
import path from 'path';

// Force generate the Prisma client before tests
try {
  console.log('Generating Prisma Client for tests...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generation completed.');
} catch (error) {
  console.error('Failed to generate Prisma Client:', error);
  process.exit(1);
}

// Dynamically import PrismaClient after generation
const { PrismaClient } = require('@prisma/client');

// Create singleton instance
const prisma = new PrismaClient();

// Global setup
beforeAll(async () => {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
});

// Global teardown
afterAll(async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
  console.log('Database disconnected.');
});

// Expose prisma globally for tests
global.prisma = prisma;

// Export for direct import in tests
module.exports = { prisma };