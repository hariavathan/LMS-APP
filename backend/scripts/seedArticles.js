const mongoose = require('mongoose');
const Article = require('../models/Article');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_module';

const articles = [
    {
        title: "Mastering React Hooks: A Comprehensive Guide",
        content: `# Introduction to React Hooks

React Hooks revolutionized how we write React components by allowing us to use state and other React features without writing a class.

## Why Hooks Matter

Before Hooks, managing state in functional components was impossible. Now, with \`useState\` and \`useEffect\`, we can:

- Manage component state elegantly
- Handle side effects cleanly
- Reuse stateful logic across components

## Essential Hooks

### useState
The most fundamental hook for managing component state:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
Handle side effects like data fetching, subscriptions, and DOM manipulation:

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

### useContext
Access context values without prop drilling:

\`\`\`javascript
const theme = useContext(ThemeContext);
\`\`\`

## Best Practices

1. **Always declare hooks at the top level** - Never inside loops or conditions
2. **Use custom hooks** for reusable logic
3. **Optimize with useMemo and useCallback** when needed
4. **Follow the Rules of Hooks** - Use ESLint plugin

## Conclusion

Hooks make React code more readable, maintainable, and powerful. Start with useState and useEffect, then explore advanced hooks as needed.`,
        category: "IT & Software",
        tags: ["React", "JavaScript", "Frontend", "Web Development"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
    },
    {
        title: "Building Scalable Microservices Architecture",
        content: `# Microservices Architecture: A Modern Approach

Microservices architecture has become the de facto standard for building large-scale, distributed applications.

## What Are Microservices?

Microservices break down monolithic applications into small, independent services that:

- Run in their own processes
- Communicate via well-defined APIs
- Can be deployed independently
- Use different technology stacks

## Key Benefits

### Scalability
Scale individual services based on demand rather than scaling the entire application.

### Flexibility
Choose the best technology for each service's specific needs.

### Resilience
Failures in one service don't bring down the entire system.

## Design Patterns

### API Gateway
Single entry point for all client requests, handling routing, authentication, and rate limiting.

### Service Discovery
Automatic detection of service instances for dynamic environments.

### Circuit Breaker
Prevent cascading failures by detecting and handling service failures gracefully.

## Challenges

1. **Distributed System Complexity** - More moving parts to manage
2. **Data Consistency** - Eventual consistency vs. strong consistency
3. **Testing** - Integration testing becomes more complex
4. **Monitoring** - Need comprehensive observability

## Best Practices

- Start with a monolith, migrate to microservices when needed
- Define clear service boundaries
- Implement proper logging and monitoring
- Use containerization (Docker, Kubernetes)
- Automate deployment pipelines

## Conclusion

Microservices offer tremendous benefits but come with complexity. Evaluate your needs carefully before adopting this architecture.`,
        category: "IT & Software",
        tags: ["Architecture", "Backend", "Microservices", "DevOps"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"
    },
    {
        title: "Effective Leadership in Remote Teams",
        content: `# Leading Remote Teams Successfully

The shift to remote work has fundamentally changed how we lead and manage teams.

## The Remote Leadership Challenge

Leading remote teams requires different skills than traditional in-office management:

- Building trust without face-to-face interaction
- Maintaining team cohesion across time zones
- Ensuring productivity without micromanaging
- Fostering company culture virtually

## Core Principles

### Communication is Everything

**Over-communicate** rather than under-communicate:
- Daily standups via video
- Weekly one-on-ones
- Transparent decision-making
- Clear documentation

### Trust Your Team

Focus on outcomes, not hours worked:
- Set clear expectations
- Measure results, not activity
- Give autonomy
- Celebrate achievements

### Create Connection

Build relationships intentionally:
- Virtual coffee chats
- Team building activities
- Recognition programs
- Informal channels

## Practical Strategies

### 1. Establish Routines
- Regular team meetings
- Consistent communication patterns
- Predictable availability

### 2. Use the Right Tools
- Video conferencing (Zoom, Teams)
- Project management (Asana, Jira)
- Async communication (Slack, Discord)
- Documentation (Notion, Confluence)

### 3. Set Boundaries
- Respect work-life balance
- Define core hours
- Encourage time off
- Model healthy behavior

## Common Pitfalls

❌ Micromanaging through surveillance tools
❌ Expecting instant responses
❌ Ignoring time zones
❌ Neglecting team culture

## Conclusion

Remote leadership is about trust, communication, and intentionality. Invest in your team's success and they'll deliver exceptional results.`,
        category: "Business",
        tags: ["Leadership", "Management", "Remote Work", "Team Building"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
    },
    {
        title: "UI/UX Design Principles for Modern Applications",
        content: `# Designing Exceptional User Experiences

Great design is invisible - it just works. Here's how to create interfaces users love.

## Fundamental Principles

### 1. Clarity Over Cleverness

Users should never wonder what to do next:
- Clear labels and instructions
- Obvious interactive elements
- Predictable navigation
- Consistent patterns

### 2. Visual Hierarchy

Guide users' attention through design:
- Size and scale
- Color and contrast
- Whitespace
- Typography

### 3. Feedback and Response

Every action needs a reaction:
- Loading states
- Success/error messages
- Hover effects
- Transition animations

## The Design Process

### Research
- User interviews
- Competitive analysis
- User personas
- Journey mapping

### Wireframing
- Low-fidelity sketches
- Information architecture
- User flows
- Rapid iteration

### Prototyping
- High-fidelity mockups
- Interactive prototypes
- Usability testing
- Refinement

## Modern Design Trends

### Minimalism
Less is more - remove unnecessary elements.

### Dark Mode
Reduce eye strain and save battery.

### Micro-interactions
Delight users with subtle animations.

### Accessibility First
Design for everyone, including users with disabilities.

## Tools of the Trade

- **Figma** - Collaborative design platform
- **Adobe XD** - Prototyping and wireframing
- **Sketch** - Vector design tool
- **InVision** - Prototyping and collaboration

## Accessibility Checklist

✅ Sufficient color contrast (WCAG AA)
✅ Keyboard navigation support
✅ Screen reader compatibility
✅ Alt text for images
✅ Responsive design
✅ Clear focus indicators

## Conclusion

Great UX design combines empathy, research, and iteration. Always design with your users in mind, test early and often, and never stop learning.`,
        category: "Design",
        tags: ["UI/UX", "Design", "User Experience", "Accessibility"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"
    },
    {
        title: "Data-Driven Marketing Strategies for 2024",
        content: `# Leveraging Data for Marketing Success

In today's digital landscape, data is the foundation of effective marketing strategies.

## The Data Revolution

Marketing has evolved from gut feelings to data-driven decisions:

- Real-time analytics
- Predictive modeling
- Personalization at scale
- ROI tracking

## Key Metrics to Track

### Acquisition Metrics
- **CAC** (Customer Acquisition Cost)
- **Traffic sources** and quality
- **Conversion rates** by channel
- **Click-through rates** (CTR)

### Engagement Metrics
- **Time on site**
- **Pages per session**
- **Bounce rate**
- **Social engagement**

### Retention Metrics
- **Customer Lifetime Value** (CLV)
- **Churn rate**
- **Repeat purchase rate**
- **Net Promoter Score** (NPS)

## Building a Data Strategy

### 1. Define Goals
What do you want to achieve?
- Brand awareness
- Lead generation
- Customer retention
- Revenue growth

### 2. Collect the Right Data
- Website analytics (Google Analytics)
- CRM data (Salesforce, HubSpot)
- Social media insights
- Email marketing metrics

### 3. Analyze and Interpret
- Identify patterns and trends
- Segment your audience
- A/B test everything
- Create data visualizations

### 4. Take Action
- Personalize messaging
- Optimize campaigns
- Allocate budget effectively
- Iterate based on results

## Advanced Techniques

### Predictive Analytics
Use machine learning to forecast:
- Customer behavior
- Churn risk
- Lifetime value
- Best next action

### Marketing Automation
Automate repetitive tasks:
- Email sequences
- Lead scoring
- Social media posting
- Report generation

### Attribution Modeling
Understand the customer journey:
- First-touch attribution
- Last-touch attribution
- Multi-touch attribution
- Data-driven attribution

## Privacy and Ethics

With great data comes great responsibility:
- Comply with GDPR, CCPA
- Be transparent about data collection
- Respect user privacy
- Secure customer data

## Conclusion

Data-driven marketing isn't optional anymore - it's essential. Start small, measure everything, and let data guide your decisions.`,
        category: "Marketing",
        tags: ["Marketing", "Analytics", "Data Science", "Digital Marketing"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    },
    {
        title: "Introduction to Machine Learning and AI",
        content: `# Understanding Machine Learning Fundamentals

Artificial Intelligence and Machine Learning are transforming every industry. Here's your introduction to this revolutionary field.

## What is Machine Learning?

Machine Learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.

### Types of Machine Learning

**Supervised Learning**
- Learn from labeled data
- Examples: Classification, Regression
- Use cases: Spam detection, Price prediction

**Unsupervised Learning**
- Find patterns in unlabeled data
- Examples: Clustering, Dimensionality reduction
- Use cases: Customer segmentation, Anomaly detection

**Reinforcement Learning**
- Learn through trial and error
- Examples: Game playing, Robotics
- Use cases: Self-driving cars, Recommendation systems

## Key Concepts

### Training Data
The foundation of any ML model - quality data is crucial.

### Features
The input variables used to make predictions.

### Model
The mathematical representation learned from data.

### Evaluation
Measuring how well your model performs.

## Popular Algorithms

### Linear Regression
Predict continuous values based on input features.

### Decision Trees
Make decisions through a tree-like structure.

### Neural Networks
Mimic the human brain to recognize complex patterns.

### Random Forests
Ensemble of decision trees for robust predictions.

## The ML Workflow

1. **Problem Definition** - What are you trying to solve?
2. **Data Collection** - Gather relevant data
3. **Data Preparation** - Clean and preprocess
4. **Model Selection** - Choose appropriate algorithm
5. **Training** - Fit model to data
6. **Evaluation** - Test performance
7. **Deployment** - Put model into production
8. **Monitoring** - Track performance over time

## Tools and Frameworks

### Python Libraries
- **scikit-learn** - Traditional ML algorithms
- **TensorFlow** - Deep learning framework
- **PyTorch** - Research-focused deep learning
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

### Cloud Platforms
- **AWS SageMaker**
- **Google Cloud AI**
- **Azure Machine Learning**

## Real-World Applications

🏥 **Healthcare** - Disease diagnosis, drug discovery
🏦 **Finance** - Fraud detection, algorithmic trading
🛒 **E-commerce** - Recommendation engines, price optimization
🚗 **Transportation** - Autonomous vehicles, route optimization
📱 **Technology** - Virtual assistants, image recognition

## Getting Started

1. Learn Python basics
2. Understand statistics and linear algebra
3. Take online courses (Coursera, fast.ai)
4. Practice with Kaggle competitions
5. Build projects and share them

## Ethical Considerations

- Bias in training data
- Privacy concerns
- Transparency and explainability
- Job displacement
- Responsible AI development

## Conclusion

Machine Learning is powerful but requires careful application. Start with fundamentals, practice consistently, and always consider the ethical implications of your work.`,
        category: "Artificial Intelligence",
        tags: ["AI", "Machine Learning", "Data Science", "Python"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"
    },
    {
        title: "Cybersecurity Best Practices for Developers",
        content: `# Securing Your Applications

Security isn't optional - it's essential. Every developer must understand and implement security best practices.

## The Security Mindset

Think like an attacker to defend like a pro:
- Assume breach
- Defense in depth
- Least privilege
- Fail securely

## Common Vulnerabilities

### 1. SQL Injection
**Problem:** Malicious SQL code in user input
**Solution:** Use parameterized queries

\`\`\`javascript
// ❌ Vulnerable
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// ✅ Secure
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

### 2. Cross-Site Scripting (XSS)
**Problem:** Malicious scripts in user content
**Solution:** Sanitize and escape user input

### 3. Cross-Site Request Forgery (CSRF)
**Problem:** Unauthorized actions on behalf of users
**Solution:** Use CSRF tokens

### 4. Insecure Authentication
**Problem:** Weak passwords, no MFA
**Solution:** Strong password policies, multi-factor authentication

### 5. Sensitive Data Exposure
**Problem:** Unencrypted data transmission
**Solution:** Use HTTPS, encrypt at rest

## Security Checklist

### Authentication & Authorization
✅ Implement strong password requirements
✅ Use bcrypt or Argon2 for password hashing
✅ Enable multi-factor authentication
✅ Implement proper session management
✅ Use OAuth 2.0 for third-party auth

### Data Protection
✅ Encrypt sensitive data at rest
✅ Use HTTPS for all communications
✅ Implement proper access controls
✅ Sanitize all user inputs
✅ Use environment variables for secrets

### API Security
✅ Implement rate limiting
✅ Use API keys and tokens
✅ Validate all inputs
✅ Return appropriate error messages
✅ Log security events

### Infrastructure
✅ Keep dependencies updated
✅ Use security headers
✅ Implement CORS properly
✅ Regular security audits
✅ Automated vulnerability scanning

## Security Tools

### Static Analysis
- **SonarQube** - Code quality and security
- **ESLint** - JavaScript linting
- **Bandit** - Python security linter

### Dependency Scanning
- **npm audit** - Node.js vulnerabilities
- **Snyk** - Dependency vulnerability scanning
- **Dependabot** - Automated dependency updates

### Penetration Testing
- **OWASP ZAP** - Web app security scanner
- **Burp Suite** - Security testing toolkit
- **Metasploit** - Penetration testing framework

## Incident Response

When a breach occurs:

1. **Contain** - Isolate affected systems
2. **Investigate** - Understand the scope
3. **Eradicate** - Remove the threat
4. **Recover** - Restore services
5. **Learn** - Post-mortem analysis

## Compliance and Regulations

Know your requirements:
- **GDPR** - EU data protection
- **CCPA** - California privacy law
- **HIPAA** - Healthcare data
- **PCI DSS** - Payment card data
- **SOC 2** - Security controls

## Security Culture

Security is everyone's responsibility:
- Regular training
- Security champions
- Code reviews
- Threat modeling
- Bug bounty programs

## Conclusion

Security is a journey, not a destination. Stay informed about new threats, update your defenses regularly, and make security a core part of your development process.`,
        category: "IT & Software",
        tags: ["Security", "Cybersecurity", "Development", "Best Practices"],
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"
    }
];

async function seedArticles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a trainer to be the author
        const trainer = await User.findOne({ role: 'trainer' });
        if (!trainer) {
            console.error('No trainer found! Please create a trainer user first.');
            process.exit(1);
        }

        console.log(`Using trainer: ${trainer.name} (${trainer.email})`);

        // Delete existing articles
        await Article.deleteMany({});
        console.log('Cleared existing articles');

        // Create articles with the trainer as author
        const articlesWithAuthor = articles.map(article => ({
            ...article,
            author: trainer._id
        }));

        const created = await Article.insertMany(articlesWithAuthor);
        console.log(`✅ Successfully created ${created.length} articles!`);

        created.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title} (${article.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding articles:', error);
        process.exit(1);
    }
}

seedArticles();
