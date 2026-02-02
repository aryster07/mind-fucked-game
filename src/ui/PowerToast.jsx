// ============ POWER TOAST COMPONENT - MODERN UI ============
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POWER_COLORS = {
  REFRESH: { bg: 'from-green-600 to-emerald-700', glow: 'rgba(34,197,94,0.4)', border: 'border-green-400/30' },
  BLIND_SWAP: { bg: 'from-blue-600 to-indigo-700', glow: 'rgba(59,130,246,0.4)', border: 'border-blue-400/30' },
  CHAOS_SHUFFLE: { bg: 'from-purple-600 to-violet-700', glow: 'rgba(139,92,246,0.4)', border: 'border-purple-400/30' },
  GLOBAL_SPY: { bg: 'from-amber-600 to-orange-700', glow: 'rgba(245,158,11,0.4)', border: 'border-amber-400/30' },
};

const PowerToast = ({ power, expiresAt }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (!power || !expiresAt) return;
    
    const checkExpiry = () => {
      if (Date.now() >= expiresAt) {
        setVisible(false);
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 100);
    return () => clearInterval(interval);
  }, [power, expiresAt]);

  if (!power || !visible) return null;

  // Power object has 'name' property (e.g., "REFRESH", "BLIND SWAP")
  // Convert to key format for color lookup
  const powerKey = power.name?.toUpperCase().replace(' ', '_') || 'REFRESH';
  const colors = POWER_COLORS[powerKey] || POWER_COLORS.REFRESH;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed top-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-50"
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div 
          className={`relative rounded-2xl shadow-2xl overflow-hidden border ${colors.border}`}
          style={{ boxShadow: `0 8px 32px ${colors.glow}` }}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          
          {/* Shimmer effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          
          {/* Content */}
          <div className="relative px-5 py-4 flex items-center gap-4">
            {/* Icon container */}
            <motion.div 
              className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-3xl">{power.icon}</span>
            </motion.div>
            
            {/* Text content */}
            <div className="text-white">
              {/* Show who activated the power */}
              {power.playerName && (
                <motion.div 
                  className="text-xs text-white/70 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {power.playerName} activated:
                </motion.div>
              )}
              <motion.div 
                className="font-bold text-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {power.name}
              </motion.div>
              <motion.div 
                className="text-sm text-white/80 max-w-[180px]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {power.description || power.desc}
              </motion.div>
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div 
            className="h-1 bg-white/30"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PowerToast;
