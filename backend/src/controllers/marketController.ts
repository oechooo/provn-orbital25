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
