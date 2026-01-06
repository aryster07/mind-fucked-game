/**
 * Card Component
 * Renders a playing card with support for hidden state, highlights, and interactions
 */

import React from 'react';
import clsx from 'clsx';

/**
 * Card display component
 * @param {Object} props
 * @param {Object} props.card - Card data { rank, suit }
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.highlight - Whether to show highlight ring
 * @param {string} props.size - 'normal' or 'large'
 * @param {boolean} props.hidden - Whether to show card back
 * @param {boolean} props.selected - Whether card is selected
 */
const Card = React.memo(({ 
  card, 
  onClick, 
  highlight = false, 
  size = 'normal', 
  hidden = false, 
  selected = false 
}) => {
  const sizeClass = size === 'large' ? 'w-14 h-20 md:w-16 md:h-24' : 'w-10 h-14';
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  const hasClick = !!onClick;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  if (!card) {
    return (
      <div className={`${sizeClass} rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50`} />
    );
  }

  if (hidden) {
    return (
      <div
        onClick={handleClick}
        className={clsx(
          sizeClass,
          'rounded-lg bg-gradient-to-br from-purple-700 to-purple-900 border-2 border-purple-500',
          'transition-all flex items-center justify-center select-none',
          hasClick && 'cursor-pointer hover:scale-105 active:scale-95',
          highlight && 'ring-2 ring-yellow-400 animate-pulse cursor-pointer',
          selected && 'ring-4 ring-green-500'
        )}
      >
        <span className="text-2xl text-white/80">?</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        sizeClass,
        'rounded-lg bg-white border-2 flex flex-col items-center justify-center',
        'transition-all select-none',
        hasClick && 'cursor-pointer hover:scale-105 active:scale-95',
        isRed ? 'border-red-400' : 'border-slate-800',
        highlight && 'ring-2 ring-yellow-400 animate-pulse',
        selected && 'ring-4 ring-green-500'
      )}
    >
      <div className={clsx('text-lg font-bold', isRed ? 'text-red-600' : 'text-slate-900')}>
        {card.rank}
      </div>
      <div className={clsx('text-xl', isRed ? 'text-red-600' : 'text-slate-900')}>
        {card.suit}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
