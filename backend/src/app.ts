// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
let cors: any;
try {
  cors = require('cors');
} catch (e) {
  console.warn('CORS package not found, CORS middleware will not be enabled');
}

import './config/env';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (cors) {
  app.use(cors());
}

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});