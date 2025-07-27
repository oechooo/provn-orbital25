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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
let cors;
try {
    cors = require('cors');
}
catch (e) {
    console.warn('CORS package not found, CORS middleware will not be enabled');
}
require("./config/env");
const logger_1 = require("./utils/logger");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
(0, logger_1.logInfo)('Loading auth routes...');
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
(0, logger_1.logInfo)('Auth routes loaded successfully');
(0, logger_1.logInfo)('Loading stake routes...');
const stakeRoutes_1 = __importDefault(require("./routes/stakeRoutes"));
(0, logger_1.logInfo)('Stake routes loaded successfully');
(0, logger_1.logInfo)('Loading market routes...');
const marketRoutes_1 = __importDefault(require("./routes/marketRoutes"));
(0, logger_1.logInfo)('Market routes loaded successfully');
(0, logger_1.logInfo)('Loading article routes...');
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
(0, logger_1.logInfo)('Article routes loaded successfully');
(0, logger_1.logInfo)('Loading comment routes...');
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
(0, logger_1.logInfo)('Comment routes loaded successfully');
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
if (cors) {
    exports.app.use(cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'https://provn-orbital25-frontend.onrender.com',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}
(0, logger_1.logInfo)('Setting up routes...');
exports.app.use('/api/users', userRoutes_1.default);
(0, logger_1.logInfo)('User routes registered');
exports.app.use('/api/auth', authRoutes_1.default);
(0, logger_1.logInfo)('Auth routes registered');
exports.app.use('/api/stakes', stakeRoutes_1.default);
(0, logger_1.logInfo)('Stake routes registered');
exports.app.use('/api/markets', marketRoutes_1.default);
(0, logger_1.logInfo)('Market routes registered');
exports.app.use('/api/articles', articleRoutes_1.default);
(0, logger_1.logInfo)('Article routes registered');
exports.app.use('/api/comments', commentRoutes_1.default);
(0, logger_1.logInfo)('Comment routes registered');
exports.app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prisma } = yield Promise.resolve().then(() => __importStar(require('./config/database')));
        yield prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'OK',
            message: 'Server is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            message: 'Server is running but database is unavailable',
            timestamp: new Date().toISOString()
        });
    }
}));
exports.app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});
exports.app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
