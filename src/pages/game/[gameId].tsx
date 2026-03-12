import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameState } from '@/lib/hooks/useGameState';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { useMyHand } from '@/lib/hooks/useMyHand';
import { useGameActions } from '@/lib/hooks/useGameActions';
import { onAuthChange } from '@/lib/firebase/auth';
import WaitingRoom from '@/components/lobby/WaitingRoom';
import GameTable from '@/components/game/GameTable';

export default function GamePage() {
  const router = useRouter();
  const gameId = router.query.gameId as string | undefined;
  const [myId, setMyId] = useState<string | null>(null);

  const { gameState, loading: stateLoading, error: stateError } = useGameState(gameId);
  const { players, loading: playersLoading } = usePlayers(gameId);
  const { hand } = useMyHand(gameId, myId);
  const actions = useGameActions();

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        setMyId(user.uid);
      } else {
        router.push('/');
      }
    });
    return unsub;
  }, [router]);

  // Update connection status
  useEffect(() => {
    if (!gameId || !myId) return;
    actions.updateConnection.call({ gameId, connected: true });

    const handleBeforeUnload = () => {
      actions.updateConnection.call({ gameId, connected: false });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameId, myId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stateLoading || playersLoading || !gameId || !myId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white/50 text-lg animate-pulse">Loading game...</div>
      </div>
    );
  }

  if (stateError || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{stateError || 'Game not found'}</p>
          <button onClick={() => router.push('/')} className="text-emerald-400 underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      {gameState.status === 'waiting' ? (
        <WaitingRoom
          roomCode={gameState.roomCode}
          gameId={gameId}
          players={players}
          isHost={gameState.hostId === myId}
          onStart={() => actions.startGame.call({ gameId })}
          startLoading={actions.startGame.loading}
        />
      ) : (
        <GameTable
          gameId={gameId}
          gameState={gameState}
          players={players}
          myHand={hand}
          myId={myId}
        />
      )}
    </>
  );
}
