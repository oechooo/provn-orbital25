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
exports.getCurrentUser = exports.updateUserAvatar = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const database_1 = require("../config/database");
const library_1 = require("@prisma/client/runtime/library");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield database_1.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (users.length === 0) {
            res.json([]);
            return;
        }
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Error fetching users" });
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid ID format" });
            return;
        }
        const user = yield database_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: "Error fetching user" });
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: "Username, email, and password are required" });
            return;
        }
        const user = yield database_1.prisma.user.create({
            data: {
                username,
                email,
                password
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError ||
            (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002')) {
            res.status(409).json({ message: "Username or email already exists" });
            return;
        }
        res.status(500).json({ message: "Error creating user" });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid ID format" });
            return;
        }
        const existingUser = yield database_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const user = yield database_1.prisma.user.update({
            where: { id },
            data: req.body,
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Error updating user:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError ||
            (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002')) {
            res.status(409).json({ message: "Username or email already exists" });
            return;
        }
        if (error.message && error.message.includes('Record to update not found')) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(500).json({ message: "Error updating user" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid ID format" });
            return;
        }
        const existingUser = yield database_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        yield database_1.prisma.user.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Error deleting user" });
    }
});
exports.deleteUser = deleteUser;
const updateUserAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { avatarSkinColor, avatarHairColor, avatarHair, avatarEyes, avatarMouth, avatarAccessories } = req.body;
        if (!avatarSkinColor || !avatarHairColor || !avatarHair || !avatarEyes || !avatarMouth) {
            res.status(400).json({ message: "All avatar fields except accessories are required" });
            return;
        }
        const currentUser = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                provePoints: true,
                avatarHair: true,
                avatarEyes: true,
                avatarMouth: true,
                avatarAccessories: true
            }
        });
        if (!currentUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const AVATAR_REQUIREMENTS = {
            hairStyle: {
                curlyShortHair: 25, straightHair: 30, curlyBob: 35, wavyBob: 40, bunHair: 45,
                braids: 60, froBun: 50, bangs: 35, bowlCutHair: 20, halfShavedHead: 70,
                mohawk: 80, shavedHead: 15
            },
            eyes: {
                angry: 20, cheery: 25, confused: 20, sad: 20, sleepy: 25, starstruck: 40, winking: 35
            },
            mouth: {
                openedSmile: 20, gapSmile: 25, awkwardSmile: 30, kawaii: 50, braces: 35,
                openSad: 25, unimpressed: 30
            },
            accessories: {
                catEars: 60, clownNose: 40, faceMask: 30, glasses: 45, mustache: 35,
                sailormoonCrown: 100, sleepMask: 50, sunglasses: 55
            }
        };
        let totalRequirement = 0;
        const unlockedItems = [];
        if (avatarHair !== 'shortHair') {
            const requirement = AVATAR_REQUIREMENTS.hairStyle[avatarHair] || 50;
            totalRequirement = Math.max(totalRequirement, requirement);
            unlockedItems.push(`Hair: ${avatarHair} (${requirement} PP required)`);
        }
        if (avatarEyes !== 'normal') {
            const requirement = AVATAR_REQUIREMENTS.eyes[avatarEyes] || 30;
            totalRequirement = Math.max(totalRequirement, requirement);
            unlockedItems.push(`Eyes: ${avatarEyes} (${requirement} PP required)`);
        }
        if (avatarMouth !== 'teethSmile') {
            const requirement = AVATAR_REQUIREMENTS.mouth[avatarMouth] || 30;
            totalRequirement = Math.max(totalRequirement, requirement);
            unlockedItems.push(`Mouth: ${avatarMouth} (${requirement} PP required)`);
        }
        if (avatarAccessories !== 'none') {
            const requirement = AVATAR_REQUIREMENTS.accessories[avatarAccessories] || 100;
            totalRequirement = Math.max(totalRequirement, requirement);
            unlockedItems.push(`Accessories: ${avatarAccessories} (${requirement} PP required)`);
        }
        if (totalRequirement > currentUser.provePoints) {
            res.status(400).json({
                message: `Insufficient ProvePoints to unlock these features. Required: ${totalRequirement} PP, Available: ${currentUser.provePoints} PP`
            });
            return;
        }
        const user = yield database_1.prisma.user.update({
            where: { id: userId },
            data: {
                avatarSkinColor,
                avatarHairColor,
                avatarHair,
                avatarEyes,
                avatarMouth,
                avatarAccessories: avatarAccessories || 'none'
            },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true,
                avatarSkinColor: true,
                avatarHairColor: true,
                avatarHair: true,
                avatarEyes: true,
                avatarMouth: true,
                avatarAccessories: true
            }
        });
        res.json(Object.assign({ message: totalRequirement > 0 ? `Avatar updated! Features unlocked with ${totalRequirement} PP requirement.` : "Avatar updated successfully!", requirementMet: totalRequirement, unlockedFeatures: unlockedItems }, user));
    }
    catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: "Error updating avatar" });
    }
});
exports.updateUserAvatar = updateUserAvatar;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true,
                avatarSkinColor: true,
                avatarHairColor: true,
                avatarHair: true,
                avatarEyes: true,
                avatarMouth: true,
                avatarAccessories: true,
                purchasedHair: true,
                purchasedEyes: true,
                purchasedMouth: true,
                purchasedAccessories: true
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: "Error fetching user" });
    }
});
exports.getCurrentUser = getCurrentUser;
