// module9-reports/components/CourseCompletion.jsx - ENHANCED VERSION
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ExportButton from "./ExportButton";
import EnrollmentCharts from "./EnrollmentCharts";

export default function CourseCompletion({ auth }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("completionRate");
    const [sortOrder, setSortOrder] = useState("desc");
    const [viewMode, setViewMode] = useState("cards");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get("/api/reports/course-completion");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch course completion:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedData = [...data].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400">Loading course analytics...</p>
                </div>
            </div>
        );
    }

    // Calculate totals
    const totals = data.reduce(
        (acc, row) => ({
            enrolled: acc.enrolled + (row.totalEnrolled || 0),
            completed: acc.completed + (row.completed || 0),
            inProgress: acc.inProgress + (row.inProgress || 0),
            avgCompletion: acc.avgCompletion + (row.completionRate || 0)
        }),
        { enrolled: 0, completed: 0, inProgress: 0, avgCompletion: 0 }
    );

    const avgCompletionRate = data.length > 0 ? Math.round(totals.avgCompletion / data.length) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="text-3xl">🎯</span>
                        Course Enrollment Analytics
                    </h2>
                    <p className="text-sm text-slate-400">Comprehensive analysis of course performance and completion rates</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'cards'
                            ? 'bg-brand text-black'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        📇 Cards
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table'
                            ? 'bg-brand text-black'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        📋 Table
                    </button>
                    <ExportButton type="course-completion" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                    icon="📚"
                    label="Total Enrollments"
                    value={totals.enrolled}
                    gradient="from-purple-500/20 to-violet-500/10"
                    border="border-purple-500/30"
                    textColor="text-purple-300"
                />
                <SummaryCard
                    icon="✅"
                    label="Completions"
                    value={totals.completed}
                    gradient="from-emerald-500/20 to-green-500/10"
                    border="border-emerald-500/30"
                    textColor="text-emerald-300"
                    subtitle={`${totals.enrolled > 0 ? Math.round((totals.completed / totals.enrolled) * 100) : 0}% of total`}
                />
                <SummaryCard
                    icon="🔥"
                    label="In Progress"
                    value={totals.inProgress}
                    gradient="from-brand/20 to-yellow-500/10"
                    border="border-brand/30"
                    textColor="text-brand"
                />
                <SummaryCard
                    icon="📊"
                    label="Avg Completion"
                    value={`${avgCompletionRate}%`}
                    gradient="from-cyan-500/20 to-blue-500/10"
                    border="border-cyan-500/30"
                    textColor="text-cyan-300"
                />
            </div>

            {/* Data Display */}
            {sortedData.length === 0 ? (
                <div className="lms-card py-20 text-center space-y-4">
                    <div className="text-6xl grayscale opacity-50">📈</div>
                    <h3 className="text-xl font-bold text-white">No course data available</h3>
                    <p className="text-slate-400">Try seeding demo data first.</p>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedData.map((row) => (
                        <CourseCard key={row.courseId} data={row} />
                    ))}
                </div>
            ) : (
                <div className="lms-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="lms-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Trainer</th>
                                    <th
                                        className="cursor-pointer hover:text-brand transition-colors"
                                        onClick={() => handleSort("totalEnrolled")}
                                    >
                                        <div className="flex items-center gap-1 justify-center">
                                            Enrolled
                                            {sortBy === "totalEnrolled" && (
                                                <span className="text-brand">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:text-brand transition-colors"
                                        onClick={() => handleSort("completed")}
                                    >
                                        <div className="flex items-center gap-1 justify-center">
                                            Completed
                                            {sortBy === "completed" && (
                                                <span className="text-brand">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th>In Progress</th>
                                    <th
                                        className="cursor-pointer hover:text-brand transition-colors"
                                        onClick={() => handleSort("avgProgress")}
                                    >
                                        <div className="flex items-center gap-1 justify-center">
                                            Avg Progress
                                            {sortBy === "avgProgress" && (
                                                <span className="text-brand">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:text-brand transition-colors"
                                        onClick={() => handleSort("completionRate")}
                                    >
                                        <div className="flex items-center gap-1 justify-center">
                                            Completion Rate
                                            {sortBy === "completionRate" && (
                                                <span className="text-brand">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((row) => (
                                    <tr key={row.courseId} className="hover:bg-white/[0.02] transition-colors">
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{row.courseTitle}</span>
                                                <span className="text-[10px] text-slate-500">{row.category} • {row.duration}h</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white">{row.trainer}</span>
                                                <span className="text-[10px] text-slate-500">{row.trainerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
                                                {row.totalEnrolled || 0}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                                                {row.completed || 0}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="px-3 py-1 bg-brand/20 text-brand rounded-full text-xs font-bold border border-brand/30">
                                                {row.inProgress || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <ProgressBar value={row.avgProgress || 0} />
                                        </td>
                                        <td>
                                            <CompletionBar value={row.completionRate || 0} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Interactive Chart Visualizations */}
            {sortedData.length > 0 && (
                <div className="mt-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-3xl">📊</span>
                            Visual Analytics
                        </h2>
                        <p className="text-sm text-slate-400">Interactive charts for deeper enrollment insights</p>
                    </div>
                    <EnrollmentCharts data={sortedData} />
                </div>
            )}

            <div className="text-xs text-slate-500 flex items-center justify-between mt-6">
                <span>{data.length} courses total</span>
                <span>{totals.enrolled} total enrollments • {avgCompletionRate}% avg completion</span>
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, gradient, border, textColor, subtitle }) {
    return (
        <div className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-5 hover:scale-105 transition-all`}>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{icon}</span>
            </div>
            <div className={`text-3xl font-black ${textColor} mb-1`}>{value}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</div>
            {subtitle && <div className="text-[10px] text-slate-500 mt-2">{subtitle}</div>}
        </div>
    );
}

function CourseCard({ data }) {
    const completionRate = data.completionRate || 0;
    const ratingColor = completionRate >= 70 ? "emerald" : completionRate >= 40 ? "brand" : "red";

    return (
        <div className="lms-card p-5 hover:border-brand/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-brand transition-colors line-clamp-2 mb-1">
                        {data.courseTitle}
                    </h3>
                    <p className="text-[10px] text-slate-500">{data.category} • {data.duration}h duration</p>
                </div>
                <div className={`text-2xl font-black ${ratingColor === 'emerald' ? 'text-emerald-400' :
                    ratingColor === 'brand' ? 'text-brand' : 'text-red-400'
                    }`}>
                    {completionRate}%
                </div>
            </div>

            <div className="mb-4 pb-4 border-b border-white/5">
                <div className="text-xs text-slate-400 mb-1">Trainer</div>
                <div className="text-sm  font-bold text-white">{data.trainer}</div>
                <div className="text-[10px] text-slate-500">{data.trainerEmail}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-lg font-black text-purple-300">{data.totalEnrolled || 0}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Enrolled</div>
                </div>
                <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="text-lg font-black text-emerald-300">{data.completed || 0}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Completed</div>
                </div>
                <div className="text-center p-2 bg-brand/10 rounded-lg border border-brand/20">
                    <div className="text-lg font-black text-brand">{data.inProgress || 0}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Active</div>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Average Progress</span>
                        <span className="text-xs font-bold text-brand">{data.avgProgress || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${Math.min(data.avgProgress || 0, 100)}%` }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Completion Rate</span>
                        <span className={`text-xs font-bold ${completionRate >= 70 ? 'text-emerald-400' :
                            completionRate >= 40 ? 'text-brand' : 'text-red-400'
                            }`}>
                            {completionRate}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${completionRate >= 70 ? 'bg-emerald-500' :
                                completionRate >= 40 ? 'bg-brand' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(completionRate, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressBar({ value }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${Math.min(value || 0, 100)}%` }}
                />
            </div>
            <span className="text-xs font-bold text-brand min-w-[40px]">{value || 0}%</span>
        </div>
    );
}

function CompletionBar({ value }) {
    const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-brand" : "bg-red-500";
    const textColor = value >= 70 ? "text-emerald-400" : value >= 40 ? "text-brand" : "text-red-400";

    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${Math.min(value || 0, 100)}%` }}
                />
            </div>
            <span className={`text-xs font-bold ${textColor} min-w-[40px]`}>{value || 0}%</span>
        </div>
    );
}
