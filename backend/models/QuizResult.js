const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    score: { type: Number, required: true }, // Percentage score achieved
    passed: { type: Boolean, default: false },
    answers: [{
        questionIndex: Number,
        selectedOption: Number,
        isCorrect: Boolean
    }],
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("QuizResult", quizResultSchema);
