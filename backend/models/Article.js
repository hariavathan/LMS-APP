const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // Markdown/HTML content
    category: { type: String, default: "General" },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    thumbnail: { type: String } // Optional cover image
}, { timestamps: true });

// Text index for search
articleSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Article", articleSchema);
