const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ["text", "video", "quiz"], default: "text" }, // New field
    content: { type: String, default: "" }, // Markdown content (optional for quiz)
    thumbnail: { type: String, default: "" },
    videoUrl: { type: String },
    durationMinutes: { type: Number, default: 0 },
    resources: [{ type: String }],
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }, // Reference to standalone Quiz
    // legacy embedded quiz support can remain or be ignored
    quiz: {
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String
        }],
        passingScore: { type: Number, default: 70 }
    }
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    lessons: [lessonSchema],
    order: { type: Number, default: 0 }, // For ordering modules
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }] // Module dependencies
});

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String }, // Professional subtitle
        description: { type: String, required: true },
        longDescription: { type: String }, // Detailed course description
        thumbnail: { type: String, default: "" },
        category: { type: String, default: "General" },
        subcategory: { type: String }, // More specific categorization
        level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Beginner" },
        language: { type: String, default: "English" },
        tags: [{ type: String }], // Keywords for search
        modules: [moduleSchema], // Professional modules containing lessons
        lessons: [lessonSchema], // Keep for backward compatibility

        // Professional metadata
        duration: { type: Number, default: 0 }, // Total duration in minutes
        price: { type: Number, default: 0 }, // Course price
        currency: { type: String, default: "USD" },
        certificate: { type: Boolean, default: true }, // Whether certificate is provided
        prerequisites: { type: String }, // Text description of prerequisites
        learningObjectives: [{ type: String }], // What students will learn
        targetAudience: [{ type: String }], // Who this course is for

        // Instructor information
        instructor: {
            name: { type: String },
            bio: { type: String },
            avatar: { type: String },
            credentials: [{ type: String }]
        },

        // Course settings
        enrollmentType: { type: String, enum: ["open", "invite", "paid"], default: "open" },
        maxStudents: { type: Number }, // Maximum enrollment limit
        startDate: { type: Date },
        endDate: { type: Date },

        // Analytics and ratings
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        totalEnrollments: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
        isPublished: { type: Boolean, default: false }, // Draft vs published
        featured: { type: Boolean, default: false }, // Featured course
    },
    { timestamps: true }
);

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
