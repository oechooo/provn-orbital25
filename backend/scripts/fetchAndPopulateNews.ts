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

// Force immediate output without buffering
process.stdout.write('\n=== FETCHANDPOPULATE SCRIPT STARTING ===\n');
console.log('🚀 SCRIPT ENTRY POINT REACHED');
console.log('📍 Current working directory:', process.cwd());
console.log('🕐 Script start time:', new Date().toISOString());

try {
  console.log('📦 Loading axios...');
  var axios = require('axios');
  console.log('✅ axios loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load axios: ${err.message}`);
}

try {
  console.log('📦 Loading PrismaClient...');
  var { PrismaClient } = require('@prisma/client');
  console.log('✅ PrismaClient loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load PrismaClient: ${err.message}`);
}

try {
  console.log('📦 Loading bcrypt...');
  var bcrypt = require('bcrypt');
  console.log('✅ bcrypt loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load bcrypt: ${err.message}`);
}

try {
  console.log('📦 Loading dotenv...');
  var dotenv = require('dotenv');
  console.log('✅ dotenv loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load dotenv: ${err.message}`);
}

try {
  console.log('📦 Loading MarketService...');
  var { MarketService } = require('../src/services/MarketService');
  console.log('✅ MarketService loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load MarketService: ${err.message}`);
}

try {
  console.log('📦 Loading StakeService...');
  var { StakeService } = require('../src/services/StakeService');
  console.log('✅ StakeService loaded');
} catch (err: any) {
  throw new Error(`FATAL: Failed to load StakeService: ${err.message}`);
}

try {
  console.log('⚙️ Configuring dotenv...');
  dotenv.config();
  console.log('✅ dotenv configured');
} catch (err: any) {
  throw new Error(`FATAL: Failed to configure dotenv: ${err.message}`);
}

try {
  console.log('🗄️ Initializing Prisma Client...');
  var prisma = new PrismaClient();
  console.log('✅ Prisma Client initialized');
} catch (err: any) {
  throw new Error(`FATAL: Failed to initialize Prisma Client: ${err.message}`);
}

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
  try {
    console.log('Setting up market bot...');
    
    // Check if bot already exists
    console.log('🔍 Checking for existing bot...');
    const existingBot = await prisma.user.findUnique({
      where: { email: BOT_CONFIG.email }
    });

    if (existingBot) {
      console.log(`Bot user already exists: ${existingBot.username} (${existingBot.provePoints} PP)`);
      
      // Top up bot's prove points if running low
      if (existingBot.provePoints < 1000) {
        console.log('💰 Topping up bot prove points...');
        await prisma.user.update({
          where: { id: existingBot.id },
          data: { provePoints: BOT_CONFIG.initialProvePoints }
        });
        console.log(`Topped up bot's prove points to ${BOT_CONFIG.initialProvePoints}`);
      }
      
      return existingBot;
    }

    // Create new bot user
    console.log('🤖 Creating new bot user...');
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

    console.log(`🎉 Created bot user: ${bot.username} with ${bot.provePoints} PP`);
    return bot;
  } catch (error: any) {
    throw new Error(`FATAL: Failed to create or get bot user: ${error.message}. Stack: ${error.stack}`);
  }
}

async function populateMarketWithStakes(marketId: number, botUserId: number) {
  try {
    console.log(`🎲 Starting stake population for market ${marketId}...`);
    const marketService = new MarketService(prisma);
    const stakeService = new StakeService(prisma);
    
    // Check memory usage before creating stakes
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (memUsage > 400) { // If using more than 400MB, reduce stakes
      console.log(`   High memory usage (${Math.round(memUsage)}MB), reducing stakes for market ${marketId}`);
      return; // Skip stake creation to prevent memory issues
    }
    
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
        throw new Error(`STAKE_ERROR: Failed to create stake ${i + 1} for market ${marketId}: ${error.message}`);
      }
    }
  } catch (error: any) {
    throw new Error(`FATAL: Failed to populate market ${marketId} with stakes: ${error.message}. Stack: ${error.stack}`);
  }
}

async function fetchAndPopulateArticles() {
  // Force output to be visible immediately
  process.stdout.write('\n🚀 FETCHANDPOPULATE FUNCTION CALLED\n');
  console.log('🚀 Starting fetchAndPopulateNews.ts script...');
  console.log('📰 Fetching fresh news articles, creating markets, and populating with bot stakes...\n');
  
  // Flush output immediately
  if (typeof process.stdout.write === 'function') {
    process.stdout.write('');
  }
  
  // Debug: Environment check
  console.log('🔍 Checking environment variables...');
  const API_KEY = process.env.NEWS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('FATAL: NEWS_API_KEY not found in environment variables. Available env vars: ' + Object.keys(process.env).filter(key => key.includes('NEWS')).join(', '));
  }
  
  if (API_KEY.length < 10) {
    throw new Error(`FATAL: NEWS_API_KEY appears invalid (too short: ${API_KEY.length} chars)`);
  }
  
  console.log('✅ API Key found, length:', API_KEY.length);
  console.log('🔑 API Key preview:', API_KEY.substring(0, 8) + '...');
  
  // Debug: Database connection
  console.log('\n🔍 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check existing data
    const existingArticles = await prisma.article.count();
    const existingMarkets = await prisma.market.count();
    const existingStakes = await prisma.stake.count();
    console.log(`📊 Current DB state: ${existingArticles} articles, ${existingMarkets} markets, ${existingStakes} stakes`);
  } catch (dbError: any) {
    throw new Error(`FATAL: Database connection failed: ${dbError.message}. Stack: ${dbError.stack}`);
  }
  
  // Create or get bot user
  console.log('\n🤖 Setting up bot user...');
  let bot;
  try {
    bot = await createOrGetBot();
  } catch (error: any) {
    throw new Error(`FATAL: Bot setup failed: ${error.message}`);
  }
  console.log(`✅ Bot ready: ${bot.username} (ID: ${bot.id}, PP: ${bot.provePoints})`);
  
  const CATEGORIES = ["business", "entertainment", "health", "science", "sports", "technology"];
  const QUERIES = 1; // Reduced from 5 to 1 to limit memory usage
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24H ago
  
  console.log(`\n📅 Fetching articles from: ${fromDate}`);
  console.log(`🔢 Articles per category: ${QUERIES}`);
  console.log(`📂 Categories: ${CATEGORIES.join(', ')}\n`);

  try {
    let totalArticlesProcessed = 0;
    let totalArticlesCreated = 0;
    let totalMarketsCreated = 0;
    let totalStakesCreated = 0;
    
    for (const category of CATEGORIES) {
      console.log(`\n🏷️  ===== PROCESSING CATEGORY: ${category.toUpperCase()} =====`);
      const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&from=${fromDate}&pageSize=${QUERIES}&page=1`;
      console.log(`🌐 Request URL: ${url.replace(API_KEY, 'API_KEY_HIDDEN')}`);
      
      let articles = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`📡 Attempt ${retryCount + 1}/${maxRetries} - Making API request...`);
          
          if (!API_KEY) {
            throw new Error('API_KEY is undefined at request time');
          }
          
          // Add proper headers to avoid Cloudflare blocking
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
            timeout: 10000, // 10 second timeout
          });
          
          if (!response) {
            throw new Error('Response is null/undefined');
          }
          
          if (!response.data) {
            throw new Error('Response.data is null/undefined');
          }
          
          console.log(`✅ API Response Status: ${response.status} ${response.statusText}`);
          console.log(`📊 Response Data Keys: ${Object.keys(response.data).join(', ')}`);
          
          if (response.data.articles) {
            articles = response.data.articles;
            console.log(`📰 Successfully fetched ${articles.length} articles for ${category}`);
            console.log(`📈 Total available articles: ${response.data.totalResults || 'unknown'}`);
            
            // Log first article title for verification
            if (articles.length > 0) {
              const firstArticle = articles[0] as any;
              if (!firstArticle) {
                throw new Error('First article is null/undefined');
              }
              console.log(`📝 First article: "${firstArticle.title?.substring(0, 50)}..."`);
            }
          } else {
            console.log(`⚠️  No 'articles' property in response for ${category}`);
            console.log(`📋 Response data:`, JSON.stringify(response.data, null, 2));
          }
          
          break; // Success, exit retry loop
          
        } catch (error: any) {
          retryCount++;
          const errorMessage = error.response?.status || error.message || 'Unknown error';
          console.error(`❌ Attempt ${retryCount} failed for ${category}:`, errorMessage);
          
          if (error.response) {
            console.error(`HTTP Status: ${error.response.status}`);
            console.error(`Response data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
          }
          
          if (retryCount < maxRetries) {
            const delay = retryCount * 2000; // 2s, 4s, 6s delays
            console.log(`⏳ Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw new Error(`API_FETCH_ERROR: Failed to fetch ${category} after ${maxRetries} attempts. Last error: ${errorMessage}`);
          }
        }
      }
      
      if (articles.length === 0) {
        console.log(`⚠️  No articles fetched for ${category}, skipping category...`);
        continue;
      }

      console.log(`\n📊 Processing ${articles.length} articles for ${category}...`);

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        totalArticlesProcessed++;
        
        console.log(`\n📄 Processing article ${i + 1}/${articles.length} (Total processed: ${totalArticlesProcessed})`);
        
        // Add delay between articles to prevent memory spikes
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const {
          source,
          author,
          title,
          description,
          url,
          urlToImage,
          publishedAt,
          content,
        } = article as any; // Add type assertion to fix TypeScript issues
        
        console.log(`📝 Article title: "${title?.substring(0, 60)}..."`);
        console.log(`🏢 Source: ${source?.name || 'Unknown'}`);
        console.log(`🔗 URL: ${url?.substring(0, 50)}...`);

        try {
          console.log(`💾 Creating article in database...`);
          
          if (!title) {
            throw new Error('Article title is missing');
          }
          
          if (!url) {
            throw new Error('Article URL is missing');
          }
          
          const newArticle = await prisma.article.create({
            data: {
              sourceName: source?.name ?? 'Unknown',
              author: author ?? null,
              title,
              description: description ?? null,
              url,
              urlToImage: urlToImage ?? null,
              publishedAt: new Date(publishedAt),
              content: content ?? null,
              category,
            },
          });
          
          if (!newArticle || !newArticle.id) {
            throw new Error('Article creation returned null or missing ID');
          }
          
          console.log(`✅ Article created with ID: ${newArticle.id}`);
          totalArticlesCreated++;
          
          // Create market for the new article
          try {
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
                nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                closed: false
              }
            });
            
            if (!market || !market.id) {
              throw new Error('Market creation returned null or missing ID');
            }
            
            console.log(`✅ Market created with ID: ${market.id}`);
            totalMarketsCreated++;
            
            // Populate market with bot stakes
            console.log(`🎲 Populating market ${market.id} with bot stakes...`);
            const stakesCountBefore = await prisma.stake.count({ where: { marketId: market.id } });
            
            try {
              await populateMarketWithStakes(market.id, bot.id);
            } catch (stakeError: any) {
              throw new Error(`Stake population failed: ${stakeError.message}`);
            }
            
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
            
          } catch (marketErr: any) {
            throw new Error(`MARKET_ERROR: Failed to create/populate market for article ${newArticle.id}: ${marketErr.message}. Stack: ${marketErr.stack}`);
          }
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.log(`⚠️  Skipping duplicate article: "${title?.substring(0, 60)}..."`);
          } else {
            throw new Error(`ARTICLE_ERROR: Failed to create article "${title?.substring(0, 60)}...". Error code: ${err.code}, Message: ${err.message}, Stack: ${err.stack}`);
          }
        }
      }
      
      // Force garbage collection after each category (if available)
      if (global.gc) {
        global.gc();
      }
      
      console.log(`Completed processing ${category} - Articles: ${articles.length}, Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    }

    // Get final bot status
    const finalBot = await prisma.user.findUnique({ where: { id: bot.id } });
    
    console.log(`\n🎉 PROCESS COMPLETE!`);
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`   📰 Total articles processed: ${totalArticlesProcessed}`);
    console.log(`   ✅ New articles created: ${totalArticlesCreated}`);
    console.log(`   🏪 Markets created: ${totalMarketsCreated}`);
    console.log(`   🎲 Bot stakes created: ${totalStakesCreated}`);
    console.log(`   💰 Bot PP remaining: ${finalBot?.provePoints || 0}`);
    console.log(`   ⚠️  Duplicate articles skipped: ${totalArticlesProcessed - totalArticlesCreated}`);
    console.log(`   🤖 Bot final status: ${finalBot?.username} (ID: ${finalBot?.id})`);
    
    if (totalArticlesCreated === 0) {
      console.log(`\n⚠️  WARNING: No articles were created! This could indicate:`);
      console.log(`   - All articles were duplicates`);
      console.log(`   - Database connection issues`);
      console.log(`   - Data validation errors`);
      console.log(`   - API returned empty/invalid data`);
    }
    
  } catch (err: any) {
    console.error('\n❌ FATAL ERROR in fetchAndPopulateArticles:');
    console.error(`   Message: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    
    if (err.response) {
      console.error(`   HTTP Status: ${err.response.status}`);
      console.error(`   Response: ${JSON.stringify(err.response.data).substring(0, 500)}...`);
    }
    
    // If NewsAPI fails completely, create some mock articles for testing
    console.log('\n⚠️  NewsAPI failed, creating mock articles for testing...');
    await createMockArticles();
    
  } finally {
    console.log('\n🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
}

async function createMockArticles() {
  const mockArticles = [
    {
      title: "Tech Giants Report Strong Q2 Earnings",
      description: "Major technology companies exceed expectations in quarterly earnings reports.",
      content: "Technology stocks surged as major companies reported better-than-expected quarterly results...",
      category: "business",
      sourceName: "Tech News Daily"
    },
    {
      title: "New Medical Breakthrough in Cancer Treatment",
      description: "Researchers discover promising new therapy approach.",
      content: "Scientists at leading medical institutions have made significant progress in developing new cancer treatments...",
      category: "health", 
      sourceName: "Medical Journal"
    },
    {
      title: "Climate Change Summit Reaches Key Agreement",
      description: "World leaders commit to new environmental initiatives.",
      content: "International leaders gathered to discuss climate action and reached consensus on several key initiatives...",
      category: "science",
      sourceName: "Environmental Times"
    }
  ];

  const bot = await createOrGetBot();
  let totalCreated = 0;

  for (const mockArticle of mockArticles) {
    try {
      const newArticle = await prisma.article.create({
        data: {
          sourceName: mockArticle.sourceName,
          author: 'Mock Author',
          title: mockArticle.title,
          description: mockArticle.description,
          url: `https://example.com/article-${Date.now()}`,
          urlToImage: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=News+Article',
          publishedAt: new Date(),
          content: mockArticle.content,
          category: mockArticle.category,
        },
      });

      console.log(`✅ Created mock article: ${newArticle.title}`);

      // Create market for mock article
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
      
      // Add some stakes
      await populateMarketWithStakes(market.id, bot.id);
      totalCreated++;

    } catch (error: any) {
      console.error('Error creating mock article:', error.message);
    }
  }

  console.log(`\n🎯 Mock data summary: Created ${totalCreated} articles with markets`);
}

// Wrapper to ensure output is visible and errors are caught
async function runScript() {
  try {
    process.stdout.write('\n=== SCRIPT WRAPPER STARTING ===\n');
    console.log('🔄 About to call fetchAndPopulateArticles...');
    await fetchAndPopulateArticles();
    console.log('✅ fetchAndPopulateArticles completed successfully');
    process.stdout.write('=== SCRIPT WRAPPER COMPLETED ===\n');
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR in script wrapper:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.stdout.write('=== SCRIPT WRAPPER FAILED ===\n');
    process.exit(1);
  }
}

// Call the wrapper instead of the function directly
runScript();
