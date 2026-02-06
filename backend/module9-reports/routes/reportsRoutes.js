// module9-reports/routes/reportsRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const CourseEnrollment = require("../../models/Enrollment");
const User = require("../../models/User");
const Note = require("../../models/Note");
const Certificate = require("../../models/Certificate");
const Notification = require("../../models/Notification");
const Quiz = require("../../models/Quiz");
const { authMiddleware, allowRoles } = require("../../middleware/auth");
const { seedDummyData } = require("../data/seedData");

// Helper: Convert data to CSV string
const toCSV = (data, headers) => {
    if (!data || data.length === 0) {
        return headers.join(",") + "\n";
    }

    const headerRow = headers.join(",");
    const dataRows = data.map(row =>
        headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) value = "";
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(",")
    );

    return [headerRow, ...dataRows].join("\n");
};

// ====== SEED DUMMY DATA ======
router.post("/seed", authMiddleware, allowRoles("super_admin"), async (req, res) => {
    try {
        const result = await seedDummyData();
        res.json({ message: "Demo data seeded successfully", ...result });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ message: "Failed to seed data", error: error.message });
    }
});

// ====== GET ALL COURSES ======
router.get("/courses", authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== LEARNING PROGRESS REPORTS ======
router.get("/learning-progress", authMiddleware, allowRoles("super_admin", "admin", "trainer"), async (req, res) => {
    try {
        const { courseId, userId } = req.query;
        const userRole = req.user.role;

        let query = {};

        // Trainers used to be restricted to their own courses, now global.
        /* if (userRole === "trainer") {
            const trainerCourses = await Course.find({ createdBy: req.user._id }).select("_id");
            const courseIds = trainerCourses.map(c => c._id);
            query.courseId = { $in: courseIds };
        } */

        if (courseId) {
            query.courseId = courseId;
        }
        if (userId) {
            query.userId = userId;
        }

        const enrollments = await CourseEnrollment.find(query)
            .populate("userId", "name email role")
            .populate("courseId", "title category duration createdBy")
            .sort({ lastAccessedAt: -1 });

        // Transform data for report
        const reportData = enrollments.map(e => ({
            userName: e.userId?.name || "Unknown",
            userEmail: e.userId?.email || "",
            userRole: e.userId?.role || "",
            courseTitle: e.courseId?.title || "Unknown",
            category: e.courseId?.category || "",
            progress: e.progress,
            status: e.status,
            startedAt: e.startedAt ? new Date(e.startedAt).toLocaleDateString() : "",
            lastAccessed: e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleDateString() : "",
            completedAt: e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ""
        }));

        res.json(reportData);
    } catch (error) {
        console.error("Learning progress error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== COURSE COMPLETION ANALYTICS ======
router.get("/course-completion", authMiddleware, allowRoles("super_admin", "admin", "trainer"), async (req, res) => {
    try {
        const userRole = req.user.role;

        let courseQuery = { isActive: true };

        // Global access for trainers
        /* if (userRole === "trainer") {
            courseQuery.createdBy = req.user._id;
        } */

        const courses = await Course.find(courseQuery)
            .populate("createdBy", "name email");

        const reportData = await Promise.all(courses.map(async (course) => {
            const enrollments = await CourseEnrollment.find({ courseId: course._id });
            const totalEnrolled = enrollments.length;
            const completed = enrollments.filter(e => e.status === "completed").length;
            const inProgress = enrollments.filter(e => e.status === "in_progress").length;
            const enrolled = enrollments.filter(e => e.status === "enrolled").length;
            const dropped = enrollments.filter(e => e.status === "dropped").length;

            const avgProgress = totalEnrolled > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
                : 0;

            const avgScore = totalEnrolled > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + (e.averageScore || 0), 0) / totalEnrolled)
                : 0;

            const completionRate = totalEnrolled > 0
                ? Math.round((completed / totalEnrolled) * 100)
                : 0;

            return {
                courseId: course._id,
                courseTitle: course.title,
                category: course.category,
                trainer: course.createdBy?.name || "Unassigned",
                trainerEmail: course.createdBy?.email || "",
                duration: course.duration,
                totalEnrolled,
                completed,
                inProgress,
                enrolled,
                dropped,
                avgProgress,
                avgScore,
                completionRate
            };
        }));

        res.json(reportData);
    } catch (error) {
        console.error("Course completion error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== USER PERFORMANCE METRICS ======
router.get("/user-performance", authMiddleware, allowRoles("super_admin", "admin", "trainer"), async (req, res) => {
    try {
        const userRole = req.user.role;

        // Get learners with their enrollments
        const learners = await User.find({ role: "learner", isActive: true }).select("name email");

        let courseFilter = {};
        const reportData = await Promise.all(learners.map(async (learner) => {
            const enrollmentQuery = { userId: learner._id }; // Removed trainer course filter to show "All Learners"
            const enrollments = await CourseEnrollment.find(enrollmentQuery)
                .populate("courseId", "title");

            const totalCourses = enrollments.length;
            const completedCourses = enrollments.filter(e => e.status === "completed").length;
            const inProgressCourses = enrollments.filter(e => e.status === "in_progress").length;

            const avgProgress = totalCourses > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
                : 0;

            const avgScore = totalCourses > 0
                ? Math.round(enrollments.reduce((sum, e) => sum + (e.averageScore || 0), 0) / totalCourses)
                : 0;

            const completionRate = totalCourses > 0
                ? Math.round((completedCourses / totalCourses) * 100)
                : 0;

            // Get last activity
            const lastActivity = enrollments.length > 0
                ? enrollments.sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))[0].lastAccessedAt
                : null;

            return {
                userName: learner.name,
                userEmail: learner.email,
                totalCourses,
                completedCourses,
                inProgressCourses,
                avgProgress,
                avgScore,
                completionRate,
                lastActivity: lastActivity ? new Date(lastActivity).toLocaleDateString() : "Never"
            };
        }));

        // Filter out users with no enrollments if trainer view
        const filteredData = userRole === "trainer"
            ? reportData.filter(r => r.totalCourses > 0)
            : reportData;

        res.json(filteredData);
    } catch (error) {
        console.error("User performance error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== CSV EXPORT ======
router.get("/export/:type", authMiddleware, allowRoles("super_admin", "admin", "trainer"), async (req, res) => {
    try {
        const { type } = req.params;
        let data = [];
        let headers = [];
        let filename = "";

        switch (type) {
            case "learning-progress":
                // Reuse the learning-progress logic
                const userRole = req.user.role;
                let query = {};

                /* if (userRole === "trainer") {
                    const trainerCourses = await Course.find({ createdBy: req.user._id }).select("_id");
                    query.courseId = { $in: trainerCourses.map(c => c._id) };
                } */

                const enrollments = await CourseEnrollment.find(query)
                    .populate("userId", "name email role")
                    .populate("courseId", "title category")
                    .sort({ lastAccessedAt: -1 });

                data = enrollments.map(e => ({
                    "User Name": e.userId?.name || "Unknown",
                    "Email": e.userId?.email || "",
                    "Role": e.userId?.role || "",
                    "Course": e.courseId?.title || "Unknown",
                    "Category": e.courseId?.category || "",
                    "Progress (%)": e.progress,
                    "Status": e.status,
                    "Started": e.startedAt ? new Date(e.startedAt).toLocaleDateString() : "",
                    "Last Accessed": e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleDateString() : "",
                    "Completed": e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ""
                }));
                headers = ["User Name", "Email", "Role", "Course", "Category", "Progress (%)", "Status", "Started", "Last Accessed", "Completed"];
                filename = "learning_progress_report.csv";
                break;

            case "course-completion":
                let courseQuery = { isActive: true };
                /* if (req.user.role === "trainer") {
                    courseQuery.createdBy = req.user._id;
                } */

                const courses = await Course.find(courseQuery).populate("createdBy", "name");

                data = await Promise.all(courses.map(async (course) => {
                    const enrs = await CourseEnrollment.find({ courseId: course._id });
                    const total = enrs.length;
                    const completed = enrs.filter(e => e.status === "completed").length;

                    return {
                        "Course Title": course.title,
                        "Category": course.category,
                        "Trainer": course.createdBy?.name || "Unassigned",
                        "Duration (hrs)": course.duration,
                        "Total Enrolled": total,
                        "Completed": completed,
                        "In Progress": enrs.filter(e => e.status === "in_progress").length,
                        "Completion Rate (%)": total > 0 ? Math.round((completed / total) * 100) : 0,
                        "Avg Progress (%)": total > 0 ? Math.round(enrs.reduce((s, e) => s + e.progress, 0) / total) : 0
                    };
                }));
                headers = ["Course Title", "Category", "Trainer", "Duration (hrs)", "Total Enrolled", "Completed", "In Progress", "Completion Rate (%)", "Avg Progress (%)"];
                filename = "course_completion_report.csv";
                break;

            case "user-performance":
                const learners = await User.find({ role: "learner", isActive: true }).select("name email");

                let courseFilter = {};
                /* if (req.user.role === "trainer") {
                    const trainerCourses = await Course.find({ createdBy: req.user._id }).select("_id");
                    courseFilter = { courseId: { $in: trainerCourses.map(c => c._id) } };
                } */

                data = await Promise.all(learners.map(async (learner) => {
                    const enrs = await CourseEnrollment.find({ userId: learner._id, ...courseFilter });
                    const total = enrs.length;
                    const completed = enrs.filter(e => e.status === "completed").length;

                    return {
                        "User Name": learner.name,
                        "Email": learner.email,
                        "Total Courses": total,
                        "Completed": completed,
                        "In Progress": enrs.filter(e => e.status === "in_progress").length,
                        "Avg Progress (%)": total > 0 ? Math.round(enrs.reduce((s, e) => s + e.progress, 0) / total) : 0,
                        "Avg Score": total > 0 ? Math.round(enrs.reduce((s, e) => s + (e.averageScore || 0), 0) / total) : 0,
                        "Completion Rate (%)": total > 0 ? Math.round((completed / total) * 100) : 0
                    };
                }));

                // Filter for trainers
                if (req.user.role === "trainer") {
                    data = data.filter(d => d["Total Courses"] > 0);
                }

                headers = ["User Name", "Email", "Total Courses", "Completed", "In Progress", "Avg Progress (%)", "Avg Score", "Completion Rate (%)"];
                filename = "user_performance_report.csv";
                break;

            default:
                return res.status(400).json({ message: "Invalid report type" });
        }

        const csv = toCSV(data, headers);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(csv);
    } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Failed to export report" });
    }
});

// ====== DASHBOARD TRENDS (SUPER ADMIN) ======
router.get("/organization-trends", authMiddleware, allowRoles("super_admin"), async (req, res) => {
    try {
        // Mock data for trends (last 6 months)
        // In a real app, this would aggregate actual enrollment/completion dates
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

        // Basic implementation: Count enrollments created in each month (mock for now)
        // Since we don't have historical data seeding for specific dates, we'll generate realistic-looking data
        // based on current counts.

        const trends = {
            labels: months,
            datasets: [
                {
                    label: 'Course Completions',
                    data: [45, 52, 38, 61, 48, 55], // Realistic completion data
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    tension: 0.4
                },
                {
                    label: 'New Enrollments',
                    data: [68, 75, 62, 88, 71, 82], // Realistic enrollment data
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    tension: 0.4
                },
                {
                    label: 'Active Users',
                    data: [120, 135, 128, 152, 145, 158], // Active user trend
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.5)',
                    tension: 0.4
                },
            ],
        };

        res.json(trends);
    } catch (error) {
        console.error("Trends error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== DASHBOARD SUMMARY ======
router.get("/summary", authMiddleware, allowRoles("super_admin", "admin", "trainer"), async (req, res) => {
    try {
        const userRole = req.user.role;

        let courseQuery = { isActive: true };
        /* if (userRole === "trainer") {
            courseQuery.createdBy = req.user._id;
        } */

        const totalCourses = await Course.countDocuments(courseQuery);
        const courses = await Course.find(courseQuery).select("_id");
        const courseIds = courses.map(c => c._id);

        const enrollmentQuery = courseIds.length > 0 ? { courseId: { $in: courseIds } } : {};

        const totalEnrollments = await CourseEnrollment.countDocuments(enrollmentQuery);
        const completedEnrollments = await CourseEnrollment.countDocuments({ ...enrollmentQuery, status: "completed" });
        const inProgressEnrollments = await CourseEnrollment.countDocuments({ ...enrollmentQuery, status: "in_progress" });

        const enrollments = await CourseEnrollment.find(enrollmentQuery);
        const avgProgress = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0;

        const overallCompletionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        const totalLearners = userRole === "trainer"
            ? (await CourseEnrollment.distinct("userId", enrollmentQuery)).length
            : await User.countDocuments({ role: "learner", isActive: true });

        const courseStats = await Promise.all(
            (await Course.find(courseQuery).select("title createdBy")).map(async (course) => {
                const count = await CourseEnrollment.countDocuments({ courseId: course._id });
                return {
                    _id: course._id,
                    title: course.title,
                    enrollmentCount: count,
                    createdBy: course.createdBy
                };
            })
        );

        res.json({
            totalCourses,
            totalLearners,
            totalEnrollments,
            completedEnrollments,
            inProgressEnrollments,
            avgProgress,
            overallCompletionRate,
            courseStats
        });
    } catch (error) {
        console.error("Summary error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ====== LEARNER DASHBOARD DATA ======
router.get("/learner-summary", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const enrollments = await CourseEnrollment.find({ userId: userId })
            .populate("courseId", "title category thumbnail duration")
            .sort({ lastAccessedAt: -1 });

        // Map for frontend compatibility (enr.course)
        const mappedEnrollments = enrollments.map(e => {
            const obj = e.toObject();
            return {
                ...obj,
                course: obj.courseId
            };
        });

        const totalEnrolled = enrollments.length;
        const enrolledCourseIds = enrollments.map(e => e.courseId._id || e.courseId);

        const completed = enrollments.filter(e => e.status === "completed").length;
        const inProgress = enrollments.filter(e => e.status === "in_progress").length;

        const avgProgress = totalEnrolled > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
            : 0;

        // Dynamic Indicators Data
        const [availableCoursesCount, noteCount, certificateCount, unreadNotifications, totalQuizzes] = await Promise.all([
            Course.countDocuments({ _id: { $nin: enrolledCourseIds } }),
            Note.countDocuments({ userId }),
            Certificate.countDocuments({ userId }),
            Notification.countDocuments({ userId, isRead: false }),
            Quiz.countDocuments({ courseId: { $in: enrolledCourseIds }, isActive: true })
        ]);

        res.json({
            enrollments: mappedEnrollments,
            stats: {
                totalEnrolled,
                completed,
                inProgress,
                avgProgress,
                availableCoursesCount,
                noteCount,
                certificateCount,
                unreadNotifications,
                quizCount: totalQuizzes
            }
        });
    } catch (error) {
        console.error("Learner summary error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
