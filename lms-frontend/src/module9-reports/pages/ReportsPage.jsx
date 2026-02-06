// module9-reports/pages/ReportsPage.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import LearningProgress from "../components/LearningProgress";
import CourseCompletion from "../components/CourseCompletion";
import UserPerformance from "../components/UserPerformance";

export default function ReportsPage({ auth }) {
    const [activeTab, setActiveTab] = useState("progress");
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState("");
    const [drilldown, setDrilldown] = useState(null);

    const role = auth?.user?.role;
    const isAdminOrSuper = role === "admin" || role === "super_admin";
    const isTrainer = role === "trainer";
    const canView = isAdminOrSuper || isTrainer;

    useEffect(() => {
        const fetchSummary = async () => {
            if (!auth?.token || !canView) return;
            try {
                const res = await axiosClient.get("/api/reports/summary");
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to fetch summary:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [auth, canView]);

    const handleSeedData = async () => {
        if (!confirm("This will reset all courses and enrollments with demo data. Continue?")) return;
        setSeeding(true);
        setSeedMessage("");
        try {
            const res = await axiosClient.post("/api/reports/seed");
            setSeedMessage(`✓ ${res.data.message}: ${res.data.coursesCreated} courses, ${res.data.enrollmentsCreated} enrollments`);
            // Refresh summary
            const summaryRes = await axiosClient.get("/api/reports/summary");
            setSummary(summaryRes.data);
        } catch (err) {
            setSeedMessage("✗ Failed to seed data: " + (err.response?.data?.message || err.message));
        } finally {
            setSeeding(false);
        }
    };

    if (!auth?.token) {
        return <div className="text-center mt-10">Please login to view reports.</div>;
    }

    if (!canView) {
        return (
            <div className="text-center mt-10">
                You do not have permission to view reports.
            </div>
        );
    }

    const tabs = [
        { id: "progress", label: "Learning Progress", icon: "📊" },
        { id: "completion", label: "Course Completion", icon: "✅" },
        { id: "performance", label: "User Performance", icon: "👤" }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lms-card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold lms-text-brand flex items-center gap-2">
                            📈 Reports & Analytics
                        </h1>
                        <p className="text-sm text-slate-300 mt-1">
                            {isAdminOrSuper
                                ? "Organization-wide learning analytics and performance metrics"
                                : "Course-level analytics for your assigned courses"}
                        </p>
                    </div>

                    {role === "super_admin" && (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={handleSeedData}
                                disabled={seeding}
                                className="lms-btn-secondary px-4 py-2 text-xs"
                            >
                                {seeding ? "Seeding..." : "🌱 Seed Demo Data"}
                            </button>
                            {seedMessage && (
                                <span className={`text-xs ${seedMessage.startsWith("✓") ? "text-emerald-300" : "text-red-300"}`}>
                                    {seedMessage}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {!loading && summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
                        <StatCard
                            label="Courses"
                            value={summary.totalCourses ?? 0}
                            color="brand"
                            onClick={() => setDrilldown({ type: "courses", title: "Course Catalog Detail" })}
                        />
                        <StatCard
                            label="Learners"
                            value={summary.totalLearners ?? 0}
                            color="sky"
                            onClick={() => setDrilldown({ type: "learners", title: "Active Learner Base" })}
                        />
                        <StatCard
                            label="Enrollments"
                            value={summary.totalEnrollments ?? 0}
                            color="purple"
                            onClick={() => setDrilldown({ type: "enrollments", title: "Recent Enrollment Activity" })}
                        />
                        <StatCard
                            label="Completed"
                            value={summary.completedEnrollments ?? 0}
                            color="emerald"
                            onClick={() => setDrilldown({ type: "completed", title: "Course Completions" })}
                        />
                        <StatCard
                            label="In Progress"
                            value={summary.inProgressEnrollments ?? 0}
                            color="brand"
                            onClick={() => setDrilldown({ type: "progress", title: "Active Learning Sessions" })}
                        />
                        <StatCard
                            label="Avg Progress"
                            value={`${summary.avgProgress ?? 0}%`}
                            color="cyan"
                            onClick={() => setDrilldown({ type: "avg_progress", title: "Detailed Progress Metrics" })}
                        />
                        <StatCard
                            label="Completion Rate"
                            value={`${summary.overallCompletionRate ?? 0}%`}
                            color="emerald"
                            onClick={() => setDrilldown({ type: "rate", title: "Success Rate Analysis" })}
                        />
                    </div>
                )}
            </div>

            {/* Drilldown Modal */}
            {drilldown && (
                <DrilldownModal
                    data={drilldown}
                    onClose={() => setDrilldown(null)}
                    auth={auth}
                />
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                            ? "text-black shadow-lg"
                            : "bg-slate-900/60 lms-text-brand border border-white/10 hover:bg-white/5"
                            }`}
                        style={activeTab === tab.id ? { backgroundColor: 'var(--primary-color)' } : {}}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="lms-card p-6">
                {activeTab === "progress" && <LearningProgress auth={auth} />}
                {activeTab === "completion" && <CourseCompletion auth={auth} />}
                {activeTab === "performance" && <UserPerformance auth={auth} />}
            </div>
        </div>
    );
}

function StatCard({ label, value, color, onClick }) {
    const colorClasses = {
        brand: "from-brand/20 to-brand/10 border-brand/40 lms-text-brand hover:border-brand/60 cursor-pointer transition-all hover:scale-[1.02]",
        sky: "from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-300 hover:border-sky-500/60 cursor-pointer transition-all hover:scale-[1.02]",
        purple: "from-purple-500/20 to-violet-500/10 border-purple-500/40 text-purple-300 hover:border-purple-500/60 cursor-pointer transition-all hover:scale-[1.02]",
        emerald: "from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-300 hover:border-emerald-500/60 cursor-pointer transition-all hover:scale-[1.02]",
        cyan: "from-cyan-500/20 to-teal-500/10 border-cyan-500/40 text-cyan-300 hover:border-cyan-500/60 cursor-pointer transition-all hover:scale-[1.02]",
    };

    return (
        <div
            onClick={onClick}
            className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.brand} border rounded-xl p-3 text-center`}
            style={color === 'brand' ? { borderColor: 'color-mix(in srgb, var(--primary-color), transparent 60%)', backgroundImage: 'linear-gradient(to bottom right, color-mix(in srgb, var(--primary-color), transparent 80%), color-mix(in srgb, var(--primary-color), transparent 90%))' } : {}}
        >
            <div className="text-xl font-bold">{value}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wide">{label}</div>
        </div>
    );
}

function DrilldownModal({ data, onClose, auth }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let endpoint = "";
                if (data.type === "courses") endpoint = "/api/reports/courses";
                else if (data.type === "learners") endpoint = "/api/reports/user-performance";
                else endpoint = "/api/reports/learning-progress";

                const res = await axiosClient.get(endpoint);

                // Filter logic based on type
                let filtered = res.data;
                if (data.type === "completed") {
                    filtered = res.data.filter(e => e.status === "completed");
                } else if (data.type === "progress") {
                    filtered = res.data.filter(e => e.status === "in_progress");
                } else if (data.type === "enrollments") {
                    filtered = res.data.slice(0, 15); // Show last 15 enrollments
                }

                setItems(filtered);
            } catch (err) {
                console.error("Drilldown fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [data.type]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
            <div className="relative lms-card w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                    <div>
                        <h3 className="text-xl font-bold text-white">{data.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">Detailed breakdown of organizational data</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <span className="text-xl">×</span>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm text-slate-400">Fetching detailed metrics...</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-white/5">
                            <table className="lms-table">
                                <thead className="bg-slate-900/60">
                                    <tr>
                                        {data.type === "courses" ? (
                                            <>
                                                <th>Course Title</th>
                                                <th>Category</th>
                                                <th>Trainer</th>
                                                <th>Level</th>
                                            </>
                                        ) : data.type === "learners" ? (
                                            <>
                                                <th>Learner</th>
                                                <th>Enrolled</th>
                                                <th>Completed</th>
                                                <th>Avg Progress</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>User</th>
                                                <th>Course</th>
                                                <th>Progress</th>
                                                <th>Status</th>
                                                <th>Last Activity</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                            {data.type === "courses" ? (
                                                <>
                                                    <td className="font-bold text-white">{item.title}</td>
                                                    <td><span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase">{item.category}</span></td>
                                                    <td className="text-xs text-slate-400">{item.trainer?.name || "N/A"}</td>
                                                    <td className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{item.level || "Regular"}</td>
                                                </>
                                            ) : data.type === "learners" ? (
                                                <>
                                                    <td className="font-bold text-white">{item.userName}</td>
                                                    <td className="text-xs">{item.totalCourses} courses</td>
                                                    <td className="text-xs text-emerald-400 font-bold">{item.completedCourses}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-brand" style={{ width: `${item.avgProgress}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-bold">{item.avgProgress}%</span>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-white">{item.userName}</span>
                                                            <span className="text-[10px] text-slate-500">{item.userEmail}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-xs text-slate-300">{item.courseTitle}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-brand" style={{ width: `${item.progress}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px]">{item.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand/20 text-brand'
                                                            }`}>
                                                            {item.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="text-[10px] text-slate-500">{item.lastAccessed}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-slate-500 italic text-sm">No detailed data found for this metric.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/5 bg-slate-900/20 flex justify-end">
                    <button onClick={onClose} className="lms-btn-secondary px-8 py-2">Close Details</button>
                </div>
            </div>
        </div>
    );
}
