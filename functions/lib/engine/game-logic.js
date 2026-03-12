"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceTurn = advanceTurn;
exports.calculateHandSum = calculateHandSum;
exports.isShowValid = isShowValid;
exports.isPowerUpCard = isPowerUpCard;
exports.generateRoomCode = generateRoomCode;
function advanceTurn(state) {
    const nextIndex = (state.turnIndex + 1) % state.turnOrder.length;
    const isNewRound = nextIndex === 0;
    return {
        turnIndex: nextIndex,
        currentTurn: state.turnOrder[nextIndex],
        roundNumber: isNewRound ? state.roundNumber + 1 : state.roundNumber,
        phase: 'draw',
        activePowerUp: null,
    };
}
function calculateHandSum(cards) {
    return cards.reduce((sum, card) => sum + card.value, 0);
}
function isShowValid(actedThisRound, handSum) {
    if (actedThisRound) {
        return { valid: false, reason: 'You have already acted this round. Wait for your next turn.' };
    }
    if (handSum > 10) {
        return { valid: false, reason: `Your hand sum is ${handSum}, which is greater than 10.` };
    }
    return { valid: true };
}
function isPowerUpCard(value) {
    return value === 7 || value === 9 || value === 11 || value === 13;
}
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
//# sourceMappingURL=game-logic.js.map