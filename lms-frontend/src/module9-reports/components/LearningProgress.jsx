// module9-reports/components/LearningProgress.jsx - ENHANCED VERSION
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ExportButton from "./ExportButton";

export default function LearningProgress({ auth }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("cards"); // cards or table

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get("/api/reports/learning-progress");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch learning progress:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = data.filter((row) => {
        const matchesSearch =
            !search ||
            row.userName.toLowerCase().includes(search.toLowerCase()) ||
            row.courseTitle.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            row.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const stats = {
        total: filteredData.length,
        completed: filteredData.filter(d => d.status === 'completed').length,
        inProgress: filteredData.filter(d => d.status === 'in_progress').length,
        avgProgress: filteredData.length > 0
            ? Math.round(filteredData.reduce((sum, d) => sum + (d.progress || 0), 0) / filteredData.length)
            : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400">Loading learning progress data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="text-3xl">📊</span>
                        Learning Progress Report
                    </h2>
                    <p className="text-sm text-slate-400">Comprehensive tracking of individual learner progress</p>
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
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon="👥"
                    label="Total Learners"
                    value={stats.total}
                    color="blue"
                />
                <StatCard
                    icon="✅"
                    label="Completed"
                    value={stats.completed}
                    color="emerald"
                    subtitle={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion`}
                />
                <StatCard
                    icon="🔥"
                    label="In Progress"
                    value={stats.inProgress}
                    color="brand"
                />
                <StatCard
                    icon="📈"
                    label="Avg Progress"
                    value={`${stats.avgProgress}%`}
                    color="purple"
                />
            </div>

            {/* Filters */}
            <div className="lms-card p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="🔍 Search learner or course..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="lms-input w-full"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="lms-input w-auto min-w-[150px]"
                    >
                        <option value="all">All Status</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                    </select>

                    <ExportButton type="learning-progress" />
                </div>
            </div>

            {/* Data Display */}
            {filteredData.length === 0 ? (
                <div className="lms-card py-20 text-center space-y-4">
                    <div className="text-6xl grayscale opacity-50">📚</div>
                    <h3 className="text-xl font-bold text-white">No learning data found</h3>
                    <p className="text-slate-400">
                        {data.length === 0 ? "Try seeding demo data first." : "Adjust your filters to see results."}
                    </p>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((row, idx) => (
                        <LearnerCard key={idx} data={row} />
                    ))}
                </div>
            ) : (
                <div className="lms-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="lms-table">
                            <thead>
                                <tr>
                                    <th>Learner</th>
                                    <th>Course</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-purple-500/30 flex items-center justify-center font-bold text-white border-2 border-white/10">
                                                    {row.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{row.userName}</div>
                                                    <div className="text-[11px] text-slate-500">{row.userEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-white">{row.courseTitle}</div>
                                            <div className="text-[10px] text-slate-500">{row.category}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${row.progress >= 100 ? "bg-emerald-500" :
                                                                row.progress >= 50 ? "bg-brand" : "bg-brand/60"
                                                            }`}
                                                        style={{ width: `${Math.min(row.progress, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-brand">{row.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="text-xs text-slate-400">
                                            <div>Started: {row.startedAt || "-"}</div>
                                            <div className="text-[10px]">Last: {row.lastAccessed || "-"}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Showing {filteredData.length} of {data.length} records</span>
                <span>{stats.completed} completions • {stats.inProgress} active</span>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, subtitle }) {
    const colors = {
        blue: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
        emerald: "from-emerald-500/20 to-green-500/10 border-emerald-500/30",
        brand: "from-brand/20 to-yellow-500/10 border-brand/30",
        purple: "from-purple-500/20 to-violet-500/10 border-purple-500/30"
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 hover:scale-105 transition-transform`}>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
            {subtitle && <div className="text-[10px] text-slate-500 mt-1">{subtitle}</div>}
        </div>
    );
}

function LearnerCard({ data }) {
    return (
        <div className="lms-card p-5 hover:border-brand/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/40 to-purple-500/40 flex items-center justify-center font-bold text-lg text-white border-2 border-white/10 shadow-lg">
                        {data.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-brand transition-colors">{data.userName}</h3>
                        <p className="text-[10px] text-slate-500">{data.userEmail}</p>
                    </div>
                </div>
                <StatusBadge status={data.status} />
            </div>

            <div className="mb-4 pb-4 border-b border-white/5">
                <div className="text-xs text-slate-400 mb-1">Current Course</div>
                <div className="text-sm font-bold text-white line-clamp-1">{data.courseTitle}</div>
                <div className="text-[10px] text-slate-500">{data.category}</div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Progress</span>
                        <span className="text-sm font-black text-brand">{data.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${data.progress >= 100 ? "bg-emerald-500" :
                                    data.progress >= 50 ? "bg-brand" : "bg-brand/60"
                                }`}
                            style={{ width: `${Math.min(data.progress, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div>
                        <div>Started {data.startedAt || "-"}</div>
                        {data.completedAt && <div className="text-emerald-400">✓ {data.completedAt}</div>}
                    </div>
                    <div className="text-right">
                        <div>Last active:</div>
                        <div className="text-white">{data.lastAccessed || "-"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const configs = {
        enrolled: {
            bg: "bg-slate-500/20",
            text: "text-slate-300",
            border: "border-slate-500/40",
            icon: "📝"
        },
        in_progress: {
            bg: "bg-brand/20",
            text: "text-brand",
            border: "border-brand/40",
            icon: "🔄"
        },
        completed: {
            bg: "bg-emerald-500/20",
            text: "text-emerald-300",
            border: "border-emerald-500/40",
            icon: "✅"
        },
        dropped: {
            bg: "bg-red-500/20",
            text: "text-red-300",
            border: "border-red-500/40",
            icon: "⚠️"
        }
    };

    const config = configs[status] || configs.enrolled;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
            <span>{config.icon}</span>
            {status.replace("_", " ").toUpperCase()}
        </span>
    );
}
