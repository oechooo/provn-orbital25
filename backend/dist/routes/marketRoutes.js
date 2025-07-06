"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marketController_1 = require("../controllers/marketController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/simple-stats', marketController_1.getSimpleStats);
router.get('/', marketController_1.getAllMarkets);
router.get('/by-article/:articleId', marketController_1.getMarketByArticleId);
router.get('/:id', marketController_1.getMarketById);
router.get('/:id/staking-parameters', marketController_1.getStakingParameters);
// Protected routes (require authentication)
router.post('/', auth_1.auth, marketController_1.createMarket);
router.put('/:id/resolve', auth_1.auth, marketController_1.resolveMarket);
// Admin routes (require admin authentication)
router.put('/:id/set-outcome', auth_1.auth, marketController_1.setMarketOutcome);
router.put('/:id/admin-resolve', auth_1.auth, marketController_1.adminResolveMarket);
exports.default = router;
//# sourceMappingURL=marketRoutes.js.map