import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PlayerPublic } from '@/types/game';

export function usePlayers(gameId: string | undefined) {
  const [players, setPlayers] = useState<Record<string, PlayerPublic>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const ref = collection(db, 'games', gameId, 'players');
    const q = query(ref, orderBy('seatIndex'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Record<string, PlayerPublic> = {};
        snap.docs.forEach((d) => {
          data[d.id] = d.data() as PlayerPublic;
        });
        setPlayers(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [gameId]);

  return { players, loading };
}
