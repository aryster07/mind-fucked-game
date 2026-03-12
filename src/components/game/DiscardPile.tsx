import Card from './Card';
import { Card as CardType } from '@/types/game';

interface DiscardPileProps {
  topCard: CardType | null;
}

export default function DiscardPile({ topCard }: DiscardPileProps) {
  if (!topCard) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
        <span className="text-white/20 text-xs">Discard</span>
      </div>
    );
  }

  return <Card value={topCard.value} suit={topCard.suit} faceUp />;
}
