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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const client_1 = require("../prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Using select to ensure we get the fields needed by the test
        const users = yield client_1.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            } // Exclude password from response
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
        const user = yield client_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            } // Exclude password
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
        const user = yield client_1.prisma.user.create({
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
            } // Exclude password from response
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
        const existingUser = yield client_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const user = yield client_1.prisma.user.update({
            where: { id },
            data: req.body,
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true
            } // Exclude password from response
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
        const existingUser = yield client_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        yield client_1.prisma.user.delete({
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
//# sourceMappingURL=userController.js.map