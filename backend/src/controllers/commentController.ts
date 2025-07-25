import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CommentService } from '../services/CommentService';
import { AuthRequest } from '../middleware/auth';

const commentService = new CommentService(prisma);

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, articleId, parentId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    if (!articleId) {
      res.status(400).json({ message: 'Article ID is required' });
      return;
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) }
    });

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) }
      });

      if (!parentComment) {
        res.status(404).json({ message: 'Parent comment not found' });
        return;
      }

      if (parentComment.articleId !== parseInt(articleId)) {
        res.status(400).json({ message: 'Parent comment does not belong to this article' });
        return;
      }
    }

    const comment = await commentService.createComment({
      content: content.trim(),
      articleId: parseInt(articleId),
      userId,
      parentId: parentId ? parseInt(parentId) : undefined,
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

export const getCommentsByArticleId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.userId;

    if (!articleId) {
      res.status(400).json({ message: 'Article ID is required' });
      return;
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) }
    });

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    const comments = await commentService.getCommentsByArticleId(parseInt(articleId), userId);

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

export const voteOnComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    if (!voteType || !['like', 'dislike'].includes(voteType)) {
      res.status(400).json({ message: 'Valid vote type (like/dislike) is required' });
      return;
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const result = await commentService.voteOnComment(userId, parseInt(commentId), voteType);

    res.json(result);
  } catch (error) {
    console.error('Vote on comment error:', error);
    res.status(500).json({ message: 'Error voting on comment' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    const updatedComment = await commentService.updateComment(parseInt(commentId), userId, content.trim());

    if (!updatedComment) {
      res.status(404).json({ message: 'Comment not found or unauthorized' });
      return;
    }

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    const deleted = await commentService.deleteComment(parseInt(commentId), userId);

    if (!deleted) {
      res.status(404).json({ message: 'Comment not found or unauthorized' });
      return;
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
