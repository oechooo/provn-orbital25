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
exports.getUserStats = exports.getStakeStats = exports.getMarketStakes = exports.getUserStakes = exports.createStake = void 0;
const client_1 = require("../prisma/client");
const StakeService_1 = require("../services/StakeService");
const stakeService = new StakeService_1.StakeService(client_1.prisma);
// Custom Request interface to include user info from auth middleware
const createStake = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { marketId, prediction, stakeAmount } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Validation
        if (!marketId || typeof prediction !== 'boolean' || !stakeAmount) {
            res.status(400).json({ message: 'Market ID, prediction, and stake amount are required' });
            return;
        }
        if (stakeAmount <= 0) {
            res.status(400).json({ message: 'Stake amount must be positive' });
            return;
        }
        const stake = yield stakeService.createStake(userId, marketId, prediction, stakeAmount);
        res.status(201).json({
            message: 'Stake created successfully',
            stake
        });
    }
    catch (error) {
        console.error('Create stake error:', error);
        if (error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' });
        }
        else if (error.message === 'Insufficient prove points') {
            res.status(400).json({ message: 'Insufficient prove points' });
        }
        else {
            res.status(500).json({ message: 'Error creating stake' });
        }
    }
});
exports.createStake = createStake;
const getUserStakes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const stakes = yield stakeService.getUserStakes(userId);
        res.json({
            stakes
        });
    }
    catch (error) {
        console.error('Get user stakes error:', error);
        res.status(500).json({ message: 'Error fetching user stakes' });
    }
});
exports.getUserStakes = getUserStakes;
const getMarketStakes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { marketId } = req.params;
        if (!marketId) {
            res.status(400).json({ message: 'Market ID is required' });
            return;
        }
        const stakes = yield stakeService.getMarketStakes(parseInt(marketId));
        res.json({
            stakes
        });
    }
    catch (error) {
        console.error('Get market stakes error:', error);
        res.status(500).json({ message: 'Error fetching market stakes' });
    }
});
exports.getMarketStakes = getMarketStakes;
const getStakeStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { marketId } = req.params;
        if (!marketId) {
            res.status(400).json({ message: 'Market ID is required' });
            return;
        }
        const stats = yield stakeService.calculateMarketTotals(parseInt(marketId));
        res.json({
            stats
        });
    }
    catch (error) {
        console.error('Get stake stats error:', error);
        res.status(500).json({ message: 'Error fetching stake statistics' });
    }
});
exports.getStakeStats = getStakeStats;
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Only allow users to view their own stats or if it's public data
        if (!requestingUserId || (parseInt(userId) !== requestingUserId)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Calculate user statistics
        const stakes = yield client_1.prisma.stake.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                market: true
            }
        });
        const totalStakes = stakes.length;
        const totalAmountStaked = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
        const winningStakes = stakes.filter((stake) => stake.prediction === stake.market.outcome).length;
        const winRate = totalStakes > 0 ? Math.round((winningStakes / totalStakes) * 100) : 0;
        res.json({
            totalStakes,
            totalAmountStaked,
            winningStakes,
            winRate
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Error fetching user statistics' });
    }
});
exports.getUserStats = getUserStats;
//# sourceMappingURL=stakeController.js.map