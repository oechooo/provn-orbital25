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
exports.StartupService = void 0;
class StartupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    runStartupTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Running startup tasks...');
            if (process.env.DISABLE_STARTUP_NEWS_POPULATION === 'true') {
                console.log('Startup news population disabled by environment variable');
                return;
            }
            try {
                const shouldPopulateNews = yield this.shouldPopulateNews();
                if (shouldPopulateNews) {
                    console.log('Running news population on startup...');
                    yield this.runNewsPopulation();
                }
                else {
                    console.log('Skipping news population (already has recent articles)');
                }
                console.log('Startup tasks completed successfully');
            }
            catch (error) {
                console.error('Startup tasks failed:', error);
            }
        });
    }
    shouldPopulateNews() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recentArticles = yield this.prisma.article.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                });
                return recentArticles === 0;
            }
            catch (error) {
                console.error('Error checking if news population is needed:', error);
                return true;
            }
        });
    }
    runNewsPopulation() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Executing news population...');
            try {
                yield this.populateNewsDirectly();
                console.log('News population completed successfully');
            }
            catch (error) {
                console.error('News population failed:', error.message);
                throw error;
            }
        });
    }
    populateNewsDirectly() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            console.log('[NEWS] Starting direct news population...');
            const API_KEY = process.env.NEWS_API_KEY;
            if (!API_KEY) {
                console.error('[NEWS] NEWS_API_KEY not found in environment variables');
                return;
            }
            const axios = require('axios');
            const bcrypt = require('bcrypt');
            try {
                let bot = yield this.prisma.user.findUnique({
                    where: { email: 'bot@provn.io' }
                });
                if (!bot) {
                    console.log('[NEWS] Creating market bot...');
                    const hashedPassword = yield bcrypt.hash('bot_secure_password_123', 10);
                    bot = yield this.prisma.user.create({
                        data: {
                            username: 'market_bot',
                            email: 'bot@provn.io',
                            password: hashedPassword,
                            provePoints: 50000,
                            avatarSkinColor: '9ca3af',
                            avatarHairColor: '374151',
                            avatarHair: 'short01',
                            avatarEyes: 'variant01',
                            avatarMouth: 'variant01',
                            avatarAccessories: 'none'
                        }
                    });
                    console.log('[NEWS] Created bot user with 50000 PP');
                }
                else {
                    console.log(`[NEWS] Bot user exists with ${bot.provePoints} PP`);
                    if (bot.provePoints < 1000) {
                        yield this.prisma.user.update({
                            where: { id: bot.id },
                            data: { provePoints: 50000 }
                        });
                        console.log('[NEWS] Topped up bot prove points');
                    }
                }
                const categories = ['technology', 'business'];
                const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                let totalCreated = 0;
                let totalMarkets = 0;
                for (const category of categories) {
                    console.log(`[NEWS] Fetching ${category} articles...`);
                    const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&from=${fromDate}&pageSize=3&page=1`;
                    const response = yield axios.get(url);
                    const articles = response.data.articles;
                    console.log(`[NEWS] Found ${articles.length} articles for ${category}`);
                    for (const article of articles.slice(0, 3)) {
                        try {
                            const newArticle = yield this.prisma.article.create({
                                data: {
                                    sourceName: (_b = (_a = article.source) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unknown',
                                    author: (_c = article.author) !== null && _c !== void 0 ? _c : null,
                                    title: article.title,
                                    description: (_d = article.description) !== null && _d !== void 0 ? _d : null,
                                    url: article.url,
                                    urlToImage: (_e = article.urlToImage) !== null && _e !== void 0 ? _e : null,
                                    publishedAt: new Date(article.publishedAt),
                                    content: (_f = article.content) !== null && _f !== void 0 ? _f : null,
                                    category: category,
                                },
                            });
                            const market = yield this.prisma.market.create({
                                data: {
                                    articleId: newArticle.id,
                                    resolveCount: 0,
                                    outcome: null,
                                    sharesTrue: 0,
                                    sharesFalse: 0,
                                    probTrue: 0.5,
                                    probFalse: 0.5,
                                    nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                    closed: false
                                }
                            });
                            console.log(`[NEWS] Created: ${article.title.substring(0, 50)}...`);
                            totalCreated++;
                            totalMarkets++;
                            const { MarketService } = require('../services/MarketService');
                            const { StakeService } = require('../services/StakeService');
                            const marketService = new MarketService(this.prisma);
                            const stakeService = new StakeService(this.prisma);
                            const numStakes = 2 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < numStakes; i++) {
                                try {
                                    const stakeAmount = 20 + Math.floor(Math.random() * 30);
                                    const prediction = Math.random() > 0.5;
                                    yield stakeService.createStake(bot.id, market.id, prediction, stakeAmount);
                                    console.log(`[NEWS]   - Bot stake: ${stakeAmount} PP on ${prediction ? 'TRUE' : 'FALSE'}`);
                                    yield new Promise(resolve => setTimeout(resolve, 50));
                                }
                                catch (stakeError) {
                                    console.log(`[NEWS]   - Stake failed: ${stakeError.message}`);
                                    break;
                                }
                            }
                        }
                        catch (err) {
                            if (err.code === 'P2002') {
                                console.log(`[NEWS] Skipping duplicate: ${article.title.substring(0, 50)}...`);
                            }
                            else {
                                console.error(`[NEWS] Error creating article: ${err.message}`);
                            }
                        }
                    }
                }
                console.log(`[NEWS] Summary: ${totalCreated} articles, ${totalMarkets} markets created`);
            }
            catch (error) {
                console.error('[NEWS] Error in direct news population:', error.message);
                throw error;
            }
        });
    }
}
exports.StartupService = StartupService;
