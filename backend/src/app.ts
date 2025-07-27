// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
// Use try-catch for optional imports since we've added it to package.json 
// but it might not be installed yet
let cors: any;
try {
  cors = require('cors');
} catch (e) {
  console.warn('CORS package not found, CORS middleware will not be enabled');
}

import './config/env';
import { logInfo } from './utils/logger';
import userRoutes from './routes/userRoutes';

logInfo('Loading auth routes...');
import authRoutes from './routes/authRoutes';
logInfo('Auth routes loaded successfully');

logInfo('Loading stake routes...');
import stakeRoutes from './routes/stakeRoutes';
logInfo('Stake routes loaded successfully');

logInfo('Loading market routes...');
import marketRoutes from './routes/marketRoutes';
logInfo('Market routes loaded successfully');

logInfo('Loading article routes...');
import articleRoutes from './routes/articleRoutes';
logInfo('Article routes loaded successfully');

logInfo('Loading comment routes...');
import commentRoutes from './routes/commentRoutes';
logInfo('Comment routes loaded successfully');

// Create Express app
export const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply CORS if available
if (cors) {
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'https://provn-orbital25-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

//Routes
logInfo('Setting up routes...');
app.use('/api/users', userRoutes);
logInfo('User routes registered');
app.use('/api/auth', authRoutes);
logInfo('Auth routes registered');
app.use('/api/stakes', stakeRoutes);
logInfo('Stake routes registered');
app.use('/api/markets', marketRoutes);
logInfo('Market routes registered');
app.use('/api/articles', articleRoutes);
logInfo('Article routes registered');
app.use('/api/comments', commentRoutes);
logInfo('Comment routes registered');

// Simple health check route
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Import prisma here to avoid circular imports
    const { prisma } = await import('./config/database');
    
    // Quick database health check
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Server is running but database is unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Handle 404 errors for undefined routes - fixed pattern
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

