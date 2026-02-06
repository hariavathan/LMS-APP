import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
    return (
        <div className="relative w-full">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="z-10 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full lms-bg-brand/10 border lms-border-brand/20 lms-text-brand text-xs font-medium mb-6 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full lms-bg-brand opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 lms-bg-brand"></span>
                            </span>
                            Trusted by 500+ Organizations
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                            The Operating System for <span className="lms-text-brand underline decoration-brand/30 underline-offset-8" style={{ textDecorationColor: 'color-mix(in srgb, var(--primary-color), transparent 70%)' }}>Modern Learning</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
                            Aurora LMS empowers trainers to create, manage, and scale impactful learning experiences.
                            Built for security, designed for engagement, and optimized for performance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                            <Link to="/login" className="lms-btn-primary px-10 py-4 text-lg" style={{ boxShadow: '0 0 30px color-mix(in srgb, var(--primary-color), transparent 80%)' }}>
                                Start Your Journey
                            </Link>
                            <a href="#features" className="group flex items-center gap-2 text-white font-medium hover:lms-text-brand transition-colors">
                                Explore platform features
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="relative z-10 lg:block">
                        <div className="relative rounded-2xl border border-white/10 p-2 bg-white/5 backdrop-blur-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                            <img
                                src="/assets/dashboard-mockup.png"
                                alt="LMS Dashboard Preview"
                                className="rounded-xl w-full h-auto object-cover"
                            />
                            <div className="absolute -bottom-6 -left-6 lms-card p-4 flex items-center gap-4 animate-bounce-slow">
                                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-white font-bold">120% Increase</div>
                                    <div className="text-xs text-slate-400 font-medium">Student Engagement</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE CAPABILITIES (The "Creation/Management" hook) --- */}
            <section id="features" className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to <span className="lms-text-brand">Succeed</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Stop juggling multiple tools. Aurora LMS brings course creation, community management, and in-depth analytics into one beautiful interface.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Unified Dashboard",
                            desc: "Get a bird's eye view of your entire learning ecosystem. Track enrollments and revenue in real-time.",
                            icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        },
                        {
                            title: "Enterprise Roles",
                            desc: "Granular RBAC for Super Admins, Admins, and Trainers. Keep your organization secure and organized.",
                            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        },
                        {
                            title: "Advanced Analytics",
                            desc: "Export CSV reports, track course completion rates, and identify struggling students instantly.",
                            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        }
                    ].map((item, i) => (
                        <div key={i} className="lms-card p-8 group hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 lms-bg-brand rounded-xl flex items-center justify-center text-black mb-6 shadow-lg group-hover:scale-110 transition-transform" style={{ boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--primary-color), transparent 80%)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- WHY AURORA SECTION (Feature focus) --- */}
            <section className="py-24 bg-gradient-to-b from-transparent to-white/5">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="lms-card p-1">
                            <div className="bg-[#0f172a] rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                                <div className="text-center px-10">
                                    <div className="lms-btn-primary h-16 w-16 !p-0 flex items-center justify-center mx-auto mb-4 cursor-pointer scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h4 className="text-white font-bold text-lg">Watch platform tour</h4>
                                    <p className="text-slate-400 text-sm mt-2">See how our customers save 20+ hours weekly on admin tasks.</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] lms-bg-brand/10 blur-[120px] -z-10"></div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Designed for the <span className="lms-text-brand">Professional</span> Trainer</h2>
                        <div className="space-y-6">
                            {[
                                { t: "Fast Performance", d: "Pages load in under 3 seconds using our modern Vite-powered stack." },
                                { t: "Whitelabeling", d: "Upload your logo and customize learning policies to match your brand." },
                                { t: "Security First", d: "Bank-grade JWT encryption and isolated organization data." }
                            ].map((point, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 h-6 w-6 rounded-full lms-bg-brand/20 flex items-center justify-center lms-text-brand">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{point.t}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{point.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="border-t border-white/10 pt-16 pb-12 bg-[#020617]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2">
                        <div className="text-2xl font-bold lms-text-brand mb-4 tracking-tight uppercase">Aurora LMS</div>
                        <p className="text-slate-400 text-sm max-w-xs mb-6">
                            Leading the future of digital education with a focus on simplicity, security, and student success.
                        </p>
                        <div className="flex gap-4">
                            {/* Social placeholders */}
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:lms-bg-brand hover:text-black transition-all cursor-pointer">
                                <span className="text-xs font-bold">In</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:lms-bg-brand hover:text-black transition-all cursor-pointer">
                                <span className="text-xs font-bold">X</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:lms-bg-brand hover:text-black transition-all cursor-pointer">
                                <span className="text-xs font-bold">Fb</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Platform</h5>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:lms-text-brand transition">Features</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">Analytics</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Support</h5>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:lms-text-brand transition">Documentation</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">API Reference</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Company</h5>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:lms-text-brand transition">About</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:lms-text-brand transition">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
                    <div>© 2026 Aurora Learning Systems Inc. All rights reserved.</div>
                    <div className="flex gap-6">
                        <span>Accessibility</span>
                        <span>Cookies</span>
                        <span>Status</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
