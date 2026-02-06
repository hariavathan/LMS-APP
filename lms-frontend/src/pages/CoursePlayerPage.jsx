import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseApi from "../api/course";
import QuizPlayer from "../components/QuizPlayer";
import NotesPanel from "../components/NotesPanel";
import DiscussionPanel from "../components/DiscussionPanel";
import StudyToolsPanel from "../components/StudyToolsPanel";

const CoursePlayerPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLessonId, setCurrentLessonId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("content"); // 'content', 'notes', 'discussion'
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('auth');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr).user);
        }
    }, []);

    // Robust YouTube URL Parser
    const getYoutubeEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        try {
            if (url.includes('youtube.com/watch?v=')) {
                videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('youtube.com/embed/')[1].split(/[?#]/)[0];
            }
        } catch (e) {
            console.error("URL parsing error:", e);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
    };

    // Flatten all lessons from modules AND top-level for easy navigation and accurate progress
    const allLessons = useMemo(() => {
        if (!course) return [];
        let lessons = [];
        if (course.modules && Array.isArray(course.modules)) {
            lessons = [...lessons, ...course.modules.flatMap(m => m.lessons || [])];
        }
        if (course.lessons && Array.isArray(course.lessons)) {
            lessons = [...lessons, ...course.lessons];
        }
        return lessons;
    }, [course]);

    const currentLessonIndex = useMemo(() => {
        return allLessons.findIndex(l => l._id === currentLessonId);
    }, [allLessons, currentLessonId]);

    const currentLesson = useMemo(() => {
        return allLessons[currentLessonIndex] || allLessons[0];
    }, [allLessons, currentLessonIndex]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, myCoursesRes] = await Promise.all([
                    courseApi.getCourseById(courseId),
                    courseApi.getMyCourses()
                ]);

                setCourse(courseRes.data);

                const myEnrollment = myCoursesRes.data.find(e => {
                    if (!e.courseId) return false;
                    const nestedId = e.courseId._id || e.courseId;
                    return nestedId.toString() === courseId.toString();
                });

                if (!myEnrollment) {
                    setError("You are not enrolled in this course.");
                } else {
                    setEnrollment(myEnrollment);

                    // Set initial lesson
                    const initialLessonId = courseRes.data.modules?.[0]?.lessons?.[0]?._id ||
                        courseRes.data.lessons?.[0]?._id;
                    setCurrentLessonId(initialLessonId);
                }

            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError("Course not found. It might have been deleted or the link is invalid.");
                } else if (err.response?.status === 403) {
                    setError("You don't have permission to access this course.");
                } else {
                    setError("Failed to load course content. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchData();
    }, [courseId]);

    const handleCompleteLesson = async () => {
        if (!enrollment || !course || !currentLesson) return;

        try {
            const res = await courseApi.completeLesson(course._id, currentLesson._id);
            setEnrollment(prev => ({
                ...prev,
                completedLessons: [...prev.completedLessons, currentLesson._id],
                progress: res.data.progress,
                status: res.data.status
            }));
        } catch (err) {
            console.error("Failed to mark lesson complete", err);
        }
    };

    const handleClaimCertificate = async () => {
        try {
            const res = await axiosClient.post("/api/certificates/issue", { courseId });
            navigate(`/certificates/${res.data._id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to issue certificate");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="animate-spin h-10 w-10 border-4 border-brand border-t-transparent rounded-full"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
            <button onClick={() => navigate('/my-courses')} className="lms-btn-secondary px-6">
                Back to My Learning
            </button>
        </div>
    );

    const isCompleted = enrollment?.completedLessons.includes(currentLesson?._id);

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {/* Sidebar - Curriculum Redesign */}
            <div className="w-80 bg-slate-900 border-r border-white/5 overflow-y-auto hidden md:block">
                <div className="p-6 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-xl">
                    <button onClick={() => navigate('/my-courses')} className="text-xs text-slate-500 hover:text-brand transition-colors mb-4 flex items-center gap-2">
                        ← Back to My learning
                    </button>
                    {enrollment?.progress === 100 && (
                        <button
                            onClick={() => navigate(`/courses/${courseId}/quiz`)}
                            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-4 py-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2 border-2 border-purple-400/50"
                        >
                            <span>🎯</span> Take Final Quiz
                        </button>
                    )}
                    <h2 className="font-bold text-lg text-white leading-tight mb-4">{course?.title}</h2>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            <span>Your Progress</span>
                            <span>{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-brand h-full transition-all duration-700 shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.5)]"
                                style={{ width: `${enrollment?.progress || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    {course?.modules?.length > 0 ? (
                        course.modules.map((module, mIdx) => (
                            <div key={mIdx} className="space-y-1">
                                <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02] rounded-lg mt-4 mb-2">
                                    Module {mIdx + 1}: {module.title}
                                </div>
                                {(module.lessons || []).map((lesson) => (
                                    <LessonItem
                                        key={lesson._id}
                                        lesson={lesson}
                                        isActive={currentLessonId === lesson._id}
                                        isCompleted={enrollment?.completedLessons.includes(lesson._id)}
                                        onClick={() => {
                                            if (currentLessonId !== lesson._id) setVideoLoading(true);
                                            setCurrentLessonId(lesson._id);
                                        }}
                                    />
                                ))}
                            </div>
                        ))
                    ) : null}

                    {/* Top-level Lessons */}
                    {course?.lessons?.length > 0 && (
                        <div className="space-y-1">
                            <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02] rounded-lg mt-4 mb-2">
                                Core Lessons
                            </div>
                            {course.lessons.map((lesson, idx) => (
                                <LessonItem
                                    key={lesson._id}
                                    lesson={lesson}
                                    index={idx + 1}
                                    isActive={currentLessonId === lesson._id}
                                    isCompleted={enrollment?.completedLessons.includes(lesson._id)}
                                    onClick={() => {
                                        if (currentLessonId !== lesson._id) setVideoLoading(true);
                                        setCurrentLessonId(lesson._id);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
                {currentLesson ? (
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-brand uppercase tracking-widest mb-2 block">
                                    Now Playing
                                </span>
                                <h1 className="text-3xl font-black text-white font-outfit">{currentLesson.title}</h1>
                            </div>
                        </div>

                        {currentLesson.type === 'quiz' && currentLesson.quizId ? (
                            <QuizPlayer quizId={currentLesson.quizId} onComplete={handleCompleteLesson} />
                        ) : (
                            <>
                                {currentLesson.videoUrl ? (
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
                                        {videoLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                                                <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full"></div>
                                            </div>
                                        )}
                                        <iframe
                                            src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                                            className="w-full h-full"
                                            allowFullScreen
                                            title={currentLesson.title}
                                            onLoad={() => setVideoLoading(false)}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="min-h-[400px] bg-slate-900/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center p-12 overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center text-3xl mb-6 shadow-inner border border-brand/20">📖</div>
                                        <h3 className="text-2xl font-black text-white mb-2 font-outfit uppercase tracking-tight">Interactive Reading Module</h3>
                                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                                            This module focuses on conceptual understanding. Deep dive into the material below, take notes, and join the discussion to solidify your learning.
                                        </p>
                                        <div className="mt-8 flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Duration</span>
                                                <span className="text-sm font-bold text-white">{currentLesson.durationMinutes || 15} MINS</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10 mx-2"></div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Format</span>
                                                <span className="text-sm font-bold text-white uppercase">Reading</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TABS - Content, Notes, Discussion */}
                                <div className="lms-card overflow-hidden border-white/5 bg-slate-900/30 min-h-[600px] flex flex-col mt-8">
                                    <div className="flex border-b border-white/5 bg-slate-900/50 px-6">
                                        <button
                                            onClick={() => setActiveTab("content")}
                                            className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'content' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Lesson Content
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("notes")}
                                            className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'notes' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            My Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("discussion")}
                                            className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'discussion' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Discussion
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("tools")}
                                            className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'tools' ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Tools
                                        </button>
                                    </div>

                                    <div className="p-0 flex-1 flex flex-col">
                                        {activeTab === 'content' && (
                                            <div className="p-8 md:p-12">
                                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg">
                                                    {currentLesson.content?.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-4">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'notes' && (
                                            <NotesPanel lessonId={currentLesson._id} courseId={course._id} />
                                        )}

                                        {activeTab === 'discussion' && (
                                            <DiscussionPanel
                                                lessonId={currentLesson._id}
                                                courseId={course._id}
                                                currentUser={currentUser}
                                            />
                                        )}

                                        {activeTab === 'tools' && (
                                            <StudyToolsPanel />
                                        )}

                                        {/* Related Lessons / Next Steps footer within content */}
                                        <div className="p-8 border-t border-white/5 bg-slate-950/20">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">You might also be interested in</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {allLessons.slice(currentLessonIndex + 1, currentLessonIndex + 3).map((lesson, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setVideoLoading(true);
                                                            setCurrentLessonId(lesson._id);
                                                        }}
                                                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand/30 transition-all cursor-pointer group flex items-center gap-4"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white/50 group-hover:text-brand">
                                                            {lesson.type === 'video' ? "📺" : "📖"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold text-white truncate">{lesson.title}</div>
                                                            <div className="text-[10px] text-slate-500">Upcoming Lesson</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {allLessons.slice(currentLessonIndex + 1, currentLessonIndex + 3).length === 0 && (
                                                    <div className="col-span-2 p-6 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-500 text-xs">
                                                        🎉 You've reached the end of this learning path!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation Footer */}
                        <div className="sticky bottom-8 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                            <button
                                onClick={() => setCurrentLessonId(allLessons[currentLessonIndex - 1]?._id)}
                                disabled={currentLessonIndex <= 0}
                                className="lms-btn-secondary w-full sm:w-auto px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform inline-block mr-2">←</span>
                                Previous Lesson
                            </button>

                            <button
                                onClick={handleCompleteLesson}
                                disabled={isCompleted}
                                className={`px-10 py-3 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto
                                    ${isCompleted
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : "bg-brand text-black shadow-lg shadow-brand/20 hover:scale-105 active:scale-95"}`}
                            >
                                {isCompleted ? "Completed ✓" : "Mark as Complete"}
                            </button>

                            <button
                                onClick={() => setCurrentLessonId(allLessons[currentLessonIndex + 1]?._id)}
                                disabled={currentLessonIndex >= allLessons.length - 1}
                                className="lms-btn-secondary w-full sm:w-auto px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                Next Lesson
                                <span className="group-hover:translate-x-1 transition-transform inline-block ml-2">→</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-2xl">
                            🎯
                        </div>
                        <p className="font-medium">Select a lesson from the sidebar to start your journey</p>
                    </div>
                )
                }
            </div >
        </div >
    );
};

// Sub-component for sidebar items
const LessonItem = ({ lesson, index, isActive, isCompleted, onClick }) => (
    <div
        onClick={onClick}
        className={`group p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3
            ${isActive
                ? 'bg-brand/10 border border-brand/20 shadow-inner'
                : 'hover:bg-white/[0.03] border border-transparent'}`}
    >
        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-[10px] border 
            ${isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : isActive ? 'border-brand text-brand' : 'border-slate-700 text-slate-500'}`}>
            {lesson.thumbnail ? (
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
            ) : (
                isCompleted ? '✓' : index || '•'
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate transition-colors
                ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {lesson.title}
            </p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                {lesson.durationMinutes} mins
            </p>
        </div>
    </div>
);

export default CoursePlayerPage;
