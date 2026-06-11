import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BookOpen, Plus, Pencil, Trash2, X, Save, Filter } from 'lucide-react'
import { fetchAllTimetable } from '../../store/slices/timetableSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TYPES = ['Theory', 'Lab', 'Lunch', 'Free']
const EMPTY = { session: '2024-25', year: '', section: '', day: 'Monday', subjectName: '', subjectCode: '', facultyName: '', room: '', block: '', startTime: '08:00 AM', endTime: '09:00 AM', type: 'Theory' }

export default function AdminTimetable() {
  const dispatch = useDispatch()
  const { allEntries } = useSelector(s => s.timetable)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState({ section: '', day: '', session: '2024-25' })

  useEffect(() => {
    dispatch(fetchAllTimetable(filter.session ? { session: filter.session } : {}))
  }, [dispatch])

  const applyFilter = () => {
    dispatch(fetchAllTimetable({ ...filter }))
  }

  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (entry) => { setForm(entry); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.subjectName || !form.section || !form.day) return toast.error('Please fill required fields')
    setSaving(true)
    try {
      if (modal === 'edit') {
        await api.put(`/timetable/${form._id}`, form)
        toast.success('Entry updated')
      } else {
        await api.post('/timetable', form)
        toast.success('Entry created')
      }
      closeModal()
      dispatch(fetchAllTimetable({ session: filter.session }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    try {
      await api.delete(`/timetable/${id}`)
      toast.success('Deleted')
      dispatch(fetchAllTimetable({ session: filter.session }))
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleCancel = async (id) => {
    const reason = prompt('Cancellation reason:')
    if (reason === null) return
    try {
      await api.post(`/timetable/${id}/cancel`, { reason })
      toast.success('Class cancelled')
      dispatch(fetchAllTimetable({ session: filter.session }))
    } catch { toast.error('Failed') }
  }

  const filtered = allEntries.filter(e =>
    (!filter.section || e.section === filter.section.toUpperCase()) &&
    (!filter.day || e.day === filter.day)
  )

  const sections = [...new Set(allEntries.map(e => e.section))].sort()

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Timetable</h1>
            <p className="text-slate-400 text-sm">{filtered.length} entries</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select value={filter.session} onChange={e => setFilter({ ...filter, session: e.target.value })}
          className="input-field w-auto">
          {['2024-25', '2025-26', '2026-27'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.section} onChange={e => setFilter({ ...filter, section: e.target.value })}
          className="input-field w-auto">
          <option value="">All Sections</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.day} onChange={e => setFilter({ ...filter, day: e.target.value })}
          className="input-field w-auto">
          <option value="">All Days</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={applyFilter} className="btn-secondary flex items-center gap-1.5">
          <Filter size={14} />
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Day</th>
                <th>Subject</th>
                <th>Code</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Time</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center text-slate-500 py-10">No entries found</td></tr>
              ) : filtered.map(entry => (
                <tr key={entry._id} className={entry.isCancelled ? 'opacity-50' : ''}>
                  <td><span className="badge badge-theory">{entry.section}</span></td>
                  <td className="text-slate-300">{entry.day}</td>
                  <td>
                    <p className="text-white font-medium text-sm">{entry.subjectName}</p>
                    {entry.isCancelled && <p className="text-red-400 text-xs">Cancelled</p>}
                  </td>
                  <td className="font-mono text-xs text-slate-400">{entry.subjectCode}</td>
                  <td className="text-slate-400 text-sm">{entry.facultyName || '—'}</td>
                  <td className="font-mono text-xs text-slate-400">
                    {entry.block ? `${entry.block}-${entry.room}` : entry.room || '—'}
                  </td>
                  <td className="font-mono text-xs text-slate-400 whitespace-nowrap">{entry.startTime}–{entry.endTime}</td>
                  <td>
                    <span className={`badge ${entry.type === 'Lab' ? 'badge-lab' : entry.type === 'Lunch' ? 'badge-lunch' : 'badge-theory'}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(entry)}
                        className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleCancel(entry._id)}
                        className="p-1.5 rounded-lg hover:bg-amber-500/20 text-slate-500 hover:text-amber-400 transition-colors text-xs">
                        ✕
                      </button>
                      <button onClick={() => handleDelete(entry._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{modal === 'add' ? 'Add' : 'Edit'} Timetable Entry</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Session *</label>
                  <select value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} className="input-field">
                    {['2024-25', '2025-26'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Section *</label>
                  <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                    className="input-field" placeholder="e.g. 3A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Day *</label>
                  <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="input-field">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Subject Name *</label>
                <input value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })}
                  className="input-field" placeholder="e.g. Java Programming" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Subject Code</label>
                  <input value={form.subjectCode} onChange={e => setForm({ ...form, subjectCode: e.target.value })}
                    className="input-field font-mono" placeholder="PCS-301" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Faculty</label>
                  <input value={form.facultyName} onChange={e => setForm({ ...form, facultyName: e.target.value })}
                    className="input-field" placeholder="Prof. Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Room</label>
                  <input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                    className="input-field" placeholder="304" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Block</label>
                  <input value={form.block} onChange={e => setForm({ ...form, block: e.target.value })}
                    className="input-field" placeholder="AB1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Time *</label>
                  <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="input-field font-mono" placeholder="08:00 AM" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">End Time *</label>
                  <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="input-field font-mono" placeholder="09:00 AM" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={closeModal} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
