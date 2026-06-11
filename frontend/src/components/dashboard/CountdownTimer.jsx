import React, { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { getISTTime, timeToMinutes, formatCountdown, minutesUntilClass } from '../../utils/time'

export default function CountdownTimer({ nextClass }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const compute = () => {
      if (!nextClass) return setSeconds(0)
      const now = getISTTime()
      const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      const startMins = timeToMinutes(nextClass.startTime)
      const startSecs = startMins * 60
      const diff = startSecs - currentSecs
      setSeconds(Math.max(0, diff))
    }
    compute()
    const interval = setInterval(compute, 1000)
    return () => clearInterval(interval)
  }, [nextClass])

  if (!nextClass) return null

  const mins = minutesUntilClass(nextClass)

  return (
    <div className="glass-card p-5 border-cyan-500/20 bg-cyan-500/4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Timer size={16} className="text-cyan-400" />
        </div>
        <p className="text-slate-300 text-sm font-medium">Next Class Starts In</p>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold font-mono tracking-wider text-white">
          {formatCountdown(seconds)
            .split(':')
            .map((part, i) => (
              <React.Fragment key={i}>
                <span className="gradient-text">{part}</span>
                {i < 2 && <span className="text-slate-600 mx-1">:</span>}
              </React.Fragment>
            ))
          }
        </p>
        <p className="text-slate-500 text-xs mt-1 font-mono">HH : MM : SS</p>
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-500/10 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{nextClass.subjectName}</p>
          <p className="text-slate-500 text-xs font-mono">{nextClass.startTime}</p>
        </div>
        {nextClass.room && (
          <span className="badge badge-upcoming">{nextClass.room}</span>
        )}
      </div>
    </div>
  )
}
