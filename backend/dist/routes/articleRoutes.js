"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const router = (0, express_1.Router)();
// Get all articles with optional filtering
router.get('/', articleController_1.getArticles);
// Get article categories
router.get('/categories', articleController_1.getCategories);
// Get single article by ID
router.get('/:id', articleController_1.getArticleById);
// Refresh articles from News API
router.post('/refresh', articleController_1.refreshArticles);
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map