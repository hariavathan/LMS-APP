import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function LearnerListPage({ auth }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("completionRate");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using the specific report endpoint that now returns multiple learners
                const res = await axiosClient.get("/api/reports/user-performance");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch learners:", err);
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-2 border-brand border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Identifiers for top performers/most active
    const topPerformer = [...data].sort((a, b) => b.completionRate - a.completionRate)[0];
    const mostActive = [...data].sort((a, b) => b.totalCourses - a.totalCourses)[0];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header section with Stats */}
            <div className="lms-card p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white font-outfit">Learner Community</h1>
                        <p className="text-slate-400 mt-1">Monitor progress and engagement across all system learners.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="lms-input !rounded-full pl-10"
                        />
                        <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold">👤</div>
                        <div>
                            <div className="text-2xl font-black text-white">{data.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Learners</div>
                        </div>
                    </div>

                    {topPerformer && topPerformer.completionRate > 0 && (
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">🏆</div>
                            <div>
                                <div className="text-sm font-bold text-white truncate max-w-[150px]">{topPerformer.userName}</div>
                                <div className="text-[10px] text-emerald-500/80 uppercase font-black tracking-widest">Highest Completion ({topPerformer.completionRate}%)</div>
                            </div>
                        </div>
                    )}

                    {mostActive && mostActive.totalCourses > 0 && (
                        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">📚</div>
                            <div>
                                <div className="text-sm font-bold text-white truncate max-w-[150px]">{mostActive.userName}</div>
                                <div className="text-[10px] text-purple-500/80 uppercase font-black tracking-widest">Most Course Enrolled ({mostActive.totalCourses})</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="lms-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="lms-table">
                        <thead>
                            <tr>
                                <th className="!pl-8">Learner</th>
                                <th className="cursor-pointer hover:lms-text-brand transition-colors" onClick={() => handleSort("totalCourses")}>
                                    Courses {sortBy === "totalCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="cursor-pointer hover:lms-text-brand transition-colors" onClick={() => handleSort("completedCourses")}>
                                    Completed {sortBy === "completedCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="cursor-pointer hover:lms-text-brand transition-colors" onClick={() => handleSort("avgProgress")}>
                                    Avg Progress {sortBy === "avgProgress" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="cursor-pointer hover:lms-text-brand transition-colors" onClick={() => handleSort("completionRate")}>
                                    Status {sortBy === "completionRate" && (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="!pr-8">Last Online</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="!pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand/40 transition-colors">
                                                <span className="text-xs font-bold text-slate-400">{row.userName.charAt(0)}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white mb-0.5">{row.userName}</span>
                                                <span className="text-[10px] text-slate-500 font-medium">{row.userEmail}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2.5 py-1 bg-slate-900 border border-white/5 rounded-lg text-xs font-bold text-slate-300">
                                            {row.totalCourses}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-emerald-400 text-sm font-black">{row.completedCourses}</span>
                                        {row.totalCourses > 0 && <span className="text-[10px] text-slate-600 ml-1">/ {row.totalCourses}</span>}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand"
                                                    style={{ width: `${row.avgProgress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{row.avgProgress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${row.completionRate >= 80 ? 'bg-emerald-500' : row.completionRate >= 40 ? 'bg-brand' : 'bg-slate-700'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {row.completionRate >= 80 ? 'Advanced' : row.completionRate >= 40 ? 'Consistent' : 'Starting'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="!pr-8 text-xs text-slate-500 font-medium">
                                        {row.lastActivity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {sortedData.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="text-5xl mb-6 opacity-20">🔎</div>
                            <h3 className="text-xl font-bold text-white mb-2">No learners found</h3>
                            <p className="text-slate-500">Try adjusting your search terms to find what you're looking for.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                        Total Learners Displayed: {sortedData.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
