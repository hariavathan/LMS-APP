const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB...");
        const user = await User.findOne({ email: "superadmin@lms.com" });
        console.log("User found:", user);
        if (user) {
            console.log("Is Active:", user.isActive);
            console.log("Role:", user.role);
            console.log("Password Hash:", user.password);
        }
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
