import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CheckCheck, Clock } from 'lucide-react'
import { fetchNotifications, markAllRead } from '../store/slices/notificationSlice'

const typeColors = {
  reminder_100: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: '⏰' },
  reminder_5: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🔔' },
  room_changed: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🚪' },
  cancelled: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '❌' },
  timetable_updated: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: '📅' },
  general: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: '📢' },
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { items, loading, unreadCount } = useSelector(s => s.notifications)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const handleMarkAll = () => dispatch(markAllRead())

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bell size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 text-lg">No notifications yet</p>
          <p className="text-slate-600 text-sm mt-1">Class reminders will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(notif => {
            const style = typeColors[notif.type] || typeColors.general
            return (
              <div key={notif._id}
                className={`glass-card p-4 border ${style.border} ${style.bg} ${!notif.isRead ? 'border-l-4 border-l-indigo-500' : 'opacity-70'} transition-all`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">{notif.message}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={10} className="text-slate-600" />
                      <span className="text-slate-600 text-xs">{timeAgo(notif.sentAt)}</span>
                      {!notif.isRead && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full ml-1" />}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
