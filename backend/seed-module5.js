const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // 1. Create Trainer
        const trainerEmail = "trainer@lms.com";
        const passwordHash = await bcrypt.hash("Trainer@123", 10);

        let trainer = await User.findOne({ email: trainerEmail });
        if (!trainer) {
            trainer = await User.create({
                name: "John Trainer",
                email: trainerEmail,
                password: passwordHash,
                role: "trainer",
                isActive: true
            });
            console.log("Created Trainer: trainer@lms.com");
        } else {
            console.log("Trainer already exists.");
        }

        // 2. Create Learners
        const learners = [];
        for (let i = 1; i <= 3; i++) {
            const email = `learner${i}@lms.com`;
            let learner = await User.findOne({ email });
            if (!learner) {
                learner = await User.create({
                    name: `Learner ${i}`,
                    email: email,
                    password: passwordHash, // All use same password for simplicity
                    role: "learner",
                    isActive: true
                });
                console.log(`Created Learner: ${email}`);
            }
            learners.push(learner);
        }

        // 3. Create Courses with Professional Modules
        const courseData = [
            {
                title: "Mastering React.js",
                description: "Deep dive into React, Hooks, and Advanced Patterns.",
                category: "IT & Software",
                thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
                modules: [
                    {
                        title: "React Fundamentals",
                        lessons: [
                            { title: "Introduction to JSX", content: "Understanding JSX syntax and components.", durationMinutes: 15 },
                            { title: "Component Lifecycle", content: "How components are created and destroyed.", durationMinutes: 20 }
                        ]
                    },
                    {
                        title: "Advanced React Patterns",
                        lessons: [
                            { title: "Hooks Deep Dive", content: "useState, useEffect, and custom hooks.", durationMinutes: 25 },
                            { title: "Context API", content: "Managing global state with Context.", durationMinutes: 20 },
                            { title: "Performance Optimization", content: "Memoization and lazy loading.", durationMinutes: 30 }
                        ]
                    }
                ]
            },
            {
                title: "Digital Marketing Strategy",
                description: "Learn how to market products effectively online.",
                category: "Marketing",
                thumbnail: "https://www.simplilearn.com/ice9/free_resources_article_thumb/history_and_evolution_of_digital_marketing.jpg",
                modules: [
                    {
                        title: "SEO Fundamentals",
                        lessons: [
                            { title: "SEO Basics", content: "Search Engine Optimization introduction.", durationMinutes: 30 },
                            { title: "Keyword Research", content: "Finding the right keywords for your content.", durationMinutes: 25 }
                        ]
                    },
                    {
                        title: "Social Media Marketing",
                        lessons: [
                            { title: "Social Media Ads", content: "Facebook and Instagram advertising.", durationMinutes: 45 },
                            { title: "Content Strategy", content: "Creating engaging content for social platforms.", durationMinutes: 35 }
                        ]
                    }
                ]
            }
        ];

        for (const data of courseData) {
            let course = await Course.findOne({ title: data.title });
            if (!course) {
                course = await Course.create({
                    ...data,
                    createdBy: trainer._id
                });
                console.log(`Created Course: ${data.title}`);
            } else {
                console.log(`Course exists: ${data.title}`);
            }

            // Enroll random learner
            if (learners.length > 0 && course) {
                const learner = learners[0]; // First learner gets all courses for demo
                const exists = await Enrollment.findOne({ userId: learner._id, courseId: course._id });
                if (!exists) {
                    await Enrollment.create({
                        userId: learner._id,
                        courseId: course._id,
                        status: "active",
                        progress: 0
                    });
                    console.log(`Enrolled ${learner.email} in ${course.title}`);
                }
            }
        }

        console.log("Seeding complete!");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedData();
