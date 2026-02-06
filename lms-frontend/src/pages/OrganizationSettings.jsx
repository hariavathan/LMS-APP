import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function OrganizationSettings({ auth }) {
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    primaryColor: "#eab308",
    learningPolicy: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isAdminOrSuper =
    auth?.user?.role === "admin" || auth?.user?.role === "super_admin";

  useEffect(() => {
    const fetchOrg = async () => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const res = await axiosClient.get("/api/organization/current");
        if (res.data) {
          setForm({
            name: res.data.name || "",
            logoUrl: res.data.logoUrl || "",
            primaryColor: res.data.primaryColor || "#eab308",
            learningPolicy: res.data.learningPolicy || ""
          });
        }
      } catch (err) {
        console.error("Fetch org error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [auth]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdminOrSuper) return;
    setMessage("");
    try {
      setSaving(true);
      const res = await axiosClient.post("/api/organization", form);
      setMessage("Organization settings saved.");
      setForm({
        name: res.data.name || "",
        logoUrl: res.data.logoUrl || "",
        primaryColor: res.data.primaryColor || "#eab308",
        learningPolicy: res.data.learningPolicy || ""
      });
      // Optionally reload page to apply global styles, or use a context update
      window.location.reload();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to save organization settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!auth?.token) {
    return <div className="text-center mt-10">Please login to view this page.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="lms-card p-6">
        <h1 className="text-2xl font-semibold lms-text-brand mb-2">
          Organization &amp; Settings
        </h1>
        <p className="text-xs text-slate-300 mb-4">
          Configure your organization identity, logo, and learning policies. These
          settings are visible across the platform.
        </p>

        {loading ? (
          <p className="text-sm text-slate-300">Loading organization settings...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="lms-label">Organization name</label>
              <input
                type="text"
                name="name"
                className="lms-input"
                value={form.name}
                onChange={handleChange}
                disabled={!isAdminOrSuper}
                required
              />
            </div>

            <div>
              <label className="lms-label">Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                className="lms-input"
                value={form.logoUrl}
                onChange={handleChange}
                disabled={!isAdminOrSuper}
                placeholder="https://example.com/logo.png"
              />
              {form.logoUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden border lms-border-brand/60 bg-black/60">
                    <img
                      src={form.logoUrl}
                      alt="Organization logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-slate-300">
                    Logo preview as seen in navigation.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="lms-label">Theme Primary Color</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="color"
                  name="primaryColor"
                  className="h-10 w-20 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                  value={form.primaryColor}
                  onChange={handleChange}
                  disabled={!isAdminOrSuper}
                />
                <input
                  type="text"
                  name="primaryColor"
                  className="lms-input !w-32"
                  value={form.primaryColor}
                  onChange={handleChange}
                  disabled={!isAdminOrSuper}
                />
                <span className="text-xs text-slate-400 italic">
                  * This will update the main branding color platform-wide.
                </span>
              </div>
            </div>

            <div>
              <label className="lms-label">Learning policy</label>
              <textarea
                name="learningPolicy"
                className="lms-input min-h-[110px]"
                value={form.learningPolicy}
                onChange={handleChange}
                disabled={!isAdminOrSuper}
                placeholder="Example: All employees must complete onboarding courses within 30 days."
              />
            </div>

            {message && (
              <div className="text-xs lms-text-brand bg-black/30 border lms-border-brand/40 rounded-md px-3 py-2">
                {message}
              </div>
            )}

            {isAdminOrSuper ? (
              <button
                type="submit"
                disabled={saving}
                className="lms-btn-primary"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                Only Admin / Super Admin can edit organization settings; you have
                read-only access.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
