import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const CertificatesPage = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await axiosClient.get("/api/certificates");
                setCertificates(res.data);
            } catch (err) {
                console.error("Failed to load certificates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-white font-outfit">My Certificates</h1>
                <p className="text-slate-400">View and download your earned credentials.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-64 bg-slate-900 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map(cert => (
                        <div key={cert._id} className="lms-card p-0 group overflow-hidden border border-white/5 hover:border-brand/50 transition-all">
                            <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xl backdrop-blur-sm border border-white/10">
                                    🏆
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-brand tracking-widest mb-1">Professional Certificate</p>
                                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                                        {cert.courseTitle || cert.courseId?.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6 bg-black/20">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-xs text-slate-500">
                                        <span className="block mb-0.5">Issued on</span>
                                        <span className="text-slate-300 font-bold">{new Date(cert.issueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-right">
                                        <span className="block mb-0.5 text-slate-500">ID</span>
                                        <span className="font-mono text-slate-300 tracking-wider">
                                            {cert.certificateCode.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    to={`/certificates/${cert._id}`}
                                    className="block w-full text-center py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all"
                                >
                                    View Certificate →
                                </Link>
                            </div>
                        </div>
                    ))}

                    {certificates.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="text-6xl grayscale opacity-50">🏅</div>
                            <h3 className="text-xl font-bold text-white">No certificates yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Complete courses to earn professional certificates and showcase your skills.
                            </p>
                            <Link to="/courses" className="inline-block mt-4 lms-btn-primary px-8 py-3">
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CertificatesPage;
