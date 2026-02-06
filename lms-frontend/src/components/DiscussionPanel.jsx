import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const DiscussionPanel = ({ lessonId, courseId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null); // { id, name }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lessonId) return;
        fetchComments();
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/api/comments/lesson/${lessonId}`);
            setComments(buildCommentTree(res.data));
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoading(false);
        }
    };

    // Organize flat list into tree for threading
    const buildCommentTree = (flatComments) => {
        const map = {};
        const roots = [];

        flatComments.forEach((c) => {
            map[c._id] = { ...c, replies: [] };
        });

        flatComments.forEach((c) => {
            if (c.parentId) {
                if (map[c.parentId]) {
                    map[c.parentId].replies.push(map[c._id]);
                }
            } else {
                roots.push(map[c._id]);
            }
        });

        return roots;
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await axiosClient.post("/api/comments", {
                courseId,
                lessonId,
                content: newComment,
                parentId: replyTo?.id
            });

            // Optimistic update - refetch is cleaner for tree
            await fetchComments();
            setNewComment("");
            setReplyTo(null);
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axiosClient.delete(`/api/comments/${id}`);
            await fetchComments();
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const CommentItem = ({ comment, isReply = false }) => (
        <div className={`group ${isReply ? 'ml-8 md:ml-12 mt-3 pl-4 border-l-2 border-white/5' : 'mb-6'}`}>
            <div className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border 
                    ${comment.userId.role === 'trainer'
                        ? 'bg-brand text-black border-brand'
                        : comment.userId.role === 'admin' || comment.userId.role === 'super_admin'
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                    {comment.userId.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-white/5 hover:border-brand/20 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${comment.userId.role === 'trainer' ? 'text-brand' : 'text-white'}`}>
                                    {comment.userId.name}
                                </span>
                                {comment.userId.role === 'trainer' && (
                                    <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                        Instructor
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => setReplyTo({ id: comment._id, name: comment.userId.name })}
                            className="text-[10px] font-bold text-slate-500 hover:text-brand transition-colors uppercase tracking-wider"
                        >
                            Reply
                        </button>
                        {(currentUser?._id === comment.userId._id || currentUser?.role !== 'learner') && (
                            <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-[10px] font-bold text-slate-600 hover:text-red-500 transition-colors uppercase tracking-wider"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {comment.replies?.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply._id} comment={reply} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="lms-card p-6 bg-slate-900/50 border-white/5 h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>💬</span> Class Discussion
            </h3>

            {/* Input */}
            <form onSubmit={handlePostComment} className="mb-8 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                {replyTo && (
                    <div className="flex items-center justify-between mb-2 text-xs text-brand bg-brand/5 p-2 rounded-lg">
                        <span>Replying to <strong>{replyTo.name}</strong></span>
                        <button type="button" onClick={() => setReplyTo(null)} className="hover:text-white">✕</button>
                    </div>
                )}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? "Write your reply..." : "Ask a question or share a thought..."}
                    className="w-full bg-transparent border-none p-0 text-white focus:ring-0 placeholder-slate-600 resize-none h-20 text-sm"
                ></textarea>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500">Be respectful and professional</span>
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="lms-btn-primary px-4 py-1.5 text-xs"
                    >
                        {replyTo ? "Post Reply" : "Post Comment"}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-slate-500 py-8">Loading discussions...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                        <span className="text-3xl mb-3 opacity-50">💭</span>
                        <p>No discussions yet.</p>
                        <p className="text-xs mt-1">Be the first to start a conversation!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscussionPanel;
