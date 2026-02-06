// pages/QuizResultsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function QuizResultsPage() {
    const { courseId, resultId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (!resultId || resultId === "undefined") {
                    throw new Error("Invalid Result ID");
                }
                const res = await axiosClient.get(`/api/quiz-results/${resultId}`);
                setResult(res.data);
            } catch (err) {
                console.error("Failed to load quiz result:", err);
                alert("Results not found or still processing. Redirecting to course...");
                navigate(`/courses/${courseId}`);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [resultId, courseId, navigate]);

    const handleClaimCertificate = async () => {
        try {
            setClaiming(true);
            const res = await axiosClient.post('/api/certificates/issue', { courseId });
            navigate(`/certificates/${res.data._id}`);
        } catch (err) {
            console.error("Failed to issue certificate:", err);
            alert(err.response?.data?.message || "Failed to issue certificate. Please try again later.");
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-red-400">Results not found</p>
            </div>
        );
    }

    const passed = result.passed ?? (result.score >= (result.quizId?.passingScore || 70));
    const percentage = result.score;
    const totalQuestions = result.totalQuestions || result.quizId?.questions?.length || result.answers?.length || 0;
    const correctCount = Math.round((percentage / 100) * totalQuestions);

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Result Card */}
                <div className="lms-card p-8 text-center mb-6">
                    {/* Icon and Status */}
                    <div className="mb-6">
                        {passed ? (
                            <div className="inline-block p-6 bg-emerald-500/20 rounded-full border-4 border-emerald-500/30 mb-4">
                                <span className="text-6xl">🎉</span>
                            </div>
                        ) : (
                            <div className="inline-block p-6 bg-red-500/20 rounded-full border-4 border-red-500/30 mb-4">
                                <span className="text-6xl">😔</span>
                            </div>
                        )}
                        <h1 className={`text-3xl font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {passed ? 'Congratulations!' : 'Not Quite There Yet'}
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {passed ?
                                'You passed the quiz! Well done!' :
                                `You need ${result.quizId?.passingScore || 70}% to pass. Keep learning and try again!`
                            }
                        </p>
                    </div>

                    {/* Score Display */}
                    <div className="bg-slate-900 rounded-2xl p-8 mb-6">
                        <div className="text-7xl font-black text-white mb-4">
                            {percentage}%
                        </div>
                        <div className="text-xl text-slate-300">
                            {correctCount} out of {result.totalQuestions} correct
                        </div>

                        {/* Progress Circle */}
                        <div className="flex justify-center mt-6">
                            <div className="relative w-32 h-32">
                                <svg className="transform -rotate-90" width="128" height="128">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke={passed ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-2xl font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Correct</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="text-2xl font-black text-red-400">{(result.totalQuestions || result.quizId?.questions?.length) - correctCount}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Incorrect</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 md:col-span-1 col-span-2">
                            <div className="text-2xl font-black text-brand">{totalQuestions}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Total Questions</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        {passed ? (
                            <button
                                onClick={handleClaimCertificate}
                                disabled={claiming}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-xl text-lg font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-2xl">{claiming ? '⏳' : '🏆'}</span>
                                {claiming ? 'Processing...' : 'Claim Your Certificate'}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/courses/${courseId}/quiz`)}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-xl text-lg font-black uppercase tracking-widest shadow-[0_0_20_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-3"
                            >
                                <span className="text-2xl">🔄</span>
                                Reattempt Quiz
                            </button>
                        )}

                        <button
                            onClick={() => navigate(`/courses/${courseId}`)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Back to Course
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="lms-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Quiz Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Quiz Title:</span>
                            <span className="text-white font-bold">{result.quizId?.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Passing Score:</span>
                            <span className="text-white font-bold">{result.quizId?.passingScore || 70}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Your Score:</span>
                            <span className={`font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {percentage}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${passed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {passed ? '✓ PASSED' : '✗ FAILED'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
