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
// at liquidity = 1000, 1000PP moves the probabilities from 50% to 73%, and 2000PP moves it to 88%.
const liquidity = 1000;
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
        });
    }
    createMarket(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify article exists and doesn't already have a market
            const article = yield this.prisma.article.findFirst({
                where: {
                    id: articleId,
                    market: null,
                },
            });
            if (!article) {
                throw new Error('Article not found or already has a market');
            }
            return this.prisma.market.create({
                data: {
                    articleId,
                    resolved: false,
                    outcome: null,
                    sharesTrue: 0,
                    sharesFalse: 0,
                    probTrue: 0.5,
                    probFalse: 0.5,
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
    listMarkets() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { includeResolved = false, category, take, skip } = options;
            return this.prisma.market.findMany({
                where: {
                    resolved: includeResolved ? undefined : false,
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
    resolveMarket(id, outcome) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(id);
            if (!market) {
                throw new Error('Market not found');
            }
            if (market.resolved) {
                throw new Error('Market is already resolved');
            }
            // Use a transaction to ensure both market update and stake resolution happen atomically
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updatedMarket = yield tx.market.update({
                    where: { id },
                    data: {
                        resolved: true,
                        outcome,
                    },
                    include: {
                        stakes: true,
                        article: true,
                    },
                });
                // Calculate and distribute winnings
                const stakes = updatedMarket.stakes;
                const winningStakes = stakes.filter((stake) => stake.prediction === outcome);
                const totalStakeAmount = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
                if (winningStakes.length > 0) {
                    const totalWinningAmount = winningStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
                    yield Promise.all(winningStakes.map((stake) => {
                        const winnings = (stake.stakeAmount / totalWinningAmount) * totalStakeAmount;
                        return tx.user.update({
                            where: { id: stake.userId },
                            data: {
                                provePoints: {
                                    increment: winnings,
                                },
                            },
                        });
                    }));
                }
                else {
                    // Refund all stakes if no winners
                    yield Promise.all(stakes.map((stake) => tx.user.update({
                        where: { id: stake.userId },
                        data: {
                            provePoints: {
                                increment: stake.stakeAmount,
                            },
                        },
                    })));
                }
                return updatedMarket;
            }));
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
    // Calculates LMSR odds for a given market.
    getImpliedProbability(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            const expTrue = Math.exp(market.sharesTrue / liquidity);
            const expFalse = Math.exp(market.sharesFalse / liquidity);
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
            const expTrue = Math.exp(market.sharesTrue / liquidity);
            const expFalse = Math.exp(market.sharesFalse / liquidity);
            const sharesBought = predictedOutcome
                ? liquidity * Math.log(Math.exp(ppCount / liquidity) * (expTrue + expFalse) - expFalse) - market.sharesTrue
                : liquidity * Math.log(Math.exp(ppCount / liquidity) * (expTrue + expFalse) - expTrue) - market.sharesFalse;
            return {
                upside: sharesBought / ppCount,
                sharesBought
            };
        });
    }
    updateOdds(marketId, predictedOutcome, sharesBought) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketById(marketId);
            // Calculate new shares
            const newSharesTrue = predictedOutcome
                ? market.sharesTrue + sharesBought
                : market.sharesTrue;
            const newSharesFalse = !predictedOutcome
                ? market.sharesFalse + sharesBought
                : market.sharesFalse;
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    sharesTrue: newSharesTrue,
                    sharesFalse: newSharesFalse,
                },
            });
            // Recalculate probabilities
            const { probTrue, probFalse } = yield this.getImpliedProbability(marketId);
            yield this.prisma.market.update({
                where: { id: marketId },
                data: {
                    probTrue,
                    probFalse,
                },
            });
        });
    }
}
exports.MarketService = MarketService;
//# sourceMappingURL=MarketService.js.map