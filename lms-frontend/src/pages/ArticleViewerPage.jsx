import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const ArticleViewerPage = ({ auth }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await axiosClient.get(`/api/articles/${id}`);
                setArticle(res.data);
            } catch (err) {
                console.error("Failed to load article", err);
                navigate("/knowledge");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full"></div>
        </div>
    );

    if (!article) return null;

    const canEdit = auth?.user?._id === article.author?._id ||
        auth?.user?.role === 'trainer' ||
        auth?.user?.role === 'admin' ||
        auth?.user?.role === 'super_admin';

    // Simple markdown-like rendering for basic line breaks
    const renderContent = (text) => {
        return text.split('\n').map((line, i) => (
            <p key={i} className="mb-4 leading-relaxed">{line}</p>
        ));
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-8 px-4 sm:px-6">
            <button onClick={() => navigate("/knowledge")} className="text-slate-500 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors mb-8 group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Knowledge Hub
            </button>

            <article className="animate-in fade-in duration-700">
                {/* Header Section */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="bg-brand text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.5)]">
                            {article.category}
                        </span>
                        {/* Premium Badge */}
                        <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                            <span>💎</span> Premium Insight
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight leading-tight mb-8">
                        {article.title}
                    </h1>

                    <div className="flex items-center justify-center gap-8 text-sm text-slate-400 border-y border-white/5 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-brand border border-white/10">
                                {article.author?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold">{article.author?.name || 'Editorial Team'}</p>
                                <p className="text-[10px] uppercase tracking-wider">Author</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="text-left">
                            <p className="text-white font-bold">{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-[10px] uppercase tracking-wider">Published</p>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div className="text-left">
                            <p className="text-white font-bold text-serif italic">5 min read</p>
                        </div>
                    </div>
                </header>

                {/* Content Section */}
                <div className="bg-slate-900 border border-white/5 p-8 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50"></div>

                    {/* Access Edit */}
                    {canEdit && (
                        <div className="absolute top-4 right-4 print:hidden">
                            <button
                                onClick={() => navigate(`/knowledge/${article._id}/edit`)}
                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10 backdrop-blur-sm"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    )}

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:font-serif prose-p:text-slate-300 prose-p:leading-8 prose-li:text-slate-300">
                        {renderContent(article.content)}
                    </div>

                    {/* Footer Tags */}
                    {article.tags?.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-2">
                            {article.tags.map((tag, i) => (
                                <span key={i} className="text-slate-500 text-sm italic">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </article>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                .font-serif { font-family: 'Playfair Display', serif; }
            `}</style>
        </div>
    );
};

export default ArticleViewerPage;
