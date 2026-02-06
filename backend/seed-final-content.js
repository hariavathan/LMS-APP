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
        console.log("Connected to MongoDB for final seeding...");

        // 1. Get Trainer
        const trainer = await User.findOne({ role: "trainer" });
        if (!trainer) {
            console.error("No trainer found. Please run seed-professional.js first.");
            process.exit(1);
        }

        // 2. Clear specialized courses if they exist to avoid duplicates
        await Course.deleteMany({ title: { $in: ["Professional Ethics in Tech", "Digital Library Masterclass"] } });

        const courseData = [
            {
                title: "Professional Ethics in Tech",
                subtitle: "Navigating the Moral Landscape of Software Development",
                description: "A theory-focused course on the ethical implications of AI, privacy, and data security. No videos, just pure high-level concepts and reading materials.",
                thumbnail: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800",
                category: "Ethics",
                lessons: [
                    {
                        title: "Foundations of Tech Ethics",
                        content: "Theoretical frameworks for understanding ethics in the digital age. We discuss deontology, utilitarianism, and virtue ethics as applied to code.",
                        resources: [
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                        ]
                    },
                    {
                        title: "Privacy and Surveillance",
                        content: "A deep dive into the theory of privacy and how modern software impacts individual digital rights.",
                        resources: [
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                            "https://example.com/ethics-manifesto.pdf"
                        ]
                    }
                ],
                createdBy: trainer._id,
                isPublished: true
            },
            {
                title: "Digital Library Masterclass",
                subtitle: "Resource Management and Study Tools",
                description: "Learn how to utilize library books and digital resources to accelerate your learning. Mixed media course.",
                thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
                category: "Reference",
                lessons: [
                    {
                        title: "Library Management Theory",
                        content: "The concepts behind organized knowledge and how to navigate large digital libraries effectively.",
                        resources: [
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                        ]
                    },
                    {
                        title: "YouTube as a Study Tool",
                        content: "Leveraging video content for visual learning reinforcement.",
                        videoUrl: "https://www.youtube.com/watch?v=0A-O6XFp-38",
                        resources: [
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                        ]
                    }
                ],
                createdBy: trainer._id,
                isPublished: true
            }
        ];

        for (const data of courseData) {
            await Course.create(data);
            console.log(`Created Course: ${data.title}`);
        }

        console.log("\n✅ Final Seeding complete!");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedData();
