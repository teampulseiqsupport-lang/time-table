import React from "react"
import { motion } from "framer-motion"

export default function PageLoader({ text = "Loading..." }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        {/* Animated loader */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner ring */}
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-500 border-l-cyan-400"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Center dot */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.p
          variants={itemVariants}
          className="text-white font-medium text-sm text-center px-4"
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  )
}