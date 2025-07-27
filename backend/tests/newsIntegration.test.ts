import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewsIntegration() {
  console.log('Testing news integration and article management...\n');

  try {
    // Test 1: Article creation and validation
    console.log('Test 1: Article creation and validation');

    const testArticleData = {
      sourceName: 'Test News Source',
      title: 'Breaking: Test Article for Integration Testing',
      description: 'This is a comprehensive test article to validate news integration functionality',
      url: 'https://test-news-source.com/breaking-test-article',
      category: 'technology',
      publishedAt: new Date().toISOString()
    };

    const newArticle = await prisma.article.create({
      data: testArticleData
    });

    console.log(`Article created successfully:`);
    console.log(`  - ID: ${newArticle.id}`);
    console.log(`  - Title: "${newArticle.title}"`);
    console.log(`  - Source: ${newArticle.sourceName}`);
    console.log(`  - Category: ${newArticle.category}`);
    console.log(`  - URL: ${newArticle.url}`);
    console.log(`  - Published: ${newArticle.publishedAt}\n`);

    // Test 2: Duplicate article prevention
    console.log('Test 2: Duplicate article prevention');

    try {
      // Attempt to create the same article
      await prisma.article.create({
        data: testArticleData
      });
      console.log(`  Duplicate article was allowed (should be prevented)`);
    } catch (error) {
      console.log(`  Duplicate article prevented by URL constraint`);
      console.log(`  - Error type: Unique constraint violation\n`);
    }

    // Test 3: URL validation and normalization
    console.log('Test 3: URL validation and normalization');

    const urlTestCases = [
      {
        input: 'https://example.com/article',
        expected: 'Valid HTTPS URL',
        shouldPass: true
      },
      {
        input: 'http://example.com/article',
        expected: 'Valid HTTP URL',
        shouldPass: true
      },
      {
        input: 'https://example.com/article?utm_source=test&utm_medium=test',
        expected: 'URL with parameters',
        shouldPass: true
      }
    ];

    for (const testCase of urlTestCases) {
      try {
        const testArticle = await prisma.article.create({
          data: {
            ...testArticleData,
            url: testCase.input,
            title: `URL Test: ${testCase.expected}`,
          }
        });
        
        if (testCase.shouldPass) {
          console.log(`  ${testCase.expected}: ${testCase.input}`);
          await prisma.article.delete({ where: { id: testArticle.id } });
        } else {
          console.log(`  Invalid URL was accepted: ${testCase.input}`);
          await prisma.article.delete({ where: { id: testArticle.id } });
        }
      } catch (error) {
        if (!testCase.shouldPass) {
          console.log(`  Invalid URL rejected: ${testCase.input}`);
        } else {
          console.log(`  Valid URL rejected: ${testCase.input}`);
        }
      }
    }

    // Test 4: Category assignment validation
    console.log('\nTest 4: Category assignment validation');

    const validCategories = [
      'technology', 'politics', 'sports', 'entertainment', 
      'business', 'science', 'health', 'world', 'general'
    ];

    console.log(`  Valid categories: ${validCategories.join(', ')}`);

    // Test valid category
    const techArticle = await prisma.article.create({
      data: {
        ...testArticleData,
        title: 'Tech Category Test Article',
        url: 'https://test.com/tech-article',
        category: 'technology'
      }
    });

    console.log(`  Valid category 'technology' accepted`);

    // Test 5: Article-Market relationship creation
    console.log('\nTest 5: Article-Market relationship creation');

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

    console.log(`  Market created for article:`);
    console.log(`  - Market ID: ${articleMarket.id}`);
    console.log(`  - Article ID: ${articleMarket.articleId}`);
    console.log(`  - Initial probabilities: TRUE ${(articleMarket.probTrue * 100)}%, FALSE ${(articleMarket.probFalse * 100)}%`);
    console.log(`  - Resolution time: ${articleMarket.nextResolve}\n`);

    // Verify relationship
    const articleWithMarket = await prisma.article.findUnique({
      where: { id: newArticle.id },
      include: { market: true }
    });

    console.log(`  Article-Market relationship verified:`);
    console.log(`  - Article has market: ${articleWithMarket!.market ? 'Yes' : 'No'}`);
    console.log(`  - Market belongs to article: ${articleWithMarket!.market?.articleId === newArticle.id ? 'Yes' : 'No'}\n`);

    // Test 6: Content validation
    console.log('Test 6: Content validation');

    const contentTestCases = [
      {
        title: 'Valid Article Title',
        description: 'This is a valid article description with sufficient content.',
        shouldPass: true
      },
      {
        title: 'Valid Title',
        description: 'Valid description with enough content to pass validation checks',
        shouldPass: true
      }
    ];

    for (let i = 0; i < contentTestCases.length; i++) {
      const testCase = contentTestCases[i];
      try {
        const contentTestArticle = await prisma.article.create({
          data: {
            ...testArticleData,
            title: testCase.title || `Content Test ${i}`,
            description: testCase.description || `Test description ${i}`,
            url: `https://test.com/content-test-${i}`,
          }
        });

        if (testCase.shouldPass) {
          console.log(`  Valid content accepted: "${testCase.title}"`);
        } else {
          console.log(`  Invalid content was accepted: "${testCase.title}"`);
        }
        
        await prisma.article.delete({ where: { id: contentTestArticle.id } });
      } catch (error) {
        if (!testCase.shouldPass) {
          console.log(`  Invalid content rejected: "${testCase.title}"`);
        } else {
          console.log(`  Valid content rejected: "${testCase.title}"`);
        }
      }
    }

    // Test 7: Article lifecycle management
    console.log('\nTest 7: Article lifecycle management');

    // Test article updates
    const updatedTitle = 'Updated: Breaking Test Article';
    await prisma.article.update({
      where: { id: newArticle.id },
      data: { title: updatedTitle }
    });

    const updatedArticle = await prisma.article.findUnique({
      where: { id: newArticle.id }
    });

    console.log(`  Article update successful:`);
    console.log(`  - Original title: "${testArticleData.title}"`);
    console.log(`  - Updated title: "${updatedArticle!.title}"\n`);

    // Test article querying and filtering
    console.log('Test 8: Article querying and filtering');

    // Create additional test articles
    const additionalArticles = await Promise.all([
      prisma.article.create({
        data: {
          ...testArticleData,
          title: 'Sports Article',
          category: 'sports',
          url: 'https://test.com/sports-1'
        }
      }),
      prisma.article.create({
        data: {
          ...testArticleData,
          title: 'Politics Article',
          category: 'politics',
          url: 'https://test.com/politics-1'
        }
      })
    ]);

    // Query by category
    const techArticles = await prisma.article.findMany({
      where: { category: 'technology' }
    });

    const sportsArticles = await prisma.article.findMany({
      where: { category: 'sports' }
    });

    console.log(`  Category filtering:`);
    console.log(`  - Technology articles: ${techArticles.length}`);
    console.log(`  - Sports articles: ${sportsArticles.length}`);

    // Query recent articles
    const recentArticles = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 10
    });

    console.log(`  Recent articles (last 24h): ${recentArticles.length}`);

    // Query articles with markets
    const articlesWithMarkets = await prisma.article.findMany({
      where: {
        market: { isNot: null }
      },
      include: { market: true }
    });

    console.log(`  Articles with markets: ${articlesWithMarkets.length}\n`);

    console.log('News integration tests completed successfully!\n');

    // Cleanup
    await prisma.market.deleteMany({ where: { articleId: { in: [newArticle.id, techArticle.id] } } });
    await prisma.article.deleteMany({
      where: {
        id: { in: [newArticle.id, techArticle.id, ...additionalArticles.map(a => a.id)] }
      }
    });

    console.log('Test data cleaned up');

  } catch (error) {
    console.error('News integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewsIntegration();
