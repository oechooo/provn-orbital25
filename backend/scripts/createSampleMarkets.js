const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleMarkets() {
  try {
    // Create some sample articles and markets
    const sampleData = [      {
        sourceName: "CryptoNews",
        title: "Will Bitcoin reach $100,000 by end of 2025?",
        description: "Cryptocurrency analysts predict Bitcoin could hit six figures as institutional adoption continues to grow. Market sentiment remains bullish despite recent volatility.",
        url: "https://example.com/bitcoin-100k",
        publishedAt: new Date('2025-01-15')
      },      {
        sourceName: "SpaceDaily",
        title: "Will SpaceX successfully land humans on Mars by 2030?",
        description: "Elon Musk's ambitious timeline for Mars colonization faces technical and logistical challenges. Recent Starship tests show promising progress.",
        url: "https://example.com/spacex-mars",
        publishedAt: new Date('2025-02-01')
      },      {
        sourceName: "TechReview",
        title: "Will AI models exceed human performance in all cognitive tasks by 2027?",
        description: "Rapid advances in artificial intelligence raise questions about when AGI might be achieved. Current models show remarkable capabilities but still have limitations.",
        url: "https://example.com/ai-agi",
        publishedAt: new Date('2025-02-10')
      },      {
        sourceName: "ClimateReport",
        title: "Will renewable energy account for 80% of global power by 2035?",
        description: "Climate goals and technological advances push renewable energy adoption. Policy changes and cost reductions accelerate the transition.",
        url: "https://example.com/renewable-energy",
        publishedAt: new Date('2025-02-15')
      }
    ];

    for (const data of sampleData) {
      // Check if article already exists
      const existingArticle = await prisma.article.findFirst({
        where: { title: data.title }
      });

      if (!existingArticle) {
        // Create article
        const article = await prisma.article.create({
          data: data
        });

        // Create market for the article
        await prisma.market.create({
          data: {
            articleId: article.id,
            resolved: false,
            outcome: null
          }
        });

        console.log(`Created market for: ${data.title}`);
      } else {
        console.log(`Market already exists for: ${data.title}`);
      }
    }

    console.log('Sample markets created successfully!');
  } catch (error) {
    console.error('Error creating sample markets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleMarkets();
