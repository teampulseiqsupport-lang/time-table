import { useState } from "react";
import api from "../../services/api";

export default function AddAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/create-admin", form);
      alert("✅ Admin Created Successfully");

      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert("❌ Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-6 rounded-2xl shadow-xl border border-indigo-500/20">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Add New Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create access for system administrator
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-slate-300">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter admin name"
              className="w-full mt-1 p-3 rounded-xl bg-slate-900/40 border border-slate-700 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              className="w-full mt-1 p-3 rounded-xl bg-slate-900/40 border border-slate-700 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create strong password"
              className="w-full mt-1 p-3 rounded-xl bg-slate-900/40 border border-slate-700 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-white 
            bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>

        </form>
      </div>
    </div>
  );
}