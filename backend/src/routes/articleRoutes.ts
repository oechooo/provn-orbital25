import { Router } from 'express';
import { getArticles, getArticleById, refreshArticles } from '../controllers/articleController';

const router = Router();

// Get all articles with optional filtering
router.get('/', getArticles);

// Get single article by ID
router.get('/:id', getArticleById);

// Refresh articles from News API
router.post('/refresh', refreshArticles);

export default router;
