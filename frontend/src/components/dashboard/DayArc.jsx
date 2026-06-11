import React, { useState, useEffect } from 'react'
import { getISTTime } from '../../utils/time'

export default function DayArc() {
  const [time, setTime] = useState(getISTTime())

  useEffect(() => {
    const interval = setInterval(() => setTime(getISTTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Day progress (6 AM to 10 PM = 16 hours)
  const dayStart = 6 * 60
  const dayEnd = 22 * 60
  const currentMins = hours * 60 + minutes
  const progress = Math.min(1, Math.max(0, (currentMins - dayStart) / (dayEnd - dayStart)))

  const size = 120
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * progress

  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">IST Time</p>
      
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="5" />
          {/* Progress arc */}
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }}
          />
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-white font-bold font-mono text-xl leading-none">
            {String(displayHour).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
          </p>
          <p className="text-indigo-400 text-xs font-mono mt-0.5">{ampm}</p>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-slate-500 text-xs">{Math.round(progress * 100)}% of day passed</p>
      </div>
    </div>
  )
}
