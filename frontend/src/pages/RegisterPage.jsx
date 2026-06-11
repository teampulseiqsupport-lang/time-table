import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, User, Search, GraduationCap, ChevronDown, Check } from 'lucide-react'
import { registerUser } from '../store/slices/authSlice'
import api from '../services/api'

const SESSIONS = ['2024-25', '2025-26', '2026-27']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function RegisterPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', section: '', year: '3rd Year', session: '2025-26' })
  const [showPass, setShowPass] = useState(false)
  const [sections, setSections] = useState([])
  const [sectionSearch, setSectionSearch] = useState('')
  const [sectionOpen, setSectionOpen] = useState(false)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await api.get('/sections', { params: { session: '2025-26' } })
        setSections(data.sections || [])
      } catch {}
    }
    fetchSections()
  }, [])

  const filteredSections = sections.filter(s =>
    s.name.toLowerCase().includes(sectionSearch.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(registerUser(form))
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Join TimeTable Pro</h1>
          <p className="text-slate-400">Create your student account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="Name" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="Email" required />
              </div>
            </div>

            {/* Session + Year (Fixed for 3rd Year 2025-26) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Session</label>
                <div className="input-field bg-slate-700/50 cursor-not-allowed flex items-center">
                  <span className="text-slate-300 font-medium">2025-26</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
                <div className="input-field bg-slate-700/50 cursor-not-allowed flex items-center">
                  <span className="text-slate-300 font-medium">3rd Year</span>
                </div>
              </div>
            </div>

            {/* Section dropdown with search */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Section</label>
              <button type="button" onClick={() => setSectionOpen(!sectionOpen)}
                className="input-field flex items-center justify-between text-left">
                <span className={form.section ? 'text-white' : 'text-slate-500'}>
                  {form.section || 'Search Section...'}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${sectionOpen ? 'rotate-180' : ''}`} />
              </button>

              {sectionOpen && (
                <div className="absolute z-20 w-full mt-1 bg-navy-800 border border-indigo-500/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-indigo-500/10">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={sectionSearch} onChange={e => setSectionSearch(e.target.value)}
                        className="input-field pl-8 py-2 text-sm" placeholder="Search section..." autoFocus />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-1">
                    {filteredSections.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-3">No sections found</p>
                    ) : filteredSections.map(sec => (
                      <button key={sec._id} type="button"
                        onClick={() => { setForm({ ...form, section: sec.name }); setSectionOpen(false); setSectionSearch('') }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-indigo-500/10 transition-colors ${form.section === sec.name ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}>
                        {sec.name}
                        {form.section === sec.name && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" placeholder="Password (min 6)" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
