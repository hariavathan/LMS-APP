import { useState } from "react";

const QuizBuilder = ({ value, onChange }) => {
    const [currentQuestion, setCurrentQuestion] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
    });

    const questions = value?.questions || [];

    const handleAddQuestion = () => {
        if (!currentQuestion.question) return alert("Question text is required");
        if (currentQuestion.options.some(opt => !opt)) return alert("All 4 options are required");

        const updatedQuestions = [...questions, currentQuestion];
        onChange({ ...value, questions: updatedQuestions });

        // Reset
        setCurrentQuestion({
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0
        });
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        onChange({ ...value, questions: updatedQuestions });
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Add Question</h4>

                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Question Text</label>
                    <input
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        className="lms-input"
                        placeholder="e.g. What is the capital of France?"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === idx}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                className="accent-brand"
                            />
                            <input
                                value={opt}
                                onChange={(e) => {
                                    const newOptions = [...currentQuestion.options];
                                    newOptions[idx] = e.target.value;
                                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="lms-input text-sm"
                                placeholder={`Option ${idx + 1}`}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-500">* Select the radio button for the correct answer.</p>

                <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full lms-btn-secondary py-2 text-xs"
                >
                    + Add Question to Quiz
                </button>
            </div>

            <div className="space-y-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Quiz Questions ({questions.length})</h4>
                {questions.length === 0 && <p className="text-slate-500 text-xs italic">No questions added yet.</p>}

                {questions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <p className="font-bold text-white text-sm">Q{idx + 1}: {q.question}</p>
                            <p className="text-xs text-slate-400">Answer: {q.options[q.correctAnswer]}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-red-500 text-xs hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizBuilder;
