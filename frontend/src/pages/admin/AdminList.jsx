import { useEffect, useState } from "react";
import api from "../../services/api";
import { Trash2, Edit3, Shield, Sparkles, UserCog } from "lucide-react";

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

const PANEL = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' };

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
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1224 50%, #0a0f1e 100%)' }}>

      {/* Background orbs */}
      <FloatingOrb className="w-96 h-96 bg-indigo-600 -top-32 -left-32" />
      <FloatingOrb className="w-80 h-80 bg-violet-700 top-1/3 -right-40" />
      <FloatingOrb className="w-64 h-64 bg-cyan-600 bottom-0 left-1/4" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Shield size={20} className="text-indigo-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-300 mb-1"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Sparkles size={10} />
              {admins.length} {admins.length === 1 ? 'admin' : 'admins'}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Management</h1>
            <p className="text-slate-400 text-sm">View and manage system administrators</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={PANEL}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <UserCog size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-300 font-medium">No admins found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5"
                style={PANEL}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {(admin.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{admin.name}</p>
                    <p className="text-slate-400 text-xs truncate">{admin.email}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 flex-shrink-0">
                  Admin
                </span>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    className="p-2 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-cyan-500/15 transition-colors duration-150"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => deleteAdmin(admin._id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/15 transition-colors duration-150"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}