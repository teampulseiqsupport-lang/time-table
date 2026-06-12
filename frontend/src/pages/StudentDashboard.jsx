import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, ChevronLeft, ChevronRight, Palmtree, BookOpen, Zap } from 'lucide-react'
import { fetchTimetable } from '../store/slices/timetableSlice'
import { getGreeting, getOngoingEntry, getUpcomingEntry, formatDate, getTodayIST, minutesUntilClass } from '../utils/time'
import ClassCard from '../components/dashboard/ClassCard'
import CountdownTimer from '../components/dashboard/CountdownTimer'
import DayArc from '../components/dashboard/DayArc'

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { entries, loading, holiday, currentDate, showRealtimeStatus } = useSelector(s => s.timetable)
  const [selectedDate, setSelectedDate] = useState(getTodayIST())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    dispatch(fetchTimetable(selectedDate))
  }, [selectedDate, dispatch])

  useEffect(() => {
    if (!showRealtimeStatus) return undefined
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [showRealtimeStatus])

  const ongoingClass = useMemo(
    () => showRealtimeStatus ? getOngoingEntry(entries) : null,
    [entries, tick, showRealtimeStatus]
  )
  const upcomingClass = useMemo(
    () => showRealtimeStatus ? getUpcomingEntry(entries) : null,
    [entries, tick, showRealtimeStatus]
  )

  const isToday = selectedDate === getTodayIST()
  const isPastDate = selectedDate < getTodayIST()

  const changeDate = (delta) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setSelectedDate(`${y}-${m}-${day}`)
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-0.5">
            {user?.name?.split(' ')[0]} <span className="gradient-text">👋</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-theory text-xs">
              Section {user?.section || 'Not set'}
            </span>
            {user?.session && (
              <span className="text-slate-600 text-xs font-mono">{user.session}</span>
            )}
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 glass-card p-2 rounded-xl self-start sm:self-auto">
          <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar size={14} className="text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors">
            <ChevronRight size={18} />
          </button>
          {!isToday && (
            <button onClick={() => setSelectedDate(getTodayIST())}
              className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors ml-1">
              Today
            </button>
          )}
        </div>
      </div>

      {/* Holiday Banner */}
      {holiday && (
        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Palmtree size={24} className="text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-amber-300 text-lg">No Classes Today</p>
            <p className="text-amber-400/70 text-sm">🎉 Holiday: {holiday}</p>
          </div>
        </div>
      )}

      {/* Reference Timetable Section */}

      {!holiday && (
        <>
          {/* Live status row */}
          {showRealtimeStatus && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DayArc />

              {/* Ongoing */}
              {ongoingClass ? (
                <div className="ongoing-card p-5 sm:col-span-1 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="pulse-dot" />
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Ongoing Now</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{ongoingClass.subjectName}</h2>
                      {ongoingClass.subjectCode && (
                        <p className="text-slate-400 text-sm font-mono">({ongoingClass.subjectCode})</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-emerald-400/80 text-sm font-mono">{ongoingClass.startTime} — {ongoingClass.endTime}</span>
                        {ongoingClass.room && (
                          <span className="badge badge-ongoing">{ongoingClass.block ? `${ongoingClass.block}-${ongoingClass.room}` : ongoingClass.room}</span>
                        )}
                      </div>
                      {ongoingClass.facultyName && (
                        <p className="text-slate-500 text-sm mt-1">Faculty: {ongoingClass.facultyName}</p>
                      )}
                    </div>
                    <div className="text-4xl opacity-20">📚</div>
                  </div>
                </div>
              ) : upcomingClass ? (
                <div className="glass-card p-5 sm:col-span-1 lg:col-span-2 border-cyan-500/20 bg-cyan-500/4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Up Next</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{upcomingClass.subjectName}</h2>
                      <p className="text-cyan-400/80 text-sm mt-1 font-mono">
                        Starts in {minutesUntilClass(upcomingClass)} minutes
                      </p>
                      {upcomingClass.room && (
                        <span className="badge badge-upcoming mt-2 inline-block">
                          {upcomingClass.block ? `${upcomingClass.block}-${upcomingClass.room}` : upcomingClass.room}
                        </span>
                      )}
                    </div>
                    <div className="text-4xl opacity-20">⏰</div>
                  </div>
                </div>
              ) : entries.length > 0 ? (
                <div className="glass-card p-5 sm:col-span-1 lg:col-span-2 text-center">
                  <p className="text-slate-400 text-lg mb-1">✅ All classes for today are done!</p>
                  <p className="text-slate-600 text-sm">Enjoy your evening</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Countdown */}
          {showRealtimeStatus && upcomingClass && !ongoingClass && (
            <CountdownTimer nextClass={upcomingClass} />
          )}

          {/* Timetable */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">
                  {isToday ? "Today's" : formatDate(selectedDate).split(',')[0] + "'s"} Schedule
                </h2>
              </div>
              <span className="text-slate-500 text-sm">{entries.filter(e => e.type !== 'Free').length} classes</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-6xl mb-4">😴</p>
                <p className="text-slate-300 text-lg font-medium">No classes scheduled</p>
                <p className="text-slate-500 text-sm mt-1">
                  {isToday ? "You have a free day today!" : "No classes on this day"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map(entry => (
                  <ClassCard
                    key={entry._id}
                    entry={entry}
                    showRealtimeStatus={showRealtimeStatus}
                    forceCompleted={isPastDate}
                    showProgress={showRealtimeStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
