import express, { Router } from 'express';

console.log('Loading auth controller...');
try {
  const authController = require('../controllers/authController');
  console.log('Auth controller loaded:', Object.keys(authController));
} catch (e) {
  console.error('Auth controller loading error:', e);
}

import { register, login, getProfile, updateProfile, requestPasswordReset, resetPassword } from '../controllers/authController';
import { updateUserAvatar } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

console.log('Setting up auth routes...');

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Auth routes are working!' });
});

console.log('Test route registered');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

console.log('Auth routes setup complete');

// Protected routes (require authentication)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/update-avatar', auth, updateUserAvatar);

export default router;

