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
exports.StakeService = void 0;
const MarketService_1 = require("./MarketService");
class StakeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createStake(userId, marketId, prediction, stakeAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stakeAmount <= 0) {
                throw new Error('Stake amount must be positive');
            }
            const user = yield this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new Error('User not found');
            }
            if (user.provePoints < stakeAmount) {
                throw new Error('Insufficient prove points');
            }
            const market = yield this.prisma.market.findUnique({
                where: { id: marketId },
                select: { probTrue: true, probFalse: true, closed: true }
            });
            if (!market)
                throw new Error('Market not found');
            if (market.closed)
                throw new Error('Market is closed');
            const marketService = new MarketService_1.MarketService(this.prisma);
            const { upside, sharesBought } = yield marketService.getStakingParameters(marketId, prediction, stakeAmount);
            yield marketService.updateOdds(marketId, prediction, sharesBought);
            const updatedMarket = yield this.prisma.market.findUnique({
                where: { id: marketId },
                select: { probTrue: true, probFalse: true, probHistory: true }
            });
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const stake = yield tx.stake.create({
                    data: {
                        userId,
                        marketId,
                        resolved: false,
                        prediction,
                        stakeAmount,
                        upside,
                    }
                });
                yield tx.user.update({
                    where: { id: userId },
                    data: {
                        provePoints: {
                            decrement: stakeAmount
                        }
                    }
                });
                const currentHistory = (updatedMarket === null || updatedMarket === void 0 ? void 0 : updatedMarket.probHistory) || [];
                const newHistoryEntry = {
                    timestamp: new Date().toISOString(),
                    probTrue: updatedMarket.probTrue,
                    probFalse: updatedMarket.probFalse,
                    stakeId: stake.id,
                    prediction,
                    stakeAmount
                };
                yield tx.market.update({
                    where: { id: marketId },
                    data: {
                        probHistory: [...currentHistory, newHistoryEntry]
                    }
                });
                return stake;
            }));
        });
    }
    resolveStake(stakeId, finalOutcome) {
        return __awaiter(this, void 0, void 0, function* () {
            const stake = yield this.prisma.stake.findUnique({
                where: { id: stakeId },
                include: { user: true }
            });
            if (!stake)
                throw new Error('Stake not found');
            const wasCorrect = stake.prediction === finalOutcome;
            yield this.prisma.stake.update({
                where: { id: stakeId },
                data: {
                    resolved: true,
                    won: wasCorrect
                }
            });
            if (wasCorrect) {
                const winnings = stake.stakeAmount * stake.upside;
                yield this.prisma.user.update({
                    where: { id: stake.userId },
                    data: {
                        provePoints: {
                            increment: winnings
                        }
                    }
                });
            }
        });
    }
    refundStake(stakeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stake = yield this.prisma.stake.findUnique({
                where: { id: stakeId },
                include: { user: true }
            });
            if (!stake)
                throw new Error('Stake not found');
            yield this.prisma.stake.update({
                where: { id: stakeId },
                data: {
                    resolved: true,
                    won: null
                }
            });
            console.log(`Refunding stake ${stakeId}: User ${stake.userId} gets ${stake.stakeAmount} PP back`);
            yield this.prisma.user.update({
                where: { id: stake.userId },
                data: {
                    provePoints: {
                        increment: stake.stakeAmount
                    }
                }
            });
            console.log(`Refunded user ${stake.userId} with ${stake.stakeAmount} PP`);
        });
    }
    getUserStakes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.stake.findMany({
                where: { userId },
                include: {
                    market: {
                        include: {
                            article: true
                        }
                    }
                }
            });
        });
    }
    getMarketStakes(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.stake.findMany({
                where: { marketId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            });
        });
    }
    calculateMarketTotals(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const stakes = yield this.prisma.stake.groupBy({
                by: ['prediction'],
                where: { marketId },
                _sum: {
                    stakeAmount: true
                }
            });
            const trueStakes = stakes.find(s => s.prediction);
            const falseStakes = stakes.find(s => !s.prediction);
            return {
                totalTrue: (_b = (_a = trueStakes === null || trueStakes === void 0 ? void 0 : trueStakes._sum) === null || _a === void 0 ? void 0 : _a.stakeAmount) !== null && _b !== void 0 ? _b : 0,
                totalFalse: (_d = (_c = falseStakes === null || falseStakes === void 0 ? void 0 : falseStakes._sum) === null || _c === void 0 ? void 0 : _c.stakeAmount) !== null && _d !== void 0 ? _d : 0
            };
        });
    }
    refundStakes(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stakes = yield this.prisma.stake.findMany({
                where: { marketId }
            });
            yield this.prisma.$transaction([
                this.prisma.stake.updateMany({
                    where: { marketId },
                    data: {
                        resolved: true
                    }
                }),
                ...stakes.map(stake => this.prisma.user.update({
                    where: { id: stake.userId },
                    data: {
                        provePoints: {
                            increment: stake.stakeAmount
                        }
                    }
                }))
            ]);
        });
    }
    resolveMarketStakes(marketId, outcome) {
        return __awaiter(this, void 0, void 0, function* () {
            const stakes = yield this.prisma.stake.findMany({
                where: { marketId }
            });
            const winningStakes = stakes.filter(stake => stake.prediction === outcome);
            const losingStakes = stakes.filter(stake => stake.prediction !== outcome);
            if (winningStakes.length === 0) {
                yield this.refundStakes(marketId);
                return;
            }
            const totalStakeAmount = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
            const totalWinningAmount = winningStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
            yield this.prisma.$transaction([
                ...winningStakes.map(stake => this.prisma.stake.update({
                    where: { id: stake.id },
                    data: {
                        resolved: true
                    }
                })),
                ...losingStakes.map(stake => this.prisma.stake.update({
                    where: { id: stake.id },
                    data: {
                        resolved: true
                    }
                })),
                ...winningStakes.map(stake => {
                    const winnings = (stake.stakeAmount / totalWinningAmount) * totalStakeAmount;
                    return this.prisma.user.update({
                        where: { id: stake.userId },
                        data: {
                            provePoints: {
                                increment: winnings
                            }
                        }
                    });
                })
            ]);
        });
    }
    getMarketProbabilityHistory(marketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.prisma.market.findUnique({
                where: { id: marketId },
                select: { probHistory: true }
            });
            if (!market)
                throw new Error('Market not found');
            return market.probHistory || null;
            return null;
        });
    }
}
exports.StakeService = StakeService;
