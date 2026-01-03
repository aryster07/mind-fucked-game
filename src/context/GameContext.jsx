
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createDeck, shuffleDeck, calculateScore } from '../services/game/deck.service';
import { dealCards } from '../services/game/player.service';

const GameContext = createContext();

const initialState = {
    status: 'MENU',
    players: [],
    deck: [],
    discardPile: [],
    turnIndex: 0,
    turnPhase: 'THROW',
    activeCard: null,
    winner: null,
    notification: 'Welcome to Mind F**ked',
    roomCode: null,
    isHost: false,
    powerAction: null,
    sourceCardIndex: null,
    thrownSlotIndex: null, // Track which slot was emptied
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'START_SOLO':
            const deck = shuffleDeck(createDeck());
            // Deal 4 cards to each player
            const { players, drawPile } = dealCards(deck, 4, 4);

            // Flip User cards Face Up for memorization
            const playersWithFaceUp = players.map((p, i) =>
                i === 0 ? { ...p, hand: p.hand.map(c => ({ ...c, faceUp: true })) } : p
            );

            return {
                ...state,
                status: 'PRE_GAME',
                players: playersWithFaceUp,
                deck: drawPile,
                discardPile: [],
                turnIndex: 0,
                turnPhase: 'THROW',
                notification: 'Memorize & Arrange your cards! (8s)',
                thrownSlotIndex: null,
            };
        case 'START_GAME_PLAY':
            return {
                ...state,
                status: 'PLAYING',
                notification: "Your Turn! Throw a card.",
                players: state.players.map(p => ({
                    ...p,
                    hand: p.hand.map(c => ({ ...c, faceUp: false }))
                }))
            };
        case 'THROW_CARD': {
            const { playerIndex, cardIndex } = action.payload;
            const player = state.players[playerIndex];
            const cardToThrow = player.hand[cardIndex];

            // Slot Persistence: Do NOT remove the item, replace with null to preserve indices
            const newHand = [...player.hand];
            newHand[cardIndex] = null;

            const newDiscard = [...state.discardPile, { ...cardToThrow, faceUp: true }];

            const newPlayers = [...state.players];
            newPlayers[playerIndex] = { ...player, hand: newHand };

            return {
                ...state,
                players: newPlayers,
                discardPile: newDiscard,
                turnPhase: 'RECEIVE',
                notification: `${player.name} threw ${cardToThrow.rank}${cardToThrow.suit}`,
                thrownCardValue: cardToThrow.value,
                thrownSlotIndex: cardIndex // Remember which slot was thrown
            };
        }
        case 'DRAW_CARD': {
            const { playerIndex } = action.payload;
            const player = state.players[playerIndex];

            // If deck empty, reshuffle discard (excluding top card if possible, or simplified just reset)
            let currentDeck = state.deck;
            if (state.deck.length === 0) {
                // Simplified reshuffle for MVP: just use infinite deck or reset
                // return state; 
            }

            const newDeck = [...currentDeck];
            const newCard = newDeck.shift();

            // Slot Persistence: Put new card into the 'thrownSlotIndex'
            // For bots (or if logic fails), use first empty slot
            const targetSlot = state.thrownSlotIndex !== null ? state.thrownSlotIndex : player.hand.indexOf(null);

            const newHand = [...player.hand];
            if (targetSlot >= 0 && targetSlot < 4) {
                newHand[targetSlot] = { ...newCard, faceUp: true };
            } else {
                // Fallback
                newHand.push({ ...newCard, faceUp: true });
            }

            const newPlayers = [...state.players];
            newPlayers[playerIndex] = { ...player, hand: newHand };

            // Power Up Logic
            const lastThrown = state.discardPile[state.discardPile.length - 1];

            let nextPhase = 'REVEAL';
            let powerAction = null;
            let notification = `${player.name} drew a card...`;

            if (lastThrown) {
                const val = lastThrown.value;
                if (val === 7) {
                    nextPhase = 'POWER_ACTION';
                    powerAction = 'PEARRANGE_SELF'; // Name check: existing logic usually checked 'PEEK'
                    notification = "Power 7! Rearrange & Peek your cards.";
                }
                else if (val === 9) {
                    nextPhase = 'POWER_ACTION';
                    powerAction = 'SWAP_SELF';
                    notification = "Power 9! Select your card to swap.";
                }
                else if (val === 11) {
                    nextPhase = 'POWER_ACTION';
                    powerAction = 'SHUFFLE_OPP';
                    notification = "Jack Power! Select opponent to shuffle.";
                }
                else if (val === 13) {
                    nextPhase = 'POWER_ACTION';
                    powerAction = 'SPY';
                    notification = "King Power! Select opponent card to spy.";
                }
            }

            return {
                ...state,
                deck: newDeck,
                players: newPlayers,
                turnPhase: nextPhase,
                powerAction,
                notification,
                activeCard: newCard,
                thrownSlotIndex: null
            };
        }
        case 'CALL_SHOW': {
            const { playerIndex } = action.payload;

            // Determine winner
            // Reveal all cards
            let minScore = 999;
            let winnerId = null;

            const finalPlayers = state.players.map(p => {
                // Handle nulls if any (shouldn't be)
                const safeHand = p.hand.filter(c => c !== null);
                const pScore = calculateScore(safeHand);
                if (pScore < minScore) {
                    minScore = pScore;
                    winnerId = p.id;
                }
                return { ...p, hand: p.hand.map(c => c ? { ...c, faceUp: true } : null), score: pScore };
            });

            // If tie, logic? Assume first lowest wins or logic needed. MVP: Lowest wins.

            return {
                ...state,
                status: 'GAME_OVER',
                players: finalPlayers,
                winner: winnerId,
                notification: winnerId === 'user' ? "YOU WON! Mind F**ked Master!" : `Bot ${String(winnerId).split('-')[1]} Won with score ${minScore}!`
            };
        }
        case 'EXECUTE_POWER': {
            const { actionType, targetPlayerId, cardIndex, sourceCardIndex, targetCardIndex } = action.payload;

            let newPlayers = [...state.players];
            let notification = state.notification;

            if (actionType === 'PEARRANGE_SELF') {
                // Show all cards for user (UI handles visibility via state or we force faceUp temp)
                // Actually 'Rearrange' implies moving them. 
                // Implementing Drag n Drop is complex. 
                // MVP: Just Peek (Reveal all cards briefly).
                const player = newPlayers[0];
                const newHand = player.hand.map(c => ({ ...c, faceUp: true }));
                newPlayers[0] = { ...player, hand: newHand };
                notification = "Rearranging/Peeking at your hand...";
            }
            else if (actionType === 'SPY') {
                const targetPlayerIndex = state.players.findIndex(p => p.id === targetPlayerId);
                const targetPlayer = newPlayers[targetPlayerIndex];
                const newHand = [...targetPlayer.hand];
                if (newHand[cardIndex]) newHand[cardIndex] = { ...newHand[cardIndex], faceUp: true };
                newPlayers[targetPlayerIndex] = { ...targetPlayer, hand: newHand };
                notification = `You spied on ${targetPlayer.name}'s card.`;
            }
            else if (actionType === 'SWAP') {
                const targetPlayerIndex = state.players.findIndex(p => p.id === targetPlayerId);
                const sourcePlayer = newPlayers[0];
                const targetPlayer = newPlayers[targetPlayerIndex];

                const sourceCard = sourcePlayer.hand[sourceCardIndex];
                const targetCard = targetPlayer.hand[targetCardIndex];

                const newSourceHand = [...sourcePlayer.hand];
                newSourceHand[sourceCardIndex] = targetCard;
                newSourceHand[sourceCardIndex].faceUp = true; // User sees what they got

                const newTargetHand = [...targetPlayer.hand];
                newTargetHand[targetCardIndex] = sourceCard;
                newTargetHand[targetCardIndex].faceUp = false; // Opponent doesn't see

                newPlayers[0] = { ...sourcePlayer, hand: newSourceHand };
                newPlayers[targetPlayerIndex] = { ...targetPlayer, hand: newTargetHand };
                notification = `Swapped with ${targetPlayer.name}. You got a ${targetCard.rank}.`;
            }
            else if (actionType === 'SHUFFLE_OPP') {
                const targetPlayerIndex = state.players.findIndex(p => p.id === targetPlayerId);
                const targetPlayer = newPlayers[targetPlayerIndex];
                const newHand = shuffleDeck(targetPlayer.hand);
                newPlayers[targetPlayerIndex] = { ...targetPlayer, hand: newHand };
                notification = `Shuffled ${targetPlayer.name}'s hand.`;
            }

            return {
                ...state,
                players: newPlayers,
                turnPhase: 'REVEAL',
                notification
            };
        }
        case 'END_TURN_REVEAL': {
            const currentPlayerIndex = state.turnIndex;
            const player = state.players[currentPlayerIndex];
            // Flip all face down (unless Game Over)
            const newHand = player.hand.map(c => c ? ({ ...c, faceUp: false }) : null);

            const newPlayers = [...state.players];
            newPlayers[currentPlayerIndex] = { ...player, hand: newHand };

            const nextTurnIndex = (state.turnIndex + 1) % 4;

            return {
                ...state,
                players: newPlayers,
                turnIndex: nextTurnIndex,
                turnPhase: 'THROW',
                notification: nextTurnIndex === 0 ? "Your Turn!" : `Bot ${nextTurnIndex}'s Turn...`
            };
        }
        case 'START_ONLINE_GAME': {
            const { roomCode, players } = action.payload;
            const deck = shuffleDeck(createDeck());
            const { players: dealtPlayers, drawPile } = dealCards(deck, players.length, 4);

            // Map online players to game players
            const gamePlayers = dealtPlayers.map((p, i) => ({
                ...p,
                id: players[i]?.uid || `player-${i}`,
                name: players[i]?.name || `Player ${i + 1}`,
                isBot: false,
                hand: i === 0 ? p.hand.map(c => ({ ...c, faceUp: true })) : p.hand
            }));

            return {
                ...state,
                status: 'PRE_GAME',
                players: gamePlayers,
                deck: drawPile,
                discardPile: [],
                turnIndex: 0,
                turnPhase: 'THROW',
                roomCode,
                notification: 'Memorize & Arrange your cards! (8s)',
                thrownSlotIndex: null,
            };
        }
        case 'UPDATE_STATE':
            return { ...state, ...action.payload };
        case 'SET_NOTIFICATION':
            return { ...state, notification: action.payload };
        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const startGameSolo = () => {
        dispatch({ type: 'START_SOLO' });
        setTimeout(() => {
            dispatch({ type: 'START_GAME_PLAY' });
        }, 8000);
    };

    const handleCardClick = (targetPlayerId, cardIndex) => {
        if (state.status !== 'PLAYING') return;

        const isUserTurn = state.turnIndex === 0;

        // Throw
        if (isUserTurn && state.turnPhase === 'THROW' && targetPlayerId === 'user') {
            dispatch({ type: 'THROW_CARD', payload: { playerIndex: 0, cardIndex } });
            setTimeout(() => {
                dispatch({ type: 'DRAW_CARD', payload: { playerIndex: 0 } });
            }, 600);
            return;
        }

        // Power Ups
        if (isUserTurn && state.turnPhase === 'POWER_ACTION') {
            const { powerAction } = state;

            if (powerAction === 'PEARRANGE_SELF' && targetPlayerId === 'user') {
                dispatch({ type: 'EXECUTE_POWER', payload: { actionType: 'PEARRANGE_SELF' } });
            }
            else if (powerAction === 'SPY' && targetPlayerId !== 'user') {
                dispatch({ type: 'EXECUTE_POWER', payload: { actionType: 'SPY', targetPlayerId, cardIndex } });
            }
            else if (powerAction === 'SHUFFLE_OPP' && targetPlayerId !== 'user') {
                dispatch({ type: 'EXECUTE_POWER', payload: { actionType: 'SHUFFLE_OPP', targetPlayerId } });
            }
            else if (powerAction === 'SWAP_SELF' && targetPlayerId === 'user') {
                dispatch({ type: 'UPDATE_STATE', payload: { powerAction: 'SWAP_TARGET', sourceCardIndex: cardIndex, notification: "Select opponent card to take." } });
            }
            else if (state.powerAction === 'SWAP_TARGET' && targetPlayerId !== 'user') {
                dispatch({
                    type: 'EXECUTE_POWER', payload: {
                        actionType: 'SWAP',
                        sourceCardIndex: state.sourceCardIndex,
                        targetPlayerId,
                        targetCardIndex: cardIndex
                    }
                });
            }
        }
    };

    // Auto Advance Effect
    useEffect(() => {
        if (state.status === 'PLAYING' && state.turnPhase === 'REVEAL') {
            const timer = setTimeout(() => {
                dispatch({ type: 'END_TURN_REVEAL' });
            }, 1000); // 1s reveal
            return () => clearTimeout(timer);
        }
    }, [state.status, state.turnPhase]);

    // Bot AI
    useEffect(() => {
        if (state.status !== 'PLAYING') return;
        const currentPlayer = state.players[state.turnIndex];
        if (!currentPlayer || !currentPlayer.isBot) return;

        if (state.turnPhase === 'THROW') {
            const timeout = setTimeout(() => {
                // Determine best card to throw if possible, or random
                const validIndices = currentPlayer.hand.map((c, i) => c ? i : -1).filter(i => i !== -1);
                const cardIndex = validIndices[Math.floor(Math.random() * validIndices.length)];

                dispatch({ type: 'THROW_CARD', payload: { playerIndex: state.turnIndex, cardIndex } });

                setTimeout(() => {
                    dispatch({ type: 'DRAW_CARD', payload: { playerIndex: state.turnIndex } });
                }, 600);
            }, 500);
            return () => clearTimeout(timeout);
        }

        // Bot skips powers for simplicty -> Auto reveal
        if (state.turnPhase === 'POWER_ACTION') {
            const timeout = setTimeout(() => {
                dispatch({ type: 'END_TURN_REVEAL' });
            }, 500);
            return () => clearTimeout(timeout);
        }

    }, [state.status, state.turnIndex, state.turnPhase, state.players]);

    return (
        <GameContext.Provider value={{ state, dispatch, startGameSolo, handleCardClick }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
