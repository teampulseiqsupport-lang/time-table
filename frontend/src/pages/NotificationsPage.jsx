import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CheckCheck, Clock } from 'lucide-react'
import { fetchNotifications, markAllRead } from '../store/slices/notificationSlice'

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
)

const typeStyles = {
  reminder_100: { orb: '#06b6d4', border: 'rgba(6,182,212,0.2)',  bg: 'rgba(6,182,212,0.06)',  dot: '#22d3ee', icon: '⏰' },
  reminder_5:   { orb: '#f97316', border: 'rgba(249,115,22,0.2)', bg: 'rgba(249,115,22,0.06)', dot: '#fb923c', icon: '🔔' },
  room_changed: { orb: '#eab308', border: 'rgba(234,179,8,0.2)',  bg: 'rgba(234,179,8,0.06)',  dot: '#facc15', icon: '🚪' },
  cancelled:    { orb: '#ef4444', border: 'rgba(239,68,68,0.2)',  bg: 'rgba(239,68,68,0.06)',  dot: '#f87171', icon: '❌' },
  timetable_updated: { orb: '#6366f1', border: 'rgba(99,102,241,0.2)', bg: 'rgba(99,102,241,0.06)', dot: '#818cf8', icon: '📅' },
  general:      { orb: '#64748b', border: 'rgba(100,116,139,0.2)', bg: 'rgba(100,116,139,0.06)', dot: '#94a3b8', icon: '📢' },
}

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { items, loading, unreadCount } = useSelector(s => s.notifications)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const handleMarkAll = () => dispatch(markAllRead())

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 60%, #0a0f1e 100%)' }}>

      {/* Ambient orbs */}
      <FloatingOrb className="w-[420px] h-[420px] opacity-[0.07] bg-indigo-600 -top-32 -right-32" />
      <FloatingOrb className="w-64 h-64 opacity-[0.05] bg-violet-700 bottom-10 -left-16" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 lg:p-6 max-w-3xl mx-auto pb-12 overflow-y-auto h-screen">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between gap-4 mb-8 pt-2">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Bell size={20} className="text-indigo-400" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">TimeTable Pro</p>
              <h1 className="text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">Notifications</h1>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:opacity-80 flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', color: '#a5b4fc' }}>
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* ── BODY ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>

        ) : items.length === 0 ? (
          <div
            className="rounded-2xl p-14 flex flex-col items-center text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Bell size={28} className="text-indigo-700" />
            </div>
            <p className="text-white font-bold text-lg">You're all caught up</p>
            <p className="text-slate-500 text-sm mt-1.5">Class reminders and updates will appear here</p>
          </div>

        ) : (
          <div className="space-y-2">
            {items.map(notif => {
              const s = typeStyles[notif.type] || typeStyles.general
              return (
                <div
                  key={notif._id}
                  className="rounded-2xl p-4 flex items-start gap-3.5 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: notif.isRead ? 'rgba(255,255,255,0.02)' : s.bg,
                    border: `1px solid ${notif.isRead ? 'rgba(255,255,255,0.05)' : s.border}`,
                    opacity: notif.isRead ? 0.65 : 1,
                  }}>

                  {/* Unread left accent bar */}
                  {!notif.isRead && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                      style={{ background: s.dot }} />
                  )}

                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{
                      background: `${s.orb}15`,
                      border: `1px solid ${s.orb}25`
                    }}>
                    {s.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="font-bold text-sm leading-snug"
                        style={{ color: notif.isRead ? '#94a3b8' : '#fff' }}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ background: s.dot }} />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock size={10} className="text-slate-600" />
                      <span className="text-slate-600 text-xs font-mono">{timeAgo(notif.sentAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}