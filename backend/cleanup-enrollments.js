const mongoose = require("mongoose");
const Enrollment = require("./models/Enrollment");
const Course = require("./models/Course");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const cleanup = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for cleanup...");

        const courses = await Course.find().distinct("_id");
        const courseIds = courses.map(id => id.toString());

        const enrollments = await Enrollment.find();
        let deletedCount = 0;

        for (const enrollment of enrollments) {
            if (!enrollment.courseId || !courseIds.includes(enrollment.courseId.toString())) {
                await Enrollment.deleteOne({ _id: enrollment._id });
                deletedCount++;
                console.log(`Deleted stale enrollment: ${enrollment._id} (Course ID: ${enrollment.courseId})`);
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} stale enrollments.`);
        process.exit(0);
    } catch (err) {
        console.error("Cleanup error:", err);
        process.exit(1);
    }
};

cleanup();
