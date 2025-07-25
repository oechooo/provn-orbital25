import { PrismaClient } from '@prisma/client';

export interface CreateCommentInput {
  content: string;
  articleId: number;
  userId: number;
  parentId?: number;
}

export interface CommentWithDetails {
  id: number;
  content: string;
  articleId: number;
  userId: number;
  parentId: number | null;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    avatarSkinColor: string;
    avatarHairColor: string;
    avatarHair: string;
    avatarEyes: string;
    avatarMouth: string;
    avatarAccessories: string;
  };
  userVote?: 'like' | 'dislike' | null;
  replies?: CommentWithDetails[];
  _count?: {
    replies: number;
  };
}

export class CommentService {
  constructor(private prisma: PrismaClient) {}

  async createComment(input: CreateCommentInput): Promise<CommentWithDetails> {
    const comment = await this.prisma.comment.create({
      data: {
        content: input.content,
        articleId: input.articleId,
        userId: input.userId,
        parentId: input.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarSkinColor: true,
            avatarHairColor: true,
            avatarHair: true,
            avatarEyes: true,
            avatarMouth: true,
            avatarAccessories: true,
          }
        },
        _count: {
          select: {
            replies: true,
          }
        }
      }
    });

    return {
      ...comment,
      userVote: null,
      replies: [],
    };
  }

  async getCommentsByArticleId(articleId: number, userId?: number): Promise<CommentWithDetails[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarSkinColor: true,
            avatarHairColor: true,
            avatarHair: true,
            avatarEyes: true,
            avatarMouth: true,
            avatarAccessories: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarSkinColor: true,
                avatarHairColor: true,
                avatarHair: true,
                avatarEyes: true,
                avatarMouth: true,
                avatarAccessories: true,
              }
            },
            votes: userId ? {
              where: { userId }
            } : false,
          },
          orderBy: { createdAt: 'asc' }
        },
        votes: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: {
            replies: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match our interface and include user votes
    return comments.map(comment => ({
      ...comment,
      userVote: userId && comment.votes && comment.votes.length > 0 
        ? comment.votes[0].voteType as 'like' | 'dislike'
        : null,
      replies: comment.replies.map(reply => ({
        ...reply,
        userVote: userId && reply.votes && reply.votes.length > 0 
          ? reply.votes[0].voteType as 'like' | 'dislike'
          : null,
        replies: [],
      })),
      votes: undefined, // Remove votes from response
    }));
  }

  async voteOnComment(userId: number, commentId: number, voteType: 'like' | 'dislike'): Promise<{ likes: number; dislikes: number; userVote: 'like' | 'dislike' | null }> {
    // Check if user has already voted on this comment
    const existingVote = await this.prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        }
      }
    });

    let userVote: 'like' | 'dislike' | null = voteType;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User is removing their vote
        await this.prisma.commentVote.delete({
          where: { id: existingVote.id }
        });
        userVote = null;
      } else {
        // User is changing their vote
        await this.prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
      }
    } else {
      // User is voting for the first time
      await this.prisma.commentVote.create({
        data: {
          userId,
          commentId,
          voteType,
        }
      });
    }

    // Update comment like/dislike counts
    await this.updateCommentCounts(commentId);

    // Get updated counts
    const updatedComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { likes: true, dislikes: true }
    });

    return {
      likes: updatedComment?.likes || 0,
      dislikes: updatedComment?.dislikes || 0,
      userVote,
    };
  }

  private async updateCommentCounts(commentId: number): Promise<void> {
    const [likesCount, dislikesCount] = await Promise.all([
      this.prisma.commentVote.count({
        where: { commentId, voteType: 'like' }
      }),
      this.prisma.commentVote.count({
        where: { commentId, voteType: 'dislike' }
      })
    ]);

    await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: likesCount,
        dislikes: dislikesCount,
      }
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    // Check if user owns the comment
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!comment || comment.userId !== userId) {
      return false;
    }

    await this.prisma.comment.delete({
      where: { id: commentId }
    });

    return true;
  }

  async updateComment(commentId: number, userId: number, content: string): Promise<CommentWithDetails | null> {
    // Check if user owns the comment
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!existingComment || existingComment.userId !== userId) {
      return null;
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarSkinColor: true,
            avatarHairColor: true,
            avatarHair: true,
            avatarEyes: true,
            avatarMouth: true,
            avatarAccessories: true,
          }
        },
        _count: {
          select: {
            replies: true,
          }
        }
      }
    });

    return {
      ...updatedComment,
      userVote: null,
      replies: [],
    };
  }
}
