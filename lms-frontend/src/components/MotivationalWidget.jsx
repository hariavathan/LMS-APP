import { useEffect, useState } from 'react';

const MotivationalWidget = ({ auth }) => {
    const [quote, setQuote] = useState('');
    const [streak, setStreak] = useState(0);
    const [achievements, setAchievements] = useState([]);

    const motivationalQuotes = [
        "The expert in anything was once a beginner.",
        "Learning is a treasure that will follow its owner everywhere.",
        "Education is the passport to the future.",
        "The beautiful thing about learning is that no one can take it away from you.",
        "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        "An investment in knowledge pays the best interest.",
        "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Don't watch the clock; do what it does. Keep going.",
        "The only way to do great work is to love what you do."
    ];

    useEffect(() => {
        // Random quote on mount
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setQuote(randomQuote);

        // Simulate streak (in real app, fetch from backend)
        const savedStreak = localStorage.getItem('learningStreak') || 0;
        setStreak(parseInt(savedStreak));

        // Simulate achievements
        setAchievements([
            { id: 1, name: 'First Steps', icon: '🎯', unlocked: true, description: 'Complete your first lesson' },
            { id: 2, name: 'Dedicated Learner', icon: '📚', unlocked: streak >= 3, description: '3-day learning streak' },
            { id: 3, name: 'Knowledge Seeker', icon: '🔍', unlocked: false, description: 'Complete 5 courses' },
            { id: 4, name: 'Quiz Master', icon: '🏆', unlocked: false, description: 'Pass 10 quizzes' },
        ]);
    }, []);

    return (
        <div className="lms-card p-6 space-y-6 border-l-4 border-brand">
            {/* Motivational Quote */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Daily Inspiration</h3>
                </div>
                <p className="text-white text-lg font-medium italic leading-relaxed">
                    "{quote}"
                </p>
            </div>

            {/* Learning Streak */}
            <div className="bg-gradient-to-r from-brand/10 to-transparent p-4 rounded-xl border border-brand/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Learning Streak</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-brand">{streak}</span>
                            <span className="text-sm text-slate-300">days</span>
                        </div>
                    </div>
                    <div className="text-4xl">🔥</div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {streak === 0 ? "Start your learning journey today!" :
                        streak < 7 ? "Keep it up! You're building momentum!" :
                            "Amazing dedication! You're on fire! 🚀"}
                </p>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Achievements</h4>
                <div className="grid grid-cols-2 gap-2">
                    {achievements.map(achievement => (
                        <div
                            key={achievement.id}
                            className={`p-3 rounded-lg border transition-all ${achievement.unlocked
                                    ? 'bg-brand/5 border-brand/30 hover:border-brand/50'
                                    : 'bg-slate-900/50 border-white/5 opacity-50'
                                }`}
                            title={achievement.description}
                        >
                            <div className="text-2xl mb-1 filter" style={{ filter: achievement.unlocked ? 'none' : 'grayscale(1)' }}>
                                {achievement.icon}
                            </div>
                            <p className={`text-[10px] font-bold leading-tight ${achievement.unlocked ? 'text-white' : 'text-slate-600'
                                }`}>
                                {achievement.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Weekly Goal</span>
                    <span className="text-brand font-bold">4/7 days</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand to-yellow-500 rounded-full transition-all duration-500" style={{ width: '57%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">3 more days to reach your weekly goal!</p>
            </div>
        </div>
    );
};

export default MotivationalWidget;
