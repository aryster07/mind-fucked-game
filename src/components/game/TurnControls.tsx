import Button from '@/components/ui/Button';
import { GamePhase } from '@/types/game';

interface TurnControlsProps {
  isMyTurn: boolean;
  phase: GamePhase;
  actedThisRound: boolean;
  onShow: () => void;
  showLoading: boolean;
}

export default function TurnControls({
  isMyTurn,
  phase,
  actedThisRound,
  onShow,
  showLoading,
}: TurnControlsProps) {
  if (!isMyTurn) {
    return (
      <div className="text-center text-white/40 text-sm py-3">
        Waiting for other player&apos;s turn...
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center py-3">
      {phase === 'draw' && !actedThisRound && (
        <Button onClick={onShow} loading={showLoading} variant="secondary" size="lg">
          Call Show
        </Button>
      )}
    </div>
  );
}
