const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingMarkets() {
  console.log('🔍 Checking for articles without markets...');
  
  try {
    // Find all articles without markets
    const articlesWithoutMarkets = await prisma.article.findMany({
      where: {
        market: null
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📊 Found ${articlesWithoutMarkets.length} articles without markets`);

    if (articlesWithoutMarkets.length === 0) {
      console.log('✅ All articles already have markets!');
      return;
    }

    let created = 0;
    let failed = 0;

    for (const article of articlesWithoutMarkets) {
      try {
        // Create market with default values
        const market = await prisma.market.create({
          data: {
            articleId: article.id,
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

        console.log(`✅ Created market ${market.id} for article ${article.id}: "${article.title.substring(0, 50)}..."`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create market for article ${article.id}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`✅ Markets created: ${created}`);
    console.log(`❌ Failed: ${failed}`);

    // Verify the results
    const updatedCount = await prisma.article.count({
      where: {
        market: {
          isNot: null
        }
      }
    });

    const totalArticles = await prisma.article.count();
    
    console.log(`\n🎯 Final Status:`);
    console.log(`📰 Total articles: ${totalArticles}`);
    console.log(`📊 Articles with markets: ${updatedCount}`);
    console.log(`⚠️  Articles without markets: ${totalArticles - updatedCount}`);

    if (updatedCount === totalArticles) {
      console.log(`\n🎉 SUCCESS: All articles now have markets!`);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createMissingMarkets();
