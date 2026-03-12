import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  LocalGameState,
  createLocalGame,
  endViewingPhase,
  rearrangeCards,
  playTurn,
  callShow,
  resolvePowerUp7,
  resolvePowerUp9,
  resolvePowerUp11,
  resolvePowerUp13,
  skipPowerUp,
} from '@/lib/game/engine';
import { executeBotTurn } from '@/lib/game/bot';
import { useGameStore } from '@/store/gameStore';
import MyHand from '@/components/game/MyHand';
import OpponentHand from '@/components/game/OpponentHand';
import DeckPile from '@/components/game/DeckPile';
import DiscardPile from '@/components/game/DiscardPile';
import TurnControls from '@/components/game/TurnControls';
import GameHUD from '@/components/game/GameHUD';
import PowerUpOverlay from '@/components/game/PowerUpOverlay';
import ViewingPhaseOverlay from '@/components/game/ViewingPhaseOverlay';
import ShowResultModal from '@/components/game/ShowResultModal';
import HowToPlayModal from '@/components/game/HowToPlayModal';
import { getPowerUpName } from '@/types/game';

const PLAYER_ID = 'player';

export default function SoloGame() {
  const router = useRouter();
  const store = useGameStore();
  const [game, setGame] = useState<LocalGameState | null>(null);
  const [botCount, setBotCount] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [viewingDuration, setViewingDuration] = useState(15);
  const [started, setStarted] = useState(false);
  const gameRef = useRef<LocalGameState | null>(null);

  // Keep ref in sync for bot callbacks
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const updateGame = useCallback((newState: LocalGameState) => {
    setGame(newState);
    gameRef.current = newState;

    // Trigger next bot turn if needed
    setTimeout(() => {
      const current = gameRef.current;
      if (!current) return;
      const gs = current.gameState;
      if (
        gs.status === 'playing' &&
        gs.currentTurn !== PLAYER_ID &&
        !gs.activePowerUp
      ) {
        executeBotTurn(current, gs.currentTurn, (updated) => {
          updateGame(updated);
        });
      }
    }, 300);
  }, []);

  const handleStart = () => {
    if (!playerName.trim()) {
      toast.error('Enter your name');
      return;
    }
    const initial = createLocalGame(playerName.trim(), botCount);
    setGame(initial);
    setStarted(true);
    store.reset();
  };

  // ─── Setup screen ──────────────────────────────────────────────

  if (!started || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <div className="max-w-md w-full bg-gray-900/50 border border-white/10 rounded-2xl p-8 space-y-6 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Solo Mode
          </h1>
          <p className="text-white/50">Play against bots to practice</p>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Your Name</label>
            <input
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Number of Bots</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-12 h-12 rounded-xl font-bold transition-all ${
                    botCount === n
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                  }`}
                  onClick={() => setBotCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Viewing Time: {viewingDuration}s
            </label>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={viewingDuration}
              onChange={(e) => setViewingDuration(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>10s</span>
              <span>30s</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-emerald-900/30"
          >
            Start Game
          </button>

          <button
            onClick={() => router.push('/')}
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Game screen ───────────────────────────────────────────────

  const gs = game.gameState;
  const isMyTurn = gs.currentTurn === PLAYER_ID;
  const myHand = game.hands[PLAYER_ID];
  const myPlayer = game.players[PLAYER_ID];
  const opponents = Object.entries(game.players).filter(([id]) => id !== PLAYER_ID);

  const handlePlayCard = (position: number) => {
    const newState = playTurn(game, PLAYER_ID, position);
    updateGame(newState);

    // Show the newly drawn card face-up for 5 seconds
    store.setRevealedPosition(position);
    setTimeout(() => store.setRevealedPosition(null), 5000);

    if (newState.gameState.activePowerUp?.playerId === PLAYER_ID) {
      const puType = newState.gameState.activePowerUp.type;
      toast(`Power-up: ${getPowerUpName(puType)}!`, { icon: '\u26A1' });
    }
  };

  const handleShow = () => {
    const sum = myHand.cards.reduce((s, c) => s + c.value, 0);
    if (myPlayer.actedThisRound) {
      toast.error('You already acted this round. Wait for your next turn.');
      return;
    }
    if (sum > 10) {
      toast.error(`Your sum is ${sum}. Needs to be 10 or below.`);
      return;
    }
    const newState = callShow(game, PLAYER_ID);
    updateGame(newState);
  };

  const handleRearrange = (newOrder: number[]) => {
    const newState = rearrangeCards(game, PLAYER_ID, newOrder);
    updateGame(newState);
    toast.success('Cards rearranged!');
  };

  const handleEndViewing = () => {
    const newState = endViewingPhase(game);
    updateGame(newState);
  };

  const handlePU7 = (newOrder: number[]) => {
    const newState = resolvePowerUp7(game, PLAYER_ID, newOrder);
    updateGame(newState);
  };

  const handlePU9 = (targetId: string, targetPos: number, myPos: number) => {
    const targetCard = game.hands[targetId].cards.find((c) => c.position === targetPos);
    const newState = resolvePowerUp9(game, PLAYER_ID, targetId, myPos, targetPos);
    updateGame(newState);
    if (targetCard) {
      store.setTakenCard({ value: targetCard.value, suit: targetCard.suit });
      toast(`Took: ${targetCard.value} of ${targetCard.suit}`, { icon: '\uD83C\uDCCF' });
      setTimeout(() => store.setTakenCard(null), 3000);
    }
  };

  const handlePU11 = (targetId: string) => {
    const newState = resolvePowerUp11(game, targetId);
    updateGame(newState);
    toast('Cards shuffled!', { icon: '\uD83C\uDF00' });
  };

  const handlePU13 = (targetId: string) => {
    const targetCards = game.hands[targetId].cards;
    store.setPeekedCards([...targetCards]);
    const newState = resolvePowerUp13(game);
    updateGame(newState);
    setTimeout(() => store.setPeekedCards(null), 5000);
  };

  const handleSkipPU = () => {
    const newState = skipPowerUp(game);
    updateGame(newState);
  };

  const handlePlayAgain = () => {
    store.reset();
    const fresh = createLocalGame(playerName.trim(), botCount);
    setGame(fresh);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />

      {/* HUD */}
      <div className="p-3">
        <GameHUD
          gameState={gs}
          players={game.players}
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
              isCurrentTurn={gs.currentTurn === id}
            />
          ))}
        </div>

        {/* Center: Deck + Discard */}
        <div className="flex items-center gap-6">
          <DeckPile
            remaining={gs.deckRemaining}
            disabled={true}
          />
          <DiscardPile topCard={gs.discardTop} />
        </div>

        {/* Turn Controls */}
        {gs.status === 'playing' && (
          <TurnControls
            isMyTurn={isMyTurn}
            phase={gs.phase}
            actedThisRound={myPlayer?.actedThisRound ?? false}
            onShow={handleShow}
            showLoading={false}
          />
        )}

        {/* My Hand */}
        <MyHand
          cards={myHand.cards}
          faceUp={gs.status === 'viewing'}
          selectedPosition={store.selectedPosition}
          revealedPosition={store.revealedPosition}
          onSelectCard={handlePlayCard}
          phase={gs.phase}
          isMyTurn={isMyTurn}
        />
      </div>

      {/* Overlays */}
      {gs.status === 'viewing' && (
        <ViewingPhaseOverlay
          cards={myHand.cards}
          isHost={true}
          duration={viewingDuration}
          onRearrange={handleRearrange}
          onEndViewing={handleEndViewing}
          loading={false}
        />
      )}

      {gs.activePowerUp && gs.activePowerUp.playerId === PLAYER_ID && (
        <PowerUpOverlay
          gameState={gs}
          players={game.players}
          myId={PLAYER_ID}
          myCards={myHand.cards}
          onResolvePU7={handlePU7}
          onResolvePU9={handlePU9}
          onResolvePU11={handlePU11}
          onResolvePU13={handlePU13}
          onSkip={handleSkipPU}
          peekedCards={store.peekedCards}
          loading={false}
        />
      )}

      <ShowResultModal
        open={gs.status === 'finished'}
        gameState={gs}
        players={game.players}
        onPlayAgain={handlePlayAgain}
        onLeave={() => router.push('/')}
      />

      <HowToPlayModal
        open={store.showHowToPlay}
        onClose={() => store.setShowHowToPlay(false)}
      />
    </div>
  );
}
