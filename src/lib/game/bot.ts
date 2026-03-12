import { LocalGameState, playTurn, callShow, resolvePowerUp7, resolvePowerUp9, resolvePowerUp11, resolvePowerUp13, skipPowerUp } from './engine';

/**
 * Bot AI for solo mode.
 * Strategy:
 * - Track own cards (bots have perfect memory)
 * - Discard the highest-value card (new flow: select card to throw, auto-draw)
 * - Call show when sum <= 10 and haven't acted this round
 * - Power-ups: use them when beneficial, target the leading player
 */

function getHandSum(state: LocalGameState, botId: string): number {
  return state.hands[botId].cards.reduce((s, c) => s + c.value, 0);
}

function getHighestCardPosition(state: LocalGameState, botId: string): number {
  const cards = state.hands[botId].cards;
  let highest = cards[0];
  for (const card of cards) {
    if (card.value > highest.value) highest = card;
  }
  return highest.position;
}

function getOtherPlayers(state: LocalGameState, botId: string): string[] {
  return state.gameState.turnOrder.filter((id) => id !== botId);
}

export function executeBotTurn(
  state: LocalGameState,
  botId: string,
  onUpdate: (newState: LocalGameState) => void
): void {
  const gs = state.gameState;

  // If it's not this bot's turn, do nothing
  if (gs.currentTurn !== botId || gs.status !== 'playing') return;

  if (gs.phase === 'draw') {
    const player = state.players[botId];
    const sum = getHandSum(state, botId);

    // Check if bot should call show
    if (!player.actedThisRound && sum <= 10) {
      setTimeout(() => {
        const newState = callShow(state, botId);
        onUpdate(newState);
      }, 1200);
      return;
    }

    // Play turn: discard the highest-value card, auto-draw replacement
    setTimeout(() => {
      const highPos = getHighestCardPosition(state, botId);
      const afterPlay = playTurn(state, botId, highPos);
      onUpdate(afterPlay);

      // Handle power-up if triggered
      if (afterPlay.gameState.activePowerUp?.playerId === botId) {
        executeBotPowerUp(afterPlay, botId, onUpdate);
      }
    }, 1200);
    return;
  }

  // Handle active power-up
  if (gs.activePowerUp?.playerId === botId) {
    executeBotPowerUp(state, botId, onUpdate);
  }
}

function executeBotPowerUp(
  state: LocalGameState,
  botId: string,
  onUpdate: (newState: LocalGameState) => void
): void {
  const pu = state.gameState.activePowerUp;
  if (!pu) return;

  setTimeout(() => {
    const others = getOtherPlayers(state, botId);
    const randomTarget = others[Math.floor(Math.random() * others.length)];

    switch (pu.type) {
      case 7: {
        // Rearrange cards — bots just keep current order (they have perfect memory)
        const cards = state.hands[botId].cards;
        const currentOrder = [...cards].sort((a, b) => a.position - b.position).map((c) => c.position);
        const newState = resolvePowerUp7(state, botId, currentOrder);
        onUpdate(newState);
        break;
      }
      case 9: {
        // Swap highest card with a random opponent's card
        const highPos = getHighestCardPosition(state, botId);
        const targetPos = Math.floor(Math.random() * 4);
        const newState = resolvePowerUp9(state, botId, randomTarget, highPos, targetPos);
        onUpdate(newState);
        break;
      }
      case 11: {
        // Shuffle a random opponent
        const newState = resolvePowerUp11(state, randomTarget);
        onUpdate(newState);
        break;
      }
      case 13: {
        // Peek — bots just resolve it (they already "know" in solo mode)
        const newState = resolvePowerUp13(state);
        onUpdate(newState);
        break;
      }
      default: {
        const newState = skipPowerUp(state);
        onUpdate(newState);
      }
    }
  }, 1500);
}
