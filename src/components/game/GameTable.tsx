import { GameState, PlayerPublic, PlayerHand } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { useGameActions } from '@/lib/hooks/useGameActions';
import MyHand from './MyHand';
import OpponentHand from './OpponentHand';
import DeckPile from './DeckPile';
import DiscardPile from './DiscardPile';
import TurnControls from './TurnControls';
import GameHUD from './GameHUD';
import PowerUpOverlay from './PowerUpOverlay';
import ViewingPhaseOverlay from './ViewingPhaseOverlay';
import ShowResultModal from './ShowResultModal';
import HowToPlayModal from './HowToPlayModal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

interface GameTableProps {
  gameId: string;
  gameState: GameState;
  players: Record<string, PlayerPublic>;
  myHand: PlayerHand | null;
  myId: string;
}

export default function GameTable({ gameId, gameState, players, myHand, myId }: GameTableProps) {
  const router = useRouter();
  const store = useGameStore();
  const actions = useGameActions();

  const isMyTurn = gameState.currentTurn === myId;
  const myPlayer = players[myId];
  const opponents = Object.entries(players).filter(([id]) => id !== myId);
  const isHost = gameState.hostId === myId;

  // ─── Actions ─────────────────────────────────────────────────────

  const handlePlayCard = async (position: number) => {
    store.setSelectedPosition(position);
    const result = await actions.swapCard.call({ gameId, position });
    store.setSelectedPosition(null);
    if (!result) {
      toast.error(actions.swapCard.error || 'Failed to play card');
    } else {
      store.setRevealedPosition(position);
      setTimeout(() => store.setRevealedPosition(null), 5000);

      if (result.powerUp) {
        toast(`Power-up activated: ${result.powerUp}!`, { icon: '\u26A1' });
      }
    }
  };

  const handleShow = async () => {
    const result = await actions.callShow.call({ gameId });
    if (!result) {
      toast.error(actions.callShow.error || 'Cannot call show');
    }
  };

  const handleRearrange = async (newOrder: number[]) => {
    await actions.rearrangeCards.call({ gameId, newOrder });
  };

  const handleEndViewing = async () => {
    await actions.endViewing.call({ gameId });
  };

  // ─── Power-up handlers ──────────────────────────────────────────

  const handlePU7 = async (newOrder: number[]) => {
    await actions.resolvePowerUp7.call({ gameId, newOrder });
  };

  const handlePU9 = async (targetId: string, targetPos: number, myPos: number) => {
    const result = await actions.resolvePowerUp9.call({ gameId, targetPlayerId: targetId, targetPosition: targetPos, myPosition: myPos });
    if (result) {
      store.setTakenCard(result.takenCard);
      toast(`Took a card: ${result.takenCard.value}`, { icon: '\uD83C\uDCCF' });
      setTimeout(() => store.setTakenCard(null), 3000);
    }
  };

  const handlePU11 = async (targetId: string) => {
    await actions.resolvePowerUp11.call({ gameId, targetPlayerId: targetId });
    toast('Cards shuffled!', { icon: '\uD83C\uDF00' });
  };

  const handlePU13 = async (targetId: string) => {
    const result = await actions.resolvePowerUp13.call({ gameId, targetPlayerId: targetId });
    if (result) {
      store.setPeekedCards(result.revealedCards);
      setTimeout(() => store.setPeekedCards(null), 5000);
    }
  };

  const handleSkipPU = async () => {
    await actions.skipPowerUp.call({ gameId });
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* HUD */}
      <div className="p-3">
        <GameHUD
          gameState={gameState}
          players={players}
          onShowRules={() => store.setShowHowToPlay(true)}
        />
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {/* Opponents */}
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          {opponents.map(([id, player]) => (
            <OpponentHand
              key={id}
              playerId={id}
              player={player}
              isCurrentTurn={gameState.currentTurn === id}
            />
          ))}
        </div>

        {/* Center: Deck + Discard */}
        <div className="flex items-center gap-6">
          <DeckPile
            remaining={gameState.deckRemaining}
            disabled={true}
          />
          <DiscardPile topCard={gameState.discardTop} />
        </div>

        {/* Turn Controls */}
        {gameState.status === 'playing' && (
          <TurnControls
            isMyTurn={isMyTurn}
            phase={gameState.phase}
            actedThisRound={myPlayer?.actedThisRound ?? false}
            onShow={handleShow}
            showLoading={actions.callShow.loading}
          />
        )}

        {/* My Hand */}
        {myHand && (
          <MyHand
            cards={myHand.cards}
            faceUp={gameState.status === 'viewing'}
            selectedPosition={store.selectedPosition}
            revealedPosition={store.revealedPosition}
            onSelectCard={handlePlayCard}
            phase={gameState.phase}
            isMyTurn={isMyTurn}
          />
        )}
      </div>

      {/* Overlays */}
      {gameState.status === 'viewing' && myHand && (
        <ViewingPhaseOverlay
          cards={myHand.cards}
          isHost={isHost}
          duration={15}
          onRearrange={handleRearrange}
          onEndViewing={handleEndViewing}
          loading={actions.rearrangeCards.loading}
        />
      )}

      {gameState.activePowerUp && gameState.activePowerUp.playerId === myId && myHand && (
        <PowerUpOverlay
          gameState={gameState}
          players={players}
          myId={myId}
          myCards={myHand.cards}
          onResolvePU7={handlePU7}
          onResolvePU9={handlePU9}
          onResolvePU11={handlePU11}
          onResolvePU13={handlePU13}
          onSkip={handleSkipPU}
          peekedCards={store.peekedCards}
          loading={
            actions.resolvePowerUp7.loading ||
            actions.resolvePowerUp9.loading ||
            actions.resolvePowerUp11.loading ||
            actions.resolvePowerUp13.loading
          }
        />
      )}

      <ShowResultModal
        open={gameState.status === 'finished'}
        gameState={gameState}
        players={players}
        onLeave={() => router.push('/')}
      />

      <HowToPlayModal
        open={store.showHowToPlay}
        onClose={() => store.setShowHowToPlay(false)}
      />
    </div>
  );
}
