"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.CronService = void 0;
const cron = __importStar(require("node-cron"));
const MarketService_1 = require("./MarketService");
class CronService {
    constructor(prisma) {
        this.tasks = new Map();
        this.prisma = prisma;
        this.marketService = new MarketService_1.MarketService(prisma);
    }
    /**
     * Start the automatic market resolution cron job
     * Runs every hour to check for markets due for resolution
     */
    startMarketResolutionJob() {
        const task = cron.schedule('0 * * * *', () => __awaiter(this, void 0, void 0, function* () {
            console.log('[CronService] Running market resolution check...');
            yield this.checkAndResolveMarkets();
        }), {
            timezone: 'UTC'
        });
        this.tasks.set('marketResolution', task);
        console.log('[CronService] Market resolution cron job started - runs every hour');
    }
    /**
     * Start all cron jobs
     */
    startAll() {
        this.startMarketResolutionJob();
        console.log('[CronService] All cron jobs started');
    }
    /**
     * Stop all cron jobs
     */
    stopAll() {
        this.tasks.forEach((task, name) => {
            task.stop();
            console.log(`[CronService] Stopped ${name} cron job`);
        });
        this.tasks.clear();
        console.log('[CronService] All cron jobs stopped');
    }
    /**
     * Stop a specific cron job
     */
    stop(jobName) {
        const task = this.tasks.get(jobName);
        if (task) {
            task.stop();
            this.tasks.delete(jobName);
            console.log(`[CronService] Stopped ${jobName} cron job`);
        }
    }
    /**
     * Get status of all cron jobs
     */
    getStatus() {
        const status = {};
        this.tasks.forEach((task, name) => {
            // Note: node-cron doesn't expose running status, so we just check if task exists
            status[name] = true;
        });
        return status;
    }
    /**
     * Check for markets that are due for resolution and resolve them
     */
    checkAndResolveMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                // Find markets that are due for resolution
                const dueMarkets = yield this.prisma.market.findMany({
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
                                title: true
                            }
                        }
                    }
                });
                console.log(`[CronService] Found ${dueMarkets.length} markets due for resolution`);
                if (dueMarkets.length === 0) {
                    return;
                }
                // Resolve each market
                const resolutionPromises = dueMarkets.map((market) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    try {
                        console.log(`[CronService] Attempting to resolve market ${market.id} for article: "${(_a = market.article) === null || _a === void 0 ? void 0 : _a.title}"`);
                        yield this.marketService.resolveMarket(market.id);
                        console.log(`[CronService] Successfully resolved market ${market.id}`);
                        return { marketId: market.id, success: true, error: null };
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        console.error(`[CronService] Failed to resolve market ${market.id}: ${errorMessage}`);
                        return { marketId: market.id, success: false, error: errorMessage };
                    }
                }));
                const results = yield Promise.allSettled(resolutionPromises);
                // Log summary
                const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                const failed = results.length - successful;
                console.log(`[CronService] Market resolution completed. Success: ${successful}, Failed: ${failed}`);
                // Log failed resolutions for debugging
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && !result.value.success) {
                        console.error(`[CronService] Market ${result.value.marketId} failed: ${result.value.error}`);
                    }
                    else if (result.status === 'rejected') {
                        console.error(`[CronService] Market resolution promise rejected:`, result.reason);
                    }
                });
            }
            catch (error) {
                console.error('[CronService] Error in checkAndResolveMarkets:', error);
            }
        });
    }
    /**
     * Manually trigger market resolution check (useful for testing)
     */
    triggerMarketResolution() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[CronService] Manually triggering market resolution check...');
            yield this.checkAndResolveMarkets();
        });
    }
}
exports.CronService = CronService;
//# sourceMappingURL=CronService.js.map