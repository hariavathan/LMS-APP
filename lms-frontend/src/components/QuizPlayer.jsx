import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const QuizPlayer = ({ quizId, onComplete }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/api/quizzes/${quizId}`);
                setQuiz(res.data);
            } catch (err) {
                setError("Failed to load quiz.");
            } finally {
                setLoading(false);
            }
        };

        if (quizId) fetchQuiz();
    }, [quizId]);

    const handleOptionSelect = (qIndex, oIndex) => {
        if (result) return; // Disable changing if result is shown
        setAnswers(prev => ({
            ...prev,
            [qIndex]: oIndex
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
        }

        setSubmitting(true);
        try {
            const payload = {
                answers: Object.entries(answers).map(([qIdx, oIdx]) => ({
                    questionIndex: parseInt(qIdx),
                    selectedOption: parseInt(oIdx)
                }))
            };

            const res = await axiosClient.post(`/api/quizzes/${quizId}/submit`, payload);
            setResult(res.data);
            if (res.data.passed && onComplete) {
                onComplete();
            }
        } catch (err) {
            alert("Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center text-slate-400 py-8">Loading quiz...</div>;
    if (error) return <div className="text-red-400 py-8 text-center">{error}</div>;
    if (!quiz) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
            <div className="lms-card p-8 border-t-4 border-t-brand">
                <h2 className="text-2xl font-bold text-white mb-2">{quiz.title}</h2>
                <p className="text-slate-400">{quiz.description || "Test your knowledge with this quiz."}</p>

                {result && (
                    <div className={`mt-6 p-4 rounded-xl border ${result.passed ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {result.passed ? '🎉 Passed!' : '❌ Failed'}
                            <span className="text-sm font-normal opacity-80">(Score: {result.score}%)</span>
                        </h3>
                        <p className="text-sm mt-1">{result.message}</p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {quiz.questions.map((q, qIdx) => {
                    // Logic to show correctness if result exists
                    const userAnswer = answers[qIdx];
                    const isCorrect = result?.answers?.find(a => a.questionIndex === qIdx)?.isCorrect;

                    let borderColor = "border-white/5";
                    if (result) {
                        borderColor = isCorrect ? "border-emerald-500/50" : "border-red-500/50";
                    }

                    return (
                        <div key={qIdx} className={`lms-card p-6 border ${borderColor}`}>
                            <h3 className="text-lg font-bold text-white mb-4 flex gap-3">
                                <span className="text-brand">Q{qIdx + 1}.</span>
                                {q.question}
                            </h3>
                            <div className="space-y-3 pl-8">
                                {q.options.map((opt, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                            ${userAnswer === oIdx
                                                ? 'bg-brand/10 border-brand/50 text-white'
                                                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-white/5'
                                            }
                                            ${result && userAnswer === oIdx && isCorrect ? '!bg-emerald-500/20 !border-emerald-500' : ''}
                                            ${result && userAnswer === oIdx && !isCorrect ? '!bg-red-500/20 !border-red-500' : ''}
                                        `}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                                            ${userAnswer === oIdx ? 'border-brand' : 'border-slate-600'}
                                        `}>
                                            {userAnswer === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-brand"></div>}
                                        </div>
                                        <input
                                            type="radio"
                                            name={`q-${qIdx}`}
                                            className="hidden"
                                            onChange={() => handleOptionSelect(qIdx, oIdx)}
                                            checked={userAnswer === oIdx}
                                            disabled={!!result}
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-8 pb-20">
                {!result ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="lms-btn-primary px-12 py-4 shadow-xl shadow-brand/20"
                    >
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                ) : (
                    <button
                        onClick={onComplete} // Allow moving next even if failed? Or maybe retry? For now standard flow.
                        className="lms-btn-secondary px-8 py-3"
                    >
                        Continue to Next Lesson →
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
