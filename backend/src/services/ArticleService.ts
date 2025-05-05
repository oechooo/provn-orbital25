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

export class ArticleService {
    constructor(private readonly prisma: PrismaClient) {}
    
    async createArticle(data: CreateArticleInput): Promise<Article> {
        return this.prisma.article.create({
            data,
            include: {
                market: true
            }
        });
    }

    async getArticleById(id: number): Promise<(Article & { market: Market | null }) | null> {
        return this.prisma.article.findUnique({
            where: { id },
            include: {
                market: true
            }
        });
    }

    async getArticleByUrl(url: string): Promise<(Article & { market: Market | null }) | null> {
        return this.prisma.article.findUnique({
            where: { url },
            include: {
                market: true
            }
        });
    }

    async listArticles(options: {
        includeMarket?: boolean;
        category?: string;
        resolved?: boolean;
        take?: number;
        skip?: number;
    } = {}): Promise<(Article & { market: Market | null })[]> {
        const { includeMarket = true, category, resolved, take, skip } = options;

        return this.prisma.article.findMany({
            where: {
                ...(category && { category }),
                ...(resolved !== undefined && {
                    market: {
                        resolved
                    }
                })
            },
            include: {
                market: includeMarket
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take,
            skip
        });
    }

    async getArticleWithActiveMarket(id: number): Promise<(Article & { market: Market | null }) | null> {
        return this.prisma.article.findFirst({
            where: {
                id,
                market: {
                    resolved: false
                }
            },
            include: {
                market: true
            }
        });
    }

    async getArticlesWithoutMarkets(): Promise<Article[]> {
        return this.prisma.article.findMany({
            where: {
                market: null
            }
        });
    }

    async getArticlesByCategory(category: string): Promise<(Article & { market: Market | null })[]> {
        return this.prisma.article.findMany({
            where: {
                category
            },
            include: {
                market: true
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });
    }

    async getRecentArticles(limit: number = 10): Promise<(Article & { market: Market | null })[]> {
        return this.prisma.article.findMany({
            take: limit,
            orderBy: {
                publishedAt: 'desc'
            },
            include: {
                market: true
            }
        });
    }

    async deleteArticle(id: number): Promise<void> {
        await this.prisma.article.delete({
            where: { id }
        });
    }
}