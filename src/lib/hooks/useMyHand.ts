import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PlayerHand } from '@/types/game';

export function useMyHand(gameId: string | undefined, playerId: string | null) {
  const [hand, setHand] = useState<PlayerHand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId || !playerId) return;

    const ref = doc(db, 'games', gameId, 'hands', playerId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setHand(snap.data() as PlayerHand);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [gameId, playerId]);

  return { hand, loading };
}
