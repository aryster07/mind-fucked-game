import { useState, useEffect, useRef } from 'react';
import { PositionedCard } from '@/types/game';
import Card from './Card';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface ViewingPhaseOverlayProps {
  cards: PositionedCard[];
  isHost: boolean;
  duration: number; // seconds (e.g. 15)
  onRearrange: (newOrder: number[]) => void;
  onEndViewing: () => void;
  loading: boolean;
}

export default function ViewingPhaseOverlay({
  cards,
  isHost,
  duration,
  onRearrange,
  onEndViewing,
  loading,
}: ViewingPhaseOverlayProps) {
  const [order, setOrder] = useState<number[]>(
    [...cards].sort((a, b) => a.position - b.position).map((c) => c.position)
  );
  const [timer, setTimer] = useState(duration);
  const endedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // Auto-end viewing when timer reaches 0
          if (!endedRef.current) {
            endedRef.current = true;
            onRearrange(order);
            setTimeout(() => onEndViewing(), 100);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onEndViewing, onRearrange, order]);

  const sorted = [...cards].sort((a, b) => {
    const ai = order.indexOf(a.position);
    const bi = order.indexOf(b.position);
    return ai - bi;
  });

  const swapCards = (i: number, j: number) => {
    const newOrder = [...order];
    [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    setOrder(newOrder);
  };

  const handleConfirm = () => {
    onRearrange(order);
  };

  const handleStartPlaying = () => {
    if (!endedRef.current) {
      endedRef.current = true;
      onRearrange(order);
      setTimeout(() => onEndViewing(), 100);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-white mb-1">Memorize Your Cards!</h3>
        <p className="text-white/50 text-sm mb-4">
          Arrange them as you like. They will flip face-down when time runs out.
        </p>

        <div className={`text-3xl font-bold mb-4 ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
          {timer}s
        </div>

        <div className="flex gap-2 sm:gap-3 justify-center mb-4">
          {sorted.map((card, i) => (
            <div key={card.position} className="flex flex-col items-center gap-1">
              <Card value={card.value} suit={card.suit} faceUp />
              <div className="flex gap-1 mt-1">
                {i > 0 && (
                  <button
                    className="text-white/40 hover:text-white text-sm px-1"
                    onClick={() => swapCards(i, i - 1)}
                  >
                    &larr;
                  </button>
                )}
                {i < 3 && (
                  <button
                    className="text-white/40 hover:text-white text-sm px-1"
                    onClick={() => swapCards(i, i + 1)}
                  >
                    &rarr;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={handleConfirm} variant="secondary" loading={loading}>
            Save Arrangement
          </Button>
          {isHost && (
            <Button onClick={handleStartPlaying}>
              Start Playing
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
