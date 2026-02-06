const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB...");

        const email = "superadmin@lms.com";
        const password = "Admin@123";

        // Hash new password
        const hashed = await bcrypt.hash(password, 10);

        // Find and update, or create if not exists
        const user = await User.findOneAndUpdate(
            { email },
            {
                name: "Super Admin",
                email,
                password: hashed,
                role: "super_admin",
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log(`Super Admin user updated/created.`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        mongoose.disconnect();
    })
    .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
