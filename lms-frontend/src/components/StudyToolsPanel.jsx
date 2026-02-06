import { useState, useEffect } from "react";

const StudyToolsPanel = () => {
    const [calcInput, setCalcInput] = useState("");
    const [calcResult, setCalcResult] = useState("");
    const [timer, setTimer] = useState(25 * 60); // 25 min pomodoro
    const [timerActive, setTimerActive] = useState(false);

    // Calculator Logic
    const handleCalcInput = (val) => {
        if (val === 'C') {
            setCalcInput("");
            setCalcResult("");
        } else if (val === '=') {
            try {
                // eslint-disable-next-line no-eval
                setCalcResult(eval(calcInput).toString());
            } catch (e) {
                setCalcResult("Error");
            }
        } else {
            setCalcInput(prev => prev + val);
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (timerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setTimerActive(false);
            // optional audio beep
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="lms-card p-6 bg-slate-900/50 border-white/5 h-full flex flex-col overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🛠️</span> Study Tools
            </h3>

            <div className="space-y-8">
                {/* 1. Pomodoro Timer */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">⏱️ Focus Timer</h4>
                    <div className="text-center mb-4">
                        <div className="text-4xl font-black text-white font-mono">{formatTime(timer)}</div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimerActive(!timerActive)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${timerActive ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'}`}
                        >
                            {timerActive ? "Pause" : "Start Focus"}
                        </button>
                        <button
                            onClick={() => { setTimerActive(false); setTimer(25 * 60); }}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-bold"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* 2. Simple Calculator */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">🧮 Calculator</h4>
                    <div className="bg-slate-950 p-3 rounded-lg mb-3 text-right font-mono border border-white/10">
                        <div className="text-slate-400 text-xs h-4">{calcInput || "0"}</div>
                        <div className="text-white text-xl font-bold">{calcResult || "0"}</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['7', '8', '9', '/'].map(btn => (
                            <button key={btn} onClick={() => handleCalcInput(btn)} className="bg-white/5 hover:bg-white/10 p-2 rounded text-sm text-slate-300 transition-colors">{btn}</button>
                        ))}
                        {['4', '5', '6', '*'].map(btn => (
                            <button key={btn} onClick={() => handleCalcInput(btn)} className="bg-white/5 hover:bg-white/10 p-2 rounded text-sm text-slate-300 transition-colors">{btn}</button>
                        ))}
                        {['1', '2', '3', '-'].map(btn => (
                            <button key={btn} onClick={() => handleCalcInput(btn)} className="bg-white/5 hover:bg-white/10 p-2 rounded text-sm text-slate-300 transition-colors">{btn}</button>
                        ))}
                        {['C', '0', '=', '+'].map(btn => (
                            <button key={btn}
                                onClick={() => handleCalcInput(btn)}
                                className={`p-2 rounded text-sm text-white font-bold transition-colors ${btn === '=' ? 'bg-brand text-black' : btn === 'C' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. External Resources */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">🔗 Quick References</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="https://google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand hover:underline">
                                <span>🔍</span> Google Search
                            </a>
                        </li>
                        <li>
                            <a href="https://wikipedia.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand hover:underline">
                                <span>📚</span> Wikipedia
                            </a>
                        </li>
                        <li>
                            <a href="https://stackoverflow.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand hover:underline">
                                <span>💻</span> Stack Overflow
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudyToolsPanel;
