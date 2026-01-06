// ============ PLAYER HAND COMPONENT ============
import React from 'react';
import clsx from 'clsx';
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
}) => {
  const POSITIONS = {
    bottom: 'absolute bottom-4 left-1/2 -translate-x-1/2',
    top: 'absolute top-20 left-1/2 -translate-x-1/2',
    left: 'absolute left-4 top-1/2 -translate-y-1/2',
    right: 'absolute right-4 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={clsx(POSITIONS[position] || POSITIONS.top, 'flex flex-col items-center')}>
      <div
        className={clsx(
          'text-sm mb-1 px-3 py-1 rounded-full font-bold',
          isTurn ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'
        )}
      >
        {player.name} {isCurrentUser && '(You)'}{isTurn && !isCurrentUser && ' ⏳'}
      </div>
      <div className={clsx('flex gap-1', isShuffled && 'animate-bounce')}>
        {cards.map((card, cardIndex) => {
          const visible = shouldShowCard ? shouldShowCard(player.id, cardIndex) : false;
          const isSwapSource = selectedCardIndex === cardIndex;
          const highlight = highlightCard ? highlightCard(player.id, cardIndex) : false;
          const isDragging = dragIndex === cardIndex && canDrag;

          return (
            <div
              key={cardIndex}
              draggable={canDrag}
              onDragStart={(e) => onDragStart && onDragStart(e, cardIndex)}
              onDragOver={(e) => onDragOver && onDragOver(e)}
              onDrop={(e) => onDrop && onDrop(e, cardIndex)}
              onDragEnd={onDragEnd}
              className={clsx(
                isDragging && 'opacity-50 scale-90',
                canDrag && 'cursor-grab active:cursor-grabbing'
              )}
            >
              <Card
                card={card}
                hidden={!visible}
                size={isCurrentUser ? 'large' : 'normal'}
                highlight={highlight}
                selected={isSwapSource}
                onClick={() => onCardClick && onCardClick(player.id, cardIndex)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerHand;
