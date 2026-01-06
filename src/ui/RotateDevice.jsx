// ============ ROTATE DEVICE PROMPT ============
import React from 'react';
import { motion } from 'framer-motion';

const RotateDevice = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex items-center justify-center p-6">
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 90, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <svg 
            className="w-24 h-24 mx-auto text-indigo-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
            <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Rotate Your Device
        </h2>
        
        <p className="text-slate-400 text-lg mb-2">
          Please rotate your device to landscape mode
        </p>
        
        <p className="text-slate-500 text-sm">
          This game is optimized for landscape orientation
        </p>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-8 text-6xl"
        >
          🔄
        </motion.div>
      </div>
    </div>
  );
};

export default RotateDevice;
