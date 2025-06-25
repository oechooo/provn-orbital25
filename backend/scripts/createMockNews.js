const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simplified market creation without MarketService dependency
async function createMarketForArticle(articleId) {
  try {
    return await prisma.market.create({
      data: {
        articleId,
        resolved: false,
        outcome: null,
        sharesTrue: 0,
        sharesFalse: 0,
        probTrue: 0.5,
        probFalse: 0.5,
      }
    });
  } catch (error) {
    throw error;
  }
}

async function createMockNewsArticles() {
  try {
    console.log('🔄 Creating mock news articles (when News API key is not available)...');
    
    const mockArticles = [
      {
        sourceName: "TechCrunch",
        title: "OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities",
        description: "The latest iteration of ChatGPT promises significant improvements in logical reasoning, mathematical problem-solving, and scientific analysis.",
        url: "https://techcrunch.com/2025/06/24/openai-gpt5-announcement",
        urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        publishedAt: new Date(),
        category: "technology",
        content: "OpenAI has unveiled GPT-5, marking what the company calls the most significant advancement in artificial intelligence reasoning capabilities to date. The new model demonstrates unprecedented performance in complex problem-solving tasks, logical reasoning, and mathematical computations. Early tests show GPT-5 can solve advanced calculus problems, analyze complex scientific data, and provide detailed explanations of its reasoning process. The announcement has sparked widespread debate about the timeline for achieving artificial general intelligence, with experts divided on whether this represents a breakthrough toward AGI or simply an incremental improvement in existing large language model technology."
      },
      {
        sourceName: "Reuters",
        title: "Federal Reserve Signals Potential Interest Rate Cuts Amid Economic Uncertainty",
        description: "Fed officials hint at possible monetary policy adjustments as inflation cools and economic growth shows mixed signals.",
        url: "https://reuters.com/markets/fed-rate-signals-2025",
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: "business",
        content: "Federal Reserve officials are increasingly signaling potential interest rate cuts in response to cooling inflation and mixed economic indicators. Speaking at a financial conference, Fed Chair emphasized the central bank's commitment to data-driven decisions while acknowledging growing concerns about economic momentum. Recent inflation data shows consumer prices rising at the slowest pace in two years, while employment figures remain robust but show signs of moderation. Market analysts predict a 70% probability of rate cuts in the next quarter, with financial markets already pricing in policy changes."
      },
      {
        sourceName: "Nature Medicine",
        title: "Breakthrough Alzheimer's Treatment Shows 80% Efficacy in Late-Stage Trials",
        description: "Revolutionary drug demonstrates unprecedented success in slowing cognitive decline and improving quality of life for patients with early-stage Alzheimer's disease.",
        url: "https://nature.com/articles/alzheimers-breakthrough-2025",
        urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        category: "health",
        content: "A revolutionary Alzheimer's treatment has demonstrated remarkable 80% efficacy in Phase 3 clinical trials, offering unprecedented hope for millions of patients and families affected by the disease. The drug, developed through a novel approach targeting amyloid plaques and tau proteins simultaneously, showed significant improvement in cognitive function and daily living activities. Trial participants receiving the treatment experienced a 80% reduction in cognitive decline compared to placebo groups over 18 months. The breakthrough represents decades of research into neurodegenerative diseases and could fundamentally change Alzheimer's treatment protocols if approved by regulatory agencies."
      },
      {
        sourceName: "SpaceX News",
        title: "SpaceX Starship Successfully Completes First Commercial Mars Cargo Mission",
        description: "Historic milestone achieved as Starship delivers scientific equipment and supplies to Mars surface, paving the way for human missions.",
        url: "https://spacex.com/news/starship-mars-cargo-success",
        urlToImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        category: "science",
        content: "SpaceX has achieved a historic milestone with the successful completion of Starship's first commercial cargo mission to Mars. The spacecraft delivered 100 tons of scientific equipment, life support systems, and construction materials to the Martian surface, marking humanity's largest interplanetary cargo delivery to date. The mission demonstrates key technologies needed for future human missions, including precision landing, cargo deployment, and surface operations in the harsh Martian environment. NASA and international space agencies view this success as a crucial step toward establishing a permanent human presence on Mars within the next decade."
      },
      {
        sourceName: "Tesla Motors",
        title: "Tesla Unveils Revolutionary Solid-State Battery with 1000-Mile Range",
        description: "New battery technology promises to eliminate range anxiety with 1000-mile driving range and 5-minute charging times.",
        url: "https://tesla.com/blog/solid-state-battery-breakthrough",
        urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        category: "technology",
        content: "Tesla has announced a revolutionary breakthrough in battery technology with the development of solid-state batteries capable of providing over 1000 miles of driving range. The new battery chemistry eliminates the need for liquid electrolytes, resulting in significantly improved energy density, faster charging speeds, and enhanced safety. Initial testing shows the batteries can charge from 0% to 80% in under 5 minutes using Tesla's new ultra-fast charging network. The technology is expected to be integrated into Tesla vehicles starting in 2026, potentially revolutionizing electric vehicle adoption and eliminating range anxiety for consumers worldwide."
      },
      {
        sourceName: "Climate Science Journal",
        title: "Antarctic Ice Sheet Shows Unexpected Stability Despite Global Warming",
        description: "New research reveals that West Antarctic ice shelves may be more resilient to climate change than previously predicted.",
        url: "https://climatescience.org/antarctic-ice-stability-study",
        urlToImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        category: "science",
        content: "Scientists studying Antarctica's ice sheets have discovered unexpected stability patterns that suggest some regions may be more resilient to global warming than climate models predicted. Research teams using advanced satellite imagery and underwater sensors found that certain ice shelves are developing natural barriers that slow melting rates. The findings indicate that while climate change continues to pose significant threats to polar ice, some Antarctic regions may contribute less to sea level rise than worst-case scenarios suggest. However, researchers emphasize that this discovery doesn't diminish the urgent need for global climate action, as other regions remain highly vulnerable to warming temperatures."
      }
    ];

    let articlesCreated = 0;
    let marketsCreated = 0;

    for (const articleData of mockArticles) {
      try {
        // Create article
        const article = await prisma.article.create({
          data: articleData
        });

        console.log(`✅ Created article: ${article.title}`);
        articlesCreated++;        // Create market for the article
        try {
          const market = await createMarketForArticle(article.id);
          console.log(`📊 Created market ${market.id} for article ${article.id}`);
          marketsCreated++;
        } catch (marketError) {
          if (marketError.message && marketError.message.includes('already has a market')) {
            console.log(`⚠️ Market already exists for article: ${article.title}`);
          } else {
            console.error(`❌ Error creating market:`, marketError.message || marketError);
          }
        }

      } catch (articleError) {
        if (articleError.code === 'P2002') {
          console.log(`⚠️ Article already exists: ${articleData.title}`);
        } else {
          console.error(`❌ Error creating article:`, articleError.message);
        }
      }
    }

    console.log(`\n🎉 Mock news creation completed!`);
    console.log(`📰 Articles created: ${articlesCreated}`);
    console.log(`📊 Markets created: ${marketsCreated}`);

    // Show final stats
    const totalArticles = await prisma.article.count();
    const totalMarkets = await prisma.market.count();
    
    console.log(`\n📈 Database totals:`);
    console.log(`   Total articles: ${totalArticles}`);
    console.log(`   Total markets: ${totalMarkets}`);

  } catch (error) {
    console.error('❌ Error creating mock news:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockNewsArticles();
