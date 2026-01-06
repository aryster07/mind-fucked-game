// ============ DECK AND DISCARD PILE COMPONENT ============
import React from 'react';
import Card from './Card';

const DeckDisplay = ({ deckCount, topDiscardCard }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8">
      <div className="text-center">
        <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Deck</div>
        <div className="w-16 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {deckCount}
        </div>
      </div>
      <div className="text-center">
        <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Discard</div>
        <div className="w-16 h-24 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-500 flex items-center justify-center shadow-inner">
          {topDiscardCard ? (
            <Card card={topDiscardCard} size="normal" />
          ) : (
            <span className="text-slate-600 text-xs">Empty</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckDisplay;
