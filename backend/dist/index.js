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
require("./config/env");
const app_1 = require("./app");
const database_1 = require("./config/database");
const UserService_1 = require("./services/UserService");
const ArticleService_1 = require("./services/ArticleService");
const MarketService_1 = require("./services/MarketService");
const StakeService_1 = require("./services/StakeService");
const StartupService_1 = require("./services/StartupService");
const CronService_1 = require("./services/CronService");
const userService = new UserService_1.UserService(database_1.prisma);
const articleService = new ArticleService_1.ArticleService(database_1.prisma);
const marketService = new MarketService_1.MarketService(database_1.prisma);
const stakeService = new StakeService_1.StakeService(database_1.prisma);
const startupService = new StartupService_1.StartupService(database_1.prisma);
const cronService = new CronService_1.CronService(database_1.prisma);
const port = process.env.PORT || 3000;
(0, database_1.initDatabase)()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Database connected');
    const server = app_1.app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    cronService.startAll();
    setImmediate(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield startupService.runStartupTasks();
        }
        catch (error) {
            console.error('Startup tasks failed, but server is still running:', error);
        }
    }));
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        cronService.stopAll();
        server.close(() => {
            console.log('Process terminated');
        });
    });
}))
    .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});
