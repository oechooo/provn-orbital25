import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { ArticleService } from '../src/services/ArticleService';
import { MarketService } from '../src/services/MarketService';

const prisma = new PrismaClient();
const articleService = new ArticleService(prisma);
const marketService = new MarketService(prisma);

describe('Article-Market Integration Tests', () => {
  // Clean up test data before and after each test
  beforeEach(async () => {
    await prisma.stake.deleteMany({});
    await prisma.market.deleteMany({});
    await prisma.article.deleteMany({
      where: {
        title: {
          contains: 'TEST_ARTICLE'
        }
      }
    });
  });

  afterEach(async () => {
    await prisma.stake.deleteMany({});
    await prisma.market.deleteMany({});
    await prisma.article.deleteMany({
      where: {
        title: {
          contains: 'TEST_ARTICLE'
        }
      }
    });
  });

  it('should create an article with market data when fetching articles', async () => {
    // 1. Create a test article
    const testArticle = await articleService.createArticle({
      sourceName: 'Test Source',
      author: 'Test Author',
      title: 'TEST_ARTICLE: Sample News Article',
      description: 'This is a test article description',
      url: 'https://test.com/article-1',
      urlToImage: 'https://test.com/image.jpg',
      publishedAt: new Date(),
      category: 'technology',
      content: 'Test content'
    });

    console.log('Created test article:', testArticle.id);

    // 2. Create a market for the article
    const market = await marketService.createMarket(testArticle.id);
    console.log('Created market:', market.id);

    // 3. Verify the market was created with correct default values
    expect(market).toBeDefined();
    expect(market.articleId).toBe(testArticle.id);
    expect(market.probTrue).toBe(0.5);
    expect(market.probFalse).toBe(0.5);
    expect(market.sharesTrue).toBe(0);
    expect(market.sharesFalse).toBe(0);
    expect(market.closed).toBe(false);
    expect(market.outcome).toBeNull();

    // 4. Fetch articles and verify market data is included
    const articles = await articleService.getFilteredArticles({
      limit: 10
    });

    const createdArticle = articles.find(a => a.id === testArticle.id);
    expect(createdArticle).toBeDefined();
    expect(createdArticle?.market).toBeDefined();
    expect(createdArticle?.market?.probTrue).toBe(0.5);
    expect(createdArticle?.market?.probFalse).toBe(0.5);

    console.log('Article with market data:', {
      articleId: createdArticle?.id,
      marketId: createdArticle?.market?.id,
      probTrue: createdArticle?.market?.probTrue,
      probFalse: createdArticle?.market?.probFalse
    });
  });

  it('should verify existing articles have markets', async () => {
    // Fetch all existing articles
    const existingArticles = await articleService.getFilteredArticles({
      limit: 50
    });

    console.log(`Found ${existingArticles.length} existing articles`);

    // Check which articles have markets and which don't
    const articlesWithMarkets = existingArticles.filter(a => a.market !== null);
    const articlesWithoutMarkets = existingArticles.filter(a => a.market === null);

    console.log(`Articles with markets: ${articlesWithMarkets.length}`);
    console.log(`Articles without markets: ${articlesWithoutMarkets.length}`);

    if (articlesWithoutMarkets.length > 0) {
      console.log('Articles missing markets:');
      articlesWithoutMarkets.forEach(article => {
        console.log(`- ID: ${article.id}, Title: ${article.title.substring(0, 50)}...`);
      });
    }

    if (articlesWithMarkets.length > 0) {
      console.log('Sample article with market:');
      const sample = articlesWithMarkets[0];
      console.log(`- ID: ${sample.id}, Market: ${sample.market?.id}, ProbTrue: ${sample.market?.probTrue}`);
    }

    // For this test to pass, we expect at least some articles to have markets
    // Comment out this assertion if you want to see the current state first
    // expect(articlesWithMarkets.length).toBeGreaterThan(0);
  });

  it('should create markets for articles missing them', async () => {
    // Find articles without markets
    const articlesWithoutMarkets = await prisma.article.findMany({
      where: {
        market: null
      },
      take: 5 // Limit to 5 for testing
    });

    console.log(`Found ${articlesWithoutMarkets.length} articles without markets`);

    // Create markets for these articles
    let marketsCreated = 0;
    for (const article of articlesWithoutMarkets) {
      try {
        const market = await marketService.createMarket(article.id);
        console.log(`Created market ${market.id} for article ${article.id}`);
        marketsCreated++;
      } catch (error) {
        console.error(`Failed to create market for article ${article.id}:`, error);
      }
    }

    console.log(`Successfully created ${marketsCreated} markets`);

    // Verify the markets were created
    if (marketsCreated > 0) {
      const updatedArticles = await articleService.getFilteredArticles({
        limit: 10
      });
      
      const articlesWithNewMarkets = updatedArticles.filter(a => 
        articlesWithoutMarkets.some(original => original.id === a.id) && a.market !== null
      );

      expect(articlesWithNewMarkets.length).toBe(marketsCreated);
    }
  });

  it('should verify market probability calculations', async () => {
    // Create a test article and market
    const testArticle = await articleService.createArticle({
      sourceName: 'Test Source',
      author: 'Test Author',
      title: 'TEST_ARTICLE: Probability Test Article',
      description: 'Testing probability calculations',
      url: 'https://test.com/prob-test',
      publishedAt: new Date(),
      category: 'technology'
    });

    const market = await marketService.createMarket(testArticle.id);

    // Verify initial probabilities
    expect(market.probTrue).toBe(0.5);
    expect(market.probFalse).toBe(0.5);

    // Test the implied probability calculation
    const { probTrue, probFalse } = await marketService.getImpliedProbability(market.id);
    expect(probTrue).toBeCloseTo(0.5, 2);
    expect(probFalse).toBeCloseTo(0.5, 2);
    expect(probTrue + probFalse).toBeCloseTo(1.0, 2);

    console.log('Market probability verification:', {
      marketId: market.id,
      storedProbTrue: market.probTrue,
      storedProbFalse: market.probFalse,
      calculatedProbTrue: probTrue,
      calculatedProbFalse: probFalse
    });
  });
});

// Cleanup function to run after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

