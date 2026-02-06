// routes/organizationRoutes.js
const express = require("express");
const Organization = require("../models/Organization");
const { authMiddleware, allowRoles } = require("../middleware/auth");

const router = express.Router();

// Get current organization settings (public for branding)
router.get("/current", async (req, res) => {
  try {
    const org = await Organization.findOne().sort({ createdAt: 1 });
    if (!org) return res.json(null);
    res.json(org);
  } catch (err) {
    console.error("Get org error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create / update organization settings (Admin + Super Admin)
router.post(
  "/",
  authMiddleware,
  allowRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { name, logoUrl, primaryColor, learningPolicy } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Organization name is required" });
      }

      let org = await Organization.findOne().sort({ createdAt: 1 });

      if (!org) {
        org = await Organization.create({
          name,
          logoUrl: logoUrl || "",
          primaryColor: primaryColor || "#eab308",
          learningPolicy: learningPolicy || "",
          createdBy: req.user._id,
          updatedBy: req.user._id
        });
      } else {
        org.name = name;
        org.logoUrl = logoUrl ?? org.logoUrl;
        org.primaryColor = primaryColor ?? org.primaryColor;
        org.learningPolicy = learningPolicy ?? org.learningPolicy;
        org.updatedBy = req.user._id;
        await org.save();
      }

      res.json(org);
    } catch (err) {
      console.error("Save org error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
