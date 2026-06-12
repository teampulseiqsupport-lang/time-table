import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, GraduationCap, LayoutGrid, TrendingUp, Activity,
  Upload, CalendarDays, School, PartyPopper, UserPlus, ShieldCheck,
  ArrowUpRight, Sparkles
} from 'lucide-react'
import api from '../../services/api'

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
)

const StatCard = ({ label, value, icon: Icon, gradient, loading, trend }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} />
          {trend}
        </span>
      )}
    </div>
    {loading ? (
      <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
    ) : (
      <p className="text-3xl font-black text-white tracking-tight tabular-nums">{value}</p>
    )}
    <p className="text-slate-400 text-sm mt-1 font-medium">{label}</p>

    {/* corner glow */}
    <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`} />
  </div>
)

const ActionCard = ({ to, label, desc, icon: Icon, accent }) => (
  <Link to={to}
    className="relative overflow-hidden rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 group"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-300 ${accent}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-semibold text-sm">{label}</p>
      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
    <ArrowUpRight size={15} className="text-slate-600 group-hover:text-indigo-400 transition-colors duration-300 flex-shrink-0 mt-0.5" />
  </Link>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalSections: 0, totalSubjects: 0, totalEntries: 0 })
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))

    const tick = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(tick)
  }, [])

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'Active Sections', value: stats.totalSections, icon: GraduationCap, gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'Subjects Offered', value: stats.totalSubjects, icon: BookOpen, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Timetable Entries', value: stats.totalEntries, icon: LayoutGrid, gradient: 'from-violet-500 to-violet-600' },
  ]

  const primaryActions = [
    { to: '/admin/upload', label: 'Upload Timetable Excel', desc: 'Bulk import from spreadsheet', icon: Upload, accent: 'bg-indigo-500/10 border-indigo-400/20 text-indigo-300 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40' },
    { to: '/admin/timetable', label: 'Manage Timetable', desc: 'Add, edit, or delete entries', icon: CalendarDays, accent: 'bg-cyan-500/10 border-cyan-400/20 text-cyan-300 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40' },
    { to: '/admin/sections', label: 'Manage Sections', desc: 'Create and manage sections', icon: School, accent: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40' },
    { to: '/admin/holidays', label: 'Add Holiday', desc: 'Schedule holidays & breaks', icon: PartyPopper, accent: 'bg-amber-500/10 border-amber-400/20 text-amber-300 group-hover:bg-amber-500/20 group-hover:border-amber-400/40' },
    { to: '/admin/students', label: 'View Students', desc: 'Browse registered students', icon: Users, accent: 'bg-violet-500/10 border-violet-400/20 text-violet-300 group-hover:bg-violet-500/20 group-hover:border-violet-400/40' },
  ]

  const adminActions = [
    { to: '/admin/add-admin', label: 'Add Admin', desc: 'Create new admin user', icon: UserPlus, accent: 'bg-pink-500/10 border-pink-400/20 text-pink-300 group-hover:bg-pink-500/20 group-hover:border-pink-400/40' },
    { to: '/admin/admins', label: 'Manage Admins', desc: 'View & delete admins', icon: ShieldCheck, accent: 'bg-slate-500/10 border-slate-400/20 text-slate-300 group-hover:bg-slate-500/20 group-hover:border-slate-400/40' },
  ]

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1224 50%, #0a0f1e 100%)' }}>

      {/* Background orbs */}
      <FloatingOrb className="w-96 h-96 bg-indigo-600 -top-32 -left-32" />
      <FloatingOrb className="w-80 h-80 bg-violet-700 top-1/3 -right-40" />
      <FloatingOrb className="w-64 h-64 bg-cyan-600 bottom-0 left-1/4" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-300 mb-3"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Sparkles size={12} />
              Admin Console · 2025–26
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your institution's timetable system</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-white text-sm font-semibold">{dateStr}</p>
            <p className="text-slate-500 text-xs mt-0.5 tabular-nums">{timeStr}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => <StatCard key={card.label} {...card} loading={loading} />)}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {primaryActions.map(a => <ActionCard key={a.to} {...a} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {adminActions.map(a => <ActionCard key={a.to} {...a} />)}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <TrendingUp size={16} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Getting started</p>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                1. Go to <span className="text-indigo-300 font-semibold">Sections</span> to create sections, or they'll be auto-created on Excel upload.<br />
                2. Use <span className="text-indigo-300 font-semibold">Upload Excel</span> to bulk-import your timetable sheet.<br />
                3. Students will instantly see their schedule after logging in with their section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}