import React, { useEffect, useState } from 'react'
import { Palmtree, Plus, Trash2, X, Save, Sparkles, CalendarDays } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
)

const PANEL = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
const inputClass = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none hover:border-white/20 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/15"
const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide"

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ date: '', reason: '' })
  const [saving, setSaving] = useState(false)

  const fetchHolidays = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/holidays')
      setHolidays(data.holidays)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchHolidays() }, [])

  const handleSave = async () => {
    if (!form.date || !form.reason) return toast.error('Date and reason required')
    setSaving(true)
    try {
      await api.post('/holidays', form)
      toast.success('Holiday added')
      setModal(false)
      setForm({ date: '', reason: '' })
      fetchHolidays()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this holiday?')) return
    try {
      await api.delete(`/holidays/${id}`)
      toast.success('Holiday removed')
      fetchHolidays()
    } catch { toast.error('Failed') }
  }

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

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Palmtree size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-300 mb-1"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <Sparkles size={10} />
                {holidays.length} scheduled
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Holidays</h1>
              <p className="text-slate-400 text-sm">Schedule breaks and non-working days</p>
            </div>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
            <Plus size={16} />
            Add Holiday
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : holidays.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={PANEL}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Palmtree size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-300 font-medium">No holidays scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holidays.map(h => (
              <div key={h._id}
                className="rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{h.reason}</p>
                    <p className="text-amber-400 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(h._id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/15 transition-colors duration-150 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl p-6 animate-slide-up"
              style={{ background: 'rgba(10,14,28,0.96)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={17} className="text-amber-400" />
                  Add Holiday
                </h2>
                <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className={`${inputClass} [color-scheme:dark]`} />
                </div>
                <div>
                  <label className={labelClass}>Reason *</label>
                  <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                    className={inputClass} placeholder="e.g. Independence Day" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setModal(false)}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}