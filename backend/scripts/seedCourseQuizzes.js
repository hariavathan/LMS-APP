const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_module';

// Course-specific quiz questions
const quizTemplates = {
    'IT & Software': [
        {
            question: "What is the primary purpose of version control systems like Git?",
            options: [
                "To compile code faster",
                "To track changes and collaborate on code",
                "To run automated tests",
                "To deploy applications"
            ],
            correctAnswer: 1
        },
        {
            question: "Which HTTP method is used to update an existing resource?",
            options: ["GET", "POST", "PUT", "DELETE"],
            correctAnswer: 2
        },
        {
            question: "What does API stand for?",
            options: [
                "Application Programming Interface",
                "Advanced Program Integration",
                "Automated Process Interaction",
                "Application Process Interface"
            ],
            correctAnswer: 0
        },
        {
            question: "Which is NOT a JavaScript data type?",
            options: ["String", "Boolean", "Float", "Object"],
            correctAnswer: 2
        },
        {
            question: "What is the main advantage of using CSS flexbox?",
            options: [
                "Faster page load times",
                "Better SEO rankings",
                "Flexible and responsive layouts",
                "Reduced file sizes"
            ],
            correctAnswer: 2
        }
    ],
    'Business': [
        {
            question: "What does ROI stand for in business?",
            options: [
                "Return on Investment",
                "Rate of Interest",
                "Revenue Operation Index",
                "Resource Optimization Initiative"
            ],
            correctAnswer: 0
        },
        {
            question: "Which of these is a key component of a business model canvas?",
            options: [
                "Customer Segments",
                "Personal Goals",
                "Weather Forecast",
                "Office Location"
            ],
            correctAnswer: 0
        },
        {
            question: "What is the primary goal of market segmentation?",
            options: [
                "To increase production costs",
                "To target specific customer groups effectively",
                "To reduce employee count",
                "To expand office space"
            ],
            correctAnswer: 1
        },
        {
            question: "Which metric measures customer loyalty?",
            options: [
                "Net Promoter Score (NPS)",
                "Gross Domestic Product",
                "Return on Assets",
                "Debt to Equity Ratio"
            ],
            correctAnswer: 0
        },
        {
            question: "What is a SWOT analysis used for?",
            options: [
                "Testing software",
                "Strategic planning and decision making",
                "Financial auditing",
                "Customer service"
            ],
            correctAnswer: 1
        }
    ],
    'Design': [
        {
            question: "What does UI stand for in design?",
            options: [
                "Universal Interface",
                "User Interface",
                "Unified Integration",
                "Updated Information"
            ],
            correctAnswer: 1
        },
        {
            question: "Which color model is used for digital screens?",
            options: ["CMYK", "RGB", "Pantone", "Grayscale"],
            correctAnswer: 1
        },
        {
            question: "What is the purpose of white space in design?",
            options: [
                "To save ink",
                "To improve readability and visual hierarchy",
                "To reduce file size",
                "To make printing easier"
            ],
            correctAnswer: 1
        },
        {
            question: "What does UX stand for?",
            options: [
                "User Experience",
                "Universal Export",
                "Unified Extension",
                "Updated Example"
            ],
            correctAnswer: 0
        },
        {
            question: "Which principle refers to the distribution of visual weight?",
            options: ["Contrast", "Balance", "Proximity", "Repetition"],
            correctAnswer: 1
        }
    ],
    'Artificial Intelligence': [
        {
            question: "What is machine learning?",
            options: [
                "Programming computers manually",
                "Algorithms that improve through experience",
                "Physical robot construction",
                "Network cable management"
            ],
            correctAnswer: 1
        },
        {
            question: "Which of these is NOT a type of machine learning?",
            options: [
                "Supervised Learning",
                "Unsupervised Learning",
                "Reinforcement Learning",
                "Theoretical Learning"
            ],
            correctAnswer: 3
        },
        {
            question: "What does NLP stand for in AI?",
            options: [
                "Natural Language Processing",
                "Network Level Protocol",
                "New Learning Path",
                "Neural Link Processing"
            ],
            correctAnswer: 0
        },
        {
            question: "What is a neural network inspired by?",
            options: [
                "Computer circuits",
                "The human brain",
                "Internet protocols",
                "Database structures"
            ],
            correctAnswer: 1
        },
        {
            question: "Which algorithm is commonly used for classification tasks?",
            options: [
                "Bubble Sort",
                "Decision Trees",
                "Binary Search",
                "Quick Sort"
            ],
            correctAnswer: 1
        }
    ],
    'Marketing': [
        {
            question: "What are the 4 Ps of marketing?",
            options: [
                "Product, Price, Place, Promotion",
                "People, Process, Planning, Performance",
                "Profit, Production, Positioning, Pricing",
                "Purpose, Plan, Practice, Profit"
            ],
            correctAnswer: 0
        },
        {
            question: "What does SEO stand for?",
            options: [
                "Social Engagement Optimization",
                "Search Engine Optimization",
                "Sales Efficiency Operation",
                "Strategic Executive Officer"
            ],
            correctAnswer: 1
        },
        {
            question: "Which metric measures the cost of acquiring a customer?",
            options: ["ROI", "CAC", "LTV", "CTR"],
            correctAnswer: 1
        },
        {
            question: "What is A/B testing used for?",
            options: [
                "Comparing two versions to see which performs better",
                "Testing product quality",
                "Auditing finances",
                "Checking website security"
            ],
            correctAnswer: 0
        },
        {
            question: "What does CTR stand for in digital marketing?",
            options: [
                "Cost to Revenue",
                "Click Through Rate",
                "Customer Transaction Record",
                "Conversion Tracking Report"
            ],
            correctAnswer: 1
        }
    ],
    'General': [
        {
            question: "What is the main benefit of continuous learning?",
            options: [
                "Higher salary only",
                "Personal growth and skill development",
                "Avoiding work",
                "Less responsibility"
            ],
            correctAnswer: 1
        },
        {
            question: "Which learning method involves hands-on practice?",
            options: [
                "Passive reading",
                "Experiential learning",
                "Memorization",
                "Observation only"
            ],
            correctAnswer: 1
        },
        {
            question: "What percentage of information is typically retained through practice?",
            options: ["10%", "30%", "75%", "50%"],
            correctAnswer: 2
        },
        {
            question: "What is the Pomodoro Technique used for?",
            options: [
                "Cooking pasta",
                "Time management and productivity",
                "Exercise routines",
                "Social networking"
            ],
            correctAnswer: 1
        },
        {
            question: "Which learning style involves visual aids?",
            options: [
                "Auditory",
                "Kinesthetic",
                "Visual",
                "Verbal"
            ],
            correctAnswer: 2
        }
    ]
};

// Generate 15 questions for a course by repeating and varying the base questions
function generateQuestions(category) {
    const baseQuestions = quizTemplates[category] || quizTemplates['General'];
    const questions = [...baseQuestions];

    // Add more varied questions to reach 15
    const additionalQuestions = [
        {
            question: `What is a key skill needed in ${category}?`,
            options: [
                "Critical thinking and problem solving",
                "Ignoring feedback",
                "Avoiding challenges",
                "Working in isolation"
            ],
            correctAnswer: 0
        },
        {
            question: `Which approach is best for learning ${category} concepts?`,
            options: [
                "Cramming everything at once",
                "Consistent practice and application",
                "Memorizing without understanding",
                "Avoiding difficult topics"
            ],
            correctAnswer: 1
        },
        {
            question: `What role does collaboration play in ${category}?`,
            options: [
                "No role at all",
                "Enhances learning through knowledge sharing",
                "Slows down progress",
                "Only useful for beginners"
            ],
            correctAnswer: 1
        },
        {
            question: "How can you best apply what you learn?",
            options: [
                "Through real-world projects",
                "By only reading theory",
                "Waiting for perfect conditions",
                "Avoiding practice"
            ],
            correctAnswer: 0
        },
        {
            question: "What is the importance of feedback in learning?",
            options: [
                "It's unnecessary",
                "Helps identify areas for improvement",
                "Only demotivates learners",
                "Should be avoided"
            ],
            correctAnswer: 1
        },
        {
            question: "Which mindset is most beneficial for learning?",
            options: [
                "Fixed mindset",
                "Growth mindset",
                "Pessimistic outlook",
                "Avoiding challenges"
            ],
            correctAnswer: 1
        },
        {
            question: "What is the value of setting learning goals?",
            options: [
                "Creates unnecessary pressure",
                "Provides direction and motivation",
                "Limits creativity",
                "Wastes time"
            ],
            correctAnswer: 1
        },
        {
            question: "How often should you review learned material?",
            options: [
                "Never, once is enough",
                "Regularly to reinforce retention",
                "Only before exams",
                "When you forget everything"
            ],
            correctAnswer: 1
        },
        {
            question: "What is the benefit of teaching others what you've learned?",
            options: [
                "No benefit",
                "Reinforces your own understanding",
                "Makes you look superior",
                "Wastes your time"
            ],
            correctAnswer: 1
        },
        {
            question: "Which resource is most valuable for continuous learning?",
            options: [
                "Only textbooks",
                "Multiple sources including online resources and mentors",
                "Random internet articles",
                "Social media posts"
            ],
            correctAnswer: 1
        }
    ];

    questions.push(...additionalQuestions);
    return questions.slice(0, 15); // Return exactly 15 questions
}

async function seedCourseQuizzes() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a trainer user to set as quiz creator
        const trainer = await User.findOne({ role: 'trainer' });
        if (!trainer) {
            console.error('No trainer found. Please create a trainer user first.');
            process.exit(1);
        }
        console.log(`Using trainer: ${trainer.name} (${trainer.email})`);

        // Get all courses
        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses`);

        // Delete existing quizzes marked as final
        await Quiz.deleteMany({ isFinalQuiz: true });
        console.log('Cleared existing final quizzes');

        let created = 0;

        for (const course of courses) {
            const questions = generateQuestions(course.category);

            const quiz = await Quiz.create({
                title: `${course.title} - Final Assessment`,
                courseId: course._id,
                createdBy: trainer._id, // Use trainer as quiz creator
                passingScore: 70,
                timeLimit: 20, // 20 minutes
                isFinalQuiz: true,
                totalQuestions: 15,
                questions: questions
            });

            created++;
            console.log(`✅ Created quiz for: ${course.title}`);
        }

        console.log(`\n🎉 Successfully created ${created} course quizzes!`);
        console.log('\nQuiz Details:');
        console.log('- Questions per quiz: 15 MCQs');
        console.log('- Time limit: 20 minutes');
        console.log('- Passing score: 70%');
        console.log('- Question types: Course-specific + General learning');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding quizzes:', error);
        process.exit(1);
    }
}

seedCourseQuizzes();
