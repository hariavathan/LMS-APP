const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const categoryVideos = {
    "Programming": [
        "https://www.youtube.com/watch?v=PkZNo7MFNFg", // JS for Beginners
        "https://www.youtube.com/watch?v=W6NZfCO5SIk", // JS Advanced
        "https://www.youtube.com/watch?v=7fPXI_MnBOY"  // Python (demo)
    ],
    "Frontend": [
        "https://www.youtube.com/watch?v=SqcY0GlETPk", // React
        "https://www.youtube.com/watch?v=30LWjhZzg50", // Next.js
        "https://www.youtube.com/watch?v=Ke90Tje7VS0"  // Tailwind
    ],
    "Backend": [
        "https://www.youtube.com/watch?v=Oe421EPjeBE", // Node.js
        "https://www.youtube.com/watch?v=H9M02of22z4", // Express
        "https://www.youtube.com/watch?v=ENrzD9HAZK4"  // MongoDB with Node
    ],
    "Database": [
        "https://www.youtube.com/watch?v=h6W9B4S7kMo", // SQL Basics
        "https://www.youtube.com/watch?v=ofme2o29SIs", // MongoDB
        "https://www.youtube.com/watch?v=W2Z7zXzkRHY"  // Database Design
    ],
    "Marketing": [
        "https://www.youtube.com/watch?v=nU-IIXBWlS4", // Digital Marketing
        "https://www.youtube.com/watch?v=8p_hL03hU5c", // SEO
        "https://www.youtube.com/watch?v=mD-0V0-O_iE"  // Social Media
    ],
    "Business": [
        "https://www.youtube.com/watch?v=M5uNia8bYk4", // Business Strategy
        "https://www.youtube.com/watch?v=d_UArf08SZA", // Management
        "https://www.youtube.com/watch?v=7u3S7k2-P8A"  // Leadership
    ],
    "IT & Software": [
        "https://www.youtube.com/watch?v=PkZNo7MFNFg", // Basic Programming
        "https://www.youtube.com/watch?v=SqcY0GlETPk", // React
        "https://www.youtube.com/watch?v=Oe421EPjeBE"  // Node.js
    ]
};

const defaultVideos = [
    "https://www.youtube.com/watch?v=SqcY0GlETPk",
    "https://www.youtube.com/watch?v=Oe421EPjeBE"
];

const courseResources = {
    "Programming": "https://eloquentjavascript.net/",
    "Frontend": "https://react.dev/learn",
    "Backend": "https://nodejs.org/en/docs/",
    "Database": "https://www.mongodb.com/docs/",
    "IT & Software": "https://developer.mozilla.org/en-US/",
    "Design": "https://www.nngroup.com/books/",
    "Marketing": "https://neilpatel.com/blog/",
    "Business": "https://hbr.org/",
    "Soft Skills": "https://www.mindtools.com/",
    "Compliance": "https://www.osha.gov/training"
};

const enrichData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for high-relevancy enrichment...");

        const courses = await Course.find();
        console.log(`Deep cleaning and enriching ${courses.length} courses with related videos...`);

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const baseUrl = courseResources[course.category] || "https://google.com/search?q=" + encodeURIComponent(course.title + " book");
            const relevantVideos = categoryVideos[course.category] || defaultVideos;

            // 1. Ensure course has modules. If empty, create them.
            if (!course.modules || course.modules.length === 0) {
                course.modules = [
                    {
                        title: "Introduction & Fundamentals",
                        description: `Core concepts of ${course.title}.`,
                        lessons: [
                            {
                                title: "Getting Started",
                                content: `Welcome to ${course.title}.`,
                                durationMinutes: 15,
                                videoUrl: relevantVideos[0],
                                resources: [baseUrl]
                            },
                        ]
                    },
                    {
                        title: "Practical Workshop",
                        description: "Hands-on implementation.",
                        lessons: [
                            {
                                title: "Mastery Session",
                                content: "Applying advanced techniques.",
                                durationMinutes: 45,
                                videoUrl: relevantVideos[1 % relevantVideos.length],
                                resources: [baseUrl]
                            }
                        ]
                    }
                ];
            }

            // 2. Force-Update every lesson to ensure it has a RELEVANT video
            course.modules.forEach((mod, mIdx) => {
                mod.lessons.forEach((lesson, lIdx) => {
                    const vidIdx = (mIdx + lIdx) % relevantVideos.length;
                    lesson.videoUrl = relevantVideos[vidIdx];

                    if (!lesson.resources || lesson.resources.length === 0) {
                        lesson.resources = [baseUrl];
                    }
                    lesson.content = lesson.content || `Professional training module for ${lesson.title}. Follow along with the video and documentation.`;
                });
            });

            course.isPublished = true;
            course.isActive = true;
            await course.save();
            console.log(`✓ Re-Enriched (Relevant): ${course.title} [Category: ${course.category}]`);
        }

        console.log("\n🚀 DATABASE FULLY ENRICHED WITH TOPIC-RELATED VIDEOS!");
        process.exit(0);
    } catch (err) {
        console.error("Enrichment error:", err);
        process.exit(1);
    }
};

enrichData();
