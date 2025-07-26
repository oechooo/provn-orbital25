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
            // Validate user has enough provePoints before creating stake
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
                select: { probTrue: true, probFalse: true }
            });
            if (!market)
                throw new Error('Market not found');
            const marketService = new MarketService_1.MarketService(this.prisma);
            const { upside, sharesBought } = yield marketService.getStakingParameters(marketId, prediction, stakeAmount);
            // Get the new probabilities after the stake
            yield marketService.updateOdds(marketId, prediction, sharesBought);
            const updatedMarket = yield this.prisma.market.findUnique({
                where: { id: marketId },
                select: { probTrue: true, probFalse: true }
            });
            // Create stake and update user's prove points atomically
            // TODO: encapsulate user logic in UserService
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
                // Update probability history
                const currentMarket = yield tx.market.findUnique({
                    where: { id: marketId },
                    select: { probHistory: true }
                });
                const currentHistory = (currentMarket === null || currentMarket === void 0 ? void 0 : currentMarket.probHistory) || [];
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
            // Fetch the stake with user info
            const stake = yield this.prisma.stake.findUnique({
                where: { id: stakeId },
                include: { user: true }
            });
            if (!stake)
                throw new Error('Stake not found');
            const wasCorrect = stake.prediction === finalOutcome;
            // Mark the stake as resolved and set won field
            yield this.prisma.stake.update({
                where: { id: stakeId },
                data: {
                    resolved: true,
                    won: wasCorrect
                }
            });
            // Credit user if prediction was correct
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
            // Fetch the stake with user info
            const stake = yield this.prisma.stake.findUnique({
                where: { id: stakeId },
                include: { user: true }
            });
            if (!stake)
                throw new Error('Stake not found');
            // Mark the stake as resolved with won = null (refunded)
            yield this.prisma.stake.update({
                where: { id: stakeId },
                data: {
                    resolved: true,
                    won: null // null indicates refunded
                }
            });
            // Refund the original stake amount to the user
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
                // Mark all stakes as resolved with won = null (refunded) - temporarily disabled
                this.prisma.stake.updateMany({
                    where: { marketId },
                    data: {
                        resolved: true
                        // won: null  // temporarily disabled
                    }
                }),
                // Refund the stake amounts to users
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
                // Mark all stakes as resolved and set won field - temporarily disabled
                ...winningStakes.map(stake => this.prisma.stake.update({
                    where: { id: stake.id },
                    data: {
                        resolved: true
                        // won: true  // temporarily disabled
                    }
                })),
                ...losingStakes.map(stake => this.prisma.stake.update({
                    where: { id: stake.id },
                    data: {
                        resolved: true
                        // won: false  // temporarily disabled
                    }
                })),
                // Distribute winnings to winning stakes
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
            return null; // Temporarily return null
        });
    }
}
exports.StakeService = StakeService;
//# sourceMappingURL=StakeService.js.map