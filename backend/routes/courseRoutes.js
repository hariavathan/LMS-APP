const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const { authMiddleware, allowRoles } = require("../middleware/auth");

// Helper to extract quiz data and create Quiz documents
const processModulesWithQuizzes = async (modules, courseId, userId) => {
    if (!modules || !Array.isArray(modules)) return [];

    const processedModules = [];
    for (const mod of modules) {
        const processedLessons = [];
        if (mod.lessons) {
            for (const lesson of mod.lessons) {
                // If it's a quiz type and has raw quizData
                if (lesson.type === 'quiz' && lesson.quizData) {
                    try {
                        const newQuiz = await Quiz.create({
                            title: lesson.title,
                            courseId: courseId,
                            moduleId: mod._id || undefined, // unique ID might not exist yet if new module
                            description: lesson.content, // Use content as description
                            questions: lesson.quizData.questions,
                            passingScore: lesson.quizData.passingScore || 70,
                            createdBy: userId
                        });

                        // Update lesson to reference the quiz
                        processedLessons.push({
                            ...lesson,
                            quizId: newQuiz._id,
                            quizData: undefined // Remove raw data
                        });
                    } catch (err) {
                        console.error("Failed to create inline quiz:", err);
                        // Fallback: keep lesson but maybe error? or push without quizId?
                        // Let's push it without quizId to avoid breaking everything, but log it.
                        processedLessons.push(lesson);
                    }
                } else {
                    processedLessons.push(lesson);
                }
            }
        }
        processedModules.push({ ...mod, lessons: processedLessons });
    }
    return processedModules;
};

// Create Course - TRAINER only (as per requirement)
router.post(
    "/",
    authMiddleware,
    allowRoles("trainer"),
    async (req, res) => {
        try {
            const { title, subtitle, description, longDescription, thumbnail, category, modules, lessons } = req.body;

            if (!title || !description) {
                return res.status(400).json({ message: "Title and Description are required" });
            }

            // 1. Create basic course
            const baseCourse = new Course({
                title,
                subtitle,
                description,
                longDescription,
                thumbnail,
                category,
                createdBy: req.user._id,
            });

            // 2. Process modules (create embedded quizzes)
            if (modules) {
                baseCourse.modules = await processModulesWithQuizzes(modules, baseCourse._id, req.user._id);
            }
            if (lessons) baseCourse.lessons = lessons; // Top level lessons - ignoring quizzes for simplicity here unless needed

            const savedCourse = await baseCourse.save();
            res.status(201).json(savedCourse);
        } catch (err) {
            console.error("Create course error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get All Courses
// - Trainer: Sees all (or just theirs? usually all for catalog, but editing is restricted. For simplicity, list all)
// - Admin: Sees all (for reports)
// - Learner: Sees all available (catalog)
router.get("/", authMiddleware, async (req, res) => {
    try {
        // Optional: Filter by category or search
        const courses = await Course.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error("Get courses error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Single Course Details
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate(
            "createdBy",
            "name email"
        );
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (err) {
        console.error("Get course details error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Course - Only Creator (Trainer)
router.put(
    "/:id",
    authMiddleware,
    allowRoles("trainer"),
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) return res.status(404).json({ message: "Course not found" });

            // Security check removed as per requester

            const { title, subtitle, description, longDescription, thumbnail, category, modules, lessons, isActive } = req.body;

            course.title = title || course.title;
            course.subtitle = subtitle || course.subtitle;
            course.description = description || course.description;
            course.longDescription = longDescription || course.longDescription;
            course.thumbnail = thumbnail || course.thumbnail;
            course.category = category || course.category;

            if (modules) {
                course.modules = await processModulesWithQuizzes(modules, course._id, req.user._id);
            }
            if (lessons) course.lessons = lessons;
            if (typeof isActive === 'boolean') course.isActive = isActive;

            await course.save();
            res.json(course);

        } catch (err) {
            console.error("Update course error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
