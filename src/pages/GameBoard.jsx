// ============ GAME BOARD PAGE (REFACTORED) ============
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { subscribeToRoom } from '../logic/firebase';
import { arrangePlayersForDisplay } from '../logic/players';
import clsx from 'clsx';

// Pages
import MainMenuPage from './MainMenu';
import LobbyPage from './Lobby';

// UI Components
import PlayerHand from '../ui/PlayerHand';
import DeckDisplay from '../ui/DeckDisplay';
import NotificationBar from '../ui/NotificationBar';
import PowerToast from '../ui/PowerToast';
import Countdown from '../ui/Countdown';
import ShuffleAlert from '../ui/ShuffleAlert';
import GameOverModal from '../ui/GameOverModal';
import ActionButtons from '../ui/ActionButtons';
import DrawnPowerReminder from '../ui/DrawnPowerReminder';

const POS_ORDER = ['bottom', 'top', 'left', 'right'];

const GameBoard = () => {
  const {
    state,
    isMyTurn,
    startSolo,
    throwCard,
    callShow,
    selectSwapSource,
    executePower,
    finishRefresh,
    rearrange,
    applyRemote,
  } = useGame();

  const {
    status,
    players,
    deck,
    discardPile,
    notification,
    turnIndex,
    roomCode,
    currentUserId,
    turnPhase,
    shuffledPlayerId,
    refreshMode,
    powerAction,
    swapSourceIndex,
    spyingPlayerId,
    spyingByPlayerId,
    powerToast,
    drawnCardSlot,
    drawnCardRevealEnd,
    drawnPowerReminder,
  } = state;

  const [countdown, setCountdown] = useState(null);
  const [revealActive, setRevealActive] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const lastVersionRef = React.useRef(0);

  // Firebase subscription
  useEffect(() => {
    if (!roomCode || status === 'MENU') return;
    return subscribeToRoom(roomCode, (data) => {
      if (data.status === 'playing' && data.gameState) {
        const v = data.gameState.version || 0;
        if (v > lastVersionRef.current) {
          lastVersionRef.current = v;
          applyRemote(data.gameState, currentUserId, data.host === currentUserId, roomCode);
        }
      }
    });
  }, [roomCode, status, currentUserId, applyRemote]);

  // PRE_GAME countdown
  useEffect(() => {
    if (!state.preGameEndsAt) {
      setCountdown(null);
      return;
    }
    const update = () => setCountdown(Math.max(0, Math.ceil((state.preGameEndsAt - Date.now()) / 1000)));
    update();
    const t = setInterval(update, 250);
    return () => clearInterval(t);
  }, [state.preGameEndsAt]);

  // Track drawn card reveal timer
  useEffect(() => {
    if (!drawnCardRevealEnd) {
      setRevealActive(false);
      return;
    }
    // Check if reveal is still active
    const checkReveal = () => {
      const now = Date.now();
      setRevealActive(now < drawnCardRevealEnd);
    };
    checkReveal();
    const interval = setInterval(checkReveal, 100);
    return () => clearInterval(interval);
  }, [drawnCardRevealEnd]);

  // Visibility logic
  const shouldShow = useCallback(
    (playerId, cardIdx) => {
      const isMe = playerId === currentUserId;
      if (status === 'PRE_GAME') return isMe;
      if (status === 'GAME_OVER') return true;
      if (status !== 'PLAYING') return false;
      
      // Show the drawn card to the player who just drew it
      if (isMe && isMyTurn && revealActive && cardIdx === drawnCardSlot) return true;
      
      if (refreshMode && isMyTurn && isMe) return true;
      if (spyingPlayerId === playerId && spyingByPlayerId === currentUserId) return true;
      return false;
    },
    [status, currentUserId, refreshMode, isMyTurn, spyingPlayerId, spyingByPlayerId, revealActive, drawnCardSlot]
  );

  // Click handler
  const handleClick = useCallback(
    (playerId, cardIdx) => {
      if (!isMyTurn || status !== 'PLAYING') return;
      
      const isMe = playerId === currentUserId;

      if (turnPhase === 'SHOW_OR_THROW' && isMe) {
        throwCard(cardIdx);
        return;
      }

      if (turnPhase === 'POWER_ACTION') {
        if (powerAction === 'REFRESH') return;
        
        if (powerAction === 'BLIND_SWAP') {
          if (swapSourceIndex === null && isMe) {
            selectSwapSource(cardIdx);
          } else if (swapSourceIndex !== null && !isMe) {
            executePower(playerId, cardIdx);
          }
          return;
        }
        
        if ((powerAction === 'CHAOS_SHUFFLE' || powerAction === 'GLOBAL_SPY') && !isMe) {
          executePower(playerId, cardIdx);
        }
      }
    },
    [isMyTurn, status, currentUserId, turnPhase, powerAction, swapSourceIndex, throwCard, selectSwapSource, executePower]
  );

  // Drag handlers for REFRESH
  const handleDragStart = (e, idx) => {
    if (refreshMode && isMyTurn) {
      e.dataTransfer.effectAllowed = 'move';
      setDragIdx(idx);
    }
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== toIdx) rearrange(dragIdx, toIdx);
    setDragIdx(null);
  };
  const handleDragEnd = () => setDragIdx(null);

  // Arranged players
  const arranged = useMemo(() => {
    return arrangePlayersForDisplay(players, currentUserId, 0);
  }, [players, currentUserId]);

  // UI flags
  const isActive = status === 'PRE_GAME' || status === 'PLAYING' || status === 'GAME_OVER';
  const wasIShuffled = shuffledPlayerId === currentUserId;
  const canShow = status === 'PLAYING' && turnPhase === 'SHOW_OR_THROW' && isMyTurn;
  const canDone = status === 'PLAYING' && refreshMode && isMyTurn;

  // Highlight logic
  const shouldHighlight = useCallback(
    (playerId, cardIdx) => {
      if (turnPhase !== 'POWER_ACTION' || !isMyTurn) return false;
      const isMe = playerId === currentUserId;
      
      if (powerAction === 'BLIND_SWAP') {
        return (isMe && swapSourceIndex === null) || (!isMe && swapSourceIndex !== null);
      }
      if (powerAction === 'CHAOS_SHUFFLE' || powerAction === 'GLOBAL_SPY') {
        return !isMe;
      }
      return false;
    },
    [turnPhase, isMyTurn, powerAction, swapSourceIndex, currentUserId]
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center justify-center relative">
      {status === 'MENU' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <MainMenuPage />
        </div>
      )}

      {status === 'LOBBY' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <LobbyPage />
        </div>
      )}

      <ShuffleAlert show={status === 'PLAYING' && wasIShuffled} />

      {isActive && powerToast && <PowerToast power={powerToast} expiresAt={powerToast.expiresAt} />}

      {/* Show reminder when drawing a power card */}
      {isActive && isMyTurn && drawnPowerReminder && (
        <DrawnPowerReminder reminder={drawnPowerReminder} />
      )}

      {status === 'PRE_GAME' && <Countdown seconds={countdown} />}

      {isActive && (
        <NotificationBar notification={notification}>
          {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'BLIND_SWAP' && (
            <div className="text-yellow-400 text-sm mt-1">
              {swapSourceIndex === null ? '👆 Click YOUR card first' : '👆 Now click opponent\'s card'}
            </div>
          )}
          {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'CHAOS_SHUFFLE' && (
            <div className="text-yellow-400 text-sm mt-1">👆 Click any opponent's card</div>
          )}
          {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'GLOBAL_SPY' && (
            <div className="text-yellow-400 text-sm mt-1">👆 Click any opponent's card</div>
          )}
        </NotificationBar>
      )}

      <ActionButtons canShow={canShow} canDone={canDone} onCallShow={callShow} onDone={finishRefresh} />

      {status === 'GAME_OVER' && (
        <GameOverModal
          notification={notification}
          players={players}
          winnerId={state.winner}
          onPlayAgain={startSolo}
        />
      )}

      {isActive && (
        <div className="w-full h-full relative max-w-5xl mx-auto">
          {arranged.map(({ player, originalIndex }, displayIdx) => {
            const isMe = player.id === currentUserId;
            const isTurn = originalIndex === turnIndex;
            const isShuffleTarget = shuffledPlayerId === player.id;

            return (
              <PlayerHand
                key={player.id}
                player={player}
                cards={player.hand}
                position={POS_ORDER[displayIdx]}
                isTurn={isTurn}
                isCurrentUser={isMe}
                isShuffled={isShuffleTarget}
                onCardClick={handleClick}
                shouldShowCard={shouldShow}
                highlightCard={shouldHighlight}
                selectedCardIndex={isMe ? swapSourceIndex : null}
                canDrag={refreshMode && isMe && isMyTurn}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                dragIndex={dragIdx}
              />
            );
          })}

          <DeckDisplay deckCount={deck.length} topDiscardCard={discardPile[discardPile.length - 1]} />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
