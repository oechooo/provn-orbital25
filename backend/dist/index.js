"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const app_1 = require("./app");
const database_1 = require("./config/database");
const UserService_1 = require("./services/UserService");
const ArticleService_1 = require("./services/ArticleService");
const MarketService_1 = require("./services/MarketService");
const StakeService_1 = require("./services/StakeService");
// Initialize core services
const userService = new UserService_1.UserService(database_1.prisma);
const articleService = new ArticleService_1.ArticleService(database_1.prisma);
const marketService = new MarketService_1.MarketService(database_1.prisma);
const stakeService = new StakeService_1.StakeService(database_1.prisma);
const port = process.env.PORT || 3000;
(0, database_1.initDatabase)()
    .then(() => {
    console.log('✅ Database connected');
    const server = app_1.app.listen(port, () => {
        console.log(`✅ Server running at http://localhost:${port}`);
        console.log(`ℹ️ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
        });
    });
})
    .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map