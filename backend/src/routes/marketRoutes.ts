import express, { Router } from 'express';
import { getAllMarkets, getMarketById, createMarket, resolveMarket, getStakingParameters } from '../controllers/marketController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.get('/', getAllMarkets);
router.get('/:id', getMarketById);
router.get('/:id/staking-parameters', getStakingParameters);

// Protected routes (require authentication)
router.post('/', auth, createMarket);
router.put('/:id/resolve', auth, resolveMarket);

export default router;
