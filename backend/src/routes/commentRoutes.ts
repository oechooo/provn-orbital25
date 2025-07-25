import { Router } from 'express';
import { 
  createComment, 
  getCommentsByArticleId, 
  voteOnComment, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController';
import { auth } from '../middleware/auth';

const router = Router();

// Get comments for an article
router.get('/article/:articleId', getCommentsByArticleId);

// Create a new comment (protected route)
router.post('/', auth, createComment);

// Vote on a comment (protected route)
router.post('/:commentId/vote', auth, voteOnComment);

// Update a comment (protected route)
router.put('/:commentId', auth, updateComment);

// Delete a comment (protected route)
router.delete('/:commentId', auth, deleteComment);

export default router;
