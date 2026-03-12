import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';
import { PositionedCard } from '@/types/game';

function useCallable<T = unknown, R = unknown>(name: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async (data: T): Promise<R | null> => {
      setLoading(true);
      setError(null);
      try {
        const fn = httpsCallable<T, R>(functions, name);
        const result = await fn(data);
        return result.data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [name]
  );

  return { call, loading, error };
}

export function useGameActions() {
  const createGame = useCallable<{ name: string }, { gameId: string; roomCode: string }>('createGame');
  const joinGameAction = useCallable<{ roomCode: string; name: string }, { gameId: string; roomCode: string }>('joinGame');
  const joinGameById = useCallable<{ gameId: string; name: string }, { gameId: string; roomCode: string }>('joinGameById');
  const startGame = useCallable<{ gameId: string }, { success: boolean }>('startGame');
  const endViewing = useCallable<{ gameId: string }, { success: boolean }>('endViewingPhase');
  const rearrangeCards = useCallable<{ gameId: string; newOrder: number[] }, { success: boolean }>('rearrangeCards');
  const drawCardAction = useCallable<{ gameId: string }, { drawnCard: { value: number; suit: string } }>('drawCard');
  const swapCardAction = useCallable<
    { gameId: string; position: number },
    { powerUp?: number; discardedCard: { value: number; suit: string } }
  >('swapCard');
  const resolvePU7 = useCallable<{ gameId: string; newOrder: number[] }, { success: boolean }>('resolvePowerUp7');
  const resolvePU9 = useCallable<
    { gameId: string; targetPlayerId: string; targetPosition: number; myPosition: number },
    { takenCard: { value: number; suit: string } }
  >('resolvePowerUp9');
  const resolvePU11 = useCallable<{ gameId: string; targetPlayerId: string }, { success: boolean }>('resolvePowerUp11');
  const resolvePU13 = useCallable<
    { gameId: string; targetPlayerId: string },
    { revealedCards: PositionedCard[] }
  >('resolvePowerUp13');
  const skipPU = useCallable<{ gameId: string }, { success: boolean }>('skipPowerUp');
  const callShowAction = useCallable<{ gameId: string }, { winnerId: string; sum: number; allHands: Record<string, unknown> }>('callShow');
  const updateConn = useCallable<{ gameId: string; connected: boolean }, { success: boolean }>('updateConnection');

  return {
    createGame,
    joinGame: joinGameAction,
    joinGameById,
    startGame,
    endViewing,
    rearrangeCards,
    drawCard: drawCardAction,
    swapCard: swapCardAction,
    resolvePowerUp7: resolvePU7,
    resolvePowerUp9: resolvePU9,
    resolvePowerUp11: resolvePU11,
    resolvePowerUp13: resolvePU13,
    skipPowerUp: skipPU,
    callShow: callShowAction,
    updateConnection: updateConn,
  };
}
