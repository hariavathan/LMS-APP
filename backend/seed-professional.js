const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_module";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // 1. Create Trainer
        const trainerEmail = "trainer@lms.com";
        const passwordHash = await bcrypt.hash("Trainer@123", 10);

        let trainer = await User.findOne({ email: trainerEmail });
        if (!trainer) {
            trainer = await User.create({
                name: "Sarah Johnson",
                email: trainerEmail,
                password: passwordHash,
                role: "trainer",
                isActive: true
            });
            console.log("Created Trainer: trainer@lms.com / Trainer@123");
        } else {
            console.log("Trainer already exists.");
        }

        // 2. Create Learners
        const learnerData = [
            { name: "Alex Thompson", email: "learner1@lms.com" },
            { name: "Maria Garcia", email: "learner2@lms.com" },
            { name: "James Wilson", email: "learner3@lms.com" }
        ];

        const learners = [];
        for (const data of learnerData) {
            let learner = await User.findOne({ email: data.email });
            if (!learner) {
                learner = await User.create({
                    name: data.name,
                    email: data.email,
                    password: passwordHash,
                    role: "learner",
                    isActive: true
                });
                console.log(`Created Learner: ${data.email} / Trainer@123`);
            }
            learners.push(learner);
        }

        // 3. Delete existing courses and enrollments to refresh with new structure
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        console.log("Cleared existing courses and enrollments...");

        // 4. Create Professional Courses with Modules
        const courseData = [
            {
                title: "Complete Web Development Bootcamp",
                subtitle: "From Zero to Full-Stack Developer in 12 Weeks",
                description: "Master modern web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and launch your career.",
                longDescription: "This comprehensive bootcamp covers everything you need to become a professional web developer. Starting from the fundamentals of HTML and CSS, you'll progress through JavaScript, React, and backend development with Node.js and MongoDB.",
                category: "IT & Software",
                subcategory: "Web Development",
                level: "Beginner",
                language: "English",
                thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
                duration: 720,
                price: 0,
                certificate: true,
                learningObjectives: [
                    "Build responsive websites from scratch",
                    "Master JavaScript and modern ES6+ features",
                    "Create full-stack applications with React and Node.js",
                    "Work with databases using MongoDB"
                ],
                targetAudience: [
                    "Complete beginners with no coding experience",
                    "Career changers looking to enter tech",
                    "Students seeking practical web development skills"
                ],
                instructor: {
                    name: "Sarah Johnson",
                    bio: "Senior Full-Stack Developer with 10+ years of experience at top tech companies.",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                    credentials: ["Google Certified Developer", "AWS Solutions Architect"]
                },
                enrollmentType: "open",
                isPublished: true,
                featured: true,
                modules: [
                    {
                        title: "HTML & CSS Fundamentals",
                        description: "Learn the building blocks of every website",
                        order: 1,
                        lessons: [
                            { title: "Introduction to HTML", content: "Understanding HTML structure, tags, and semantic markup. Learn how browsers interpret HTML to render web pages.", durationMinutes: 45 },
                            { title: "CSS Styling Basics", content: "Selectors, properties, and values. Master the box model and layout fundamentals.", durationMinutes: 60 },
                            { title: "Responsive Design", content: "Media queries, flexbox, and CSS Grid for building layouts that work on any device.", durationMinutes: 75 }
                        ]
                    },
                    {
                        title: "JavaScript Essentials",
                        description: "Programming fundamentals with JavaScript",
                        order: 2,
                        lessons: [
                            { title: "Variables & Data Types", content: "Understanding let, const, var, and JavaScript's type system.", durationMinutes: 40 },
                            { title: "Functions & Scope", content: "Arrow functions, closures, and the execution context.", durationMinutes: 55 },
                            { title: "DOM Manipulation", content: "Selecting elements, handling events, and creating dynamic interfaces.", durationMinutes: 70 },
                            { title: "Async JavaScript", content: "Promises, async/await, and fetching data from APIs.", durationMinutes: 65 }
                        ]
                    },
                    {
                        title: "React Development",
                        description: "Build modern user interfaces with React",
                        order: 3,
                        lessons: [
                            { title: "React Components", content: "Creating functional components and understanding JSX syntax.", durationMinutes: 50 },
                            { title: "State & Props", content: "Managing component state with hooks and passing data with props.", durationMinutes: 60 },
                            { title: "React Router", content: "Building single-page applications with client-side routing.", durationMinutes: 45 }
                        ]
                    }
                ]
            },
            {
                title: "Digital Marketing Masterclass",
                subtitle: "Grow Any Business with Proven Marketing Strategies",
                description: "Learn SEO, social media marketing, content strategy, and paid advertising to drive traffic and conversions for any business.",
                longDescription: "This masterclass teaches you the complete digital marketing ecosystem. From organic search optimization to paid campaigns, you'll learn strategies used by top marketers at Fortune 500 companies.",
                category: "Marketing",
                subcategory: "Digital Marketing",
                level: "Intermediate",
                language: "English",
                thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
                duration: 480,
                price: 0,
                certificate: true,
                learningObjectives: [
                    "Develop comprehensive SEO strategies",
                    "Create high-converting social media campaigns",
                    "Master Google Ads and Facebook Ads",
                    "Analyze marketing metrics and optimize ROI"
                ],
                targetAudience: [
                    "Marketing professionals seeking to upskill",
                    "Business owners wanting to grow online",
                    "Entrepreneurs launching new ventures"
                ],
                instructor: {
                    name: "Sarah Johnson",
                    bio: "Former Marketing Director at leading e-commerce brands with $50M+ in ad spend managed.",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                    credentials: ["Google Ads Certified", "HubSpot Inbound Marketing"]
                },
                enrollmentType: "open",
                isPublished: true,
                featured: true,
                modules: [
                    {
                        title: "Search Engine Optimization",
                        description: "Master the art of ranking on Google",
                        order: 1,
                        lessons: [
                            { title: "SEO Fundamentals", content: "How search engines work, crawling, indexing, and ranking factors.", durationMinutes: 50 },
                            { title: "Keyword Research", content: "Finding profitable keywords using professional tools and competitor analysis.", durationMinutes: 65 },
                            { title: "On-Page Optimization", content: "Title tags, meta descriptions, header structure, and content optimization.", durationMinutes: 55 },
                            { title: "Link Building Strategies", content: "Ethical link building techniques to boost domain authority.", durationMinutes: 60 }
                        ]
                    },
                    {
                        title: "Social Media Marketing",
                        description: "Build engaged audiences across platforms",
                        order: 2,
                        lessons: [
                            { title: "Platform Strategy", content: "Choosing the right platforms for your audience and goals.", durationMinutes: 40 },
                            { title: "Content Creation", content: "Creating viral content that drives engagement and shares.", durationMinutes: 55 },
                            { title: "Community Management", content: "Building and nurturing an engaged community around your brand.", durationMinutes: 45 }
                        ]
                    }
                ]
            },
            {
                title: "Project Management Professional",
                subtitle: "Lead Projects with Confidence and Deliver Results",
                description: "Master project management methodologies including Agile, Scrum, and Waterfall. Prepare for PMP certification.",
                longDescription: "This comprehensive course covers all aspects of project management from initiation to closure. Learn the skills needed to lead cross-functional teams, manage stakeholders, and deliver projects on time and budget.",
                category: "Business",
                subcategory: "Project Management",
                level: "Intermediate",
                language: "English",
                thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
                duration: 360,
                price: 0,
                certificate: true,
                learningObjectives: [
                    "Understand project management frameworks",
                    "Lead Agile and Scrum teams effectively",
                    "Manage project budgets and timelines",
                    "Handle stakeholder communication"
                ],
                targetAudience: [
                    "Aspiring project managers",
                    "Team leads seeking formal training",
                    "Professionals preparing for PMP exam"
                ],
                instructor: {
                    name: "Sarah Johnson",
                    bio: "PMP-certified project manager with experience delivering $100M+ projects.",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                    credentials: ["PMP Certified", "Scrum Master"]
                },
                enrollmentType: "open",
                isPublished: true,
                featured: false,
                modules: [
                    {
                        title: "Project Management Foundations",
                        description: "Core concepts and terminology",
                        order: 1,
                        lessons: [
                            { title: "What is Project Management?", content: "Defining projects, programs, and portfolios. Understanding the project lifecycle.", durationMinutes: 35 },
                            { title: "Project Initiation", content: "Creating project charters, identifying stakeholders, and defining scope.", durationMinutes: 50 },
                            { title: "Planning & Scheduling", content: "Work breakdown structures, Gantt charts, and critical path analysis.", durationMinutes: 60 }
                        ]
                    },
                    {
                        title: "Agile & Scrum",
                        description: "Modern iterative project management",
                        order: 2,
                        lessons: [
                            { title: "Agile Principles", content: "The Agile Manifesto and adaptive vs. predictive approaches.", durationMinutes: 40 },
                            { title: "Scrum Framework", content: "Sprints, ceremonies, roles, and artifacts.", durationMinutes: 55 },
                            { title: "Kanban Basics", content: "Visualizing workflow and limiting work in progress.", durationMinutes: 35 }
                        ]
                    }
                ]
            }
        ];

        for (const data of courseData) {
            const course = await Course.create({
                ...data,
                createdBy: trainer._id
            });
            console.log(`Created Course: ${data.title}`);

            // Enroll first learner in this course
            if (learners.length > 0) {
                const exists = await Enrollment.findOne({ userId: learners[0]._id, courseId: course._id });
                if (!exists) {
                    await Enrollment.create({
                        userId: learners[0]._id,
                        courseId: course._id,
                        status: "active",
                        progress: 0
                    });
                    console.log(`Enrolled ${learners[0].email} in ${course.title}`);
                }
            }
        }

        console.log("\n✅ Seeding complete!");
        console.log("\n📋 Test Credentials:");
        console.log("   Trainer: trainer@lms.com / Trainer@123");
        console.log("   Learner: learner1@lms.com / Trainer@123");
        console.log("   Super Admin: superadmin@lms.com / Admin@123");

        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedData();
