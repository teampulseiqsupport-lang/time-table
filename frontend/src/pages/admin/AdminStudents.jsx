import React, { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import api from '../../services/api'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/students')
      .then(({ data }) => setStudents(data.students || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.section || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Users size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-slate-400 text-sm">{students.length} registered</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9" placeholder="Search by name, email, section..." />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Section</th>
                <th>Year</th>
                <th>Session</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10">
                  <div className="flex justify-center">
                    <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-slate-500 py-10">No students found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id}>
                  <td className="text-slate-600 text-xs">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm">{s.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400 text-sm">{s.email}</td>
                  <td>
                    {s.section ? <span className="badge badge-theory">{s.section}</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="text-slate-400 text-sm">{s.year || '—'}</td>
                  <td className="font-mono text-xs text-slate-500">{s.session || '—'}</td>
                  <td className="text-slate-500 text-xs">
                    {new Date(s.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
