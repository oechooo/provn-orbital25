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
exports.closeDatabase = exports.initDatabase = exports.prisma = void 0;
// src/config/database.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Database initialization function
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the database
        yield prisma.$connect();
        console.log('Database connection established successfully');
        return prisma;
    }
    catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
});
exports.initDatabase = initDatabase;
// Clean up function for tests or server shutdown
const closeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
});
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map