const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authMiddleware, allowRoles } = require("../middleware/auth");
const { createNotification } = require("../utils/notification");

// Get My Notifications
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50

        // Count unread
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error("Get notifications error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark as Read
router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: "Notification not found" });

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error("Mark read error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Mark All as Read
router.put("/read-all", authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Mark all read error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Internal test endpoint (Admin only)
router.post("/test", authMiddleware, allowRoles("admin", "super_admin"), async (req, res) => {
    const { userId, title, message, type, link } = req.body;
    await createNotification(userId || req.user._id, title, message, type, link);
    res.json({ message: "Test notification sent" });
});

module.exports = router;
