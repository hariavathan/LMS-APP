const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        enrolledAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["active", "in_progress", "completed", "dropped"],
            default: "in_progress",
        },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId }], // Store Lesson _ids
        progress: { type: Number, default: 0 }, // Percentage 0-100
        completedAt: { type: Date },
        averageScore: { type: Number, default: 0 }, // Track average quiz score
    },
    { timestamps: true }
);

// Prevent duplicate enrollment
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
