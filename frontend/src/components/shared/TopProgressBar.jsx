import React from "react"
import { motion } from "framer-motion"

export default function TopProgressBar({ loading }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000]">
      {loading && (
        <>
          {/* Main progress bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ width: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 shadow-lg shadow-indigo-500/50"
          />
          {/* Shimmer effect */}
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      )}
    </div>
  )
}