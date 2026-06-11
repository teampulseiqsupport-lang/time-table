import React, { useEffect, useState } from 'react'
import { Palmtree, Plus, Trash2, X, Save } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

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
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Palmtree size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Holidays</h1>
            <p className="text-slate-400 text-sm">{holidays.length} scheduled</p>
          </div>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Holiday
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : holidays.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Palmtree size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400">No holidays scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holidays.map(h => (
            <div key={h._id} className="glass-card p-4 flex items-center justify-between border-amber-500/15">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎉</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{h.reason}</p>
                  <p className="text-amber-400 text-xs font-mono mt-0.5">
                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(h._id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add Holiday</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason *</label>
                <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="input-field" placeholder="e.g. Independence Day" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
