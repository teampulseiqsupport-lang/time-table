// CalendarView.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, ChevronLeft, ChevronRight, Palmtree } from 'lucide-react'
import { fetchTimetable } from '../store/slices/timetableSlice'
import ClassCard from '../components/dashboard/ClassCard'
import { getTodayIST } from '../utils/time'

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
)

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarView() {
  const dispatch = useDispatch()
  const { entries, loading, holiday } = useSelector(s => s.timetable)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(getTodayIST())

  useEffect(() => {
    dispatch(fetchTimetable(selectedDate))
  }, [selectedDate, dispatch])

  const today = getTodayIST()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const selectDate = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(d)
  }

  const isSelected = (day) =>
    selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const isToday = (day) =>
    today === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const selectedLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', month: 'short', day: 'numeric'
  })
  const classCount = entries.length

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 60%, #0a0f1e 100%)' }}>

      {/* Ambient orbs */}
      <FloatingOrb className="w-[480px] h-[480px] opacity-[0.07] bg-indigo-600 -top-40 -right-40" />
      <FloatingOrb className="w-72 h-72 opacity-[0.06] bg-violet-700 bottom-10 -left-20" />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative z-10 p-4 lg:p-6 max-w-6xl mx-auto pb-12 overflow-y-auto h-screen">

        {/* ── HEADER ── */}
        <div className="flex items-center gap-4 mb-8 pt-2">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Calendar size={20} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">TimeTable Pro</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white mt-0.5 tracking-tight">Calendar View</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── CALENDAR CARD ── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Month navigator */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 text-slate-500 hover:text-indigo-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ChevronLeft size={15} />
              </button>
              <h2 className="font-black text-white text-sm tracking-wide uppercase">
                {monthName}
              </h2>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 text-slate-500 hover:text-indigo-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-2 uppercase tracking-widest"
                  style={{ color: d === 'Su' || d === 'Sa' ? '#334155' : '#475569' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const selected = isSelected(day)
                const todayCell = isToday(day)

                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    className="aspect-square rounded-xl text-sm font-bold transition-all duration-150 relative flex items-center justify-center"
                    style={
                      selected
                        ? {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            boxShadow: '0 0 16px rgba(99,102,241,0.4)'
                          }
                        : todayCell
                        ? {
                            background: 'rgba(99,102,241,0.15)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.35)'
                          }
                        : {
                            color: '#64748b'
                          }
                    }
                    onMouseEnter={e => {
                      if (!selected && !todayCell) {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                        e.currentTarget.style.color = '#fff'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected && !todayCell) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#64748b'
                      }
                    }}>
                    {day}
                    {todayCell && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── SCHEDULE PANEL ── */}
          <div className="flex flex-col gap-3">

            {/* Selected date label */}
            <div
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
              <span className="text-white font-bold text-sm">{selectedLabel}</span>
              {!loading && !holiday && classCount > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                  {classCount} {classCount === 1 ? 'class' : 'classes'}
                </span>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : holiday ? (
              <div
                className="rounded-2xl p-8 flex flex-col items-center text-center"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}>
                <Palmtree size={28} className="text-amber-400 mb-3" />
                <p className="text-amber-300 font-bold text-base">Holiday</p>
                <p className="text-amber-400/60 text-sm mt-1">{holiday}</p>
              </div>
            ) : entries.length === 0 ? (
              <div
                className="rounded-2xl p-10 flex flex-col items-center text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-4xl mb-3">😴</span>
                <p className="text-white font-semibold">No classes</p>
                <p className="text-slate-500 text-sm mt-1">Nothing scheduled on this day</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent', overflowX: 'hidden' }}>
                {entries.map(e => <ClassCard key={e._id} entry={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView