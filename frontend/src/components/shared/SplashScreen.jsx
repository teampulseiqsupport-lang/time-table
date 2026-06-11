import React from "react"
import { motion } from "framer-motion"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-black">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
        />

        <h1 className="text-white text-2xl font-bold">
          Timetable System
        </h1>

        <p className="text-white/70 text-sm mt-2">
          Loading your dashboard...
        </p>
      </motion.div>
    </div>
  )
}