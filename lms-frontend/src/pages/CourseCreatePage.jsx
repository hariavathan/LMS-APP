import { useState } from "react";
import { useNavigate } from "react-router-dom";
import courseApi from "../api/course";
import QuizBuilder from "../components/QuizBuilder";

const CourseCreatePage = () => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Module/Lesson form state
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [currentModule, setCurrentModule] = useState({ title: "", lessons: [] });
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [currentLesson, setCurrentLesson] = useState({
        title: "",
        type: "text", // text, video, quiz
        content: "",
        videoUrl: "",
        durationMinutes: 0,
        resources: [],
        quizData: { questions: [], passingScore: 70 }
    });
    const [activeModuleIndex, setActiveModuleIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...formData.learningObjectives];
        newObjectives[index] = value;
        setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
    };

    const addObjective = () => {
        setFormData(prev => ({ ...prev, learningObjectives: [...prev.learningObjectives, ""] }));
    };

    const removeObjective = (index) => {
        const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
    };

    const addLessonToModule = () => {
        if (!currentLesson.title) return alert("Lesson title is required");
        if (activeModuleIndex !== null) {
            const updatedModules = [...modules];
            updatedModules[activeModuleIndex].lessons = [...updatedModules[activeModuleIndex].lessons, currentLesson];
            setModules(updatedModules);
        } else {
            setCurrentModule(prev => ({
                ...prev,
                lessons: [...prev.lessons, currentLesson]
            }));
        }
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
        setLoading(true);
        setError("");

        try {
            await courseApi.createCourse({
                ...formData,
                modules
            });
            alert("Course created successfully!");
            navigate("/courses");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white font-outfit">Create New Course</h1>
                    <p className="text-slate-400">Design a premium learning experience for your students.</p>
                </div>
                <button onClick={() => navigate("/courses")} className="text-slate-500 hover:text-white transition-colors text-sm font-bold">
                    Cancel
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
                            <input name="title" value={formData.title} onChange={handleChange} className="lms-input" placeholder="e.g. Advanced AI Mastery" required />
                        </div>

                        <div className="md:col-span-2">
                            <label className="lms-label">Subtitle / Hook</label>
                            <input name="subtitle" value={formData.subtitle} onChange={handleChange} className="lms-input" placeholder="e.g. Master React in 30 days" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="lms-label">Short Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="lms-input h-24" placeholder="Briefly describe what this course is about..." required />
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
                            <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className="lms-input" placeholder="https://example.com/image.jpg" />
                        </div>
                    </div>
                </div>

                {/* Learning Goals */}
                <div className="lms-card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white font-outfit">Learning Goals</h2>
                        <button type="button" onClick={addObjective} className="text-brand text-xs font-black uppercase tracking-widest">+ Add Goal</button>
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
                        {formData.learningObjectives.length === 0 && (
                            <p className="text-slate-500 text-sm italic">Add some learning objectives to show what students will achieve.</p>
                        )}
                    </div>
                </div>

                {/* Curriculum */}
                <div className="lms-card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white font-outfit">Curriculum</h2>
                        <button type="button" onClick={() => setShowModuleForm(true)} className="lms-btn-primary !py-2 !px-4 !text-xs">+ Add Module</button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((mod, mIdx) => (
                            <div key={mIdx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">{mIdx + 1}. {mod.title}</h3>
                                    <button type="button" onClick={() => setModules(prev => prev.filter((_, i) => i !== mIdx))} className="text-red-500 text-xs hover:underline">Remove Module</button>
                                </div>
                                <div className="space-y-2 pl-4 border-l border-white/5">
                                    {mod.lessons.map((les, lIdx) => (
                                        <div key={lIdx} className="text-sm text-slate-400 flex justify-between group">
                                            <span>• {les.title} <span className="text-[10px] text-slate-600 ml-2 uppercase">{les.durationMinutes}m</span></span>
                                            <button type="button" onClick={() => removeLesson(mIdx, lIdx)} className="text-red-500/0 group-hover:text-red-500 transition-colors text-[10px] uppercase font-bold">Delete</button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveModuleIndex(mIdx);
                                            setShowLessonForm(true);
                                        }}
                                        className="text-brand text-[10px] font-black uppercase tracking-widest pt-2 hover:underline"
                                    >
                                        + Add Lesson to Module
                                    </button>
                                </div>
                            </div>
                        ))}
                        {modules.length === 0 && !showModuleForm && (
                            <div className="text-center py-8 text-slate-500 italic border border-dashed border-white/10 rounded-2xl">
                                Your curriculum is empty. Start by adding a module.
                            </div>
                        )}
                    </div>

                    {showModuleForm && (
                        <div className="p-6 rounded-2xl bg-slate-900 border border-brand/20 space-y-4">
                            <input
                                placeholder="Module Title (e.g. Introduction to React)"
                                value={currentModule.title}
                                onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                                className="lms-input"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Lessons added: {currentModule.lessons.length}</span>
                                <button type="button" onClick={() => setShowLessonForm(true)} className="text-brand text-xs font-bold hover:underline">+ New Lesson</button>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => { setShowModuleForm(false); setActiveModuleIndex(null); }} className="px-4 py-2 text-slate-400 text-sm hover:text-white">Cancel</button>
                                <button type="button" onClick={addModule} className="lms-btn-primary !py-2 !px-4 !text-xs">Save Module</button>
                            </div>
                        </div>
                    )}

                    {showLessonForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <div className="lms-card p-8 w-full max-w-lg space-y-5 shadow-2xl border-white/10">
                                <h3 className="text-xl font-bold text-white font-outfit">
                                    New Lesson {activeModuleIndex !== null ? `to Module ${activeModuleIndex + 1}` : ""}
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Lesson Type</label>
                                            <select
                                                value={currentLesson.type}
                                                onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value })}
                                                className="lms-input"
                                            >
                                                <option value="text">Text / Article</option>
                                                <option value="video">Video Lesson</option>
                                                <option value="quiz">Quiz / Assessment</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Lesson Title</label>
                                        <input placeholder="e.g. Setting up the environment" value={currentLesson.title} onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })} className="lms-input" />
                                    </div>

                                    {currentLesson.type === 'quiz' ? (
                                        <QuizBuilder
                                            value={currentLesson.quizData}
                                            onChange={(val) => setCurrentLesson({ ...currentLesson, quizData: val })}
                                        />
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Content (Markdown)</label>
                                                <textarea placeholder="Write lesson content here..." value={currentLesson.content} onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })} className="lms-input h-32" />
                                            </div>
                                            {currentLesson.type === 'video' && (
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">YouTube Video URL</label>
                                                    <input placeholder="https://www.youtube.com/watch?v=..." value={currentLesson.videoUrl} onChange={(e) => setCurrentLesson({ ...currentLesson, videoUrl: e.target.value })} className="lms-input" />
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Duration (min)</label>
                                                    <input type="number" placeholder="10" value={currentLesson.durationMinutes} onChange={(e) => setCurrentLesson({ ...currentLesson, durationMinutes: parseInt(e.target.value) || 0 })} className="lms-input" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Resources (comma sep)</label>
                                                    <input placeholder="PDF link, etc." value={currentLesson.resources?.join(', ') || ""} onChange={(e) => setCurrentLesson({ ...currentLesson, resources: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} className="lms-input" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end pt-4">
                                    <button type="button" onClick={() => { setShowLessonForm(false); setActiveModuleIndex(null); }} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                                    <button type="button" onClick={addLessonToModule} className="lms-btn-primary">Add Lesson</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => navigate("/courses")} className="lms-btn-secondary px-8">Discard</button>
                    <button type="submit" disabled={loading} className="lms-btn-primary px-12 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)]">
                        {loading ? "Creating..." : "Create Course"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CourseCreatePage;
