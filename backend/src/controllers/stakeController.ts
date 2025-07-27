import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { StakeService } from '../services/StakeService';
import { AuthRequest } from '../middleware/auth';

const stakeService = new StakeService(prisma);

// Custom Request interface to include user info from auth middleware
export const createStake = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { marketId, prediction, stakeAmount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validation
    if (!marketId || typeof prediction !== 'boolean' || !stakeAmount) {
      res.status(400).json({ message: 'Market ID, prediction, and stake amount are required' });
      return;
    }

    if (stakeAmount <= 0) {
      res.status(400).json({ message: 'Stake amount must be positive' });
      return;
    }

    const stake = await stakeService.createStake(userId, marketId, prediction, stakeAmount);
    
    res.status(201).json({
      message: 'Stake created successfully',
      stake
    });
  } catch (error: any) {
    console.error('Create stake error:', error);
    
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else if (error.message === 'Insufficient prove points') {
      res.status(400).json({ message: 'Insufficient prove points' });
    } else {
      res.status(500).json({ message: 'Error creating stake' });
    }
  }
};

export const getUserStakes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const stakes = await stakeService.getUserStakes(userId);
    
    res.json({
      stakes
    });
  } catch (error) {
    console.error('Get user stakes error:', error);
    res.status(500).json({ message: 'Error fetching user stakes' });
  }
};

export const getMarketStakes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { marketId } = req.params;
    
    if (!marketId) {
      res.status(400).json({ message: 'Market ID is required' });
      return;
    }

    const stakes = await stakeService.getMarketStakes(parseInt(marketId));
    
    res.json({
      stakes
    });
  } catch (error) {
    console.error('Get market stakes error:', error);
    res.status(500).json({ message: 'Error fetching market stakes' });
  }
};

export const getStakeStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { marketId } = req.params;
    
    if (!marketId) {
      res.status(400).json({ message: 'Market ID is required' });
      return;
    }

    const stats = await stakeService.calculateMarketTotals(parseInt(marketId));
    
    res.json({
      stats
    });
  } catch (error) {
    console.error('Get stake stats error:', error);
    res.status(500).json({ message: 'Error fetching stake statistics' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;

    // Only allow users to view their own stats or if it's public data
    if (!requestingUserId || (parseInt(userId) !== requestingUserId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Calculate user statistics
    const stakes = await prisma.stake.findMany({
      where: { 
        userId: parseInt(userId)
      },
      include: {
        market: true
      }
    });

    const totalStakes = stakes.length;
    const totalAmountStaked = stakes.reduce((sum: number, stake: any) => sum + stake.stakeAmount, 0);
    const winningStakes = stakes.filter((stake: any) => stake.prediction === stake.market.outcome).length;
    const winRate = totalStakes > 0 ? Math.round((winningStakes / totalStakes) * 100) : 0;

    res.json({
      totalStakes,
      totalAmountStaked,
      winningStakes,
      winRate
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

