const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: String }, // Optional: Link to a specific module if needed
    description: { type: String },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }], // Array of text options
        correctAnswer: { type: Number, required: true }, // Index of the correct option
        explanation: { type: String } // Optional explanation for the answer
    }],
    passingScore: { type: Number, default: 70 }, // Percentage
    timeLimit: { type: Number, default: 20 }, // Minutes
    isFinalQuiz: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
