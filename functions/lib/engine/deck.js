"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.shuffleDeck = shuffleDeck;
exports.dealCards = dealCards;
exports.shufflePositions = shufflePositions;
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (let value = 1; value <= 13; value++) {
            deck.push({ value, suit });
        }
    }
    return deck;
}
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function dealCards(deck, numPlayers, cardsPerPlayer) {
    const remaining = [...deck];
    const hands = [];
    for (let p = 0; p < numPlayers; p++) {
        const hand = [];
        for (let c = 0; c < cardsPerPlayer; c++) {
            const card = remaining.shift();
            if (!card)
                throw new Error('Not enough cards in deck');
            hand.push({ ...card, position: c });
        }
        hands.push(hand);
    }
    return { hands, remaining };
}
function shufflePositions(cards) {
    const positions = cards.map((c) => c.position);
    // Fisher-Yates on positions
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return cards.map((card, idx) => ({ ...card, position: positions[idx] }));
}
//# sourceMappingURL=deck.js.map