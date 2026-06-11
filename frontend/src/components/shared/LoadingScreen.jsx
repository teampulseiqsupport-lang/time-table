import React, { useState, useEffect } from 'react'

export default function LoadingScreen({ text = "Loading your schedule..." }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Animated spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-500 animate-spin" />
          {/* Middle rotating ring (reverse) */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-500 border-l-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          {/* Inner circle */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
            <span className="text-3xl">📚</span>
          </div>
        </div>

        {/* App name */}
        <h1 className="text-3xl font-bold text-white mb-2">
          TimeTable <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Pro</span>
        </h1>

        {/* Loading text with animated dots */}
        <p className="text-slate-400 text-sm mb-6 h-5">
          {text}<span className="inline-block w-6 text-left">{dots}</span>
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-slate-700/50 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  )
}
