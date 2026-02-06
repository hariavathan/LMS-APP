const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const quizSchema = new mongoose.Schema({
    title: String,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
    }],
    passingScore: Number,
    timeLimit: Number,
    isFinalQuiz: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: Boolean
});

const courseSchema = new mongoose.Schema({
    title: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});

const Quiz = mongoose.model("Quiz", quizSchema);
const Course = mongoose.model("Course", courseSchema);
const User = mongoose.model("User", userSchema);

// Generic quiz questions that can be adapted to any course
const genericQuizQuestions = [
    {
        question: "What is the primary goal of this course?",
        options: [
            "To provide comprehensive knowledge and practical skills",
            "To complete assignments quickly",
            "To memorize facts without understanding",
            "To pass time"
        ],
        correctAnswer: 0,
        explanation: "The main goal is to gain both knowledge and practical skills that can be applied in real-world scenarios."
    },
    {
        question: "How should you approach learning new concepts in this course?",
        options: [
            "Rush through materials without practice",
            "Study actively, take notes, and practice regularly",
            "Only watch videos without engagement",
            "Wait until the last minute to study"
        ],
        correctAnswer: 1,
        explanation: "Active learning with regular practice and note-taking leads to better retention and understanding."
    },
    {
        question: "What should you do if you don't understand a topic?",
        options: [
            "Skip it and move on",
            "Give up on the course",
            "Review the material, ask questions, and seek additional resources",
            "Ignore it and hope it's not on the quiz"
        ],
        correctAnswer: 2,
        explanation: "Seeking clarification and using multiple resources ensures thorough understanding of difficult concepts."
    },
    {
        question: "Why is completing all course modules important?",
        options: [
            "It's not important, you can skip modules",
            "Each module builds on previous knowledge and contributes to overall mastery",
            "Only the final module matters",
            "Modules are just optional suggestions"
        ],
        correctAnswer: 1,
        explanation: "Courses are designed with progressive learning in mind, where each module builds upon the previous ones."
    },
    {
        question: "What is the best way to prepare for the final quiz?",
        options: [
            "Cram everything the night before",
            "Review materials regularly throughout the course and practice with examples",
            "Only read the quiz questions",
            "Rely on luck"
        ],
        correctAnswer: 1,
        explanation: "Consistent review and practice throughout the course leads to better retention and quiz performance."
    }
];

async function forceCreateQuizzes() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Find all courses
        const courses = await Course.find({}).populate('createdBy');
        console.log(`\nFound ${courses.length} total courses`);

        if (courses.length === 0) {
            console.log("❌ No courses found. Please create courses first.");
            return;
        }

        // Find a trainer/admin for quiz creation
        let quizCreator = await User.findOne({ role: { $in: ["trainer", "admin", "super_admin"] } });

        if (!quizCreator) {
            console.log("No trainer/admin found. Using first user...");
            quizCreator = await User.findOne({});
        }

        console.log(`Using quiz creator: ${quizCreator.name}\n`);

        let createdCount = 0;
        let alreadyExistsCount = 0;

        for (const course of courses) {
            // Check if course already has a final quiz
            const existingQuiz = await Quiz.findOne({
                courseId: course._id,
                isFinalQuiz: true,
                isActive: true
            });

            if (existingQuiz) {
                console.log(`✓ "${course.title}" - Already has final quiz`);
                alreadyExistsCount++;
                continue;
            }

            // Create quiz for this course
            const quiz = await Quiz.create({
                title: `${course.title} - Final Assessment`,
                courseId: course._id,
                questions: genericQuizQuestions,
                passingScore: 70,
                timeLimit: 20,
                isFinalQuiz: true,
                createdBy: course.createdBy || quizCreator._id,
                isActive: true
            });

            console.log(`✅ CREATED quiz for: "${course.title}"`);
            createdCount++;
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`📊 Quiz Seeding Summary:`);
        console.log(`   Total Courses: ${courses.length}`);
        console.log(`   Newly Created: ${createdCount} quizzes`);
        console.log(`   Already Existed: ${alreadyExistsCount} quizzes`);
        console.log(`   Coverage: ${alreadyExistsCount + createdCount}/${courses.length} courses have final quizzes`);
        console.log(`${'='.repeat(50)}\n`);

        if (createdCount + alreadyExistsCount === courses.length) {
            console.log("✅ SUCCESS: All courses now have final quizzes!");
        } else {
            console.log("⚠️  WARNING: Some courses may still be missing quizzes");
        }

    } catch (err) {
        console.error("❌ Error seeding quizzes:", err);
    } finally {
        await mongoose.disconnect();
    }
}

forceCreateQuizzes();
