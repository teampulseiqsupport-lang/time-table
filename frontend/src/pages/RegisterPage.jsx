import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Check, ChevronDown, Eye, EyeOff, GraduationCap, Hash, Lock, Mail, Search, User } from 'lucide-react'
import { googleLoginUser, registerUser } from '../store/slices/authSlice'
import { signInWithGoogle } from '../services/firebaseAuth'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({
    name: '',
    email: '',
    universityRollNumber: '',
    password: '',
    section: '',
    year: '3rd Year',
    session: '2025-26'
  })
  const [showPass, setShowPass] = useState(false)
  const [sections, setSections] = useState([])
  const [sectionSearch, setSectionSearch] = useState('')
  const [sectionOpen, setSectionOpen] = useState(false)
  const [loadingSections, setLoadingSections] = useState(true)

  useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true)
      try {
        const { data } = await api.get('/sections', { params: { session: '2025-26' } })
        setSections(Array.isArray(data?.sections) ? data.sections : [])
      } catch (error) {
        console.error('Failed to fetch sections for registration:', error)
        setSections([])
      } finally {
        setLoadingSections(false)
      }
    }

    fetchSections()
  }, [])

  const filteredSections = sections.filter(s =>
    (s?.name || '').toLowerCase().includes(sectionSearch.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(registerUser(form))
  }

  const handleGoogleSignup = async () => {
    if (!form.universityRollNumber || !form.section) {
      toast.error('Select section and enter roll number before Google signup')
      return
    }

    try {
      const idToken = await signInWithGoogle()
      await dispatch(googleLoginUser({
        idToken,
        universityRollNumber: form.universityRollNumber,
        section: form.section,
        session: form.session,
        year: form.year
      }))
    } catch (error) {
      toast.error(error.message || 'Google signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[420px_1fr] gap-6 items-stretch my-6">
        <section className="glass-card p-7 sm:p-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-slate-400 text-sm">Student Registration</p>
              <h1 className="text-2xl font-bold text-white mt-1">Join CampusFlow</h1>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
              <GraduationCap size={24} className="text-cyan-300" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="Piyush Mani Tripathi" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="student@college.edu" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">University Roll Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={form.universityRollNumber} onChange={e => setForm({ ...form, universityRollNumber: e.target.value.toUpperCase() })}
                  className="input-field uppercase" placeholder="23BCS..." required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Session</label>
                <div className="input-field bg-slate-700/50 cursor-not-allowed flex items-center pl-4">2025-26</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
                <div className="input-field bg-slate-700/50 cursor-not-allowed flex items-center pl-4">3rd Year</div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Section</label>
              <button type="button" onClick={() => setSectionOpen(!sectionOpen)}
                className="input-field pl-4 flex items-center justify-between text-left">
                <span className={form.section ? 'text-white' : 'text-slate-500'}>{form.section || 'Search section'}</span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${sectionOpen ? 'rotate-180' : ''}`} />
              </button>

              {sectionOpen && (
                <div className="absolute z-20 w-full mt-1 bg-navy-800 border border-indigo-500/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-indigo-500/10">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input value={sectionSearch} onChange={e => setSectionSearch(e.target.value)}
                        className="input-field pl-8 py-2 text-sm" placeholder="Search section..." autoFocus />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-1">
                    {loadingSections ? (
                      <p className="text-slate-400 text-sm text-center py-3">Loading sections...</p>
                    ) : filteredSections.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-3">No sections found</p>
                    ) : filteredSections.map(sec => (
                      <button key={sec._id || sec.name} type="button"
                        onClick={() => { setForm({ ...form, section: sec.name }); setSectionOpen(false); setSectionSearch('') }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-indigo-500/10 ${form.section === sec.name ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-300'}`}>
                        {sec.name}
                        {form.section === sec.name && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-700/70" />
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-700/70" />
          </div>

          <button type="button" onClick={handleGoogleSignup} disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <span className="font-bold">G</span>
            Continue with Google
          </button>

          <p className="text-slate-500 text-sm mt-6 text-center">
            Already have an account? <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-medium">Sign in</Link>
          </p>
        </section>

        <section className="hidden lg:flex glass-card p-8 flex-col justify-between">
          <div>
            <p className="text-cyan-300 text-sm font-semibold">Built for 2025-26 batch</p>
            <h2 className="text-4xl font-bold text-white mt-4 leading-tight">Your roll number now works as your login ID.</h2>
            <p className="text-slate-400 mt-4 leading-7">
              Registration links your profile with section, year, session, and official uploaded timetable data.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/40 p-5">
            <p className="text-white font-semibold">Powered by CampusFlow</p>
            <p className="text-slate-500 text-sm mt-1">Developed by Arpan Jain</p>
          </div>
        </section>
      </div>
    </div>
  )
}
