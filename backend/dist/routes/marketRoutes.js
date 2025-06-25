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
router.get('/', marketController_1.getAllMarkets);
router.get('/:id', marketController_1.getMarketById);
// Protected routes (require authentication)
router.post('/', auth_1.auth, marketController_1.createMarket);
router.put('/:id/resolve', auth_1.auth, marketController_1.resolveMarket);
exports.default = router;
//# sourceMappingURL=marketRoutes.js.map