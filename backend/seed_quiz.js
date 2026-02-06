const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Quiz = require("./models/Quiz");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const seedQuiz = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // Find all courses
        const courses = await Course.find();
        console.log(`Found ${courses.length} courses.`);

        for (const course of courses) {
            // Find course owner
            const owner = await User.findById(course.createdBy);
            if (!owner) {
                console.log(`Skipping course "${course.title}" (owner not found)`);
                continue;
            }

            // Check if final quiz exists
            const existing = await Quiz.findOne({ courseId: course._id, isFinalQuiz: true });
            if (existing) {
                console.log(`Skipping "${course.title}" - Final Quiz already exists.`);
                continue;
            }

            // Create Final Quiz
            await Quiz.create({
                title: `Final Assessment: ${course.title}`,
                courseId: course._id,
                description: "Verify your mastery of the course content.",
                passingScore: 70,
                timeLimit: 15, // 15 mins
                isFinalQuiz: true,
                createdBy: owner._id,
                isActive: true,
                questions: [
                    {
                        question: "What is the primary goal of this course?",
                        options: ["To confuse you", "To learn effectively", "To waste time", "None of the above"],
                        correctAnswer: 1,
                        explanation: "The goal is to facilitate effective learning."
                    },
                    {
                        question: "Which feature allows you to track progress?",
                        options: ["The Dashboard", "The Logout Button", "The Settings", "The Footer"],
                        correctAnswer: 0,
                        explanation: "The Dashboard shows your progress charts."
                    },
                    {
                        question: "Did you enjoy this course?",
                        options: ["Yes", "No", "Maybe", "I prefer emails"],
                        correctAnswer: 0,
                        explanation: "We hope you said Yes!"
                    }
                ]
            });
            console.log(`MATCH! Created Final Quiz for "${course.title}"`);
        }

        console.log("\nDone checking all courses.");
    } catch (err) {
        console.error("Error seeding quiz:", err);
    } finally {
        await mongoose.disconnect();
    }
};

seedQuiz();
