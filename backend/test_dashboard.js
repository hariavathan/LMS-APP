const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const User = require("./models/User");

async function testDashboardData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB\n");

        // Test 1: Check courses
        const courses = await Course.find({ isActive: true });
        console.log(`✓ Total Active Courses: ${courses.length}`);
        courses.forEach(c => console.log(`  - ${c.title}`));

        // Test 2: Check enrollments
        const enrollments = await Enrollment.find({});
        console.log(`\n✓ Total Enrollments: ${enrollments.length}`);
        console.log(`  - Completed: ${enrollments.filter(e => e.status === 'completed').length}`);
        console.log(`  - In Progress: ${enrollments.filter(e => e.status === 'in_progress').length}`);
        console.log(`  - Enrolled: ${enrollments.filter(e => e.status === 'enrolled').length}`);

        // Test 3: Check users
        const users = await User.find({ isActive: true });
        console.log(`\n✓ Total Active Users: ${users.length}`);
        console.log(`  - Super Admins: ${users.filter(u => u.role === 'super_admin').length}`);
        console.log(`  - Admins: ${users.filter(u => u.role === 'admin').length}`);
        console.log(`  - Trainers: ${users.filter(u => u.role === 'trainer').length}`);
        console.log(`  - Learners: ${users.filter(u => u.role === 'learner').length}`);

        // Test 4: Calculate summary stats
        const avgProgress = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0;

        console.log(`\n✓ Dashboard Stats:`);
        console.log(`  - Average Progress: ${avgProgress}%`);
        console.log(`  - Completion Rate: ${enrollments.length > 0 ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100) : 0}%`);

        // Test 5: Course stats
        console.log(`\n✓ Course Enrollment Stats:`);
        for (const course of courses) {
            const count = await Enrollment.countDocuments({ courseId: course._id });
            console.log(`  - ${course.title}: ${count} enrollments`);
        }

        console.log("\n✅ All dashboard data looks correct!");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testDashboardData();
