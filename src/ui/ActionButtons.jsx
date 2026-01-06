// ============ ACTION BUTTONS COMPONENT - MODERN UI ============
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionButtons = ({ canShow, canDone, onCallShow, onDone }) => {
  if (!canShow && !canDone) return null;

  return (
    <div className="absolute top-3 right-3 md:top-16 md:right-4 flex flex-col gap-2 z-40">
      <AnimatePresence mode="popLayout">
        {canShow && (
          <motion.button
            key="show-btn"
            onClick={onCallShow}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="relative px-5 py-3 rounded-xl text-white font-bold shadow-2xl transition-all overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.4)'
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm md:text-base">CALL SHOW</span>
            </span>
            
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-xl border-2 border-green-400/50 animate-ping opacity-50" />
          </motion.button>
        )}
        
        {canDone && (
          <motion.button
            key="done-btn"
            onClick={onDone}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="relative px-5 py-3 rounded-xl text-white font-bold shadow-2xl transition-all overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 20px rgba(59,130,246,0.4)'
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="text-sm md:text-base">Done Arranging</span>
            </span>
            
            {/* Pulse ring */}
            <motion.div 
              className="absolute inset-0 rounded-xl border-2 border-blue-400/50"
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionButtons;
