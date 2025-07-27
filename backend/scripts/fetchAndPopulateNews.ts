// scripts/fetchAndPopulateNews.ts
// 
// This script fetches fresh news articles from NewsAPI, creates prediction markets,
// and populates them with bot stakes to simulate an active trading environment.
//
// AUTOMATIC EXECUTION:
// - Runs automatically on server startup via StartupService
// - Only runs if no recent articles exist or few markets have stakes
// - Can be disabled with DISABLE_STARTUP_NEWS_POPULATION=true environment variable
//
// MANUAL EXECUTION:
// - Run manually: npm run populate:news
// - Or directly: npx ts-node scripts/fetchAndPopulateNews.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { MarketService } from '../src/services/MarketService';
import { StakeService } from '../src/services/StakeService';

dotenv.config();

const prisma = new PrismaClient();

// Bot configuration
const BOT_CONFIG = {
  username: 'market_bot',
  email: 'bot@provn.io',
  password: 'bot_secure_password_123',
  initialProvePoints: 50000, // Large amount for stake simulation
  stakes: {
    minAmount: 10,
    maxAmount: 100,
    probabilityRange: [0.3, 0.7], // Bot will create stakes that move probability to this range
    stakesPerMarket: [30, 50] // Random number of stakes per market
  }
};

async function createOrGetBot() {
  console.log('Setting up market bot...');
  
  // Check if bot already exists
  const existingBot = await prisma.user.findUnique({
    where: { email: BOT_CONFIG.email }
  });

  if (existingBot) {
    console.log(`Bot user already exists: ${existingBot.username} (${existingBot.provePoints} PP)`);
    
    // Top up bot's prove points if running low
    if (existingBot.provePoints < 1000) {
      await prisma.user.update({
        where: { id: existingBot.id },
        data: { provePoints: BOT_CONFIG.initialProvePoints }
      });
      console.log(`Topped up bot's prove points to ${BOT_CONFIG.initialProvePoints}`);
    }
    
    return existingBot;
  }

  // Create new bot user
  const hashedPassword = await bcrypt.hash(BOT_CONFIG.password, 10);
  
  const bot = await prisma.user.create({
    data: {
      username: BOT_CONFIG.username,
      email: BOT_CONFIG.email,
      password: hashedPassword,
      provePoints: BOT_CONFIG.initialProvePoints,
      avatarSkinColor: '9ca3af',
      avatarHairColor: '374151',
      avatarHair: 'short01',
      avatarEyes: 'variant01',
      avatarMouth: 'variant01',
      avatarAccessories: 'none'
    }
  });

  console.log(`Created bot user: ${bot.username} with ${bot.provePoints} PP`);
  return bot;
}

async function populateMarketWithStakes(marketId: number, botUserId: number) {
  const marketService = new MarketService(prisma);
  const stakeService = new StakeService(prisma);
  
  // Get number of stakes to create for this market
  const numStakes = Math.floor(Math.random() * 
    (BOT_CONFIG.stakes.stakesPerMarket[1] - BOT_CONFIG.stakes.stakesPerMarket[0] + 1)) + 
    BOT_CONFIG.stakes.stakesPerMarket[0];
  
  console.log(`   Creating ${numStakes} stakes for market ${marketId}...`);
  
  for (let i = 0; i < numStakes; i++) {
    try {
      // Random stake amount
      const stakeAmount = Math.floor(Math.random() * 
        (BOT_CONFIG.stakes.maxAmount - BOT_CONFIG.stakes.minAmount + 1)) + 
        BOT_CONFIG.stakes.minAmount;
      
      // Random prediction (true/false)
      const prediction = Math.random() > 0.5;
      
      // Add some delay between stakes to make it more realistic
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      }
      
      const stake = await stakeService.createStake(botUserId, marketId, prediction, stakeAmount);
      console.log(`     Stake ${i + 1}: ${stakeAmount} PP on ${prediction ? 'TRUE' : 'FALSE'} (ID: ${stake.id})`);
      
    } catch (error: any) {
      console.error(`     Failed to create stake ${i + 1}:`, error.message);
      break; // Stop if bot runs out of points or other error
    }
  }
}

async function fetchAndPopulateArticles() {
  console.log('Starting fetchAndPopulateNews.ts script...');
  console.log('Fetching fresh news articles, creating markets, and populating with bot stakes...\n');
  
  const API_KEY = process.env.NEWS_API_KEY;
  
  if (!API_KEY) {
    console.error('NEWS_API_KEY not found in environment variables');
    return;
  }
  
  console.log('API Key found, proceeding with fetch...');
  
  // Create or get bot user
  const bot = await createOrGetBot();
  
  const CATEGORIES = ["business", "entertainment", "health", "science", "sports", "technology"];
  const QUERIES = 5;
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24H ago

  try {
    let totalArticlesProcessed = 0;
    let totalArticlesCreated = 0;
    let totalMarketsCreated = 0;
    let totalStakesCreated = 0;
    
    for (const category of CATEGORIES) {
      console.log(`\nProcessing category: ${category.toUpperCase()}`);
      const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&from=${fromDate}&pageSize=${QUERIES}&page=1`;
      const response = await axios.get(url);
      const articles = response.data.articles;
      
      console.log(`Found ${articles.length} articles for ${category}`);

      for (const article of articles) {
        totalArticlesProcessed++;
        const {
          source,
          author,
          title,
          description,
          url,
          urlToImage,
          publishedAt,
          content,
        } = article;

        try {
          // Deduct 12 hours from the published date to adjust for timezone differences between ET and GMT+8
          const originalPublishedAt = new Date(publishedAt);
          const adjustedPublishedAt = new Date(originalPublishedAt.getTime() - 12 * 60 * 60 * 1000); 
          
          const newArticle = await prisma.article.create({
            data: {
              sourceName: source.name ?? 'Unknown',
              author: author ?? null,
              title,
              description: description ?? null,
              url,
              urlToImage: urlToImage ?? null,
              publishedAt: adjustedPublishedAt,
              content: content ?? null,
              category,
            },
          });
          console.log(`Added article: ${title.substring(0, 60)}...`);
          totalArticlesCreated++;
          
          // Create market for the new article
          try {
            const market = await prisma.market.create({
              data: {
                articleId: newArticle.id,
                resolveCount: 0,
                outcome: null,
                sharesTrue: 0,
                sharesFalse: 0,
                probTrue: 0.5,
                probFalse: 0.5,
                nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                closed: false
              }
            });
            console.log(`Created market ${market.id} for article ${newArticle.id}`);
            totalMarketsCreated++;
            
            // Populate market with bot stakes
            console.log(`Populating market ${market.id} with bot stakes...`);
            const stakesCountBefore = await prisma.stake.count({ where: { marketId: market.id } });
            
            await populateMarketWithStakes(market.id, bot.id);
            
            const stakesCountAfter = await prisma.stake.count({ where: { marketId: market.id } });
            const stakesAdded = stakesCountAfter - stakesCountBefore;
            totalStakesCreated += stakesAdded;
            
            // Show final market state
            const updatedMarket = await prisma.market.findUnique({
              where: { id: market.id }
            });
            if (updatedMarket) {
              console.log(`Final probabilities: TRUE ${(updatedMarket.probTrue * 100).toFixed(1)}%, FALSE ${(updatedMarket.probFalse * 100).toFixed(1)}%`);
            }
            
          } catch (marketErr: any) {
            console.error(`Error creating/populating market for article ${newArticle.id}:`, marketErr.message);
          }
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.log(`Skipping duplicate article: ${title.substring(0, 60)}...`);
          } else {
            console.error(`Error inserting article: ${title.substring(0, 60)}...`, err.message);
          }
        }
      }
    }

    // Get final bot status
    const finalBot = await prisma.user.findUnique({ where: { id: bot.id } });
    
    console.log(`\nProcess complete!`);
    console.log('\nSUMMARY:');
    console.log(`Total articles processed: ${totalArticlesProcessed}`);
    console.log(`New articles created: ${totalArticlesCreated}`);
    console.log(`Markets created: ${totalMarketsCreated}`);
    console.log(`Bot stakes created: ${totalStakesCreated}`);
    console.log(`Bot PP remaining: ${finalBot?.provePoints || 0}`);
    console.log(`Duplicate articles skipped: ${totalArticlesProcessed - totalArticlesCreated}`);
    
  } catch (err) {
    console.error('Failed to fetch and populate news:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndPopulateArticles();
