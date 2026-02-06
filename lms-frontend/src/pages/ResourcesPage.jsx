import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const ResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("All");

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/api/resources");
            setResources(res.data);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["All", ...new Set(resources.map(r => r.category))];
    const filteredResources = category === "All"
        ? resources
        : resources.filter(r => r.category === category);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black font-outfit mb-4">Digital Library</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Curated tools, books, and reference materials to accelerate your learning journey.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="h-16 w-16 bg-brand/10 rounded-2xl flex items-center justify-center text-4xl">
                            📚
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${category === cat
                                    ? 'bg-brand text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-10 w-10 border-4 border-brand border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-white/5">
                        <span className="text-4xl block mb-4">📂</span>
                        <p className="text-slate-500 text-lg">No resources found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((res) => (
                            <div key={res._id} className="group relative bg-slate-900 border border-white/5 p-6 rounded-3xl hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="text-8xl">
                                        {res.type === 'book' ? '📖' : res.type === 'video' ? '🎬' : '🛠️'}
                                    </span>
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-6 flex items-start justify-between">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-lg
                                            ${res.type === 'book' ? 'bg-blue-500/10 text-blue-500'
                                                : res.type === 'video' ? 'bg-red-500/10 text-red-500'
                                                    : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {res.type === 'book' ? '📘' : res.type === 'video' ? '▶️' : '🔧'}
                                        </div>
                                        <span className="text-[10px] uppercase font-black tracking-widest bg-white/5 px-2 py-1 rounded text-slate-400">
                                            {res.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors line-clamp-1">{res.title}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{res.description}</p>

                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all"
                                    >
                                        Access Resource <span>→</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesPage;
