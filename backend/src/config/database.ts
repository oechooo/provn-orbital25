// src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

// Database initialization function
export const initDatabase = async () => {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Database connection established successfully');
    
    return prisma;
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

// Clean up function for tests or server shutdown
export const closeDatabase = async () => {
  await prisma.$disconnect();
};
