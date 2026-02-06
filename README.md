# LMS Premium Analytics & Dashboard

A professional, full-stack Learning Management System (LMS) enhanced with advanced analytics, role-based personalization, and a premium Glassmorphism-inspired UI.

## 🚀 Features

- **Advanced Analytics Suite**: 
  - **Enrollment Intel**: Dynamic bar charts visualizing course popularity.
  - **Learner Mastery Distribution**: Stage-based proficiency analysis (Initiating to Mastered).
  - **Ecosystem Growth**: Line charts tracking enrollment trends vs. completions.
- **Role-Based Experience**: Personalized dashboards for Admins, Trainers, and Learners with dynamic greetings, health widgets, and power actions.
- **Premium UI**: State-of-the-art design system using HSL tokens, glassmorphism, and responsive layouts.
- **Automated Notifications**: Real-time email alerts for security and operational events.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Chart.js, Tailwind CSS, Axios.
- **Backend**: Node.js, Express, JWT, Bcrypt, Nodemailer.
- **Database**: MongoDB (Mongoose).

## 📦 Deployment Ready

The project is structured for seamless cloud deployment:
- **Backend**: Pre-configured with `render.yaml` for Render.
- **Frontend**: Optimized for Vercel/Netlify with environmentalized API bindings.
- **Security**: fully dynamic CORS and environment variable architecture.

## 🚦 Getting Started (Local)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hariavathan/LMS-APP.git
   cd LMS-APP
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create .env with MONGO_URI, JWT_SECRET, etc.
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../lms-frontend
   npm install
   npm run dev
   ```

## 📄 License

Internal Project / ISC License.
