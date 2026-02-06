// models/Organization.js
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#eab308" }, // Default Tailwind yellow-500
    learningPolicy: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
