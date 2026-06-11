import React, { useEffect, useState } from "react"
import { GraduationCap } from "lucide-react"

export default function SplashScreen({ duration = 3000 }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-navy-900 via-slate-900 to-navy-900 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl animate-bounce">
            <GraduationCap size={48} className="text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ animation: 'slideDown 0.8s ease-out' }}>
          Timetable Pro
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg mb-8" style={{ animation: 'slideDown 0.8s ease-out 0.3s both' }}>
          Academic Timetable Management System
        </p>

        {/* Loading animation */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Status text */}
        <p className="text-slate-500 text-sm font-medium">Initializing your dashboard...</p>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center px-4">
          <div>
            <p className="text-2xl font-bold text-indigo-400">100%</p>
            <p className="text-xs text-slate-500">Uptime</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">24/7</p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">Smart</p>
            <p className="text-xs text-slate-500">Notifications</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}