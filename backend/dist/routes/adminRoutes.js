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
const express_1 = require("express");
const database_1 = require("../config/database");
const CronService_1 = require("../services/CronService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const cronService = new CronService_1.CronService(database_1.prisma);
// Simple admin check middleware
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = yield database_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { isAdmin: true }
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin)) {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Authorization check failed' });
    }
});
/**
 * GET /api/admin/cron/status
 * Get the status of all cron jobs
 */
router.get('/cron/status', auth_1.auth, isAdmin, (req, res) => {
    try {
        const status = cronService.getStatus();
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        console.error('Error getting cron status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cron status'
        });
    }
});
/**
 * POST /api/admin/cron/trigger-market-resolution
 * Manually trigger market resolution
 */
router.post('/cron/trigger-market-resolution', auth_1.auth, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cronService.triggerMarketResolution();
        res.json({
            success: true,
            message: 'Market resolution triggered successfully'
        });
    }
    catch (error) {
        console.error('Error triggering market resolution:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger market resolution',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
/**
 * GET /api/admin/markets/due
 * Get markets that are due for resolution
 */
router.get('/markets/due', auth_1.auth, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const dueMarkets = yield database_1.prisma.market.findMany({
            where: {
                nextResolve: {
                    lte: now
                },
                closed: false
            },
            include: {
                article: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                stakes: {
                    select: {
                        id: true,
                        stakeAmount: true,
                        prediction: true,
                        resolved: true
                    }
                }
            },
            orderBy: {
                nextResolve: 'asc'
            }
        });
        res.json({
            success: true,
            data: {
                count: dueMarkets.length,
                markets: dueMarkets
            }
        });
    }
    catch (error) {
        console.error('Error getting due markets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get due markets',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
/**
 * GET /api/admin/markets/upcoming
 * Get upcoming market resolutions
 */
router.get('/markets/upcoming', auth_1.auth, isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const upcomingMarkets = yield database_1.prisma.market.findMany({
            where: {
                nextResolve: {
                    gt: now
                },
                closed: false
            },
            include: {
                article: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            },
            orderBy: {
                nextResolve: 'asc'
            },
            take: 10 // Limit to next 10 upcoming resolutions
        });
        res.json({
            success: true,
            data: {
                count: upcomingMarkets.length,
                markets: upcomingMarkets
            }
        });
    }
    catch (error) {
        console.error('Error getting upcoming markets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get upcoming markets',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map