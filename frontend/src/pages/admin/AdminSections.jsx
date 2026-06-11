import React, { useEffect, useState } from 'react'
import { GraduationCap, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', session: '2025-26', year: '3rd Year' })
  const [saving, setSaving] = useState(false)

  const fetchSections = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/sections', { params: { session: '2025-26' } })
      setSections(data.sections)
    } catch { toast.error('Failed to load sections') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSections() }, [])

  const openAdd = () => { setForm({ name: '', session: '2025-26', year: '3rd Year' }); setModal('add') }
  const openEdit = (sec) => { setForm(sec); setModal('edit') }

  const handleSave = async () => {
    if (!form.name || !form.session) return toast.error('Section name required')
    setSaving(true)
    try {
      if (modal === 'edit') await api.put(`/sections/${form._id}`, form)
      else await api.post('/sections', form)
      toast.success(modal === 'edit' ? 'Section updated' : 'Section created')
      setModal(null)
      fetchSections()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return
    try {
      await api.delete(`/sections/${id}`)
      toast.success('Section deleted')
      fetchSections()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <GraduationCap size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Sections</h1>
            <p className="text-slate-400 text-sm">{sections.length} active sections</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Section
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : sections.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400">No sections yet</p>
          <p className="text-slate-600 text-sm mt-1">Create sections or upload an Excel file to auto-generate them</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sections.map(sec => (
            <div key={sec._id} className="glass-card p-4 hover:border-cyan-500/30">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold text-sm">{sec.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(sec)} className="p-1 rounded-lg hover:bg-indigo-500/20 text-slate-600 hover:text-indigo-400 transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(sec._id)} className="p-1 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-white font-semibold text-sm">{sec.name}</p>
              <p className="text-slate-500 text-xs font-mono">{sec.session}</p>
              {sec.year && <p className="text-slate-600 text-xs">{sec.year}</p>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{modal === 'add' ? 'Add' : 'Edit'} Section</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Section Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })}
                  className="input-field font-mono uppercase" placeholder="e.g. 3A" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Session</label>
                <div className="input-field bg-slate-700/50 text-slate-300 font-medium cursor-not-allowed">
                  2025-26
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Year</label>
                <div className="input-field bg-slate-700/50 text-slate-300 font-medium cursor-not-allowed">
                  3rd Year
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
