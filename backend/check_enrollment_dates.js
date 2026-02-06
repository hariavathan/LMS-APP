const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";
const Enrollment = require("./models/Enrollment");

async function checkEnrollmentDates() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB\n");

        const enrollments = await Enrollment.find({}).select("status progress createdAt completedAt").lean();

        console.log(`Total Enrollments: ${enrollments.length}\n`);

        console.log("All Enrollment Details:");
        console.log("=".repeat(80));

        enrollments.forEach((e, idx) => {
            console.log(`${idx + 1}. Status: ${e.status.padEnd(12)} | Progress: ${String(e.progress).padEnd(3)}% | Created: ${e.createdAt.toISOString().split('T')[0]} | Completed: ${e.completedAt ? e.completedAt.toISOString().split('T')[0] : 'N/A'}`);
        });

        console.log("\n" + "=".repeat(80));
        console.log("\nSummary:");
        console.log(`  - Active: ${enrollments.filter(e => e.status === 'active').length}`);
        console.log(`  - In Progress: ${enrollments.filter(e => e.status === 'in_progress').length}`);
        console.log(`  - Completed: ${enrollments.filter(e => e.status === 'completed').length}`);
        console.log(`  - Dropped: ${enrollments.filter(e => e.status === 'dropped').length}`);

        const withCompletedAt = enrollments.filter(e => e.completedAt);
        console.log(`\n  - Enrollments with completedAt date: ${withCompletedAt.length}`);
        console.log(`  - Enrollments with status='completed': ${enrollments.filter(e => e.status === 'completed').length}`);

        if (withCompletedAt.length !== enrollments.filter(e => e.status === 'completed').length) {
            console.log("\n⚠️  WARNING: Mismatch between completedAt dates and completed status!");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkEnrollmentDates();
