// ============ PLAYER HAND COMPONENT - MODERN UI ============
import React from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

const PlayerHand = ({ 
  player, 
  cards, 
  position = 'bottom',
  isTurn = false,
  isCurrentUser = false,
  isShuffled = false,
  onCardClick,
  shouldShowCard,
  highlightCard,
  selectedCardIndex,
  canDrag = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragIndex,
  throwingIndex = null,
  drawingIndex = null,
}) => {
  // Left/Right: cards rotated 90 degrees and stacked vertically
  const isVertical = position === 'left' || position === 'right';
  const cardRotation = position === 'left' ? 90 : position === 'right' ? -90 : 0;

  return (
    <motion.div 
      className="z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center">
        {/* Player Name Badge */}
        {position !== 'bottom' && (
          <motion.div
            animate={isTurn ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1.5, repeat: isTurn ? Infinity : 0 }}
            className={clsx(
              'mb-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold',
              'flex items-center gap-1.5 shadow-lg',
              isTurn 
                ? 'bg-amber-600/90 text-white' 
                : 'glass text-slate-300'
            )}
          >
            {isTurn && <span className="text-xs">⏳</span>}
            <span className="truncate max-w-[80px] md:max-w-[100px]">{player.name}</span>
          </motion.div>
        )}

        {/* Cards Container */}
        <motion.div 
          className={clsx(
            'flex gap-2',
            isVertical && 'flex-col',
            isShuffled && 'animate-shake'
          )}
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, cardIndex) => {
              const visible = shouldShowCard ? shouldShowCard(player.id, cardIndex) : false;
              const isSwapSource = selectedCardIndex === cardIndex;
              const highlight = highlightCard ? highlightCard(player.id, cardIndex) : false;
              const isDragging = dragIndex === cardIndex && canDrag;
              const isThrowing = throwingIndex === cardIndex;
              const isDrawing = drawingIndex === cardIndex;

              return (
                <motion.div
                  key={`${player.id}-card-${cardIndex}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isDragging ? 0.5 : isThrowing ? 0.3 : 1, 
                    scale: isDragging ? 0.9 : isThrowing ? 0.8 : 1,
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25,
                    duration: 0.3 
                  }}
                  draggable={canDrag}
                  onDragStart={(e) => onDragStart && onDragStart(e, cardIndex)}
                  onDragOver={(e) => onDragOver && onDragOver(e)}
                  onDrop={(e) => onDrop && onDrop(e, cardIndex)}
                  onDragEnd={onDragEnd}
                  className={clsx(
                    canDrag && 'cursor-grab active:cursor-grabbing',
                    'relative',
                    // For left/right: swap width/height to account for rotation
                    isVertical && 'w-[68px] h-12 md:w-20 md:h-14 flex items-center justify-center'
                  )}
                >
                  {/* Drawing indicator */}
                  {isDrawing && (
                    <motion.div 
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-600 rounded text-[10px] text-white font-bold whitespace-nowrap z-10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ↓ NEW
                    </motion.div>
                  )}
                  
                  {/* Card with rotation applied */}
                  <div style={{ transform: `rotate(${cardRotation}deg)` }}>
                    <Card
                      card={card}
                      hidden={!visible}
                      size="normal"
                      highlight={highlight}
                      selected={isSwapSource}
                      onClick={() => onCardClick && onCardClick(player.id, cardIndex)}
                    />
                  </div>
                  
                  {/* Selected indicator */}
                  {isSwapSource && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-bold bg-slate-900/80 px-1.5 py-0.5 rounded z-10">
                      ✓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Player Name Badge - Bottom for current user */}
        {position === 'bottom' && (
          <motion.div
            animate={isTurn ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: isTurn ? Infinity : 0 }}
            className={clsx(
              'mt-3 px-4 py-2 rounded-full text-sm font-semibold',
              'flex items-center gap-2 shadow-lg',
              isTurn 
                ? 'bg-amber-600/90 text-white' 
                : 'glass text-slate-300 border border-slate-600/30'
            )}
          >
            {isTurn && <span>🎯</span>}
            <span>{player.name}</span>
            <span className="px-1.5 py-0.5 bg-indigo-500/30 rounded text-[10px] text-indigo-300">YOU</span>
          </motion.div>
        )}

        {/* Turn hint */}
        {isCurrentUser && isTurn && position === 'bottom' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-slate-500 text-center"
          >
            {canDrag ? '↔️ Drag to rearrange' : '👆 Tap a card to throw it'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerHand;
