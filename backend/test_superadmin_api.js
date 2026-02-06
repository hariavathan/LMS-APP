const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const User = require("./models/User");

async function testSuperAdminData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB\n");

        // Test what the /summary endpoint should return
        console.log("=== TESTING /api/reports/summary DATA ===\n");

        const totalCourses = await Course.countDocuments({});
        const totalLearners = await User.countDocuments({ role: "learner", isActive: true });
        const totalEnrollments = await Enrollment.countDocuments({});
        const completedEnrollments = await Enrollment.countDocuments({ status: "completed" });

        const overallCompletionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        const enrollments = await Enrollment.find({}).select("progress");
        const avgProgress = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0;

        console.log("Summary Stats:");
        console.log(`  Total Courses: ${totalCourses}`);
        console.log(`  Total Learners: ${totalLearners}`);
        console.log(`  Total Enrollments: ${totalEnrollments}`);
        console.log(`  Completed Enrollments: ${completedEnrollments}`);
        console.log(`  Overall Completion Rate: ${overallCompletionRate}%`);
        console.log(`  Average Progress: ${avgProgress}%`);

        // Test organization trends data
        console.log("\n=== TESTING /api/reports/organization-trends DATA ===\n");

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const allEnrollments = await Enrollment.find({
            $or: [
                { createdAt: { $gte: sixMonthsAgo } },
                { completedAt: { $gte: sixMonthsAgo } }
            ]
        }).select("createdAt completedAt status");

        console.log(`Enrollments in last 6 months: ${allEnrollments.length}`);

        // Show sample enrollment dates
        console.log("\nSample enrollment dates:");
        allEnrollments.slice(0, 5).forEach(e => {
            console.log(`  Created: ${e.createdAt}, Completed: ${e.completedAt || 'N/A'}, Status: ${e.status}`);
        });

        // Generate labels
        const labels = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }
        console.log("\nMonth Labels:", labels);

        // Count enrollments and completions per month
        const enrolledData = new Array(6).fill(0);
        const completedData = new Array(6).fill(0);

        const getMonthName = (date) => {
            return new Date(date).toLocaleString('default', { month: 'short' });
        };

        allEnrollments.forEach(e => {
            const enrollMonth = getMonthName(e.createdAt);
            const enrollIdx = labels.indexOf(enrollMonth);
            if (enrollIdx !== -1) enrolledData[enrollIdx]++;

            if (e.completedAt && e.status === 'completed') {
                const completeMonth = getMonthName(e.completedAt);
                const completeIdx = labels.indexOf(completeMonth);
                if (completeIdx !== -1) completedData[completeIdx]++;
            }
        });

        console.log("\nEnrollments by month:", enrolledData);
        console.log("Completions by month:", completedData);

        console.log("\n✅ Super Admin data test complete!");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testSuperAdminData();
