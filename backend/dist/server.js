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
const app_1 = require("./app");
const database_1 = require("./config/database");
// Example: API route to fetch articles
app_1.app.get("/api/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articles = yield database_1.prisma.article.findMany({
            include: { market: true } // Include market info for each article
        });
        res.json(articles);
    }
    catch (err) {
        res.status(500).json({ error: "Error fetching articles" });
    }
}));
// Example: API route to create a new article
app_1.app.post("/api/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceName, author, title, description, url, urlToImage, publishedAt, content, category, } = req.body;
        const newArticle = yield database_1.prisma.article.create({
            data: {
                sourceName,
                author,
                title,
                description,
                url,
                urlToImage,
                publishedAt: new Date(publishedAt),
                content,
                category,
            }
        });
        res.json(newArticle);
    }
    catch (err) {
        res.status(500).json({ error: "Error creating article" });
    }
}));
// Export the configured app
exports.default = app_1.app;
//# sourceMappingURL=server.js.map