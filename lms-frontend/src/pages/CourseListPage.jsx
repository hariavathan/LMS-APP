import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseApi from "../api/course";

const CourseListPage = ({ auth }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const user = auth?.user;

    const [myCourses, setMyCourses] = useState([]);
    const [enrollingId, setEnrollingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allCoursesRes, myCoursesRes] = await Promise.all([
                    courseApi.getAllCourses(),
                    user ? courseApi.getMyCourses() : Promise.resolve({ data: [] })
                ]);
                setCourses(allCoursesRes.data);
                setMyCourses(myCoursesRes.data);
            } catch (err) {
                setError("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleQuickEnroll = async (courseId) => {
        setEnrollingId(courseId);
        try {
            await courseApi.enrollUser({ userId: user?._id || user?.id, courseId });
            alert("Enrolled successfully!");
            // Refresh my courses
            const res = await courseApi.getMyCourses();
            setMyCourses(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrollingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white font-outfit">Course Management</h1>
                    <p className="text-slate-400">Browse and manage available learning pathways.</p>
                </div>
                {user && user.role === "trainer" && (
                    <button
                        onClick={() => navigate("/courses/create")}
                        className="lms-btn-primary px-8 py-3 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)]"
                    >
                        + Create New Course
                    </button>
                )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div key={course._id} className="lms-card p-0 overflow-hidden group hover:border-brand/40 transition-all flex flex-col">
                        <div className="h-48 bg-slate-800 relative overflow-hidden">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-900">📚</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent flex flex-col justify-end p-6">
                                <span className="text-[10px] text-brand font-black uppercase tracking-[0.2em]">{course.category}</span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:lms-text-brand transition-colors">{course.title}</h2>
                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-brand text-xs">●</span>
                                    {course.modules?.length || 0} Modules
                                </span>
                                <span className="truncate max-w-[120px]">By: {course.createdBy?.name || 'Unknown'}</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {/* Only Trainer who created the course can edit */}
                                {user && user.role === 'trainer' && (
                                    <div className="flex-1 flex gap-2">
                                        <button
                                            onClick={() => navigate(`/courses/${course._id}/edit`)}
                                            className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg"
                                        >
                                            ⚙️ Edit
                                        </button>
                                        <button
                                            onClick={() => navigate(`/courses/${course._id}/quiz/create`)}
                                            className="flex-1 bg-brand/10 border border-brand/50 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-black transition-all shadow-lg shadow-brand/10"
                                        >
                                            ⚡ Quiz
                                        </button>
                                    </div>
                                )}

                                {user && user.role === 'learner' && (
                                    <>
                                        {myCourses.some(enr => (enr.courseId?._id || enr.courseId) === course._id) ? (
                                            <button
                                                onClick={() => navigate(`/learn/${course._id}`)}
                                                className="flex-1 bg-emerald-500/10 border border-emerald-500/50 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                            >
                                                🚀 Continue
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleQuickEnroll(course._id)}
                                                disabled={enrollingId === course._id}
                                                className="flex-1 lms-btn-primary !py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                                            >
                                                {enrollingId === course._id ? "..." : "Quick Enroll"}
                                            </button>
                                        )}
                                    </>
                                )}

                                <button
                                    onClick={() => navigate(`/courses/${course._id}`)}
                                    className="flex-1 lms-btn-secondary !py-2.5 text-[10px] font-black uppercase tracking-widest"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="text-6xl text-slate-800">🔍</div>
                        <h3 className="text-xl font-bold text-white">No courses found</h3>
                        <p className="text-slate-500">
                            {user?.role === 'trainer' ? 'Be the first to create one!' : 'Check back later for new content.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseListPage;
