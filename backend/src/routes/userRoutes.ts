// src/routes/userRoutes.ts
import express, { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, updateUserAvatar, getCurrentUser } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

router.get('/', getUsers);
router.get('/me', auth, getCurrentUser); // Get current user's profile
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/avatar', auth, updateUserAvatar);

export default router;

