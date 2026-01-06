// ============ GAME BOARD PAGE - RICHUP.IO STYLE LAYOUT ============
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { subscribeToRoom } from '../logic/firebase';
import { arrangePlayersForDisplay } from '../logic/players';

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
import CardActionAnimation from '../ui/CardActionAnimation';
import LeftSidebar from '../ui/LeftSidebar';
import RightSidebar from '../ui/RightSidebar';
import MobileBottomBar from '../ui/MobileBottomBar';

// Fast animation - 0.5s throw + 0.3s draw = 0.9s total
const ANIMATION_TOTAL_TIME = 3600; // Match CardActionAnimation total (includes flip reveal)

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
    leaveGame,
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
    swapRevealSlot,
    swapRevealEnd,
    gameLog,
  } = state;

  const [countdown, setCountdown] = useState(null);
  const [revealActive, setRevealActive] = useState(false);
  const [swapRevealActive, setSwapRevealActive] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [cardAction, setCardAction] = useState(null);
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
    const checkReveal = () => {
      const now = Date.now();
      setRevealActive(now < drawnCardRevealEnd);
    };
    checkReveal();
    const interval = setInterval(checkReveal, 100);
    return () => clearInterval(interval);
  }, [drawnCardRevealEnd]);

  // Track swap reveal timer (3 seconds)
  useEffect(() => {
    if (!swapRevealEnd) {
      setSwapRevealActive(false);
      return;
    }
    const checkSwapReveal = () => {
      const now = Date.now();
      setSwapRevealActive(now < swapRevealEnd);
    };
    checkSwapReveal();
    const interval = setInterval(checkSwapReveal, 100);
    return () => clearInterval(interval);
  }, [swapRevealEnd]);

  // Visibility logic
  const shouldShow = useCallback(
    (playerId, cardIdx) => {
      const isMe = playerId === currentUserId;
      if (status === 'PRE_GAME') return isMe;
      if (status === 'GAME_OVER') return true;
      if (status !== 'PLAYING') return false;
      // Show drawn card
      if (isMe && isMyTurn && revealActive && cardIdx === drawnCardSlot) return true;
      // Show swapped card for 3 seconds
      if (isMe && swapRevealActive && cardIdx === swapRevealSlot) return true;
      if (refreshMode && isMyTurn && isMe) return true;
      if (spyingPlayerId === playerId && spyingByPlayerId === currentUserId) return true;
      return false;
    },
    [status, currentUserId, refreshMode, isMyTurn, spyingPlayerId, spyingByPlayerId, revealActive, drawnCardSlot, swapRevealActive, swapRevealSlot]
  );

  // Click handler with animation
  const handleClick = useCallback(
    (playerId, cardIdx) => {
      if (!isMyTurn || status !== 'PLAYING') return;
      
      const isMe = playerId === currentUserId;

      if (turnPhase === 'SHOW_OR_THROW' && isMe) {
        const player = players.find(p => p.id === currentUserId);
        const cardToThrow = player?.hand[cardIdx];
        
        if (cardToThrow) {
          setCardAction({ type: 'throwing', card: cardToThrow, slotIndex: cardIdx });
          setTimeout(() => {
            throwCard(cardIdx);
            setCardAction(null);
          }, ANIMATION_TOTAL_TIME);
        } else {
          throwCard(cardIdx);
        }
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
    [isMyTurn, status, currentUserId, turnPhase, powerAction, swapSourceIndex, throwCard, selectSwapSource, executePower, players]
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

  // Handle leave game
  const handleLeaveGame = useCallback(() => {
    if (confirm('Are you sure you want to leave the game?')) {
      leaveGame();
    }
  }, [leaveGame]);

  return (
    <div className="w-full h-screen overflow-hidden flex gpu-accelerated">
      {/* Left Sidebar - Desktop only */}
      {isActive && (
        <LeftSidebar 
          logs={gameLog} 
          currentUserId={currentUserId}
          roomCode={roomCode}
        />
      )}

      {/* Main Game Area - overflow hidden to contain player hands */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdHMpIi8+PC9zdmc+')] opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/10 rounded-full blur-3xl" />

        {/* Card Action Animation - Full screen overlay */}
        {cardAction && (
          <CardActionAnimation 
            action={cardAction.type} 
            card={cardAction.card} 
          />
        )}

        {/* Menu/Lobby overlays */}
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

        {/* Game UI Elements */}
        <ShuffleAlert show={status === 'PLAYING' && wasIShuffled} />

        {isActive && powerToast && <PowerToast power={powerToast} expiresAt={powerToast.expiresAt} />}

        {isActive && isMyTurn && drawnPowerReminder && (
          <DrawnPowerReminder reminder={drawnPowerReminder} />
        )}

        {status === 'PRE_GAME' && <Countdown seconds={countdown} />}

        {/* Notification Bar */}
        {isActive && (
          <NotificationBar notification={notification}>
            {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'BLIND_SWAP' && (
              <div className="flex items-center gap-2 text-amber-400 text-sm mt-1 animate-pulse">
                <span className="text-lg">🔄</span>
                <span>{swapSourceIndex === null ? 'Select YOUR card first' : 'Now select opponent\'s card'}</span>
              </div>
            )}
            {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'CHAOS_SHUFFLE' && (
              <div className="flex items-center gap-2 text-amber-400 text-sm mt-1 animate-pulse">
                <span className="text-lg">🌀</span>
                <span>Select any opponent's card to shuffle</span>
              </div>
            )}
            {turnPhase === 'POWER_ACTION' && isMyTurn && powerAction === 'GLOBAL_SPY' && (
              <div className="flex items-center gap-2 text-amber-400 text-sm mt-1 animate-pulse">
                <span className="text-lg">👁️</span>
                <span>Select any opponent's card to spy</span>
              </div>
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

        {/* Game Board - THE TABLE LAYOUT */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pb-16 lg:pb-0">
            {/* Outer Container for table + players */}
            <div className="relative flex flex-col items-center">
              
              {/* TOP PLAYER - sits above the table */}
              {arranged[1] && (
                <div className="mb-2">
                  <PlayerHand
                    player={arranged[1].player}
                    cards={arranged[1].player.hand}
                    position="top"
                    isTurn={arranged[1].originalIndex === turnIndex}
                    isCurrentUser={arranged[1].player.id === currentUserId}
                    isShuffled={shuffledPlayerId === arranged[1].player.id}
                    onCardClick={handleClick}
                    shouldShowCard={shouldShow}
                    highlightCard={shouldHighlight}
                    selectedCardIndex={arranged[1].player.id === currentUserId ? swapSourceIndex : null}
                    canDrag={refreshMode && arranged[1].player.id === currentUserId && isMyTurn}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    dragIndex={dragIdx}
                    throwingIndex={arranged[1].player.id === currentUserId && cardAction?.type === 'throwing' ? cardAction.slotIndex : null}
                    drawingIndex={arranged[1].player.id === currentUserId && isMyTurn && revealActive ? drawnCardSlot : null}
                  />
                </div>
              )}

              {/* MIDDLE ROW: Left Player + Table + Right Player */}
              <div className="flex items-center gap-2 md:gap-4">
                
                {/* LEFT PLAYER */}
                {arranged[2] && (
                  <div className="flex-shrink-0">
                    <PlayerHand
                      player={arranged[2].player}
                      cards={arranged[2].player.hand}
                      position="left"
                      isTurn={arranged[2].originalIndex === turnIndex}
                      isCurrentUser={arranged[2].player.id === currentUserId}
                      isShuffled={shuffledPlayerId === arranged[2].player.id}
                      onCardClick={handleClick}
                      shouldShowCard={shouldShow}
                      highlightCard={shouldHighlight}
                      selectedCardIndex={arranged[2].player.id === currentUserId ? swapSourceIndex : null}
                      canDrag={refreshMode && arranged[2].player.id === currentUserId && isMyTurn}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      dragIndex={dragIdx}
                      throwingIndex={arranged[2].player.id === currentUserId && cardAction?.type === 'throwing' ? cardAction.slotIndex : null}
                      drawingIndex={arranged[2].player.id === currentUserId && isMyTurn && revealActive ? drawnCardSlot : null}
                    />
                  </div>
                )}

                {/* THE TABLE */}
                <div className="relative w-[280px] h-[200px] md:w-[380px] md:h-[260px] lg:w-[450px] lg:h-[300px] rounded-3xl overflow-hidden flex-shrink-0">
                  {/* Table felt background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900" />
                  {/* Table felt texture */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }} />
                  {/* Table border/rim */}
                  <div className="absolute inset-0 rounded-3xl border-[6px] md:border-8 border-amber-900/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
                  {/* Inner felt border */}
                  <div className="absolute inset-2 md:inset-3 rounded-2xl border-2 border-amber-700/30" />
                  
                  {/* Deck in Center of Table - properly centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DeckDisplay deckCount={deck.length} topDiscardCard={discardPile[discardPile.length - 1]} />
                  </div>
                </div>

                {/* RIGHT PLAYER */}
                {arranged[3] && (
                  <div className="flex-shrink-0">
                    <PlayerHand
                      player={arranged[3].player}
                      cards={arranged[3].player.hand}
                      position="right"
                      isTurn={arranged[3].originalIndex === turnIndex}
                      isCurrentUser={arranged[3].player.id === currentUserId}
                      isShuffled={shuffledPlayerId === arranged[3].player.id}
                      onCardClick={handleClick}
                      shouldShowCard={shouldShow}
                      highlightCard={shouldHighlight}
                      selectedCardIndex={arranged[3].player.id === currentUserId ? swapSourceIndex : null}
                      canDrag={refreshMode && arranged[3].player.id === currentUserId && isMyTurn}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      dragIndex={dragIdx}
                      throwingIndex={arranged[3].player.id === currentUserId && cardAction?.type === 'throwing' ? cardAction.slotIndex : null}
                      drawingIndex={arranged[3].player.id === currentUserId && isMyTurn && revealActive ? drawnCardSlot : null}
                    />
                  </div>
                )}
              </div>

              {/* BOTTOM PLAYER (YOU) - sits below the table */}
              {arranged[0] && (
                <div className="mt-2">
                  <PlayerHand
                    player={arranged[0].player}
                    cards={arranged[0].player.hand}
                    position="bottom"
                    isTurn={arranged[0].originalIndex === turnIndex}
                    isCurrentUser={arranged[0].player.id === currentUserId}
                    isShuffled={shuffledPlayerId === arranged[0].player.id}
                    onCardClick={handleClick}
                    shouldShowCard={shouldShow}
                    highlightCard={shouldHighlight}
                    selectedCardIndex={arranged[0].player.id === currentUserId ? swapSourceIndex : null}
                    canDrag={refreshMode && arranged[0].player.id === currentUserId && isMyTurn}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    dragIndex={dragIdx}
                    throwingIndex={arranged[0].player.id === currentUserId && cardAction?.type === 'throwing' ? cardAction.slotIndex : null}
                    drawingIndex={arranged[0].player.id === currentUserId && isMyTurn && revealActive ? drawnCardSlot : null}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Desktop only */}
      {isActive && (
        <RightSidebar 
          players={players}
          currentUserId={currentUserId}
          turnIndex={turnIndex}
          onLeaveGame={handleLeaveGame}
          status={status}
        />
      )}

      {/* Mobile Bottom Bar - Mobile only */}
      {isActive && (
        <MobileBottomBar 
          logs={gameLog}
          currentUserId={currentUserId}
          roomCode={roomCode}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
};

export default GameBoard;
