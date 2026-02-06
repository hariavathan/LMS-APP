import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const NotesPanel = ({ lessonId, courseId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lessonId) return;
        fetchNotes();
    }, [lessonId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/api/notes/lesson/${lessonId}`);
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            const res = await axiosClient.post("/api/notes", {
                courseId,
                lessonId,
                content: newNote
            });
            setNotes([res.data, ...notes]);
            setNewNote("");
        } catch (err) {
            console.error("Failed to add note", err);
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await axiosClient.delete(`/api/notes/${id}`);
            setNotes(notes.filter(n => n._id !== id));
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    return (
        <div className="lms-card p-6 bg-slate-900/50 border-white/5 h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📝</span> My Personal Notes
            </h3>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="mb-8">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type a private note for this lesson..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none h-32"
                ></textarea>
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={!newNote.trim()}
                        className="lms-btn-primary px-6 py-2 text-xs"
                    >
                        Save Note
                    </button>
                </div>
            </form>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-slate-500 py-8">Loading notes...</div>
                ) : notes.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 border border-dashed border-white/5 rounded-2xl">
                        <p className="mb-2">No notes yet.</p>
                        <p className="text-xs">Take notes to remember key points!</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note._id} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotesPanel;
