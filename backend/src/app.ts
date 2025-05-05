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
import userRoutes from './routes/userRoutes';

// Create Express app
export const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply CORS if available
if (cors) {
  app.use(cors());
}

// Routes
app.use('/api/users', userRoutes);

// Simple health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
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