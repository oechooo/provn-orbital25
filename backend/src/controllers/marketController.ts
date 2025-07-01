import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { MarketService } from '../services/MarketService';
import { AuthRequest } from '../middleware/auth';

const marketService = new MarketService(prisma);

export const getAllMarkets = async (req: Request, res: Response): Promise<void> => {
  try {
    const markets = await marketService.getAllMarkets();
    res.json({ markets });
  } catch (error) {
    console.error('Get markets error:', error);
    res.status(500).json({ message: 'Error fetching markets' });
  }
};

export const getMarketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const market = await marketService.getMarketById(parseInt(id));
    
    if (!market) {
      res.status(404).json({ message: 'Market not found' });
      return;
    }
    
    res.json({ market });
  } catch (error) {
    console.error('Get market error:', error);
    res.status(500).json({ message: 'Error fetching market' });
  }
};

export const createMarket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!articleId) {
      res.status(400).json({ message: 'Article ID is required' });
      return;
    }

    const market = await marketService.createMarket(articleId);
    
    res.status(201).json({
      message: 'Market created successfully',
      market
    });
  } catch (error: any) {
    console.error('Create market error:', error);
    
    if (error.message === 'Article not found') {
      res.status(404).json({ message: 'Article not found' });
    } else if (error.message === 'Market already exists for this article') {
      res.status(409).json({ message: 'Market already exists for this article' });
    } else {
      res.status(500).json({ message: 'Error creating market' });
    }
  }
};

export const resolveMarket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { outcome } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (typeof outcome !== 'boolean') {
      res.status(400).json({ message: 'Outcome must be true or false' });
      return;
    }

    const market = await marketService.resolveMarket(parseInt(id));
    
    res.json({
      message: 'Market resolved successfully',
      market
    });
  } catch (error: any) {
    console.error('Resolve market error:', error);
    
    if (error.message === 'Market not found') {
      res.status(404).json({ message: 'Market not found' });
    } else if (error.message === 'Market already resolved') {
      res.status(400).json({ message: 'Market already resolved' });
    } else {
      res.status(500).json({ message: 'Error resolving market' });
    }
  }
};

export const getStakingParameters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { prediction, stakeAmount } = req.query;

    if (!prediction || !stakeAmount) {
      res.status(400).json({ message: 'Prediction and stakeAmount are required' });
      return;
    }

    const marketId = parseInt(id);
    const predictedOutcome = prediction === 'true';
    const ppCount = parseInt(stakeAmount as string);

    if (isNaN(marketId) || isNaN(ppCount) || ppCount <= 0) {
      res.status(400).json({ message: 'Invalid parameters' });
      return;
    }

    const parameters = await marketService.getStakingParameters(marketId, predictedOutcome, ppCount);
    
    res.json({
      upside: parameters.upside,
      sharesBought: parameters.sharesBought,
      potentialWinnings: ppCount * parameters.upside
    });
  } catch (error: any) {
    console.error('Get staking parameters error:', error);
    
    if (error.message === 'Market not found') {
      res.status(404).json({ message: 'Market not found' });
    } else {
      res.status(500).json({ message: 'Error calculating staking parameters' });
    }
  }
};

export const getSimpleStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersWithStakes = await prisma.user.count({
      where: { stakes: { some: {} } }
    });
    
    const activeMarkets = await prisma.market.count({
      where: { outcome: null }
    });
    
    res.json({ users: usersWithStakes, stories: activeMarkets });
  } catch (error) {
    console.error('Get simple stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Admin functions
export const setMarketOutcome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { outcome } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    if (outcome !== null && typeof outcome !== 'boolean') {
      res.status(400).json({ message: 'Outcome must be true, false, or null' });
      return;
    }

    await marketService.setMarketOutcome(parseInt(id), outcome);
    res.json({ message: 'Market outcome set successfully' });
  } catch (error) {
    console.error('Set market outcome error:', error);
    res.status(500).json({ message: 'Error setting market outcome' });
  }
};

export const adminResolveMarket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    // Use the existing resolveMarket function
    await marketService.resolveMarket(parseInt(id));
    res.json({ message: 'Market resolved successfully' });
  } catch (error) {
    console.error('Admin resolve market error:', error);
    res.status(500).json({ message: 'Error resolving market' });
  }
};

export const getMarketByArticleId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const market = await marketService.getMarketByArticleId(parseInt(articleId));
    
    if (!market) {
      res.status(404).json({ message: 'Market not found for this article' });
      return;
    }
    
    res.json({ market });
  } catch (error) {
    console.error('Get market by article ID error:', error);
    res.status(500).json({ message: 'Error fetching market' });
  }
};
