import React from 'react'
import { Clock, MapPin, User, BookOpen, Beaker, Coffee, XCircle } from 'lucide-react'
import { getClassProgress, getCurrentISTMinutes, timeToMinutes } from '../../utils/time'

const completedBadgeStyle = {
  background: 'rgba(59,130,246,0.16)',
  color: '#93C5FD',
  border: '1px solid rgba(96,165,250,0.35)'
}

const breakBadgeStyle = {
  background: 'rgba(249,115,22,0.1)',
  color: '#FB923C',
  border: '1px solid rgba(249,115,22,0.2)'
}

export default function ClassCard({
  entry,
  showProgress = false,
  compact = false,
  showRealtimeStatus = false,
  forceCompleted = false
}) {
  const currentMinutes = showRealtimeStatus ? getCurrentISTMinutes() : null
  const startMinutes = showRealtimeStatus ? timeToMinutes(entry.startTime) : null
  const endMinutes = showRealtimeStatus ? timeToMinutes(entry.endTime) : null
  const ongoing = showRealtimeStatus && currentMinutes >= startMinutes && currentMinutes < endMinutes
  const upcoming = showRealtimeStatus && currentMinutes < startMinutes
  const completed = forceCompleted || (showRealtimeStatus && currentMinutes >= endMinutes)
  const futureDetailsOnly = !showRealtimeStatus && !forceCompleted
  const progress = ongoing && showProgress ? getClassProgress(entry) : 0
  const cardStatusClass = ongoing
    ? 'ongoing-card status-card-ongoing p-5'
    : upcoming
      ? 'glass-card status-card-upcoming p-4'
      : completed
        ? 'glass-card status-card-completed p-4'
        : 'glass-card p-4 hover:border-indigo-500/30'

  if (entry.type === 'Lunch') {
    return (
      <div className="glass-card p-4 border-orange-500/20 bg-orange-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Coffee size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-orange-300">Lunch Break</p>
            <p className="text-slate-400 text-sm font-mono">{entry.startTime} - {entry.endTime}</p>
          </div>
          {!futureDetailsOnly && (
            <span className="ml-auto badge" style={forceCompleted ? completedBadgeStyle : breakBadgeStyle}>
              {forceCompleted ? 'Completed' : 'Break'}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (entry.isCancelled) {
    return (
      <div className="glass-card p-4 opacity-60 border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-300 line-through">{entry.subjectName}</p>
            <p className="text-slate-500 text-xs">Cancelled - {entry.cancellationReason || 'No reason given'}</p>
          </div>
          <span className="font-mono text-xs text-slate-500">{entry.startTime}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden transition-all duration-300 ${cardStatusClass}`}>
      {ongoing && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/30 w-full">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ongoing ? 'bg-emerald-500/20' : 'bg-indigo-500/15'}`}>
          {entry.type === 'Lab'
            ? <Beaker size={18} className={ongoing ? 'text-emerald-400' : 'text-amber-400'} />
            : <BookOpen size={18} className={ongoing ? 'text-emerald-400' : 'text-indigo-400'} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-semibold truncate ${ongoing ? 'text-white' : 'text-slate-100'} ${compact ? 'text-sm' : 'text-base'}`}>
                {entry.subjectName}
              </h3>
              {entry.subjectCode && (
                <p className="text-slate-500 text-xs font-mono mt-0.5">({entry.subjectCode})</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {ongoing && (
                <span className="badge badge-ongoing status-chip-pulse flex items-center gap-1">
                  <span className="pulse-dot w-1.5 h-1.5" />
                  LIVE
                </span>
              )}
              {upcoming && (
                <span className="badge badge-upcoming status-chip-blue status-chip-blink">Upcoming</span>
              )}
              {completed && (
                <span className="badge status-chip-blue status-chip-soft" style={completedBadgeStyle}>Completed</span>
              )}
              {showRealtimeStatus && (
                <span className={`badge ${entry.type === 'Lab' ? 'badge-lab' : 'badge-theory'}`}>
                  {entry.type}
                </span>
              )}
            </div>
          </div>

          {!compact && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock size={12} className="text-slate-500" />
                <span className="font-mono">{entry.startTime} - {entry.endTime}</span>
              </div>

              {(entry.room || entry.block) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={12} className="text-slate-500" />
                  <span>{entry.block ? `${entry.block}-${entry.room}` : entry.room}</span>
                </div>
              )}

              {entry.facultyName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User size={12} className="text-slate-500" />
                  <span>{entry.facultyName}</span>
                </div>
              )}
            </div>
          )}

          {compact && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-mono text-slate-500">{entry.startTime}</span>
              {entry.room && <span className="text-xs text-slate-500">{entry.room}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
