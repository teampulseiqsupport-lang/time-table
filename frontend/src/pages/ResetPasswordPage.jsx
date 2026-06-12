import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { resetPassword } from '../store/slices/authSlice'

export default function ResetPasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading } = useSelector(s => s.auth)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    const result = await dispatch(resetPassword({ token, password }))
    if (resetPassword.fulfilled.match(result)) navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-7">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-5">
          <ShieldCheck size={22} className="text-emerald-300" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create new password</h1>
        <p className="text-slate-400 text-sm mt-2">Choose a password with at least 6 characters.</p>

        {!token ? (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
            <p className="text-red-300 font-medium">Reset token missing</p>
            <Link to="/forgot-password" className="text-cyan-300 text-sm mt-2 inline-block">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="New password"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm password"
                  minLength={6}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-300 text-xs mt-1">Passwords do not match.</p>
              )}
            </div>

            <button type="submit" disabled={loading || password !== confirmPassword} className="btn-primary w-full">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Powered by CampusFlow · Developed by Arpan Jain
        </p>
      </div>
    </div>
  )
}
