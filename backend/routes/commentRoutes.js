const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../utils/notification"); // For replies

// Get Comments for a Lesson
router.get("/lesson/:lessonId", authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const comments = await Comment.find({ lessonId })
            .populate("userId", "name email role")
            .sort({ isPinned: -1, createdAt: -1 }); // Pinned first, then new
        res.json(comments);
    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Post a Comment
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { courseId, lessonId, content, parentId } = req.body;
        if (!content) return res.status(400).json({ message: "Content is required" });

        const comment = await Comment.create({
            userId: req.user._id,
            courseId,
            lessonId,
            content,
            parentId: parentId || null
        });

        // Populate user for immediate frontend display
        await comment.populate("userId", "name role");

        // Notify if reply
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (parentComment && parentComment.userId.toString() !== req.user._id.toString()) {
                await createNotification(
                    parentComment.userId,
                    "New Reply",
                    `${req.user.name} replied to your comment: "${content.substring(0, 30)}..."`,
                    "info",
                    `/learn/${courseId}` // Ideally deep link (future)
                );
            }
        }

        res.status(201).json(comment);
    } catch (err) {
        console.error("Create comment error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Comment
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Only owner or Trainer/Admin can delete
        const isOwner = comment.userId.toString() === req.user._id.toString();
        const isStaff = ["admin", "super_admin", "trainer"].includes(req.user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({ message: "Access denied" });
        }

        await Comment.deleteOne({ _id: req.params.id });
        res.json({ message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
