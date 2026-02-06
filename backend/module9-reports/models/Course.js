// module9-reports/models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    duration: { type: Number, default: 0 }, // hours
    modules: [
      {
        title: { type: String, required: true },
        duration: { type: Number, default: 0 } // minutes
      }
    ],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active"
    },
    category: { type: String, default: "General" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
