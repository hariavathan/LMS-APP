import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo("");
    try {
      const res = await axiosClient.post("/api/auth/forgot-password", { email });
      setInfo(res.data.message);
    } catch {
      setInfo("If this email exists, reset instructions will be sent.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="lms-card max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold text-brand mb-2">
          Forgot password
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          Enter your email to receive password reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="lms-label">Email</label>
            <input
              type="email"
              className="lms-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {info && (
            <div className="text-xs text-brand bg-black/30 border border-brand/40 rounded-md px-3 py-2">
              {info}
            </div>
          )}
          <button type="submit" className="lms-btn-primary">
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
