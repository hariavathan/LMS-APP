import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const ReportsPage = () => {
    const [stats, setStats] = useState(null);
    const [coursePerf, setCoursePerf] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, perfRes, insightsRes] = await Promise.all([
                    axiosClient.get("/module5/reports/stats"),
                    axiosClient.get("/module5/reports/course-performance"),
                    axiosClient.get("/module5/reports/learner-insights")
                ]);

                setStats(statsRes.data);
                setCoursePerf(perfRes.data);
                setInsights(insightsRes.data);
            } catch (err) {
                console.error("Failed to load reports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading Reports...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Learning Insights & Reports</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Total Enrollments</p>
                    <p className="text-2xl font-bold">{stats?.enrollments || 0}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm">Completions</p>
                    <p className="text-2xl font-bold">{stats?.completions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                    <p className="text-gray-500 text-sm">Avg. Completion Rate</p>
                    <p className="text-2xl font-bold">{stats?.avgCompletionRate || 0}%</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 text-sm">Active Learners</p>
                    <p className="text-2xl font-bold">{stats?.learners || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Performance Table */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Course Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-600">
                                    <th className="py-2">Course</th>
                                    <th className="py-2">Enrollments</th>
                                    <th className="py-2">Avg. Progress</th>
                                    <th className="py-2">Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coursePerf.map((c) => (
                                    <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium">{c.title}</td>
                                        <td className="py-3">{c.enrollments}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 h-1.5 rounded-full">
                                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${c.avgProgress}%` }}></div>
                                                </div>
                                                <span className="text-xs">{Math.round(c.avgProgress)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3">{c.completions}</td>
                                    </tr>
                                ))}
                                {coursePerf.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-gray-500">No data available</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Strategy/Insights Panel */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Learner Insights & Strategies</h2>
                    <p className="text-sm text-gray-500 mb-4">Learners needing attention (Progress &lt; 30%)</p>

                    <div className="space-y-4">
                        {insights.map((item, idx) => (
                            <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-red-800">{item.learner}</span>
                                    <span className="text-xs text-red-600 bg-red-200 px-2 py-0.5 rounded-full">{item.progress}% in {item.course}</span>
                                </div>
                                <p className="text-sm text-gray-600 italic">Strategy: {item.strategy}</p>
                            </div>
                        ))}
                        {insights.length === 0 && (
                            <div className="text-center py-8 text-green-600 bg-green-50 rounded">
                                All learners are progressing well!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
