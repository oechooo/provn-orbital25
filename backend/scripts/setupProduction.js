#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function setupProduction() {
  console.log('Setting up production environment...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Check if we have any users (basic health check)
    const userCount = await prisma.user.count();
    console.log(`Current users in database: ${userCount}`);
    
    // Check if we have any articles
    const articleCount = await prisma.article.count();
    console.log(`Current articles in database: ${articleCount}`);
    
    // Check if we have any markets
    const marketCount = await prisma.market.count();
    console.log(`Current markets in database: ${marketCount}`);
    
    console.log('Production setup complete!');
    
  } catch (error) {
    console.error('Production setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupProduction().catch(console.error);
}

module.exports = { setupProduction };

