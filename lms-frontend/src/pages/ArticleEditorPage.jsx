import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const ArticleEditorPage = () => {
    const { id } = useParams(); // If ID exists, it's edit mode
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "General",
        tags: "", // Comma separated string for input
        isPublished: true
    });

    useEffect(() => {
        if (id) {
            const fetchArticle = async () => {
                try {
                    const res = await axiosClient.get(`/api/articles/${id}`);
                    const art = res.data;
                    setFormData({
                        ...art,
                        tags: art.tags?.join(', ') || ""
                    });
                } catch (err) {
                    alert("Failed to load article");
                    navigate("/knowledge");
                } finally {
                    setLoading(false);
                }
            };
            fetchArticle();
        }
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            if (id) {
                await axiosClient.put(`/api/articles/${id}`, payload);
            } else {
                await axiosClient.post("/api/articles", payload);
            }
            alert("Article saved successfully!");
            navigate("/knowledge");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save article");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white font-outfit">{id ? "Edit Article" : "Write Knowledge Article"}</h1>
                    <p className="text-slate-400">Share your expertise with the organization.</p>
                </div>
                <button onClick={() => navigate("/knowledge")} className="text-slate-500 hover:text-white text-sm font-bold">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="lms-card p-8 space-y-6">
                <div>
                    <label className="lms-label">Title</label>
                    <input
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="lms-input text-lg font-bold"
                        placeholder="e.g. Best Practices for Remote Work"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="lms-label">Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="lms-input"
                        >
                            <option>General</option>
                            <option>Technical</option>
                            <option>Process</option>
                            <option>HR Policy</option>
                            <option>Sales Playbook</option>
                        </select>
                    </div>
                    <div>
                        <label className="lms-label">Tags (comma separated)</label>
                        <input
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            className="lms-input"
                            placeholder="remote, security, tips"
                        />
                    </div>
                </div>

                <div>
                    <label className="lms-label">Content (Markdown supported)</label>
                    <textarea
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        className="lms-input h-96 font-mono text-sm leading-relaxed"
                        placeholder="Start typying your article content here..."
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand focus:ring-brand"
                    />
                    <label className="text-sm text-slate-300">Publish immediately</label>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="lms-btn-primary px-10 py-3 shadow-lg shadow-brand/20"
                    >
                        {saving ? "Saving..." : (id ? "Update Article" : "Publish Article")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArticleEditorPage;
