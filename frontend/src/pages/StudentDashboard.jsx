import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, ChevronLeft, ChevronRight, Palmtree, BookOpen, Zap, Sparkles, Clock, MapPin, User2 } from 'lucide-react'
import { fetchTimetable } from '../store/slices/timetableSlice'
import { getGreeting, getOngoingEntry, getUpcomingEntry, formatDate, getTodayIST, minutesUntilClass } from '../utils/time'
import ClassCard from '../components/dashboard/ClassCard'
import CountdownTimer from '../components/dashboard/CountdownTimer'
import DayArc from '../components/dashboard/DayArc'

// ── tiny helpers ──────────────────────────────────────────────

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
)

const StatPill = ({ label, value, accent }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
    style={{ background: `${accent}15`, border: `1px solid ${accent}25`, color: accent }}>
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
    {value} {label}
  </div>
)

// ── main component ────────────────────────────────────────────

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
  const classCount = entries.filter(e => e.type !== 'Free').length

  const scheduleChip = showRealtimeStatus
    ? ongoingClass
      ? { label: 'Live now', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#34d399', dot: true }
      : upcomingClass
        ? { label: 'Next class soon', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#818cf8', dot: false }
        : classCount > 0
          ? { label: 'All done', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.15)', color: '#94a3b8', dot: false }
          : { label: 'Free day', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', dot: false }
    : isPastDate
      ? { label: 'Past schedule', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.15)', color: '#94a3b8', dot: false }
      : { label: 'Planned', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: '#818cf8', dot: false }

  const changeDate = (delta) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setSelectedDate(`${y}-${m}-${day}`)
  }

  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 60%, #0a0f1e 100%)' }}>

      {/* ambient orbs — subtle, behind all content */}
      <FloatingOrb className="w-[500px] h-[500px] opacity-[0.07] bg-indigo-600 -top-40 -right-40" />
      <FloatingOrb className="w-80 h-80 opacity-[0.06] bg-violet-700 bottom-20 -left-20" />

      {/* dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 lg:p-6 max-w-6xl mx-auto space-y-6 pb-12 overflow-y-auto h-screen">

        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">

          {/* Greeting */}
          <div>
            <p className="text-slate-500 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white mt-1 tracking-tight">
              {firstName}
              <span
                className="ml-2 text-2xl lg:text-3xl"
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>👋</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatPill label="Section" value={user?.section || '—'} accent="#818cf8" />
              {user?.session && (
                <StatPill label="" value={user.session} accent="#67e8f9" />
              )}
              {classCount > 0 && isToday && (
                <StatPill label="classes today" value={classCount} accent="#34d399" />
              )}
            </div>
          </div>

          {/* Date Navigator */}
          <div
            className="flex items-center gap-1 rounded-2xl p-1.5 self-start sm:self-auto flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => changeDate(-1)}
              className="p-2 rounded-xl transition-all duration-150 hover:bg-indigo-500/15 text-slate-500 hover:text-indigo-400">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-2">
              <Calendar size={13} className="text-indigo-400 flex-shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer w-32"
              />
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-xl transition-all duration-150 hover:bg-indigo-500/15 text-slate-500 hover:text-indigo-400">
              <ChevronRight size={16} />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getTodayIST())}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 ml-0.5"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                Today
              </button>
            )}
          </div>
        </div>

        {/* ── HOLIDAY BANNER ───────────────────────────────── */}
        {holiday && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(251,191,36,0.12)' }}>
              <Palmtree size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-amber-300 text-base">No classes today</p>
              <p className="text-amber-400/60 text-sm mt-0.5">🎉 {holiday}</p>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        {!holiday && (
          <>
            {/* Live status row */}
            {showRealtimeStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <DayArc />

                {/* Ongoing class */}
                {ongoingClass ? (
                  <div
                    className="rounded-2xl p-5 sm:col-span-1 lg:col-span-2 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 100%)',
                      border: '1px solid rgba(16,185,129,0.25)'
                    }}>
                    {/* glow accent */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20"
                      style={{ background: '#10b981' }} />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="pulse-dot" />
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live right now</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black text-white truncate">{ongoingClass.subjectName}</h2>
                          {ongoingClass.subjectCode && (
                            <p className="text-slate-500 text-xs font-mono mt-0.5">({ongoingClass.subjectCode})</p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                            <span className="flex items-center gap-1.5 text-emerald-400/80 text-sm font-mono">
                              <Clock size={13} />
                              {ongoingClass.startTime} — {ongoingClass.endTime}
                            </span>
                            {ongoingClass.room && (
                              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <MapPin size={13} />
                                {ongoingClass.block ? `${ongoingClass.block}-${ongoingClass.room}` : ongoingClass.room}
                              </span>
                            )}
                            {ongoingClass.facultyName && (
                              <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                                <User2 size={13} />
                                {ongoingClass.facultyName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-4xl opacity-15 flex-shrink-0">📚</div>
                      </div>
                    </div>
                  </div>

                ) : upcomingClass ? (
                  <div
                    className="rounded-2xl p-5 sm:col-span-1 lg:col-span-2 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)',
                      border: '1px solid rgba(99,102,241,0.22)'
                    }}>
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-15"
                      style={{ background: '#6366f1' }} />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={13} className="text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Up next</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black text-white truncate">{upcomingClass.subjectName}</h2>
                          <p className="text-indigo-300/70 text-sm mt-1 font-mono">
                            Starts in {minutesUntilClass(upcomingClass)} min
                          </p>
                          {upcomingClass.room && (
                            <span className="flex items-center gap-1.5 text-slate-400 text-sm mt-2">
                              <MapPin size={13} />
                              {upcomingClass.block ? `${upcomingClass.block}-${upcomingClass.room}` : upcomingClass.room}
                            </span>
                          )}
                        </div>
                        <div className="text-4xl opacity-15 flex-shrink-0">⏰</div>
                      </div>
                    </div>
                  </div>

                ) : entries.length > 0 ? (
                  <div
                    className="rounded-2xl p-5 sm:col-span-1 lg:col-span-2 flex flex-col items-center justify-center text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-white font-semibold">All done for today</p>
                    <p className="text-slate-500 text-sm mt-1">Enjoy your evening</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Countdown */}
            {showRealtimeStatus && upcomingClass && !ongoingClass && (
              <CountdownTimer nextClass={upcomingClass} />
            )}

            {/* ── SCHEDULE LIST ───────────────────────────── */}
            <div>
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <BookOpen size={15} className="text-indigo-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {isToday ? "Today's" : formatDate(selectedDate).split(',')[0] + "'s"} Schedule
                  </h2>
                  {/* Status chip */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: scheduleChip.bg, border: `1px solid ${scheduleChip.border}`, color: scheduleChip.color }}>
                    {scheduleChip.dot && (
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                        style={{ background: scheduleChip.color }} />
                    )}
                    {scheduleChip.label}
                  </div>
                </div>
                {classCount > 0 && (
                  <span className="text-slate-600 text-xs font-mono tabular-nums">{classCount} classes</span>
                )}
              </div>

              {/* List body */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div
                  className="rounded-2xl p-14 flex flex-col items-center text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-5xl mb-4">😴</span>
                  <p className="text-white font-semibold text-lg">No classes scheduled</p>
                  <p className="text-slate-500 text-sm mt-1.5">
                    {isToday ? 'You have a free day — make it count.' : 'Nothing on this day.'}
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
    </div>
  )
}