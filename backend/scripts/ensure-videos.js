const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const PLACEHOLDER_VIDEOS = [
    "https://www.youtube.com/watch?v=kqtD5dpn9C8", // How to Learn Anything Fast
    "https://www.youtube.com/watch?v=mYvO6bU89e0", // The Science of Learning
    "https://www.youtube.com/watch?v=F_Yc25032oM", // Effective Study Techniques
    "https://www.youtube.com/watch?v=Lp7E973zozc", // Introduction to Online Learning
];

const ensureVideos = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for video maintenance...");

        const courses = await Course.find();
        let updatedLessonsCount = 0;
        let updatedCoursesCount = 0;

        for (const course of courses) {
            let hasChanges = false;

            // Update lessons in modules
            if (course.modules && course.modules.length > 0) {
                for (const module of course.modules) {
                    if (module.lessons && module.lessons.length > 0) {
                        for (const lesson of module.lessons) {
                            if (lesson.type !== 'quiz' && !lesson.videoUrl) {
                                const randomVideo = PLACEHOLDER_VIDEOS[Math.floor(Math.random() * PLACEHOLDER_VIDEOS.length)];
                                lesson.videoUrl = randomVideo;
                                lesson.type = 'video'; // Ensure type is video if we add a videoUrl
                                updatedLessonsCount++;
                                hasChanges = true;
                            }
                        }
                    }
                }
            }

            // Update top-level lessons (legacy support)
            if (course.lessons && course.lessons.length > 0) {
                for (const lesson of course.lessons) {
                    if (lesson.type !== 'quiz' && !lesson.videoUrl) {
                        const randomVideo = PLACEHOLDER_VIDEOS[Math.floor(Math.random() * PLACEHOLDER_VIDEOS.length)];
                        lesson.videoUrl = randomVideo;
                        lesson.type = 'video';
                        updatedLessonsCount++;
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges) {
                await course.save();
                updatedCoursesCount++;
                console.log(`Updated course: ${course.title}`);
            }
        }

        console.log(`Maintenance Complete! Updated ${updatedLessonsCount} lessons across ${updatedCoursesCount} courses.`);
        process.exit(0);
    } catch (err) {
        console.error("Maintenance failed:", err);
        process.exit(1);
    }
};

ensureVideos();
