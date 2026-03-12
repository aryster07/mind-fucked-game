import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createDeck, shuffleDeck, dealCards, shufflePositions } from './engine/deck';
import { advanceTurn, calculateHandSum, isShowValid, isPowerUpCard, generateRoomCode } from './engine/game-logic';
import { GameState, PlayerPublic, PlayerHand, DeckDocument, PositionedCard } from './engine/types';

admin.initializeApp();
const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext): string {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }
  return context.auth.uid;
}

// ─── CREATE GAME ─────────────────────────────────────────────────────────────

export const createGame = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { name } = data as { name: string };
  if (!name || name.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Name is required');
  }

  const roomCode = generateRoomCode();
  const gameRef = db.collection('games').doc();
  const gameId = gameRef.id;

  const gameState: GameState = {
    status: 'waiting',
    phase: 'idle',
    currentTurn: '',
    turnOrder: [],
    turnIndex: 0,
    roundNumber: 0,
    deckRemaining: 0,
    discardTop: null,
    hostId: playerId,
    roomCode,
    createdAt: Date.now(),
    showCallerId: null,
    showCallerSum: null,
    winnerId: null,
    activePowerUp: null,
  };

  const playerData: PlayerPublic = {
    name: name.trim(),
    connected: true,
    cardCount: 0,
    seatIndex: 0,
    actedThisRound: false,
  };

  const batch = db.batch();
  batch.set(gameRef.collection('state').doc('current'), gameState);
  batch.set(gameRef.collection('players').doc(playerId), playerData);
  await batch.commit();

  return { gameId, roomCode };
});

// ─── JOIN GAME ───────────────────────────────────────────────────────────────

export const joinGame = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { roomCode, name } = data as { roomCode: string; name: string };

  if (!roomCode || !name?.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Room code and name are required');
  }

  // Find game by room code
  const gamesSnapshot = await db.collectionGroup('state')
    .where('roomCode', '==', roomCode.toUpperCase())
    .where('status', '==', 'waiting')
    .limit(1)
    .get();

  if (gamesSnapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'Game not found or already started');
  }

  const stateDoc = gamesSnapshot.docs[0];
  const gameRef = stateDoc.ref.parent.parent!;
  const gameId = gameRef.id;

  // Check player count
  const playersSnapshot = await gameRef.collection('players').get();
  if (playersSnapshot.size >= 6) {
    throw new functions.https.HttpsError('resource-exhausted', 'Game is full (max 6 players)');
  }

  // Check if already in game
  const existingPlayer = playersSnapshot.docs.find(d => d.id === playerId);
  if (existingPlayer) {
    return { gameId, roomCode: roomCode.toUpperCase() };
  }

  const playerData: PlayerPublic = {
    name: name.trim(),
    connected: true,
    cardCount: 0,
    seatIndex: playersSnapshot.size,
    actedThisRound: false,
  };

  await gameRef.collection('players').doc(playerId).set(playerData);

  return { gameId, roomCode: roomCode.toUpperCase() };
});

// ─── JOIN BY GAME ID ─────────────────────────────────────────────────────────

export const joinGameById = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, name } = data as { gameId: string; name: string };

  if (!gameId || !name?.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Game ID and name are required');
  }

  const gameRef = db.collection('games').doc(gameId);
  const stateDoc = await gameRef.collection('state').doc('current').get();

  if (!stateDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Game not found');
  }

  const state = stateDoc.data() as GameState;
  if (state.status !== 'waiting') {
    throw new functions.https.HttpsError('failed-precondition', 'Game already started');
  }

  const playersSnapshot = await gameRef.collection('players').get();
  if (playersSnapshot.size >= 6) {
    throw new functions.https.HttpsError('resource-exhausted', 'Game is full');
  }

  const existingPlayer = playersSnapshot.docs.find(d => d.id === playerId);
  if (existingPlayer) {
    return { gameId, roomCode: state.roomCode };
  }

  const playerData: PlayerPublic = {
    name: name.trim(),
    connected: true,
    cardCount: 0,
    seatIndex: playersSnapshot.size,
    actedThisRound: false,
  };

  await gameRef.collection('players').doc(playerId).set(playerData);
  return { gameId, roomCode: state.roomCode };
});

// ─── START GAME ──────────────────────────────────────────────────────────────

export const startGame = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId } = data as { gameId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');
  const stateDoc = await stateRef.get();

  if (!stateDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Game not found');
  }

  const state = stateDoc.data() as GameState;
  if (state.hostId !== playerId) {
    throw new functions.https.HttpsError('permission-denied', 'Only the host can start the game');
  }
  if (state.status !== 'waiting') {
    throw new functions.https.HttpsError('failed-precondition', 'Game already started');
  }

  const playersSnapshot = await gameRef.collection('players').get();
  if (playersSnapshot.size < 2) {
    throw new functions.https.HttpsError('failed-precondition', 'Need at least 2 players');
  }

  // Create and shuffle deck, deal cards
  const deck = shuffleDeck(createDeck());
  const playerIds = playersSnapshot.docs.map(d => d.id);
  const { hands, remaining } = dealCards(deck, playerIds.length, 4);

  const batch = db.batch();

  // Save each player's hand
  playerIds.forEach((pid, idx) => {
    const handData: PlayerHand = { cards: hands[idx], drawnCard: null };
    batch.set(gameRef.collection('hands').doc(pid), handData);
    batch.update(gameRef.collection('players').doc(pid), { cardCount: 4, actedThisRound: false });
  });

  // Save remaining deck
  const deckData: DeckDocument = { cards: remaining, discard: [] };
  batch.set(gameRef.collection('deck').doc('current'), deckData);

  // Update game state
  const turnOrder = playerIds.sort(() => Math.random() - 0.5);
  batch.update(stateRef, {
    status: 'viewing',
    phase: 'idle',
    currentTurn: turnOrder[0],
    turnOrder,
    turnIndex: 0,
    roundNumber: 1,
    deckRemaining: remaining.length,
  });

  await batch.commit();
  return { success: true };
});

// ─── END VIEWING PHASE ──────────────────────────────────────────────────────

export const endViewingPhase = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId } = data as { gameId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');
  const stateDoc = await stateRef.get();
  const state = stateDoc.data() as GameState;

  if (state.hostId !== playerId) {
    throw new functions.https.HttpsError('permission-denied', 'Only the host can end viewing');
  }
  if (state.status !== 'viewing') {
    throw new functions.https.HttpsError('failed-precondition', 'Game is not in viewing phase');
  }

  await stateRef.update({ status: 'playing', phase: 'draw' });
  return { success: true };
});

// ─── REARRANGE CARDS (during viewing phase) ─────────────────────────────────

export const rearrangeCards = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, newOrder } = data as { gameId: string; newOrder: number[] };

  if (!Array.isArray(newOrder) || newOrder.length !== 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Must provide 4 positions');
  }

  const sorted = [...newOrder].sort();
  if (sorted[0] !== 0 || sorted[1] !== 1 || sorted[2] !== 2 || sorted[3] !== 3) {
    throw new functions.https.HttpsError('invalid-argument', 'Positions must be 0-3');
  }

  const gameRef = db.collection('games').doc(gameId);
  const stateDoc = await gameRef.collection('state').doc('current').get();
  const state = stateDoc.data() as GameState;

  if (state.status !== 'viewing') {
    throw new functions.https.HttpsError('failed-precondition', 'Can only rearrange during viewing phase');
  }

  const handRef = gameRef.collection('hands').doc(playerId);
  const handDoc = await handRef.get();
  if (!handDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Hand not found');
  }

  const hand = handDoc.data() as PlayerHand;
  const reordered = hand.cards.map((card, idx) => ({
    ...card,
    position: newOrder[idx],
  }));

  await handRef.update({ cards: reordered });
  return { success: true };
});

// ─── DRAW CARD ───────────────────────────────────────────────────────────────

export const drawCard = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId } = data as { gameId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.status !== 'playing') {
      throw new functions.https.HttpsError('failed-precondition', 'Game is not in playing phase');
    }
    if (state.currentTurn !== playerId) {
      throw new functions.https.HttpsError('permission-denied', 'Not your turn');
    }
    if (state.phase !== 'draw') {
      throw new functions.https.HttpsError('failed-precondition', 'Already drew a card this turn');
    }

    const deckRef = gameRef.collection('deck').doc('current');
    const deckDoc = await t.get(deckRef);
    const deck = deckDoc.data() as DeckDocument;

    if (deck.cards.length === 0) {
      // Reshuffle discard pile into deck
      if (deck.discard.length === 0) {
        throw new functions.https.HttpsError('failed-precondition', 'No cards left');
      }
      const reshuffled = shuffleDeck([...deck.discard]);
      deck.cards = reshuffled;
      deck.discard = [];
    }

    const drawnCard = deck.cards.shift()!;

    const handRef = gameRef.collection('hands').doc(playerId);
    const handDoc = await t.get(handRef);
    const hand = handDoc.data() as PlayerHand;

    t.update(handRef, { drawnCard });
    t.update(deckRef, { cards: deck.cards, discard: deck.discard });
    t.update(stateRef, {
      phase: 'swap',
      deckRemaining: deck.cards.length,
    });
    // Mark player has acted this round
    t.update(gameRef.collection('players').doc(playerId), { actedThisRound: true });

    return { drawnCard };
  });
});

// ─── SWAP CARD ───────────────────────────────────────────────────────────────

export const swapCard = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, position } = data as { gameId: string; position: number };

  if (position < 0 || position > 3) {
    throw new functions.https.HttpsError('invalid-argument', 'Position must be 0-3');
  }

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.currentTurn !== playerId) {
      throw new functions.https.HttpsError('permission-denied', 'Not your turn');
    }
    if (state.phase !== 'swap') {
      throw new functions.https.HttpsError('failed-precondition', 'Must draw a card first');
    }

    const handRef = gameRef.collection('hands').doc(playerId);
    const handDoc = await t.get(handRef);
    const hand = handDoc.data() as PlayerHand;

    if (!hand.drawnCard) {
      throw new functions.https.HttpsError('failed-precondition', 'No drawn card to swap');
    }

    // Find the card at the given position
    const cardIndex = hand.cards.findIndex(c => c.position === position);
    if (cardIndex === -1) {
      throw new functions.https.HttpsError('invalid-argument', 'No card at that position');
    }

    const discardedCard = hand.cards[cardIndex];
    const newCard = { ...hand.drawnCard, position };
    const newCards = [...hand.cards];
    newCards[cardIndex] = newCard;

    // Update hand
    t.update(handRef, { cards: newCards, drawnCard: null });

    // Add discarded card to discard pile
    const deckRef = gameRef.collection('deck').doc('current');
    const deckDoc = await t.get(deckRef);
    const deck = deckDoc.data() as DeckDocument;
    deck.discard.push({ value: discardedCard.value, suit: discardedCard.suit });
    t.update(deckRef, { discard: deck.discard });

    // Check if discarded card triggers a power-up
    if (isPowerUpCard(discardedCard.value)) {
      const powerUpType = discardedCard.value as 7 | 9 | 11 | 13;
      const stateUpdate: Partial<GameState> = {
        discardTop: { value: discardedCard.value, suit: discardedCard.suit },
        phase: `power_up_${powerUpType}` as GameState['phase'],
        activePowerUp: {
          type: powerUpType,
          playerId,
        },
      };

      // For power-up 7, include the player's cards
      if (powerUpType === 7) {
        stateUpdate.activePowerUp!.revealedCards = newCards;
      }

      t.update(stateRef, stateUpdate);
      return { powerUp: powerUpType, discardedCard: { value: discardedCard.value, suit: discardedCard.suit } };
    }

    // No power-up — advance turn
    const turnUpdate = advanceTurn(state);
    t.update(stateRef, {
      ...turnUpdate,
      discardTop: { value: discardedCard.value, suit: discardedCard.suit },
    });

    // Reset actedThisRound for next player if new round
    if (turnUpdate.roundNumber! > state.roundNumber) {
      // New round: reset all players' actedThisRound
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => {
        t.update(doc.ref, { actedThisRound: false });
      });
    }

    return { discardedCard: { value: discardedCard.value, suit: discardedCard.suit } };
  });
});

// ─── POWER-UP 7: VIEW & REARRANGE ───────────────────────────────────────────

export const resolvePowerUp7 = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, newOrder } = data as { gameId: string; newOrder: number[] };

  if (!Array.isArray(newOrder) || newOrder.length !== 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Must provide 4 positions');
  }

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.phase !== 'power_up_7' || state.activePowerUp?.playerId !== playerId) {
      throw new functions.https.HttpsError('failed-precondition', 'Not in power-up 7 phase');
    }

    const handRef = gameRef.collection('hands').doc(playerId);
    const handDoc = await t.get(handRef);
    const hand = handDoc.data() as PlayerHand;

    const reordered = hand.cards.map((card, idx) => ({
      ...card,
      position: newOrder[idx],
    }));

    t.update(handRef, { cards: reordered });

    // Advance turn
    const turnUpdate = advanceTurn(state);
    t.update(stateRef, turnUpdate);

    if (turnUpdate.roundNumber! > state.roundNumber) {
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => t.update(doc.ref, { actedThisRound: false }));
    }

    return { success: true };
  });
});

// ─── POWER-UP 9: SWAP WITH OPPONENT ──────────────────────────────────────────

export const resolvePowerUp9 = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, targetPlayerId, targetPosition, myPosition } = data as {
    gameId: string;
    targetPlayerId: string;
    targetPosition: number;
    myPosition: number;
  };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.phase !== 'power_up_9' || state.activePowerUp?.playerId !== playerId) {
      throw new functions.https.HttpsError('failed-precondition', 'Not in power-up 9 phase');
    }

    const myHandRef = gameRef.collection('hands').doc(playerId);
    const targetHandRef = gameRef.collection('hands').doc(targetPlayerId);
    const myHandDoc = await t.get(myHandRef);
    const targetHandDoc = await t.get(targetHandRef);

    const myHand = myHandDoc.data() as PlayerHand;
    const targetHand = targetHandDoc.data() as PlayerHand;

    const myCardIdx = myHand.cards.findIndex(c => c.position === myPosition);
    const targetCardIdx = targetHand.cards.findIndex(c => c.position === targetPosition);

    if (myCardIdx === -1 || targetCardIdx === -1) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid card positions');
    }

    // Swap: my card goes to target's position, target's card comes to my position
    const myCard = myHand.cards[myCardIdx];
    const targetCard = targetHand.cards[targetCardIdx];

    const newMyCards = [...myHand.cards];
    newMyCards[myCardIdx] = { ...targetCard, position: myPosition };

    const newTargetCards = [...targetHand.cards];
    newTargetCards[targetCardIdx] = { ...myCard, position: targetPosition };

    t.update(myHandRef, { cards: newMyCards });
    t.update(targetHandRef, { cards: newTargetCards });

    // Advance turn
    const turnUpdate = advanceTurn(state);
    t.update(stateRef, turnUpdate);

    if (turnUpdate.roundNumber! > state.roundNumber) {
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => t.update(doc.ref, { actedThisRound: false }));
    }

    // Return the card taken from target (caller can see it)
    return { takenCard: { value: targetCard.value, suit: targetCard.suit } };
  });
});

// ─── POWER-UP 11: SHUFFLE OPPONENT ───────────────────────────────────────────

export const resolvePowerUp11 = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, targetPlayerId } = data as { gameId: string; targetPlayerId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.phase !== 'power_up_11' || state.activePowerUp?.playerId !== playerId) {
      throw new functions.https.HttpsError('failed-precondition', 'Not in power-up 11 phase');
    }

    const targetHandRef = gameRef.collection('hands').doc(targetPlayerId);
    const targetHandDoc = await t.get(targetHandRef);
    const targetHand = targetHandDoc.data() as PlayerHand;

    const shuffled = shufflePositions(targetHand.cards);
    t.update(targetHandRef, { cards: shuffled });

    // Advance turn
    const turnUpdate = advanceTurn(state);
    t.update(stateRef, turnUpdate);

    if (turnUpdate.roundNumber! > state.roundNumber) {
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => t.update(doc.ref, { actedThisRound: false }));
    }

    return { success: true };
  });
});

// ─── POWER-UP 13: PEEK AT OPPONENT ───────────────────────────────────────────

export const resolvePowerUp13 = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, targetPlayerId } = data as { gameId: string; targetPlayerId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.phase !== 'power_up_13' || state.activePowerUp?.playerId !== playerId) {
      throw new functions.https.HttpsError('failed-precondition', 'Not in power-up 13 phase');
    }

    const targetHandRef = gameRef.collection('hands').doc(targetPlayerId);
    const targetHandDoc = await t.get(targetHandRef);
    const targetHand = targetHandDoc.data() as PlayerHand;

    // Advance turn
    const turnUpdate = advanceTurn(state);
    t.update(stateRef, turnUpdate);

    if (turnUpdate.roundNumber! > state.roundNumber) {
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => t.update(doc.ref, { actedThisRound: false }));
    }

    // Return target's cards to the caller (read-only peek)
    return { revealedCards: targetHand.cards };
  });
});

// ─── SKIP POWER-UP ───────────────────────────────────────────────────────────

export const skipPowerUp = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId } = data as { gameId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (!state.activePowerUp || state.activePowerUp.playerId !== playerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No active power-up to skip');
    }

    const turnUpdate = advanceTurn(state);
    t.update(stateRef, turnUpdate);

    if (turnUpdate.roundNumber! > state.roundNumber) {
      const playersSnapshot = await gameRef.collection('players').get();
      playersSnapshot.docs.forEach(doc => t.update(doc.ref, { actedThisRound: false }));
    }

    return { success: true };
  });
});

// ─── CALL SHOW ───────────────────────────────────────────────────────────────

export const callShow = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId } = data as { gameId: string };

  const gameRef = db.collection('games').doc(gameId);
  const stateRef = gameRef.collection('state').doc('current');

  return db.runTransaction(async (t) => {
    const stateDoc = await t.get(stateRef);
    const state = stateDoc.data() as GameState;

    if (state.status !== 'playing') {
      throw new functions.https.HttpsError('failed-precondition', 'Game is not in playing phase');
    }
    if (state.currentTurn !== playerId) {
      throw new functions.https.HttpsError('permission-denied', 'Not your turn');
    }

    // Check if player has acted this round
    const playerDoc = await t.get(gameRef.collection('players').doc(playerId));
    const player = playerDoc.data() as PlayerPublic;

    const handRef = gameRef.collection('hands').doc(playerId);
    const handDoc = await t.get(handRef);
    const hand = handDoc.data() as PlayerHand;
    const sum = calculateHandSum(hand.cards);

    const validation = isShowValid(player.actedThisRound, sum);
    if (!validation.valid) {
      throw new functions.https.HttpsError('failed-precondition', validation.reason!);
    }

    // Collect all hands for reveal
    const allHands: Record<string, PositionedCard[]> = {};
    for (const pid of state.turnOrder) {
      const h = await t.get(gameRef.collection('hands').doc(pid));
      allHands[pid] = (h.data() as PlayerHand).cards;
    }

    t.update(stateRef, {
      status: 'finished',
      phase: 'show',
      showCallerId: playerId,
      showCallerSum: sum,
      winnerId: playerId,
      activePowerUp: null,
    });

    return { winnerId: playerId, sum, allHands };
  });
});

// ─── UPDATE CONNECTION STATUS ────────────────────────────────────────────────

export const updateConnection = functions.https.onCall(async (data, context) => {
  const playerId = assertAuth(context);
  const { gameId, connected } = data as { gameId: string; connected: boolean };

  const gameRef = db.collection('games').doc(gameId);
  await gameRef.collection('players').doc(playerId).update({ connected });
  return { success: true };
});
