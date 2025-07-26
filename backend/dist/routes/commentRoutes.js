"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get comments for an article
router.get('/article/:articleId', commentController_1.getCommentsByArticleId);
// Create a new comment (protected route)
router.post('/', auth_1.auth, commentController_1.createComment);
// Vote on a comment (protected route)
router.post('/:commentId/vote', auth_1.auth, commentController_1.voteOnComment);
// Update a comment (protected route)
router.put('/:commentId', auth_1.auth, commentController_1.updateComment);
// Delete a comment (protected route)
router.delete('/:commentId', auth_1.auth, commentController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map