import { GameState, PlayerPublic, PositionedCard, getPowerUpName } from '@/types/game';
import Button from '@/components/ui/Button';
import Card from './Card';
import OpponentHand from './OpponentHand';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface PowerUpOverlayProps {
  gameState: GameState;
  players: Record<string, PlayerPublic>;
  myId: string;
  myCards: PositionedCard[];
  onResolvePU7: (newOrder: number[]) => void;
  onResolvePU9: (targetId: string, targetPos: number, myPos: number) => void;
  onResolvePU11: (targetId: string) => void;
  onResolvePU13: (targetId: string) => void;
  onSkip: () => void;
  peekedCards: PositionedCard[] | null;
  loading: boolean;
}

export default function PowerUpOverlay({
  gameState,
  players,
  myId,
  myCards,
  onResolvePU7,
  onResolvePU9,
  onResolvePU11,
  onResolvePU13,
  onSkip,
  peekedCards,
  loading,
}: PowerUpOverlayProps) {
  const pu = gameState.activePowerUp;
  if (!pu || pu.playerId !== myId) return null;

  const opponents = Object.entries(players).filter(([id]) => id !== myId);

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-amber-400 mb-1">
          {getPowerUpName(pu.type)}
        </h3>

        {pu.type === 7 && <PU7View cards={myCards} onResolve={onResolvePU7} loading={loading} />}
        {pu.type === 9 && (
          <PU9View
            myCards={myCards}
            opponents={opponents}
            onResolve={onResolvePU9}
            loading={loading}
          />
        )}
        {pu.type === 11 && <PU11View opponents={opponents} onResolve={onResolvePU11} loading={loading} />}
        {pu.type === 13 && (
          <PU13View
            opponents={opponents}
            peekedCards={peekedCards}
            onResolve={onResolvePU13}
            loading={loading}
          />
        )}

        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onSkip} size="sm">
            Skip Power-up
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PU7: View & Rearrange ──────────────────────────────────────────────────

function PU7View({
  cards,
  onResolve,
  loading,
}: {
  cards: PositionedCard[];
  onResolve: (order: number[]) => void;
  loading: boolean;
}) {
  const [order, setOrder] = useState<number[]>(
    [...cards].sort((a, b) => a.position - b.position).map((c) => c.position)
  );

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

  return (
    <div>
      <p className="text-white/60 text-sm mb-4">
        Your cards are revealed! Drag or tap arrows to rearrange, then confirm.
      </p>
      <div className="flex gap-2 justify-center mb-4">
        {sorted.map((card, i) => (
          <div key={card.position} className="flex flex-col items-center gap-1">
            <Card value={card.value} suit={card.suit} faceUp />
            <div className="flex gap-1">
              {i > 0 && (
                <button
                  className="text-white/40 hover:text-white text-xs px-1"
                  onClick={() => swapCards(i, i - 1)}
                >
                  &larr;
                </button>
              )}
              {i < 3 && (
                <button
                  className="text-white/40 hover:text-white text-xs px-1"
                  onClick={() => swapCards(i, i + 1)}
                >
                  &rarr;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button onClick={() => onResolve(order)} loading={loading}>
          Confirm Arrangement
        </Button>
      </div>
    </div>
  );
}

// ─── PU9: Swap ──────────────────────────────────────────────────────────────

function PU9View({
  myCards,
  opponents,
  onResolve,
  loading,
}: {
  myCards: PositionedCard[];
  opponents: [string, PlayerPublic][];
  onResolve: (targetId: string, targetPos: number, myPos: number) => void;
  loading: boolean;
}) {
  const [myPos, setMyPos] = useState<number | null>(null);
  const [target, setTarget] = useState<{ id: string; pos: number } | null>(null);

  const sorted = [...myCards].sort((a, b) => a.position - b.position);

  return (
    <div>
      <p className="text-white/60 text-sm mb-3">
        Select one of your cards, then select an opponent&apos;s card to swap.
      </p>

      <div className="mb-4">
        <p className="text-white/50 text-xs mb-2">Your cards:</p>
        <div className="flex gap-2 justify-center">
          {sorted.map((c) => (
            <Card
              key={c.position}
              value={c.value}
              suit={c.suit}
              faceUp
              small
              selected={myPos === c.position}
              onClick={() => setMyPos(c.position)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {opponents.map(([id, player]) => (
          <OpponentHand
            key={id}
            playerId={id}
            player={player}
            isCurrentTurn={false}
            selectable={myPos !== null}
            selectedPosition={target?.id === id ? target.pos : null}
            onSelectPosition={(pid, pos) => setTarget({ id: pid, pos })}
          />
        ))}
      </div>

      {myPos !== null && target && (
        <div className="text-center mt-4">
          <Button
            onClick={() => onResolve(target.id, target.pos, myPos)}
            loading={loading}
          >
            Swap Cards
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── PU11: Shuffle ──────────────────────────────────────────────────────────

function PU11View({
  opponents,
  onResolve,
  loading,
}: {
  opponents: [string, PlayerPublic][];
  onResolve: (targetId: string) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <p className="text-white/60 text-sm mb-3">
        Select a player whose cards you want to shuffle.
      </p>
      <div className="space-y-3">
        {opponents.map(([id, player]) => (
          <div
            key={id}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selected === id
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-white/10 hover:border-white/30'
            }`}
            onClick={() => setSelected(id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{player.name}</span>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="text-center mt-4">
          <Button onClick={() => onResolve(selected)} loading={loading}>
            Shuffle Their Cards
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── PU13: Peek ─────────────────────────────────────────────────────────────

function PU13View({
  opponents,
  peekedCards,
  onResolve,
  loading,
}: {
  opponents: [string, PlayerPublic][];
  peekedCards: PositionedCard[] | null;
  onResolve: (targetId: string) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (peekedCards) {
    const sorted = [...peekedCards].sort((a, b) => a.position - b.position);
    return (
      <div>
        <p className="text-emerald-400 text-sm mb-3 font-medium">
          Their cards revealed!
        </p>
        <div className="flex gap-2 justify-center">
          {sorted.map((c) => (
            <Card key={c.position} value={c.value} suit={c.suit} faceUp />
          ))}
        </div>
        <p className="text-white/40 text-xs text-center mt-3">
          Memorize them! This view will close.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-white/60 text-sm mb-3">
        Select a player whose cards you want to peek at.
      </p>
      <div className="space-y-3">
        {opponents.map(([id, player]) => (
          <div
            key={id}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selected === id
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-white/10 hover:border-white/30'
            }`}
            onClick={() => setSelected(id)}
          >
            <span className="text-white font-medium">{player.name}</span>
          </div>
        ))}
      </div>
      {selected && (
        <div className="text-center mt-4">
          <Button onClick={() => onResolve(selected)} loading={loading}>
            Peek at Cards
          </Button>
        </div>
      )}
    </div>
  );
}
