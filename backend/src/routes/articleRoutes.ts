import { Router } from 'express';
import { getArticles, getArticleById, refreshArticles, getCategories, createUserArticle, getUserArticles } from '../controllers/articleController';
import { auth } from '../middleware/auth';

const router = Router();

// Get all articles with optional filtering
router.get('/', getArticles);

// Get article categories
router.get('/categories', getCategories);

// Get user's articles (protected route)
router.get('/user', auth, getUserArticles);

// Get single article by ID
router.get('/:id', getArticleById);

// Create user article (protected route)
router.post('/create', auth, createUserArticle);

// Refresh articles from News API
router.post('/refresh', refreshArticles);

export default router;

