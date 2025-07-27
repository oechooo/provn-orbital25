import express, { Router } from 'express';
import { getAllMarkets, getMarketById, getMarketByArticleId, createMarket, resolveMarket, getStakingParameters, getSimpleStats, setMarketOutcome, adminResolveMarket } from '../controllers/marketController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/simple-stats', getSimpleStats);
router.get('/', getAllMarkets);
router.get('/by-article/:articleId', getMarketByArticleId);
router.get('/:id', getMarketById);
router.get('/:id/staking-parameters', getStakingParameters);

// Protected routes (require authentication)
router.post('/', auth, createMarket);
router.put('/:id/resolve', auth, resolveMarket);

// Admin routes (require admin authentication)
router.put('/:id/set-outcome', auth, setMarketOutcome);
router.put('/:id/admin-resolve', auth, adminResolveMarket);

export default router;

