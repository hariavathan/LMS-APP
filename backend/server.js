// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Create Express app
const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime(), env: process.env.NODE_ENV }));
app.use(express.json());

// Config
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";
const JWT_SECRET = process.env.JWT_SECRET || "lms_secret_key";

// Models
const User = require("./models/User");
const Organization = require("./models/Organization");

// Middleware
const { authMiddleware, allowRoles } = require("./middleware/auth");
const { sendLoginAlertEmail } = require("./utils/emailService");

// Routes
const organizationRoutes = require("./routes/organizationRoutes");

// ====== AUTH ROUTES (MODULE 1) ======

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: '${email}', Password: '${password}'`);

    const user = await User.findOne({ email });
    console.log(`[LOGIN SEARCH] User found: ${user ? user.email : "NO USER FOUND"}`);

    if (!user) return res.status(401).json({ message: "Invalid credentials (User not found)" });

    // Inactive users cannot log in
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is inactive. Contact admin." });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN PASSWORD MATCH] Result: ${match}`);

    if (!match) return res.status(401).json({ message: "Invalid credentials (Password mismatch)" });

    user.lastLoginAt = new Date();
    await user.save();

    // Send Login Alert (Non-blocking)
    sendLoginAlertEmail(
      user.email,
      user.name,
      new Date().toLocaleString()
    ).catch(err => console.error("Login email failed:", err));

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "8h"
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Current user
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

// Forgot password (stub)
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  res.json({
    message:
      "If this email exists in our system, password reset instructions will be sent."
  });
});

// ====== USER MANAGEMENT (MODULE 1 + RBAC) ======

// Seed primary Super Admin
const seedSuperAdmin = async () => {
  const count = await User.countDocuments({ role: "super_admin" });
  if (count === 0) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Super Admin",
      email: "superadmin@lms.com",
      password: hashed,
      role: "super_admin",
      isActive: true
    });
    console.log("Seeded default super admin: superadmin@lms.com / Admin@123");
  }
};

// List users (Super Admin + Admin)
app.get(
  "/api/users",
  authMiddleware,
  allowRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create user (Super Admin can create any; Admin only Trainer/Learner)
app.post(
  "/api/users",
  authMiddleware,
  allowRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already exists" });
      }

      let finalRole = role || "learner";

      // Admin cannot create Admin or Super Admin
      if (
        req.user.role === "admin" &&
        (finalRole === "admin" || finalRole === "super_admin")
      ) {
        return res.status(403).json({
          message: "Admin can create only Trainer or Learner accounts"
        });
      }

      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email,
        password: hashed,
        role: finalRole,
        isActive: true
      });

      res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive
      });
    } catch (err) {
      console.error("Create user error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Activate / Deactivate user
app.patch(
  "/api/users/:id/status",
  authMiddleware,
  allowRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Super Admin account can never be deactivated
      if (user.role === "super_admin") {
        return res
          .status(403)
          .json({ message: "Super Admin cannot be deactivated" });
      }

      // Admin cannot change other Admins
      if (user.role === "admin" && req.user.role === "admin") {
        return res
          .status(403)
          .json({ message: "Admin cannot change another Admin" });
      }

      // At this point:
      // - Super Admin: can toggle Admin/Trainer/Learner
      // - Admin: can toggle Trainer/Learner only
      user.isActive = !!isActive;
      await user.save();

      res.json({
        id: user._id,
        isActive: user.isActive
      });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete user (Super Admin only; Super Admin cannot be deleted)
app.delete(
  "/api/users/:id",
  authMiddleware,
  allowRoles("super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      if (userToDelete.role === "super_admin") {
        return res
          .status(403)
          .json({ message: "Super Admin account cannot be deleted" });
      }

      await User.findByIdAndDelete(id);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Delete user error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ====== MODULE 2: ORGANIZATION & SETTINGS ======
app.use("/api/organization", organizationRoutes);

// ====== MODULE 9: REPORTS & ANALYTICS ======
const module9ReportsRoutes = require("./module9-reports");
const reportRoutes = require("./routes/reportRoutes");

// Mount the main reports API (with summary, learner-summary, organization-trends, etc.)
app.use("/api/reports", reportRoutes);

// Mount module9 reports at a different path if needed
app.use("/api/module9/reports", module9ReportsRoutes);
// ====== MODULE 5: ENROLLMENT & LEARNING ======
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// ====== MODULE 6: QUIZZES ======
const quizRoutes = require("./routes/quizRoutes");
const quizResultRoutes = require("./routes/quizResultRoutes");
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-results", quizResultRoutes);

// ====== MODULE 4: KNOWLEDGE BASE ======
const articleRoutes = require("./routes/articleRoutes");
app.use("/api/articles", articleRoutes);

// ====== MODULE 7: CERTIFICATES ======
const certificateRoutes = require("./routes/certificateRoutes");
app.use("/api/certificates", certificateRoutes);

// ====== MODULE 8: NOTIFICATIONS ======
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// ====== MODULE 9: RESOURCES & TOOLS ======
const resourceRoutes = require("./routes/resourceRoutes");
app.use("/api/resources", resourceRoutes);

// ====== MODULE 10: COMMUNICATION & NOTES ======
const noteRoutes = require("./routes/noteRoutes");
const commentRoutes = require("./routes/commentRoutes");
app.use("/api/notes", noteRoutes);
app.use("/api/comments", commentRoutes);

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedSuperAdmin();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });
