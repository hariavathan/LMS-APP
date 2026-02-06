const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const { authMiddleware, allowRoles } = require("../middleware/auth");

// Get All Published Articles (Learners/Public)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { search, category, tag } = req.query;
        let query = { isPublished: true };

        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        if (tag) {
            query.tags = tag;
        }

        // Editors can see drafts
        if (req.user.role === 'trainer' || req.user.role === 'admin' || req.user.role === 'super_admin') {
            // If specifically asking for drafts or all, logic could be added here.
            // For now, let's keep the main list for consumption.
            // We might want a separate endpoint or query param for "my articles" or "all articles including drafts"
            if (req.query.status === 'all') {
                delete query.isPublished;
            }
        }

        const articles = await Article.find(query)
            .populate("author", "name avatar")
            .sort({ createdAt: -1 });

        res.json(articles);
    } catch (err) {
        console.error("Get articles error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Single Article
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate("author", "name bio avatar");
        if (!article) return res.status(404).json({ message: "Article not found" });

        // Access control for drafts
        if (!article.isPublished) {
            if (req.user.role === 'learner') {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Increment views
        article.views += 1;
        await article.save();

        res.json(article);
    } catch (err) {
        console.error("Get article error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Create Article - Trainer/Admin
router.post(
    "/",
    authMiddleware,
    allowRoles("trainer"), // Only trainers can create articles
    async (req, res) => {
        try {
            const { title, content, category, tags, isPublished, thumbnail } = req.body;

            if (!title || !content) {
                return res.status(400).json({ message: "Title and Content are required" });
            }

            const article = await Article.create({
                title,
                content,
                category,
                tags,
                isPublished: isPublished || false,
                thumbnail,
                author: req.user._id
            });

            res.status(201).json(article);
        } catch (err) {
            console.error("Create article error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Update Article - Author/Admin
router.put(
    "/:id",
    authMiddleware,
    allowRoles("trainer", "admin", "super_admin"),
    async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            if (!article) return res.status(404).json({ message: "Article not found" });

            // Allow author, admin, super_admin, or ANY trainer to edit
            const isAuthor = article.author.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
            const isTrainer = req.user.role === 'trainer';

            if (!isAuthor && !isAdmin && !isTrainer) {
                return res.status(403).json({ message: "You don't have permission to edit this article" });
            }

            const { title, content, category, tags, isPublished, thumbnail } = req.body;

            article.title = title || article.title;
            article.content = content || article.content;
            article.category = category || article.category;
            article.tags = tags || article.tags;
            if (typeof isPublished === 'boolean') article.isPublished = isPublished;
            article.thumbnail = thumbnail || article.thumbnail;

            await article.save();
            res.json(article);
        } catch (err) {
            console.error("Update article error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Delete Article - Author/Admin
router.delete(
    "/:id",
    authMiddleware,
    allowRoles("trainer", "admin", "super_admin"),
    async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            if (!article) return res.status(404).json({ message: "Article not found" });

            // Allow author, admin, super_admin, or ANY trainer to delete
            const isAuthor = article.author.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
            const isTrainer = req.user.role === 'trainer';

            if (!isAuthor && !isAdmin && !isTrainer) {
                return res.status(403).json({ message: "You don't have permission to delete this article" });
            }

            await article.deleteOne();
            res.json({ message: "Article deleted" });
        } catch (err) {
            console.error("Delete article error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
