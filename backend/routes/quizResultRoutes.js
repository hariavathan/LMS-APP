const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");
const { authMiddleware } = require("../middleware/auth");

// Get Single Quiz Result
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching Quiz Result: ${req.params.id}`);
        const result = await QuizResult.findById(req.params.id)
            .populate("quizId", "title passingScore questions")
            .populate("courseId", "title");

        if (!result) {
            console.log("[DEBUG] Result NOT FOUND");
            return res.status(404).json({ message: "Quiz result not found" });
        }

        // Ensure result has totalQuestions even if old data
        const responseData = result.toObject();
        if (!responseData.totalQuestions && responseData.quizId?.questions) {
            responseData.totalQuestions = responseData.quizId.questions.length;
        } else if (!responseData.totalQuestions) {
            responseData.totalQuestions = responseData.answers?.length || 0;
        }

        res.json(responseData);
    } catch (err) {
        console.error("Get result error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
