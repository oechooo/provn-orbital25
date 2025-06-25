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

  console.log('🔄 Fetching meaningful news articles for prediction markets...');
    // Focus on categories and search terms that produce meaningful prediction opportunities
  const SEARCH_QUERIES = [
    // Political & Policy - Current developments
    { q: 'election 2025 OR voting OR campaign OR poll results', category: 'politics' },
    { q: 'new law OR legislation passed OR policy change OR regulation announced', category: 'politics' },
    { q: 'government announcement OR political decision OR cabinet OR minister', category: 'politics' },
    { q: 'trade agreement OR sanctions imposed OR diplomatic talks OR summit', category: 'politics' },
    
    // Economic & Business - Market-moving events
    { q: 'Federal Reserve OR interest rate decision OR inflation report OR GDP growth', category: 'business' },
    { q: 'earnings report OR quarterly results OR profit warning OR revenue forecast', category: 'business' },
    { q: 'merger announced OR acquisition deal OR IPO filing OR bankruptcy filing', category: 'business' },
    { q: 'stock price target OR analyst upgrade OR market outlook OR economic forecast', category: 'business' },
    { q: 'cryptocurrency regulation OR digital currency OR Bitcoin price prediction', category: 'business' },
    
    // Technology & Innovation - Breakthrough developments
    { q: 'AI announcement OR artificial intelligence breakthrough OR ChatGPT OR Google AI', category: 'technology' },
    { q: 'Apple announcement OR iPhone OR Tesla announcement OR electric vehicle news', category: 'technology' },
    { q: 'space mission OR rocket launch OR NASA announcement OR SpaceX', category: 'technology' },
    { q: 'climate technology OR renewable energy breakthrough OR carbon capture', category: 'technology' },
    { q: 'semiconductor OR chip shortage OR manufacturing announcement', category: 'technology' },
    
    // Science & Health - Medical/Scientific breakthroughs
    { q: 'vaccine development OR drug trial OR FDA approval OR medical breakthrough', category: 'science' },
    { q: 'climate change study OR global warming report OR environmental impact', category: 'science' },
    { q: 'space discovery OR astronomy breakthrough OR Mars mission OR telescope', category: 'science' },
    { q: 'pandemic OR virus outbreak OR public health OR WHO announcement', category: 'science' },
    
    // Geopolitics & Security - International developments
    { q: 'peace talks OR ceasefire OR conflict resolution OR diplomatic breakthrough', category: 'politics' },
    { q: 'cybersecurity breach OR hacking OR data leak OR security threat', category: 'technology' },
    { q: 'military exercise OR defense spending OR weapons development', category: 'politics' }
  ];
  
  const ARTICLES_PER_QUERY = 3; // Fewer articles per query for higher quality
    // Keywords to filter OUT (trivial content that doesn't need prediction markets)
  const TRIVIAL_KEYWORDS = [
    // Entertainment & Gaming (not suitable for prediction markets)
    'game release', 'video game', 'gaming', 'game trailer', 'game update', 'game announcement',
    'movie trailer', 'movie review', 'film release', 'TV show', 'television series',
    'celebrity', 'actor', 'actress', 'singer', 'musician', 'artist',
    'fashion', 'red carpet', 'award show', 'Grammy', 'Oscar', 'Emmy',
    'concert', 'tour', 'album release', 'music video', 'song release',
    'reality TV', 'entertainment news', 'gossip', 'paparazzi',
    
    // Sports Results (already determined outcomes)
    'final score', 'game result', 'match result', 'won', 'lost', 'defeated',
    'championship result', 'tournament winner', 'playoff result',
    
    // Lifestyle & Consumer (not prediction-worthy)
    'recipe', 'cooking', 'lifestyle', 'beauty tips', 'fashion tips',
    'workout', 'exercise', 'diet', 'fitness', 'wellness',
    'horoscope', 'astrology', 'zodiac', 'fortune telling',
    'meme', 'viral video', 'funny video', 'cute animals',
    
    // Social Media & Influencer Content
    'social media post', 'influencer', 'TikTok', 'Instagram', 'Twitter post',
    'viral post', 'social media trend', 'online challenge',
    
    // Product Reviews & Consumer Goods
    'product review', 'unboxing', 'comparison review', 'buying guide',
    'best products', 'top 10', 'shopping guide', 'deal alert',
    
    // Already Known Information
    'historical fact', 'throwback', 'anniversary', 'remembering',
    'years ago', 'in history', 'this day in'
  ];

  let totalArticles = 0;
  let totalMarkets = 0;
  let filteredOut = 0;

  try {
    // Clear existing mock data
    await prisma.market.deleteMany();
    await prisma.article.deleteMany();
    console.log('🗑️ Cleared existing data');

    for (const searchQuery of SEARCH_QUERIES) {
      console.log(`\n📰 Searching: "${searchQuery.q}"...`);
      
      // Use search endpoint instead of top-headlines for more relevant results
      const url = `https://newsapi.org/v2/everything?apiKey=${API_KEY}&q=${encodeURIComponent(searchQuery.q)}&language=en&sortBy=publishedAt&pageSize=${ARTICLES_PER_QUERY}&from=${new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()}`;
      
      try {
        const response = await axios.get(url);
        const articles = response.data.articles;

        if (!articles || articles.length === 0) {
          console.log(`⚠️ No articles found for query: ${searchQuery.q}`);
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

          // Filter out trivial content
          const articleText = `${title} ${description || ''} ${content || ''}`.toLowerCase();
          const isTrivial = TRIVIAL_KEYWORDS.some(keyword => 
            articleText.includes(keyword.toLowerCase())
          );

          if (isTrivial) {
            console.log(`🚫 Filtered out trivial content: ${title.substring(0, 60)}...`);
            filteredOut++;
            continue;
          }

          // Additional quality filters
          if (title.length < 20) {
            console.log(`🚫 Filtered out short title: ${title}`);
            filteredOut++;
            continue;
          }

          // Check for prediction-worthy keywords (forward-looking content)
          const predictionKeywords = [
            'will', 'could', 'may', 'might', 'expected to', 'forecast', 'predict',
            'outlook', 'future', 'plan to', 'announced', 'proposal', 'potential',
            'aims to', 'seeks to', 'developing', 'breakthrough', 'trial', 'study'
          ];
          
          const hasPredictionValue = predictionKeywords.some(keyword => 
            articleText.includes(keyword.toLowerCase())
          );

          if (!hasPredictionValue && !title.toLowerCase().includes('announce')) {
            console.log(`🚫 Filtered out non-predictive content: ${title.substring(0, 60)}...`);
            filteredOut++;
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
                category: searchQuery.category,
              },
            });
            
            console.log(`✅ Added: ${title.substring(0, 60)}...`);
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
        
      } catch (queryError) {
        console.error(`❌ Error with query "${searchQuery.q}":`, queryError.message);
        if (queryError.response?.status === 429) {
          console.log('⚠️ Rate limit reached. Waiting before continuing...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    console.log('\n🎉 News fetching completed!');
    console.log(`📰 Total articles fetched: ${totalArticles}`);
    console.log(`📊 Total markets created: ${totalMarkets}`);
    console.log(`🚫 Articles filtered out: ${filteredOut}`);

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
