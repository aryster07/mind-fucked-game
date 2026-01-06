// ============ MOBILE GAME BOARD - LANDSCAPE OPTIMIZED ============
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Card from '../ui/Card';
import DeckDisplay from '../ui/DeckDisplay';

const MobileGameBoard = ({
  arranged,
  currentUserId,
  turnIndex,
  deck,
  discardPile,
  notification,
  turnPhase,
  powerAction,
  swapSourceIndex,
  handleClick,
  shouldShow,
  shouldHighlight,
  isMyTurn,
  canShow,
  callShow,
  status,
}) => {
  const isVertical = (pos) => pos === 'left' || pos === 'right';
  const cardRotation = (pos) => pos === 'left' ? 90 : pos === 'right' ? -90 : 0;

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-2">
      {/* Compact Notification */}
      {notification && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-slate-800/90 backdrop-blur-sm rounded-full text-xs text-white shadow-lg">
          {notification}
        </div>
      )}

      {/* Table Layout - Ultra Compact */}
      <div className="relative flex flex-col items-center gap-1">
        
        {/* TOP PLAYER */}
        {arranged[1] && (
          <div className="flex flex-col items-center gap-0.5">
            <div className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-700/50 text-slate-300">
              {arranged[1].player.name}
            </div>
            <div className="flex gap-1">
              {arranged[1].player.hand.map((card, idx) => (
                <div key={idx} className="w-10 h-14">
                  <Card
                    card={card}
                    hidden={!shouldShow(arranged[1].player.id, idx)}
                    size="small"
                    onClick={() => handleClick(arranged[1].player.id, idx)}
                    highlight={shouldHighlight(arranged[1].player.id, idx)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MIDDLE ROW: Left + Table + Right */}
        <div className="flex items-center gap-1">
          
          {/* LEFT PLAYER */}
          {arranged[2] && (
            <div className="flex flex-col gap-1">
              {arranged[2].player.hand.map((card, idx) => (
                <div key={idx} className="w-14 h-10 flex items-center justify-center">
                  <div style={{ transform: 'rotate(90deg)' }}>
                    <Card
                      card={card}
                      hidden={!shouldShow(arranged[2].player.id, idx)}
                      size="small"
                      onClick={() => handleClick(arranged[2].player.id, idx)}
                      highlight={shouldHighlight(arranged[2].player.id, idx)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLE */}
          <div className="relative w-[180px] h-[120px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900" />
            <div className="absolute inset-0 rounded-2xl border-4 border-amber-900/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <DeckDisplay deckCount={deck.length} topDiscardCard={discardPile[discardPile.length - 1]} />
            </div>
          </div>

          {/* RIGHT PLAYER */}
          {arranged[3] && (
            <div className="flex flex-col gap-1">
              {arranged[3].player.hand.map((card, idx) => (
                <div key={idx} className="w-14 h-10 flex items-center justify-center">
                  <div style={{ transform: 'rotate(-90deg)' }}>
                    <Card
                      card={card}
                      hidden={!shouldShow(arranged[3].player.id, idx)}
                      size="small"
                      onClick={() => handleClick(arranged[3].player.id, idx)}
                      highlight={shouldHighlight(arranged[3].player.id, idx)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM PLAYER (YOU) */}
        {arranged[0] && (
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex gap-1">
              {arranged[0].player.hand.map((card, idx) => (
                <div key={idx} className="w-10 h-14">
                  <Card
                    card={card}
                    hidden={!shouldShow(arranged[0].player.id, idx)}
                    size="small"
                    onClick={() => handleClick(arranged[0].player.id, idx)}
                    highlight={shouldHighlight(arranged[0].player.id, idx)}
                  />
                </div>
              ))}
            </div>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-600/70 text-white flex items-center gap-1">
              <span>{arranged[0].player.name}</span>
              <span className="text-[7px] bg-indigo-500/50 px-1 rounded">YOU</span>
            </div>
          </div>
        )}
      </div>

      {/* Call Show Button */}
      {canShow && (
        <button
          onClick={callShow}
          className="fixed bottom-2 right-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg"
        >
          📞 SHOW
        </button>
      )}

      {/* Power Action Hint */}
      {turnPhase === 'POWER_ACTION' && isMyTurn && (
        <div className="fixed bottom-2 left-2 px-2 py-1 bg-amber-600/90 text-white text-[10px] rounded-full">
          {powerAction === 'BLIND_SWAP' && (swapSourceIndex === null ? 'Pick your card' : 'Pick opponent')}
          {powerAction === 'CHAOS_SHUFFLE' && 'Pick opponent card'}
          {powerAction === 'GLOBAL_SPY' && 'Pick opponent card'}
        </div>
      )}
    </div>
  );
};

export default MobileGameBoard;
