const mongoose = require("mongoose");
const { MONGO_URI, JWT_SECRET } = require("./config");
const User = require("./models/User");
const Course = require("./models/Course");
const jwt = require("jsonwebtoken");

const runCheck = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Get Learner
        const learner = await User.findOne({ role: "learner" });
        if (!learner) {
            console.error("❌ No learner found");
            process.exit(1);
        }

        // 2. Generate Token
        const token = jwt.sign({ id: learner._id, role: learner.role }, JWT_SECRET, { expiresIn: "1h" });

        // 3. Get First Available Course
        const course = await Course.findOne({});
        if (!course) {
            console.error("❌ No course found");
            process.exit(1);
        }
        console.log(`Checking Course: "${course.title}" (ID: ${course._id})`);

        // 4. Test API Call
        const apiUrl = `http://localhost:5000/api/quizzes/course/${course._id}/final-quiz`;

        console.log(`\n📡 Sending Request to: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`\nHTTP Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ SUCCESS! Quiz Found:");
            console.log(`   Title: ${data.title}`);
            console.log(`   ID:    ${data._id}`);
        } else {
            console.log("❌ FAILED!");
            const text = await response.text();
            console.log(`   Response: ${text}`);

            // Debug Hint
            if (response.status === 404) console.log("   -> The API endpoint matched, but returned 404.");
            if (response.status === 401) console.log("   -> Auth failed. Token might be invalid.");
        }

    } catch (err) {
        console.error("Script error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runCheck();
