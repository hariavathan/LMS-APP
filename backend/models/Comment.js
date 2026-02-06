const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // For replies
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of userIds
    isPinned: { type: Boolean, default: false } // For trainers to pin answers
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
