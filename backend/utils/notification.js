const Notification = require("../models/Notification");

const createNotification = async (userId, title, message, type = "info", link = null) => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });
        // In a real-world app, we would also emit a socket.io event here for real-time updates
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
};

module.exports = { createNotification };
