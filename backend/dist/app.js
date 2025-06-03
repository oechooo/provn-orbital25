"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/app.ts
const express_1 = __importDefault(require("express"));
let cors;
try {
    cors = require('cors');
}
catch (e) {
    console.warn('CORS package not found, CORS middleware will not be enabled');
}
require("./config/env");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
if (cors) {
    exports.app.use(cors());
}
exports.app.use('/api/users', userRoutes_1.default);
exports.app.use('/api/auth', authRoutes_1.default);
// Error handling middleware
exports.app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});
exports.app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
//# sourceMappingURL=app.js.map