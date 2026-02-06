const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store Lesson ID
    content: { type: String, required: true },
}, { timestamps: true });

// Index for fast retrieval of notes per lesson/user
noteSchema.index({ userId: 1, lessonId: 1 });

module.exports = mongoose.model("Note", noteSchema);
