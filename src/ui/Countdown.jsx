// ============ COUNTDOWN COMPONENT - MODERN UI ============
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Countdown = ({ seconds, message = 'Memorize your cards!' }) => {
  if (seconds === null) return null;

  // Calculate progress for ring animation
  const progress = (seconds / 8) * 100; // Assuming 8 second countdown
  const circumference = 2 * Math.PI * 30; // radius = 30 (smaller)
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      
      {/* Compact countdown banner */}
      <motion.div 
        className="glass-dark px-6 py-4 rounded-2xl border border-emerald-500/30 shadow-2xl flex items-center gap-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Countdown ring */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="30"
              fill="none"
              stroke="rgba(16,185,129,0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="35"
              cy="35"
              r="30"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
          </svg>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={seconds}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-2xl font-black text-emerald-400">
                {seconds}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Message */}
        <div className="text-white">
          <div className="font-bold text-sm">👀 {message}</div>
          <div className="text-xs text-slate-400">Cards will hide soon!</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Countdown;
