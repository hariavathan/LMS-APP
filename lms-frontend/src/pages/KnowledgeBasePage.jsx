import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const KnowledgeBasePage = ({ auth }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await axiosClient.get(`/api/articles?search=${searchTerm}`);
                setArticles(res.data);
            } catch (err) {
                console.error("Failed to load articles", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchArticles, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const canCreate = auth?.user?.role === 'trainer' || auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white font-outfit">Knowledge Hub</h1>
                    <p className="text-slate-400">Explore articles, guides, and resources.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => navigate("/knowledge/create")}
                        className="lms-btn-primary px-6 py-3 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)]"
                    >
                        + Write Article
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="lms-input pl-12 h-14 text-lg"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">🔍</span>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-900 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => (
                        <Link
                            to={`/knowledge/${article._id}`}
                            key={article._id}
                            className="lms-card p-0 group hover:border-brand/40 transition-all flex flex-col h-full overflow-hidden"
                        >
                            <div className="h-32 bg-slate-800 relative overflow-hidden">
                                {article.thumbnail ? (
                                    <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-900/50">
                                        💡
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                        {article.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                                    {article.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                </p>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    <span>By {article.author?.name || 'Unknown'}</span>
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {articles.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="text-6xl text-slate-800">📚</div>
                            <h3 className="text-xl font-bold text-white">No articles found</h3>
                            <p className="text-slate-500">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KnowledgeBasePage;
