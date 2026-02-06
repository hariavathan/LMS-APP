const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");
const Course = require("./models/Course");
const Quiz = require("./models/Quiz");

const listData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const course = await Course.findOne({});
        if (course) {
            const quiz = await Quiz.findOne({ courseId: course._id, isFinalQuiz: true });
            if (quiz) {
                console.log("\n\nVALID_URL_START");
                console.log(`http://localhost:5173/courses/${course._id}/quiz`);
                console.log("VALID_URL_END\n\n");
            } else {
                console.log("Course found but no quiz.");
            }
        } else {
            console.log("No courses found in DB.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

listData();
