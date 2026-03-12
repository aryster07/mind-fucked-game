import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { GameState, PlayerPublic } from '@/types/game';

interface ShowResultModalProps {
  open: boolean;
  gameState: GameState;
  players: Record<string, PlayerPublic>;
  onPlayAgain?: () => void;
  onLeave?: () => void;
}

export default function ShowResultModal({
  open,
  gameState,
  players,
  onPlayAgain,
  onLeave,
}: ShowResultModalProps) {
  const winner = gameState.winnerId ? players[gameState.winnerId] : null;

  return (
    <Modal open={open} onClose={() => {}} title="Game Over!">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-2">
          {'\uD83C\uDFC6'}
        </div>
        <h3 className="text-2xl font-bold text-emerald-400">
          {winner?.name ?? 'Unknown'} Wins!
        </h3>
        {gameState.showCallerSum !== null && (
          <p className="text-white/60">
            Hand total: <span className="text-white font-bold">{gameState.showCallerSum}</span>
          </p>
        )}

        <div className="flex gap-3 justify-center pt-4">
          {onPlayAgain && (
            <Button onClick={onPlayAgain}>Play Again</Button>
          )}
          {onLeave && (
            <Button variant="secondary" onClick={onLeave}>Leave</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
