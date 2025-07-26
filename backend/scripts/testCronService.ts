// Test script for the CronService
import { PrismaClient } from '@prisma/client';
import { CronService } from '../src/services/CronService';
import { MarketService } from '../src/services/MarketService';

const prisma = new PrismaClient();

async function testCronService() {
  console.log('Starting CronService test...');
  
  try {
    const cronService = new CronService(prisma);
    const marketService = new MarketService(prisma);

    // Check current markets
    console.log('\n=== Current Markets ===');
    const allMarkets = await prisma.market.findMany({
      include: {
        article: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`Total markets: ${allMarkets.length}`);
    
    allMarkets.forEach(market => {
      const now = new Date();
      const isDue = market.nextResolve <= now;
      console.log(`Market ${market.id}: "${market.article?.title?.substring(0, 50)}..." - Due: ${market.nextResolve.toISOString()} ${isDue ? '(DUE NOW!)' : ''} - Closed: ${market.closed}`);
    });

    // Check for due markets
    console.log('\n=== Due Markets ===');
    const now = new Date();
    const dueMarkets = await prisma.market.findMany({
      where: {
        nextResolve: {
          lte: now
        },
        closed: false
      },
      include: {
        article: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`Markets due for resolution: ${dueMarkets.length}`);
    dueMarkets.forEach(market => {
      console.log(`- Market ${market.id}: "${market.article?.title?.substring(0, 50)}..." - Due: ${market.nextResolve.toISOString()}`);
    });

    // Test manual trigger
    console.log('\n=== Testing Manual Trigger ===');
    await cronService.triggerMarketResolution();

    // Test starting and stopping
    console.log('\n=== Testing Start/Stop ===');
    cronService.startAll();
    console.log('Started all cron jobs');
    
    setTimeout(() => {
      cronService.stopAll();
      console.log('Stopped all cron jobs');
      console.log('\nCronService test completed successfully!');
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCronService();
