import { GameState, PositionedCard } from './types';

export function advanceTurn(state: GameState): Partial<GameState> {
  const nextIndex = (state.turnIndex + 1) % state.turnOrder.length;
  const isNewRound = nextIndex === 0;
  return {
    turnIndex: nextIndex,
    currentTurn: state.turnOrder[nextIndex],
    roundNumber: isNewRound ? state.roundNumber + 1 : state.roundNumber,
    phase: 'draw' as const,
    activePowerUp: null,
  };
}

export function calculateHandSum(cards: PositionedCard[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

export function isShowValid(
  actedThisRound: boolean,
  handSum: number
): { valid: boolean; reason?: string } {
  if (actedThisRound) {
    return { valid: false, reason: 'You have already acted this round. Wait for your next turn.' };
  }
  if (handSum > 10) {
    return { valid: false, reason: `Your hand sum is ${handSum}, which is greater than 10.` };
  }
  return { valid: true };
}

export function isPowerUpCard(value: number): boolean {
  return value === 7 || value === 9 || value === 11 || value === 13;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
