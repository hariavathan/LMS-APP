const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Enrollment = require("../models/Enrollment");
const { authMiddleware, allowRoles } = require("../middleware/auth");
const { createNotification } = require("../utils/notification");

// Create Quiz - Trainer/Admin
router.post(
    "/",
    authMiddleware,
    allowRoles("trainer"),
    async (req, res) => {
        try {
            const { title, courseId, questions, passingScore, description } = req.body;

            if (!title || !courseId || !questions || questions.length === 0) {
                return res.status(400).json({ message: "Title, Course ID, and at least one question are required" });
            }

            const quiz = await Quiz.create({
                title,
                courseId,
                questions,
                passingScore,
                description,
                createdBy: req.user._id
            });

            res.status(201).json(quiz);
        } catch (err) {
            console.error("Create quiz error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get Quizzes for a Course - Authenticated Users
router.get("/course/:courseId", authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        // Learners shouldn't see correct answers in this list if used for pre-fetching
        // But typically this list is for display. Let's return basic info.
        const quizzes = await Quiz.find({ courseId, isActive: true })
            .select("-questions.correctAnswer -questions.explanation");

        res.json(quizzes);
    } catch (err) {
        console.error("Get course quizzes error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Final Quiz for a Course
router.get("/course/:courseId/final-quiz", authMiddleware, async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching Final Quiz for CourseID: ${req.params.courseId}`);

        const query = {
            courseId: req.params.courseId,
            isFinalQuiz: true,
            isActive: true
        };
        console.log("[DEBUG] Query:", JSON.stringify(query));

        const quiz = await Quiz.findOne(query);

        if (!quiz) {
            console.log("[DEBUG] Final Quiz NOT FOUND in DB.");
            return res.status(404).json({ message: "Final quiz not found in database." });
        }

        console.log(`[DEBUG] Found Quiz: ${quiz.title} (${quiz._id})`);

        // Hide correct answers for learners
        if (req.user.role === "learner") {
            const quizForLearner = quiz.toObject();
            quizForLearner.questions.forEach(q => {
                delete q.correctAnswer;
                delete q.explanation;
            });
            return res.json(quizForLearner);
        }

        res.json(quiz);
    } catch (err) {
        console.error("Get final quiz error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Single Quiz - Authenticated Users
// Validates if user can take it (e.g., enrolled) - for now simplified
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        // If Learner, hide correct answers
        if (req.user.role === "learner") {
            const quizForLearner = quiz.toObject();
            quizForLearner.questions.forEach(q => {
                delete q.correctAnswer;
                delete q.explanation;
            });
            return res.json(quizForLearner);
        }

        // Trainer/Admin get full details
        res.json(quiz);
    } catch (err) {
        console.error("Get quiz error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

const handleQuizSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let correctCount = 0;
        const answersArray = Array.isArray(answers) ? answers : [];

        const resultDetails = quiz.questions.map((question, index) => {
            const selectedOption = answersArray[index];
            const isCorrect = selectedOption === question.correctAnswer;
            if (isCorrect) correctCount++;
            return {
                questionIndex: index,
                selectedOption: selectedOption,
                isCorrect
            };
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const passed = score >= quiz.passingScore;

        const result = await QuizResult.create({
            userId: req.user._id,
            quizId: id,
            courseId: quiz.courseId,
            score,
            passed,
            answers: resultDetails,
            completedAt: Date.now(),
            totalQuestions: quiz.questions.length
        });

        // Update enrollment score
        const updateFields = { averageScore: score };

        // If it's a final quiz and they passed, mark course as completed
        if (quiz.isFinalQuiz && passed) {
            updateFields.progress = 100;
            updateFields.status = "completed";
            updateFields.completedAt = Date.now();
        }

        await Enrollment.findOneAndUpdate(
            { userId: req.user._id, courseId: quiz.courseId },
            updateFields
        );

        if (passed) {
            await createNotification(
                req.user._id,
                quiz.isFinalQuiz ? "Course Completed! 🎓" : "Quiz Passed",
                quiz.isFinalQuiz
                    ? `Congratulations! You've completed ${quiz.title} and earned your certificate.`
                    : `Congratulations! You passed the quiz for ${quiz.title} with a score of ${score}%.`,
                "success"
            );
        }

        res.json({
            score,
            passed,
            resultId: result._id,
            _id: result._id, // Add compatibility alias
            totalQuestions: quiz.questions.length,
            isFinalQuiz: quiz.isFinalQuiz,
            message: passed ? "Congratulations! You passed." : "Keep practicing."
        });

    } catch (err) {
        console.error("Submit quiz error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Submit Quiz Attempt
router.post("/:id/submit", authMiddleware, handleQuizSubmission);
router.post("/:id/attempt", authMiddleware, handleQuizSubmission);


// End of Quiz Routes
module.exports = router;
