import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function AdminPage({ auth }) {
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "learner"
  });
  const [message, setMessage] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [search, setSearch] = useState("");

  // Delete confirm modal state
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    userId: null,
    userName: ""
  });

  const role = auth?.user?.role;
  const isAdminOrSuper = role === "admin" || role === "super_admin";

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token || !isAdminOrSuper) return;
      try {
        const res = await axiosClient.get("/api/users");
        setUsers(res.data);
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [auth, isAdminOrSuper]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setCreating(true);
      const res = await axiosClient.post("/api/users", form);
      setUsers((prev) => [res.data, ...prev]);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "learner"
      });
      setMessage("User created successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      const res = await axiosClient.patch(`/api/users/${id}/status`, {
        isActive: !current
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id || u.id === id
            ? { ...u, isActive: res.data.isActive }
            : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Open delete confirm modal
  const askDelete = (id, name) => {
    setConfirmDelete({ open: true, userId: id, userName: name || "" });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!confirmDelete.userId) return;
    try {
      await axiosClient.delete(`/api/users/${confirmDelete.userId}`);
      setUsers((prev) =>
        prev.filter(
          (u) =>
            u._id !== confirmDelete.userId && u.id !== confirmDelete.userId
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setConfirmDelete({ open: false, userId: null, userName: "" });
    }
  };

  // Close modal
  const closeConfirm = () => {
    setConfirmDelete({ open: false, userId: null, userName: "" });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = filterRole === "all" ? true : u.role === filterRole;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? u.isActive
            : !u.isActive;

      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, filterRole, statusFilter, search]);

  if (!auth?.token) {
    return <div className="text-center mt-10">Please login to view users.</div>;
  }
  if (!isAdminOrSuper) {
    return (
      <div className="text-center mt-10">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Create user card - Fixed to 4 columns on large screens */}
        <div className="lg:col-span-4 w-full">
          <div className="lms-card p-8 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold lms-text-brand mb-2">
              Create user
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Super Admin can create any role. Admin can create only Trainer and
              Learner accounts.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="lms-label">Full name</label>
                <input
                  name="name"
                  placeholder="John Doe"
                  className="lms-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="lms-label">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="lms-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="lms-label">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="lms-input"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="lms-label">Role</label>
                <select
                  name="role"
                  className="lms-input"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="learner">Learner</option>
                  <option value="trainer">Trainer</option>
                  {role === "super_admin" && <option value="admin">Admin</option>}
                  {role === "super_admin" && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>

              {message && (
                <div className="text-xs lms-text-brand bg-brand/10 border lms-border-brand/30 rounded-xl px-4 py-3">
                  {message}
                </div>
              )}

              <button type="submit" disabled={creating} className="lms-btn-primary w-full py-3">
                {creating ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-400">
              <span className="lms-text-brand font-bold mr-1">Tip:</span>
              Use strong passwords and unique emails for each user to ensure account security.
            </div>
          </div>
        </div>

        {/* Users Overview Section - Fixed to 8 columns on large screens */}
        <div className="lg:col-span-8 w-full space-y-6">
          <div className="lms-card p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold lms-text-brand">Users overview</h2>
                <p className="text-sm text-slate-400 mt-1">Manage and monitor all accounts in your organization.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "super_admin", "admin", "trainer", "learner"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFilterRole(r)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${filterRole === r
                      ? "bg-brand text-black border-brand shadow-lg shadow-brand/20"
                      : "bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
                      }`}
                  >
                    {r === "all" ? "All Roles" : r.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <QuickStat label="Total Users" value={users.length} color="brand" />
              <QuickStat label="Admins" value={users.filter(u => u.role === "admin").length} color="sky" />
              <QuickStat label="Trainers" value={users.filter(u => u.role === "trainer").length} color="emerald" />
              <QuickStat label="Learners" value={users.filter(u => u.role === "learner").length} color="slate" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-full border border-white/5">
                {["all", "active", "inactive"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${statusFilter === s
                      ? "bg-brand text-black shadow-md shadow-brand/20"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="lms-input !rounded-full pl-10 h-10 text-xs"
                />
                <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Action</th>
                    <th className="text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => {
                    const id = u._id || u.id;
                    const canDelete = auth.user?.role === "super_admin" && u.role !== "super_admin";
                    const canToggle = auth.user?.role === "super_admin" || (auth.user?.role === "admin" && u.role !== "admin" && u.role !== "super_admin");

                    return (
                      <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{u.name}</span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <RoleBadge role={u.role} />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-400">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                        </td>
                        <td>
                          {canToggle && (
                            <button
                              onClick={() => toggleActive(id, u.isActive)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${u.isActive
                                ? "bg-slate-900/60 text-slate-300 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                : "bg-brand/10 text-brand border-brand/20 hover:bg-brand hover:text-black"
                                }`}
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </td>
                        <td className="text-right">
                          {canDelete && (
                            <button
                              onClick={() => askDelete(id, u.name)}
                              className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all mx-auto lg:ml-auto lg:mr-0 group"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-4 opacity-20">🔍</div>
                  <p className="text-sm text-slate-500">No users found for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={closeConfirm} />
          <div className="relative lms-card max-w-sm w-full p-8 border border-red-500/20 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl mb-6">
              !
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">{confirmDelete.userName}</span>? This action is permanent and cannot be reversed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={closeConfirm} className="lms-btn-secondary py-3">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full shadow-lg shadow-red-500/20 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    super_admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    admin: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    trainer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    learner: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[role] || styles.learner}`}>
      {role.replace("_", " ")}
    </span>
  );
}

function QuickStat({ label, value, color }) {
  const colors = {
    brand: "text-brand",
    sky: "text-sky-400",
    emerald: "text-emerald-400",
    slate: "text-slate-400"
  };
  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
      <div className={`text-xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{label}</div>
    </div>
  );
}
