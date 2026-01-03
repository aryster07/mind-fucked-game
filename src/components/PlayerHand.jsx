
import React from 'react';
import Card from './Card';
import { useGame } from '../context/GameContext';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const PlayerHand = ({ player, position }) => {
    const { state, handleCardClick } = useGame();
    const { id, name, hand, isBot, score } = player;

    // Position styles
    const positionStyles = {
        bottom: "bottom-4 left-1/2 -translate-x-1/2", // User
        top: "top-4 left-1/2 -translate-x-1/2 rotate-180", // Bot 2 (Top)
        left: "left-4 top-1/2 -translate-y-1/2 rotate-90", // Bot 1 (Left)
        right: "right-4 top-1/2 -translate-y-1/2 -rotate-90", // Bot 3 (Right)
    };

    const isUser = !isBot;
    const isTurn = state.turnIndex === state.players.findIndex(p => p.id === id);

    return (
        <div className={clsx(
            "absolute flex flex-col items-center gap-2",
            positionStyles[position]
        )}>
            <div className={clsx(
                "px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white font-semibold text-sm shadow-lg transition-all",
                isTurn && "ring-2 ring-gold scale-105 bg-gold/20"
            )}>
                {name} {state.status === 'GAME_OVER' && <span className="text-gold ml-2">Score: {score}</span>}
            </div>

            <div className="flex gap-2 sm:gap-4">
                {hand.map((card, index) => {
                    // Allow interaction based on GameContext logic (Power Ups etc)
                    let isInteractable = false;
                    if (state.turnIndex === 0 && state.status === 'PLAYING' && card) {
                        if (state.turnPhase === 'THROW' && isUser) isInteractable = true;
                        else if (state.turnPhase === 'POWER_ACTION') {
                            if (state.powerAction === 'PEARRANGE_SELF' && isUser) isInteractable = true; // For click to trigger (if single click needed)
                            if (state.powerAction === 'SWAP_SELF' && isUser) isInteractable = true;
                            if (state.powerAction === 'SWAP_TARGET' && !isUser) isInteractable = true;
                            if (state.powerAction === 'SPY' && !isUser) isInteractable = true;
                            if (state.powerAction === 'SHUFFLE_OPP' && !isUser) isInteractable = true;
                        }
                    }

                    // If card is null (thrown), show empty slot
                    if (!card) {
                        return <div key={`empty-${index}`} className="w-20 h-28 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-white/10" />;
                    }

                    return (
                        <Card
                            key={card.id}
                            card={card}
                            isPlayable={isInteractable}
                            onClick={() => handleCardClick(id, index)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PlayerHand;
