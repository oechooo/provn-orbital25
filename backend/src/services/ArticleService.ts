import { PrismaClient, Article, Market } from '@prisma/client';

export interface CreateArticleInput {
    sourceName: string;
    author?: string;
    title: string;
    description?: string;
    url: string;
    urlToImage?: string;
    publishedAt: Date;
    content?: string;
    category?: string;
}

type ArticleTimeRange = '24h' | '1m' | '5m';

interface ArticleFilterOptions {
  category?: string;
  range?: ArticleTimeRange;
  query?: string;
  limit?: number;
}

export class ArticleService {
    constructor(private readonly prisma: PrismaClient) {}
    
    // Create a new article
    protected async createArticle(data: CreateArticleInput): Promise<Article> {
        return this.prisma.article.create({
            data,
            include: {
                market: true
            }
        });
    }

    // Delete an article by ID
    protected async deleteArticle(id: number): Promise<void> {
        await this.prisma.article.delete({
            where: { id }
        });
    }

    // Get an article by ID
    protected async getArticleById(id: number): Promise<(Article & { market: Market | null }) | null> {
        return this.prisma.article.findUnique({
            where: { id },
            include: {
                market: true
            }
        });
    }

    // Filter articles by category, date range, and/or queries
    public async getFilteredArticles(options: ArticleFilterOptions): Promise<(Article & { market: Market | null })[]> {
        const { category, range, query, limit = 10 } = options;

        const dateFilter = this.buildDateFilter(range);
        const queryFilter = this.buildQueryFilter(query);

        return this.prisma.article.findMany({
            where: {
            ...(category && { category }),
            ...dateFilter,
            ...queryFilter,
            },
            take: limit,
            orderBy: {
            publishedAt: 'desc',
            },
            include: {
            market: true,
            },
        });
    }

    // Build date filter for articles
    private buildDateFilter(range?: ArticleTimeRange) {
        if (!range) return {};

        const now = new Date();
        let gte: Date | undefined;
        let lt: Date | undefined;

        switch (range) {
            case '24h':
                gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                lt = now;
                break;
            case '1m':
                lt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                gte = new Date();
                gte.setMonth(gte.getMonth() - 1);
                break;
            case '5m':
                lt = new Date();
                lt.setMonth(lt.getMonth() - 1);
                gte = new Date();
                gte.setMonth(gte.getMonth() - 5);
                break;
            default:
                throw new Error("Invalid range. Use '24h', '1m', or '5m'.");
        }

        return {
            publishedAt: {
            ...(gte && { gte }),
            ...(lt && { lt }),
            }
        };
    }

    // Filter articles by query
    // TODO: Implement a more advanced search algorithm like semantic search
    private buildQueryFilter(query?: string) {
        if (!query) return {};

        return {
            OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            ]
        };
    }

    
    // Get articles that do not have any associated markets (should be empty)
    // TODO: Write test for this
    private async getArticlesWithoutMarkets(): Promise<Article[]> {
        return this.prisma.article.findMany({
            where: {
                market: null
            }
        });
    }
}