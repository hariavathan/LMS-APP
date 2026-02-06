const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { authMiddleware, allowRoles } = require("../middleware/auth");
const { createNotification } = require("../utils/notification");
const { sendWelcomeEmail, sendAssessmentReminderEmail } = require("../utils/emailService");

// Enroll User to Course - ADMIN only (or self-enrollment logic)
router.post(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const { userId, courseId } = req.body;
            const requester = req.user;

            if (!userId || !courseId) {
                return res.status(400).json({ message: "User ID and Course ID are required" });
            }

            // Permission Check:
            if (requester.role === "learner" && userId !== requester._id.toString()) {
                return res.status(403).json({ message: "Learners can only enroll themselves." });
            }
            if (requester.role === "trainer") {
                if (userId !== requester._id.toString()) {
                    return res.status(403).json({ message: "Trainers can only enroll themselves." });
                }
            }

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });

            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });

            // Check if already enrolled
            const existing = await Enrollment.findOne({ userId, courseId });
            if (existing) {
                return res.status(409).json({ message: "User already enrolled in this course" });
            }

            const enrollment = await Enrollment.create({
                userId,
                courseId,
            });

            // Notification
            await createNotification(
                userId,
                "Course Enrollment",
                `You have successfully enrolled in ${course.title}. Happy Learning!`,
                "success",
                `/learn/${courseId}`
            );

            // Send Welcome Email (Non-blocking)
            sendWelcomeEmail(
                user.email,
                user.name,
                course.title,
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses/${courseId}`
            ).catch(err => console.error("Email sending failed (background):", err));

            res.status(201).json(enrollment);
        } catch (err) {
            console.error("Enrollment error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get My Enrolled Courses - LEARNER (and others)
router.get("/my-courses", authMiddleware, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user._id })
            .populate({
                path: "courseId",
                select: "title description thumbnail category lessons modules" // Include modules too
            })
            .sort({ enrolledAt: -1 });

        res.json(enrollments);
    } catch (err) {
        console.error("Get my courses error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Helper to calculate progress
const calculateProgress = async (enrollment, courseId) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) return 0;

        let allLessonIds = [];
        if (course.modules?.length > 0) {
            course.modules.forEach(m => {
                if (m.lessons?.length > 0) {
                    allLessonIds = [...allLessonIds, ...m.lessons.map(l => l._id.toString())];
                }
            });
        }
        if (course.lessons?.length > 0) {
            allLessonIds = [...allLessonIds, ...course.lessons.map(l => l._id.toString())];
        }

        // Unique lessons only
        const uniqueLessonIds = [...new Set(allLessonIds)];
        const totalLessons = uniqueLessonIds.length;

        if (totalLessons === 0) return 100;

        // Filter completed lessons to only those that are currently in the course
        const validCompleted = enrollment.completedLessons.filter(id => uniqueLessonIds.includes(id.toString()));

        // We assume validCompleted length <= totalLessons because of the filter
        const progress = Math.min(100, Math.round((validCompleted.length / totalLessons) * 100));
        return progress;
    } catch (e) {
        console.error("Calc progress error", e);
        return 0;
    }
};

// Update Lesson Progress - LEARNER
router.post(
    "/:courseId/complete-lesson",
    authMiddleware,
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const { lessonId } = req.body;

            if (!lessonId) return res.status(400).json({ message: "Lesson ID is required" });

            const enrollment = await Enrollment.findOne({
                userId: req.user._id,
                courseId,
            });

            if (!enrollment) {
                return res.status(404).json({ message: "Enrollment not found" });
            }

            // Add if not already there
            if (!enrollment.completedLessons.includes(lessonId)) {
                enrollment.completedLessons.push(lessonId);
            }

            // Recalculate progress using the robust helper
            enrollment.progress = await calculateProgress(enrollment, courseId);

            if (enrollment.progress === 100) {
                enrollment.status = 'completed';
                if (!enrollment.completedAt) enrollment.completedAt = new Date();
            }

            await enrollment.save();

            res.json({
                message: "Lesson marked as complete",
                progress: enrollment.progress,
                status: enrollment.status
            });

        } catch (err) {
            console.error("Complete lesson error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get Enrollments for a specific Course (Admin/Trainer view - for reports)
router.get("/course/:courseId", authMiddleware, allowRoles("admin", "super_admin", "trainer"), async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollments = await Enrollment.find({ courseId })
            .populate("userId", "name email")
            .sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (err) {
        console.error("Get course enrollments error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Trigger Assessment Reminders (Manual or Scheduled Job)
router.post("/trigger-reminders", authMiddleware, allowRoles("admin", "super_admin"), async (req, res) => {
    try {
        // Find enrollments that are not completed and were enrolled more than 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stalledEnrollments = await Enrollment.find({
            status: { $ne: 'completed' },
            enrolledAt: { $lt: sevenDaysAgo }
        }).populate('userId courseId');

        let count = 0;
        for (const enrollment of stalledEnrollments) {
            if (!enrollment.userId || !enrollment.courseId) continue;

            // Check if reminder was already sent recently (optional)

            await createNotification(
                enrollment.userId._id,
                "Assessment Reminder",
                `Don't forget to complete your assessment for ${enrollment.courseId.title}. You are ${enrollment.progress}% of the way there!`,
                "warning",
                `/learn/${enrollment.courseId._id}`
            );

            // Send Email Reminder (Non-blocking)
            if (enrollment.userId.email) {
                sendAssessmentReminderEmail(
                    enrollment.userId.email,
                    enrollment.userId.name,
                    enrollment.courseId.title,
                    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/learn/${enrollment.courseId._id}`,
                    enrollment.progress
                ).catch(err => console.error("Reminder email failed:", err));
            }

            count++;
        }

        res.json({ message: `Reminders sent to ${count} learners` });
    } catch (err) {
        console.error("Trigger reminders error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
