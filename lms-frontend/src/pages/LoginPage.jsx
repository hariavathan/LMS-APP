import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/auth/login", form);
      onLoginSuccess(res.data);
    } catch (err) {
      console.error("Login Error details:", err);
      const msg = err.response?.data?.message || err.message || "Logic Error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] max-w-5xl w-full items-center">
        {/* Left intro / marketing panel */}
        <div className="hidden md:block">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] lms-text-brand">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise-grade learning platform
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold lms-text-brand mb-3">
            Sign in to your LMS
          </h1>
          <p className="text-sm text-slate-200 mb-6 max-w-md">
            Manage your organization, users and learning policies in one secure,
            modern workspace.
          </p>
          <ul className="space-y-2 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <span className="mt-[3px] h-1.5 w-1.5 rounded-full lms-text-brand" style={{ backgroundColor: 'var(--primary-color)' }} />
              Centralized user management with granular roles.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[3px] h-1.5 w-1.5 rounded-full lms-text-brand" style={{ backgroundColor: 'var(--primary-color)' }} />
              Organization-wide branding, logo and learning policies.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[3px] h-1.5 w-1.5 rounded-full lms-text-brand" style={{ backgroundColor: 'var(--primary-color)' }} />
              Secure, JWT-based authentication with activity tracking.
            </li>
          </ul>
        </div>

        {/* Right login card */}
        <div className="lms-card p-7 md:p-8 max-w-md w-full mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold lms-text-brand">
                Welcome back
              </h2>
              <p className="text-xs text-slate-300">
                Use your corporate email and password to continue.
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border lms-border-brand bg-black/60 flex items-center justify-center text-xs lms-text-brand font-semibold">
              LMS
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="lms-label">Email</label>
              <input
                type="email"
                name="email"
                className="lms-input"
                value={form.email}
                onChange={handleChange}
                placeholder="superadmin@lms.com"
                required
              />
            </div>
            <div>
              <label className="lms-label">Password</label>
              <input
                type="password"
                name="password"
                className="lms-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Admin@123"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900/70 text-brand"
                  style={{ color: 'var(--primary-color)' }}
                />
                Keep me signed in
              </label>
              <Link
                to="/forgot-password"
                className="lms-text-brand hover:opacity-80"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-900/30 border border-red-500/40 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full lms-btn-primary mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-[11px] text-slate-400">
            Default Super Admin:{" "}
            <span className="lms-text-brand font-medium">superadmin@lms.com</span> /{" "}
            <span className="lms-text-brand font-medium">Admin@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
