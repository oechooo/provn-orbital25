const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fetchAndStoreArticles() {
  const API_KEY = process.env.NEWS_API_KEY;
  
  if (!API_KEY || API_KEY === 'your_actual_api_key_here') {
    console.error('❌ Please set your real News API key in the .env file');
    console.log('1. Go to https://newsapi.org/');
    console.log('2. Sign up for a free account');
    console.log('3. Get your API key');
    console.log('4. Replace NEWS_API_KEY in your .env file');
    process.exit(1);
  }

  console.log('🔄 Fetching real news articles from News API...');
  
  const CATEGORIES = ["business", "entertainment", "health", "science", "sports", "technology"];
  const QUERIES = 5; // Articles per category
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24H ago

  let totalArticles = 0;
  let totalMarkets = 0;

  try {
    // Clear existing mock data
    await prisma.market.deleteMany();
    await prisma.article.deleteMany();
    console.log('🗑️ Cleared existing mock data');

    for (const category of CATEGORIES) {
      console.log(`\n📰 Fetching ${category} articles...`);
      
      const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&language=en&pageSize=${QUERIES}`;
      
      try {
        const response = await axios.get(url);
        const articles = response.data.articles;

        if (!articles || articles.length === 0) {
          console.log(`⚠️ No articles found for category: ${category}`);
          continue;
        }

        for (const article of articles) {
          const {
            source,
            author,
            title,
            description,
            url: articleUrl,
            urlToImage,
            publishedAt,
            content,
          } = article;

          // Skip articles without proper title or URL
          if (!title || !articleUrl || title === '[Removed]') {
            console.log(`⚠️ Skipping invalid article: ${title || 'No title'}`);
            continue;
          }

          try {
            // Create article
            const createdArticle = await prisma.article.create({
              data: {
                sourceName: source?.name || 'Unknown',
                author: author || null,
                title,
                description: description || null,
                url: articleUrl,
                urlToImage: urlToImage || null,
                publishedAt: new Date(publishedAt),
                content: content || null,
                category,
              },
            });
            
            console.log(`✅ Added article: ${title.substring(0, 60)}...`);
            totalArticles++;

            // Create a corresponding prediction market
            const market = await prisma.market.create({
              data: {
                articleId: createdArticle.id,
                resolved: false,
                outcome: null,
                sharesTrue: 100, // Starting shares
                sharesFalse: 100,
                probTrue: 0.5, // Starting at 50/50
                probFalse: 0.5,
              }
            });
            
            console.log(`📊 Created market for: ${title.substring(0, 60)}...`);
            totalMarkets++;
            
          } catch (err) {
            if (err.code === 'P2002') {
              console.log(`⚠️ Skipping duplicate article: ${title.substring(0, 60)}...`);
            } else {
              console.error(`❌ Error inserting article: ${title}`, err.message);
            }
          }
        }
        
        // Add delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (categoryError) {
        console.error(`❌ Error fetching ${category} articles:`, categoryError.message);
        if (categoryError.response?.status === 429) {
          console.log('⚠️ Rate limit reached. Waiting before continuing...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    console.log('\n🎉 News fetching completed!');
    console.log(`📰 Total articles fetched: ${totalArticles}`);
    console.log(`📊 Total markets created: ${totalMarkets}`);

    // Show final database stats
    const dbArticles = await prisma.article.count();
    const dbMarkets = await prisma.market.count();
    console.log(`\n📈 Articles in database: ${dbArticles}`);
    console.log(`📈 Markets in database: ${dbMarkets}`);

  } catch (error) {
    console.error('❌ Failed to fetch news:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 API Key Error - Please check your News API key:');
      console.log('1. Make sure you copied the key correctly');
      console.log('2. Check that your account is active');
      console.log('3. Verify the key has not expired');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fetchAndStoreArticles();
