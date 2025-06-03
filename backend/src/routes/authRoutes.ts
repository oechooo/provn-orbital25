import express, { Router } from 'express';
import { register, login, getProfile, updateProfile, requestPasswordReset, resetPassword } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router;
