import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function QuizCreatePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [passingScore, setPassingScore] = useState(70);
    const [questions, setQuestions] = useState([
        { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
    const [isFinalQuiz, setIsFinalQuiz] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const auth = JSON.parse(localStorage.getItem('auth'));

    useEffect(() => {
        if (auth?.user?.role !== 'trainer') {
            navigate("/courses");
        }
    }, [auth, navigate]);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic Validation
        if (!title.trim()) {
            setError("Quiz Title is required");
            setLoading(false);
            return;
        }

        try {
            await axiosClient.post("/api/quizzes", {
                title,
                description,
                courseId,
                passingScore,
                questions,
                isFinalQuiz: isFinalQuiz // Use the state value
            });
            alert("Quiz Created Successfully!");
            navigate(`/courses/${courseId}/edit`);
        } catch (err) {
            console.error("Create quiz error:", err);
            setError(err.response?.data?.message || "Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(`/courses/${courseId}/edit`)} className="mb-6 text-slate-400 hover:text-white">
                    ← Back to Course
                </button>

                <h1 className="text-3xl font-bold mb-8">{isFinalQuiz ? "Create Final Quiz" : "Create Lesson Quiz"}</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Quiz Details */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-white/10 space-y-4">
                        <h2 className="text-xl font-bold border-b border-white/10 pb-2">Quiz Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Quiz Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none"
                                placeholder="e.g., Final Assessment"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none"
                                rows="3"
                                placeholder="Briefly describe what this quiz covers..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Passing Score (%)</label>
                            <input
                                type="number"
                                value={passingScore}
                                onChange={(e) => setPassingScore(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none"
                                min="0" max="100"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={isFinalQuiz}
                                onChange={e => setIsFinalQuiz(e.target.checked)}
                                className="w-4 h-4 accent-brand"
                            />
                            <label className="text-sm font-medium text-slate-300">Mark as Final Course Quiz (required for certificate)</label>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-slate-900 p-6 rounded-xl border border-white/10 relative">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete Question
                                </button>

                                <h3 className="text-lg font-bold mb-4 text-brand">Question {qIndex + 1}</h3>

                                <div className="space-y-4">
                                    {/* Question Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Question Text</label>
                                        <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none"
                                            placeholder="Enter your question here..."
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex}>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Option {oIndex + 1}</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIndex}`}
                                                        checked={q.correctAnswer === oIndex}
                                                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                        className="accent-brand w-4 h-4"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className={`w-full bg-slate-950 border rounded-lg p-2 text-white outline-none ${q.correctAnswer === oIndex ? 'border-brand' : 'border-white/10'}`}
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Explanation (Optional)</label>
                                        <input
                                            type="text"
                                            value={q.explanation}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-brand outline-none"
                                            placeholder="Why is this the correct answer?"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-brand hover:bg-brand/5 transition-all text-sm font-bold uppercase tracking-wider"
                    >
                        + Add Another Question
                    </button>

                    <div className="flex justify-end pt-6 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Quiz"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
