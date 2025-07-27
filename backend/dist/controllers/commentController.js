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
exports.deleteComment = exports.updateComment = exports.voteOnComment = exports.getCommentsByArticleId = exports.createComment = void 0;
const database_1 = require("../config/database");
const CommentService_1 = require("../services/CommentService");
const commentService = new CommentService_1.CommentService(database_1.prisma);
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { content, articleId, parentId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const article = yield database_1.prisma.article.findUnique({
            where: { id: parseInt(articleId) }
        });
        if (!article) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        if (parentId) {
            const parentComment = yield database_1.prisma.comment.findUnique({
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
        const comment = yield commentService.createComment({
            content: content.trim(),
            articleId: parseInt(articleId),
            userId,
            parentId: parentId ? parseInt(parentId) : undefined,
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
});
exports.createComment = createComment;
const getCommentsByArticleId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { articleId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!articleId) {
            res.status(400).json({ message: 'Article ID is required' });
            return;
        }
        const article = yield database_1.prisma.article.findUnique({
            where: { id: parseInt(articleId) }
        });
        if (!article) {
            res.status(404).json({ message: 'Article not found' });
            return;
        }
        const comments = yield commentService.getCommentsByArticleId(parseInt(articleId), userId);
        res.json({ comments });
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});
exports.getCommentsByArticleId = getCommentsByArticleId;
const voteOnComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentId } = req.params;
        const { voteType } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const comment = yield database_1.prisma.comment.findUnique({
            where: { id: parseInt(commentId) }
        });
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        const result = yield commentService.voteOnComment(userId, parseInt(commentId), voteType);
        res.json(result);
    }
    catch (error) {
        console.error('Vote on comment error:', error);
        res.status(500).json({ message: 'Error voting on comment' });
    }
});
exports.voteOnComment = voteOnComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const updatedComment = yield commentService.updateComment(parseInt(commentId), userId, content.trim());
        if (!updatedComment) {
            res.status(404).json({ message: 'Comment not found or unauthorized' });
            return;
        }
        res.json({ comment: updatedComment });
    }
    catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!commentId) {
            res.status(400).json({ message: 'Comment ID is required' });
            return;
        }
        const deleted = yield commentService.deleteComment(parseInt(commentId), userId);
        if (!deleted) {
            res.status(404).json({ message: 'Comment not found or unauthorized' });
            return;
        }
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});
exports.deleteComment = deleteComment;
