import { GameState, PlayerPublic, getPowerUpName } from '@/types/game';

interface GameHUDProps {
  gameState: GameState;
  players: Record<string, PlayerPublic>;
  onShowRules: () => void;
}

export default function GameHUD({ gameState, players, onShowRules }: GameHUDProps) {
  const currentPlayer = players[gameState.currentTurn];
  const showingPowerUp = gameState.activePowerUp;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm rounded-xl border border-white/5">
      <div className="flex items-center gap-4 text-sm">
        <div className="text-white/50">
          Round <span className="text-white font-bold">{gameState.roundNumber}</span>
        </div>
        <div className="text-white/50">
          Deck: <span className="text-white font-bold">{gameState.deckRemaining}</span>
        </div>
      </div>

      <div className="text-center">
        {showingPowerUp ? (
          <div className="text-amber-400 font-semibold text-sm animate-pulse">
            {getPowerUpName(showingPowerUp.type)} Active!
          </div>
        ) : currentPlayer ? (
          <div className="text-emerald-400 font-medium text-sm">
            {currentPlayer.name}&apos;s Turn
          </div>
        ) : null}
      </div>

      <button
        onClick={onShowRules}
        className="text-white/40 hover:text-white/70 transition-colors text-sm"
      >
        Rules
      </button>
    </div>
  );
}
