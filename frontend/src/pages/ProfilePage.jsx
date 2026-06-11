import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User, Mail, BookOpen, GraduationCap, Save, LogOut } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const SESSIONS = ['2024-25', '2025-26', '2026-27']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const [form, setForm] = useState({
    name: user?.name || '',
    section: user?.section || '',
    year: user?.year || '',
    session: user?.session || '2024-25',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <User size={20} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-500/30">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${user?.role === 'admin' ? 'badge-lab' : 'badge-theory'}`}>
              {user?.role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
            </span>
            {user?.section && <span className="badge badge-ongoing">Section {user.section}</span>}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-400" />
          Academic Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Session</label>
            <select value={form.session} onChange={e => setForm({ ...form, session: e.target.value })}
              className="input-field">
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
            <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
              className="input-field">
              <option value="">Select Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Section</label>
          <input type="text" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
            className="input-field" placeholder="e.g. 3A" />
        </div>

        <div className="pt-2 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Mail size={16} className="text-indigo-400" />
          Account
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-slate-300 text-sm font-medium">{user?.email}</p>
            <p className="text-slate-600 text-xs">Registered email</p>
          </div>
        </div>
        <div className="border-t border-indigo-500/10 pt-4 mt-4">
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
