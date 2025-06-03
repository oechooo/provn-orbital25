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
const express_1 = require("express");
const ArticleService_1 = require("../services/ArticleService");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
const articleService = new ArticleService_1.ArticleService(database_1.prisma);
// GET /api/articles - Get all articles
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articles = yield articleService.getAllArticles();
        res.json({ articles });
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Failed to fetch articles' });
    }
}));
// GET /api/articles/:id - Get article by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid article ID' });
        }
        const article = yield articleService.getArticleById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Failed to fetch article' });
    }
}));
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map