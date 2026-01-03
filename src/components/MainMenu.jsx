
import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const MainMenu = () => {
    const { startGameSolo, dispatch } = useGame();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 z-10"
        >
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600 drop-shadow-2xl">
                MIND F**KED
            </h1>

            <div className="flex gap-4">
                <button
                    onClick={startGameSolo}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg text-white font-bold text-xl shadow-lg hover:scale-105 hover:ring-2 hover:ring-gold transition-all"
                >
                    Play Solo
                </button>

                <button
                    onClick={() => dispatch({ type: 'UPDATE_STATE', payload: { status: 'LOBBY' } })}
                    className="px-8 py-3 bg-slate-800 rounded-lg text-white font-bold text-xl shadow-lg hover:scale-105 hover:bg-slate-700 transition-all border border-slate-600"
                >
                    Play Online
                </button>
            </div>

            <p className="text-slate-400 text-sm mt-4">v2.0 • The Ultimate Memory Game</p>
        </motion.div>
    );
};

export default MainMenu;
