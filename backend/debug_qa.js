const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");
const Course = require("./models/Course");
const Quiz = require("./models/Quiz");

const courseId = "698499fee016a98d0d447423";

const debugData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Debugging...");

        // 1. Check Course
        const course = await Course.findById(courseId);
        if (!course) {
            console.log(`❌ COURSE NOT FOUND with ID: ${courseId}`);
            console.log("Detailed Info: The ID in the URL does not exist in the database. The user might be visiting an old link.");
        } else {
            console.log(`✅ Course Found: "${course.title}" (ID: ${course._id})`);

            // 2. Check Quiz for this Course
            const quizzes = await Quiz.find({ courseId: course._id });
            console.log(`\nFound ${quizzes.length} total quizzes for this course.`);

            const finalQuiz = quizzes.find(q => q.isFinalQuiz === true);

            if (finalQuiz) {
                console.log(`✅ Final Quiz Found: "${finalQuiz.title}" (ID: ${finalQuiz._id})`);
                console.log(`   isActive: ${finalQuiz.isActive}`);
            } else {
                console.log(`❌ NO FINAL QUIZ found for this course.`);
                console.log("Attempting to CREATE one now...");

                // Force Create
                await Quiz.create({
                    title: `Final Assessment: ${course.title}`,
                    courseId: course._id,
                    description: "Verify your mastery of the course content.",
                    passingScore: 70,
                    timeLimit: 15,
                    isFinalQuiz: true,
                    createdBy: course.createdBy, // Assuming createdBy exists
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
                            question: "True or False: This is a great system?",
                            options: ["True", "False"],
                            correctAnswer: 0,
                            explanation: "It is indeed."
                        }
                    ]
                });
                console.log("✅ Final Quiz CREATED successfully.");
            }
        }

    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

debugData();
