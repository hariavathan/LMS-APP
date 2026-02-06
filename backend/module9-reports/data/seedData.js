// module9-reports/data/seedData.js
const Course = require("../../models/Course");
const CourseEnrollment = require("../../models/Enrollment");
const User = require("../../models/User");

const coursesData = [
    {
        title: "Introduction to JavaScript",
        description: "Learn the fundamentals of JavaScript programming language",
        duration: 20,
        category: "Programming",
        modules: [
            { title: "Variables and Data Types", duration: 45 },
            { title: "Functions and Scope", duration: 60 },
            { title: "DOM Manipulation", duration: 90 },
            { title: "Async Programming", duration: 75 },
            { title: "Final Project", duration: 120 }
        ]
    },
    {
        title: "React Fundamentals",
        description: "Master React.js from basics to advanced concepts",
        duration: 25,
        category: "Frontend",
        modules: [
            { title: "JSX and Components", duration: 60 },
            { title: "State and Props", duration: 75 },
            { title: "Hooks Deep Dive", duration: 90 },
            { title: "Routing and Navigation", duration: 60 },
            { title: "State Management", duration: 90 }
        ]
    },
    {
        title: "Node.js Backend Development",
        description: "Build scalable backend applications with Node.js",
        duration: 30,
        category: "Backend",
        modules: [
            { title: "Node.js Basics", duration: 45 },
            { title: "Express.js Framework", duration: 90 },
            { title: "RESTful API Design", duration: 75 },
            { title: "Database Integration", duration: 90 },
            { title: "Authentication & Security", duration: 60 }
        ]
    },
    {
        title: "MongoDB Essentials",
        description: "Learn NoSQL database design and operations with MongoDB",
        duration: 15,
        category: "Database",
        modules: [
            { title: "Document Model", duration: 30 },
            { title: "CRUD Operations", duration: 45 },
            { title: "Aggregation Pipeline", duration: 60 },
            { title: "Indexing and Performance", duration: 45 }
        ]
    },
    {
        title: "Corporate Compliance Training",
        description: "Essential compliance and ethics training for employees",
        duration: 8,
        category: "Compliance",
        modules: [
            { title: "Code of Conduct", duration: 30 },
            { title: "Data Privacy", duration: 45 },
            { title: "Workplace Safety", duration: 30 },
            { title: "Anti-Harassment Policy", duration: 35 }
        ]
    },
    {
        title: "Leadership & Management Skills",
        description: "Develop essential leadership and team management abilities",
        duration: 12,
        category: "Soft Skills",
        modules: [
            { title: "Communication Essentials", duration: 45 },
            { title: "Team Building", duration: 60 },
            { title: "Conflict Resolution", duration: 45 },
            { title: "Performance Management", duration: 50 }
        ]
    }
];

const seedDummyData = async () => {
    try {
        // Clear existing data
        await Course.deleteMany({});
        await CourseEnrollment.deleteMany({});

        // Get trainers and learners
        const trainers = await User.find({ role: "trainer" });
        const learners = await User.find({ role: "learner" });

        // If no trainers exist, use any user as trainer placeholder
        let trainerPool = trainers.length > 0 ? trainers : await User.find().limit(2);

        // Create courses with trainers assigned
        const createdCourses = [];
        for (let i = 0; i < coursesData.length; i++) {
            const trainer = trainerPool[i % trainerPool.length];
            const course = await Course.create({
                ...coursesData[i],
                createdBy: trainer?._id,
                isActive: true
            });
            createdCourses.push(course);
        }

        // Create enrollments for learners
        let learnerPool = learners.length > 0 ? learners : await User.find({ role: { $ne: "super_admin" } }).limit(5);

        const statuses = ["enrolled", "in_progress", "in_progress", "in_progress", "completed"];

        for (const learner of learnerPool) {
            // Enroll each learner in 2-4 random courses
            const numCourses = Math.floor(Math.random() * 3) + 2;
            const shuffledCourses = [...createdCourses].sort(() => 0.5 - Math.random());

            for (let i = 0; i < Math.min(numCourses, shuffledCourses.length); i++) {
                const course = shuffledCourses[i];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const progress = status === "completed" ? 100 :
                    status === "in_progress" ? Math.floor(Math.random() * 80) + 10 :
                        Math.floor(Math.random() * 15);

                const completedModulesCount = Math.floor((progress / 100) * course.modules.length);
                const completedModules = course.modules.slice(0, completedModulesCount).map(m => m.title);

                const score = status === "completed" ? Math.floor(Math.random() * 30) + 70 :
                    progress > 50 ? Math.floor(Math.random() * 40) + 40 :
                        progress > 20 ? Math.floor(Math.random() * 30) + 20 : 0;

                const startedAt = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);
                const completedAt = status === "completed" ? new Date(startedAt.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null;

                await CourseEnrollment.create({
                    userId: learner._id,
                    courseId: course._id,
                    progress,
                    completedModules,
                    score,
                    status,
                    startedAt,
                    completedAt,
                    lastAccessedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
                });
            }
        }

        return {
            coursesCreated: createdCourses.length,
            enrollmentsCreated: await CourseEnrollment.countDocuments()
        };
    } catch (error) {
        console.error("Seed error:", error);
        throw error;
    }
};

module.exports = { seedDummyData };
