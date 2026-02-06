const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_module';

const resources = [
    // Books
    {
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        type: "book",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
        url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
        thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
        category: "IT & Software",
        tags: ["Programming", "Best Practices", "Software Engineering"]
    },
    {
        title: "Designing Data-Intensive Applications",
        type: "book",
        description: "The big ideas behind reliable, scalable, and maintainable systems. Learn how to navigate the diverse landscape of technologies for processing and storing data.",
        url: "https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321",
        thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
        category: "IT & Software",
        tags: ["Database", "Architecture", "Big Data"]
    },
    {
        title: "The Lean Startup",
        type: "book",
        description: "How today's entrepreneurs use continuous innovation to create radically successful businesses. A must-read for anyone building a startup.",
        url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        category: "Business",
        tags: ["Entrepreneurship", "Startup", "Innovation"]
    },
    {
        title: "Don't Make Me Think",
        type: "book",
        description: "A common sense approach to web usability. This book demystifies the art of intuitive navigation and information design.",
        url: "https://www.amazon.com/Dont-Make-Think-Revisited-Usability/dp/0321965515",
        thumbnail: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400",
        category: "Design",
        tags: ["UX", "Web Design", "Usability"]
    },
    {
        title: "Deep Learning",
        type: "book",
        description: "Written by three experts in the field, Deep Learning is the only comprehensive book on the subject. An MIT Press book.",
        url: "https://www.deeplearningbook.org/",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        category: "Artificial Intelligence",
        tags: ["AI", "Machine Learning", "Neural Networks"]
    },
    {
        title: "Atomic Habits",
        type: "book",
        description: "An easy & proven way to build good habits & break bad ones. Tiny changes, remarkable results.",
        url: "https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299",
        thumbnail: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
        category: "Business",
        tags: ["Productivity", "Self-Improvement", "Habits"]
    },
    {
        title: "The Design of Everyday Things",
        type: "book",
        description: "Design doesn't have to complicated, which is why this guide to human-centered design shows that usability is just as important as aesthetics.",
        url: "https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654",
        thumbnail: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400",
        category: "Design",
        tags: ["Product Design", "UX", "Psychology"]
    },
    {
        title: "Hooked: How to Build Habit-Forming Products",
        type: "book",
        description: "Why do some products capture widespread attention while others flop? What makes us engage with certain products out of sheer habit?",
        url: "https://www.amazon.com/Hooked-How-Build-Habit-Forming-Products/dp/1591847788",
        thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        category: "Marketing",
        tags: ["Product", "Psychology", "User Engagement"]
    },
    {
        title: "Python Crash Course",
        type: "book",
        description: "A hands-on, project-based introduction to programming. The best-selling Python book in the world.",
        url: "https://www.amazon.com/Python-Crash-Course-2nd-Edition/dp/1593279280",
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
        category: "IT & Software",
        tags: ["Python", "Programming", "Beginner"]
    },
    {
        title: "Influence: The Psychology of Persuasion",
        type: "book",
        description: "Influence, the classic book on persuasion, explains the psychology of why people say 'yes'—and how to apply these understandings.",
        url: "https://www.amazon.com/Influence-Psychology-Persuasion-Robert-Cialdini/dp/006124189X",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        category: "Marketing",
        tags: ["Psychology", "Sales", "Marketing"]
    },

    // Study Tools
    {
        title: "Visual Studio Code",
        type: "tool",
        description: "Free, open-source code editor with built-in support for debugging, Git control, syntax highlighting, and extensions for every language.",
        url: "https://code.visualstudio.com/",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        category: "IT & Software",
        tags: ["IDE", "Development", "Code Editor"]
    },
    {
        title: "Figma",
        type: "tool",
        description: "Collaborative interface design tool. Design, prototype, and gather feedback all in one place with Figma.",
        url: "https://www.figma.com/",
        thumbnail: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400",
        category: "Design",
        tags: ["Design Tool", "Prototyping", "UI/UX"]
    },
    {
        title: "Notion",
        type: "tool",
        description: "All-in-one workspace for notes, tasks, wikis, and databases. Perfect for personal productivity and team collaboration.",
        url: "https://www.notion.so/",
        thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
        category: "Business",
        tags: ["Productivity", "Note-taking", "Project Management"]
    },
    {
        title: "Postman",
        type: "tool",
        description: "API platform for building and using APIs. Simplify each step of the API lifecycle and streamline collaboration.",
        url: "https://www.postman.com/",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        category: "IT & Software",
        tags: ["API", "Testing", "Development"]
    },
    {
        title: "Canva",
        type: "tool",
        description: "Free design tool with thousands of professional templates. Create stunning graphics, presentations, and social media posts.",
        url: "https://www.canva.com/",
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
        category: "Design",
        tags: ["Graphic Design", "Templates", "Marketing"]
    },
    {
        title: "Google Analytics",
        type: "tool",
        description: "Free web analytics service that tracks and reports website traffic. Essential for understanding your audience.",
        url: "https://analytics.google.com/",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        category: "Marketing",
        tags: ["Analytics", "SEO", "Data"]
    },
    {
        title: "Jupyter Notebook",
        type: "tool",
        description: "Open-source web application for creating and sharing documents with live code, equations, visualizations and narrative text.",
        url: "https://jupyter.org/",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        category: "Artificial Intelligence",
        tags: ["Data Science", "Python", "Machine Learning"]
    },
    {
        title: "Trello",
        type: "tool",
        description: "Visual collaboration tool that creates a shared perspective on any project. Organize tasks with boards, lists, and cards.",
        url: "https://trello.com/",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
        category: "Business",
        tags: ["Project Management", "Collaboration", "Productivity"]
    },
    {
        title: "GitHub",
        type: "tool",
        description: "Development platform for version control and collaboration. Host and review code, manage projects, and build software.",
        url: "https://github.com/",
        thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400",
        category: "IT & Software",
        tags: ["Git", "Version Control", "Collaboration"]
    },
    {
        title: "Slack",
        type: "tool",
        description: "Business communication platform featuring persistent chat rooms organized by topic, private groups, and direct messaging.",
        url: "https://slack.com/",
        thumbnail: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400",
        category: "Business",
        tags: ["Communication", "Team Collaboration", "Productivity"]
    },

    // Videos (Educational Resources)
    {
        title: "MIT OpenCourseWare",
        type: "video",
        description: "Free lecture notes, exams, and videos from MIT. No registration required. Access thousands of courses from one of the world's leading universities.",
        url: "https://ocw.mit.edu/",
        thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
        category: "IT & Software",
        tags: ["Education", "University", "Free Courses"]
    },
    {
        title: "freeCodeCamp",
        type: "video",
        description: "Learn to code for free. Build projects. Earn certifications. Thousands of hours of content on web development, data science, and more.",
        url: "https://www.freecodecamp.org/",
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
        category: "IT & Software",
        tags: ["Coding", "Web Development", "Free"]
    },
    {
        title: "Coursera",
        type: "video",
        description: "Build skills with courses from top universities like Yale, Michigan, Stanford, and leading companies like Google and IBM.",
        url: "https://www.coursera.org/",
        thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400",
        category: "General",
        tags: ["Online Learning", "Certificates", "University"]
    }
];

async function seedResources() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing resources
        await Resource.deleteMany({});
        console.log('Cleared existing resources');

        // Create resources
        const created = await Resource.insertMany(resources);
        console.log(`✅ Successfully created ${created.length} resources!`);

        // Summary
        const bookCount = created.filter(r => r.type === 'book').length;
        const toolCount = created.filter(r => r.type === 'tool').length;
        const videoCount = created.filter(r => r.type === 'video').length;

        console.log(`\n📚 Books: ${bookCount}`);
        console.log(`🛠️  Tools: ${toolCount}`);
        console.log(`🎥 Videos: ${videoCount}`);

        console.log('\nResources by category:');
        const categories = {};
        created.forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + 1;
        });
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding resources:', error);
        process.exit(1);
    }
}

seedResources();
