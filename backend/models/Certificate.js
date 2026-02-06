const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    certificateCode: { type: String, required: true, unique: true }, // e.g. "LMS-XYZ-123"
    issueDate: { type: Date, default: Date.now },
    grade: { type: String }, // Optional: "Passed", "Distinction", or specific score
    // Metadata for verification in case course changes
    courseTitle: { type: String },
    learnerName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
