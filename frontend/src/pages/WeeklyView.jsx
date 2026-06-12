import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarDays, Sparkles } from 'lucide-react'
import { fetchWeeklyTimetable } from '../store/slices/timetableSlice'
import ClassCard from '../components/dashboard/ClassCard'
import { getISTDayName } from '../utils/time'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
)

export default function WeeklyView() {
  const dispatch = useDispatch()
  const { weekly, weeklyLoading } = useSelector(s => s.timetable)
  const today = getISTDayName()

  useEffect(() => {
    dispatch(fetchWeeklyTimetable())
  }, [dispatch])

  const totalClasses = DAYS.reduce((acc, d) => acc + (weekly[d]?.length || 0), 0)

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 60%, #0a0f1e 100%)' }}>

      {/* Ambient orbs */}
      <FloatingOrb className="w-[500px] h-[500px] opacity-[0.07] bg-indigo-600 -top-40 -right-40" />
      <FloatingOrb className="w-80 h-80 opacity-[0.06] bg-violet-700 bottom-20 -left-20" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto pb-12">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4 mb-8 pt-2">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <CalendarDays size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">TimeTable Pro</p>
              <h1 className="text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">Weekly Schedule</h1>
            </div>
          </div>

          {/* Stats pill */}
          {!weeklyLoading && totalClasses > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', color: '#818cf8' }}>
              <Sparkles size={11} />
              {totalClasses} classes this week
            </div>
          )}
        </div>

        {/* ── GRID ── */}
        {weeklyLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DAYS.map(d => (
              <div
                key={d}
                className="h-64 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DAYS.map(day => {
              const classes = weekly[day] || []
              const isToday = day === today

              return (
                <div
                  key={day}
                  className="rounded-2xl p-4 flex flex-col transition-all duration-200"
                  style={{
                    background: isToday
                      ? 'linear-gradient(145deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: isToday
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.06)'
                  }}>

                  {/* Day header */}
                  <div
                    className="flex items-center justify-between mb-3 pb-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-black text-sm tracking-wide"
                        style={isToday ? {
                          background: 'linear-gradient(90deg, #818cf8, #c4b5fd)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        } : { color: '#fff' }}>
                        {day.toUpperCase()}
                      </h3>
                      {isToday && (
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Today
                        </div>
                      )}
                    </div>
                    <span
                      className="text-xs font-mono tabular-nums"
                      style={{ color: classes.length > 0 ? '#64748b' : '#334155' }}>
                      {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {/* Class list */}
                  {classes.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-slate-700 text-sm">No classes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classes.map(entry => (
                        <ClassCard key={entry._id} entry={entry} compact />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}