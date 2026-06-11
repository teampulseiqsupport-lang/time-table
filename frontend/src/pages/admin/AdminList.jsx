import { useEffect, useState } from "react";
import api from "../../services/api";
import { Trash2, Edit3, Shield } from "lucide-react";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/admins")
      .then(res => setAdmins(res.data.admins))
      .finally(() => setLoading(false));
  }, []);

  const deleteAdmin = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this admin?");
    if (!confirm) return;

    try {
      await api.delete(`/admin/delete-admin/${id}`);
      setAdmins(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert("Error deleting admin");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-indigo-400" size={22} />
          Admin Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          View and manage system administrators
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-slate-400">Loading admins...</div>
      ) : admins.length === 0 ? (
        <div className="text-slate-400">No admins found</div>
      ) : (
        <div className="grid gap-4">

          {admins.map((admin) => (
            <div
              key={admin._id}
              className="glass-card p-4 flex items-center justify-between rounded-xl border border-slate-700 hover:border-indigo-500/40 transition"
            >

              {/* Left */}
              <div>
                <p className="text-white font-medium">
                  {admin.name}
                </p>
                <p className="text-slate-400 text-sm">
                  {admin.email}
                </p>
              </div>

              {/* Role Badge */}
              <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Admin
              </span>

              {/* Actions */}
              <div className="flex gap-2">

                <button
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  <Edit3 size={16} className="text-cyan-400" />
                </button>

                <button
                  onClick={() => deleteAdmin(admin._id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}