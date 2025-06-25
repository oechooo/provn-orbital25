const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock articles with prediction markets
const mockArticlesWithMarkets = [
  {
    sourceName: "TechCrunch",
    title: "OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities",
    description: "The latest iteration of ChatGPT promises significant improvements in logical reasoning, mathematical problem-solving, and scientific analysis.",
    url: "https://techcrunch.com/2025/06/24/openai-gpt5-announcement",
    urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    publishedAt: new Date(),
    category: "technology",
    content: "OpenAI has unveiled GPT-5, marking what the company calls the most significant advancement in artificial intelligence reasoning capabilities to date."
  },
  {
    sourceName: "Reuters",
    title: "Federal Reserve Signals Potential Interest Rate Cuts Amid Economic Uncertainty",
    description: "Fed officials hint at possible monetary policy adjustments as inflation cools and economic growth shows mixed signals.",
    url: "https://reuters.com/markets/fed-rate-signals-2025",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: "business",
    content: "Federal Reserve officials are increasingly signaling potential interest rate cuts in response to cooling inflation and mixed economic indicators."
  },
  {
    sourceName: "Nature Medicine",
    title: "Breakthrough Gene Therapy Shows 95% Success Rate in Clinical Trials",
    description: "Revolutionary treatment for inherited blindness demonstrates unprecedented efficacy in phase 3 trials across multiple medical centers.",
    url: "https://nature.com/articles/gene-therapy-breakthrough-2025",
    urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    category: "science",
    content: "A groundbreaking gene therapy for Leber congenital amaurosis has shown remarkable success in phase 3 clinical trials."
  },
  {
    sourceName: "ESPN",
    title: "World Cup 2026 Venues Finalized: Record-Breaking Tournament Expected",
    description: "FIFA announces final stadium selections for the expanded 48-team tournament across North America.",
    url: "https://espn.com/soccer/world-cup-2026-venues",
    urlToImage: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    category: "sports",
    content: "FIFA has finalized the venue selection for the 2026 World Cup, featuring an expanded format across the United States, Canada, and Mexico."
  },
  {
    sourceName: "The Hollywood Reporter",
    title: "Marvel Studios Announces Phase 6 Timeline and Surprise Casting Reveals",
    description: "Kevin Feige unveils the complete roadmap for the next three years of Marvel Cinematic Universe films and series.",
    url: "https://hollywoodreporter.com/marvel-phase-6-announcement",
    urlToImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    category: "entertainment",
    content: "Marvel Studios president Kevin Feige has revealed the complete timeline for Phase 6 of the Marvel Cinematic Universe."
  },
  {
    sourceName: "BBC Health",
    title: "New Alzheimer's Drug Shows Promise in Slowing Cognitive Decline",
    description: "International study reveals 40% reduction in memory loss progression over 18-month trial period.",
    url: "https://bbc.com/health/alzheimers-breakthrough-2025",
    urlToImage: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    category: "health",
    content: "A new Alzheimer's treatment has demonstrated significant promise in slowing cognitive decline in early-stage patients."
  }
];

async function createSampleData() {
  try {
    console.log('🔄 Creating sample articles and markets...');
    
    // Clear existing data
    await prisma.market.deleteMany();
    await prisma.article.deleteMany();
    console.log('🗑️ Cleared existing data');

    let articlesCreated = 0;
    let marketsCreated = 0;

    for (const articleData of mockArticlesWithMarkets) {
      try {
        // Create article
        const article = await prisma.article.create({
          data: articleData
        });
        
        console.log(`✅ Created article: ${article.title}`);
        articlesCreated++;

        // Create corresponding market
        const market = await prisma.market.create({
          data: {
            articleId: article.id,
            resolved: false,
            outcome: null,
            sharesTrue: Math.floor(Math.random() * 100) + 50, // Random shares for demo
            sharesFalse: Math.floor(Math.random() * 100) + 50,
            probTrue: 0.4 + Math.random() * 0.2, // Random probability between 0.4-0.6
            probFalse: 0.4 + Math.random() * 0.2,
          }
        });
        
        console.log(`📊 Created market for article: ${article.title}`);
        marketsCreated++;
        
      } catch (error) {
        console.error(`❌ Error creating article/market:`, error.message);
      }
    }

    console.log('\n🎉 Sample data creation completed!');
    console.log(`📰 Articles created: ${articlesCreated}`);
    console.log(`📊 Markets created: ${marketsCreated}`);

    // Show final stats
    const totalArticles = await prisma.article.count();
    const totalMarkets = await prisma.market.count();
    console.log(`\n📈 Total articles in database: ${totalArticles}`);
    console.log(`📈 Total markets in database: ${totalMarkets}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleData();
