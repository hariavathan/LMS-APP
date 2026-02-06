const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");
const { authMiddleware, allowRoles } = require("../middleware/auth");

// Get All Resources (Filtered)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { type, category, search } = req.query;
        let query = { isActive: true };

        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        console.error("Get resources error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Create Resource (Admin/Trainer)
router.post("/", authMiddleware, allowRoles("admin", "super_admin", "trainer"), async (req, res) => {
    try {
        const newResource = await Resource.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json(newResource);
    } catch (err) {
        console.error("Create resource error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Resource
router.delete("/:id", authMiddleware, allowRoles("admin", "super_admin"), async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: "Resource deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
