// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Define a proper type for the JWT payload
interface JwtPayload {
  userId: number;
  username: string;
  // Add other fields that would be in your JWT token
}

// Extend the Request interface to include the typed user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Invalid authentication format' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token.trim().length === 0) {
      res.status(401).json({ message: 'Authentication token required' });
      return;
    }
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ message: 'Authentication service unavailable' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Validate decoded token structure
    if (!decoded.userId || !decoded.username) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Authentication token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid authentication token' });
    } else {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
};

