import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { GameState } from '@/types/game';

export function useGameState(gameId: string | undefined) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const ref = doc(db, 'games', gameId, 'state', 'current');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setGameState(snap.data() as GameState);
        } else {
          setError('Game not found');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [gameId]);

  return { gameState, loading, error };
}
