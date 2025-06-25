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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const client_1 = require("../prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, email, password } = req.body;
        // Basic validation
        if (!username || !email || !password) {
            res.status(400).json({ message: "Username, email, and password are required" });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters long" });
            return;
        } // Hash password (temporarily using simple hash for testing)
        const saltRounds = 10;
        let hashedPassword;
        try {
            hashedPassword = yield bcrypt.hash(password, saltRounds);
        }
        catch (hashError) {
            console.error('Bcrypt error:', hashError);
            hashedPassword = password; // Fallback for testing - DO NOT USE IN PRODUCTION
        }
        // Create user
        const user = yield client_1.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                provePoints: 100 // Starting points for new users
            },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true
            }
        });
        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '24h' });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            meta: error.meta
        });
        // Handle unique constraint violations
        if (error.code === 'P2002') {
            const target = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target;
            if (target === null || target === void 0 ? void 0 : target.includes('username')) {
                res.status(409).json({ message: "Username already exists" });
            }
            else if (target === null || target === void 0 ? void 0 : target.includes('email')) {
                res.status(409).json({ message: "Email already exists" });
            }
            else {
                res.status(409).json({ message: "Username or email already exists" });
            }
            return;
        }
        res.status(500).json({ message: "Error creating user" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Basic validation
        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required" });
            return;
        }
        // Find user by username or email
        const user = yield client_1.prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username } // Allow login with email
                ]
            }
        });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Verify password
        const isValidPassword = yield bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign({ userId: user.id, username: user.username }, secret, { expiresIn: '24h' });
        // Return user info without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            message: "Login successful",
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error during login" });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // User is already authenticated via middleware, user info is in req.user
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const user = yield client_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { username, email } = req.body;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        // Basic validation
        if (!username && !email) {
            res.status(400).json({ message: "At least one field (username or email) is required" });
            return;
        }
        const updateData = {};
        if (username)
            updateData.username = username;
        if (email)
            updateData.email = email;
        const user = yield client_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            message: "Profile updated successfully",
            user
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        // Handle unique constraint violations
        if (error.code === 'P2002') {
            const target = (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target;
            if (target === null || target === void 0 ? void 0 : target.includes('username')) {
                res.status(409).json({ message: "Username already exists" });
            }
            else if (target === null || target === void 0 ? void 0 : target.includes('email')) {
                res.status(409).json({ message: "Email already exists" });
            }
            else {
                res.status(409).json({ message: "Username or email already exists" });
            }
            return;
        }
        res.status(500).json({ message: "Error updating profile" });
    }
});
exports.updateProfile = updateProfile;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = yield client_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if user exists for security
            res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent' });
            return;
        }
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        // Save reset token to user (we'll add these fields to schema)
        yield client_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // In a real app, you would send an email here
        // For demo purposes, we'll just log the token
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);
        res.status(200).json({
            message: 'If an account with that email exists, a reset link has been sent',
            // Include token in response for demo purposes (remove in production)
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Error processing password reset request' });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters long' });
            return;
        }
        // Find user with valid reset token
        const user = yield client_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }
        // Hash new password
        const hashedPassword = yield bcrypt.hash(newPassword, 12);
        // Update user password and clear reset token
        yield client_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map