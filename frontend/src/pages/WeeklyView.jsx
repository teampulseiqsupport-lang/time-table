import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarDays } from 'lucide-react'
import { fetchWeeklyTimetable } from '../store/slices/timetableSlice'
import ClassCard from '../components/dashboard/ClassCard'
import { getISTDayName } from '../utils/time'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WeeklyView() {
  const dispatch = useDispatch()
  const { weekly, weeklyLoading } = useSelector(s => s.timetable)
  const today = getISTDayName()

  useEffect(() => {
    dispatch(fetchWeeklyTimetable())
  }, [dispatch])

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <CalendarDays size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Schedule</h1>
          <p className="text-slate-400 text-sm">Your full week at a glance</p>
        </div>
      </div>

      {weeklyLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(d => <div key={d} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const classes = weekly[day] || []
            const isToday = day === today

            return (
              <div key={day} className={`glass-card p-4 ${isToday ? 'border-indigo-500/40' : ''}`}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-indigo-500/10">
                  <h3 className={`font-bold text-base ${isToday ? 'gradient-text' : 'text-white'}`}>{day}</h3>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <span className="badge badge-ongoing text-xs">Today</span>
                    )}
                    <span className="text-slate-600 text-xs">{classes.length} classes</span>
                  </div>
                </div>

                {classes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-600 text-sm">No classes</p>
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
  )
}
