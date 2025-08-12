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
exports.MarketService = void 0;
const StakeService_1 = require("./StakeService");
const LIQUIDITY = 1000;
const CONFIDENCE_THRESHOLD = 0.80;
class MarketService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAllMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.market.findMany({
                include: {
                    article: true,
                    stakes: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    id: 'desc',
                },
            });
        });
    }
    getMarketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const market = yield this.prisma.market.findUnique({
                    where: { id },
                    include: {
                        article: true,
                        stakes: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!market)
                    throw new Error('Market not found');
                return market;
            }
            catch (error) {
                if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Inconsistent query result')) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('required to return data'))) {
                    console.warn(`MarketService: Relationship inconsistency for market ${id}, fetching without includes`);
                    const market = yield this.prisma.market.findUnique({
                        where: { id }
                    });
                    if (!market)
                        throw new Error('Market not found');
                    return Object.assign(Object.assign({}, market), { article: null, stakes: [] });
                }
                throw error;
            }
        });
    }
    createMarket(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield this.prisma.article.findFirst({
                where: {
                    id: articleId,
                    market: null,
                },
            });
            if (!article) {
                throw new Error('Article not found or already has a market');
            }
            const nextResolve = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return this.prisma.market.create({
                data: {
                    articleId,
                    resolveCount: 0,
                    outcome: null,
                    sharesTrue: 0,
                    sharesFalse: 0,
                    probTrue: 0.5,
                    probFalse: 0.5,
                    nextResolve,
                },
                include: {
                    article: true,
                    stakes: true,
                },
            });
        });
    }
    getMarket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.market.findUnique({
                where: { id },
                include: {
                    article: true,
                    stakes: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    getMarketByArticle(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.market.findUnique({
                where: { articleId },
                include: {
                    article: true,
                    stakes: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    getMarketByArticleId(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.prisma.market.findUnique({
                where: { articleId },
                include: {
                    article: true,
                    stakes: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!market)
                throw new Error('Market not found for this article');
            return market;
        });
    }
    listMarkets() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { includeClosed = false, category, take, skip } = options;
            return this.prisma.market.findMany({
                where: {
                    closed: includeClosed ? undefined : false,
                    article: category
                        ? {
                            category,
                        }
                        : undefined,
                },
                include: {
                    article: true,
                    stakes: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take,
                skip,
            });
        });
    }
    isContentious(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { probTrue, probFalse } = yield this.getImpliedProbability(marketId);
            return !(probTrue >= CONFIDENCE_THRESHOLD || probFalse >= CONFIDENCE_THRESHOLD);
        });
    }
    resolveMarket(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            if (!market)
                throw new Error('Market not found');
            let outcomeToUse = market.outcome;
            let shouldRefund = false;
            if (outcomeToUse === null) {
                const { probTrue, probFalse } = yield this.getImpliedProbability(marketId);
                const contentious = yield this.isContentious(marketId);
                if (contentious) {
                    shouldRefund = true;
                }
                else {
                    outcomeToUse = probTrue > probFalse;
                }
            }
            const stakesToResolve = market.stakes.filter((stake) => !stake.resolved);
            const stakeService = new StakeService_1.StakeService(this.prisma);
            for (const stake of stakesToResolve) {
                if (shouldRefund) {
                    yield stakeService.refundStake(stake.id);
                }
                else {
                    yield stakeService.resolveStake(stake.id, outcomeToUse);
                }
            }
            let newNextResolve = market.nextResolve;
            let newClosed = market.closed;
            let newResolveCount = market.resolveCount + 1;
            let newOutcome = null;
            const newLastResolve = market.nextResolve;
            if (market.resolveCount === 0) {
                newNextResolve = new Date(market.createdAt.getTime());
                newNextResolve.setMonth(newNextResolve.getMonth() + 1);
            }
            else if (market.resolveCount === 1) {
                newNextResolve = new Date(market.createdAt.getTime());
                newNextResolve.setMonth(newNextResolve.getMonth() + 6);
            }
            else if (market.resolveCount === 2) {
                newClosed = true;
            }
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    lastResolve: newLastResolve,
                    nextResolve: newNextResolve,
                    closed: newClosed,
                    resolveCount: newResolveCount,
                    outcome: newOutcome,
                },
            });
        });
    }
    getMarketStatistics(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.prisma.market.findUnique({
                where: { id },
                include: {
                    stakes: true,
                },
            });
            if (!market) {
                throw new Error('Market not found');
            }
            const trueStakes = market.stakes.filter((stake) => stake.prediction === true);
            const falseStakes = market.stakes.filter((stake) => stake.prediction === false);
            return {
                totalParticipants: market.stakes.length,
                totalStakeAmount: market.stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
                trueCount: trueStakes.length,
                falseCount: falseStakes.length,
                trueAmount: trueStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
                falseAmount: falseStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
            };
        });
    }
    deleteMarket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.market.delete({
                where: { id },
            });
        });
    }
    getImpliedProbability(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            const expTrue = Math.exp(market.sharesTrue / LIQUIDITY);
            const expFalse = Math.exp(market.sharesFalse / LIQUIDITY);
            const denom = expTrue + expFalse;
            return {
                probTrue: expTrue / denom,
                probFalse: expFalse / denom,
            };
        });
    }
    getStakingParameters(marketId, predictedOutcome, ppCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            const expTrue = Math.exp(market.sharesTrue / LIQUIDITY);
            const expFalse = Math.exp(market.sharesFalse / LIQUIDITY);
            const sharesBought = predictedOutcome
                ? LIQUIDITY * Math.log(Math.exp(ppCount / LIQUIDITY) * (expTrue + expFalse) - expFalse) - market.sharesTrue
                : LIQUIDITY * Math.log(Math.exp(ppCount / LIQUIDITY) * (expTrue + expFalse) - expTrue) - market.sharesFalse;
            return {
                upside: sharesBought / ppCount,
                sharesBought
            };
        });
    }
    updateOdds(marketId, predictedOutcome, sharesBought) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            const newSharesTrue = predictedOutcome
                ? market.sharesTrue + sharesBought
                : market.sharesTrue;
            const newSharesFalse = !predictedOutcome
                ? market.sharesFalse + sharesBought
                : market.sharesFalse;
            const marketExists = yield this.prisma.market.findUnique({
                where: { id: marketId }
            });
            if (!marketExists) {
                throw new Error(`Market ${marketId} not found for shares update`);
            }
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    sharesTrue: newSharesTrue,
                    sharesFalse: newSharesFalse,
                },
            });
            const { probTrue, probFalse } = yield this.getImpliedProbability(marketId);
            const marketStillExists = yield this.prisma.market.findUnique({
                where: { id: marketId }
            });
            if (!marketStillExists) {
                throw new Error(`Market ${marketId} not found for probability update`);
            }
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    probTrue,
                    probFalse,
                },
            });
        });
    }
    setMarketOutcome(marketId, outcome) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            if (!market)
                throw new Error('Market not found');
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    outcome: outcome,
                },
            });
        });
    }
}
exports.MarketService = MarketService;
