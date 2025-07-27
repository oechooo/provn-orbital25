import express, { Router } from 'express';
import { createStake, getUserStakes, getMarketStakes, getStakeStats, getUserStats } from '../controllers/stakeController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// Protected routes (require authentication)
router.post('/', auth, createStake);
router.get('/user', auth, getUserStakes);
router.get('/user/:userId/stats', auth, getUserStats);

// Public routes
router.get('/market/:marketId', getMarketStakes);
router.get('/market/:marketId/stats', getStakeStats);

export default router;

