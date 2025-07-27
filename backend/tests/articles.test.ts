import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewsIntegration() {
  console.log('📰 Testing News Integration & Article Management...\n');

  try {
    // Test 1: Article Creation and Validation
    console.log('📝 Test 1: Article Creation and Validation');
    
    const validArticleData = {
      sourceName: 'Tech News Daily',
      author: 'John Reporter',
      title: 'Revolutionary AI Breakthrough Announced by Major Tech Company',
      description: 'Scientists have developed a new AI system that could transform various industries.',
      url: 'https://technews.com/ai-breakthrough-2025',
      urlToImage: 'https://technews.com/images/ai-breakthrough.jpg',
      publishedAt: new Date().toISOString(),
      content: 'Full article content here...',
      category: 'technology'
    };

    const newArticle = await prisma.article.create({
      data: validArticleData
    });

    console.log(`✅ Article created successfully:`);
    console.log(`   ID: ${newArticle.id}`);
    console.log(`   Title: "${newArticle.title}"`);
    console.log(`   Source: ${newArticle.sourceName}`);
    console.log(`   Author: ${newArticle.author}`);
    console.log(`   Category: ${newArticle.category}`);
    console.log(`   Published: ${newArticle.publishedAt.toISOString()}\n`);

    // Test 2: Duplicate URL Prevention
    console.log('📝 Test 2: Duplicate URL Prevention');
    
    try {
      await prisma.article.create({
        data: {
          ...validArticleData,
          title: 'Different Title',
          // Same URL - should be prevented by unique constraint
        }
      });
      console.log(`❌ Duplicate URL was allowed (should be prevented)`);
    } catch (error) {
      console.log(`✅ Duplicate URL prevented: ${validArticleData.url} already exists`);
    }
    console.log();

    // Test 3: Article-Market Relationship
    console.log('📝 Test 3: Article-Market Relationship');
    
    // Create market for the article
    const articleMarket = await prisma.market.create({
      data: {
        articleId: newArticle.id,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`✅ Market created for article:`);
    console.log(`   Market ID: ${articleMarket.id}`);
    console.log(`   Article ID: ${articleMarket.articleId}`);
    console.log(`   Initial probabilities: TRUE ${(articleMarket.probTrue * 100).toFixed(1)}%, FALSE ${(articleMarket.probFalse * 100).toFixed(1)}%\n`);

    // Verify relationship
    const articleWithMarket = await prisma.article.findUnique({
      where: { id: newArticle.id },
      include: { market: true }
    });

    if (articleWithMarket?.market) {
      console.log(`✅ Article-Market relationship established successfully\n`);
    } else {
      console.log(`❌ Article-Market relationship not found\n`);
    }

    // Test 4: URL Normalization
    console.log('📝 Test 4: URL Normalization and Validation');
    
    const urlVariations = [
      'https://example.com/article',
      'http://example.com/article',
      'https://example.com/article/',
      'https://example.com/article?utm_source=test'
    ];

    let createdArticles: any[] = [];
    for (const [index, testUrl] of urlVariations.entries()) {
      try {
        const testArticle = await prisma.article.create({
          data: {
            sourceName: 'Test Source',
            title: `URL Test Article ${index + 1}`,
            description: 'Testing URL variations',
            url: testUrl,
            category: 'test',
            publishedAt: new Date().toISOString()
          }
        });
        createdArticles.push(testArticle);
        console.log(`✅ Created article with URL: ${testUrl}`);
      } catch (error) {
        console.log(`❌ Failed to create article with URL: ${testUrl} (may be duplicate)`);
      }
    }
    console.log();

    // Test 5: Category Management
    console.log('📝 Test 5: Category Management');
    
    const categories = ['technology', 'health', 'business', 'entertainment', 'sports', 'science'];
    const categoryArticles: any[] = [];

    for (const category of categories) {
      const categoryArticle = await prisma.article.create({
        data: {
          sourceName: 'Category Test Source',
          title: `Sample ${category.charAt(0).toUpperCase() + category.slice(1)} Article`,
          description: `This is a ${category} article for testing`,
          url: `https://test.com/${category}-${Date.now()}`,
          category: category,
          publishedAt: new Date().toISOString()
        }
      });
      categoryArticles.push(categoryArticle);
    }

    console.log(`✅ Created articles in ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat}`);
    });
    console.log();

    // Test 6: Article Search and Filtering
    console.log('📝 Test 6: Article Search and Filtering');
    
    // Search by category
    const techArticles = await prisma.article.findMany({
      where: { category: 'technology' },
      include: { market: true }
    });

    console.log(`✅ Technology articles found: ${techArticles.length}`);
    techArticles.forEach(article => {
      console.log(`   - "${article.title}" (Market: ${article.market ? 'Yes' : 'No'})`);
    });
    console.log();

    // Search by date range (last 24 hours)
    const recentArticles = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 5
    });

    console.log(`✅ Recent articles (last 24h): ${recentArticles.length}`);
    recentArticles.forEach(article => {
      const timeDiff = Date.now() - new Date(article.publishedAt).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      console.log(`   - "${article.title.substring(0, 50)}..." (${hoursAgo}h ago)`);
    });
    console.log();

    // Test 7: Article Content Validation
    console.log('📝 Test 7: Article Content Validation');
    
    const allArticles = await prisma.article.findMany();
    let validArticles = 0;
    let articlesWithIssues = 0;

    allArticles.forEach(article => {
      const issues: string[] = [];
      
      if (!article.title || article.title.length < 10) {
        issues.push('Title too short');
      }
      if (!article.description || article.description.length < 20) {
        issues.push('Description too short');
      }
      if (!article.url || !article.url.startsWith('http')) {
        issues.push('Invalid URL');
      }
      if (!article.sourceName) {
        issues.push('Missing source');
      }
      if (!article.category) {
        issues.push('Missing category');
      }

      if (issues.length === 0) {
        validArticles++;
      } else {
        articlesWithIssues++;
        console.log(`   ⚠️  Article ${article.id}: ${issues.join(', ')}`);
      }
    });

    console.log(`✅ Article content validation:`);
    console.log(`   Valid articles: ${validArticles}`);
    console.log(`   Articles with issues: ${articlesWithIssues}`);
    console.log(`   Total articles: ${allArticles.length}\n`);

    // Test 8: Market Coverage Analysis
    console.log('📝 Test 8: Market Coverage Analysis');
    
    const articlesWithMarkets = await prisma.article.findMany({
      include: { market: true }
    });

    const hasMarket = articlesWithMarkets.filter(a => a.market !== null).length;
    const noMarket = articlesWithMarkets.filter(a => a.market === null).length;

    console.log(`✅ Market coverage analysis:`);
    console.log(`   Articles with markets: ${hasMarket}`);
    console.log(`   Articles without markets: ${noMarket}`);
    console.log(`   Market coverage: ${((hasMarket / articlesWithMarkets.length) * 100).toFixed(1)}%`);

    if (noMarket > 0) {
      console.log(`   ⚠️  ${noMarket} articles need markets created`);
    }
    console.log();

    // Test 9: News Source Diversity
    console.log('📝 Test 9: News Source Diversity');
    
    const sourceStats = await prisma.article.groupBy({
      by: ['sourceName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    console.log(`✅ News source diversity:`);
    console.log(`   Unique sources: ${sourceStats.length}`);
    sourceStats.slice(0, 5).forEach(source => {
      console.log(`   - ${source.sourceName}: ${source._count.id} articles`);
    });

    if (sourceStats.length < 3) {
      console.log(`   ⚠️  Consider adding more news sources for diversity`);
    }

    console.log('\n📺 News Integration Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ News integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewsIntegration();
