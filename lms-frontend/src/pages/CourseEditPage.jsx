import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import courseApi from "../api/course";
import axiosClient from "../api/axiosClient";
import QuizBuilder from "../components/QuizBuilder";

const CourseEditPage = ({ auth }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        longDescription: "",
        thumbnail: "",
        category: "General",
        level: "Beginner",
        duration: 0,
        learningObjectives: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Module/Lesson Form States
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [currentModule, setCurrentModule] = useState({ title: "", lessons: [] });
    const [showLessonForm, setShowLessonForm] = useState(false);

    // Expanded Lesson State to support Quiz
    const [currentLesson, setCurrentLesson] = useState({
        title: "",
        type: "text", // text, video, quiz
        content: "",
        videoUrl: "",
        durationMinutes: 0,
        resources: [],
        quizData: {
            questions: [],
            passingScore: 70
        }
    });

    const [activeModuleIndex, setActiveModuleIndex] = useState(null);

    useEffect(() => {
        if (auth?.user?.role && auth.user.role !== 'trainer') {
            navigate("/courses");
            return;
        }
        const fetchCourse = async () => {
            try {
                const res = await courseApi.getCourseById(courseId);
                const data = res.data;

                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    description: data.description || "",
                    longDescription: data.longDescription || "",
                    thumbnail: data.thumbnail || "",
                    category: data.category || "General",
                    level: data.level || "Beginner",
                    duration: data.duration || 0,
                    learningObjectives: data.learningObjectives || []
                });
                setModules(data.modules || []);
            } catch (err) {
                setError("Failed to load course data");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, auth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...formData.learningObjectives];
        newObjectives[index] = value;
        setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
    };

    const addTodoObjective = () => {
        setFormData(prev => ({ ...prev, learningObjectives: [...prev.learningObjectives, ""] }));
    };

    const removeObjective = (index) => {
        const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
    };

    const addLessonToModule = async () => {
        if (!currentLesson.title) return alert("Lesson title is required");

        let lessonToAdd = { ...currentLesson }; // copy

        // If Quiz, we MUST create the quiz in the backend first to get an ID
        if (currentLesson.type === 'quiz') {
            if (currentLesson.quizData.questions.length === 0) {
                return alert("Please add at least one question to the quiz.");
            }

            try {
                // Determine description for the quiz (use lesson title or a default)
                const quizPayload = {
                    title: currentLesson.title,
                    courseId: courseId,
                    description: `Quiz for ${currentLesson.title}`,
                    passingScore: currentLesson.quizData.passingScore,
                    questions: currentLesson.quizData.questions
                };

                const res = await axiosClient.post("/api/quizzes", quizPayload);
                // The backend returns the created quiz object
                lessonToAdd.quizId = res.data._id;
                // We don't need to store large quizData in the lesson structure on the course side usually, 
                // but we can keep it for specific UI needs or clear it. 
                // The schema uses `quizId` reference.
                delete lessonToAdd.quizData;

            } catch (err) {
                console.error("Failed to create quiz", err);
                return alert("Failed to save quiz. Please try again.");
            }
        }

        if (activeModuleIndex !== null) {
            const updatedModules = [...modules];
            updatedModules[activeModuleIndex].lessons = [...updatedModules[activeModuleIndex].lessons, lessonToAdd];
            setModules(updatedModules);
        } else {
            setCurrentModule(prev => ({
                ...prev,
                lessons: [...prev.lessons, lessonToAdd]
            }));
        }

        // Reset
        setCurrentLesson({
            title: "",
            type: "text",
            content: "",
            videoUrl: "",
            durationMinutes: 0,
            resources: [],
            quizData: { questions: [], passingScore: 70 }
        });
        setShowLessonForm(false);
    };

    const removeLesson = (mIdx, lIdx) => {
        const updatedModules = [...modules];
        updatedModules[mIdx].lessons = updatedModules[mIdx].lessons.filter((_, i) => i !== lIdx);
        setModules(updatedModules);
    };

    const addModule = () => {
        if (!currentModule.title) return alert("Module title is required");
        setModules(prev => [...prev, currentModule]);
        setCurrentModule({ title: "", lessons: [] });
        setShowModuleForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await courseApi.updateCourse(courseId, {
                ...formData,
                modules
            });
            alert("Course updated successfully!");
            navigate("/courses");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update course");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading course data...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white font-outfit">Edit Course</h1>
                    <p className="text-slate-400">Refine your curriculum and learning goals.</p>
                </div>
                <button onClick={() => navigate("/courses")} className="text-slate-500 hover:text-white transition-colors text-sm font-bold">
                    Cancel Editing
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="lms-card p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white font-outfit border-b border-white/5 pb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="lms-label">Course Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="lms-input" required />
                        </div>

                        <div className="md:col-span-2">
                            <label className="lms-label">Subtitle / Hook</label>
                            <input name="subtitle" value={formData.subtitle} onChange={handleChange} className="lms-input" placeholder="e.g. Master React in 30 days" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="lms-label">Short Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="lms-input h-24" required />
                        </div>

                        <div>
                            <label className="lms-label">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="lms-input">
                                <option>General</option>
                                <option>IT & Software</option>
                                <option>Business</option>
                                <option>Design</option>
                                <option>Marketing</option>
                                <option>Artificial Intelligence</option>
                            </select>
                        </div>

                        <div>
                            <label className="lms-label">Thumbnail URL</label>
                            <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="lms-input" />
                        </div>
                    </div>
                </div>

                {/* Learning Goals */}
                <div className="lms-card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white font-outfit">Learning Goals</h2>
                        <button type="button" onClick={addTodoObjective} className="text-brand text-xs font-black uppercase tracking-widest">+ Add Goal</button>
                    </div>

                    <div className="space-y-3">
                        {formData.learningObjectives.map((obj, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={obj}
                                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                                    className="lms-input flex-1"
                                    placeholder="What will they learn?"
                                />
                                <button type="button" onClick={() => removeObjective(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Curriculum */}
                <div className="lms-card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white font-outfit">Curriculum</h2>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => navigate(`/courses/${courseId}/quiz/create`)} className="lms-btn-secondary !py-2 !px-4 !text-xs border-brand text-brand hover:bg-brand hover:text-black">
                                ⚡ Create Final Quiz
                            </button>
                            <button type="button" onClick={() => setShowModuleForm(true)} className="lms-btn-primary !py-2 !px-4 !text-xs">+ Add Module</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {modules.map((mod, mIdx) => (
                            <div key={mIdx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">{mIdx + 1}. {mod.title}</h3>
                                    <button type="button" onClick={() => setModules(prev => prev.filter((_, i) => i !== mIdx))} className="text-red-500 text-xs">Remove Module</button>
                                </div>
                                <div className="space-y-2 pl-4 border-l border-white/5">
                                    {mod.lessons.map((les, lIdx) => (
                                        <div key={lIdx} className="text-sm text-slate-400 flex justify-between group">
                                            <div className="flex items-center gap-2">
                                                {les.type === 'quiz' ? <span className="text-brand">📝</span> : <span className="text-blue-400">📺</span>}
                                                <span>{les.title} <span className="text-[10px] text-slate-600 ml-2 uppercase">{les.durationMinutes || 15}m</span></span>
                                            </div>
                                            <button type="button" onClick={() => removeLesson(mIdx, lIdx)} className="text-red-500/0 group-hover:text-red-500 transition-colors text-[10px] uppercase font-bold">Delete</button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveModuleIndex(mIdx);
                                            setShowLessonForm(true);
                                        }}
                                        className="text-brand text-[10px] font-black uppercase tracking-widest pt-2"
                                    >
                                        + Add Lesson to Module
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showModuleForm && (
                        <div className="p-6 rounded-2xl bg-slate-900 border border-brand/20 space-y-4">
                            <input
                                placeholder="Module Title"
                                value={currentModule.title}
                                onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                                className="lms-input"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Lessons: {currentModule.lessons.length}</span>
                                <button type="button" onClick={() => setShowLessonForm(true)} className="text-brand text-xs font-bold">+ New Lesson</button>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => { setShowModuleForm(false); setActiveModuleIndex(null); }} className="px-4 py-2 text-slate-400 text-sm">Cancel</button>
                                <button type="button" onClick={addModule} className="lms-btn-primary !py-2 !px-4 !text-xs">Save Module</button>
                            </div>
                        </div>
                    )}

                    {showLessonForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                            <div className="lms-card p-8 w-full max-w-2xl space-y-4 my-8">
                                <h3 className="text-xl font-bold text-white font-outfit">
                                    New {currentLesson.type === 'quiz' ? 'Quiz' : 'Lesson'} {activeModuleIndex !== null ? `to Module ${activeModuleIndex + 1}` : ""}
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="lms-label">Title</label>
                                            <input
                                                placeholder="Lesson/Quiz Title"
                                                value={currentLesson.title}
                                                onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                                                className="lms-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="lms-label">Type</label>
                                            <select
                                                value={currentLesson.type}
                                                onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value })}
                                                className="lms-input"
                                            >
                                                <option value="text">Text / Reading</option>
                                                <option value="video">Video Lesson</option>
                                                <option value="quiz">Quiz / Assessment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="lms-label">Duration (min)</label>
                                            <input
                                                type="number"
                                                value={currentLesson.durationMinutes}
                                                onChange={(e) => setCurrentLesson({ ...currentLesson, durationMinutes: e.target.value })}
                                                className="lms-input"
                                            />
                                        </div>
                                    </div>

                                    {currentLesson.type === 'quiz' ? (
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div>
                                                <label className="lms-label">Passing Score (%)</label>
                                                <input
                                                    type="number"
                                                    max="100"
                                                    value={currentLesson.quizData.passingScore}
                                                    onChange={(e) => setCurrentLesson({
                                                        ...currentLesson,
                                                        quizData: { ...currentLesson.quizData, passingScore: parseInt(e.target.value) }
                                                    })}
                                                    className="lms-input"
                                                />
                                            </div>
                                            <QuizBuilder
                                                value={currentLesson.quizData}
                                                onChange={(newData) => setCurrentLesson({ ...currentLesson, quizData: newData })}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {currentLesson.type === 'video' && (
                                                <div>
                                                    <label className="lms-label">YouTube URL</label>
                                                    <input
                                                        placeholder="https://youtube.com/..."
                                                        value={currentLesson.videoUrl}
                                                        onChange={(e) => setCurrentLesson({ ...currentLesson, videoUrl: e.target.value })}
                                                        className="lms-input"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="lms-label">Content (Markdown)</label>
                                                <textarea
                                                    placeholder="# Introduction..."
                                                    value={currentLesson.content}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                                                    className="lms-input h-32 font-mono text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="lms-label">Resources (Comma separated URLs)</label>
                                                <input
                                                    placeholder="https://tool.com, https://book.com"
                                                    value={currentLesson.resources?.join(', ') || ""}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, resources: e.target.value.split(',').map(s => s.trim()) })}
                                                    className="lms-input"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                                    <button type="button" onClick={() => { setShowLessonForm(false); setActiveModuleIndex(null); }} className="px-4 py-2 text-slate-400">Cancel</button>
                                    <button type="button" onClick={addLessonToModule} className="lms-btn-primary">
                                        {currentLesson.type === 'quiz' ? 'Create Quiz & Add' : 'Add Lesson'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => navigate("/courses")} className="lms-btn-secondary px-8">Discard</button>
                    <button type="submit" disabled={saving} className="lms-btn-primary px-12">
                        {saving ? "Saving Changes..." : "Update Course"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CourseEditPage;
