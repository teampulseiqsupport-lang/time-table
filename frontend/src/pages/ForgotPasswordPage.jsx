import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { forgotPassword } from '../store/slices/authSlice'

export default function ForgotPasswordPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)
  const [emailOrRoll, setEmailOrRoll] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(forgotPassword({ emailOrRoll }))
    if (forgotPassword.fulfilled.match(result)) setSent(true)
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 mb-5">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="glass-card p-7">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center mb-5">
            <Mail size={22} className="text-cyan-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-slate-400 text-sm mt-2">
            Enter your registered email or university roll number. We will send a secure reset link to your email.
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-emerald-300 font-medium">Check your inbox</p>
              <p className="text-slate-400 text-sm mt-1">If the account exists, a reset link has been sent. The link expires in 15 minutes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or Roll Number</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={emailOrRoll}
                    onChange={e => setEmailOrRoll(e.target.value)}
                    className="input-field"
                    placeholder="student@college.edu or 23BCS..."
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-6">
            Powered by CampusFlow · Developed by Arpan Jain
          </p>
        </div>
      </div>
    </div>
  )
}
