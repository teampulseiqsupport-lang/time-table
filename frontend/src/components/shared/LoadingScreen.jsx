import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-20 h-20 animate-spin-slow" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="4"/>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#6366F1" strokeWidth="4"
              strokeLinecap="round" strokeDasharray="60 165" strokeDashoffset="0"
              style={{ filter: 'drop-shadow(0 0 8px #6366F1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
        </div>
        <p className="gradient-text font-bold text-lg">TimeTable Pro</p>
        <p className="text-slate-500 text-sm mt-1">Loading your schedule...</p>
      </div>
    </div>
  )
}
