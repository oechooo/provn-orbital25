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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.refreshArticles = exports.getArticleById = exports.getArticles = void 0;
const client_1 = require("../prisma/client");
const ArticleService_1 = require("../services/ArticleService");
const MarketService_1 = require("../services/MarketService");
const axios_1 = __importDefault(require("axios"));
const articleService = new ArticleService_1.ArticleService(client_1.prisma);
const marketService = new MarketService_1.MarketService(client_1.prisma);
const getArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, limit = 10, offset = 0 } = req.query;
        const articles = yield articleService.getFilteredArticles({
            category: category,
            limit: parseInt(limit),
        });
        res.json({
            articles,
            total: articles.length
        });
    }
    catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ message: 'Error fetching articles' });
    }
});
exports.getArticles = getArticles;
const getArticleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const article = yield articleService.getArticleById(parseInt(id));
        if (!article) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        res.json({ article });
    }
    catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ message: 'Error fetching article' });
    }
});
exports.getArticleById = getArticleById;
const refreshArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('🔄 Starting news refresh...');
        const API_KEY = process.env.NEWS_API_KEY;
        if (!API_KEY) {
            res.status(500).json({ message: 'News API key not configured' });
            return;
        }
        const CATEGORIES = ["business", "health", "science", "technology"];
        const ARTICLES_PER_CATEGORY = 5;
        let totalFetched = 0;
        let marketsCreated = 0;
        for (const category of CATEGORIES) {
            try {
                const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&pageSize=${ARTICLES_PER_CATEGORY}&language=en&sortBy=publishedAt`;
                console.log(`📰 Fetching ${category} articles...`);
                const response = yield axios_1.default.get(url);
                const articles = response.data.articles;
                for (const article of articles) {
                    if (!article.title || !article.url)
                        continue;
                    try {
                        // Create article
                        const newArticle = yield articleService.createArticle({
                            sourceName: ((_a = article.source) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Source',
                            author: article.author || null,
                            title: article.title,
                            description: article.description || null,
                            url: article.url,
                            urlToImage: article.urlToImage || null,
                            publishedAt: new Date(article.publishedAt),
                            content: article.content || null,
                            category: category,
                        });
                        console.log(`✅ Created article: ${newArticle.title}`);
                        totalFetched++;
                        // Create market for the article
                        try {
                            const market = yield marketService.createMarket(newArticle.id);
                            console.log(`📊 Created market ${market.id} for article ${newArticle.id}`);
                            marketsCreated++;
                        }
                        catch (marketError) {
                            if (marketError.message.includes('already has a market')) {
                                console.log(`⚠️ Market already exists for article: ${newArticle.title}`);
                            }
                            else {
                                console.error(`❌ Error creating market for article ${newArticle.id}:`, marketError.message);
                            }
                        }
                    }
                    catch (articleError) {
                        if (articleError.code === 'P2002') {
                            console.log(`⚠️ Article already exists: ${article.title}`);
                        }
                        else {
                            console.error(`❌ Error creating article:`, articleError.message);
                        }
                    }
                }
            }
            catch (categoryError) {
                console.error(`❌ Error fetching ${category} articles:`, categoryError);
            }
        }
        console.log(`🎉 News refresh completed: ${totalFetched} articles, ${marketsCreated} markets created`);
        res.json({
            message: 'Articles refreshed successfully',
            articlesCreated: totalFetched,
            marketsCreated: marketsCreated
        });
    }
    catch (error) {
        console.error('Refresh articles error:', error);
        res.status(500).json({ message: 'Error refreshing articles' });
    }
});
exports.refreshArticles = refreshArticles;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield articleService.getCategories();
        res.json({ categories });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});
exports.getCategories = getCategories;
//# sourceMappingURL=articleController.js.map