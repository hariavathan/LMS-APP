import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import MotivationalWidget from "../components/MotivationalWidget";
import ProfessionalAnalyticsCharts from "../components/ProfessionalAnalyticsCharts";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- PROFESSIONAL DESIGN SYSTEM COMPONENTS ---

const DashboardStatCard = ({ title, value, icon, trend, trendValue, color = "brand", delay = 0 }) => {
    const colorMap = {
        brand: "from-brand/20 to-brand/5 border-brand/20 text-brand",
        emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-500",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500",
        rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-500",
        amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-500",
    };

    return (
        <div className={`lms-card p-6 bg-gradient-to-br ${colorMap[color]} group hover:scale-[1.02] transition-all duration-500`} style={{ animationDelay: `${delay}ms` }}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:rotate-12 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
                <div className="text-3xl font-black text-white font-outfit tracking-tight">{value}</div>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-current transition-all duration-1000 w-[70%] opacity-30`} />
            </div>
        </div>
    );
};

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-black text-white font-outfit">{title}</h2>
            <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
        </div>
        {action && (
            <div className="flex-shrink-0">{action}</div>
        )}
    </div>
);

const DashboardHero = ({ user, role, data }) => {
    const renderGreeting = () => {
        if (role === 'learner') {
            return (
                <p className="text-slate-400 max-w-lg leading-relaxed font-medium">
                    You have <span className="text-white font-bold">{data?.stats?.totalEnrolled || 0} ongoing courses</span> and <span className="text-white font-bold">{data?.stats?.completed || 0} milestones</span> secured. Let's keep the momentum going.
                </p>
            );
        }
        if (role === 'trainer') {
            return (
                <p className="text-slate-400 max-w-lg leading-relaxed font-medium">
                    Mentoring <span className="text-white font-bold">{data?.totalLearners || 0} active learners</span>. <span className="text-white font-bold">{data?.pendingFeedback || 0} inquiries</span> pending for your attention.
                </p>
            );
        }
        if (role === 'admin' || role === 'super_admin') {
            return (
                <p className="text-slate-400 max-w-lg leading-relaxed font-medium">
                    {role === 'super_admin' ? 'Global sentinel status: ' : 'System oversight active. '}
                    {role === 'super_admin' && <span className="text-emerald-400 font-bold uppercase tracking-wider">{data?.systemOverview?.serverHealth || "Optimal"}</span>}
                    {role === 'super_admin' ? '. Monitoring ' : 'Managing '}
                    <span className="text-white font-bold">{role === 'super_admin' ? data?.totalEnrollments : data?.totalCourses || 0}</span> {role === 'super_admin' ? 'total deployments' : 'catalog units'}.
                </p>
            );
        }
        return null;
    };

    const renderWidgets = () => {
        if (role === 'learner') {
            return (
                <>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">XP Points</div>
                        <div className="text-2xl font-black text-white font-outfit">14,280</div>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rank</div>
                        <div className="text-2xl font-black text-white font-outfit">Top 1%</div>
                    </div>
                </>
            );
        }
        if (role === 'trainer') {
            return (
                <>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Avg. Rating</div>
                        <div className="text-2xl font-black text-white font-outfit">4.8★</div>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Courses</div>
                        <div className="text-2xl font-black text-white font-outfit">{data?.totalCourses || 0}</div>
                    </div>
                </>
            );
        }
        if (role === 'admin') {
            return (
                <>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Security</div>
                        <div className="text-2xl font-black text-emerald-500 font-outfit">MAX</div>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Sessions</div>
                        <div className="text-2xl font-black text-white font-outfit">Active</div>
                    </div>
                </>
            );
        }
        if (role === 'super_admin') {
            return (
                <>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Uptime</div>
                        <div className="text-2xl font-black text-emerald-500 font-outfit">{data?.systemOverview?.uptime || "99.9%"}</div>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">DB Latency</div>
                        <div className="text-2xl font-black text-white font-outfit">{data?.systemOverview?.dbPerformance || "12ms"}</div>
                    </div>
                </>
            );
        }
        return null;
    };

    const renderAction = () => {
        let text = "Resume Learning Path";
        let link = "/courses";

        if (role === 'trainer') {
            text = "Forge New Content";
            link = "/courses";
        } else if (role === 'admin' || role === 'super_admin') {
            text = role === 'super_admin' ? "Org Logistics Base" : "User Command Center";
            link = "/reports";
        }

        return (
            <Link to={link} className="col-span-2 lms-btn py-4 shadow-2xl shadow-brand/20 text-center flex items-center justify-center">
                {text}
            </Link>
        );
    };

    return (
        <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] bg-slate-900 border border-white/5 overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[80px] -ml-32 -mb-32 rounded-full"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                        </span>
                        System Online • Local Time {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white font-outfit leading-none tracking-tighter">
                        Welcome back, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-white to-blue-400">
                            {user?.name || "Achiever"}
                        </span>
                    </h1>
                    {renderGreeting()}
                </div>

                <div className="flex-shrink-0 grid grid-cols-2 gap-3">
                    {renderWidgets()}
                    {renderAction()}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ auth }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollForm, setEnrollForm] = useState({ userId: "", courseId: "" });
    const [enrolling, setEnrolling] = useState(null); // Changed to null to track courseId
    const role = auth?.user?.role;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                if (role === "learner") {
                    const [summaryRes, allCoursesRes] = await Promise.all([
                        axiosClient.get("/api/reports/learner-summary"),
                        axiosClient.get("/api/courses")
                    ]);
                    setData(summaryRes.data);
                    setCourses(allCoursesRes.data);
                } else if (role === "super_admin") {
                    const [summaryRes, trendsRes] = await Promise.all([
                        axiosClient.get("/api/reports/summary"),
                        axiosClient.get("/api/reports/organization-trends")
                    ]);
                    setData({ ...summaryRes.data, trends: trendsRes.data });
                } else {
                    const res = await axiosClient.get("/api/reports/summary");
                    setData(res.data);
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        if (auth?.token) fetchDashboardData();
    }, [auth, role]);

    const fetchEnrollmentData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                axiosClient.get("/api/users"),
                axiosClient.get("/api/courses")
            ]);
            setUsers(usersRes.data.filter(u => u.role === 'learner'));
            setCourses(coursesRes.data);
            setShowEnrollModal(true);
        } catch (err) {
            alert("Failed to load users or courses");
        }
    };

    const handleQuickEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            await axiosClient.post("/api/enrollments", {
                userId: auth.user.id || auth.user._id,
                courseId
            });
            alert("Enrolled successfully!");
            // Refresh dashboard data
            const [summaryRes, allCoursesRes] = await Promise.all([
                axiosClient.get("/api/reports/learner-summary"),
                axiosClient.get("/api/courses")
            ]);
            setData(summaryRes.data);
            setCourses(allCoursesRes.data);
        } finally {
            setEnrolling(null);
        }
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        setEnrolling(true);
        try {
            await axiosClient.post("/api/enrollments", enrollForm);
            alert("Learner enrolled successfully!");
            setShowEnrollModal(false);
            setEnrollForm({ userId: "", courseId: "" });
            // Refresh data
            const res = await axiosClient.get("/api/reports/summary");
            setData(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 lms-border-brand border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const renderAdminTrainerDashboard = () => (
        <div className="space-y-12 pb-20">
            <DashboardHero user={auth.user} role={role} data={data} />

            <SectionHeader
                title={`${role === "super_admin" ? "Org." : role === "admin" ? "Admin" : "Trainer"} Pulse`}
                subtitle="Real-time performance and engagement metrics"
                action={
                    <div className="flex gap-3">
                        <Link to="/reports" className="lms-btn-secondary px-6 py-3">Analytics Report</Link>
                        {role !== "trainer" && (
                            <button onClick={fetchEnrollmentData} className="lms-btn-primary px-6 py-3 shadow-xl shadow-brand/20">
                                ⚡ Bulk Enrollment
                            </button>
                        )}
                    </div>
                }
            />

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard
                    title="Domain Intelligence"
                    value={data?.totalCourses ?? 0}
                    icon="📚"
                    trend="up"
                    trendValue={12}
                    color="brand"
                    delay={100}
                />
                <DashboardStatCard
                    title="Active Cohorts"
                    value={data?.totalLearners ?? 0}
                    icon="👥"
                    trend="up"
                    trendValue={5}
                    color="blue"
                    delay={200}
                />
                <DashboardStatCard
                    title="Mastery Index"
                    value={`${data?.overallCompletionRate ?? 0}%`}
                    icon="🎯"
                    trend="up"
                    trendValue={3}
                    color="emerald"
                    delay={300}
                />
                <DashboardStatCard
                    title="Retention Rate"
                    value={`${data?.avgProgress ?? 0}%`}
                    icon="🚀"
                    trend="down"
                    trendValue={1}
                    color="rose"
                    delay={400}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Analytics & Logs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Growth Chart */}
                    <div className="lms-card p-8 bg-slate-900/50 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] -mr-32 -mt-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Ecosystem Growth</h3>
                                <p className="text-xs text-slate-500 font-medium">Trajectory of enrollments vs completions</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-brand shadow-[0_0_8px_var(--primary-color)]"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completions</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <Line
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleFont: { family: 'Outfit', size: 14 }, bodyFont: { family: 'Inter' }, padding: 12, cornerRadius: 12 } },
                                    scales: {
                                        y: { grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false }, ticks: { color: '#475569', font: { size: 10, weight: '700' } } },
                                        x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10, weight: '700' } } }
                                    }
                                }}
                                data={data?.trends || {
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                    datasets: [
                                        { label: 'Completions', data: [20, 35, 28, 45, 60, 52], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
                                        { label: 'Enrollments', data: [45, 52, 60, 48, 75, 88], borderColor: '#F5A623', backgroundColor: 'rgba(245, 166, 35, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    {/* Secondary Analytics - Stacked Full Width */}
                    {data?.courseStats?.length > 0 && (
                        <div className="lms-card p-8 bg-slate-900/50 border-white/5 relative overflow-hidden group">
                            <CourseEnrollmentChart stats={data.courseStats} />
                        </div>
                    )}
                    {data?.learnerMastery && (
                        <div className="lms-card p-8 bg-slate-900/50 border-white/5 relative overflow-hidden group">
                            <LearnerMasteryChart masteryData={data.learnerMastery} />
                        </div>
                    )}

                    {/* Activity Feed */}
                    <div className="lms-card p-0 bg-slate-900/30 border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tight">Operational Log</h3>
                            <button className="text-[10px] font-black text-brand uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">Stream Live</button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {(data?.recentEnrollments?.length > 0 ? data.recentEnrollments : [1, 2, 3, 4, 5]).map((enr, i) => (
                                <div key={enr.id || i} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner border
                                            ${i % 2 === 0 ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                            {enr.userInitials || "JS"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-brand transition-colors">
                                                {enr.userName || `Learner ${i}`} <span className="text-slate-500 font-medium">initiated</span> {enr.courseTitle || "Neural Networks 101"}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                                                {enr.time ? new Date(enr.time).toLocaleTimeString() : `${i + 1}h ago`} • GLOBAL NODE 0{i + 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:block w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand opacity-40" style={{ width: `${enr.progress || 20}%` }}></div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                            ${enr.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                            {enr.status || "In Transit"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Intelligence */}
                <div className="space-y-8">
                    {/* Super Admin Health Monitor */}
                    {role === "super_admin" && (
                        <div className="lms-card p-6 bg-slate-900 border-emerald-500/20 shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Integrity</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Server Uptime</span>
                                    <span className="text-lg font-black text-emerald-500 font-outfit">99.98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '99%' }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Response</div>
                                        <div className="text-sm font-bold text-white tracking-tighter">12ms <span className="text-[10px] text-emerald-500">AVG</span></div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Load</div>
                                        <div className="text-sm font-bold text-white tracking-tighter">2.4% <span className="text-[10px] text-blue-500">IDLE</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Center */}
                    <div className="lms-card p-6 bg-slate-900/40 border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tight">Power Actions</h3>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">⚡</div>
                        </div>
                        <div className="grid gap-3">
                            <Link to="/courses/create" className="flex items-center gap-4 p-4 rounded-2xl bg-brand/5 hover:bg-brand/10 border border-brand/10 transition-all group">
                                <span className="text-2xl group-hover:scale-125 transition-transform duration-500">🏗️</span>
                                <div>
                                    <div className="text-sm font-black text-brand uppercase tracking-tight">Forge Content</div>
                                    <div className="text-[10px] text-slate-500 font-bold">Initialize new syllabus modules</div>
                                </div>
                            </Link>
                            {role !== 'trainer' && (
                                <Link to="/admin" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-all group">
                                    <span className="text-2xl group-hover:rotate-12 transition-transform duration-500">🛡️</span>
                                    <div>
                                        <div className="text-sm font-black text-blue-400 uppercase tracking-tight">User Sentinel</div>
                                        <div className="text-[10px] text-slate-500 font-bold">Manage credentials and RBAC</div>
                                    </div>
                                </Link>
                            )}
                            <Link to="/reports" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all group">
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-500">📉</span>
                                <div>
                                    <div className="text-sm font-black text-emerald-400 uppercase tracking-tight">Deep Intelligence</div>
                                    <div className="text-[10px] text-slate-500 font-bold">Export organizational datasets</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Trainer Specific Intelligence */}
                    {role === "trainer" && (
                        <div className="lms-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Urgent Attention</h3>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl animate-bounce">💬</div>
                                <div>
                                    <div className="text-lg font-black text-white font-outfit leading-none">{data?.pendingFeedback || 12}</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Pending Inquiries</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderLearnerDashboard = () => (
        <div className="space-y-12 pb-20">
            <DashboardHero user={auth.user} role={role} data={data} />

            <SectionHeader
                title="Learning Trajectory"
                subtitle="Daily progress and skill acquisition"
                action={<Link to="/courses" className="lms-btn-primary px-6 py-3 shadow-xl shadow-brand/20 text-[10px] font-black uppercase tracking-widest">Resume Mission</Link>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardStatCard
                    title="Knowledge Units"
                    value={data?.stats?.totalEnrolled || 0}
                    icon="🎓"
                    trend="up"
                    trendValue={8}
                    color="brand"
                    delay={100}
                />
                <DashboardStatCard
                    title="Milestones Secured"
                    value={data?.stats?.completed || 0}
                    icon="🏆"
                    trend="up"
                    trendValue={14}
                    color="emerald"
                    delay={200}
                />
                <DashboardStatCard
                    title="Skill Velocity"
                    value={`${data?.stats?.avgProgress || 0}%`}
                    icon="⚡"
                    trend="up"
                    trendValue={2}
                    color="amber"
                    delay={300}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Discovery Hub */}
                    <div className="lms-card p-8 bg-slate-900/50 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] -mr-32 -mt-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Discovery Hub</h3>
                                <p className="text-xs text-slate-500 font-medium">Personalized recommendations for your career path</p>
                            </div>
                            <Link to="/courses" className="text-[10px] font-black text-brand uppercase tracking-widest hover:translate-x-1 transition-transform">Explore All →</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.filter(c => !data?.enrollments?.some(e => (e.courseId?._id || e.courseId) === c._id)).slice(0, 4).map((course) => (
                                <div key={course._id} className="group/item flex flex-col p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-brand/30 transition-all">
                                    <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                                        <img src={course.thumbnail || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800"} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2 py-0.5 rounded-lg bg-brand text-[8px] font-black text-black uppercase tracking-widest leading-relaxed">{course.category || "General"}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2 line-clamp-1 group-hover/item:text-brand transition-colors">{course.title}</h4>
                                    <button
                                        onClick={() => handleQuickEnroll(course._id)}
                                        disabled={enrolling === course._id}
                                        className="mt-auto w-full py-3 rounded-xl bg-white/5 hover:bg-brand text-[10px] font-black text-slate-300 hover:text-black uppercase tracking-widest transition-all border border-white/10 hover:border-brand"
                                    >
                                        {enrolling === course._id ? "..." : "Initiate Protocol"}
                                    </button>
                                </div>
                            ))}
                            {courses.filter(c => !data?.enrollments?.some(e => (e.courseId?._id || e.courseId) === c._id)).length === 0 && (
                                <div className="col-span-2 p-12 text-center rounded-[2rem] bg-white/5 border border-dashed border-white/10">
                                    <div className="text-4xl mb-4">🌟</div>
                                    <h4 className="text-white font-bold mb-1">Elite Status Achieved</h4>
                                    <p className="text-xs text-slate-500 italic">You've unlocked all current knowledge modules. Check back soon for new deployments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <MotivationalWidget />

                    {/* Active Learning Path */}
                    <div className="lms-card p-6 bg-slate-900 border-white/5 shadow-2xl shadow-brand/5">
                        <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tight mb-6 flex items-center gap-2">
                            <span className="text-brand">◈</span> Your Path
                        </h3>
                        <div className="space-y-6">
                            {data?.enrollments?.slice(0, 3).map((enr) => (
                                <div key={enr._id} className="relative pl-6 border-l border-white/10 group">
                                    <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-slate-950 transition-all duration-500
                                        ${enr.status === 'completed' ? 'bg-emerald-500' : 'bg-brand shadow-[0_0_10px_var(--primary-color)]'}`}></div>
                                    <div className="mb-2">
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                                            {enr.status === 'completed' ? 'Objective Secured' : 'Deployment Active'}
                                        </div>
                                        <Link to={`/courses/${enr.courseId?._id || enr.courseId}/player`} className="text-sm font-bold text-white group-hover:text-brand transition-colors line-clamp-1">
                                            {enr.courseId?.title || "Classified Unit"}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-current opacity-40 transition-all duration-1000" style={{ width: `${enr.progress}%`, color: enr.status === 'completed' ? '#10b981' : 'var(--primary-color)' }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">{enr.progress}%</span>
                                    </div>
                                </div>
                            ))}
                            {(!data?.enrollments || data.enrollments.length === 0) && (
                                <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Active Missions</p>
                                </div>
                            )}
                        </div>
                        <Link to="/my-courses" className="mt-8 w-full block py-4 text-center rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all">
                            View Logistics Database
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {role === "learner" ? renderLearnerDashboard() : renderAdminTrainerDashboard()}

            {/* Manual Enrollment Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="lms-card p-8 w-full max-w-md space-y-6 shadow-2xl border-brand/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white font-outfit">Manual Enrollment</h2>
                            <p className="text-slate-400 text-sm">Assign a learner to a specific course.</p>
                        </div>

                        <form onSubmit={handleManualEnroll} className="space-y-4">
                            <div>
                                <label className="lms-label">Select Learner</label>
                                <select
                                    className="lms-input"
                                    value={enrollForm.userId}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, userId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose User --</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="lms-label">Select Course</label>
                                <select
                                    className="lms-input"
                                    value={enrollForm.courseId}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollModal(false)}
                                    className="lms-btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={enrolling}
                                    className="lms-btn-primary flex-1"
                                >
                                    {enrolling ? "Enrolling..." : "Confirm Enrollment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}





function LearnerMasteryChart({ masteryData }) {
    if (!masteryData) return null;

    const labels = Object.keys(masteryData);
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Learners',
                data: Object.values(masteryData),
                backgroundColor: [
                    'rgba(245, 166, 35, 0.6)',  // Initiating (Amber)
                    'rgba(59, 130, 246, 0.6)',  // Intermediate (Blue)
                    'rgba(99, 102, 241, 0.6)',  // Advanced (Indigo)
                    'rgba(16, 185, 129, 0.6)',  // Near Mastery (Emerald)
                    'rgba(var(--primary-color-rgb), 0.8)', // Mastered (Brand)
                ],
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1.5,
                borderRadius: 20,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Outfit', size: 14 },
                bodyFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 12
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
                grid: { display: false },
                ticks: { color: '#fff', font: { size: 11, weight: 'bold' } }
            }
        }
    };

    return (
        <div className="w-full h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Learner Mastery Analytics</h3>
                    <p className="text-xs text-slate-500 font-medium">Stage-based proficiency analysis of the active user base</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-brand uppercase tracking-widest">
                    Live Data
                </div>
            </div>
            <div className="h-[380px] w-full">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}

function CourseEnrollmentChart({ stats }) {
    const chartData = {
        labels: stats.map(s => s.title),
        datasets: [
            {
                label: 'Total Enrollments',
                data: stats.map(s => s.enrollmentCount),
                backgroundColor: 'rgba(var(--primary-color-rgb), 0.6)',
                borderColor: 'var(--primary-color)',
                borderWidth: 2,
                borderRadius: 20,
                hoverBackgroundColor: 'var(--primary-color)',
                hoverBorderColor: '#fff',
                hoverBorderWidth: 2,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 12,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => ` ${context.parsed.y} Learners Enrolled`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    stepSize: 1
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10, weight: 'bold' },
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 20 ? label.substr(0, 17) + '...' : label;
                    }
                }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        }
    };

    return (
        <div className="w-full h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Enrollment Intel</h3>
                    <p className="text-xs text-slate-500 font-medium">Visualizing market penetration across catalog units</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full lms-bg-brand shadow-[0_0_12px_rgba(var(--primary-color-rgb),0.6)]"></div>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Enrollments</span>
                    </div>
                </div>
            </div>
            <div className="h-[380px] w-full">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
