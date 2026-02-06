const mongoose = require("mongoose");
const axios = require("axios");
const { MONGO_URI, JWT_SECRET } = require("./config");
const User = require("./models/User");
const Course = require("./models/Course");
const jwt = require("jsonwebtoken");

const runCheck = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Get a Learner
        const learner = await User.findOne({ role: "learner" });
        if (!learner) {
            console.error("No learner found");
            process.exit(1);
        }
        console.log(`Found Learner: ${learner.name} (${learner._id})`);

        // 2. Generate Token
        const token = jwt.sign({ id: learner._id, role: learner.role }, JWT_SECRET, { expiresIn: "1h" });

        // 3. Get a Course
        const course = await Course.findOne({});
        if (!course) {
            console.error("No course found");
            process.exit(1);
        }
        console.log(`Checking Course: ${course.title} (${course._id})`);

        // 4. Test API Call (Simulated via code, but close to real)
        // Actually, since server is running on 5001, we can hit it with localhost
        const apiUrl = `http://localhost:5001/api/quizzes/course/${course._id}/final-quiz`;

        console.log(`Requesting: ${apiUrl}`);
        try {
            const res = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ API SUCCESS! Found Quiz:", res.data.title);
        } catch (err) {
            console.error("❌ API ERROR:", err.response ? err.response.status : err.message);
            if (err.response) {
                console.error("Data:", err.response.data);
            }
        }

    } catch (err) {
        console.error("Script error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

runCheck();
