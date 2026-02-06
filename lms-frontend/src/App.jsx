import { BrowserRouter, Routes, Route, Link, useNavigate, NavLink as RouterNavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminPage from "./pages/AdminPage";
import OrganizationSettings from "./pages/OrganizationSettings";
import ReportsPage from "./module9-reports/pages/ReportsPage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import axiosClient from "./api/axiosClient";
import CourseListPage from "./pages/CourseListPage";
import CourseCreatePage from "./pages/CourseCreatePage";
import CourseEnrollPage from "./pages/CourseEnrollPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import QuizTakingPage from "./pages/QuizTakingPage";
import QuizCreatePage from "./pages/QuizCreatePage";
import QuizResultsPage from "./pages/QuizResultsPage";

import CourseDetailsPage from "./pages/CourseDetailsPage";
import LearnerListPage from "./pages/LearnerListPage";
import CourseEditPage from "./pages/CourseEditPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import ArticleViewerPage from "./pages/ArticleViewerPage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import CertificatesPage from "./pages/CertificatesPage";
import CertificateViewPage from "./pages/CertificateViewPage";
import ResourcesPage from "./pages/ResourcesPage";
import NotificationBell from "./components/NotificationBell";

function AppShell() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { token: null, user: null };
  });
  const [org, setOrg] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!auth.token;
  const role = auth.user?.role;

  useEffect(() => {
    const fetchMe = async () => {
      if (!auth.token) return;
      try {
        const res = await axiosClient.get("/api/auth/me");
        setAuth((prev) => ({ ...prev, user: res.data }));
      } catch {
        localStorage.removeItem("auth");
        setAuth({ token: null, user: null });
      }
    };
    fetchMe();
  }, [auth.token]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await axiosClient.get("/api/organization/current");
        setOrg(res.data);
        if (res.data?.primaryColor) {
          document.documentElement.style.setProperty(
            "--primary-color",
            res.data.primaryColor
          );

          // Helper to convert hex to rgb for tailwind opacity support
          const hex = res.data.primaryColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          document.documentElement.style.setProperty("--primary-color-rgb", `${r}, ${g}, ${b}`);

          // Set glow to a transparent version of primary color (22% opacity)
          document.documentElement.style.setProperty(
            "--primary-glow",
            `rgba(${r}, ${g}, ${b}, 0.22)`
          );
        }
      } catch {
        setOrg(null);
      }
    };
    fetchOrg();
  }, []);

  const handleLoginSuccess = (data) => {
    const authData = { token: data.token, user: data.user };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth({ token: null, user: null });
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-gray-100">
      {/* Background container for the whole app */}
      <div className="lms-bg-animated"></div>
      <div className="lms-bg-image"></div>
      <div className="lms-bg-overlay"></div>

      {/* Top nav */}
      {/* Top nav - Premium Glassmorphism Redesign with improved contrast */}
      <header className="sticky top-0 z-[100] w-full bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group transition-all duration-300">
            <div className="relative">
              {org?.logoUrl ? (
                <div className="h-12 w-12 rounded-2xl overflow-hidden border border-brand/30 group-hover:border-brand/60 transition-colors bg-black/40 p-0.5">
                  <img
                    src={org.logoUrl}
                    alt="Org logo"
                    className="h-full w-full rounded-[14px] object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand font-bold text-xl">
                  A
                </div>
              )}
              <div className="absolute -inset-1 bg-brand/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:lms-text-brand transition-colors">
                {org?.name || "Aurora LMS"}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                {org?.learningPolicy ? "Organization Dashboard" : "Learning Management"}
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {!isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="lms-btn-primary px-8 py-2.5">
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="hidden lg:flex items-center gap-1.5 mr-4 bg-slate-900/40 p-1.5 rounded-full border border-white/5 shadow-inner">
                  <CustomNavLink to="/dashboard" label="Dashboard" />
                  {(role === "admin" || role === "super_admin") && (
                    <>
                      <CustomNavLink to="/admin" label="Users" />
                      <CustomNavLink to="/organization" label="Settings" />
                    </>
                  )}
                  {(role === "admin" || role === "super_admin" || role === "trainer") && (
                    <>
                      <CustomNavLink to="/reports" label="Reports" />
                      <CustomNavLink to="/learners" label="Learners" />
                    </>
                  )}
                  {/* Module 4 & 5 Navigation */}
                  {(role === "admin" || role === "super_admin" || role === "trainer" || role === "learner") && (
                    <>
                      <CustomNavLink to="/courses" label="Courses" />
                      <CustomNavLink to="/knowledge" label="Knowledge" />
                      <CustomNavLink to="/resources" label="Library" />
                    </>
                  )}
                  {role === "learner" && (
                    <>
                      <CustomNavLink to="/my-courses" label="My Learning" />
                      <CustomNavLink to="/my-certificates" label="Certificates" />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <NotificationBell />
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {auth.user?.name}
                    </span>
                    <span className="text-[10px] text-brand font-semibold">
                      {auth.user?.role?.replace("_", " ")}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="lms-btn-secondary !px-4 !py-2 !rounded-full text-xs"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      </header >

      {/* Main content */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <div className="p-4 md:p-8">
                <Dashboard auth={auth} />
              </div>
            }
          />
          {/* Module 5 Routes */}
          <Route
            path="/courses/create"
            element={
              <div className="p-4 md:p-8">
                <CourseCreatePage />
              </div>
            }
          />
          <Route
            path="/courses"
            element={
              <div className="p-4 md:p-8">
                <CourseListPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/courses/:courseId/edit"
            element={
              <div className="p-4 md:p-8">
                <CourseEditPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/courses/:courseId/enroll"
            element={
              <div className="p-4 md:p-8">
                <CourseEnrollPage />
              </div>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <div className="p-4 md:p-8">
                <CourseDetailsPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/my-courses"
            element={
              <div className="p-4 md:p-8">
                <MyCoursesPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/learners"
            element={
              <div className="p-4 md:p-8">
                <LearnerListPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <div className="h-screen">
                <CoursePlayerPage />
              </div>
            }
          />
          <Route
            path="/courses/:courseId/quiz/create"
            element={
              <div className="h-screen">
                <QuizCreatePage />
              </div>
            }
          />
          <Route
            path="/courses/:courseId/quiz"
            element={
              <div className="h-screen">
                <QuizTakingPage />
              </div>
            }
          />
          <Route
            path="/courses/:courseId/quiz/results/:resultId"
            element={
              <div className="h-screen">
                <QuizResultsPage />
              </div>
            }
          />


          <Route
            path="/login"
            element={
              <div className="p-4 md:p-8">
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </div>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <div className="p-4 md:p-8">
                <ForgotPasswordPage />
              </div>
            }
          />
          <Route
            path="/admin"
            element={
              <div className="p-4 md:p-8">
                <AdminPage auth={auth} />
              </div>
            }
          />
          <Route
            path="/organization"
            element={
              <div className="p-4 md:p-8">
                <OrganizationSettings auth={auth} />
              </div>
            }
          />
          <Route
            path="/reports"
            element={
              <div className="p-4 md:p-8">
                <ReportsPage auth={auth} />
              </div>
            }
          />
          {/* Module 4: Knowledge Base Routes */}
          <Route
            path="/knowledge"
            element={
              <div className="p-4 md:p-8">
                <KnowledgeBasePage auth={auth} />
              </div>
            }
          />
          <Route
            path="/knowledge/create"
            element={
              <div className="p-4 md:p-8">
                <ArticleEditorPage />
              </div>
            }
          />
          <Route
            path="/knowledge/:id/edit"
            element={
              <div className="p-4 md:p-8">
                <ArticleEditorPage />
              </div>
            }
          />
          <Route
            path="/knowledge/:id"
            element={
              <div className="p-4 md:p-8">
                <ArticleViewerPage auth={auth} />
              </div>
            }
          />
          {/* Module 7: Certificates */}
          <Route
            path="/my-certificates"
            element={
              <div className="p-4 md:p-8">
                <CertificatesPage />
              </div>
            }
          />
          <Route
            path="/certificates/:id"
            element={
              <CertificateViewPage />
            }
          />
          <Route
            path="*"
            element={
              isLoggedIn ? (
                <div className="p-4 md:p-8">
                  <Dashboard auth={auth} />
                </div>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/resources"
            element={
              <div className="p-4 md:p-8">
                <ResourcesPage />
              </div>
            }
          />
        </Routes>
      </main >
    </div >
  );
}


// Helper Component for Nav Links
function CustomNavLink({ to, label }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive
          ? "bg-brand text-black shadow-lg shadow-brand/40 scale-105"
          : "text-slate-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {label}
    </RouterNavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
