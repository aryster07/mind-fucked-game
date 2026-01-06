// ============ DECK AND DISCARD PILE COMPONENT - MODERN UI ============
import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const DeckDisplay = ({ deckCount, topDiscardCard }) => {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6 md:gap-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Deck Stack */}
      <div className="text-center relative">
        <motion.div 
          className="text-slate-400 text-[10px] md:text-xs mb-2 uppercase tracking-widest font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Draw Pile
        </motion.div>
        
        {/* Stacked deck effect */}
        <div className="relative">
          {/* Background cards for 3D stack effect */}
          <div className="absolute top-1 left-1 w-14 h-20 md:w-16 md:h-24 bg-slate-800 rounded-xl opacity-50" />
          <div className="absolute top-0.5 left-0.5 w-14 h-20 md:w-16 md:h-24 bg-slate-700 rounded-xl opacity-75" />
          
          {/* Main deck card */}
          <motion.div 
            className="relative w-14 h-20 md:w-16 md:h-24 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1e293b, #0f172a)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(139,92,246,0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Card back pattern */}
            <div className="absolute inset-2 rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-transparent" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRpYW1vbmQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTEwIDAgTDIwIDEwIEwxMCAyMCBMMCAxMCBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTM5LDkyLDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZGlhbW9uZCkiLz48L3N2Zz4=')] opacity-50" />
            
            {/* Count badge */}
            <motion.div 
              className="relative z-10 text-white font-bold text-2xl md:text-3xl"
              style={{ textShadow: '0 2px 10px rgba(139,92,246,0.5)' }}
              key={deckCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {deckCount}
            </motion.div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        </div>
        
        {/* Cards remaining indicator */}
        <div className="mt-2 text-[10px] text-slate-500 font-medium">
          {deckCount} left
        </div>
      </div>

      {/* Discard Pile */}
      <div className="text-center relative">
        <motion.div 
          className="text-slate-400 text-[10px] md:text-xs mb-2 uppercase tracking-widest font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Discard
        </motion.div>
        
        <motion.div 
          className="relative w-14 h-20 md:w-16 md:h-24 rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background: topDiscardCard 
              ? 'transparent' 
              : 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.5))',
            border: topDiscardCard ? 'none' : '2px dashed rgba(148,163,184,0.2)'
          }}
        >
          {topDiscardCard ? (
            <motion.div
              key={`${topDiscardCard.suit}-${topDiscardCard.value}`}
              initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Card card={topDiscardCard} size="normal" />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-600">
              <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-[10px]">Empty</span>
            </div>
          )}
        </motion.div>
        
        {/* Last played indicator */}
        {topDiscardCard && (
          <div className="mt-2 text-[10px] text-slate-500 font-medium">
            Last played
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DeckDisplay;
