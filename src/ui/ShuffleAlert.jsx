// ============ SHUFFLE ALERT COMPONENT - MODERN UI ============
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShuffleAlert = ({ show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop flash */}
          <motion.div 
            className="absolute inset-0 bg-red-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Alert card */}
          <motion.div 
            className="relative"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }}
            />
            
            <div 
              className="relative px-10 py-8 rounded-3xl border-2 border-red-400/50 shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(239,68,68,0.9), rgba(234,88,12,0.9))',
                boxShadow: '0 20px 60px rgba(239,68,68,0.4)'
              }}
            >
              {/* Animated cards icon */}
              <motion.div 
                className="text-center"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <motion.div 
                  className="text-6xl mb-3 inline-block"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  🔀
                </motion.div>
                
                <motion.div 
                  className="font-black text-xl md:text-2xl text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                  YOUR CARDS SHUFFLED!
                </motion.div>
                
                <motion.div 
                  className="text-white/80 text-sm mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Try to remember the new positions!
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShuffleAlert;
