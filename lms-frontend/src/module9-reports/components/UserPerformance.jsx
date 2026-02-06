// module9-reports/components/UserPerformance.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ExportButton from "./ExportButton";

export default function UserPerformance({ auth }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("completionRate");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get("/api/reports/user-performance");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch user performance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = data.filter(
        (row) =>
            !search ||
            row.userName.toLowerCase().includes(search.toLowerCase()) ||
            row.userEmail.toLowerCase().includes(search.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
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
        return <div className="text-center py-8 text-slate-300">Loading user performance data...</div>;
    }

    // Identify top performers
    const topPerformer = [...data].sort((a, b) => b.completionRate - a.completionRate)[0];
    const mostActive = [...data].sort((a, b) => b.totalCourses - a.totalCourses)[0];

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-brand">User Performance Metrics</h2>
                    <p className="text-xs text-slate-300">Individual learner performance and engagement analysis</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="lms-input max-w-xs text-xs"
                    />
                    <ExportButton type="user-performance" />
                </div>
            </div>

            {/* Highlights */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topPerformer && topPerformer.completionRate > 0 && (
                        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-3xl">🏆</div>
                            <div>
                                <div className="text-xs text-slate-300">Top Performer</div>
                                <div className="text-sm font-semibold text-emerald-300">{topPerformer.userName}</div>
                                <div className="text-xs text-slate-400">{topPerformer.completionRate}% completion rate</div>
                            </div>
                        </div>
                    )}
                    {mostActive && mostActive.totalCourses > 0 && (
                        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/40 rounded-xl p-4 flex items-center gap-4">
                            <div className="text-3xl">📚</div>
                            <div>
                                <div className="text-xs text-slate-300">Most Engaged</div>
                                <div className="text-sm font-semibold text-purple-300">{mostActive.userName}</div>
                                <div className="text-xs text-slate-400">{mostActive.totalCourses} courses enrolled</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {sortedData.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    No user performance data available. {data.length === 0 && "Try seeding demo data first."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="lms-table">
                        <thead>
                            <tr>
                                <th>Learner</th>
                                <th
                                    className="cursor-pointer hover:text-brand"
                                    onClick={() => handleSort("totalCourses")}
                                >
                                    Courses {sortBy === "totalCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="cursor-pointer hover:text-brand"
                                    onClick={() => handleSort("completedCourses")}
                                >
                                    Completed {sortBy === "completedCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>In Progress</th>
                                <th
                                    className="cursor-pointer hover:text-brand"
                                    onClick={() => handleSort("avgProgress")}
                                >
                                    Avg Progress {sortBy === "avgProgress" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="cursor-pointer hover:text-brand"
                                    onClick={() => handleSort("avgScore")}
                                >
                                    Avg Score {sortBy === "avgScore" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="cursor-pointer hover:text-brand"
                                    onClick={() => handleSort("completionRate")}
                                >
                                    Completion Rate {sortBy === "completionRate" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th>Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{row.userName}</span>
                                            <span className="text-[10px] text-slate-400">{row.userEmail}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="px-2 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs">
                                            {row.totalCourses}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs">
                                            {row.completedCourses}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="px-2 py-1 bg-brand/20 text-brand rounded-full text-xs">
                                            {row.inProgressCourses}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-14 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                                    style={{ width: `${row.avgProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-300">{row.avgProgress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.avgScore >= 80
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : row.avgScore >= 60
                                                    ? "bg-brand/20 text-brand"
                                                    : row.avgScore > 0
                                                        ? "bg-red-500/20 text-red-300"
                                                        : "bg-slate-500/20 text-slate-300"
                                                }`}>
                                                {row.avgScore > 0 ? row.avgScore : "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-14 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${row.completionRate >= 70
                                                        ? "bg-emerald-500"
                                                        : row.completionRate >= 40
                                                            ? "bg-brand"
                                                            : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${row.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-300 font-medium">{row.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="text-xs text-slate-300">{row.lastActivity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="text-xs text-slate-400 pt-2">
                Showing {sortedData.length} of {data.length} learners
            </div>
        </div>
    );
}
