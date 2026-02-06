// module9-reports/models/CourseEnrollment.js
const mongoose = require("mongoose");

const courseEnrollmentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
        completedModules: [{ type: String }], // module titles completed
        score: { type: Number, default: 0, min: 0, max: 100 }, // assessment score
        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
        lastAccessedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["enrolled", "in_progress", "completed", "dropped"],
            default: "enrolled"
        }
    },
    { timestamps: true }
);

// Compound index to ensure one enrollment per user per course
courseEnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseEnrollment", courseEnrollmentSchema);
