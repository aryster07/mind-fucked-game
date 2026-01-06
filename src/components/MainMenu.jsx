
import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const MainMenu = () => {
    const { startGameSolo, dispatch } = useGame();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-8 z-10 w-full max-w-md px-6"
        >
            {/* Logo/Title */}
            <div className="text-center">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-2">
                    <span className="text-white">MIND</span>
                    <span className="text-purple-400">F**KED</span>
                </h1>
                <p className="text-slate-400 text-lg">Rule the memory</p>
            </div>

            {/* Main Play Button */}
            <button
                onClick={startGameSolo}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-bold text-2xl shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
                <span>▶</span> Play
            </button>

            {/* Secondary Buttons */}
            <div className="w-full flex gap-3">
                <button
                    onClick={() => dispatch({ type: 'UPDATE_STATE', payload: { status: 'LOBBY' } })}
                    className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Users size={18} />
                    Create / Join a Room
                </button>
            </div>
        </motion.div>
    );
};

export default MainMenu;
