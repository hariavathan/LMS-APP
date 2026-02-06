const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["book", "tool", "video", "link"], required: true },
    url: { type: String, required: true }, // Link to PDF or Tool URL
    category: { type: String, default: "General" },
    thumbnail: { type: String }, // Optional cover image
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);
