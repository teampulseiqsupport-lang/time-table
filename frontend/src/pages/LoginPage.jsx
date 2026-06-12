import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, UserRound } from 'lucide-react'
import { googleLoginUser, loginUser } from '../store/slices/authSlice'
import { signInWithGoogle } from '../services/firebaseAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(form))
  }

  const handleGoogleLogin = async () => {
    try {
      const idToken = await signInWithGoogle()
      await dispatch(googleLoginUser({ idToken, session: '2025-26', year: '3rd Year' }))
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-6 items-stretch">
        <section className="hidden lg:flex glass-card p-8 flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-200 text-xs font-semibold">
              <Sparkles size={14} />
              CampusFlow Academic Suite
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white leading-tight">
              Timetable access that feels fast, clear, and student-ready.
            </h1>
            <p className="mt-4 text-slate-400 leading-7">
              Sign in with email, university roll number, or Google to see your live schedule, reference sheet, and class notifications.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Live classes', 'Reference sheet', 'Push alerts'].map(item => (
              <div key={item} className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-7 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-7">
            <div>
              <p className="text-slate-400 text-sm">{isAdminMode ? 'Admin Portal' : 'Student Portal'}</p>
              <h2 className="text-2xl font-bold text-white mt-1">Welcome back</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              {isAdminMode ? <Shield size={22} className="text-indigo-300" /> : <UserRound size={22} className="text-indigo-300" />}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or University Roll Number</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={form.identifier}
                  onChange={e => setForm({ ...form, identifier: e.target.value })}
                  className="input-field"
                  placeholder="piyush@email.com or 23BCS..."
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-cyan-300 hover:text-cyan-200">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Sparkles size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-slate-700/70" />
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-700/70" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <span className="font-bold">G</span>
            Continue with Google
          </button>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <p className="text-slate-500">
              New student? <Link to="/register" className="text-indigo-300 hover:text-indigo-200 font-medium">Create account</Link>
            </p>
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-indigo-300"
            >
              <Shield size={14} />
              {isAdminMode ? 'Student' : 'Admin'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
