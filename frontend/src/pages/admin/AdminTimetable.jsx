import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BookOpen, Plus, Pencil, Trash2, X, Save, Filter } from 'lucide-react'
import { fetchAllTimetable } from '../../store/slices/timetableSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TYPES = ['Theory', 'Lab', 'Lunch', 'Free']
const TIME_SLOTS = [
  { label: '08:00 AM - 09:00 AM', start: '08:00 AM', end: '09:00 AM' },
  { label: '09:00 AM - 10:00 AM', start: '09:00 AM', end: '10:00 AM' },
  { label: '10:00 AM - 11:00 AM', start: '10:00 AM', end: '11:00 AM' },
  { label: '11:00 AM - 12:00 PM', start: '11:00 AM', end: '12:00 PM' },
  { label: '12:00 PM - 01:00 PM', start: '12:00 PM', end: '01:00 PM' },
  { label: '01:00 PM - 02:00 PM', start: '01:00 PM', end: '02:00 PM' },
  { label: '02:00 PM - 03:00 PM', start: '02:00 PM', end: '03:00 PM' },
  { label: '03:00 PM - 04:00 PM', start: '03:00 PM', end: '04:00 PM' },
]

const EMPTY = { session: '2025-26', year: '3rd Year', section: '', day: 'Monday', subjectName: '', subjectCode: '', facultyName: '', room: '', block: '', startTime: '08:00 AM', endTime: '09:00 AM', type: 'Theory' }

export default function AdminTimetable() {
  const dispatch = useDispatch()
  const { allEntries } = useSelector(s => s.timetable)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState({ section: '', day: '', session: '2025-26' })
  const [sections, setSections] = useState([])

  useEffect(() => {
    dispatch(fetchAllTimetable({ session: '2025-26' }))
    fetchSections()
  }, [dispatch])

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/sections', { params: { session: '2025-26' } })
      setSections(data.sections || [])
    } catch (err) {
      console.error('Failed to fetch sections:', err)
    }
  }

  const applyFilter = () => {
    dispatch(fetchAllTimetable({ ...filter }))
  }

  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (entry) => { setForm(entry); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(EMPTY) }

  const handleSlotChange = (slot) => {
    setForm({ ...form, startTime: slot.start, endTime: slot.end })
  }

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
      dispatch(fetchAllTimetable({ session: '2025-26' }))
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
      dispatch(fetchAllTimetable({ session: '2025-26' }))
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
      dispatch(fetchAllTimetable({ session: '2025-26' }))
    } catch { toast.error('Failed') }
  }

  const filtered = allEntries.filter(e =>
    (!filter.section || e.section === filter.section) &&
    (!filter.day || e.day === filter.day)
  )

  const sectionList = [...new Set(allEntries.map(e => e.section))].sort()

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
            <p className="text-slate-400 text-sm">Session 2025-26 • {filtered.length} entries</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="input-field bg-slate-700/50 text-slate-300 font-medium">
          2025-26
        </div>
        <select value={filter.section} onChange={e => setFilter({ ...filter, section: e.target.value })}
          className="input-field w-auto">
          <option value="">All Sections</option>
          {sectionList.map(s => <option key={s} value={s}>{s}</option>)}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{modal === 'add' ? 'Add' : 'Edit'} Timetable Entry</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Session & Year - Locked */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* Section Dropdown */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Section *</label>
                <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                  className="input-field">
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              {/* Day Selection - Monday to Friday only */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Day *</label>
                <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}
                  className="input-field">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Time Slot *</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => handleSlotChange(slot)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        form.startTime === slot.start && form.endTime === slot.end
                          ? 'bg-indigo-500/30 border-indigo-500 text-indigo-200'
                          : 'border-slate-600 text-slate-400 hover:border-indigo-500/50 hover:text-slate-300'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subject Name *</label>
                <input value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })}
                  className="input-field" placeholder="e.g. Java Programming" />
              </div>

              {/* Subject Code & Faculty */}
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

              {/* Room & Block */}
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

              {/* Type Selection */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
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
