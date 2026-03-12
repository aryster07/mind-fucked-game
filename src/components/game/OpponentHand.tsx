import Card from './Card';
import Avatar from '@/components/ui/Avatar';
import { PlayerPublic } from '@/types/game';

interface OpponentHandProps {
  playerId: string;
  player: PlayerPublic;
  isCurrentTurn: boolean;
  selectable?: boolean;
  selectedPosition?: number | null;
  onSelectPosition?: (playerId: string, pos: number) => void;
}

export default function OpponentHand({
  playerId,
  player,
  isCurrentTurn,
  selectable,
  selectedPosition,
  onSelectPosition,
}: OpponentHandProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <Avatar name={player.name} size="sm" connected={player.connected} isCurrentTurn={isCurrentTurn} />
        <span className={`text-sm font-medium ${isCurrentTurn ? 'text-emerald-400' : 'text-white/70'}`}>
          {player.name}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            faceUp={false}
            small
            selected={selectable && selectedPosition === i}
            onClick={selectable && onSelectPosition ? () => onSelectPosition(playerId, i) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
