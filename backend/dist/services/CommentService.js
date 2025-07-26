"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
class CommentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createComment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this.prisma.comment.create({
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
            return Object.assign(Object.assign({}, comment), { userVote: null, replies: [] });
        });
    }
    getCommentsByArticleId(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.prisma.comment.findMany({
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
            return comments.map(comment => (Object.assign(Object.assign({}, comment), { userVote: userId && comment.votes && comment.votes.length > 0
                    ? comment.votes[0].voteType
                    : null, replies: comment.replies.map(reply => (Object.assign(Object.assign({}, reply), { userVote: userId && reply.votes && reply.votes.length > 0
                        ? reply.votes[0].voteType
                        : null, replies: [] }))), votes: undefined })));
        });
    }
    voteOnComment(userId, commentId, voteType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user has already voted on this comment
            const existingVote = yield this.prisma.commentVote.findUnique({
                where: {
                    userId_commentId: {
                        userId,
                        commentId,
                    }
                }
            });
            let userVote = voteType;
            if (existingVote) {
                if (existingVote.voteType === voteType) {
                    // User is removing their vote
                    yield this.prisma.commentVote.delete({
                        where: { id: existingVote.id }
                    });
                    userVote = null;
                }
                else {
                    // User is changing their vote
                    yield this.prisma.commentVote.update({
                        where: { id: existingVote.id },
                        data: { voteType }
                    });
                }
            }
            else {
                // User is voting for the first time
                yield this.prisma.commentVote.create({
                    data: {
                        userId,
                        commentId,
                        voteType,
                    }
                });
            }
            // Update comment like/dislike counts
            yield this.updateCommentCounts(commentId);
            // Get updated counts
            const updatedComment = yield this.prisma.comment.findUnique({
                where: { id: commentId },
                select: { likes: true, dislikes: true }
            });
            return {
                likes: (updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.likes) || 0,
                dislikes: (updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.dislikes) || 0,
                userVote,
            };
        });
    }
    updateCommentCounts(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [likesCount, dislikesCount] = yield Promise.all([
                this.prisma.commentVote.count({
                    where: { commentId, voteType: 'like' }
                }),
                this.prisma.commentVote.count({
                    where: { commentId, voteType: 'dislike' }
                })
            ]);
            yield this.prisma.comment.update({
                where: { id: commentId },
                data: {
                    likes: likesCount,
                    dislikes: dislikesCount,
                }
            });
        });
    }
    deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user owns the comment
            const comment = yield this.prisma.comment.findUnique({
                where: { id: commentId },
                select: { userId: true }
            });
            if (!comment || comment.userId !== userId) {
                return false;
            }
            yield this.prisma.comment.delete({
                where: { id: commentId }
            });
            return true;
        });
    }
    updateComment(commentId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user owns the comment
            const existingComment = yield this.prisma.comment.findUnique({
                where: { id: commentId },
                select: { userId: true }
            });
            if (!existingComment || existingComment.userId !== userId) {
                return null;
            }
            const updatedComment = yield this.prisma.comment.update({
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
            return Object.assign(Object.assign({}, updatedComment), { userVote: null, replies: [] });
        });
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=CommentService.js.map