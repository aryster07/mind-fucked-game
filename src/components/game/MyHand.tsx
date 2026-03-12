import { PositionedCard, GamePhase } from '@/types/game';
import Card from './Card';
import { motion } from 'framer-motion';

interface MyHandProps {
  cards: PositionedCard[];
  faceUp: boolean;
  selectedPosition: number | null;
  revealedPosition: number | null;
  onSelectCard: (pos: number) => void;
  phase: GamePhase;
  isMyTurn: boolean;
}

export default function MyHand({
  cards,
  faceUp,
  selectedPosition,
  revealedPosition,
  onSelectCard,
  phase,
  isMyTurn,
}: MyHandProps) {
  const sorted = [...cards].sort((a, b) => a.position - b.position);
  const canSelect = isMyTurn && phase === 'draw';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Player's 4 cards */}
      <div className="flex gap-2 sm:gap-3">
        {sorted.map((card) => {
          const isRevealed = revealedPosition === card.position;
          return (
            <motion.div key={card.position} layout>
              <Card
                value={card.value}
                suit={card.suit}
                faceUp={faceUp || isRevealed}
                selected={selectedPosition === card.position}
                glowing={isRevealed}
                onClick={canSelect ? () => onSelectCard(card.position) : undefined}
              />
              <div className="text-center text-[10px] text-white/30 mt-1">
                {card.position + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      {canSelect && (
        <p className="text-sm text-amber-400 animate-pulse">
          Tap a card to discard it and draw a new one
        </p>
      )}
    </div>
  );
}
