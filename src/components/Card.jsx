
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGame } from '../context/GameContext';

const Card = ({ card, onClick, isPlayable, className, small = false }) => {
    if (!card) return <div className={clsx("w-16 h-24 bg-transparent", className)} />;

    const { isRed, suit, rank, faceUp, id } = card;

    return (
        <motion.div
            layoutId={id}
            className={clsx(
                "relative rounded-lg shadow-xl cursor-pointer perspective-1000 preserve-3d transition-transform duration-200",
                small ? "w-12 h-16 text-xs" : "w-20 h-28 sm:w-24 sm:h-36",
                isPlayable && "hover:-translate-y-4 hover:shadow-2xl ring-2 ring-gold",
                className
            )}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={isPlayable ? onClick : undefined}
            initial={false}
            animate={{ rotateY: faceUp ? 0 : 180 }}
            transition={{ duration: 0.6, type: 'spring' }}
        >
            {/* Front */}
            <div
                className={clsx(
                    "absolute inset-0 w-full h-full bg-slate-100 rounded-lg backface-hidden flex flex-col items-center justify-between p-2 select-none border border-slate-300",
                    isRed ? "text-red-600" : "text-slate-900"
                )}
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="absolute top-1 left-1 font-bold leading-none flex flex-col items-center">
                    <span>{rank}</span>
                    <span className="text-xs">{suit}</span>
                </div>
                <div className="text-4xl">{suit}</div>
                <div className="absolute bottom-1 right-1 font-bold leading-none flex flex-col items-center rotate-180">
                    <span>{rank}</span>
                    <span className="text-xs">{suit}</span>
                </div>
            </div>

            {/* Back */}
            <div
                className={clsx(
                    "absolute inset-0 w-full h-full bg-card-back rounded-lg backface-hidden rotate-y-180 border-2 border-slate-600 flex items-center justify-center overflow-hidden"
                )}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
                <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute w-8 h-8 rounded-full border-2 border-gold opacity-50"></div>
            </div>
        </motion.div>
    );
};

export default Card;
