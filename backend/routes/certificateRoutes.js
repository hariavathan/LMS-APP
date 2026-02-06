const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User"); // Ensure User model is available
const QuizResult = require("../models/QuizResult"); // Ensure QuizResult model is available
const Quiz = require("../models/Quiz"); // For checking final quiz
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../utils/notification");
const { v4: uuidv4 } = require('uuid');

// Issue Certificate (Claim)
router.post("/issue", authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        // 1. Verify Enrollment & Progress
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment || enrollment.progress < 100) {
            return res.status(400).json({ message: "Course not completed yet." });
        }

        // 2. Check Assessment Requirements - MUST PASS ALL QUIZZES
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Find all quizzes in the course
        const quizIds = [];
        course.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                if (lesson.type === 'quiz' && lesson.quizId) {
                    quizIds.push(lesson.quizId.toString());
                }
            });
        });

        // Also check for the Final Quiz
        const finalQuiz = await Quiz.findOne({ courseId, isFinalQuiz: true });
        if (finalQuiz) {
            quizIds.push(finalQuiz._id.toString());
        }

        // If course has quizzes, verify all are passed
        if (quizIds.length > 0) {
            const quizResults = await QuizResult.find({
                userId,
                quizId: { $in: quizIds }
            });

            // Check if all quizzes have been attempted and passed
            const passedQuizIds = quizResults
                .filter(result => result.passed)
                .map(result => result.quizId.toString());

            const failedQuizzes = quizIds.filter(id => !passedQuizIds.includes(id));

            if (failedQuizzes.length > 0) {
                return res.status(400).json({
                    message: "You must pass all course quizzes, including the Final Assessment, before claiming your certificate.",
                    failedQuizzes: failedQuizzes.length,
                    totalQuizzes: quizIds.length
                });
            }
        }

        // 3. Check if certificate already exists
        const existingCert = await Certificate.findOne({ userId, courseId });
        if (existingCert) {
            return res.json(existingCert);
        }

        // 4. Fetch User Details
        const user = await User.findById(userId);

        // 5. Generate Unique Code
        const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now().toString().substring(8)}`;

        // 6. Create Certificate
        const newCert = await Certificate.create({
            userId,
            courseId,
            certificateCode,
            courseTitle: course.title,
            learnerName: user.name,
            issueDate: new Date()
        });

        // Notification
        await createNotification(
            userId,
            "Certificate Earned!",
            `You earned a certificate for ${course.title}! Click here to view it.`,
            "success",
            `/certificates/${newCert._id}`
        );

        res.status(201).json(newCert);

    } catch (err) {
        console.error("Issue certificate error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get My Certificates
router.get("/", authMiddleware, async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user._id })
            .populate("courseId", "title thumbnail")
            .sort({ issueDate: -1 });
        res.json(certificates);
    } catch (err) {
        console.error("Get certificates error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Single Certificate (Public or Private)
// Note: Verification usually doesn't need auth if by ID/Code, but we'll use auth for "viewing" for now
// A public verification route would ideally search by `certificateCode`.
router.get("/:id", async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate("courseId", "title description thumbnail")
            .populate("userId", "name");

        if (!certificate) return res.status(404).json({ message: "Certificate not found" });

        res.json(certificate);
    } catch (err) {
        console.error("Get certificate details error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
