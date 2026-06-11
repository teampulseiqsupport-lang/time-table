import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const gearAnim1 = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 3, repeat: Infinity, ease: "linear" }
  }
};

const gearAnim2 = {
  animate: {
    rotate: [360, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: "linear" }
  }
};

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 text-center">

        {/* 404 Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg">
            <FaExclamationTriangle className="text-yellow-300 text-2xl" />
            ERROR 404
          </div>
        </motion.div>

        {/* Animation */}
        <div className="relative h-28 flex justify-center items-center mb-6">
          <motion.div
            variants={gearAnim1}
            animate="animate"
            className="absolute left-[35%]"
          >
            <FaCog className="text-5xl text-gray-400" />
          </motion.div>

          <motion.div
            variants={gearAnim2}
            animate="animate"
            className="absolute right-[35%]"
          >
            <FaCog className="text-7xl text-gray-500" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          >
            <FaSearch className="text-6xl text-blue-600" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-red-600 mb-3"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 mb-4"
        >
          Page Not Found
        </motion.h2>

        <p className="text-gray-600 mb-2">
          The page you are looking for doesn't exist
          or has been moved.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Support:{' '}
          <a
            href="mailto:arpanjain00123@gmail.com"
            className="text-blue-600 font-semibold underline"
          >
            arpanjain00123@gmail.com
          </a>
        </p>

        {/* Home Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 mx-auto"
        >
          <FaHome />
          Back To Home
        </motion.button>

        <div className="mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} Timetable System
        </div>
      </div>
    </div>
  );
}