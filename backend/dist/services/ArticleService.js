"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
class ArticleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAllArticles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.article.findMany({
                orderBy: {
                    publishedAt: 'desc',
                }
            });
        });
    }
    createArticle(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.article.create({
                data
            });
        });
    }
    deleteArticle(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.article.delete({
                where: { id }
            });
        });
    }
    getArticleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.article.findUnique({
                where: { id }
            });
        });
    }
    getFilteredArticles(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, range, query, limit = 10 } = options;
            const dateFilter = this.buildDateFilter(range);
            const queryFilter = this.buildQueryFilter(query);
            return this.prisma.article.findMany({
                where: Object.assign(Object.assign(Object.assign({}, (category && { category })), dateFilter), queryFilter),
                take: limit,
                orderBy: {
                    publishedAt: 'desc',
                }
            });
        });
    }
    buildDateFilter(range) {
        if (!range)
            return {};
        const now = new Date();
        let gte;
        let lt;
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
            publishedAt: Object.assign(Object.assign({}, (gte && { gte })), (lt && { lt }))
        };
    }
    buildQueryFilter(query) {
        if (!query)
            return {};
        return {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
            ]
        };
    }
}
exports.ArticleService = ArticleService;
//# sourceMappingURL=ArticleService.js.map