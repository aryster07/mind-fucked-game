/**
 * Game Context Module
 * Central state management for the card game using React Context and useReducer
 */

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { updateGameState } from '../logic/firebase';
import { TIMING, getScore, findWinner } from '../logic/gameplay';
import { throwAndDraw, rearrangeHand } from '../logic/board';
import { 
  markPlayerAsYou, 
  calculatePlayerScores, 
  markPlayerBusted,
  getPlayerIndexById 
} from '../logic/players';
import { initializeSoloGame } from '../logic/host';
import { 
  getPowerFromCard, 
  getPowerInfo, 
  getPowerInstruction,
  executePower as execPower,
  POWERS
} from '../logic/powers';

// ============ SESSION PERSISTENCE ============
const SESSION_KEY = 'gameSession';

function loadSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const session = JSON.parse(saved);
      // Only restore if session is less than 2 hours old
      if (session.timestamp && Date.now() - session.timestamp < 2 * 60 * 60 * 1000) {
        return session;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveSession(state) {
  if (state.roomCode && state.currentUserId) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      roomCode: state.roomCode,
      currentUserId: state.currentUserId,
      isHost: state.isHost,
      timestamp: Date.now(),
    }));
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ============ INITIAL STATE ============
const savedSession = loadSession();
const init = {
  status: savedSession ? 'LOBBY' : 'MENU',
  players: [],
  deck: [],
  discardPile: [],
  turnIndex: 0,
  turnPhase: 'SHOW_OR_THROW',
  winner: null,
  notification: '',
  roomCode: savedSession?.roomCode || null,
  isHost: savedSession?.isHost || false,
  currentUserId: savedSession?.currentUserId || null,
  preGameEndsAt: null,
  powerAction: null,
  thrownSlotIndex: null,
  swapSourceIndex: null,
  spyingPlayerId: null,
  spyingByPlayerId: null,
  shuffledPlayerId: null,
  refreshMode: false,
  powerToast: null,
  drawnCardSlot: null,
  drawnCardRevealEnd: null,
  drawnPowerReminder: null,  // Shows reminder when you draw a power card
  swapRevealSlot: null,      // Index of card received from swap
  swapRevealEnd: null,       // Timestamp when swap reveal ends
  gameLog: [],  // Array of all game actions for the log panel
  version: 0,
  syncId: 0,
};

// ============ REDUCER ============
const reducer = (state, { type, payload }) => {
  const player = state.players[state.turnIndex];

  switch (type) {
    case 'SET_LOCAL':
      return { ...state, ...payload };

    case 'SET':
      return { ...state, ...payload, version: state.version + 1, syncId: state.syncId + 1 };

    case 'START_SOLO': {
      const soloState = initializeSoloGame('user');
      return {
        ...init,
        ...soloState,
        version: 1,
        syncId: 1,
      };
    }

    case 'START_PLAYING':
      return {
        ...state,
        status: 'PLAYING',
        preGameEndsAt: null,
        notification: `${state.players[0]?.name}'s turn`,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };

    case 'THROW_AND_DRAW': {
      const card = player?.hand[payload.cardIndex];
      if (!card) return state;

      const result = throwAndDraw(player.hand, payload.cardIndex, state.deck, state.discardPile);
      if (!result) return state;

      // Use powers module to detect if thrown card triggers a power
      const power = getPowerFromCard(card);
      
      const hasPower = !!power;
      const powerInfo = power ? getPowerInfo(power) : null;
      const instruction = power ? getPowerInstruction(power) : null;

      const newPlayers = state.players.map((p, i) =>
        i === state.turnIndex ? { ...p, hand: result.newHand } : p
      );

      // Check if the DRAWN card is a power card (reminder for later use)
      const drawnCard = result.drawnCard;
      const drawnPower = drawnCard ? getPowerFromCard(drawnCard) : null;
      const drawnPowerInfo = drawnPower ? getPowerInfo(drawnPower) : null;
      const drawnPowerReminder = drawnPower ? {
        ...drawnPowerInfo,
        cardRank: drawnCard.rank,
        message: `You drew a ${drawnCard.rank}! Throw it later to use ${drawnPowerInfo.name}!`,
        expiresAt: Date.now() + 4000,
      } : null;

      // Create log entries for this action
      const newLogEntries = [
        {
          id: Date.now() + '-throw',
          type: 'throw',
          playerId: player.id,
          playerName: player.name,
          action: 'threw',
          card: `${card.rank}${card.suit}`,
          power: hasPower ? powerInfo.name : null,
        },
        {
          id: Date.now() + '-draw',
          type: 'draw',
          playerId: player.id,
          playerName: player.name,
          action: 'drew a card',
          card: drawnCard ? `${drawnCard.rank}${drawnCard.suit}` : null,
        },
      ];

      // Reveal the drawn card for 5 seconds
      const revealDuration = 5000;

      const newState = {
        ...state,
        players: newPlayers,
        deck: result.newDeck,
        discardPile: result.newDiscard,
        turnPhase: hasPower ? 'POWER_ACTION' : 'END_TURN',
        powerAction: power,
        refreshMode: power === 'REFRESH',
        drawnCardSlot: payload.cardIndex,
        drawnCardRevealEnd: Date.now() + revealDuration,
        drawnPowerReminder: drawnPowerReminder,
        powerToast: powerInfo ? { 
          ...powerInfo,
          playerId: player.id,
          playerName: player.name,
          expiresAt: Date.now() + 3000 
        } : null,
        gameLog: [...state.gameLog, ...newLogEntries],
        notification: instruction || `${player.name} threw ${card.rank}${card.suit} and drew a card`,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };
      return newState;
    }

    case 'EXECUTE_POWER': {
      const { targetId, targetCardIdx } = payload;
      if (!state.powerAction) return state;

      // Use the new powers module to execute the power
      const result = execPower(state.powerAction, {
        players: state.players,
        currentPlayerId: player?.id,
        sourceCardIndex: state.swapSourceIndex,
        targetPlayerId: targetId,
        targetCardIndex: targetCardIdx ?? 0,
      });

      if (!result.success) return state;

      // Get target player name
      const targetPlayer = state.players.find(p => p.id === targetId);

      // Create log entry for power execution
      const powerLogEntry = {
        id: Date.now() + '-power',
        type: 'power',
        playerId: player.id,
        playerName: player.name,
        action: `used ${getPowerInfo(state.powerAction)?.name}`,
        power: getPowerInfo(state.powerAction)?.name,
        targetName: targetPlayer?.name,
      };

      // Build the new state based on power result
      const extras = {
        notification: result.notification,
        shuffledPlayerId: result.shuffledPlayerId || null,
        spyingPlayerId: result.spyingPlayerId || null,
        spyingByPlayerId: result.spyingByPlayerId || null,
      };

      // For BLIND_SWAP, reveal the received card for 3 seconds
      if (state.powerAction === 'BLIND_SWAP' && state.swapSourceIndex !== null) {
        extras.swapRevealSlot = state.swapSourceIndex;
        extras.swapRevealEnd = Date.now() + 3000; // 3 seconds reveal
      }

      return {
        ...state,
        players: result.players || state.players,
        turnPhase: 'END_TURN',
        powerAction: null,
        swapSourceIndex: null,
        powerToast: null,
        gameLog: [...state.gameLog, powerLogEntry],
        version: state.version + 1,
        syncId: state.syncId + 1,
        ...extras,
      };
    }

    case 'REFRESH_DONE':
      return {
        ...state,
        turnPhase: 'END_TURN',
        refreshMode: false,
        powerAction: null,
        notification: `${player?.name} finished rearranging`,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };

    case 'END_TURN': {
      const next = (state.turnIndex + 1) % state.players.length;
      const nextPlayer = state.players[next];
      
      // Add turn change to log
      const turnLogEntry = {
        id: Date.now() + '-turn',
        type: 'turn',
        playerId: nextPlayer?.id,
        playerName: nextPlayer?.name,
        action: "'s turn",
      };

      return {
        ...state,
        turnIndex: next,
        turnPhase: 'SHOW_OR_THROW',
        thrownSlotIndex: null,
        powerAction: null,
        swapSourceIndex: null,
        shuffledPlayerId: null,
        spyingPlayerId: null,
        spyingByPlayerId: null,
        refreshMode: false,
        drawnCardSlot: null,
        drawnCardRevealEnd: null,
        gameLog: [...state.gameLog, turnLogEntry],
        notification: `${state.players[next]?.name}'s turn`,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };
    }

    case 'CALL_SHOW': {
      const callerScore = getScore(player.hand);
      const winnerInfo = findWinner(state.players, state.turnIndex, callerScore);
      const valid = callerScore <= 10;

      let playersWithScores = calculatePlayerScores(state.players);
      if (!valid) {
        playersWithScores = markPlayerBusted(playersWithScores, player.id);
      }

      // Create log entries for show call
      const showLogEntries = [
        {
          id: Date.now() + '-show',
          type: 'show',
          playerId: player.id,
          playerName: player.name,
          action: `called SHOW with ${callerScore} points`,
        },
        {
          id: Date.now() + '-result',
          type: valid ? 'win' : 'lose',
          playerId: winnerInfo.winnerId,
          playerName: winnerInfo.winnerName,
          action: valid ? 'wins the game!' : 'wins by default (opponent busted)',
        },
      ];

      return {
        ...state,
        status: 'GAME_OVER',
        winner: winnerInfo.winnerId,
        players: playersWithScores,
        gameLog: [...state.gameLog, ...showLogEntries],
        notification: valid
          ? `${player.name} wins with ${callerScore} points!`
          : `${player.name} BUSTED! ${winnerInfo.winnerName} wins!`,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };
    }

    case 'REARRANGE': {
      if (!state.refreshMode) return state;
      const { from, to } = payload;
      const newHand = rearrangeHand(player.hand, from, to);
      const newPlayers = state.players.map((p, i) =>
        i === state.turnIndex ? { ...p, hand: newHand } : p
      );
      return {
        ...state,
        players: newPlayers,
        version: state.version + 1,
        syncId: state.syncId + 1,
      };
    }

    case 'LEAVE_GAME':
      clearSession();
      return { ...init, status: 'MENU' };

    case 'APPLY_REMOTE': {
      const { gameState, currentUserId, isHost, roomCode } = payload;
      if (!gameState) return state;
      
      // Always accept if transitioning from LOBBY/MENU to a game state
      const isGameStart = (state.status === 'LOBBY' || state.status === 'MENU') && 
                          (gameState.status === 'PRE_GAME' || gameState.status === 'PLAYING');
      
      // Skip if not game start and version is not newer
      if (!isGameStart && gameState.version <= state.version) return state;
      return {
        ...state,
        ...gameState,
        players: markPlayerAsYou(gameState.players || [], currentUserId),
        currentUserId,
        isHost: isHost ?? state.isHost,
        roomCode: roomCode ?? state.roomCode,
        powerToast: null,
        version: gameState.version,
        syncId: state.syncId,
      };
    }

    default:
      return state;
  }
};

// ============ CONTEXT ============
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, init);
  const { status, turnPhase, currentUserId, players, turnIndex, roomCode, isHost, version, syncId } = state;
  const myIndex = useMemo(() => getPlayerIndexById(players, currentUserId), [players, currentUserId]);
  const isMyTurn = myIndex >= 0 && myIndex === turnIndex;
  const lastSyncedId = useRef(0);

  // SESSION PERSISTENCE - Save session when in a room
  useEffect(() => {
    if (roomCode && currentUserId && (status === 'LOBBY' || status === 'PRE_GAME' || status === 'PLAYING')) {
      saveSession(state);
    } else if (status === 'MENU' || status === 'GAME_OVER') {
      clearSession();
    }
  }, [roomCode, currentUserId, status, isHost]);

  // PRE_GAME TIMER
  useEffect(() => {
    if (status !== 'PRE_GAME' || !state.preGameEndsAt) return;
    if (roomCode && !isHost) return;
    const delay = Math.max(0, state.preGameEndsAt - Date.now());
    const timer = setTimeout(() => dispatch({ type: 'START_PLAYING' }), delay);
    return () => clearTimeout(timer);
  }, [status, state.preGameEndsAt, roomCode, isHost]);

  // BOT AI - Auto-play for bots in solo mode
  useEffect(() => {
    // Only run in solo mode (no roomCode) during PLAYING phase
    if (roomCode || status !== 'PLAYING') return;
    
    const currentPlayer = players[turnIndex];
    if (!currentPlayer) return;
    
    // Check if current player is a bot (id starts with 'bot')
    const isBot = currentPlayer.id?.startsWith('bot');
    if (!isBot) return;
    
    // Bot decision delay (simulate thinking)
    const botDelay = 1000 + Math.random() * 1000; // 1-2 seconds
    
    if (turnPhase === 'SHOW_OR_THROW') {
      const timer = setTimeout(() => {
        // Bot randomly throws a card (picks random slot 0-3)
        const randomCardIndex = Math.floor(Math.random() * 4);
        dispatch({ type: 'THROW_AND_DRAW', payload: { cardIndex: randomCardIndex } });
      }, botDelay);
      return () => clearTimeout(timer);
    }
    
    if (turnPhase === 'POWER_ACTION') {
      const timer = setTimeout(() => {
        const power = state.powerAction;
        
        if (power === 'REFRESH') {
          // Bot just finishes refresh without rearranging
          dispatch({ type: 'REFRESH_DONE' });
        } else if (power === 'BLIND_SWAP' || power === 'CHAOS_SHUFFLE' || power === 'GLOBAL_SPY') {
          // Find valid targets (players other than current bot)
          const validTargets = players.filter(p => p.id !== currentPlayer.id);
          if (validTargets.length === 0) {
            // No valid targets, just end turn
            dispatch({ type: 'REFRESH_DONE' });
            return;
          }
          
          // Prefer targeting human player for more engaging gameplay
          const humanPlayer = validTargets.find(p => p.id === currentUserId);
          const target = humanPlayer || validTargets[Math.floor(Math.random() * validTargets.length)];
          
          if (power === 'BLIND_SWAP') {
            // Set swap source first, then execute
            dispatch({ type: 'SET_LOCAL', payload: { swapSourceIndex: Math.floor(Math.random() * 4) } });
            setTimeout(() => {
              dispatch({ type: 'EXECUTE_POWER', payload: { targetId: target.id, targetCardIdx: Math.floor(Math.random() * 4) } });
            }, 500);
          } else {
            dispatch({ type: 'EXECUTE_POWER', payload: { targetId: target.id, targetCardIdx: 0 } });
          }
        }
      }, botDelay);
      return () => clearTimeout(timer);
    }
  }, [roomCode, status, turnPhase, turnIndex, players, state.powerAction, currentUserId]);

  // END TURN TIMER
  useEffect(() => {
    if (status !== 'PLAYING' || turnPhase !== 'END_TURN') return;
    if (!isMyTurn && roomCode) return;
    const timer = setTimeout(() => dispatch({ type: 'END_TURN' }), TIMING.END_TURN);
    return () => clearTimeout(timer);
  }, [status, turnPhase, isMyTurn, roomCode]);

  // CLEANUP TIMERS
  useEffect(() => {
    if (!state.shuffledPlayerId) return;
    const timer = setTimeout(() => dispatch({ type: 'SET_LOCAL', payload: { shuffledPlayerId: null } }), 3000);
    return () => clearTimeout(timer);
  }, [state.shuffledPlayerId]);

  useEffect(() => {
    if (!state.spyingPlayerId) return;
    const timer = setTimeout(
      () => dispatch({ type: 'SET_LOCAL', payload: { spyingPlayerId: null, spyingByPlayerId: null } }),
      TIMING.POWER_REVEAL
    );
    return () => clearTimeout(timer);
  }, [state.spyingPlayerId]);

  // DRAWN CARD REVEAL TIMER - auto-clear after reveal expires
  useEffect(() => {
    if (!state.drawnCardRevealEnd) return;
    const remaining = state.drawnCardRevealEnd - Date.now();
    if (remaining <= 0) {
      dispatch({ type: 'SET_LOCAL', payload: { drawnCardSlot: null, drawnCardRevealEnd: null } });
      return;
    }
    const timer = setTimeout(
      () => dispatch({ type: 'SET_LOCAL', payload: { drawnCardSlot: null, drawnCardRevealEnd: null } }),
      remaining
    );
    return () => clearTimeout(timer);
  }, [state.drawnCardRevealEnd]);

  // SWAP REVEAL TIMER - auto-clear after swap reveal expires
  useEffect(() => {
    if (!state.swapRevealEnd) return;
    const remaining = state.swapRevealEnd - Date.now();
    if (remaining <= 0) {
      dispatch({ type: 'SET_LOCAL', payload: { swapRevealSlot: null, swapRevealEnd: null } });
      return;
    }
    const timer = setTimeout(
      () => dispatch({ type: 'SET_LOCAL', payload: { swapRevealSlot: null, swapRevealEnd: null } }),
      remaining
    );
    return () => clearTimeout(timer);
  }, [state.swapRevealEnd]);

  // DRAWN POWER REMINDER TIMER - auto-clear after it expires
  useEffect(() => {
    if (!state.drawnPowerReminder) return;
    const remaining = state.drawnPowerReminder.expiresAt - Date.now();
    if (remaining <= 0) {
      dispatch({ type: 'SET_LOCAL', payload: { drawnPowerReminder: null } });
      return;
    }
    const timer = setTimeout(
      () => dispatch({ type: 'SET_LOCAL', payload: { drawnPowerReminder: null } }),
      remaining
    );
    return () => clearTimeout(timer);
  }, [state.drawnPowerReminder]);

  // FIREBASE SYNC
  useEffect(() => {
    if (!roomCode || syncId <= lastSyncedId.current) return;
    if (status === 'MENU' || status === 'LOBBY') return;
    const shouldSync = isMyTurn || (isHost && (status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER'));
    if (!shouldSync) return;

    const timer = setTimeout(async () => {
      try {
        const syncState = {
          status: state.status,
          players: state.players,
          deck: state.deck,
          discardPile: state.discardPile,
          turnIndex: state.turnIndex,
          turnPhase: state.turnPhase,
          winner: state.winner,
          notification: state.notification,
          preGameEndsAt: state.preGameEndsAt,
          powerAction: state.powerAction,
          swapSourceIndex: state.swapSourceIndex,
          shuffledPlayerId: state.shuffledPlayerId,
          spyingPlayerId: state.spyingPlayerId,
          spyingByPlayerId: state.spyingByPlayerId,
          refreshMode: state.refreshMode,
          drawnCardSlot: state.drawnCardSlot,
          drawnCardRevealEnd: state.drawnCardRevealEnd,
          version: state.version,
        };
        await updateGameState(roomCode, syncState);
        lastSyncedId.current = syncId;
      } catch {
        // Firebase sync failed - will retry on next state change
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [syncId, roomCode, status, isMyTurn, isHost, state]);

  // ACTIONS
  const startSolo = useCallback(() => dispatch({ type: 'START_SOLO' }), []);
  const throwCard = useCallback(
    (idx) => {
      if (!isMyTurn || status !== 'PLAYING' || turnPhase !== 'SHOW_OR_THROW') return;
      dispatch({ type: 'THROW_AND_DRAW', payload: { cardIndex: idx } });
    },
    [isMyTurn, status, turnPhase]
  );
  const callShow = useCallback(() => {
    if (isMyTurn && status === 'PLAYING' && turnPhase === 'SHOW_OR_THROW')
      dispatch({ type: 'CALL_SHOW' });
  }, [isMyTurn, status, turnPhase]);
  const selectSwapSource = useCallback(
    (idx) => {
      if (isMyTurn && turnPhase === 'POWER_ACTION' && state.powerAction === 'BLIND_SWAP') {
        dispatch({ type: 'SET_LOCAL', payload: { swapSourceIndex: idx } });
      }
    },
    [isMyTurn, turnPhase, state.powerAction]
  );
  const executePower = useCallback(
    (targetId, cardIdx = 0) => {
      if (isMyTurn && turnPhase === 'POWER_ACTION')
        dispatch({ type: 'EXECUTE_POWER', payload: { targetId, targetCardIdx: cardIdx } });
    },
    [isMyTurn, turnPhase]
  );
  const finishRefresh = useCallback(() => {
    if (isMyTurn && state.refreshMode) dispatch({ type: 'REFRESH_DONE' });
  }, [isMyTurn, state.refreshMode]);
  const rearrange = useCallback(
    (from, to) => {
      if (isMyTurn && state.refreshMode) dispatch({ type: 'REARRANGE', payload: { from, to } });
    },
    [isMyTurn, state.refreshMode]
  );
  const set = useCallback((p) => dispatch({ type: 'SET', payload: p }), []);
  const setLocal = useCallback((p) => dispatch({ type: 'SET_LOCAL', payload: p }), []);
  const applyRemote = useCallback(
    (gs, uid, host, code) =>
      dispatch({ type: 'APPLY_REMOTE', payload: { gameState: gs, currentUserId: uid, isHost: host, roomCode: code } }),
    []
  );
  const leaveGame = useCallback(() => dispatch({ type: 'LEAVE_GAME' }), []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      isMyTurn,
      myIndex,
      startSolo,
      throwCard,
      callShow,
      selectSwapSource,
      executePower,
      finishRefresh,
      rearrange,
      set,
      setLocal,
      applyRemote,
      leaveGame,
    }),
    [state, isMyTurn, myIndex, startSolo, throwCard, callShow, selectSwapSource, executePower, finishRefresh, rearrange, set, setLocal, applyRemote, leaveGame]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);
