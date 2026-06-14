import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, UserRound, ArrowRight, Zap, Bell, CalendarDays, AlertCircle, Search, Check, ChevronDown, Hash } from 'lucide-react'
import { googleLoginUser, loginUser, clearError } from '../store/slices/authSlice'
import { signInWithGoogle } from '../services/firebaseAuth'
import api from '../services/api'
import toast from 'react-hot-toast'

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
)

const FeatureCard = ({ icon: Icon, title, desc, accent }) => (
  <div className="flex items-start gap-3 group">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
      style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
      <Icon size={16} style={{ color: accent }} />
    </div>
    <div>
      <p className="text-white text-sm font-semibold">{title}</p>
      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
)

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [form, setForm] = useState({ identifier: '', password: '', universityRollNumber: '', section: '' })
  const [showPass, setShowPass] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [sections, setSections] = useState([])
  const [sectionSearch, setSectionSearch] = useState('')
  const [sectionOpen, setSectionOpen] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)

  useEffect(() => {
    if (error && (error.toLowerCase().includes('not found') || error.toLowerCase().includes('does not exist') || error.toLowerCase().includes('user not'))) {
      setShowRegisterModal(true)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const fetchSections = async () => {
    if (sections.length > 0) return
    setLoadingSections(true)
    try {
      const { data } = await api.get('/sections', { params: { session: '2025-26' } })
      setSections(Array.isArray(data?.sections) ? data.sections : [])
    } catch (error) {
      console.error('Failed to fetch sections:', error)
      setSections([])
    } finally {
      setLoadingSections(false)
    }
  }

  const filteredSections = sections.filter(s =>
    (s?.name || '').toLowerCase().includes(sectionSearch.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(form))
  }

  const handleGoogleLogin = async () => {
    // Show modal to collect roll number and section first
    await fetchSections()
    setShowGoogleModal(true)
  }

  const handleGoogleLoginConfirm = async () => {
    if (!form.universityRollNumber || !form.section) {
      toast.error('Please select section and enter roll number')
      return
    }
    try {
      const idToken = await signInWithGoogle()
      await dispatch(googleLoginUser({
        idToken,
        universityRollNumber: form.universityRollNumber,
        section: form.section,
        session: '2025-26',
        year: '3rd Year'
      }))
      setShowGoogleModal(false)
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed')
    }
  }

  const inputClass = (field) =>
    `w-full bg-white/[0.04] border ${focusedField === field
      ? 'border-indigo-400/60 ring-2 ring-indigo-500/15'
      : 'border-white/10 hover:border-white/20'
    } rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none`

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1224 50%, #0a0f1e 100%)' }}>

      {/* Background orbs */}
      <FloatingOrb className="w-96 h-96 bg-indigo-600 -top-32 -right-32" />
      <FloatingOrb className="w-80 h-80 bg-violet-700 bottom-0 -left-40" />
      <FloatingOrb className="w-64 h-64 bg-cyan-600 top-1/2 left-1/3" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-0 items-stretch relative z-10">

        {/* ── LEFT PANEL ── */}
        <section
          className="hidden lg:flex flex-col justify-between rounded-l-3xl overflow-hidden p-10 relative"
          style={{
            background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(15,17,35,0.95) 60%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRight: 'none'
          }}>

          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-300 mb-8"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Sparkles size={12} />
              TimeTable Pro
            </div>

            <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
              Fast sign-in.<br />
              <span style={{
                background: 'linear-gradient(90deg, #818cf8, #c4b5fd, #67e8f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Live schedule.
              </span><br />
              Always ready.
            </h2>

            <p className="text-slate-400 text-sm mt-5 leading-7 max-w-xs">
              Sign in with your email, university roll number, or Google to access your timetable, reference sheets, and class alerts instantly.
            </p>

            <div className="mt-10 space-y-5">
              <FeatureCard
                icon={CalendarDays}
                accent="#818cf8"
                title="Live class schedule"
                desc="See today's classes the moment you log in — no hunting around." />
              <FeatureCard
                icon={Zap}
                accent="#c4b5fd"
                title="Reference sheet access"
                desc="Syllabus, contacts, and resources tied to your exact section." />
              <FeatureCard
                icon={Bell}
                accent="#67e8f9"
                title="Push alerts"
                desc="Substitutions and cancellations reach you before you leave home." />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                CF
              </div>
              <div>
                <p className="text-white text-sm font-semibold">TimeTable Pro</p>
                <p className="text-slate-500 text-xs">Powered by CampusFlow · Arpan Jain</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL (Form) ── */}
        <section
          className="rounded-3xl lg:rounded-l-none lg:rounded-r-3xl p-8 flex flex-col"
          style={{
            background: 'rgba(10,14,28,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)'
          }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                {isAdminMode ? 'Admin Portal' : 'Student Portal'}
              </p>
              <h1 className="text-2xl font-bold text-white mt-1.5">Welcome back</h1>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: isAdminMode ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.15)',
                border: isAdminMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(99,102,241,0.3)'
              }}>
              {isAdminMode
                ? <Shield size={20} className="text-red-400" />
                : <UserRound size={20} className="text-indigo-300" />}
            </div>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-slate-600 font-medium">or sign in with email</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">

            {/* Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Email or Roll Number
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={form.identifier}
                  onChange={e => setForm({ ...form, identifier: e.target.value })}
                  onFocus={() => setFocusedField('id')}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass('id')}
                  placeholder="student@gla.ac.in or 2315000***"
                  required />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClass('pass')} pr-11`}
                  placeholder="Your password"
                  required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Admin mode indicator */}
            {isAdminMode && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-red-300"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Shield size={13} className="text-red-400 flex-shrink-0" />
                Admin mode active — use admin credentials to proceed.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{
                background: isAdminMode
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: isAdminMode
                  ? '0 0 30px rgba(239,68,68,0.25)'
                  : '0 0 30px rgba(99,102,241,0.3)'
              }}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">
              New student?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create account
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1.5 rounded-lg"
              style={{
                color: isAdminMode ? '#f87171' : '#64748b',
                background: isAdminMode ? 'rgba(239,68,68,0.08)' : 'transparent',
                border: isAdminMode ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent'
              }}>
              <Shield size={12} />
              {isAdminMode ? 'Switch to Student' : 'Admin login'}
            </button>
          </div>
        </section>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          />

          {/* Modal */}
          <div
            className="relative rounded-3xl p-8 max-w-md w-full shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(15,17,35,0.98) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(20px)'
            }}>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.3)'
                }}>
                <AlertCircle size={32} className="text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Account Not Found
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-center text-sm leading-relaxed mb-7">
              This email or roll number isn't registered yet. Create your account on the registration page and select your section to get started.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  navigate('/register')
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 30px rgba(99,102,241,0.3)'
                }}>
                <Sparkles size={16} />
                Go to Register
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                Try Different Email
              </button>
            </div>

            {/* Footer tip */}
            <p className="text-xs text-slate-500 text-center mt-6">
              Need help? Check that your email and roll number are correct.
            </p>
          </div>
        </div>
      )}

      {/* Google Login Modal - Collect Roll Number & Section */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGoogleModal(false)}
          />

          {/* Modal */}
          <div
            className="relative rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(15,17,35,0.98) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(20px)'
            }}>
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Complete Your Profile
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              We need your university details to link your Google account.
            </p>

            {/* Form */}
            <div className="space-y-4">
              {/* Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">University Roll Number</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    value={form.universityRollNumber}
                    onChange={e => setForm({ ...form, universityRollNumber: e.target.value.toUpperCase() })}
                    onFocus={() => setFocusedField('roll')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-white/[0.04] border ${focusedField === 'roll' ? 'border-indigo-400/60 ring-2 ring-indigo-500/15' : 'border-white/10'} rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none hover:border-white/20 uppercase font-mono tracking-widest`}
                    placeholder="2315000***"
                    required
                  />
                </div>
              </div>

              {/* Section dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Section</label>
                <button
                  type="button"
                  onClick={() => setSectionOpen(!sectionOpen)}
                  className={`w-full text-left pl-4 pr-4 py-3 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${sectionOpen ? 'border-indigo-400/60 ring-2 ring-indigo-500/15' : 'border-white/10 hover:border-white/20'} bg-white/[0.04] border`}
                  style={{ color: form.section ? '#fff' : '#64748b' }}>
                  <span>{form.section || 'Pick your section'}</span>
                  <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${sectionOpen ? 'rotate-180' : ''}`} />
                </button>

                {sectionOpen && (
                  <div className="absolute z-30 w-full mt-1.5 rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: '#0d1126', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <div className="p-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={sectionSearch}
                          onChange={e => setSectionSearch(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/40"
                          placeholder="Search section..."
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-1.5">
                      {loadingSections ? (
                        <p className="text-slate-500 text-xs text-center py-4">Loading sections…</p>
                      ) : filteredSections.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-4">No sections found</p>
                      ) : filteredSections.map(sec => (
                        <button
                          key={sec._id || sec.name}
                          type="button"
                          onClick={() => { setForm({ ...form, section: sec.name }); setSectionOpen(false); setSectionSearch('') }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all duration-150 ${form.section === sec.name ? 'text-indigo-300 bg-indigo-500/15' : 'text-slate-300 hover:bg-white/5'}`}>
                          {sec.name}
                          {form.section === sec.name && <Check size={13} className="text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-7">
              <button
                onClick={handleGoogleLoginConfirm}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 30px rgba(99,102,241,0.3)'
                }}>
                <Sparkles size={16} />
                Continue with Google
              </button>

              <button
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}