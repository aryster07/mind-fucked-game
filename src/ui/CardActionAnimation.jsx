// ============ CARD ACTION ANIMATION COMPONENT ============
// Card animations with flip reveal when drawing

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation timing
const TIMING = {
  PHASE_1_LIFT: 200,        // Card lifts up
  PHASE_2_THROW: 300,       // Card slides to discard
  PHASE_3_SETTLE: 200,      // Card settles on pile
  PHASE_4_WAIT: 300,        // Brief pause
  PHASE_5_DRAW_UP: 400,     // New card comes up to center (face down)
  PHASE_6_FLIP: 800,        // Card flips to reveal face
  PHASE_7_SHOW: 1200,       // Hold to show the card (increased by 200ms)
  PHASE_8_TO_HAND: 400,     // Card goes to hand
};

const TOTAL_TIME = 
  TIMING.PHASE_1_LIFT + 
  TIMING.PHASE_2_THROW + 
  TIMING.PHASE_3_SETTLE + 
  TIMING.PHASE_4_WAIT + 
  TIMING.PHASE_5_DRAW_UP +
  TIMING.PHASE_6_FLIP +
  TIMING.PHASE_7_SHOW +
  TIMING.PHASE_8_TO_HAND;

const CardActionAnimation = ({ action, card, drawnCard, onComplete }) => {
  const [phase, setPhase] = useState(0);
  
  // Determine drawn card color
  const drawnIsRed = drawnCard?.suit === '♥' || drawnCard?.suit === '♦';
  
  useEffect(() => {
    if (!action || !card) {
      setPhase(0);
      return;
    }

    if (action === 'throwing') {
      // Phase 1: Lift
      setPhase(1);
      
      // Phase 2: Throw
      const t2 = setTimeout(() => setPhase(2), TIMING.PHASE_1_LIFT);
      
      // Phase 3: Settle on discard
      const t3 = setTimeout(() => setPhase(3), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW);
      
      // Phase 4: Wait
      const t4 = setTimeout(() => setPhase(4), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW + TIMING.PHASE_3_SETTLE);
      
      // Phase 5: Draw up to center
      const t5 = setTimeout(() => setPhase(5), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW + TIMING.PHASE_3_SETTLE + TIMING.PHASE_4_WAIT);
      
      // Phase 6: Flip
      const t6 = setTimeout(() => setPhase(6), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW + TIMING.PHASE_3_SETTLE + TIMING.PHASE_4_WAIT + TIMING.PHASE_5_DRAW_UP);
      
      // Phase 7: Show revealed card
      const t7 = setTimeout(() => setPhase(7), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW + TIMING.PHASE_3_SETTLE + TIMING.PHASE_4_WAIT + TIMING.PHASE_5_DRAW_UP + TIMING.PHASE_6_FLIP);
      
      // Phase 8: To hand
      const t8 = setTimeout(() => setPhase(8), 
        TIMING.PHASE_1_LIFT + TIMING.PHASE_2_THROW + TIMING.PHASE_3_SETTLE + TIMING.PHASE_4_WAIT + TIMING.PHASE_5_DRAW_UP + TIMING.PHASE_6_FLIP + TIMING.PHASE_7_SHOW);
      
      // Complete
      const done = setTimeout(() => {
        setPhase(0);
        if (onComplete) onComplete();
      }, TOTAL_TIME);

      return () => {
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
        clearTimeout(t7);
        clearTimeout(t8);
        clearTimeout(done);
      };
    }
  }, [action, card, onComplete]);

  if (!action || !card || phase === 0) return null;

  const isRed = card.suit === '♥' || card.suit === '♦';

  // Card component for reuse
  const CardFace = ({ showFace = true, size = 'normal' }) => {
    const sizeClasses = size === 'large' 
      ? 'w-32 h-48 md:w-40 md:h-56' 
      : 'w-24 h-36 md:w-28 md:h-40';
    
    return (
      <div className={`${sizeClasses} rounded-2xl shadow-2xl overflow-hidden border-2 ${showFace ? 'border-white/40 bg-white' : 'border-indigo-400/50'}`}>
        {showFace ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
            {/* Top left corner */}
            <div className="absolute top-2 left-2 flex flex-col items-center leading-tight">
              <span className={`text-base md:text-lg font-bold ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {card.rank}
              </span>
              <span className={`text-lg md:text-xl -mt-1 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {card.suit}
              </span>
            </div>
            
            {/* Center suit - large */}
            <span className={`text-5xl md:text-6xl ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
              {card.suit}
            </span>
            
            {/* Bottom right corner (upside down) */}
            <div className="absolute bottom-2 right-2 flex flex-col items-center leading-tight rotate-180">
              <span className={`text-base md:text-lg font-bold ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {card.rank}
              </span>
              <span className={`text-lg md:text-xl -mt-1 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {card.suit}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center relative">
            <div className="absolute inset-2 border-2 border-white/20 rounded-xl" />
            <div className="absolute inset-4 border border-white/10 rounded-lg" />
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="absolute w-full h-full rotate-45 border-2 border-white/30" />
              <span className="text-2xl text-white/50">🃏</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* ========== PHASE 1-3: THROWING ========== */}
      <AnimatePresence>
        {phase >= 1 && phase <= 3 && (
          <motion.div
            className="absolute left-1/2"
            initial={{ 
              bottom: '12%',
              x: '-50%',
              scale: 1,
              rotate: 0,
            }}
            animate={
              phase === 1 ? {
                // Phase 1: Lift up slightly
                bottom: '18%',
                y: -20,
                scale: 1.05,
                rotate: -3,
              } : phase === 2 ? {
                // Phase 2: Slide to center
                bottom: '45%',
                y: 0,
                scale: 0.9,
                rotate: -8,
              } : {
                // Phase 3: Settle on discard
                bottom: '45%',
                y: 0,
                scale: 0.85,
                rotate: -5,
              }
            }
            exit={{ 
              scale: 0.7,
              opacity: 0,
              rotate: -15,
            }}
            transition={{ 
              duration: phase === 1 ? 0.1 : phase === 2 ? 0.3 : 0.1,
              ease: 'easeOut',
            }}
          >
            <div className="relative">
              {/* Card shadow */}
              <motion.div 
                className="absolute inset-0 blur-xl bg-black/40 rounded-2xl"
                animate={{ 
                  y: phase === 1 ? 15 : phase === 2 ? 25 : 20,
                  scale: phase === 2 ? 1.1 : 1,
                }}
              />
              <CardFace showFace={true} size="large" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      <motion.div
        className="absolute top-[20%] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {phase >= 1 && phase <= 3 && (
          <div className="bg-red-600/95 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl border border-red-400/50 flex items-center gap-4">
            <motion.span 
              className="text-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              🗑️
            </motion.span>
            <div className="text-center">
              <div className="text-sm text-red-200 mb-1">Discarding</div>
              <div className="text-2xl">{card.rank}{card.suit}</div>
            </div>
          </div>
        )}
        
        {phase === 4 && (
          <motion.div 
            className="bg-slate-800/95 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-2xl border border-slate-600/50 flex items-center gap-3"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <span className="text-emerald-400 text-xl">✓</span>
            <span>Card discarded</span>
          </motion.div>
        )}
        
        {phase >= 5 && (
          <motion.div 
            className="bg-emerald-600/95 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl border border-emerald-400/50 flex items-center gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🃏
            </motion.span>
            <div className="text-center">
              <div className="text-sm text-emerald-200 mb-1">
                {phase === 5 ? 'Drawing...' : phase === 6 ? 'Revealing!' : phase === 7 ? 'You drew:' : 'To hand...'}
              </div>
              <div className="text-lg">{phase >= 6 && drawnCard ? `${drawnCard.rank}${drawnCard.suit}` : 'Drawing...'}</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ========== PHASE 5-8: DRAWING WITH FLIP ========== */}
      <AnimatePresence>
        {phase >= 5 && phase <= 8 && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ perspective: 1000 }}
            initial={{ 
              top: '60%',
              scale: 0.3,
              opacity: 0,
            }}
            animate={
              phase === 5 ? {
                // Draw up to center
                top: '40%',
                scale: 1,
                opacity: 1,
              } : phase === 6 || phase === 7 ? {
                // Hold in center
                top: '40%',
                scale: 1.1,
                opacity: 1,
              } : {
                // Go to hand
                top: '75%',
                scale: 0.8,
                opacity: 0,
              }
            }
            transition={{ 
              duration: phase === 5 ? 0.4 : phase === 6 ? 0.1 : phase === 7 ? 0.1 : 0.4,
              ease: 'easeOut',
            }}
          >
            <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
              {/* Card shadow */}
              <motion.div 
                className="absolute inset-0 blur-xl bg-black/40 rounded-2xl"
                animate={{ y: 15 }}
              />
              
              {/* Flip container */}
              <motion.div
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ 
                  rotateY: phase >= 6 ? 180 : 0,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {/* Card Back (visible when not flipped) */}
                <div 
                  className="w-32 h-48 md:w-40 md:h-56 rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-400/50"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center relative">
                    <div className="absolute inset-2 border-2 border-white/20 rounded-xl" />
                    <div className="absolute inset-4 border border-white/10 rounded-lg" />
                    <span className="text-3xl text-white/50">🃏</span>
                  </div>
                </div>
                
                {/* Card Face (visible when flipped) - Shows actual drawn card */}
                <div 
                  className="absolute inset-0 w-32 h-48 md:w-40 md:h-56 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/40 bg-white"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {drawnCard ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
                      {/* Top left corner */}
                      <div className="absolute top-2 left-2 flex flex-col items-center leading-tight">
                        <span className={`text-base md:text-lg font-bold ${drawnIsRed ? 'text-red-600' : 'text-slate-900'}`}>
                          {drawnCard.rank}
                        </span>
                        <span className={`text-lg md:text-xl -mt-1 ${drawnIsRed ? 'text-red-600' : 'text-slate-900'}`}>
                          {drawnCard.suit}
                        </span>
                      </div>
                      
                      {/* Center suit - large */}
                      <span className={`text-5xl md:text-6xl ${drawnIsRed ? 'text-red-600' : 'text-slate-900'}`}>
                        {drawnCard.suit}
                      </span>
                      
                      {/* Bottom right corner (upside down) */}
                      <div className="absolute bottom-2 right-2 flex flex-col items-center leading-tight rotate-180">
                        <span className={`text-base md:text-lg font-bold ${drawnIsRed ? 'text-red-600' : 'text-slate-900'}`}>
                          {drawnCard.rank}
                        </span>
                        <span className={`text-lg md:text-xl -mt-1 ${drawnIsRed ? 'text-red-600' : 'text-slate-900'}`}>
                          {drawnCard.suit}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
                      <span className="text-5xl md:text-6xl mb-2">🎴</span>
                      <span className="text-xl md:text-2xl font-bold text-slate-700">NEW!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <motion.div
              key={p}
              className={`w-2 h-2 rounded-full ${
                phase >= p ? (p <= 3 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-600'
              }`}
              animate={{ scale: phase === p ? 1.3 : 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardActionAnimation;
