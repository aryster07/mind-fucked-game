// ============ LOGIC TESTS ============
// Testing all core logic modules

import { 
  getScore, 
  getPower, 
  validateShow, 
  findWinner,
  POWER_MAP,
  POWER_INFO 
} from './gameplay.js';

import { 
  createDeck, 
  shuffle, 
  throwAndDraw,
  rearrangeHand,
  shuffleHand 
} from './board.js';

import {
  createPlayer,
  swapPlayerCards,
  calculatePlayerScores
} from './players.js';

// Test Results
const results = [];

// ============ TEST: Gameplay Module ============
console.log('🧪 Testing Gameplay Module...');

// Test getScore
const testHand = [
  { value: 1, rank: 'A', suit: '♠' },
  { value: 7, rank: '7', suit: '♥' },
  { value: 3, rank: '3', suit: '♦' },
  null
];
const score = getScore(testHand);
results.push({ test: 'getScore', expected: 11, actual: score, pass: score === 11 });

// Test getPower
const sevenCard = { value: 7, rank: '7', suit: '♥' };
const aceCard = { value: 1, rank: 'A', suit: '♠' };
const power7 = getPower(sevenCard);
const powerA = getPower(aceCard);
results.push({ test: 'getPower (7)', expected: 'REFRESH', actual: power7, pass: power7 === 'REFRESH' });
results.push({ test: 'getPower (Ace)', expected: null, actual: powerA, pass: powerA === null });

// Test validateShow
const validShow = validateShow(10);
const invalidShow = validateShow(15);
results.push({ test: 'validateShow (valid)', expected: true, actual: validShow, pass: validShow === true });
results.push({ test: 'validateShow (invalid)', expected: false, actual: invalidShow, pass: invalidShow === false });

// Test findWinner
const testPlayers = [
  { id: 'p1', name: 'Player 1', hand: [{ value: 5 }, { value: 5 }, { value: 1 }, { value: 1 }] },
  { id: 'p2', name: 'Player 2', hand: [{ value: 3 }, { value: 3 }, { value: 2 }, { value: 1 }] },
];
const winner = findWinner(testPlayers, 0, 12);
results.push({ test: 'findWinner (bust)', expected: 'p2', actual: winner.winnerId, pass: winner.winnerId === 'p2' });

// ============ TEST: Board Module ============
console.log('🧪 Testing Board Module...');

// Test createDeck
const deck = createDeck();
results.push({ test: 'createDeck size', expected: 52, actual: deck.length, pass: deck.length === 52 });
results.push({ test: 'createDeck unique', expected: true, actual: new Set(deck.map(c => c.id)).size === 52, pass: new Set(deck.map(c => c.id)).size === 52 });

// Test shuffle
const arr = [1, 2, 3, 4, 5];
const shuffled = shuffle(arr);
results.push({ test: 'shuffle preserves length', expected: 5, actual: shuffled.length, pass: shuffled.length === 5 });
results.push({ test: 'shuffle preserves elements', expected: true, actual: shuffled.sort().join('') === '12345', pass: shuffled.sort().join('') === '12345' });

// Test throwAndDraw
const playerHand = [
  { value: 7, rank: '7', suit: '♥', id: '7♥' },
  { value: 3, rank: '3', suit: '♦', id: '3♦' },
  { value: 1, rank: 'A', suit: '♠', id: 'A♠' },
  { value: 5, rank: '5', suit: '♣', id: '5♣' }
];
const testDeck = createDeck();
const testDiscard = [];
const throwResult = throwAndDraw(playerHand, 0, testDeck, testDiscard);
results.push({ test: 'throwAndDraw hand size', expected: 4, actual: throwResult?.newHand?.length, pass: throwResult?.newHand?.length === 4 });
results.push({ test: 'throwAndDraw deck decreased', expected: 51, actual: throwResult?.newDeck?.length, pass: throwResult?.newDeck?.length === 51 });
results.push({ test: 'throwAndDraw discard increased', expected: 1, actual: throwResult?.newDiscard?.length, pass: throwResult?.newDiscard?.length === 1 });

// Test rearrangeHand
const hand = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
const rearranged = rearrangeHand(hand, 0, 2);
results.push({ test: 'rearrangeHand swap', expected: 'c', actual: rearranged[0]?.id, pass: rearranged[0]?.id === 'c' });

// ============ TEST: Players Module ============
console.log('🧪 Testing Players Module...');

// Test createPlayer
const player = createPlayer('p1', 'Player 1', [], true);
results.push({ test: 'createPlayer id', expected: 'p1', actual: player.id, pass: player.id === 'p1' });
results.push({ test: 'createPlayer isYou', expected: true, actual: player.isYou, pass: player.isYou === true });

// Test swapPlayerCards
const players = [
  { id: 'p1', hand: [{ id: 'a' }, { id: 'b' }] },
  { id: 'p2', hand: [{ id: 'c' }, { id: 'd' }] }
];
const swapped = swapPlayerCards(players, 'p1', 0, 'p2', 1);
results.push({ test: 'swapPlayerCards p1[0]', expected: 'd', actual: swapped[0].hand[0]?.id, pass: swapped[0].hand[0]?.id === 'd' });
results.push({ test: 'swapPlayerCards p2[1]', expected: 'a', actual: swapped[1].hand[1]?.id, pass: swapped[1].hand[1]?.id === 'a' });

// ============ PRINT RESULTS ============
console.log('\n📊 TEST RESULTS:\n');
const passed = results.filter(r => r.pass).length;
const total = results.length;

results.forEach(r => {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} ${r.test}: expected ${r.expected}, got ${r.actual}`);
});

console.log(`\n🎯 Passed: ${passed}/${total} (${Math.round(passed/total * 100)}%)\n`);

if (passed === total) {
  console.log('✨ All tests passed! Logic is sound.');
} else {
  console.log('⚠️  Some tests failed. Review logic above.');
}
