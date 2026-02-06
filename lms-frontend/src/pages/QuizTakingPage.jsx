// pages/QuizTakingPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function QuizTakingPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await axiosClient.get(`/api/quizzes/course/${courseId}/final-quiz`);
                setQuiz(res.data);
                setTimeRemaining(res.data.timeLimit * 60 || 20 * 60);
            } catch (err) {
                console.error("Failed to load quiz:", err);
                setError(`${err.response?.status || 'Unknown Status'}: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [courseId]);

    // Timer countdown
    useEffect(() => {
        if (!quiz || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Convert answers object {0: 1, 1: 0} to array [1, 0]
            const totalQuestions = quiz.questions.length;
            const answersArray = Array.from({ length: totalQuestions }, (_, i) => answers[i] ?? null);

            const response = await axiosClient.post(`/api/quizzes/${quiz._id}/attempt`, {
                answers: answersArray,
                timeSpent: (quiz.timeLimit * 60) - timeRemaining
            });

            // Navigate to results page
            const resultId = response.data.resultId || response.data._id;
            navigate(`/courses/${courseId}/quiz/results/${resultId}`);
        } catch (err) {
            console.error("Failed to submit quiz:", err);
            alert("Failed to submit quiz. Please try again.");
            setIsSubmitting(false);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz?.questions?.length || 0;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Quiz Load Error</h2>
                        <p className="text-white font-mono text-sm mb-4">
                            {error ? error : "Unknown error occurred."}
                        </p>
                        <p className="text-slate-400 text-xs mb-6">
                            Debug Info: Course ID: {courseId}
                        </p>
                        <button onClick={() => navigate(`/courses/${courseId}`)} className="lms-btn-primary w-full">
                            Back to Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestionData = quiz.questions[currentQuestion];
    const isWarningTime = timeRemaining <= 120; // Less than 2 minutes

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header with Timer */}
            <div className="bg-slate-900 border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
                            <p className="text-sm text-slate-400">Question {currentQuestion + 1} of {totalQuestions}</p>
                        </div>
                        <div className={`text-2xl font-black ${isWarningTime ? 'text-red-400 animate-pulse' : 'text-brand'}`}>
                            ⏱️ {formatTime(timeRemaining)}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Progress</span>
                            <span>{answeredCount}/{totalQuestions} answered</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="lms-card p-8 mb-6">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-brand/20 text-brand text-xs font-bold rounded-full mb-4">
                            Question {currentQuestion + 1}
                        </span>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {currentQuestionData.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(currentQuestion, index)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion] === index
                                    ? 'border-brand bg-brand/10 text-white'
                                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-brand/50 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === index
                                        ? 'border-brand bg-brand'
                                        : 'border-slate-500'
                                        }`}>
                                        {answers[currentQuestion] === index && (
                                            <div className="w-3 h-3 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <span className="flex-1 font-medium">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 rounded-lg bg-white/5 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                    >
                        ← Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {quiz.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentQuestion === index
                                    ? 'bg-brand text-black'
                                    : answers[index] !== undefined
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/5 text-slate-500 border border-white/10'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestion < totalQuestions - 1 ? (
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                            className="px-6 py-3 rounded-lg bg-brand text-black font-bold hover:bg-yellow-400 transition-all"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={isSubmitting || answeredCount < totalQuestions}
                            className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz 🏆'}
                        </button>
                    )}
                </div>

                {answeredCount < totalQuestions && currentQuestion === totalQuestions - 1 && (
                    <p className="text-center text-sm text-red-400 mt-4">
                        ⚠️ Please answer all questions before submitting
                    </p>
                )}
            </div>
        </div>
    );
}
