/**
 * Card Component - Modern 3D Playing Card
 * Renders a playing card with 3D effects, animations, and clear visual states
 */

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Power card value lookup
const POWER_VALUES = { 7: '✨', 9: '🔄', 11: '🌀', 13: '👁️' };

/**
 * Modern Card display component with 3D effects
 */
const Card = React.memo(({ 
  card, 
  onClick, 
  highlight = false, 
  size = 'normal', 
  hidden = false, 
  selected = false,
  isNew = false,
  disabled = false,
}) => {
  // Size configurations
  const sizes = {
    small: 'w-10 h-14 text-xs',
    normal: 'w-12 h-[68px] md:w-14 md:h-20 text-sm',
    large: 'w-16 h-[92px] md:w-[72px] md:h-[104px] text-base md:text-lg',
  };
  
  const sizeClass = sizes[size] || sizes.normal;
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  const hasClick = !!onClick && !disabled;
  const isPowerCard = card && POWER_VALUES[card.value];

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasClick) onClick();
  };

  // Empty slot
  if (!card) {
    return (
      <div className={clsx(
        sizeClass,
        'rounded-xl border-2 border-dashed border-slate-600/50 bg-slate-800/30',
        'flex items-center justify-center'
      )}>
        <span className="text-slate-600 text-xs">Empty</span>
      </div>
    );
  }

  // Card back (hidden)
  if (hidden) {
    return (
      <motion.div
        onClick={handleClick}
        whileHover={hasClick ? { y: -4, scale: 1.02 } : {}}
        whileTap={hasClick ? { scale: 0.97 } : {}}
        className={clsx(
          sizeClass,
          'playing-card card-back rounded-xl relative gpu-accelerated',
          'flex items-center justify-center select-none',
          hasClick && 'cursor-pointer',
          highlight && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse-glow',
          selected && 'ring-3 ring-green-400 ring-offset-2 ring-offset-slate-900 glow-success',
          !hasClick && !highlight && 'opacity-90'
        )}
      >
        {/* Card pattern */}
        <div className="absolute inset-1.5 rounded-lg border border-white/20 flex items-center justify-center">
          <span className="text-white/40 text-2xl md:text-3xl">?</span>
        </div>
        
        {/* Highlight glow effect */}
        {highlight && (
          <div className="absolute inset-0 rounded-xl bg-amber-400/20 animate-pulse" />
        )}
      </motion.div>
    );
  }

  // Card face (visible)
  return (
    <motion.div
      onClick={handleClick}
      initial={isNew ? { scale: 0.8, rotateY: 180 } : false}
      animate={isNew ? { scale: 1, rotateY: 0 } : {}}
      whileHover={hasClick ? { y: -8, scale: 1.05, rotateX: 5 } : {}}
      whileTap={hasClick ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        sizeClass,
        'playing-card card-face rounded-xl relative gpu-accelerated',
        'flex flex-col items-center justify-center',
        'select-none overflow-hidden',
        hasClick && 'cursor-pointer',
        isRed ? 'border-2 border-red-300' : 'border-2 border-slate-300',
        highlight && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse-glow',
        selected && 'ring-3 ring-green-400 ring-offset-2 ring-offset-slate-900 glow-success',
        isPowerCard && 'border-purple-400 shadow-purple-400/30'
      )}
    >
      {/* Power card indicator */}
      {isPowerCard && (
        <div className="absolute top-0.5 right-0.5 text-xs">
          {POWER_VALUES[card.value]}
        </div>
      )}
      
      {/* Card content */}
      <div className={clsx(
        'font-black leading-none',
        size === 'large' ? 'text-xl md:text-2xl' : 'text-lg',
        isRed ? 'text-red-600' : 'text-slate-800'
      )}>
        {card.rank}
      </div>
      <div className={clsx(
        size === 'large' ? 'text-2xl md:text-3xl' : 'text-xl',
        isRed ? 'text-red-600' : 'text-slate-800'
      )}>
        {card.suit}
      </div>

      {/* Corner indicators */}
      <div className={clsx(
        'absolute top-1 left-1.5 text-[10px] font-bold leading-none flex flex-col items-center',
        isRed ? 'text-red-600' : 'text-slate-800'
      )}>
        <span>{card.rank}</span>
        <span className="text-xs -mt-0.5">{card.suit}</span>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
