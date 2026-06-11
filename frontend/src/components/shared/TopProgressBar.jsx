import React from "react"
import { motion } from "framer-motion"

export default function TopProgressBar({ loading }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[1000] bg-transparent">
      {loading && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6 }}
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
        />
      )}
    </div>
  )
}