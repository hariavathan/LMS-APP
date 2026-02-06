import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseApi from "../api/course";
import axiosClient from "../api/axiosClient";

const CourseDetailsPage = ({ auth }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const user = auth?.user;

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const [courseRes, myCoursesRes] = await Promise.all([
                    courseApi.getCourseById(courseId),
                    courseApi.getMyCourses()
                ]);

                setCourse(courseRes.data);

                // Check if already enrolled
                const enrolled = myCoursesRes.data.some(enr => {
                    if (!enr.courseId) return false;
                    const nestedId = enr.courseId._id || enr.courseId;
                    return nestedId.toString() === courseId.toString();
                });
                setIsEnrolled(enrolled);
            } catch (err) {
                console.error("Failed to fetch course details", err);
                setError("Could not load course details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handleEnroll = async () => {
        if (isEnrolled) {
            navigate(`/learn/${courseId}`);
            return;
        }

        setEnrolling(true);
        try {
            await courseApi.enrollUser({ userId: user?._id || user?.id, courseId });
            alert("Enrolled successfully! Redirecting to My Learning...");
            navigate("/my-courses");
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin h-10 w-10 border-4 border-brand border-t-transparent rounded-full"></div>
        </div>
    );

    if (error || !course) return (
        <div className="lms-card p-8 text-center max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-outfit">Oops!</h2>
            <p className="text-slate-300 mb-6">{error || "Course not found"}</p>
            <button onClick={() => navigate("/courses")} className="lms-btn-secondary px-8 py-2">
                Back to Courses
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl lms-card p-0 border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10"></div>
                {course.thumbnail && (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60 scale-105"
                    />
                )}

                <div className="relative z-20 p-8 md:p-12 md:max-w-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-brand/20 text-brand text-xs font-bold uppercase tracking-wider border border-brand/30">
                            {course.category}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                            🕒 {course.duration} Hours
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                            🏆 {course.level || "Beginner"}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white font-outfit leading-tight">
                        {course.title}
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed font-outfit italic">
                        {course.subtitle || course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-4">
                        {user?.role === "learner" && (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className={`lms-btn-primary px-10 py-4 text-lg font-bold shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.3)] hover:scale-105 active:scale-95 transition-all
                                    ${isEnrolled ? "!bg-emerald-500 !text-white shadow-emerald-500/20" : ""}`}
                            >
                                {enrolling ? "Enrolling..." : isEnrolled ? "Already Enrolled - Continue Learning" : "Enroll Now"}
                            </button>
                        )}
                        {user?.role === "trainer" && (
                            <div className="flex flex-wrap gap-4 items-center">
                                <button
                                    onClick={() => navigate(`/learn/${courseId}`)}
                                    className="lms-btn-primary px-10 py-4 text-lg font-bold shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Preview Course Content
                                </button>

                                {user.role === 'trainer' && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/courses/${courseId}/edit`)}
                                            className="text-white bg-amber-500/10 border border-amber-500/50 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <span>⚙️</span> Edit Course
                                        </button>

                                        <button
                                            onClick={() => navigate(`/courses/${courseId}/quiz/create`)}
                                            className="text-white bg-purple-500/10 border border-purple-500/50 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <span>🎯</span> Manage Quiz
                                        </button>
                                    </>
                                )}

                                <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
                                    Trainers can preview the curriculum without enrollment.
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-xl">
                                👨‍🏫
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Instructor</p>
                                <p className="text-sm font-bold text-white">{course.createdBy?.name || "Expert Trainer"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="lms-card p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 font-outfit border-b border-white/5 pb-4">
                            About this Course
                        </h2>
                        <div className="prose prose-invert max-w-none text-slate-300 leading-loose">
                            {course.longDescription || course.description}
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div className="lms-card p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 font-outfit border-b border-white/5 pb-4 flex items-center justify-between">
                            Curriculum
                            <span className="text-sm font-normal text-slate-400">
                                {course.modules?.length || 0} Modules • {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
                            </span>
                        </h2>

                        <div className="space-y-4">
                            {course.modules?.map((module, mIdx) => (
                                <div key={mIdx} className="group border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden">
                                    <div className="p-4 flex items-center justify-between bg-white/[0.03] group-hover:bg-white/[0.05] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold">
                                                {mIdx + 1}
                                            </div>
                                            <h3 className="font-bold text-white">{module.title}</h3>
                                        </div>
                                        <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">
                                            {module.lessons?.length || 0} Lessons
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {module.lessons?.map((lesson, lIdx) => (
                                            <div key={lIdx} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors py-2 pl-4 border-l border-white/5 ml-4">
                                                <div className="flex-shrink-0 w-10 h-6 rounded overflow-hidden bg-slate-800 border border-white/10">
                                                    {lesson.thumbnail ? (
                                                        <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="flex items-center justify-center h-full text-[10px] text-slate-600">📖</span>
                                                    )}
                                                </div>
                                                <span className="text-brand">▸</span>
                                                <span className="flex-1 truncate">{lesson.title}</span>
                                                <span className="ml-auto text-[10px] text-slate-600 font-mono whitespace-nowrap">
                                                    {lesson.durationMinutes ? `${lesson.durationMinutes}m` : ""}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="lms-card p-6 bg-brand/5 border-brand/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            💡 Learning Goals
                        </h3>
                        <ul className="space-y-3">
                            {(course.learningObjectives && course.learningObjectives.length > 0 ? course.learningObjectives : ["Practical skills", "Hands-on projects", "Community support"]).map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="text-brand mt-0.5">✓</span>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lms-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            🎯 Requirements
                        </h3>
                        <ul className="space-y-3">
                            {(course.requirements?.length > 0 ? course.requirements : ["Basic computer knowledge", "Stable internet connection", "Dedication to learn"]).map((req, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                                    <span className="text-slate-600">•</span>
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
