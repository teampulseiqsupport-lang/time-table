import React, { useEffect, useState } from 'react'
import { Users, BookOpen, GraduationCap, LayoutGrid, TrendingUp, Activity } from 'lucide-react'
import api from '../../services/api'
import { Link } from "react-router-dom"
export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalSections: 0, totalSubjects: 0, totalEntries: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'Sections', value: stats.totalSections, icon: GraduationCap, color: 'cyan', gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Timetable Entries', value: stats.totalEntries, icon: LayoutGrid, color: 'violet', gradient: 'from-violet-500 to-violet-600' },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your institution's timetable system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="stat-card group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-white">
              {loading ? <span className="skeleton inline-block w-12 h-8 rounded" /> : value}
            </p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/admin/upload', label: 'Upload Timetable Excel', emoji: '📤', desc: 'Bulk import from spreadsheet' },
            { href: '/admin/timetable', label: 'Manage Timetable', emoji: '📅', desc: 'Add, edit, or delete entries' },
            { href: '/admin/sections', label: 'Manage Sections', emoji: '🏫', desc: 'Create and manage sections' },
            { href: '/admin/holidays', label: 'Add Holiday', emoji: '🎉', desc: 'Schedule holidays & breaks' },
            { href: '/admin/students', label: 'View Students', emoji: '👥', desc: 'Browse registered students' },
          ].map(({ href, label, emoji, desc }) => (
            <a key={href} href={href}
              className="glass-card p-4 hover:border-indigo-500/40 cursor-pointer block">
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
            </a>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">

  <a href="/admin/add-admin"
    className="glass-card p-4 hover:border-indigo-500/40 cursor-pointer block">
    <div className="text-2xl mb-2">➕</div>
    <p className="text-white font-medium text-sm">Add Admin</p>
    <p className="text-slate-500 text-xs mt-0.5">Create new admin user</p>
  </a>

  <a href="/admin/admins"
    className="glass-card p-4 hover:border-indigo-500/40 cursor-pointer block">
    <div className="text-2xl mb-2">👮</div>
    <p className="text-white font-medium text-sm">Manage Admins</p>
    <p className="text-slate-500 text-xs mt-0.5">View & delete admins</p>
  </a>

</div>
      </div>

      {/* Info */}
      <div className="glass-card p-5 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-start gap-3">
          <TrendingUp size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">Getting Started</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              1. Go to <strong className="text-indigo-400">Sections</strong> to create sections, or they'll be auto-created on Excel upload.<br />
              2. Use <strong className="text-indigo-400">Upload Excel</strong> to bulk-import your timetable sheet.<br />
              3. Students will instantly see their schedule after logging in with their section.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
