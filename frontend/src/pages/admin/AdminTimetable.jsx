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
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedSections, setSelectedSections] = useState([])

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

  const openAdd = (slot = null) => {
    const defaults = {
      ...EMPTY,
      section: filter.section || '',
      day: filter.day || 'Monday',
      startTime: slot?.start || EMPTY.startTime,
      endTime: slot?.end || EMPTY.endTime,
    }
    setForm(defaults)
    setSelectedSlots(slot ? [slot] : [])
    // Initialize selected sections based on filter
    if (filter.section) {
      setSelectedSections([filter.section])
    } else {
      setSelectedSections([])
    }
    setModal('add')
  }

  const openEdit = (entry) => { setForm(entry); setSelectedSlots([]); setSelectedSections([]); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(EMPTY); setSelectedSlots([]); setSelectedSections([]) }

  const handleSectionToggle = (sectionName) => {
    setSelectedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    )
  }

  const selectAllSections = () => {
    setSelectedSections(prev => 
      prev.length === sections.length ? [] : sections.map(s => s.name)
    )
  }

  const handleSlotToggle = (slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(item => item.start === slot.start && item.end === slot.end)
      return exists ? prev.filter(item => !(item.start === slot.start && item.end === slot.end)) : [...prev, slot]
    })
  }

  const toggleAllSlots = () => {
    setSelectedSlots(prev => (prev.length === TIME_SLOTS.length ? [] : [...TIME_SLOTS]))
  }

  const handleSave = async () => {
    // Validation
    if (!form.subjectName || !form.day) return toast.error('Please fill required fields')
    
    // For add mode: check sections selected
    if (modal === 'add' && selectedSections.length === 0) {
      return toast.error('Please select at least one section')
    }

    setSaving(true)
    try {
      if (modal === 'edit') {
        // Edit mode: single entry
        const dataToSend = {
          ...form,
          year: '3rd Year',
          session: '2025-26'
        }
        await api.put(`/timetable/${form._id}`, dataToSend)
        toast.success('Entry updated')
      } else {
        // Add mode: create entries for all selected sections and slots
        const slotsToSave = selectedSlots.length > 0 ? selectedSlots : [{ start: form.startTime, end: form.endTime }]
        
        const entriesToCreate = []
        for (const section of selectedSections) {
          for (const slot of slotsToSave) {
            entriesToCreate.push({
              ...form,
              section: section,
              year: '3rd Year',
              session: '2025-26',
              startTime: slot.start,
              endTime: slot.end,
            })
          }
        }

        // Create all entries
        await Promise.all(
          entriesToCreate.map(entry => api.post('/timetable', entry))
        )

        const totalCreated = entriesToCreate.length
        toast.success(totalCreated === 1 ? 'Entry created' : `${totalCreated} entries created for ${selectedSections.length} section(s)`)
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
            <p className="text-slate-400 text-sm">Session 2025-26 • {filtered.length} entries • {sectionList.length} sections</p>
          </div>
        </div>
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-white font-semibold">⚡ Quick Time Slot Entry</h2>
            <p className="text-slate-400 text-sm">Click any time slot or use the form below to add entries to multiple sections</p>
          </div>
          <button onClick={() => openAdd()} className="btn-secondary text-sm">Open add form</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot.label}
              type="button"
              onClick={() => openAdd(slot)}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-left transition-all hover:border-indigo-500/60 hover:bg-indigo-500/10 group"
            >
              <div className="text-xs uppercase tracking-wider font-semibold text-indigo-300 group-hover:text-indigo-200">{slot.label}</div>
              <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300">Click to open form</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
            <span className="text-xs text-slate-400 font-medium">📅 Session:</span>
            <span className="text-sm font-semibold text-slate-200">2025-26</span>
          </div>
          
          <select value={filter.section} onChange={e => setFilter({ ...filter, section: e.target.value })}
            className="input-field w-auto text-sm py-1.5">
            <option value="">📚 All Sections</option>
            {sectionList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select value={filter.day} onChange={e => setFilter({ ...filter, day: e.target.value })}
            className="input-field w-auto text-sm py-1.5">
            <option value="">📆 All Days</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <button onClick={applyFilter} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            <Filter size={14} />
            Apply Filter
          </button>
          
          {(filter.section || filter.day) && (
            <button onClick={() => setFilter({ section: '', day: '', session: '2025-26' })} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 text-slate-300 hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
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
              <div>
                <h2 className="text-lg font-bold text-white">
                  {modal === 'add' ? '➕ Add New Timetable Entry' : '✏️ Edit Timetable Entry'}
                </h2>
                {modal === 'add' && (
                  <p className="text-xs text-slate-400 mt-1">Select sections and time slots to create entries in bulk</p>
                )}
              </div>
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

              {/* Multi-Section Selection */}
              {modal === 'add' && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-300 mb-1">📚 SELECT SECTIONS *</label>
                      <p className="text-xs text-slate-400">Pick one or more sections to add this entry</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={selectAllSections}
                      className="px-2 py-1 text-xs rounded bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/50 transition-colors"
                    >
                      {selectedSections.length === sections.length ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                    {sections.map(section => (
                      <button
                        key={section._id}
                        type="button"
                        onClick={() => handleSectionToggle(section.name)}
                        className={`p-2.5 rounded-lg border-2 transition-all text-left text-sm font-medium ${
                          selectedSections.includes(section.name)
                            ? 'bg-indigo-500/40 border-indigo-400 text-indigo-100'
                            : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-indigo-400/50 hover:bg-slate-600/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-xs ${
                            selectedSections.includes(section.name)
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-slate-500'
                          }`}>
                            {selectedSections.includes(section.name) && '✓'}
                          </span>
                          {section.name}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedSections.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-indigo-400/20">
                      <p className="text-xs text-indigo-200">
                        ✓ Selected: <span className="font-semibold">{selectedSections.length} section(s)</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Single Section View for Edit Mode */}
              {modal === 'edit' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Section (Edit only)</label>
                  <div className="input-field bg-slate-700/50 text-slate-300 font-medium cursor-not-allowed">
                    {form.section}
                  </div>
                </div>
              )}

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
                <label className="block text-xs text-slate-400 mb-2 font-semibold">⏰ TIME SLOT(S) *</label>
                {modal === 'add' && (
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <button type="button" onClick={toggleAllSlots} className="btn-secondary px-2.5 py-1 text-xs">{selectedSlots.length === TIME_SLOTS.length ? 'Clear all' : 'Select all'}</button>
                    <span className="text-slate-400">
                      {selectedSlots.length > 0 ? (
                        <span className="text-indigo-300 font-semibold">{selectedSlots.length} slot(s) selected</span>
                      ) : (
                        <span>Single slot mode (one entry)</span>
                      )}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {TIME_SLOTS.map(slot => {
                    const active = selectedSlots.some(item => item.start === slot.start && item.end === slot.end)
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => modal === 'add' && handleSlotToggle(slot)}
                        disabled={modal === 'edit'}
                        className={`p-2.5 text-sm rounded-lg border-2 text-left transition-all ${
                          active
                            ? 'bg-indigo-500/30 border-indigo-500 text-indigo-100'
                            : 'border-slate-600 text-slate-400 hover:border-indigo-500/50 hover:text-slate-300'
                        } ${modal === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-semibold text-xs uppercase">{slot.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{active ? '✓ Selected' : 'Click to add'}</div>
                      </button>
                    )
                  })}
                </div>
                {modal === 'add' && (
                  <p className="text-xs text-slate-500 mt-2">📌 Select multiple slots to save the same entry across different times</p>
                )}
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
              <div className="space-y-2 pt-4 border-t border-slate-700">
                {/* Summary for Add Mode */}
                {modal === 'add' && selectedSections.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-200">📊 Creating:</p>
                    <p>• <span className="font-mono">{selectedSections.length}</span> section(s) × <span className="font-mono">{selectedSlots.length > 0 ? selectedSlots.length : 1}</span> time slot(s) = <span className="text-indigo-300 font-semibold">{selectedSections.length * (selectedSlots.length > 0 ? selectedSlots.length : 1)} total entries</span></p>
                    <p className="text-slate-400">Day: <span className="font-semibold text-slate-300">{form.day}</span></p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving || (modal === 'add' && selectedSections.length === 0)} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save size={15} />
                    {saving ? 'Saving...' : modal === 'add' ? `Create ${selectedSections.length * (selectedSlots.length > 0 ? selectedSlots.length : 1)} Entries` : 'Update'}
                  </button>
                  <button onClick={closeModal} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
