// ============ DRAWN POWER REMINDER COMPONENT - CLEAN HINT ============
// Shows a simple reminder when player draws a power card

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DrawnPowerReminder = ({ reminder }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (!reminder?.expiresAt) return;
    
    const checkExpiry = () => {
      if (Date.now() >= reminder.expiresAt) {
        setVisible(false);
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 100);
    return () => clearInterval(interval);
  }, [reminder]);

  if (!reminder || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-28 md:bottom-36 left-1/2 -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        {/* Simple clean hint */}
        <div className="bg-slate-800/90 border border-amber-500/40 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{reminder.icon}</span>
            <span className="text-amber-400 font-medium">
              Power Card [{reminder.cardRank}]
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">
              {reminder.name}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DrawnPowerReminder;
