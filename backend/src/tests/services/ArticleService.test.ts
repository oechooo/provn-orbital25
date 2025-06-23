import { ArticleService } from '../../services/ArticleService';

const mockPrisma = {
  article: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ArticleService', () => {
  let articleService: ArticleService;

  beforeEach(() => {
    articleService = new ArticleService(mockPrisma as any);
    jest.clearAllMocks();
  });

  it('should create an article', async () => {
    mockPrisma.article.create.mockResolvedValue({
      id: 1,
      title: 'Test Article',
      market: null, // or provide a mock market object if needed
    });
    const article = await articleService.createArticle({
      title: 'Test Article',
      sourceName: 'Test',
      url: 'url',
      publishedAt: new Date(),
    });
    expect(article).toHaveProperty('title', 'Test Article');
    expect(article).toHaveProperty('market');
    expect(mockPrisma.article.create).toHaveBeenCalled();
  });

  it('should get an article by id', async () => {
    mockPrisma.article.findUnique.mockResolvedValue({ id: 1, title: 'Test Article' });
    const article = await articleService.getArticleById(1);
    expect(article).toHaveProperty('id', 1);
    expect(mockPrisma.article.findUnique).toHaveBeenCalled();
  });
});