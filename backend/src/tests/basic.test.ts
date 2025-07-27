import { TestSetup } from './setup/testSetup';

describe('Basic Database Tests', () => {
  let prisma: any;

  beforeAll(async () => {
    prisma = await TestSetup.setupTestDatabase();
  });

  beforeEach(async () => {
    await TestSetup.resetDatabase();
  });

  afterAll(async () => {
    await TestSetup.teardown();
  });

  test('should connect to database', async () => {
    expect(prisma).toBeDefined();
  });

  test('should create and retrieve a user', async () => {
    const user = await TestSetup.createTestUser({
      username: 'basictest',
      email: 'basic@test.com'
    });

    expect(user).toBeDefined();
    expect(user.username).toBe('basictest');
    expect(user.email).toBe('basic@test.com');
    expect(user.provePoints).toBe(1000);
  });

  test('should create and retrieve an article', async () => {
    const article = await TestSetup.createTestArticle({
      title: 'Test Article',
      url: 'https://test.com/basic'
    });

    expect(article).toBeDefined();
    expect(article.title).toBe('Test Article');
    expect(article.url).toBe('https://test.com/basic');
  });

  test('should create a market for an article', async () => {
    const article = await TestSetup.createTestArticle();
    const market = await TestSetup.createTestMarket(article.id);

    expect(market).toBeDefined();
    expect(market.articleId).toBe(article.id);
    expect(market.probTrue).toBe(0.5);
    expect(market.probFalse).toBe(0.5);
  });
});
