import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const CertificateViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState("gold"); // "gold", "dark", "royal"

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const res = await axiosClient.get(`/api/certificates/${id}`);
                setCertificate(res.data);
            } catch (err) {
                console.error("Failed to load certificate", err);
                navigate("/my-courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id, navigate]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full"></div>
        </div>
    );

    if (!certificate) return null;

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 flex flex-col items-center">
            {/* Action Bar */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 print:hidden">
                <button onClick={() => navigate("/my-courses")} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                    ← Back to Dashboard
                </button>
                <div className="flex gap-2">
                    {["gold", "dark", "royal"].map(t => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${theme === t ? 'bg-brand text-black border-brand' : 'bg-slate-800 text-slate-400 border-white/10 hover:border-white/20'}`}
                        >
                            {t}
                        </button>
                    ))}
                    <button
                        onClick={handlePrint}
                        className="bg-brand hover:bg-brand-dark text-black px-8 py-3 rounded-full font-bold shadow-lg shadow-brand/20 transition-all flex items-center gap-2 ml-4"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>

            {/* Certificate Container - Dynamic Themes */}
            <div className={`certificate-container theme-${theme} w-full max-w-[1100px] aspect-[1.414/1] bg-white text-slate-900 relative shadow-2xl overflow-hidden print:shadow-none print:w-full print:h-screen print:absolute print:top-0 print:left-0 flex flex-col items-center justify-center p-12 border-[20px] border-double`}>

                {/* Background Textures & Watermarks */}
                <div className="absolute inset-4 border border-[#cfb53b]"></div>
                <div className="absolute inset-6 border-[2px] border-[#cfb53b]/30"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.2]"></div>

                {/* Center Watermark SVG */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <svg width="600" height="600" viewBox="0 0 200 200" fill="currentColor">
                        <path d="M100 20 L120 70 L170 70 L130 100 L145 150 L100 120 L55 150 L70 100 L30 70 L80 70 Z" />
                    </svg>
                </div>

                {/* Corner Ornaments */}
                <div className="absolute top-8 left-8 w-24 h-24 border-t-8 border-l-8 border-[#cfb53b] rounded-tl-lg opacity-40"></div>
                <div className="absolute top-8 right-8 w-24 h-24 border-t-8 border-r-8 border-[#cfb53b] rounded-tr-lg opacity-40"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 border-b-8 border-l-8 border-[#cfb53b] rounded-bl-lg opacity-40"></div>
                <div className="absolute bottom-8 right-8 w-24 h-24 border-b-8 border-r-8 border-[#cfb53b] rounded-br-lg opacity-40"></div>

                {/* Header Content */}
                <div className="mb-10 text-center z-10">
                    <div className="flex justify-center mb-6">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-lg">
                            <circle cx="50" cy="50" r="45" fill="#1e293b" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#cfb53b" strokeWidth="2" />
                            <path d="M30 45 L50 30 L70 45 L70 65 L50 80 L30 65 Z" fill="#cfb53b" />
                            <text x="50" y="58" fontSize="20" textAnchor="middle" fill="#1e293b" fontWeight="bold">LMS</text>
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold tracking-[0.3em] text-slate-800 uppercase font-serif drop-shadow-sm">OFFICIAL CERTIFICATION</h2>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent to-[#cfb53b]"></div>
                        <span className="text-[#cfb53b] font-serif italic text-lg tracking-widest px-4">Level of Excellence</span>
                        <div className="w-20 h-0.5 bg-gradient-to-l from-transparent to-[#cfb53b]"></div>
                    </div>
                </div>

                {/* Main Text Content */}
                <div className="text-center space-y-8 max-w-4xl z-10 px-8">
                    <p className="text-2xl text-slate-500 font-serif italic">This prestigious award is presented to</p>

                    <div className="relative inline-block px-12 pb-2 mb-2">
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 font-serif leading-tight tracking-tight uppercase">
                            {certificate.learnerName}
                        </h1>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#cfb53b] to-transparent"></div>
                    </div>

                    <p className="text-xl text-slate-500 font-serif">for the exceptional completion of the professional curriculum in</p>

                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 font-serif tracking-tight px-6 py-3 border-y border-slate-100 italic bg-slate-50/50">
                        {certificate.courseTitle}
                    </h2>

                    <div className="flex flex-col items-center gap-2 pt-4">
                        <p className="text-sm text-slate-400 font-serif max-w-2xl leading-relaxed uppercase tracking-[0.2em]">
                            Accredited & Validated by the Aurora Learning Institute
                        </p>
                    </div>
                </div>

                {/* Signature and Seal Section */}
                <div className="w-full grid grid-cols-3 items-center mt-12 px-16 z-10">
                    <div className="text-center relative">
                        {/* Antigravity Signature */}
                        <div className="font-signature text-6xl text-slate-800 mb-[-10px] select-none transform -rotate-2 drop-shadow-sm">
                            Antigravity
                        </div>
                        <div className="h-px w-full bg-slate-300 mb-3"></div>
                        <p className="text-[12px] font-bold uppercase tracking-widest text-[#cfb53b]">Lead AI Architect</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Certifying Official</p>
                    </div>

                    <div className="flex flex-col items-center relative">
                        {/* Professional Seal */}
                        <div className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                                <defs>
                                    <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                                </defs>
                                <circle cx="50" cy="50" r="48" fill="#cfb53b" />
                                <circle cx="50" cy="50" r="42" fill="white" stroke="#cfb53b" strokeWidth="1" />
                                <text fontSize="8" fill="#1e293b" fontWeight="bold">
                                    <textPath href="#circlePath" startOffset="0%">
                                        • AURORA LEARNING MANAGEMENT SYSTEM • VERIFIED PROFESSIONAL •
                                    </textPath>
                                </text>
                                <g transform="translate(25, 25) scale(0.5)">
                                    <path d="M50 10 L65 35 L90 40 L70 60 L75 85 L50 70 L25 85 L30 60 L10 40 L35 35 Z" fill="#cfb53b" />
                                    <path d="M50 20 L60 40 L80 44 L64 57 L68 76 L50 66 L32 76 L36 57 L20 44 L40 40 Z" fill="#1e293b" />
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-black text-slate-800 font-serif mb-2">
                            {new Date(certificate.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="h-px w-full bg-slate-300 mb-3"></div>
                        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Date of Issue</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Global Certification</p>
                    </div>
                </div>

                {/* Verification Footer */}
                <div className="absolute bottom-6 left-0 right-0 px-12 flex justify-between items-end opacity-60">
                    <div className="text-[10px] font-mono tracking-tighter text-slate-400 space-y-1">
                        <p>VERIFICATION CODE: {certificate.certificateCode}</p>
                        <p>VERIFY AT: {window.location.origin}/verify/{certificate.certificateCode}</p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-slate-100 rounded-lg scale-0 group-hover:scale-100 transition-transform -z-10"></div>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`}
                            alt="Verification QR"
                            className="w-16 h-16 mix-blend-multiply border-4 border-white"
                        />
                    </div>
                </div>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
                    
                    .font-serif { font-family: 'Playfair Display', serif; }
                    .font-signature { font-family: 'Alex Brush', cursive; }
                    
                    /* Theme Styles */
                    .theme-gold { border-color: #1e293b; --accent: #cfb53b; --secondary: #1e293b; }
                    .theme-dark { border-color: #0f172a; --accent: #38bdf8; --secondary: #0f172a; background: #020617; color: white; }
                    .theme-royal { border-color: #4c1d95; --accent: #f59e0b; --secondary: #1e1b4b; background: white; color: #1e1b4b; }
                    
                    .theme-dark .text-slate-900, .theme-dark .text-slate-800, .theme-dark .text-slate-500 { color: #f8fafc; }
                    .theme-dark .text-slate-500 { opacity: 0.7; }
                    .theme-dark .bg-slate-50\\/50 { background: rgba(255,255,255,0.05); }
                    .theme-dark border-slate-100 { border-color: rgba(255,255,255,0.1); }
                    
                    .theme-gold .text-accent { color: #cfb53b; }
                    .theme-dark .text-accent { color: #38bdf8; }
                    .theme-royal .text-accent { color: #f59e0b; }
                    
                    @media print {
                        @page { size: landscape; margin: 0; }
                        body { background: white !important; -webkit-print-color-adjust: exact; }
                        .print\\:hidden { display: none !important; }
                        .print\\:shadow-none { box-shadow: none !important; }
                        .print\\:w-full { width: 100vw !important; height: 100vh !important; }
                        .print\\:absolute { position: absolute !important; top: 0 !important; left: 0 !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default CertificateViewPage;
