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
exports.resolveMarket = exports.createMarket = exports.getMarketById = exports.getAllMarkets = void 0;
const client_1 = require("../prisma/client");
const MarketService_1 = require("../services/MarketService");
const marketService = new MarketService_1.MarketService(client_1.prisma);
const getAllMarkets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const markets = yield marketService.getAllMarkets();
        res.json({ markets });
    }
    catch (error) {
        console.error('Get markets error:', error);
        res.status(500).json({ message: 'Error fetching markets' });
    }
});
exports.getAllMarkets = getAllMarkets;
const getMarketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const market = yield marketService.getMarketById(parseInt(id));
        if (!market) {
            res.status(404).json({ message: 'Market not found' });
            return;
        }
        res.json({ market });
    }
    catch (error) {
        console.error('Get market error:', error);
        res.status(500).json({ message: 'Error fetching market' });
    }
});
exports.getMarketById = getMarketById;
const createMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { articleId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        if (!articleId) {
            res.status(400).json({ message: 'Article ID is required' });
            return;
        }
        const market = yield marketService.createMarket(articleId);
        res.status(201).json({
            message: 'Market created successfully',
            market
        });
    }
    catch (error) {
        console.error('Create market error:', error);
        if (error.message === 'Article not found') {
            res.status(404).json({ message: 'Article not found' });
        }
        else if (error.message === 'Market already exists for this article') {
            res.status(409).json({ message: 'Market already exists for this article' });
        }
        else {
            res.status(500).json({ message: 'Error creating market' });
        }
    }
});
exports.createMarket = createMarket;
const resolveMarket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { outcome } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        if (typeof outcome !== 'boolean') {
            res.status(400).json({ message: 'Outcome must be true or false' });
            return;
        }
        const market = yield marketService.resolveMarket(parseInt(id), outcome);
        res.json({
            message: 'Market resolved successfully',
            market
        });
    }
    catch (error) {
        console.error('Resolve market error:', error);
        if (error.message === 'Market not found') {
            res.status(404).json({ message: 'Market not found' });
        }
        else if (error.message === 'Market already resolved') {
            res.status(400).json({ message: 'Market already resolved' });
        }
        else {
            res.status(500).json({ message: 'Error resolving market' });
        }
    }
});
exports.resolveMarket = resolveMarket;
//# sourceMappingURL=marketController.js.map