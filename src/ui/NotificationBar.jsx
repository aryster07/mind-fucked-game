// ============ NOTIFICATION BAR COMPONENT - MODERN UI ============
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBar = ({ notification, children }) => {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className="absolute top-0 left-0 right-0 p-3 md:p-4 flex justify-center md:justify-start items-center z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="glass-dark px-4 py-3 rounded-2xl text-white max-w-md shadow-2xl border border-purple-500/20"
            layout
          >
            {/* Main notification text */}
            <motion.div 
              className="flex items-center gap-2"
              key={notification}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-semibold text-sm md:text-base leading-relaxed">
                {notification}
              </span>
            </motion.div>
            
            {/* Children (power action hints) */}
            {children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
