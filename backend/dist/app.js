"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/app.ts
const express_1 = __importDefault(require("express"));
// Use try-catch for optional imports since we've added it to package.json 
// but it might not be installed yet
let cors;
try {
    cors = require('cors');
}
catch (e) {
    console.warn('CORS package not found, CORS middleware will not be enabled');
}
require("./config/env");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
console.log('Loading auth routes...');
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
console.log('Auth routes loaded successfully');
console.log('Loading stake routes...');
const stakeRoutes_1 = __importDefault(require("./routes/stakeRoutes"));
console.log('Stake routes loaded successfully');
console.log('Loading market routes...');
const marketRoutes_1 = __importDefault(require("./routes/marketRoutes"));
console.log('Market routes loaded successfully');
console.log('Loading article routes...');
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
console.log('Article routes loaded successfully');
// Create Express app
exports.app = (0, express_1.default)();
// Middleware
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Apply CORS if available
if (cors) {
    exports.app.use(cors());
}
// Routes
console.log('Setting up routes...');
exports.app.use('/api/users', userRoutes_1.default);
console.log('User routes registered');
exports.app.use('/api/auth', authRoutes_1.default);
console.log('Auth routes registered');
exports.app.use('/api/stakes', stakeRoutes_1.default);
console.log('Stake routes registered');
exports.app.use('/api/markets', marketRoutes_1.default);
console.log('Market routes registered');
exports.app.use('/api/articles', articleRoutes_1.default);
console.log('Article routes registered');
// Simple health check route
exports.app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
// Global error handler
exports.app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});
// Handle 404 errors for undefined routes - fixed pattern
exports.app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
//# sourceMappingURL=app.js.map