import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function SplashScreen({ duration = 3000 }) {
  const [show, setShow] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 30, 95))
    }, 200)
    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [duration])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Animated logo container */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          <motion.div
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-5xl">📚</span>
          </motion.div>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-indigo-400 via-white to-cyan-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Timetable Pro
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-slate-400 text-lg mb-12 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Academic Timetable Management System
        </motion.p>

        {/* Enhanced loading animation */}
        <motion.div
          className="mb-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>

        {/* Status text */}
        <motion.p
          className="text-slate-500 text-sm font-medium mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Initializing your dashboard
        </motion.p>

        {/* Progress bar */}
        <motion.div
          className="w-56 h-1.5 bg-slate-800/50 rounded-full overflow-hidden mx-auto border border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-6 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} className="group">
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-indigo-500 transition-all">100%</p>
            <p className="text-xs text-slate-500 mt-1">Uptime</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="group">
            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-cyan-500 transition-all">24/7</p>
            <p className="text-xs text-slate-500 mt-1">Available</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="group">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-500 transition-all">⚡</p>
            <p className="text-xs text-slate-500 mt-1">Lightning Fast</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}