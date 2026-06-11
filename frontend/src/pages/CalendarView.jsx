// CalendarView.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchTimetable } from '../store/slices/timetableSlice'
import ClassCard from '../components/dashboard/ClassCard'
import { getTodayIST } from '../utils/time'

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

  const isSelected = (day) => selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const isToday = (day) => today === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Calendar size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar View</h1>
          <p className="text-slate-400 text-sm">Browse timetable by date</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-white">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-slate-600 text-xs py-2 font-medium">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <button key={day} onClick={() => selectDate(day)}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                  isSelected(day)
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : isToday(day)
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-indigo-500/10 hover:text-white'
                }`}>
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule for selected date */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : holiday ? (
            <div className="glass-card p-6 text-center border-amber-500/20">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-amber-300 font-semibold">Holiday: {holiday}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500">No classes on this day</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {entries.map(e => <ClassCard key={e._id} entry={e} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
