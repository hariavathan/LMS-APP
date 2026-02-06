const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const demoCourses = [
    {
        title: "AI & Prompt Engineering Masterclass",
        description: "Unleash the power of Generative AI. Learn to write effective prompts, understand LLMs, and integrate AI into your daily workflow for maximum productivity.",
        category: "Artificial Intelligence",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        modules: [
            {
                title: "Fundamentals of Generative AI",
                lessons: [
                    { title: "What is Generative AI?", content: "An overview of how Large Language Models work and the history of Generative AI.", durationMinutes: 20 },
                    { title: "The Anatomy of a Prompt", content: "Understanding the key components of a high-quality AI prompt: context, task, and constraints.", durationMinutes: 25 }
                ]
            },
            {
                title: "Advanced Prompting Techniques",
                lessons: [
                    { title: "Few-Shot and Zero-Shot Learning", content: "How to use examples to guide AI behavior effectively.", durationMinutes: 30 },
                    { title: "Chain-of-Thought Prompting", content: "Encouraging AI to 'think' step-by-step for complex problem solving.", durationMinutes: 35 }
                ]
            }
        ]
    },
    {
        title: "Modern Full-Stack with Next.js",
        description: "Build production-ready applications with the latest Next.js 14 features, including App Router, Server Actions, and integrated styling with Tailwind CSS.",
        category: "Web Development",
        thumbnail: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&q=80&w=800",
        modules: [
            {
                title: "Next.js Core Architecture",
                lessons: [
                    { title: "The App Router Evolution", content: "Deep dive into the new directory structure and file-based routing system.", durationMinutes: 40 },
                    { title: "Server and Client Components", content: "Understanding when to use which component type for optimal performance.", durationMinutes: 30 }
                ]
            },
            {
                title: "Data Fetching & Mutations",
                lessons: [
                    { title: "Server Actions Unleashed", content: "Simplifying form submissions and data updates without traditional API endpoints.", durationMinutes: 45 },
                    { title: "Streaming and Suspense", content: "Enhancing user experience with loading states and progressive hydration.", durationMinutes: 25 }
                ]
            }
        ]
    },
    {
        title: "Cybersecurity Essentials",
        description: "Protect your digital assets. Learn the fundamentals of network security, cryptography, and how to defend against common cyber threats.",
        category: "Information Security",
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        modules: [
            {
                title: "Introduction to Security",
                lessons: [
                    {
                        title: "The Threat Landscape",
                        content: "Understanding different types of cyber attacks: Phishing, Malware, and Social Engineering.",
                        durationMinutes: 30,
                        videoUrl: "https://www.youtube.com/embed/uG6S7-i3U_Y",
                        thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400"
                    },
                    {
                        title: "Cryptography Fundamentals",
                        content: "Learning about encryption, public/private keys, and secure communication protocols.",
                        durationMinutes: 45,
                        videoUrl: "https://www.youtube.com/embed/8vK8Wf8iU8g",
                        thumbnail: "https://images.unsplash.com/photo-1510511459019-5dee997d7db4?auto=format&fit=crop&q=80&w=400"
                    }
                ]
            },
            {
                title: "Network & System Defense",
                lessons: [
                    {
                        title: "Firewalls and VPNs",
                        content: "Securing network perimeters and creating encrypted tunnels for remote access.",
                        durationMinutes: 40,
                        videoUrl: "https://www.youtube.com/embed/Oe421EPjeBE",
                        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=400"
                    },
                    {
                        title: "Incident Response",
                        content: "What to do when a breach happens: detection, containment, and recovery.",
                        durationMinutes: 35,
                        videoUrl: "https://www.youtube.com/embed/C72WBa-IvxQ",
                        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400"
                    }
                ]
            }
        ]
    }
];

const runSeed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const trainer = await User.findOne({ role: "trainer" });
        if (!trainer) {
            console.log("No trainer found. Please run the main seed script first.");
            process.exit(1);
        }

        for (const courseInfo of demoCourses) {
            // Check if exists
            const existing = await Course.findOne({ title: courseInfo.title });
            if (existing) {
                console.log(`Course '${courseInfo.title}' already exists, skipping.`);
                continue;
            }

            await Course.create({
                ...courseInfo,
                createdBy: trainer._id,
                isActive: true
            });
            console.log(`Created course: ${courseInfo.title}`);
        }

        // Cleanup stale enrollments
        const Course = require("./models/Course");
        const Enrollment = require("./models/Enrollment");
        const allCourseIds = await Course.find().distinct("_id");
        const deletedEnrollments = await Enrollment.deleteMany({
            courseId: { $nin: allCourseIds }
        });
        if (deletedEnrollments.deletedCount > 0) {
            console.log(`Cleaned up ${deletedEnrollments.deletedCount} stale enrollments.`);
        }

        console.log("Successfully added 3 new demo courses.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding courses:", error);
        process.exit(1);
    }
};

runSeed();
