const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { authMiddleware } = require("../middleware/auth");

// Get My Notes for a Lesson
router.get("/lesson/:lessonId", authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const notes = await Note.find({ userId: req.user._id, lessonId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error("Get notes error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Create Note
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { courseId, lessonId, content } = req.body;
        if (!content) return res.status(400).json({ message: "Content is required" });

        const note = await Note.create({
            userId: req.user._id,
            courseId,
            lessonId,
            content
        });
        res.status(201).json(note);
    } catch (err) {
        console.error("Create note error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Note
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
