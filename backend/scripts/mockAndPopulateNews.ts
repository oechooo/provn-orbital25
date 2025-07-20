// scripts/mockAndPopulateNews.ts
// 
// This script creates MOCK news articles, prediction markets,
// and populates them with bot stakes to simulate an active trading environment.
// This is designed for production environments where we don't want to use real NewsAPI calls.

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
    stakesPerMarket: [8, 15] // Reduced from [30, 50] to prevent memory issues
  }
};

async function createOrGetBot() {
  console.log('Setting up market bot...');
  
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
    const stakeAmount = Math.floor(Math.random() * 
      (BOT_CONFIG.stakes.maxAmount - BOT_CONFIG.stakes.minAmount + 1)) + 
      BOT_CONFIG.stakes.minAmount;
    
    const prediction = Math.random() > 0.5;
    
    const stake = await stakeService.createStake(botUserId, marketId, prediction, stakeAmount);
    console.log(`     Stake ${i + 1}: ${stakeAmount} PP on ${prediction ? 'TRUE' : 'FALSE'} (ID: ${stake.id})`);
  }
}

async function fetchAndPopulateArticles() {
  // Force output to be visible immediately
  process.stdout.write('\n🚀 MOCK DATA POPULATION STARTING\n');
  console.log('🚀 Starting mockAndPopulateNews.ts script...');
  console.log('🎭 Creating MOCK articles, markets, and populating with bot stakes...\n');
  
  // Flush output immediately
  if (typeof process.stdout.write === 'function') {
    process.stdout.write('');
  }
  
  // Debug: Database connection
  console.log('\n🔍 Testing database connection...');
  await prisma.$connect();
  console.log('✅ Database connection successful');
  
  // Check existing data
  const existingArticles = await prisma.article.count();
  const existingMarkets = await prisma.market.count();
  const existingStakes = await prisma.stake.count();
  console.log(`📊 Current DB state: ${existingArticles} articles, ${existingMarkets} markets, ${existingStakes} stakes`);
  
  // Create or get bot user
  console.log('\n🤖 Setting up bot user...');
  const bot = await createOrGetBot();
  console.log(`✅ Bot ready: ${bot.username} (ID: ${bot.id}, PP: ${bot.provePoints})`);

  console.log('\n📰 Creating mock articles with markets and stakes...');
  await createMockArticles();
  
  // Get final counts
  const finalArticles = await prisma.article.count();
  const finalMarkets = await prisma.market.count();
  const finalStakes = await prisma.stake.count();
  const finalBot = await prisma.user.findUnique({ where: { id: bot.id } });
  
  console.log(`\n🎉 PROCESS COMPLETE!`);
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`   📰 Total articles in DB: ${finalArticles}`);
  console.log(`   🏪 Total markets in DB: ${finalMarkets}`);
  console.log(`   🎲 Total stakes in DB: ${finalStakes}`);
  console.log(`   💰 Bot PP remaining: ${finalBot?.provePoints || 0}`);
  console.log(`   🤖 Bot final status: ${finalBot?.username} (ID: ${finalBot?.id})`);
  
  console.log('\n🔌 Disconnecting from database...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
}

async function createMockArticles() {
  console.log('\n🎭 Creating mock articles...');
  
  const mockArticles = [
    {
      title: "Tech Giants Report Strong Q2 Earnings",
      description: "Major technology companies exceed expectations in quarterly earnings reports.",
      content: "Technology stocks surged as major companies reported better-than-expected quarterly results. Industry leaders showed significant growth in cloud computing and AI sectors.",
      category: "business",
      sourceName: "Tech News Daily"
    },
    {
      title: "New Medical Breakthrough in Cancer Treatment",
      description: "Researchers discover promising new therapy approach.",
      content: "Scientists at leading medical institutions have made significant progress in developing new cancer treatments using innovative immunotherapy techniques.",
      category: "health", 
      sourceName: "Medical Journal"
    },
    {
      title: "Climate Change Summit Reaches Key Agreement",
      description: "World leaders commit to new environmental initiatives.",
      content: "International leaders gathered to discuss climate action and reached consensus on several key initiatives to reduce global carbon emissions.",
      category: "science",
      sourceName: "Environmental Times"
    },
    {
      title: "Entertainment Industry Embraces Streaming Technology",
      description: "Studios adapt to changing viewer preferences with new platforms.",
      content: "Major entertainment companies are investing heavily in streaming technology and original content production to meet evolving consumer demands.",
      category: "entertainment",
      sourceName: "Entertainment Weekly"
    },
    {
      title: "Professional Sports Leagues Expand Internationally",
      description: "American sports leagues seek global audience growth.",
      content: "Professional sports organizations are expanding their international presence through strategic partnerships and overseas games to capture new markets.",
      category: "sports",
      sourceName: "Sports Network"
    },
    {
      title: "Artificial Intelligence Transforms Software Development",
      description: "AI tools revolutionize how developers write and test code.",
      content: "The software development industry is experiencing a transformation as artificial intelligence tools become essential for code generation and debugging.",
      category: "technology",
      sourceName: "Developer Daily"
    }
  ];

  const bot = await createOrGetBot();
  let totalCreated = 0;
  let totalMarketsCreated = 0;
  let totalStakesCreated = 0;

  console.log(`📊 Planning to create ${mockArticles.length} mock articles...`);

  for (let i = 0; i < mockArticles.length; i++) {
    const mockArticle = mockArticles[i];
    console.log(`\n📰 Creating mock article ${i + 1}/${mockArticles.length}: "${mockArticle.title.substring(0, 50)}..."`);
    
    // Add timestamp to URL to ensure uniqueness
    const uniqueUrl = `https://example.com/${mockArticle.category}/article-${Date.now()}-${i}`;
    
    const newArticle = await prisma.article.create({
      data: {
        sourceName: mockArticle.sourceName,
        author: 'Mock Author',
        title: mockArticle.title,
        description: mockArticle.description,
        url: uniqueUrl,
        urlToImage: `https://via.placeholder.com/400x200/6366f1/ffffff?text=${encodeURIComponent(mockArticle.category.toUpperCase())}+Article`,
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time within last 24 hours
        content: mockArticle.content,
        category: mockArticle.category,
      },
    });

    console.log(`✅ Created mock article with ID: ${newArticle.id}`);
    totalCreated++;

    // Create market for mock article
    console.log(`🏪 Creating market for article ${newArticle.id}...`);
    const market = await prisma.market.create({
      data: {
        articleId: newArticle.id,
        resolveCount: 0,
        outcome: null,
        sharesTrue: 0,
        sharesFalse: 0,
        probTrue: 0.5,
        probFalse: 0.5,
        nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        closed: false
      }
    });

    console.log(`✅ Created market ${market.id} for mock article`);
    totalMarketsCreated++;
    
    // Add bot stakes to the market
    console.log(`🎲 Adding bot stakes to market ${market.id}...`);
    const stakesCountBefore = await prisma.stake.count({ where: { marketId: market.id } });
    
    await populateMarketWithStakes(market.id, bot.id);
    
    const stakesCountAfter = await prisma.stake.count({ where: { marketId: market.id } });
    const stakesAdded = stakesCountAfter - stakesCountBefore;
    totalStakesCreated += stakesAdded;
    console.log(`✅ Added ${stakesAdded} stakes to market ${market.id}`);
    
    // Show final market state
    const updatedMarket = await prisma.market.findUnique({
      where: { id: market.id }
    });
    if (updatedMarket) {
      console.log(`📊 Final probabilities: TRUE ${(updatedMarket.probTrue * 100).toFixed(1)}%, FALSE ${(updatedMarket.probFalse * 100).toFixed(1)}%`);
    }

    // Small delay between articles
    if (i < mockArticles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n🎯 Mock data creation summary:`);
  console.log(`   📰 Articles created: ${totalCreated}/${mockArticles.length}`);
  console.log(`   🏪 Markets created: ${totalMarketsCreated}`);
  console.log(`   🎲 Stakes created: ${totalStakesCreated}`);
  
  // Get updated bot status
  const finalBot = await prisma.user.findUnique({ where: { id: bot.id } });
  console.log(`   🤖 Bot PP remaining: ${finalBot?.provePoints || 0}`);
}

// Wrapper to ensure output is visible
async function runScript() {
  process.stdout.write('\n=== SCRIPT WRAPPER STARTING ===\n');
  console.log('🔄 About to call fetchAndPopulateArticles...');
  await fetchAndPopulateArticles();
  console.log('✅ fetchAndPopulateArticles completed successfully');
  process.stdout.write('=== SCRIPT WRAPPER COMPLETED ===\n');
}

// Call the wrapper
runScript();
