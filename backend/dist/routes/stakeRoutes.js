"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stakeController_1 = require("../controllers/stakeController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.post('/', auth_1.auth, stakeController_1.createStake);
router.get('/user', auth_1.auth, stakeController_1.getUserStakes);
router.get('/user/:userId/stats', auth_1.auth, stakeController_1.getUserStats);
// Public routes
router.get('/market/:marketId', stakeController_1.getMarketStakes);
router.get('/market/:marketId/stats', stakeController_1.getStakeStats);
exports.default = router;
//# sourceMappingURL=stakeRoutes.js.map