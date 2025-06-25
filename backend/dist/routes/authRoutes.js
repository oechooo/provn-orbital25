"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
console.log('Loading auth controller...');
try {
    const authController = require('../controllers/authController');
    console.log('Auth controller loaded:', Object.keys(authController));
}
catch (e) {
    console.error('Auth controller loading error:', e);
}
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
console.log('Setting up auth routes...');
// Test route
router.get('/test', (req, res) => {
    console.log('Test route hit!');
    res.json({ message: 'Auth routes are working!' });
});
console.log('Test route registered');
// Public routes
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/forgot-password', authController_1.requestPasswordReset);
router.post('/reset-password', authController_1.resetPassword);
console.log('Auth routes setup complete');
// Protected routes (require authentication)
router.get('/profile', auth_1.auth, authController_1.getProfile);
router.put('/profile', auth_1.auth, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map