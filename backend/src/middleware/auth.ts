// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
// Use try-catch for optional imports since we've added it to package.json 
// but it might not be installed yet
let jwt: any;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  console.warn('jsonwebtoken package not found, authentication will not work');
}

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
    if (!jwt) {
      res.status(500).json({ message: 'Authentication system is not properly configured' });
      return;
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication invalid' });
  }
};
